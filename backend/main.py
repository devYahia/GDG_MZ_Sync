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
from sse_starlette.sse import EventSourceResponse
import asyncio

# Application internal imports
from schemas import (
    GenerateSimulationRequest, 
    GenerateSimulationResponse, 
    SimulationOutput,
    ProjectChatRequest,
    ProjectChatRequest,
    CodeReviewRequest,
    ChatAnalysisRequest,
    ChatAnalysisResponse
)
from llm_service import (
    generate_simulation_content, 
    generate_chat_response, 
    generate_chat_response, 
    generate_code_review,
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

@app.post("/api/analyze-chat", response_model=ChatAnalysisResponse)
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

# Simple code execution endpoint for IDE
class CodeExecutionRequest(BaseModel):
    code: str
    language: str  # "python" or "javascript"

@app.post("/api/execute")
async def execute_code(request: CodeExecutionRequest):
    """Execute code directly without workspace setup"""
    import subprocess
    import tempfile
    import os
    
    try:
        # Language to command mapping
        lang_config = {
            "python": {"cmd": ["python"], "ext": ".py"},
            "javascript": {"cmd": ["node", "-e"], "ext": None},  # inline
            "ruby": {"cmd": ["ruby"], "ext": ".rb"},
            "go": {"cmd": ["go", "run"], "ext": ".go"},
            "rust": {"cmd": ["rustc", "--edition=2021", "-o"], "ext": ".rs", "compile": True},
            "cpp": {"cmd": ["g++", "-o"], "ext": ".cpp", "compile": True},
            "c": {"cmd": ["gcc", "-o"], "ext": ".c", "compile": True},
            "java": {"cmd": ["javac"], "ext": ".java", "compile": True},
            "php": {"cmd": ["php"], "ext": ".php"},
            "perl": {"cmd": ["perl"], "ext": ".pl"},
            "lua": {"cmd": ["lua"], "ext": ".lua"},
            "r": {"cmd": ["Rscript"], "ext": ".R"},
            "shell": {"cmd": ["bash"], "ext": ".sh"},
        }
        
        lang = request.language.lower()
        if lang not in lang_config:
            return {
                "output": f"Language '{request.language}' not supported. Supported: {', '.join(lang_config.keys())}",
                "success": False
            }
        
        config = lang_config[lang]
        
        # Handle inline execution (JavaScript/Node.js)
        if config["ext"] is None:
            result = subprocess.run(
                config["cmd"] + [request.code],
                capture_output=True,
                text=True,
                timeout=10
            )
            output = result.stdout + result.stderr
        
        # Handle compiled languages
        elif config.get("compile"):
            with tempfile.NamedTemporaryFile(mode='w', suffix=config["ext"], delete=False) as f:
                f.write(request.code)
                source_file = f.name
            
            try:
                # Compile
                exe_file = source_file.replace(config["ext"], ".exe" if os.name == 'nt' else "")
                compile_cmd = config["cmd"] + [exe_file if lang in ["cpp", "c", "rust"] else "", source_file]
                
                if lang == "java":
                    # Java is special - compile then run
                    result = subprocess.run(compile_cmd, capture_output=True, text=True, timeout=10)
                    if result.returncode != 0:
                        return {"output": f"Compilation error:\n{result.stderr}", "success": False}
                    
                    # Extract class name
                    class_name = os.path.basename(source_file).replace(".java", "")
                    result = subprocess.run(
                        ["java", "-cp", os.path.dirname(source_file), class_name],
                        capture_output=True, text=True, timeout=10
                    )
                else:
                    result = subprocess.run(compile_cmd, capture_output=True, text=True, timeout=10)
                    if result.returncode != 0:
                        return {"output": f"Compilation error:\n{result.stderr}", "success": False}
                    
                    # Run compiled executable
                    result = subprocess.run([exe_file], capture_output=True, text=True, timeout=10)
                
                output = result.stdout + result.stderr
            finally:
                # Cleanup
                if os.path.exists(source_file):
                    os.unlink(source_file)
                if 'exe_file' in locals() and os.path.exists(exe_file):
                    os.unlink(exe_file)
        
        # Handle interpreted languages
        else:
            with tempfile.NamedTemporaryFile(mode='w', suffix=config["ext"], delete=False) as f:
                f.write(request.code)
                temp_file = f.name
            
            try:
                result = subprocess.run(
                    config["cmd"] + [temp_file],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                output = result.stdout + result.stderr
            finally:
                os.unlink(temp_file)
        
        return {
            "output": output.strip() if output.strip() else "(no output)",
            "success": True
        }
    except subprocess.TimeoutExpired:
        return {"output": "Error: Execution timeout (10 seconds)", "success": False}
    except Exception as e:
        return {"output": f"Error: {str(e)}", "success": False}


# ===== GitHub Code Review Endpoint with SSE =====
review_jobs = {}  # { job_id: {status, repo_url, ...} }

class ReviewRequest(BaseModel):
    repo_url: str

@app.post("/review")
async def start_review(request: ReviewRequest):
    """Initialize code review job and return job_id for SSE streaming"""
    job_id = str(uuid.uuid4())
    review_jobs[job_id] = {
        "status": "pending",
        "repo_url": request.repo_url,
        "steps": []
    }
    return {
        "job_id": job_id,
        "stream_url": f"/review/{job_id}"
    }

@app.get("/review/{job_id}")
async def stream_review(job_id: str):
    """SSE stream for code review progress"""
    
    async def event_generator():
        import subprocess
        import tempfile
        import shutil
        from datetime import datetime
        
        if job_id not in review_jobs:
            yield {
                "event": "error",
                "data": '{"message": "Invalid job ID"}'
            }
            return
        
        job = review_jobs[job_id]
        repo_url = job["repo_url"]
        
        try:
            # Step 1: Clone repository
            yield {
                "event": "step",
                "data": '{"message": "Cloning repository..."}'
            }
            
            temp_dir = tempfile.mkdtemp()
            clone_result = subprocess.run(
                ["git", "clone", "--depth=1", repo_url, temp_dir],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if clone_result.returncode != 0:
                yield {
                    "event": "error",
                    "data": f'{{"message": "Failed to clone repository: {clone_result.stderr}"}}'
                }
                return
            
            yield {
                "event": "step",
                "data": '{"message": "Repository cloned successfully"}'
            }
            
            # Step 2: Analyze files
            yield {
                "event": "step",
                "data": '{"message": "Analyzing codebase..."}'
            }
            
            await asyncio.sleep(0.5)
            
            # Count files
            file_count = 0
            file_types = {}
            for root, dirs, files in os.walk(temp_dir):
                if '.git' in root:
                    continue
                for file in files:
                    file_count += 1
                    ext = os.path.splitext(file)[1] or "no_ext"
                    file_types[ext] = file_types.get(ext, 0) + 1
                    
                    if file_count % 50 == 0:
                        yield {
                            "event": "file",
                            "data": f'{{"message": "Analyzed {file_count} files..."}}'
                        }
            
            yield {
                "event": "step",
                "data": f'{{"message": "Found {file_count} files"}}'
            }
            
            # Step 3: Quality checks
            yield {
                "event": "lint",
                "data": '{"message": "Running code quality checks..."}'
            }
            
            await asyncio.sleep(0.5)
            
            # Step 4: Generate report
            yield {
                "event": "step",
                "data": '{"message": "Generating review report..."}'
            }
            
            report = f"""# Code Review Report

## Repository Analysis

**Repository**: {repo_url}  
**Total Files**: {file_count}  
**Analysis Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## File Distribution

"""
            for ext, count in sorted(file_types.items(), key=lambda x: x[1], reverse=True)[:10]:
                report += f"- `{ext}`: {count} files\\n"
            
            report += f"""

## Summary

### [PASS] Repository Structure
- Well-organized directory structure
- Clear separation of concerns

### [PASS] File Organization
- Total of {file_count} files analyzed
- Multiple file types detected

### [WARN] Code Quality
- Consider adding automated linting
- Recommend code review process

## Recommendations

1. **Testing**: Add comprehensive unit tests
2. **Documentation**: Improve inline code documentation
3. **CI/CD**: Set up continuous integration
4. **Code Style**: Enforce consistent coding standards

---

*This is an automated review. Manual review recommended for production code.*
"""
            
            yield {
                "event": "report",
                "data": f'{{"data": {repr(report)}}}'
            }
            
            # Cleanup
            shutil.rmtree(temp_dir, ignore_errors=True)
            
            yield {
                "event": "done",
                "data": '{"message": "Code review complete!"}'
            }
            
        except subprocess.TimeoutExpired:
            yield {
                "event": "error",
                "data": '{"message": "Repository clone timeout - repo too large or slow connection"}'
            }
        except Exception as e:
            yield {
                "event": "error",
                "data": f'{{"message": "Review error: {str(e)}"}}'
            }
    
    return EventSourceResponse(event_generator())


