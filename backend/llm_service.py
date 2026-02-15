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
# Override in .env: GEMINI_MODEL=gemini-2.5-flash (default). Some keys get 404 for gemini-1.5-pro.
GEMINI_DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

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

def _get_llm(model: str | None = None, temperature=0.7):
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    return ChatGoogleGenerativeAI(
        model=model or GEMINI_DEFAULT_MODEL,
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

def _tone_instructions(level: int, lang: str) -> str:
    """Level-based customer tone: 1-3 friendly/calm, 4-8 varied and realistic (can be harsh)."""
    level = max(1, min(8, level or 1))
    if level <= 3:
        if lang == "ar":
            return "كن ودوداً، هادئاً، ومشجعاً. اصبر على المطور واشرح بوضوح. نبرتك دافئة واحترافية."
        return "Be friendly, cool, and calm. Patient and encouraging. Explain clearly. Warm, professional tone."
    # Levels 4-8: varied, realistic client tones
    if lang == "ar":
        return """نبرتك كعميل حقيقي قد تتغير: أحياناً هادئ، أحياناً متوتر أو ملحّ، أو لا تفهم المصطلحات التقنية وتطلب شرحاً، أو تصر على رأيك، أو تكون غير راضٍ عن التأخير. تنوع طبيعي وواقعي—لا تكن دائماً بنفس الأسلوب."""
    return """Your tone as a client should feel real and vary naturally. You might be: calm and professional, or impatient and short; sometimes insisting on your view or pushing back; sometimes not understanding technical terms and asking for plain-language explanations; sometimes dismissive or skeptical; sometimes stressed about deadlines. Vary your tone realistically—not always the same. Stay in character as this persona."""


def _build_project_context_block(sim_ctx) -> str:
    """Build detailed project context so the client persona can answer from deep knowledge."""
    if not sim_ctx:
        return ""
    parts = []
    if getattr(sim_ctx, "overview", None) and str(sim_ctx.overview).strip():
        parts.append(f"**Project overview:**\n{sim_ctx.overview.strip()}")
    if getattr(sim_ctx, "learning_objectives", None) and sim_ctx.learning_objectives:
        parts.append("**Learning objectives:**\n" + "\n".join(f"- {o}" for o in sim_ctx.learning_objectives))
    if getattr(sim_ctx, "functional_requirements", None) and sim_ctx.functional_requirements:
        parts.append("**Functional requirements:**\n" + "\n".join(f"- {r}" for r in sim_ctx.functional_requirements))
    if getattr(sim_ctx, "non_functional_requirements", None) and sim_ctx.non_functional_requirements:
        parts.append("**Non-functional requirements:**\n" + "\n".join(f"- {r}" for r in sim_ctx.non_functional_requirements))
    if getattr(sim_ctx, "milestones", None) and sim_ctx.milestones:
        ms = []
        for m in sim_ctx.milestones:
            ms.append(f"- {getattr(m, 'title', m)}: {getattr(m, 'description', '')}")
            if getattr(m, "deliverables", None):
                ms.append("  Deliverables: " + ", ".join(m.deliverables))
        parts.append("**Milestones:**\n" + "\n".join(ms))
    if getattr(sim_ctx, "domain", None) and str(sim_ctx.domain).strip():
        parts.append(f"**Domain:** {sim_ctx.domain.strip()}")
    if getattr(sim_ctx, "difficulty", None) and str(sim_ctx.difficulty).strip():
        parts.append(f"**Difficulty:** {sim_ctx.difficulty.strip()}")
    if getattr(sim_ctx, "tech_stack", None) and sim_ctx.tech_stack:
        parts.append("**Tech stack:** " + ", ".join(sim_ctx.tech_stack))
    if not parts:
        return ""
    return "\n\n**Deep project context (you know this; use it to give specific, detailed answers):**\n" + "\n\n".join(parts)


def _customer_system_prompt(req: ProjectChatRequest) -> str:
    lang = req.language
    level = getattr(req, "level", 1) or 1
    tone = _tone_instructions(level, lang)
    code_ctx = getattr(req, "code_context", None) or ""
    code_block = ""
    if code_ctx.strip():
        code_block = f"\n\n**Current code from the intern** (you may reference specific lines or request changes):\n```\n{code_ctx.strip()[:8000]}\n```"

    persona = getattr(req, "persona", None)
    sim_ctx = getattr(req, "simulation_context", None)
    project_context_block = _build_project_context_block(sim_ctx)

    constraint_en = """**CRITICAL — You are ONLY the client/stakeholder.**
- You must NEVER break character. Do not speak as an AI, assistant, or narrator.
- Every reply must be in the first person, as this specific client persona only. Use "I", "we", "my requirements", etc.
- You know only what this character would know. Do not give meta-commentary. Just BE the client and reply directly."""
    constraint_ar = """**حرج — أنت فقط العميل/صاحب المصلحة.**
- لا تكسر الشخصية أبداً. لا تتحدث بصفة مساعد أو راوٍ.
- كل رد بصيغة المتكلم، كأنك هذا العميل فقط. استخدم "أنا"، "نحن"، "متطلباتي".
- كن العميل ورد مباشرة."""

    if persona:
        persona_block_en = f"""**You are exactly this person — and no one else:**
- **Name:** {persona.name}
- **Role:** {persona.role}
- **Personality:** {persona.personality}

**This character's own briefing (follow it strictly):**
{persona.system_prompt}

**How you typically talk:** "{persona.initial_message}"
"""
        persona_block_ar = f"""**أنت بالضبط هذا الشخص ولا غير:**
- **الاسم:** {persona.name}
- **الدور:** {persona.role}
- **الشخصية:** {persona.personality}

**توجيهات هذا الشخص (اتبعها حرفياً):**
{persona.system_prompt}
"""
    else:
        persona_block_en = f"""**Persona:** {req.client_persona}. **Mood:** {req.client_mood}."""
        persona_block_ar = f"""**الشخصية:** {req.client_persona}. **المزاج:** {req.client_mood}."""

    if lang == "ar":
        return f"""أنت عميل محاكى في مشروع تدريب داخلي. كل رد يجب أن يكون بصفة العميل فقط.
{persona_block_ar}

المشروع: {req.project_title}
الوصف المختصر: {req.project_description}
مستوى الصعوبة: {level} (من 8).
{project_context_block}
{code_block}

{constraint_ar}
تعليمات النبرة: {tone}

أجب دائماً بالعربية، بصفة هذا العميل فقط. اذكر تفاصيل من المشروع عندما يكون ذلك طبيعياً."""
    return f"""You are a simulated client in an internship project. Every reply must be as the client only.
{persona_block_en}

**Project:** {req.project_title}
**Short description:** {req.project_description}
**Difficulty level:** {level} (out of 8).
{project_context_block}
{code_block}

{constraint_en}
Tone instructions: {tone}

Always answer in English, as this client only. Refer to specific project details when natural."""

def generate_chat_response(req: ProjectChatRequest) -> dict:
    """Generates a chat response from the persona. Higher level = higher temperature for more varied tone."""
    level = max(1, min(8, getattr(req, "level", 1) or 1))
    temperature = 0.75 if level <= 3 else 0.85  # more variation at higher levels
    llm = _get_llm(temperature=temperature)
    
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
    llm = _get_llm(temperature=0.2)
    
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
