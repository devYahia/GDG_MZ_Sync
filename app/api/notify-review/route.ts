import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json().catch(() => ({})) as {
      projectTitle?: string
      projectId?: string
      approved?: boolean
      webhook_url?: string
    }
    const { projectTitle, projectId, approved, webhook_url: bodyWebhook } = body

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    const userName = (profile?.full_name as string) || user.email || "An intern"

    let webhookUrl = bodyWebhook?.trim()
    if (!webhookUrl?.startsWith("https://")) {
      const { data: integration } = await supabase
        .from("user_integrations")
        .select("slack_webhook_url")
        .eq("user_id", user.id)
        .maybeSingle()
      webhookUrl = (integration?.slack_webhook_url as string)?.trim()
    }
    if (!webhookUrl?.startsWith("https://")) {
      return NextResponse.json({ sent: false, reason: "No webhook configured. Add webhook_url in request or in Settings." })
    }

    const text = approved
      ? `✅ *${userName}* passed review for *${projectTitle || projectId || "a project"}* (Interna)`
      : `📋 *${userName}* submitted *${projectTitle || projectId || "a project"}* for review (Interna)`

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Webhook request failed" }, { status: 502 })
    }
    return NextResponse.json({ sent: true })
  } catch (e) {
    return NextResponse.json({ error: "Notify failed" }, { status: 500 })
  }
}
