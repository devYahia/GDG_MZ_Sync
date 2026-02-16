import { NextResponse } from "next/server"

const getBackendBase = () => {
  const url = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://127.0.0.1:8001"
  return url.replace(/\/+$/, "")
}

export async function POST(request: Request) {
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
