const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

export type ChatLanguage = "en" | "ar"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ProjectChatRequest {
  project_id: string
  project_title: string
  project_description: string
  client_persona: string
  client_mood: string
  messages: ChatMessage[]
  language: ChatLanguage
  /** Current code from the IDE so the customer can reference it */
  code_context?: string
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
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Chat failed: ${res.status}`)
  }
  return res.json()
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
