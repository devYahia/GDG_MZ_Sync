import os
import shutil
import subprocess
import tempfile
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, field_validator
from typing import Optional, Dict

app = FastAPI(title="GitHub Repo Extractor API")

# --- Enable CORS for Frontend Interaction ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
MAX_FILE_SIZE = 1 * 1024 * 1024  # 1MB per file (optimized for browser display)
MAX_FILES = 150                 # Reduced slightly for snappier UI
CLONE_TIMEOUT = 60

class RepoRequest(BaseModel):
    github_url: str
    access_token: Optional[str] = None
    branch: Optional[str] = "main"

    @field_validator('github_url')
    @classmethod
    def validate_url(cls, v: str):
        if "github.com" not in v:
            raise ValueError("Must be a valid GitHub URL")
        return v.strip().rstrip('/')

def clone_and_read_logic(github_url: str, branch: str, access_token: str = None) -> Dict[str, str]:
    temp_root = tempfile.mkdtemp()
    repo_data = {}

    try:
        repo_path = os.path.join(temp_root, "repo")
        
        # 1. Token Cleaning
        clean_token = None
        if access_token and str(access_token).strip().lower() not in ["", "none", "null"]:
            clean_token = access_token.strip()

        # 2. Setup Clone Command
        clone_cmd = ["git", "clone", "--depth", "1", "--single-branch", "--branch", branch]
        if clean_token:
            clone_cmd.extend(["-c", f"http.extraheader=AUTHORIZATION: bearer {clean_token}"])
        clone_cmd.extend([github_url, repo_path])

        # 3. Execution & Retry Logic
        result = subprocess.run(clone_cmd, capture_output=True, text=True, timeout=CLONE_TIMEOUT)

        if result.returncode != 0 and clean_token:
            # Fallback for public repos if token is invalid
            shutil.rmtree(repo_path, ignore_errors=True)
            retry_cmd = ["git", "clone", "--depth", "1", github_url, repo_path]
            result = subprocess.run(retry_cmd, capture_output=True, text=True, timeout=CLONE_TIMEOUT)

        if result.returncode != 0:
            err = result.stderr.replace(clean_token, "****") if clean_token else result.stderr
            raise HTTPException(status_code=400, detail=f"Git Error: {err}")

        # 4. File Extraction Loop
        count = 0
        for root, dirs, files in os.walk(repo_path):
            if '.git' in dirs: dirs.remove('.git')

            for file in files:
                if count >= MAX_FILES: break
                
                f_path = os.path.join(root, file)
                try:
                    if os.path.getsize(f_path) <= MAX_FILE_SIZE:
                        with open(f_path, "r", encoding="utf-8") as f:
                            # rel_path is the key used in the frontend list
                            rel_path = os.path.relpath(f_path, repo_path)
                            repo_data[rel_path] = f.read()
                            count += 1
                except (UnicodeDecodeError, PermissionError):
                    continue # Ignore binary files

        return repo_data

    finally:
        shutil.rmtree(temp_root, ignore_errors=True)

@app.post("/extract")
async def extract_repo(request: RepoRequest):
    # Offload the heavy work to the threadpool
    files = await run_in_threadpool(
        clone_and_read_logic, 
        request.github_url, 
        request.branch, 
        request.access_token
    )
    
    if not files:
        raise HTTPException(
            status_code=400, 
            detail="Connected, but no readable components found in this repository."
        )

    # Return a clear signal for your application logic
    return {
        "connected": True,  # This is your signal
        "status": "success",
        "message": "Repository components extracted successfully",
        "file_count": len(files),
        "files": files
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)