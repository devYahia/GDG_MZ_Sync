"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import { postProjectChat, type ChatMessage, type ChatLanguage } from "@/lib/api"
import type { SimulationTask } from "@/lib/tasks"
import type { SimulationPersona } from "@/lib/api"
import { useProjectWorkspace } from "@/components/project/ProjectWorkspaceContext"
import { cn } from "@/lib/utils"

const WELCOME_EN = "Hi! I'm your client for this project. Ask me anything about the requirements, the challenge, or what I expect. I'll answer as the stakeholder."
const WELCOME_AR = "مرحباً! أنا عميلك في هذا المشروع. اسألني عن المتطلبات أو المهمة أو توقعاتي. سأجيبك بصفة صاحب المصلحة."

interface ProjectChatProps {
  task: SimulationTask
  /** When set, this chat is for one specific persona (separate thread). */
  personaId?: string
  persona?: SimulationPersona | null
  simulation?: { overview?: string; learning_objectives?: string[]; functional_requirements?: string[]; non_functional_requirements?: string[]; milestones?: { title: string; description: string; deliverables: string[] }[]; domain?: string; difficulty?: string; tech_stack?: string[] } | null
  /** Controlled mode: parent owns messages and handles send. */
  messages?: ChatMessage[]
  onSendMessage?: (text: string, codeContext?: string) => Promise<void>
}

export function ProjectChat({ task, personaId, persona, simulation, messages: controlledMessages, onSendMessage }: ProjectChatProps) {
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<ChatLanguage>("en")
  const scrollRef = useRef<HTMLDivElement>(null)
  const { code } = useProjectWorkspace()

  const isControlled = Boolean(personaId && controlledMessages && onSendMessage)
  const messages = (isControlled ? controlledMessages : internalMessages) ?? []

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const welcome = persona?.initial_message ?? (language === "ar" ? WELCOME_AR : WELCOME_EN)

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput("")

    if (isControlled && onSendMessage) {
      setLoading(true)
      try {
        await onSendMessage(text, code ?? undefined)
      } finally {
        setLoading(false)
      }
      return
    }

    const userMsg: ChatMessage = { role: "user", content: text }
    setInternalMessages((prev) => [...prev, userMsg])
    setLoading(true)
    try {
      const res = await postProjectChat({
        project_id: task.id,
        project_title: task.title,
        project_description: task.description,
        client_persona: task.clientPersona,
        client_mood: task.clientMood,
        messages: [...internalMessages, userMsg],
        language,
        level: task.level ?? 1,
        code_context: code?.trim() || undefined,
      })
      setInternalMessages((prev) => [...prev, { role: "assistant", content: res.reply }])
    } catch (e) {
      const err = e instanceof Error ? e.message : "Something went wrong"
      setInternalMessages((prev) => [
        ...prev,
        { role: "assistant", content: `[Error: ${err}. Make sure the backend is running and GEMINI_API_KEY is set.]` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const displayMessages = messages.length === 0
    ? [{ role: "assistant" as const, content: welcome }]
    : messages

  return (
    <div className="flex h-full flex-col">
      {/* Header: Customer (AI) + language toggle */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 py-2.5">
        <span className="text-sm font-semibold text-foreground">
          {persona ? `${persona.name} (${persona.role})` : "Customer (AI)"}
        </span>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              language === "en" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("ar")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              language === "ar" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            عربي
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        <AnimatePresence initial={false}>
          {displayMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-4 py-2.5 text-sm shadow-sm",
                  msg.role === "user"
                    ? "bg-primary/15 text-foreground border border-primary/30"
                    : "bg-card border border-border text-foreground"
                )}
              >
                <div dir={msg.role === "assistant" && language === "ar" ? "rtl" : undefined}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="text-sm leading-relaxed"
                    components={{
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                      h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1 mt-2" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      a: ({ node, ...props }) => <a className="text-primary underline underline-offset-2 hover:text-primary/80" target="_blank" rel="noopener noreferrer" {...props} />,
                      code: ({ node, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <div className="relative rounded-md bg-black/50 p-2 my-2 overflow-x-auto border border-white/10">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </div>
                        ) : (
                          <code className="bg-black/30 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                            {children}
                          </code>
                        )
                      },
                      blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground my-2" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
              <Bot className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground">
              ...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-card/50 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === "ar" ? "اكتب رسالتك..." : "Ask about the challenge or requirements..."}
            className="flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            dir={language === "ar" ? "rtl" : "ltr"}
          />
          <Button type="submit" size="sm" disabled={loading || !input.trim()} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
