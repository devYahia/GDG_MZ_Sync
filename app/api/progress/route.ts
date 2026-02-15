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
      project_id: string
      status?: string
      last_review_approved?: boolean
    }
    const { project_id, status = "in_progress", last_review_approved } = body
    if (!project_id?.trim()) return NextResponse.json({ error: "Missing project_id" }, { status: 400 })

    await supabase.from("intern_progress").upsert(
      {
        user_id: user.id,
        project_id: project_id.trim(),
        status,
        last_activity_at: new Date().toISOString(),
        ...(last_review_approved !== undefined && {
          last_review_at: new Date().toISOString(),
          last_review_approved,
        }),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,project_id" }
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Progress update failed" }, { status: 500 })
  }
}
