import { NextResponse } from "next/server"

// Base URL of the FastAPI backend (no trailing slash). Set NEXT_PUBLIC_API_URL in .env.local if needed.
const getBackendBase = () => {
  const url = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://127.0.0.1:8000"
  return url.replace(/\/+$/, "")
}

export async function POST(request: Request) {
  const backendBase = getBackendBase()
  const url = `${backendBase}/generate-simulation`

  console.log(`[API Route] Backend URL: ${url}`)

  try {
    const body = await request.json()
    console.log(`[API Route] Request body:`, body)

    console.log(`[API Route] Sending request to backend...`)
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
