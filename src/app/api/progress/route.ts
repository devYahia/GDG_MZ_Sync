import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/infrastructure/auth/auth"
import { container } from "@/infrastructure/container"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as {
      project_id: string
      status?: string
      last_review_approved?: boolean
    }
    const { project_id, status = "in_progress", last_review_approved } = body
    if (!project_id?.trim()) return NextResponse.json({ error: "Missing project_id" }, { status: 400 })

    await container.progressRepository.upsert({
      userId: session.user.id,
      projectId: project_id.trim(),
      status: status as any,
      lastActivityAt: new Date(),
      ...(last_review_approved !== undefined && {
        lastReviewAt: new Date(),
        lastReviewApproved: last_review_approved,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Progress update failed" }, { status: 500 })
  }
}
