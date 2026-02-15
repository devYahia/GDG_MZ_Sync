import { NextResponse } from "next/server"

// Base URL of the FastAPI backend (no trailing slash). Set NEXT_PUBLIC_API_URL in .env.local if needed.
const getBackendBase = () => {
  const url = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://127.0.0.1:8000"
  return url.replace(/\/+$/, "")
}

export async function POST(request: Request) {
  const backendBase = getBackendBase()
  const url = `${backendBase}/generate-simulation`

  try {
    const body = await request.json()
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    if (!res.ok) {
      const hint =
        res.status === 404
          ? `Backend returned 404. Ensure the FastAPI server is running (cd backend && uvicorn main:app --reload) and reachable at ${backendBase}.`
          : text || `Backend returned ${res.status}`
      return NextResponse.json(
        { error: hint },
        { status: res.status }
      )
    }
    return NextResponse.json(JSON.parse(text))
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
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
