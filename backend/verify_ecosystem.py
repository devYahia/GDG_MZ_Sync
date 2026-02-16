import asyncio
import os
from dotenv import load_dotenv

# Load env vars
load_dotenv(".env")
load_dotenv("backend/.env")

# Check API Key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found.")
    exit(1)

from backend.llm_service import generate_simulation_content

async def verify_ecosystem():
    print("Generating simulation to verify ecosystem features (Resources & Quiz)...")
    try:
        data = await generate_simulation_content(
            title="E-commerce API",
            context="Build a RESTful API for an e-commerce platform using Python and FastAPI.",
            level="L3"
        )
        
        print(f"\nTitle: {data.title}")
        
        # Verify Resources
        if data.resources and len(data.resources) > 0:
            print(f"✅ Resources generated: {len(data.resources)}")
            for r in data.resources[:2]:
                print(f"  - [{r.type}] {r.title}: {r.url}")
        else:
            print("❌ No resources generated.")

        # Verify Quiz
        if data.quiz and len(data.quiz) > 0:
            print(f"✅ Quiz generated: {len(data.quiz)} questions")
            for q in data.quiz[:2]:
                print(f"  - Q: {q.question}")
        else:
            print("❌ No quiz generated.")

    except Exception as e:
        print(f"❌ Error during generation: {e}")

if __name__ == "__main__":
    asyncio.run(verify_ecosystem())
