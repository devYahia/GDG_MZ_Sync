"""
Level Descriptions for Simulation Generation (L0-L10)
====================================================
Each level maps to a description that guides the LLM on how to scale
project complexity, persona strictness, and milestone difficulty.
"""

LEVEL_DESCRIPTIONS = {
    "L0": (
        "Absolute beginner. No coding experience at all. "
        "Needs step-by-step hand-holding and extremely simple tasks. "
        "Personas should be warm, patient, and explain everything from scratch."
    ),
    "L1": (
        "Novice. Knows basic programming concepts (variables, loops, conditionals) "
        "but has never built a real project. Personas should be encouraging and "
        "provide detailed guidance. Requirements should be very simple and explicit."
    ),
    "L2": (
        "Early learner. Has completed introductory CS courses and can write simple scripts. "
        "Understands basic data structures. Personas should guide gently but start expecting "
        "some independence. Projects involve single-file programs or simple apps."
    ),
    "L3": (
        "Developing student. Comfortable with one programming language. Has built small "
        "personal projects. Starting to learn about version control and basic debugging. "
        "Personas are supportive but expect the student to try before asking for help."
    ),
    "L4": (
        "Competent student. Understands OOP, basic algorithms, and can use a framework "
        "(e.g., Flask, React basics). Has done a few small projects. Personas are professional, "
        "give moderate guidance, and expect reasonable solutions."
    ),
    "L5": (
        "Junior developer level. Can build full-stack applications with guidance. "
        "Understands APIs, databases, and deployment basics. Personas act like real "
        "colleagues — professional, expect competence, but still offer constructive feedback."
    ),
    "L6": (
        "Solid junior. Comfortable with multiple technologies, testing, and CI/CD basics. "
        "Can work independently on well-defined tasks. Personas are less patient, expect "
        "clean code, and may push back on design decisions."
    ),
    "L7": (
        "Mid-level developer. Strong in at least one domain (frontend, backend, data, etc.). "
        "Can design small systems and mentor beginners. Personas are demanding, expect "
        "production-quality work, and introduce ambiguous requirements."
    ),
    "L8": (
        "Senior developer level. Can architect systems, handle complex trade-offs, and "
        "lead technical decisions. Personas are tough stakeholders with conflicting needs. "
        "Requirements are intentionally ambiguous and complex."
    ),
    "L9": (
        "Staff engineer level. Expected to handle cross-functional concerns, performance "
        "optimization, security, and scalability. Personas are executive-level stakeholders "
        "who challenge decisions and expect detailed justifications."
    ),
    "L10": (
        "Principal/Architect level. Expected to design enterprise-grade distributed systems. "
        "Personas include demanding CTOs, VPs, and external clients with unrealistic "
        "expectations. Requirements are contradictory and politically charged."
    ),
}


def get_level_description(level: str) -> str:
    """Returns the description for a given level key (e.g., 'L5')."""
    return LEVEL_DESCRIPTIONS.get(level, LEVEL_DESCRIPTIONS["L5"])
