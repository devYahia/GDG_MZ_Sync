"""
Simulation Generation Prototype — LangChain + Gemini
=====================================================
Standalone test script. Run with:
    python backend/test_simulation_generation.py

Reads GEMINI_API_KEY from backend/.env
"""

import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List

# ── Load environment ────────────────────────────────────────────
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("❌  GEMINI_API_KEY not found in backend/.env")
    sys.exit(1)

# ── LangChain imports ──────────────────────────────────────────
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

# ══════════════════════════════════════════════════════════════
#  Pydantic Output Schema
# ══════════════════════════════════════════════════════════════

class Milestone(BaseModel):
    """A single project milestone / phase."""
    title: str = Field(description="Phase name, e.g. 'Week 1 – Setup & Data Collection'")
    description: str = Field(description="Details of what the student should accomplish")
    deliverables: List[str] = Field(description="Concrete deliverables for this milestone")

class Persona(BaseModel):
    """A person the student will interact with during the simulation."""
    name: str = Field(description="Full name of the persona, e.g. 'Sarah Chen'")
    role: str = Field(description="Job title, e.g. 'Product Manager'")
    personality: str = Field(description="Brief personality description that affects communication style")
    system_prompt: str = Field(
        description="System prompt for an LLM to role-play this persona in a chat. "
                    "Should define tone, expertise, expectations, and how they evaluate the student."
    )
    initial_message: str = Field(
        description="The first message this persona sends to the student to kick off the conversation"
    )

class SimulationOutput(BaseModel):
    """Complete generated simulation for a CS student project."""
    # ── Metadata ──
    title: str = Field(description="Project title")
    domain: str = Field(description="CS domain, e.g. 'Data Science', 'Mobile App Development', 'Web Development'")
    difficulty: str = Field(description="One of: Beginner, Intermediate, Advanced")
    estimated_duration: str = Field(description="e.g. '4 weeks', '2 months'")
    tech_stack: List[str] = Field(description="Recommended technologies and libraries")

    # ── Content ──
    overview: str = Field(description="High-level project description (2-3 paragraphs)")
    learning_objectives: List[str] = Field(description="What the student will learn, 4-6 items")

    # ── Requirements ──
    functional_requirements: List[str] = Field(description="Feature requirements the project must satisfy")
    non_functional_requirements: List[str] = Field(description="Performance, security, UX requirements")

    # ── Plan ──
    milestones: List[Milestone] = Field(description="3-6 project milestones in chronological order")

    # ── People ──
    personas: List[Persona] = Field(description="2-4 personas the student will chat with during the simulation")


# ══════════════════════════════════════════════════════════════
#  Prompt
# ══════════════════════════════════════════════════════════════

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

# ══════════════════════════════════════════════════════════════
#  Generation Logic
# ══════════════════════════════════════════════════════════════

def generate_simulation(title: str, context: str, level: str, level_description: str) -> SimulationOutput:
    """Call Gemini via LangChain and return structured SimulationOutput."""

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        google_api_key=GEMINI_API_KEY,
        temperature=0.7,
    )

    # Use LangChain's structured output support
    structured_llm = llm.with_structured_output(SimulationOutput)

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", HUMAN_PROMPT),
    ])

    chain = prompt | structured_llm

    result = chain.invoke({"title": title, "context": context, "level": level, "level_description": level_description})
    return result


# ══════════════════════════════════════════════════════════════
#  Pretty-print helpers
# ══════════════════════════════════════════════════════════════

def print_section(title: str, char: str = "─"):
    width = 60
    print(f"\n{char * width}")
    print(f"  {title}")
    print(f"{char * width}")


def display_simulation(sim: SimulationOutput):
    """Display the full simulation in a readable format."""

    print_section("📋 PROJECT METADATA", "═")
    print(f"  Title:      {sim.title}")
    print(f"  Domain:     {sim.domain}")
    print(f"  Difficulty: {sim.difficulty}")
    print(f"  Duration:   {sim.estimated_duration}")
    print(f"  Tech Stack: {', '.join(sim.tech_stack)}")

    print_section("📝 OVERVIEW")
    print(f"  {sim.overview}")

    print_section("🎯 LEARNING OBJECTIVES")
    for i, obj in enumerate(sim.learning_objectives, 1):
        print(f"  {i}. {obj}")

    print_section("✅ FUNCTIONAL REQUIREMENTS")
    for i, req in enumerate(sim.functional_requirements, 1):
        print(f"  {i}. {req}")

    print_section("⚙️  NON-FUNCTIONAL REQUIREMENTS")
    for i, req in enumerate(sim.non_functional_requirements, 1):
        print(f"  {i}. {req}")

    print_section("📅 MILESTONES")
    for i, ms in enumerate(sim.milestones, 1):
        print(f"\n  Phase {i}: {ms.title}")
        print(f"    {ms.description}")
        print(f"    Deliverables:")
        for d in ms.deliverables:
            print(f"      • {d}")

    print_section("👥 PERSONAS")
    for p in sim.personas:
        print(f"\n  🧑 {p.name} — {p.role}")
        print(f"    Personality: {p.personality}")
        print(f"    System Prompt (for chat LLM):")
        # Indent multi-line system prompt
        for line in p.system_prompt.split("\n"):
            print(f"      | {line}")
        print(f"    Initial Message:")
        print(f"      \"{p.initial_message}\"")

    print_section("📦 RAW JSON OUTPUT", "═")
    print(json.dumps(sim.model_dump(), indent=2, ensure_ascii=False))


# ══════════════════════════════════════════════════════════════
#  Main
# ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # ── Test Case 1: Data Analysis ──
    test_title = "Customer Churn Prediction Dashboard"
    test_context = (
        "I'm a 3rd-year CS student interested in data science. "
        "I've taken courses in Python, statistics, and machine learning basics. "
        "I want to build something practical with real-world data that I can "
        "show in interviews."
    )
    test_level = "Intermediate"
    test_level_description = (
        "I know Python well and have used pandas and scikit-learn in coursework. "
        "I've never built a full dashboard or worked with deployment."
    )

    print("\U0001F680 Generating simulation...")
    print(f"   Title:   {test_title}")
    print(f"   Context: {test_context}")
    print(f"   Level:   {test_level}")
    print(f"   Level Description: {test_level_description}")
    print()

    try:
        simulation = generate_simulation(test_title, test_context, test_level, test_level_description)
        display_simulation(simulation)
        
        # Save to file
        output_file = Path(__file__).resolve().parent / "simulation.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(simulation.model_dump(), f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Generation successful! Output saved to {output_file}")
    except Exception as e:
        print(f"\n❌ Error during generation: {e}")
        import traceback
        traceback.print_exc()
