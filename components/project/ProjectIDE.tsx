"use client"

import { useState, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { Play, Loader2, CheckCircle, XCircle, Terminal, FileCode, ChevronUp, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { postCodeReview, type ChatLanguage } from "@/lib/api"
import type { SimulationTask } from "@/lib/tasks"
import { useProjectWorkspace } from "@/components/project/ProjectWorkspaceContext"
import { ProjectIDEToolbar } from "./ProjectIDEToolbar"
import { IDEFileTree } from "./IDEFileTree"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-card text-muted-foreground text-sm">
      Loading editor…
    </div>
  ),
})

interface ProjectIDEProps {
  task: SimulationTask
}

export function ProjectIDE({ task }: ProjectIDEProps) {
  const {
    files,
    activeFileId,
    setFileContent,
    setActiveFileId,
    addFile,
    removeFile,
    code,
    setCode,
    getPrimaryCode,
  } = useProjectWorkspace()

  const [reviewLoading, setReviewLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [approved, setApproved] = useState<boolean | null>(null)
  const [language] = useState<ChatLanguage>("en")
  const [notifyOnSubmit, setNotifyOnSubmit] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [output, setOutput] = useState<string>("")
  const [runLoading, setRunLoading] = useState(false)
  const [outputOpen, setOutputOpen] = useState(true)
  const outputRef = useRef<HTMLPreElement>(null)
  const { resolvedTheme } = useTheme()

  const handleReview = useCallback(async () => {
    setReviewLoading(true)
    setFeedback(null)
    setApproved(null)
    const codeToReview = getPrimaryCode()
    try {
      const res = await postCodeReview({
        project_id: task.id,
        project_title: task.title,
        project_description: task.description,
        code: codeToReview,
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
  }, [task, getPrimaryCode, language, notifyOnSubmit, webhookUrl])

  const handleRun = useCallback(() => {
    setRunLoading(true)
    setOutput("")
    const codeToRun = getPrimaryCode()
    try {
      const __logs: string[] = []
      const __console = {
        log: (...a: unknown[]) =>
          __logs.push(a.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(" ")),
        warn: (...a: unknown[]) => __logs.push("[warn] " + a.map(String).join(" ")),
        error: (...a: unknown[]) => __logs.push("[error] " + a.map(String).join(" ")),
      }
      const wrapped = `(function(console) { ${codeToRun} })(__console)`
      const fn = new Function("__console", "__logs", wrapped)
      fn(__console, __logs)
      setOutput(__logs.length ? __logs.join("\n") : "(no output)")
    } catch (e) {
      setOutput(`Compile/run error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setRunLoading(false)
    }
  }, [getPrimaryCode])

  const handleAddFile = useCallback(() => {
    const base = "src"
    const fileMap = files ?? {}
    const existing = Object.keys(fileMap).filter((p) => String(p).startsWith(`${base}/`))
    let name = "script.js"
    let i = 0
    while (existing.some((p) => p === `${base}/${name}`)) {
      i++
      name = `script${i}.js`
    }
    addFile(`${base}/${name}`)
  }, [files, addFile])

  const filePaths = Object.keys(files)
  const canRemove = filePaths.length > 1

  return (
    <div className="flex h-full flex-col">
      <ProjectIDEToolbar
        projectTitle={task.title}
        code={getPrimaryCode()}
        files={Object.keys(files).length > 1 ? files : undefined}
        notifyOnSubmit={notifyOnSubmit}
        setNotifyOnSubmit={setNotifyOnSubmit}
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
      />

      <div className="flex flex-1 min-h-0 border-t border-border">
        {/* Left: File tree (Explorer) */}
        <div className="w-48 shrink-0 border-r border-border flex flex-col">
          <IDEFileTree
            files={files}
            activeFileId={activeFileId}
            onSelectFile={setActiveFileId}
            onAddFile={handleAddFile}
            onRemoveFile={(path) => canRemove && removeFile(path)}
          />
        </div>

        {/* Center: Editor + header */}
        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/50 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground truncate">{activeFileId}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                onClick={handleRun}
                disabled={runLoading}
              >
                {runLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Run
              </Button>
              <Button
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handleReview}
                disabled={reviewLoading}
              >
                {reviewLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                Request AI review
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <MonacoEditor
              key={activeFileId}
              height="100%"
              defaultLanguage="javascript"
              value={files[activeFileId] ?? ""}
              onChange={(v) => setFileContent(activeFileId, v ?? "")}
              theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
              options={{
                minimap: { enabled: true },
                fontSize: 13,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom: Output / Terminal panel */}
      <div className="shrink-0 border-t border-border bg-card">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-foreground hover:bg-muted border-b border-border"
          onClick={() => setOutputOpen((o) => !o)}
        >
          <span className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Output
          </span>
          {outputOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        {outputOpen && (
          <pre
            ref={outputRef}
            className="p-4 text-xs text-emerald-600 dark:text-emerald-400 font-mono overflow-auto max-h-40 min-h-20 whitespace-pre-wrap"
          >
            {output || "Run your code to see output here."}
          </pre>
        )}
      </div>

      {/* Review feedback panel (unchanged) */}
      {feedback !== null && (
        <div
          className={`shrink-0 border-t p-4 max-h-48 overflow-y-auto ${approved === true
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
