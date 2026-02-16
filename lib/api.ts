export interface Milestone {
    title: string
    description: string
    deliverables: string[]
}

export interface Persona {
    name: string
    role: string
    personality: string
    system_prompt: string
    initial_message: string
}

export interface Resource {
    title: string
    url: string
    type: "documentation" | "tutorial" | "library" | "video"
    description: string
}

export interface QuizQuestion {
    question: string
    options: string[]
    correct_option_index: number
    explanation: string
}

export interface SimulationOutput {
    title: string
    domain: string
    difficulty: string
    estimated_duration: string
    tech_stack: string[]
    overview: string
    learning_objectives: string[]
    functional_requirements: string[]
    non_functional_requirements: string[]
    milestones: Milestone[]
    personas: Persona[]
    team: Persona[]
    resources: Resource[]
    quiz: QuizQuestion[]
}

// Alias for client usage
export type SimulationData = SimulationOutput
export type SimulationPersona = Persona

export interface GenerateSimulationRequest {
    title: string
    context: string
    level: string
    team_mode?: "solo" | "group"
}

export interface GenerateSimulationResponse {
    simulation_id: string
    title: string
    simulation_data: SimulationOutput
}

export type ChatLanguage = "en" | "ar"

export interface ChatMessage {
    role: "user" | "assistant"
    content: string
}

export interface PersonaChatInfo {
    name: string
    role: string
    personality: string
    system_prompt: string
    initial_message: string
}

export interface SimulationContextForChat {
    overview?: string
    learning_objectives?: string[]
    functional_requirements?: string[]
    non_functional_requirements?: string[]
    milestones?: Milestone[]
    domain?: string
    difficulty?: string
    tech_stack?: string[]
}

export interface ProjectChatRequest {
    project_id: string
    project_title: string
    project_description: string
    client_persona: string
    client_mood: string
    messages: ChatMessage[]
    language: ChatLanguage
    level?: number
    code_context?: string
    persona?: PersonaChatInfo
    simulation_context?: SimulationContextForChat
}

export interface CodeReviewRequest {
    project_id: string
    project_title: string
    project_description: string
    code: string
    language: string
    language_hint?: ChatLanguage
}

export interface SkillMetric {
    name: string
    score: number
    feedback: string
}

export interface ChatAnalysisRequest {
    messages: ChatMessage[]
    project_title: string
    project_description: string
    client_persona: string
}

export interface ChatAnalysisResponse {
    soft_skills: SkillMetric[]
    technical_skills: SkillMetric[]
    summary: string
    overall_score: number
}

// API BASE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001"

// --- Functions ---

export async function generateSimulation(data: GenerateSimulationRequest): Promise<GenerateSimulationResponse> {
    const res = await fetch("/api/generate-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed to generate: ${res.statusText}`)
    }
    return res.json()
}

export async function postProjectChat(data: ProjectChatRequest): Promise<{ reply: string }> {
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed to chat: ${res.statusText}`)
    }
    return res.json()
}

export async function postCodeReview(data: CodeReviewRequest): Promise<{ feedback: string; approved: boolean }> {
    const url = `${API_BASE_URL}/api/review`
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Failed to review: ${res.statusText}`)
    }
    return res.json()
}

export async function postChatAnalysis(data: ChatAnalysisRequest): Promise<ChatAnalysisResponse> {
    const url = `${API_BASE_URL}/api/analyze-chat`
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Failed to analyze: ${res.statusText}`)
    }
    return res.json()
}
