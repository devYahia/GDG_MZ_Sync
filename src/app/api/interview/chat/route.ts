import { NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";
import { getBackendBase } from "@/lib/api-config";
import { z } from "zod";

const chatSchema = z.object({
    sessionId: z.string().uuid(),
    messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
    })),
    jobDescription: z.string().default("Senior Software Engineer"),
    language: z.enum(["en", "ar"]).default("en"),
    codeSnapshot: z.string().optional()
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsed = chatSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
        }

        const backendBase = getBackendBase();
        const url = `${backendBase}/api/interview/chat`;

        // 15 seconds timeout for LLM streaming response initiation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const payload = {
            messages: parsed.data.messages,
            job_description: parsed.data.jobDescription,
            language: parsed.data.language,
        };

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: text || "Backend Error" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data); // Using JSON instead of raw stream for simple connection since frontend is mocked

    } catch (error: any) {
        console.error("[INTERVIEW_CHAT]", error);
        const isTimeout = error.name === 'AbortError';
        const isNetwork = error.message?.includes("fetch") || error.message?.includes("ECONNREFUSED");

        return NextResponse.json(
            { error: isTimeout ? "AI response timed out" : (isNetwork ? "Service Unavailable" : "Internal Error") },
            { status: isTimeout ? 504 : (isNetwork ? 502 : 500) }
        );
    }
}
