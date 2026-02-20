import os
import json
import httpx
import asyncio

async def test():
    key = os.getenv("GEMINI_API_KEY").strip('"')
    url = f"https://generativelanguage.googleapis.com/v1alpha/models/gemini-2.0-flash-exp:generateContent?key={key}"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": "Hello, answer in 5 words."}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": "Aoede"
                    }
                }
            }
        }
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload, timeout=20.0)
        data = res.json()
        if "candidates" in data:
            parts = data["candidates"][0]["content"]["parts"]
            for p in parts:
                if "inlineData" in p:
                    print("Found Audio Data! Length:", len(p["inlineData"]["data"]))
                if "text" in p: print("Found Text:", p["text"])
        else:
            print(json.dumps(data, indent=2))

asyncio.run(test())
