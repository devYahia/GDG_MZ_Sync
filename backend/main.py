from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from dotenv import load_dotenv

from schemas import (
    GenerateSimulationRequest, 
    GenerateSimulationResponse, 
    SimulationOutput,
    ProjectChatRequest,
    CodeReviewRequest
)
from llm_service import (
    generate_simulation_content, 
    generate_chat_response, 
    generate_code_review
)
import uuid

# Load environment variables
load_dotenv()

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

# Gemini API Key check (optional, but good for fast fail)
if not os.environ.get("GEMINI_API_KEY"):
    print("Warning: GEMINI_API_KEY not found. LLM features will fail.")


# --- Routes ---

@app.post("/generate-simulation", response_model=GenerateSimulationResponse)
async def generate_simulation(request: GenerateSimulationRequest):
    # 1. Generate content using LLM
    try:
        simulation_data: SimulationOutput = generate_simulation_content(
            request.title, request.context, request.level
        )
    except Exception as e:
        print(f"LLM Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
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
