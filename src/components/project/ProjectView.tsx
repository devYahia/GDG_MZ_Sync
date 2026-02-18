"use client"

import { useState, useCallback, useEffect } from "react"
import { GripVertical } from "lucide-react"
import type { SimulationTask } from "@/lib/tasks"
import { ProjectWorkspaceProvider } from "./ProjectWorkspaceContext"
import { ProjectChat } from "./ProjectChat"
import { ProjectIDE } from "./ProjectIDE"
import { ProjectPresence } from "./ProjectPresence"
import { cn } from "@/lib/utils"

const DEFAULT_CODE = `// Implement your solution here.
// The customer (AI) can see this code when you chat — ask for feedback on specific parts.
`

const MIN_PANE_PERCENT = 25
const MAX_PANE_PERCENT = 75
const DEFAULT_CHAT_PERCENT = 50

function useReportProgress(projectId: string) {
  useEffect(() => {
    if (!projectId) return
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, status: "in_progress" }),
    }).catch(() => {})
  }, [projectId])
}

interface ProjectViewProps {
  task: SimulationTask
}

export function ProjectView({ task }: ProjectViewProps) {
  const [chatPercent, setChatPercent] = useState(DEFAULT_CHAT_PERCENT)
  const [isDragging, setIsDragging] = useState(false)
  useReportProgress(task.id)

  const handleMove = useCallback(
    (e: MouseEvent) => {
      const total = window.innerWidth
      const percent = (e.clientX / total) * 100
      setChatPercent(Math.max(MIN_PANE_PERCENT, Math.min(MAX_PANE_PERCENT, percent)))
    },
    []
  )

  const handleUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (!isDragging) return
    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)
    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [isDragging, handleMove, handleUp])

  return (
    <ProjectWorkspaceProvider initialCode={DEFAULT_CODE}>
      <div className="flex flex-1 min-h-0 bg-background text-foreground">
        {/* Left half: AI Customer Chat — ask about the challenge / task */}
        <div
          className="flex shrink-0 flex-col min-h-0 border-r border-border bg-card/30"
          style={{ width: `${chatPercent}%` }}
        >
          <ProjectPresence projectId={task.id} />
          <ProjectChat task={task} />
        </div>

        {/* Resizable divider */}
        <button
          type="button"
          aria-label="Resize panels"
          onMouseDown={() => setIsDragging(true)}
          className={cn(
            "shrink-0 w-2 flex items-center justify-center bg-border hover:bg-primary/40 transition-colors cursor-col-resize select-none",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ring-inset",
            isDragging && "bg-primary/50"
          )}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Right half: IDE Sandbox — implement code, reviewed by AI */}
        <div
          className="flex flex-1 flex-col min-w-0 min-h-0 bg-card/20"
          style={{ width: `${100 - chatPercent}%` }}
        >
          <ProjectIDE task={task} />
        </div>
      </div>
    </ProjectWorkspaceProvider>
  )
}
