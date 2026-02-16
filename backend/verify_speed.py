
import asyncio
import time
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

# Load environment variables
load_dotenv(backend_dir / ".env")

try:
    from llm_service import generate_simulation_content
except ImportError as e:
    print(f"Error importing llm_service: {e}")
    sys.exit(1)

async def measure_speed():
    print("Starting simulation generation speed test...")
    start_time = time.time()
    
    title = "E-commerce Recommendation System"
    context = "I am a student learning machine learning."
    level = "Intermediate"
    
    try:
        result = await generate_simulation_content(title, context, level)
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"\n✅ Generation successful!")
        print(f"Time taken: {duration:.2f} seconds")
        print(f"Project Title: {result.title}")
        print(f"Personas count: {len(result.personas)}")
        print(f"Milestones count: {len(result.milestones)}")
        
    except Exception as e:
        print(f"\n❌ Generation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ GEMINI_API_KEY not found in environment.")
        sys.exit(1)
        
    asyncio.run(measure_speed())
