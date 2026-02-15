"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { Play, Loader2, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { postCodeReview, type ChatLanguage } from "@/lib/api"
import type { SimulationTask } from "@/lib/tasks"
import { useProjectWorkspace } from "@/components/project/ProjectWorkspaceContext"
import { ProjectIDEToolbar } from "./ProjectIDEToolbar"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-white/50 text-sm">
      Loading editor…
    </div>
  ),
})

interface ProjectIDEProps {
  task: SimulationTask
}

export function ProjectIDE({ task }: ProjectIDEProps) {
  const { code, setCode } = useProjectWorkspace()
  const [reviewLoading, setReviewLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [approved, setApproved] = useState<boolean | null>(null)
  const [language] = useState<ChatLanguage>("en")
  const [notifyOnSubmit, setNotifyOnSubmit] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")

  const handleReview = useCallback(async () => {
    setReviewLoading(true)
    setFeedback(null)
    setApproved(null)
    try {
      const res = await postCodeReview({
        project_id: task.id,
        project_title: task.title,
        project_description: task.description,
        code,
        language: "javascript",
        language_hint: language,
      })
      setFeedback(res.feedback)
      setApproved(res.approved)

      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: task.id,
            status: res.approved ? "approved" : "in_progress",
            last_review_approved: res.approved,
          }),
        })
      } catch {
        // ignore
      }

      if (notifyOnSubmit) {
        try {
          await fetch("/api/notify-review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectTitle: task.title,
              projectId: task.id,
              approved: res.approved,
              ...(webhookUrl.trim() && { webhook_url: webhookUrl.trim() }),
            }),
          })
        } catch {
          // ignore
        }
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : "Request failed"
      setFeedback(`Error: ${err}. Is the backend running with GEMINI_API_KEY?`)
      setApproved(false)
    } finally {
      setReviewLoading(false)
    }
  }, [task, code, language, notifyOnSubmit, webhookUrl])

  return (
    <div className="flex h-full flex-col">
      <ProjectIDEToolbar
        projectTitle={task.title}
        code={code}
        notifyOnSubmit={notifyOnSubmit}
        setNotifyOnSubmit={setNotifyOnSubmit}
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
      />
      {/* IDE header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 py-2.5">
        <span className="text-sm font-semibold text-foreground">Code sandbox</span>
        <Button
          size="sm"
          onClick={handleReview}
          disabled={reviewLoading}
          className="gap-2 rounded-xl"
        >
          {reviewLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Request AI review
        </Button>
      </div>

      {/* Monaco editor */}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={(v) => setCode(v ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            padding: { top: 12 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Review feedback panel */}
      {feedback !== null && (
        <div
          className={`shrink-0 border-t p-4 max-h-48 overflow-y-auto ${
            approved === true
              ? "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15"
              : "border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {approved === true ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-sm font-semibold text-foreground">
              {approved === true ? "Review passed" : "Review feedback"}
            </span>
          </div>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{feedback}</p>
        </div>
      )}
    </div>
  )
}
