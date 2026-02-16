from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal

class Milestone(BaseModel):
    title: str
    description: str
    deliverables: List[str]

class Persona(BaseModel):
    name: str
    role: str
    personality: str
    system_prompt: str
    initial_message: str

class Resource(BaseModel):
    title: str
    url: str
    type: Literal["documentation", "tutorial", "library", "video"]
    description: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str

class ProjectStructure(BaseModel):
    title: str
    domain: str
    difficulty: str
    estimated_duration: str
    tech_stack: List[str]
    overview: str
    learning_objectives: List[str]
    functional_requirements: List[str]
    non_functional_requirements: List[str]
    milestones: List[Milestone]
    resources: List[Resource] = []
    quiz: List[QuizQuestion] = []

class PersonaList(BaseModel):
    personas: List[Persona]
    team: List[Persona] = []

class SimulationOutput(BaseModel):
    title: str
    domain: str
    difficulty: str
    estimated_duration: str
    tech_stack: List[str]
    overview: str
    learning_objectives: List[str]
    functional_requirements: List[str]
    non_functional_requirements: List[str]
    milestones: List[Milestone]
    personas: List[Persona]
    team: List[Persona] = []
    resources: List[Resource] = []
    quiz: List[QuizQuestion] = []

class GenerateSimulationRequest(BaseModel):
    title: str
    context: str
    level: str  # e.g. "L0", "L5", "L10"
    team_mode: Literal["solo", "group"] = "group"

class GenerateSimulationResponse(BaseModel):
    simulation_id: str
    title: str
    simulation_data: SimulationOutput

# --- Chat & Review Models ---

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    
class PersonaChatInfo(BaseModel):
    """One specific persona for role-play; each persona has its own chat."""
    name: str
    role: str
    personality: str
    system_prompt: str
    initial_message: str

class SimulationContextForChat(BaseModel):
    """Full project context so the client persona can answer in detail."""
    overview: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    functional_requirements: Optional[List[str]] = None
    non_functional_requirements: Optional[List[str]] = None
    milestones: Optional[List[Milestone]] = None
    domain: Optional[str] = None
    difficulty: Optional[str] = None
    tech_stack: Optional[List[str]] = None

class ProjectChatRequest(BaseModel):
    project_id: str
    project_title: str
    project_description: str
    client_persona: str
    client_mood: str
    messages: List[ChatMessage]
    language: Literal["en", "ar"]
    level: Optional[int] = 1  # 1-8: affects customer tone (friendly low, varied/harsh high)
    code_context: Optional[str] = None
    # When chatting with a specific generated persona (separate chat per persona)
    persona: Optional[PersonaChatInfo] = None
    simulation_context: Optional[SimulationContextForChat] = None

class CodeReviewRequest(BaseModel):
    project_id: str
    project_title: str
    project_description: str
    code: str
    language: str
    language_hint: Optional[Literal["en", "ar"]] = None

class RepoRequest(BaseModel):
    github_url: str
    access_token: Optional[str] = None
    branch: Optional[str] = "main"

    @field_validator('github_url')
    @classmethod
    def validate_url(cls, v: str):
        if "github.com" not in v:
            raise ValueError("Must be a valid GitHub URL")
        return v.strip().rstrip('/')

class SkillMetric(BaseModel):
    name: str
    score: int  # 0-100
    feedback: str

class ChatAnalysisRequest(BaseModel):
    messages: List[ChatMessage]
    project_title: str
    project_description: str
    client_persona: str

class ChatAnalysisResponse(BaseModel):
    soft_skills: List[SkillMetric]
    technical_skills: List[SkillMetric]
    summary: str
    overall_score: int
