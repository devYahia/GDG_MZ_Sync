import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from schemas import SimulationOutput, ProjectChatRequest, CodeReviewRequest
from constants import get_level_description

# Load environment: backend/.env first, then project root .env.local and .env (so root .env.local works for both Next.js and backend)
_backend_dir = Path(__file__).resolve().parent
_root = _backend_dir.parent
load_dotenv(dotenv_path=_backend_dir / ".env")
load_dotenv(dotenv_path=_root / ".env.local")
load_dotenv(dotenv_path=_root / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SYSTEM_PROMPT = """\
You are a Senior CS Professor and Software Architect who designs realistic, \
production-quality project simulations for Computer Science students.

Your goal is to generate a COMPLETE simulation that feels like a real workplace \
project. The simulation must help students practice skills they will need in \
real jobs.

Guidelines:
- The project should be scoped appropriately for the student's level.
- Tech stack should be modern and industry-relevant.
- Personas should have distinct personalities and communication styles.
- Persona system_prompts must be detailed enough for another LLM to convincingly \
  role-play them.
- Milestones should be concrete with clear deliverables.
- Requirements should be specific, not vague.

CRITICAL — The student's level dictates EVERYTHING:
- Lower levels (L0-L3): Personas are patient, encouraging, and give hints. \
  Requirements are simple and well-defined. Milestones are small and guided.
- Mid levels (L4-L6): Personas are professional and expect reasonable competence. \
  Requirements include some ambiguity. Milestones are moderately challenging.
- Higher levels (L7-L10): Personas are demanding, give less guidance, may push back \
  on decisions, and expect production-quality work. Requirements are complex, \
  ambiguous, and may include conflicting stakeholder needs.
"""

HUMAN_PROMPT = """\
Generate a simulation for the following:

**Title**: {title}
**Student Context**: {context}
**Level**: {level}
**Level Description**: {level_description}

The level MUST influence:
1. How strict, demanding, and realistic the personas behave.
2. The complexity and ambiguity of the project requirements.
3. The scope and difficulty of milestones.

Create a realistic, production-style project simulation with all required details.
"""

def _get_llm(model="gemini-2.5-flash-lite", temperature=0.7):
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=GEMINI_API_KEY,
        temperature=temperature,
    )

def generate_simulation_content(title: str, context: str, level: str) -> SimulationOutput:
    """Invokes Gemini via LangChain and returns structured SimulationOutput."""
    # Resolve level description from constants
    level_description = get_level_description(level)

    llm = _get_llm()
    structured_llm = llm.with_structured_output(SimulationOutput)

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", HUMAN_PROMPT),
    ])

    chain = prompt | structured_llm
    
    return chain.invoke({"title": title, "context": context, "level": level, "level_description": level_description})


# --- Chat & Review Logic ---

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

def generate_chat_response(req: ProjectChatRequest) -> dict:
    """Generates a chat response from the persona."""
    llm = _get_llm(model="gemini-1.5-flash", temperature=0.7)
    
    system_prompt = _customer_system_prompt(req)
    messages = [SystemMessage(content=system_prompt)]
    
    for m in req.messages:
        if m.role == "user":
            messages.append(HumanMessage(content=m.content))
        else:
            messages.append(AIMessage(content=m.content))
            
    response = llm.invoke(messages)
    return {"reply": response.content}


def _review_system_prompt(req: CodeReviewRequest) -> str:
    hint = "Respond in Arabic when possible." if req.language_hint == "ar" else "Respond in English."
    return f"""You are an experienced developer reviewing intern code for this project:
Title: {req.project_title}
Description: {req.project_description}

Review the code for correctness, clarity, and fit to the project. Be constructive. {hint}

Reply with a short feedback paragraph, then conclude with exactly one line: APPROVED or NOT_APPROVED."""

def generate_code_review(req: CodeReviewRequest) -> dict:
    """Generates a code review response."""
    llm = _get_llm(model="gemini-1.5-flash", temperature=0.2)
    
    system_prompt = _review_system_prompt(req)
    human_content = f"""Code to review (language: {req.language}):

```
{req.code}
```

Provide feedback and end with APPROVED or NOT_APPROVED."""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_content)
    ]
    
    response = llm.invoke(messages)
    text = (str(response.content) or "").strip()
    
    # Parse approval
    upper = text.upper()
    approved = "NOT_APPROVED" not in upper and "APPROVED" in upper
    
    # Clean up feedback text (remove the status line if present at end)
    lines = text.split("\n")
    if lines and lines[-1].strip().upper() in ("APPROVED", "NOT_APPROVED"):
        feedback = "\n".join(lines[:-1]).strip() or "No detailed feedback."
    else:
        feedback = text or "No detailed feedback."
        
    return {"feedback": feedback, "approved": approved}
