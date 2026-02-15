import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getTaskById } from "@/lib/tasks"
import { ProjectPageClient } from "@/components/project/ProjectPageClient"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const task = getTaskById(id)
  if (!task) notFound()

  return (
    <div className="flex h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <div className="flex-1 truncate text-sm font-medium text-foreground">
          {task.title}
        </div>
        <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
          Level L{task.level}
        </span>
      </header>

      {/* Main content — calls API, shows loading, then 3-pane view (sidebar + description/chat + VS Code sandbox) */}
      <ProjectPageClient task={task} />
    </div>
  )
}
