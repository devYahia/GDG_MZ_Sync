import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { text, voice = "Aoede" } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: text }]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voice
                        }
                    }
                }
            }
        };

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("[TTS API] Gemini Error:", res.status, err);
            return NextResponse.json({ error: "Gemini TTS generation failed" }, { status: res.status });
        }

        const data = await res.json();

        let audioBase64 = null;
        if (data.candidates && data.candidates[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    audioBase64 = part.inlineData.data;
                    break;
                }
            }
        }

        if (!audioBase64) {
            return NextResponse.json({ error: "No audio data returned from Gemini" }, { status: 500 });
        }

        return NextResponse.json({ audioBase64 });

    } catch (error) {
        console.error("[TTS API] Internal Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
