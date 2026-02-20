import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/infrastructure/auth/auth"
import { db } from "@/infrastructure/database/drizzle"
import { userIntegrations } from "@/infrastructure/database/schema/integrations"
import { users } from "@/infrastructure/database/schema/users"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as {
      projectTitle?: string
      projectId?: string
      approved?: boolean
      webhook_url?: string
    }
    const { projectTitle, projectId, approved, webhook_url: bodyWebhook } = body

    const userRecord = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    const userName = userRecord[0]?.name || session.user.email || "An intern"

    let webhookUrl = bodyWebhook?.trim()
    if (!webhookUrl?.startsWith("https://")) {
      const integration = await db.select()
        .from(userIntegrations)
        .where(eq(userIntegrations.userId, session.user.id))
        .limit(1)

      webhookUrl = integration[0]?.slackWebhookUrl?.trim()
    }

    if (!webhookUrl?.startsWith("https://")) {
      return NextResponse.json({ sent: false, reason: "No webhook configured. Add webhook_url in request or in Settings." })
    }

    const text = approved
      ? `✅ *${userName}* passed review for *${projectTitle || projectId || "a project"}* (Interna)`
      : `📋 *${userName}* submitted *${projectTitle || projectId || "a project"}* for review (Interna)`

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId);

      if (!res.ok) {
        return NextResponse.json({ error: "Webhook request failed. Non-200 response." }, { status: 502 })
      }
      return NextResponse.json({ sent: true })
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        return NextResponse.json({ error: "Webhook request timed out." }, { status: 504 })
      }
      return NextResponse.json({ error: "Notify failed", details: e.message }, { status: 500 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: "Server error", details: e.message }, { status: 500 })
  }
}
