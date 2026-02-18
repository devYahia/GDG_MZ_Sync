"use client"

import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectPresenceProps {
  projectId: string
}

export function ProjectPresence({ projectId }: ProjectPresenceProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-1.5 text-xs"
      )}
    >
      <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">
        Collaborative Presence — <span className="text-primary/70">Coming Soon</span>
      </span>
    </div>
  )
}
