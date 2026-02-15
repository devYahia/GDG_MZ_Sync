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
    <div className="flex h-screen flex-col bg-black text-white selection:bg-purple-500/30">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-white/10 bg-black/80 px-4 backdrop-blur-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <div className="flex-1 truncate text-sm font-medium text-white">
          {task.title}
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60">
          Level L{task.level}
        </span>
      </header>

      {/* Main content — calls API, shows loading, then 3-pane view */}
      <ProjectPageClient task={task} />
    </div>
  )
}
