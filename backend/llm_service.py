import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from schemas import SimulationOutput

# Load environment
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SYSTEM_PROMPT = """\
You are a Senior CS Professor and Software Architect who designs realistic, \
production-quality project simulations for Computer Science students.

Your goal is to generate a COMPLETE simulation that feels like a real workplace \
project. The simulation must help students practice skills they will need in \
real jobs.

Guidelines:
- The project should be scoped appropriately for the student's context AND level.
- Tech stack should be modern and industry-relevant.
- Personas should have distinct personalities and communication styles.
- Persona system_prompts must be detailed enough for another LLM to convincingly \
  role-play them.
- Milestones should be concrete with clear deliverables.
- Requirements should be specific, not vague.

CRITICAL — Level-based scaling:
- **Beginner**: Personas are patient, encouraging, and give hints. Requirements \
  are simple and well-defined. Milestones are small and guided.
- **Intermediate**: Personas are professional and expect reasonable competence. \
  Requirements include some ambiguity the student must clarify. Milestones are \
  moderately challenging.
- **Advanced**: Personas are demanding, give less guidance, may push back on \
  decisions, and expect production-quality work. Requirements are complex, \
  ambiguous, and may include conflicting stakeholder needs. Milestones have \
  tight deadlines and high expectations.
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

def generate_simulation_content(title: str, context: str, level: str, level_description: str) -> SimulationOutput:
    """Invokes Gemini via LangChain and returns structured SimulationOutput."""
    
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        google_api_key=GEMINI_API_KEY,
        temperature=0.7,
    )

    structured_llm = llm.with_structured_output(SimulationOutput)

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", HUMAN_PROMPT),
    ])

    chain = prompt | structured_llm
    
    return chain.invoke({"title": title, "context": context, "level": level, "level_description": level_description})
