import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv("backend/.env")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ No API key found")
    exit(1)

genai.configure(api_key=api_key)

print("Listing available models...")
try:
    with open("available_models.txt", "w") as f:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
                f.write(f"{m.name}\n")
    print("✅ Model list saved to available_models.txt")
except Exception as e:
    print(f"❌ Error listing models: {e}")
