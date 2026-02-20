import { NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        // Return the WebSocket URL with the API key
        // In a production environment with Google Cloud, it would be better to use OAuth tokens
        // and google-auth-library, but since we are using GEMINI_API_KEY, we pass it securely
        // to the client just for this session so they can establish the WSS connection.

        // Note: For maximum security in the future, we should use Vertex AI with Service Accounts 
        // to generate short-lived GCP tokens instead of passing the AI Studio API key.
        const host = "generativelanguage.googleapis.com";
        const model = "models/gemini-2.0-flash"; // Supported model for Live API
        const wsUrl = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

        return NextResponse.json({
            wsUrl,
            model
        });

    } catch (error) {
        console.error("[LIVE_TOKEN]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
