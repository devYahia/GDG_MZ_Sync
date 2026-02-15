import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getTaskById } from "@/lib/tasks"
import { ProjectView } from "@/components/project/ProjectView"

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
    <div className="flex h-screen flex-col bg-background text-foreground selection:bg-primary/30 min-h-screen">
      {/* Top bar: back + project title + level */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card/90 px-4 backdrop-blur-md shadow-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            Left: AI customer chat · Right: Code sandbox & AI review
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          Level {task.level}
        </span>
      </header>

      {/* Split: Left = AI customer chat | Right = IDE sandbox (code + AI review) */}
      <ProjectView task={task} />
    </div>
  )
}
