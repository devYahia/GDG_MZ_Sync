from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Literal
import os
import google.generativeai as genai
from dotenv import load_dotenv

from schemas import GenerateSimulationRequest, GenerateSimulationResponse, SimulationOutput
from llm_service import generate_simulation_content
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

# Gemini
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)


# --- Pydantic models for API ---

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ProjectChatRequest(BaseModel):
    project_id: str
    project_title: str
    project_description: str
    client_persona: str
    client_mood: str
    messages: list[ChatMessage]
    language: Literal["en", "ar"]


class CodeReviewRequest(BaseModel):
    project_id: str
    project_title: str
    project_description: str
    code: str
    language: str
    language_hint: Literal["en", "ar"] | None = None


# --- System prompts for Gemini ---

def _customer_system_prompt(req: ProjectChatRequest) -> str:
    lang = req.language
    if lang == "ar":
        return f"""أنت عميل محاكى في مشروع تدريب داخلي افتراضي. تجسد شخصية: {req.client_persona}. مزاجك: {req.client_mood}.
المشروع: {req.project_title}
الوصف: {req.project_description}

أجب دائماً بالعربية، بصفة هذا العميل. كن واقعياً في التعامل (متطلب، غامض، أو ودود حسب المزاج). لا تكسر الشخصية."""
    return f"""You are a simulated client in a virtual internship. Persona: {req.client_persona}. Mood: {req.client_mood}.
Project: {req.project_title}
Description: {req.project_description}

Always answer in English as this client. Be realistic (demanding, vague, or friendly depending on mood). Stay in character."""


def _review_system_prompt(req: CodeReviewRequest) -> str:
    hint = "Respond in Arabic when possible." if req.language_hint == "ar" else "Respond in English."
    return f"""You are an experienced developer reviewing intern code for this project:
Title: {req.project_title}
Description: {req.project_description}

Review the code for correctness, clarity, and fit to the project. Be constructive. {hint}

Reply with a short feedback paragraph, then conclude with exactly one line: APPROVED or NOT_APPROVED."""


# --- Routes ---

@app.post("/generate-simulation", response_model=GenerateSimulationResponse)
async def generate_simulation(request: GenerateSimulationRequest):
    # 1. Generate content using LLM
    simulation_data: SimulationOutput = generate_simulation_content(
        request.title, request.context, request.level, request.level_description
    )
    
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
    if not gemini_api_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured")
    model = genai.GenerativeModel("gemini-1.5-flash")
    system = _customer_system_prompt(req)
    parts = [system]
    for m in req.messages:
        role = "User" if m.role == "user" else "Assistant"
        parts.append(f"{role}: {m.content}")
    parts.append("Assistant:")
    prompt = "\n\n".join(parts)
    try:
        response = model.generate_content(prompt)
        reply = (response.text or "").strip()
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/review")
async def code_review(req: CodeReviewRequest):
    if not gemini_api_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured")
    model = genai.GenerativeModel("gemini-1.5-flash")
    system = _review_system_prompt(req)
    prompt = f"""{system}

Code to review (language: {req.language}):

```
{req.code}
```

Provide feedback and end with APPROVED or NOT_APPROVED."""
    try:
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        upper = text.upper()
        approved = "NOT_APPROVED" not in upper and "APPROVED" in upper
        # Use full text as feedback; optionally strip last line if it's just APPROVED/NOT_APPROVED
        lines = text.split("\n")
        if lines and lines[-1].strip().upper() in ("APPROVED", "NOT_APPROVED"):
            feedback = "\n".join(lines[:-1]).strip() or "No detailed feedback."
        else:
            feedback = text or "No detailed feedback."
        return {"feedback": feedback, "approved": approved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
