import { NextResponse } from "next/server"

import { getBackendBase } from "@/lib/api-config"

import { auth } from "@/infrastructure/auth/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const backendBase = getBackendBase()
  const url = `${backendBase}/generate-simulation`

  console.log(`[API Route] Backend URL: ${url}`)

  try {
    const body = await request.json()
    console.log(`[API Route] Request body:`, body)

    // Inject user_id
    const payload = { ...body, user_id: session.user.id }

    console.log(`[API Route] Sending request to backend...`)
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    console.log(`[API Route] Backend response status: ${res.status}`)

    const text = await res.text()
    console.log(`[API Route] Backend response length: ${text.length} characters`)

    if (!res.ok) {
      const hint =
        res.status === 404
          ? `Backend returned 404. Ensure the FastAPI server is running (cd backend && uvicorn main:app --reload) and reachable at ${backendBase}.`
          : text || `Backend returned ${res.status}`
      console.error(`[API Route] Backend error:`, hint)
      return NextResponse.json(
        { error: hint },
        { status: res.status }
      )
    }

    console.log(`[API Route] Successful response from backend`)
    return NextResponse.json(JSON.parse(text))
  } catch (err) {
    const message = String(err instanceof Error ? err.message : err ?? "Unknown error")
    const isNetwork =
      message.includes("fetch") ||
      message.includes("ECONNREFUSED") ||
      message.includes("Failed to fetch")

    console.error(`[API Route] Error:`, message)
    console.error(`[API Route] Full error:`, err)

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
