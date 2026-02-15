"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface ProjectPresenceProps {
  projectId: string
}

type PresenceState = { user_id: string; user_name: string }[]

export function ProjectPresence({ projectId }: ProjectPresenceProps) {
  const [presence, setPresence] = useState<PresenceState>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!mounted || !projectId) return
    const supabase = createClient()
    const channel = supabase.channel(`project:${projectId}`, {
      config: { presence: { key: projectId } },
    })

    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      setCurrentUserId(user.id)
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()
      return { user_id: user.id, user_name: (profile?.full_name as string) || user.email || "Anonymous" }
    }

    let current: { user_id: string; user_name: string } | null = null

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const presences = (state[projectId] ?? []) as { user_id: string; user_name: string }[]
        const unique = presences.filter((p, i, a) => a.findIndex(x => x.user_id === p.user_id) === i)
        setPresence(unique)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          current = await getCurrentUser()
          if (current) await channel.track(current)
        }
      })

    return () => {
      if (current) channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [mounted, projectId])

  if (!mounted || presence.length === 0) return null

  const others = currentUserId ? presence.filter(p => p.user_id !== currentUserId) : presence
  const count = presence.length

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-1.5 text-xs",
        count > 1 && "text-primary"
      )}
    >
      <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">
        {count === 1
          ? "Only you here"
          : others.length > 0
            ? `${count} active — ${others.map(p => p.user_name).join(", ")}`
            : "Only you here"}
      </span>
    </div>
  )
}
