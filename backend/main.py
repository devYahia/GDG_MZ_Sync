from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Literal
import os
import google.generativeai as genai
from dotenv import load_dotenv

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
    code_context: str | None = None


class CodeReviewRequest(BaseModel):
    project_id: str
    project_title: str
    project_description: str
    code: str
    language: str
    language_hint: Literal["en", "ar"] | None = None


# --- System prompts for Gemini ---

def _customer_system_prompt(req: ProjectChatRequest) -> str:
    code_block = ""
    if req.code_context and req.code_context.strip():
        code_block = f"\n\nCurrent code from the intern (you may reference specific lines or point out issues):\n```\n{req.code_context.strip()[:8000]}\n```"
    lang = req.language
    if lang == "ar":
        return f"""أنت عميل محاكى في مشروع تدريب داخلي افتراضي. تجسد شخصية: {req.client_persona}. مزاجك: {req.client_mood}.
المشروع: {req.project_title}
الوصف: {req.project_description}
{code_block}

أجب دائماً بالعربية، بصفة هذا العميل. إذا وُجد كود، يمكنك التعليق على أجزاء منه أو طلب تعديلات. كن واقعياً."""
    return f"""You are a simulated client in a virtual internship. Persona: {req.client_persona}. Mood: {req.client_mood}.
Project: {req.project_title}
Description: {req.project_description}
{code_block}

Always answer in English as this client. If code is provided, you may reference specific parts or ask for changes. Be realistic."""


def _review_system_prompt(req: CodeReviewRequest) -> str:
    hint = "Respond in Arabic when possible." if req.language_hint == "ar" else "Respond in English."
    return f"""You are an experienced developer reviewing intern code for this project:
Title: {req.project_title}
Description: {req.project_description}

Review the code for correctness, clarity, and fit to the project. Be constructive. {hint}

Reply with a short feedback paragraph, then conclude with exactly one line: APPROVED or NOT_APPROVED."""


# --- Routes ---

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
