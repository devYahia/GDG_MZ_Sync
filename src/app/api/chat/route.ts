import { NextResponse } from "next/server"
import { auth } from "@/infrastructure/auth/auth"

import { getBackendBase } from "@/lib/api-config"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const backendBase = getBackendBase()
  const url = `${backendBase}/api/chat`

  try {
    const body = await request.json()
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    if (!res.ok) {
      return NextResponse.json(
        { error: text || `Backend returned ${res.status}` },
        { status: res.status }
      )
    }
    return NextResponse.json(JSON.parse(text))
  } catch (err) {
    const message = String(err instanceof Error ? err.message : err ?? "Unknown error")
    const isNetwork =
      message.includes("fetch") ||
      message.includes("ECONNREFUSED") ||
      message.includes("Failed to fetch")
    return NextResponse.json(
      {
        error: isNetwork
          ? "Backend not reachable. Start the API with: cd backend && uvicorn main:app --reload"
          : message,
      },
      { status: 502 }
    )
  }
}
