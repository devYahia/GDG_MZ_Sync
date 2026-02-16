import os
from pathlib import Path
from dotenv import load_dotenv
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from schemas import (
    SimulationOutput, 
    ProjectChatRequest, 
    CodeReviewRequest, 
    InterviewChatRequest, 
    InterviewFeedbackRequest,
    ChatAnalysisRequest,
    ChatAnalysisResponse
)
from constants import get_level_description

# Lazy imports applied throughout to improve startup time

PROJECT_SYSTEM_PROMPT = """\
You are a Senior CS Professor and Software Architect.
Your goal is to design a realistic, production-quality project simulation for Computer Science students.
Focus on the technical requirements, milestones, and project structure.
Do NOT generate personas in this step.

Guidelines:
- The project should be scoped appropriately for the student's level.
- Tech stack should be modern and industry-relevant.
- Milestones should be concrete with clear deliverables.
- Requirements should be specific.
- RESOURCES: content relevant to the tech stack (docs, tutorials).
- QUIZ: 3-5 multiple choice questions to test the student's pre-requisite knowledge.

Levels:
- L0-L3: Simple, well-defined.
- L4-L6: Moderate, some ambiguity.
- L7-L10: Complex, ambiguous, production-quality.
"""

PROJECT_HUMAN_PROMPT = """\
Generate the Project Structure for:

**Title**: {title}
**Student Context**: {context}
**Level**: {level}
**Level Description**: {level_description}

Output ONLY the project structure (overview, milestones, requirements, resources, quiz).
"""

PERSONA_SYSTEM_PROMPT = """\
You are an expert at creating realistic personas for software projects.
Your goal is to generate the "Team" and "Client" personas for a simulation.

Guidelines:
- Personas should have distinct personalities and communication styles.
- TEAM MEMBERS: Generate 1-2 'Peer' personas (e.g. Senior Dev, QA, Designer) who start the project with the user (IF team_mode is 'group').
- CLIENT: Generate 1 Client/Product Owner persona.
- Persona system_prompts must be detailed for role-playing.

Levels influence behavior:
- L0-L3: Patient, encouraging.
- L4-L6: Professional, reasonable.
- L7-L10: Demanding, pushy, realistic.
"""

PERSONA_HUMAN_PROMPT = """\
Generate Personas for:

**Title**: {title}
**Student Context**: {context}
**Level**: {level}
**Team Mode**: {team_mode}

Output a list of personas (including the Client).
"""

def _ensure_env():
    from pathlib import Path
    from dotenv import load_dotenv
    _backend_dir = Path(__file__).resolve().parent
    _root = _backend_dir.parent
    load_dotenv(dotenv_path=_backend_dir / ".env")
    load_dotenv(dotenv_path=_root / ".env.local")
    load_dotenv(dotenv_path=_root / ".env")

def _get_llm(model: str | None = None, temperature=0.7):
    _ensure_env()
    from langchain_google_genai import ChatGoogleGenerativeAI
    api_key = os.getenv("GEMINI_API_KEY")
    default_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    return ChatGoogleGenerativeAI(
        model=model or default_model,
        google_api_key=api_key,
        temperature=temperature,
    )

async def generate_project_structure(title, context, level, level_description):
    from schemas import ProjectStructure
    from langchain_core.prompts import ChatPromptTemplate
    llm = _get_llm()
    structured_llm = llm.with_structured_output(ProjectStructure)
    prompt = ChatPromptTemplate.from_messages([("system", PROJECT_SYSTEM_PROMPT), ("human", PROJECT_HUMAN_PROMPT)])
    chain = prompt | structured_llm
    return await chain.ainvoke({
        "title": title, "context": context, "level": level, "level_description": level_description
    })

async def generate_personas(title, context, level, team_mode):
    from schemas import PersonaList
    from langchain_core.prompts import ChatPromptTemplate
    llm = _get_llm()
    structured_llm = llm.with_structured_output(PersonaList)
    prompt = ChatPromptTemplate.from_messages([("system", PERSONA_SYSTEM_PROMPT), ("human", PERSONA_HUMAN_PROMPT)])
    chain = prompt | structured_llm
    return await chain.ainvoke({
        "title": title, "context": context, "level": level, "team_mode": team_mode
    })

async def generate_simulation_content(title, context, level, team_mode = "group"):
    """Invokes Gemini via LangChain in parallel and merges results."""
    from schemas import SimulationOutput
    from constants import get_level_description
    
    level_description = get_level_description(level)

    # Run in parallel
    structure_task = asyncio.create_task(generate_project_structure(title, context, level, level_description))
    personas_task = asyncio.create_task(generate_personas(title, context, level, team_mode))

    structure, personas_data = await asyncio.gather(structure_task, personas_task)

    # Merge into final SimulationOutput
    return SimulationOutput(
        title=structure.title,
        domain=structure.domain,
        difficulty=structure.difficulty,
        estimated_duration=structure.estimated_duration,
        tech_stack=structure.tech_stack,
        overview=structure.overview,
        learning_objectives=structure.learning_objectives,
        functional_requirements=structure.functional_requirements,
        non_functional_requirements=structure.non_functional_requirements,
        milestones=structure.milestones,
        resources=structure.resources,
        quiz=structure.quiz,
        personas=personas_data.personas,
        team=personas_data.team
    )


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


def _customer_system_prompt(req) -> str:
    lang = req.language
    level = getattr(req, "level", 1) or 1
    tone = _tone_instructions(level, lang)
    code_ctx = getattr(req, "code_context", None) or ""
    code_block = ""
    if code_ctx.strip():
        # Check if this is a milestone review trigger
        if "[System: The user has marked milestone" in code_ctx:
            code_block = f"""\n\n**SPECIAL INSTRUCTION: MILESTONE REVIEW**
The user has just completed a milestone. You must provide a **Formal Milestone Review**.
Your response must use **Markdown** formatting (bold, lists, code blocks) and follow this structure:

## 🏁 Milestone Review: [Milestone Title]

### Score: [0-100] / 100

### ✅ Strengths
- [Point 1]
- [Point 2]

### ⚠️ Areas for Improvement
- [Point 1]
- [Point 2]

### 💡 Next Steps
[Actionable advice for the next phase]

**Context provided by system:**
{code_ctx.strip()}
"""
        else:
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

Always answer in English, as this client only (unless specifically asked differently). Refer to specific project details when natural.
FORMATTING: Use Markdown for all lists, code snippets, and emphasis to improve readability."""

def generate_chat_response(req) -> dict:
    """Generates a chat response from the persona. Higher level = higher temperature for more varied tone."""
    level = max(1, min(8, getattr(req, "level", 1) or 1))
    temperature = 0.75 if level <= 3 else 0.85  # more variation at higher levels
    llm = _get_llm(temperature=temperature)
    
    from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
    
    system_prompt = _customer_system_prompt(req)
    messages = [SystemMessage(content=system_prompt)]
    
    for m in req.messages:
        if m.role == "user":
            messages.append(HumanMessage(content=m.content))
        else:
            messages.append(AIMessage(content=m.content))
            
    response = llm.invoke(messages)
    return {"reply": response.content}


def _review_system_prompt(req) -> str:
    hint = "Respond in Arabic when possible." if req.language_hint == "ar" else "Respond in English."
    return f"""You are an experienced developer reviewing intern code for this project:
Title: {req.project_title}
Description: {req.project_description}

Review the code for correctness, clarity, and fit to the project. Be constructive. {hint}

Reply with a short feedback paragraph, then conclude with exactly one line: APPROVED or NOT_APPROVED."""

def generate_code_review(req) -> dict:
    """Generates a code review response."""
    llm = _get_llm(temperature=0.2)
    
    system_prompt = _review_system_prompt(req)
    human_content = f"""Code to review (language: {req.language}):

```
{req.code}
```

Provide feedback and end with APPROVED or NOT_APPROVED."""

    from langchain_core.messages import SystemMessage, HumanMessage
    
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

# --- Interviewer Logic ---

def _interviewer_system_prompt(req: InterviewChatRequest) -> str:
    """
    Generates the system prompt for the AI Interviewer.
    The persona is a professional Technical Interviewer.
    """
    lang = req.language
    
    # Base persona and context
    role_en = "You are a Senior Technical Interviewer at a top-tier tech company."
    role_ar = "أنت محاور تقني أول في شركة تقنية رائدة."
    
    style_en = """
    - Your goal is to assess the candidate's soft skills, technical depth, and cultural fit based on the Job Description provided.
    - BE PROFESSIONAL but natural. Do not sound robotic.
    - **SILENT NOTE TAKING**: As you chat, internally track what they do well and poorly. You will be asked for a report later.
    - If the user sends an image, analyze their non-verbal cues (eye contact, posture, lighting, dress code) and incorporate that into your feedback or next question subtly (e.g., "I noticed you look quite relaxed...").
    - Ask ONE question at a time.
    - Start with a polite introduction if history is empty.
    - Dig deeper if their answer is vague.
    """
    style_ar = """
    - هدفك هو تقييم المهارات الشخصية والتقنية للمرتح بناءً على الوصف الوظيفي المقدم.
    - كن محترفًا وطبيعيًا. تجنب النبرة الروبوتية.
    - **ملاحظات صامتة**: أثناء الدردشة، تتبع داخليًا ما يفعلونه جيدًا وما يخطئون فيه. سيُطلب منك تقرير لاحقًا.
    - إذا أرسل المستخدم صورة، حلل الإشارات غير اللفظية (التواصل البصري، الإضاءة، الملابس) وادمج ذلك في ردك أو سؤالك القادم بلطف.
    - اسأل سؤالًا واحدًا فقط في كل مرة.
    - ابدأ بمقدمة مهذبة إذا كانت المحادثة في بدايتها.
    - اطلب تفاصيل أكثر إذا كانت إجابتهم غامضة.
    """

    job_context = ""
    if req.job_description:
        job_context = f"\n**Job Description Context:**\nThe candidate is applying for this role:\n{req.job_description}\n"
    
    constraint_en = "Respond ONLY as the interviewer. Do not break character."
    constraint_ar = "رد بصفتك المحاور فقط. لا تخرج عن الشخصية."

    if lang == "ar":
        return f"{role_ar}\n{style_ar}\n{job_context}\n{constraint_ar}\nتحدث بالعربية."
    
    return f"{role_en}\n{style_en}\n{job_context}\n{constraint_en}\nSpeak in English."


def generate_interview_chat(req: InterviewChatRequest) -> dict:
    """
    Generates a response from the AI Interviewer. 
    Supports multimodal input (text + image) using Gemini 1.5 Flash.
    """
    # Use Flash for speed and multimodal capabilities
    llm = _get_llm(model="gemini-2.5-flash", temperature=0.7)
    
    system_prompt = _interviewer_system_prompt(req)
    messages = [SystemMessage(content=system_prompt)]
    
    # Add history
    for m in req.messages:
        if m.role == "user":
            messages.append(HumanMessage(content=m.content))
        else:
            messages.append(AIMessage(content=m.content))
            
    # Handle the latest turn (Text + Vision)
    if req.image_base64:
        image_content = [
            {"type": "text", "text": "(Video frame of the candidate)"}, # Context for the model
            {
                "type": "image_url", 
                "image_url": {"url": f"data:image/jpeg;base64,{req.image_base64}"}
            }
        ]
        messages.append(HumanMessage(content=image_content))

    if len(messages) == 1: # Only system prompt
        messages.append(HumanMessage(content="Hello, I am ready. Please start the interview."))

    response = llm.invoke(messages)
    return {"reply": response.content}


def generate_interview_feedback(req: InterviewFeedbackRequest) -> dict:
    """
    Generates a final feedback report based on the interview history.
    """
    llm = _get_llm(model="gemini-2.5-flash", temperature=0.5)
    
    lang = req.language
    job_context = f"Job Description: {req.job_description}"
    
    prompt_en = """
    Analyze the interview transcript above. You have been observing this candidate.
    Provide a structured feedback report in Markdown format.
    
    Sections required:
    1. **Overall Score**: X/10 (be strict but fair).
    2. **What Went Well**: Bullet points of strengths.
    3. **Areas for Improvement**: Constructive criticism on answers or soft skills.
    4. **Communication Style**: Feedback on clarity, confidence, and professionalism.
    5. **Technical Accuracy**: If technical questions were asked, rate the accuracy.
    
    Tone: Professional, constructive, mentoring.
    """
    
    prompt_ar = """
    حلل نص المقابلة أعلاه. لقد كنت تراقب هذا المرشح.
    قدم تقرير تقييم منظم بتنسيق Markdown.
    
    الأقسام المطلوبة:
    1. **النتيجة الإجمالية**: X/10 (كن صارمًا ولكن عادلاً).
    2. **نقاط القوة**: نقاط نقطية لما فعلوه جيدًا.
    3. **مجالات التحسين**: نقد بناء حول الإجابات أو المهارات الشخصية.
    4. **أسلوب التواصل**: تعليقات حول الوضوح، الثقة، والاحترافية.
    5. **الدقة التقنية**: إذا طُرحت أسئلة تقنية، قيم دقتها.
    
    النبرة: احترافية، بناءة، توجيهية.
    """
    
    final_instruction = prompt_ar if lang == "ar" else prompt_en
    
    messages = [
        SystemMessage(content=f"You are an Interview Evaluator. {job_context}"),
    ]
    
    for m in req.messages:
        role_label = "Interviewer" if m.role == "assistant" else "Candidate"
        messages.append(HumanMessage(content=f"{role_label}: {m.content}"))
        
    messages.append(HumanMessage(content=f"\n\n---\n{final_instruction}"))
    
    response = llm.invoke(messages)
    return {"report": response.content}

def generate_chat_analysis(req: ChatAnalysisRequest):
    """Analyzes chat history to evaluate soft and technical skills."""
    llm = _get_llm(temperature=0.3)
    structured_llm = llm.with_structured_output(ChatAnalysisResponse)

    system_prompt = """You are an Expert Technical Mentor and Career Coach.
Your goal is to analyze a conversation between a junior developer (user) and a simulated client.

Evaluate the user on:
1. **Soft Skills**: Communication clarity, empathy, requirement gathering, professional tone.
2. **Technical Skills**: Understanding of requirements, proposing solutions, technical terminologies used (if any).

Provide a score (0-100) and specific feedback for each skill.
Summarize the user's performance and give an overall score.

Be constructive but honest. High scores (90+) require exceptional performance.
"""

    human_content = f"""Project: {req.project_title}
Description: {req.project_description}
Client Persona: {req.client_persona}

Conversation History:
"""
    for m in req.messages:
        role = "Developer (User)" if m.role == "user" else f"Client ({req.client_persona})"
        human_content += f"\n{role}: {m.content}"

    from langchain_core.prompts import ChatPromptTemplate

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", human_content),
    ])

    chain = prompt | structured_llm
    return chain.invoke({})
