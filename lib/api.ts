const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001"

export type ChatLanguage = "en" | "ar"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

/** One persona for role-play; each has its own chat. */
export interface PersonaChatInfo {
  name: string
  role: string
  personality: string
  system_prompt: string
  initial_message: string
}

/** Full project context so the client can answer in detail. */
export interface SimulationContextForChat {
  overview?: string
  learning_objectives?: string[]
  functional_requirements?: string[]
  non_functional_requirements?: string[]
  milestones?: { title: string; description: string; deliverables: string[] }[]
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
  /** When chatting with a specific generated persona (separate chat per persona) */
  persona?: PersonaChatInfo
  simulation_context?: SimulationContextForChat
}

export interface ProjectChatResponse {
  reply: string
}

export interface CodeReviewRequest {
  project_id: string
  project_title: string
  project_description: string
  code: string
  language: string
  language_hint?: ChatLanguage
}

export interface CodeReviewResponse {
  feedback: string
  approved: boolean
}

export async function postProjectChat(body: ProjectChatRequest): Promise<ProjectChatResponse> {
  // Use same-origin API route to avoid CORS preflight (OPTIONS 400) when calling backend
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err =
      (data && typeof data.error === "string" ? data.error : null) ||
      `Chat failed: ${res.status}`
    throw new Error(err)
  }
  return data as ProjectChatResponse
}

export async function postCodeReview(body: CodeReviewRequest): Promise<CodeReviewResponse> {
  const res = await fetch(`${API_BASE}/api/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Review failed: ${res.status}`)
  }
  return res.json()
}

// ── Simulation Generation ──────────────────────────────────

export interface SimulationMilestone {
  title: string
  description: string
  deliverables: string[]
}

export interface SimulationPersona {
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

export interface SimulationData {
  title: string
  domain: string
  difficulty: string
  estimated_duration: string
  tech_stack: string[]
  overview: string
  learning_objectives: string[]
  functional_requirements: string[]
  non_functional_requirements: string[]
  milestones: SimulationMilestone[]
  personas: SimulationPersona[]
  team: SimulationPersona[]
  resources: Resource[]
  quiz: QuizQuestion[]
}

export interface GenerateSimulationRequest {
  title: string
  context: string
  level: string // e.g. "L3"
  team_mode?: "solo" | "group"
}

export interface GenerateSimulationResponse {
  simulation_id: string
  title: string
  simulation_data: SimulationData
}

export async function generateSimulation(body: GenerateSimulationRequest): Promise<GenerateSimulationResponse> {
  // Use same-origin API route so the browser never hits the backend directly (avoids CORS and "Failed to fetch")
  const res = await fetch("/api/generate-simulation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err =
      (data && typeof data.error === "string" ? data.error : null) ||
      `Simulation generation failed: ${res.status}`
    throw new Error(err)
  }
  return data as GenerateSimulationResponse
}

// ── Chat Analysis ──────────────────────────────────────────

export interface SkillMetric {
  name: string
  score: number // 0-100
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

export async function postChatAnalysis(body: ChatAnalysisRequest): Promise<ChatAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/analyze-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Analysis failed: ${res.status}`)
  }
  return res.json()
}
