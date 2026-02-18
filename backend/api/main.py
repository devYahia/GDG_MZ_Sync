import os
import uuid
import json
from typing import Literal, Optional, List, Dict
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
import asyncio

# Application internal imports
from domain.models import (
    GenerateSimulationRequest, 
    GenerateSimulationResponse, 
    SimulationOutput,
    ProjectChatRequest,
    CodeReviewRequest,
    ChatAnalysisRequest,
    InterviewChatRequest,
    InterviewFeedbackRequest,
    RepoRequest
)
from application.llm_service import (
    generate_simulation_content, 
    generate_chat_response, 
    generate_code_review,
    generate_interview_chat,
    generate_interview_feedback,
    generate_chat_analysis
)
from application.repo_service import repo_service
from application.daytona_service import daytona_service
from infrastructure.database import db

# Load environment
from pathlib import Path as _Path
_api_dir = _Path(__file__).resolve().parent
_backend_dir = _api_dir.parent
_root = _backend_dir.parent
load_dotenv(dotenv_path=_backend_dir / ".env")
load_dotenv(dotenv_path=_root / ".env.local")
load_dotenv(dotenv_path=_root / ".env")

app = FastAPI()

# CORS Configuration
_cors_origins = os.environ.get("CORS_ORIGINS", "").split(",")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] + [o.strip() for o in _cors_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

@app.post("/generate-simulation", response_model=GenerateSimulationResponse)
async def generate_simulation(request: GenerateSimulationRequest):
    # 1. Generate content using LLM
    try:
        simulation_data: SimulationOutput = await generate_simulation_content(
            request.title, request.context, request.level
        )
    except Exception as e:
        err_msg = str(e)
        print(f"[BACKEND ERROR] LLM Generation Error: {e}")
        if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
            raise HTTPException(status_code=429, detail="AI Resource exhausted")
        raise HTTPException(status_code=500, detail=err_msg)
    
    # 2. Save to Postgres via asyncpg
    try:
        user_id = request.user_id
        # Check if user exists to avoid FK error
        user_check = await db.fetchrow("SELECT id FROM \"user\" WHERE id = $1", user_id)
        if not user_check:
            print(f"[BACKEND ERROR] User {user_id} not found in 'user' table. Please re-login on the frontend.")
        
        # Mapping SimulationOutput to DB columns
        sim_id_row = await db.fetchrow(
            """
            INSERT INTO simulations (
                user_id, title, context, domain, difficulty, level, 
                estimated_duration, tech_stack, overview, 
                learning_objectives, functional_requirements, 
                non_functional_requirements, milestones, resources, quiz
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id
            """,
            user_id,
            simulation_data.title,
            request.context,
            simulation_data.domain,
            simulation_data.difficulty,
            int(request.level.replace("L", "")) if "L" in request.level else 1,
            simulation_data.estimated_duration,
            simulation_data.tech_stack,
            simulation_data.overview,
            simulation_data.learning_objectives,
            simulation_data.functional_requirements,
            simulation_data.non_functional_requirements,
            json.dumps([m.model_dump() for m in simulation_data.milestones]),
            json.dumps([r.model_dump() for r in simulation_data.resources]),
            json.dumps([q.model_dump() for q in simulation_data.quiz])
        )
        
        sim_id = str(sim_id_row['id'])
        
        # Insert Personas
        for persona in simulation_data.personas:
            await db.execute(
                """
                INSERT INTO personas (
                    simulation_id, name, role, personality, 
                    system_prompt, initial_message
                ) VALUES ($1, $2, $3, $4, $5, $6)
                """,
                sim_id,
                persona.name,
                persona.role,
                persona.personality,
                persona.system_prompt,
                persona.initial_message
            )
            
        return GenerateSimulationResponse(
            simulation_id=sim_id,
            title=simulation_data.title,
            simulation_data=simulation_data
        )
    except Exception as e:
        print(f"[BACKEND ERROR] Database error: {e}")
        # Return generated data even if DB save fails for fallback
        return GenerateSimulationResponse(
            simulation_id=f"temp-{uuid.uuid4()}",
            title=simulation_data.title,
            simulation_data=simulation_data
        )

@app.get("/")
async def root():
    return {"message": "Interna FastAPI Backend is running!", "database": "PostgreSQL (asyncpg)"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/chat")
async def project_chat(req: ProjectChatRequest):
    try:
        return await generate_chat_response(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/review")
async def code_review(req: CodeReviewRequest):
    try:
        return await generate_code_review(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-chat")
async def analyze_chat(req: ChatAnalysisRequest):
    try:
        return await generate_chat_analysis(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/repo/extract")
async def extract_repo(request: RepoRequest):
    result = await run_in_threadpool(
        repo_service.clone_and_read, 
        request.github_url, 
        request.branch, 
        request.access_token
    )
    if not result:
        raise HTTPException(status_code=400, detail="Failed to extract repository")
    return result
@app.post("/api/interview/chat")
async def interview_chat(req: InterviewChatRequest):
    try:
        return await generate_interview_chat(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/feedback")
async def interview_feedback(req: InterviewFeedbackRequest):
    try:
        return await generate_interview_feedback(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
