from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS Configuration
# Allow requests from the Next.js frontend (default port 3000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Client Initialization
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Simple check to ensure env vars are set, but don't crash immediately on import if missing
# logic can handle it later or use pydantic settings for strict validation
supabase: Client = None
if url and key:
    supabase = create_client(url, key)
else:
    print("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment variables.")

@app.get("/")
async def root():
    return {"message": "FastAPI Backend is running!", "supabase_connected": supabase is not None}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
