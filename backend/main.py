import os
import uuid
from typing import Literal, Optional, Dict
from typing import Literal, List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel  # <--- CRITICAL FIX
from supabase import create_client, Client

# Application internal imports
from schemas import (
    GenerateSimulationRequest, 
    GenerateSimulationResponse, 
    SimulationOutput,
    ProjectChatRequest,
    CodeReviewRequest,
    InterviewChatRequest,
    InterviewFeedbackRequest,
    ChatAnalysisRequest,
    RepoRequest
)
from llm_service import (
    generate_simulation_content, 
    generate_chat_response, 
    generate_code_review,
    generate_interview_chat,
    generate_interview_feedback,
    generate_chat_analysis
)
from repo_service import repo_service
from daytona_service import daytona_service
from schemas import RepoRequest
import uuid

# Load environment: backend/.env first, then project root .env.local and .env
from pathlib import Path as _Path
_backend_dir = _Path(__file__).resolve().parent
_root = _backend_dir.parent
load_dotenv(dotenv_path=_backend_dir / ".env")
load_dotenv(dotenv_path=_root / ".env.local")
load_dotenv(dotenv_path=_root / ".env")

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Simple check to ensure env vars are set, but don't crash immediately on import if missing
supabase: Client = None
if url and key:
    supabase = create_client(url, key)
else:
    print("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found.")

# Gemini API key is used by llm_service.py via GEMINI_API_KEY env var


# --- System prompts (chat uses llm_service; review prompt below) ---

def _review_system_prompt(req: CodeReviewRequest) -> str:
    hint = "Respond in Arabic when possible." if req.language_hint == "ar" else "Respond in English."
    return f"""You are an experienced developer reviewing intern code for this project:
Title: {req.project_title}
Description: {req.project_description}

Review the code for correctness, clarity, and fit to the project. Be constructive. {hint}

Reply with a short feedback paragraph, then conclude with exactly one line: APPROVED or NOT_APPROVED."""
# Gemini API Key check (optional, but good for fast fail)
if not os.environ.get("GEMINI_API_KEY"):
    print("Warning: GEMINI_API_KEY not found. LLM features will fail.")


# --- Routes ---

@app.post("/generate-simulation", response_model=GenerateSimulationResponse)
async def generate_simulation(request: GenerateSimulationRequest):
    # 1. Generate content using LLM
    try:
        simulation_data: SimulationOutput = await generate_simulation_content(
            request.title, request.context, request.level
        )
    except Exception as e:
        err_msg = str(e)
        print(f"LLM Generation Error: {e}")
        if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "quota" in err_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exceeded (free tier is limited). Please try again in a few minutes or check https://ai.google.dev/gemini-api/docs/rate-limits",
            )
        raise HTTPException(status_code=500, detail=err_msg)
    
    # 2. Save to Supabase
    dummy_user_id = str(uuid.uuid4()) 
    
    if supabase:
        try:
            # Insert Simulation
            sim_insert = supabase.table("simulations").insert({
                "user_id": dummy_user_id,
                "title": simulation_data.title,
                "context": request.context,
                "project_details": simulation_data.model_dump(exclude={"personas"})
            }).execute()
            
            sim_id = sim_insert.data[0]["id"]
            
            # Insert Personas
            for persona in simulation_data.personas:
                supabase.table("personas").insert({
                    "simulation_id": sim_id,
                    "name": persona.name,
                    "role": persona.role,
                    "personality": persona.personality,
                    "system_prompt": persona.system_prompt,
                    "initial_message": persona.initial_message
                }).execute()
                
            return GenerateSimulationResponse(
                simulation_id=sim_id,
                title=simulation_data.title,
                simulation_data=simulation_data
            )
        except Exception as e:
            print(f"Database error: {e}")
            # Fallback: return generated data even if DB save fails
            return GenerateSimulationResponse(
                simulation_id="error-id",
                title=simulation_data.title,
                simulation_data=simulation_data
            )
    else:
        # Mock response if Supabase is not connected
        return GenerateSimulationResponse(
            simulation_id="mock-id",
            title=simulation_data.title,
            simulation_data=simulation_data
        )

@app.get("/")
async def root():
    return {"message": "FastAPI Backend is running!", "supabase_connected": supabase is not None}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/api/chat")
async def project_chat(req: ProjectChatRequest):
    try:
        return generate_chat_response(req)
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/review")
async def code_review(req: CodeReviewRequest):
    try:
        return generate_code_review(req)
    except Exception as e:
        print(f"Review Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/chat")
async def interview_chat(req: InterviewChatRequest):
    try:
        return generate_interview_chat(req)
    except Exception as e:
        print(f"Interview Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/interview/feedback")
async def interview_feedback(req: InterviewFeedbackRequest):
    try:
        return generate_interview_feedback(req)
    except Exception as e:
        print(f"Interview Feedback Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-chat")
async def analyze_chat(req: ChatAnalysisRequest):
    try:
        return generate_chat_analysis(req)
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/repo/extract")
async def extract_repo(request: RepoRequest):
    # Offload the heavy work to the threadpool
    result = await run_in_threadpool(
        repo_service.clone_and_read, 
        request.github_url, 
        request.branch, 
        request.access_token
    )
    
    if not result or not result.get("files"):
        raise HTTPException(
            status_code=400, 
            detail="Connected, but no readable components found in this repository."
        )

    # Return a clear signal for your application logic
    return {
        "connected": True, 
        "status": "success",
        "message": "Repository components extracted successfully",
        "file_count": len(result["files"]),
        "files": result["files"],
        "session_id": result["session_id"]
    }

class FileOperationRequest(BaseModel):
    session_id: str
    rel_path: str
    content: Optional[str] = None

@app.post("/api/repo/file/update")
async def update_file(request: FileOperationRequest):
    if request.content is None:
        raise HTTPException(status_code=400, detail="Content required")
    await run_in_threadpool(
        repo_service.update_file,
        request.session_id,
        request.rel_path,
        request.content
    )
    return {"status": "success"}

@app.post("/api/repo/file/create")
async def create_file(request: FileOperationRequest):
    await run_in_threadpool(
        repo_service.create_file,
        request.session_id,
        request.rel_path,
        request.content or ""
    )
    return {"status": "success"}

@app.delete("/api/repo/file/delete")
async def delete_file(request: FileOperationRequest):
    await run_in_threadpool(
        repo_service.delete_file,
        request.session_id,
        request.rel_path
    )
    return {"status": "success"}

class ExecuteRequest(BaseModel):
    workspace_id: str
    command: str

@app.post("/api/repo/execute")
async def execute_command(request: ExecuteRequest):
    output = await run_in_threadpool(
        daytona_service.execute_command,
        request.workspace_id,
        request.command
    )
    return {"output": output}

class CreateWorkspaceRequest(BaseModel):
    github_url: str
    branch: Optional[str] = "main"

@app.post("/api/repo/workspace")
async def create_workspace(request: CreateWorkspaceRequest):
    workspace = await run_in_threadpool(
        daytona_service.create_workspace,
        request.github_url,
        request.branch
    )
    return workspace

class InitSessionRequest(BaseModel):
    files: Dict[str, str]

@app.post("/api/repo/branches")
async def list_branches(request: RepoRequest):
    branches = await run_in_threadpool(
        repo_service.list_branches,
        request.github_url,
        request.access_token
    )
    return {"branches": branches}

@app.post("/api/repo/init")
async def init_session(request: InitSessionRequest):
    session_id = await run_in_threadpool(repo_service.create_session, request.files)
    return {"session_id": session_id}

@app.get("/api/repo/session/{session_id}")
async def get_session(session_id: str):
    files = await run_in_threadpool(repo_service.get_session_files, session_id)
    return {"files": files}

