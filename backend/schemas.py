from pydantic import BaseModel, Field
from typing import List, Optional

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

class GenerateSimulationRequest(BaseModel):
    title: str
    context: str
    level: str  # e.g. "Beginner", "Intermediate", "Advanced"
    level_description: str  # e.g. "I know basic Python and HTML"

class GenerateSimulationResponse(BaseModel):
    simulation_id: str
    title: str
    simulation_data: SimulationOutput
