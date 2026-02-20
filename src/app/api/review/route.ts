import { NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";
import { getBackendBase } from "@/lib/api-config";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        const backendBase = getBackendBase();
        const url = `${backendBase}/api/review`;

        // 25 second timeout for extensive codebase checks
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: text || "Backend Error" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("[CODE_REVIEW]", error);
        const isTimeout = error.name === 'AbortError';
        const isNetwork = error.message?.includes("fetch") || error.message?.includes("ECONNREFUSED");

        return NextResponse.json(
            { error: isTimeout ? "Code review timed out" : (isNetwork ? "Service Unavailable" : "Internal Error") },
            { status: isTimeout ? 504 : (isNetwork ? 502 : 500) }
        );
    }
}
