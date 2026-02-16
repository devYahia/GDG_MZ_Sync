"""
Code Review Agent — FastAPI + SSE + LangChain + Daytona
--------------------------------------------------------
Streams live step-by-step progress to the frontend via Server-Sent Events.

Endpoints:
  POST /review          → starts a review, returns { job_id }
  GET  /review/{job_id} → SSE stream of events until report is done

Event types sent to frontend:
  { "type": "step",    "message": "Cloning repository..." }
  { "type": "file",    "message": "Reading /home/user/repo/main.py" }
  { "type": "execute", "message": "Executing /home/user/repo/main.py → SUCCESS" }
  { "type": "lint",    "message": "Linting /home/user/repo/main.py" }
  { "type": "report",  "data":    "<full markdown report string>" }
  { "type": "error",   "message": "Something went wrong..." }
  { "type": "done",    "message": "Review complete" }

Run:
    uvicorn api:app --reload --port 8000

Requirements:
    pip install daytona langchain langchain-google-genai fastapi uvicorn python-dotenv sse-starlette
"""

import os
import sys
import json
import asyncio
import uuid
import re
from datetime import datetime
from typing import AsyncIterator
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from daytona import Daytona, DaytonaConfig, CreateSandboxBaseParams
from langchain.tools import tool
from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# ─────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────
DAYTONA_API_KEY   = os.getenv("DAYTONA_API_KEY", "")
GOOGLE_API_KEY    = os.getenv("GOOGLE_API_KEY", "")
MODEL             = "gemini-3-pro-preview"

SUPPORTED_EXTENSIONS = {
    ".py":   "python",
    ".js":   "javascript",
    ".ts":   "typescript",
    ".go":   "go",
    ".rb":   "ruby",
    ".sh":   "bash",
    ".java": "java",
    ".rs":   "rust",
    ".cpp":  "cpp",
    ".c":    "c",
}

SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv",
    "venv", "dist", "build", ".mypy_cache", ".pytest_cache",
}

# ─────────────────────────────────────────────────────────────────
# In-memory job store  { job_id: asyncio.Queue }
# ─────────────────────────────────────────────────────────────────
jobs: dict[str, asyncio.Queue] = {}

# ─────────────────────────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────────────────────────
app = FastAPI(title="Code Review Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────
# Request / Response schemas
# ─────────────────────────────────────────────────────────────────
class ReviewRequest(BaseModel):
    repo_url: str

class ReviewResponse(BaseModel):
    job_id: str
    stream_url: str


# ─────────────────────────────────────────────────────────────────
# Agent runner  (runs in a background thread via asyncio.to_thread)
# ─────────────────────────────────────────────────────────────────
def run_review_sync(repo_url: str, queue: asyncio.Queue, loop: asyncio.AbstractEventLoop):
    """
    Synchronous agent runner. Emits events into the asyncio queue
    so the SSE endpoint can stream them to the frontend.
    """

    def emit(event_type: str, message: str = "", data: str = ""):
        payload = {"type": event_type, "message": message, "data": data}
        asyncio.run_coroutine_threadsafe(queue.put(payload), loop)

    # ── Sandbox singleton (per-job) ───────────────────────────────
    daytona_client = None
    sandbox        = None

    def get_sandbox():
        nonlocal daytona_client, sandbox
        if sandbox is None:
            emit("step", "🏗  Creating Daytona sandbox...")
            daytona_client = Daytona(DaytonaConfig(api_key=DAYTONA_API_KEY))
            sandbox = daytona_client.create(CreateSandboxBaseParams(language="python"))
            emit("step", f"✅ Sandbox ready (id={sandbox.id})")
        return sandbox

    def delete_sandbox():
        nonlocal daytona_client, sandbox
        if sandbox and daytona_client:
            emit("step", "🧹 Cleaning up sandbox...")
            daytona_client.delete(sandbox)
            sandbox = None
            emit("step", "✅ Sandbox deleted")

    # ── Tools (defined inside runner so they share sandbox + queue) ──

    @tool
    def clone_repo(github_url: str) -> str:
        """Clone a GitHub repository into the Daytona sandbox using the SDK git API."""
        sb = get_sandbox()
        emit("step", f"📥 Cloning {github_url}...")
        try:
            # Use Daytona's built-in git API — resolves relative to sandbox working dir
            sb.git.clone(github_url, "repo")
            ls = sb.process.exec("ls repo")
            emit("step", "✅ Repository cloned successfully")
            return f"Cloned successfully. Contents:\n{ls.result}"
        except Exception as e:
            emit("error", f"Clone failed: {str(e)[:200]}")
            return f"CLONE FAILED:\n{str(e)}"

    @tool
    def list_source_files(directory: str = "repo") -> str:
        """Recursively list all source code files. Returns JSON array [{path, language}]."""
        sb = get_sandbox()
        emit("step", "📂 Discovering source files...")
        script = f"""
import os, json
skip_dirs  = {json.dumps(list(SKIP_DIRS))}
extensions = {json.dumps({k: v for k, v in SUPPORTED_EXTENSIONS.items()})}
files = []
for root, dirs, filenames in os.walk("{directory}"):
    dirs[:] = [d for d in dirs if d not in skip_dirs and not d.startswith(".")]
    for fn in filenames:
        ext = os.path.splitext(fn)[1]
        if ext in extensions:
            files.append({{"path": os.path.join(root, fn), "language": extensions[ext]}})
print(json.dumps(files))
"""
        result = sb.process.code_run(script)
        if result.exit_code != 0:
            return f"FAILED:\n{result.result}"
        files = json.loads(result.result.strip())
        emit("step", f"📂 Found {len(files)} source file(s)")
        for f in files:
            emit("file", f"  • {f['path']}  [{f['language']}]")
        return result.result.strip()

    @tool
    def read_file_code(file_path: str) -> str:
        """Read and return the source code of a file from the sandbox."""
        sb = get_sandbox()
        emit("file", f"📖 Reading {file_path}")
        try:
            return sb.fs.download_file(file_path).decode("utf-8", errors="replace")
        except Exception as e:
            return f"ERROR reading {file_path}: {e}"

    @tool
    def execute_file(file_path: str, language: str) -> str:
        """Execute a source file in the sandbox. Supports python, javascript, typescript, bash, ruby, go."""
        sb = get_sandbox()
        runners = {
            "python":     f"python {file_path}",
            "javascript": f"node {file_path}",
            "typescript": f"npx ts-node {file_path}",
            "bash":       f"bash {file_path}",
            "ruby":       f"ruby {file_path}",
            "go":         f"go run {file_path}",
        }
        cmd = runners.get(language)
        if not cmd:
            return f"Execution not supported for: {language}"
        emit("execute", f"⚙️  Executing {file_path}")
        result = sb.process.exec(f"{cmd} 2>&1", timeout=30)
        status = "SUCCESS" if result.exit_code == 0 else f"FAILED (exit_code={result.exit_code})"
        emit("execute", f"  → {file_path}  [{status}]")
        return f"[{status}]\n{result.result.strip() or '(no output)'}"

    @tool
    def run_linter(file_path: str, language: str) -> str:
        """Run pylint + flake8 (Python) or eslint (JS/TS) on a file."""
        sb = get_sandbox()
        emit("lint", f"🔍 Linting {file_path}")
        if language == "python":
            sb.process.exec("pip install -q pylint flake8", timeout=60)
            pylint = sb.process.exec(f"pylint --score=yes {file_path} 2>&1", timeout=30)
            flake8 = sb.process.exec(f"flake8 {file_path} 2>&1", timeout=30)
            return (
                f"=== pylint ===\n{pylint.result.strip()}\n\n"
                f"=== flake8 ===\n{flake8.result.strip() or 'No issues found.'}"
            )
        elif language in ("javascript", "typescript"):
            result = sb.process.exec(f"npx eslint {file_path} 2>&1", timeout=30)
            return result.result.strip() or "No ESLint issues found."
        return f"No linter configured for: {language}"

    @tool
    def write_report(content: str, output_path: str = "/tmp/code_review_report.md") -> str:
        """Write the final Markdown report. Saves locally and emits the content to the frontend."""
        sb = get_sandbox()
        emit("step", "📝 Writing final report...")
        sb.fs.upload_file(content.encode(), output_path)

        # Save locally
        with open("code_review_report.md", "w", encoding="utf-8") as f:
            f.write(content)

        # Send the full report to the frontend
        emit("report", data=content)
        return f"Report written to {output_path} and saved locally."

    # ── Build & run agent ─────────────────────────────────────────
    tools = [clone_repo, list_source_files, read_file_code, execute_file, run_linter, write_report]

    system_prompt = """You are an expert code review agent with access to an isolated Daytona sandbox.

Given a GitHub repository URL:
1. Clone the repo with clone_repo.
2. Discover all source files with list_source_files — always pass directory="repo".
3. For EACH file:
   a. Read the code with read_file_code.
   b. Execute it with execute_file.
   c. Lint it with run_linter.
   d. Analyse for bugs, security issues, missing error handling, code quality, best-practice violations.
4. Write a Markdown report with write_report using this exact structure:

# Code Review Report
**Repo:** <url>
**Date:** <date>
**Files reviewed:** <n>

---

## Summary
<Overall health: Clean / Needs Work / Critical Issues>

---

## File Reviews

### `<file_path>`  [PASS / WARN / FAIL]
**Language:** <language>
**Execution:** <SUCCESS or FAILED + error>
**Linter:** <key findings or "Clean">
**Issues:**
- <issue 1>
- <issue 2>
**Verdict:** <one-sentence verdict>

---

## Overall Recommendations
1. <recommendation 1>
2. <recommendation 2>
3. <recommendation 3>
"""

    try:
        llm = ChatGoogleGenerativeAI(
            model=MODEL,
            google_api_key=GOOGLE_API_KEY,
            temperature=0,
            max_tokens=8192,
        )
        agent = create_agent(model=llm, tools=tools, system_prompt=system_prompt)

        task = (
            f"Review the code in this GitHub repository: {repo_url}\n"
            f"Today's date: {datetime.now().strftime('%Y-%m-%d')}\n"
            "Follow the full review process: clone → list files → "
            "read + execute + lint each file → write the Markdown report."
        )

        agent.invoke({"messages": [{"role": "user", "content": task}]})
        emit("done", "✅ Review complete")

    except Exception as e:
        emit("error", f"Agent error: {str(e)}")
    finally:
        delete_sandbox()
        asyncio.run_coroutine_threadsafe(queue.put(None), loop)  # sentinel


# ─────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────

@app.post("/review", response_model=ReviewResponse)
async def start_review(req: ReviewRequest):
    """Start a new code review job. Returns a job_id to stream from."""
    if not req.repo_url.startswith("http"):
        raise HTTPException(status_code=400, detail="repo_url must start with https://")
    if not DAYTONA_API_KEY:
        raise HTTPException(status_code=500, detail="DAYTONA_API_KEY not configured")
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured")

    job_id = str(uuid.uuid4())
    queue: asyncio.Queue = asyncio.Queue()
    jobs[job_id] = queue

    loop = asyncio.get_event_loop()

    # Run the synchronous agent in a thread so it doesn't block the event loop
    asyncio.get_event_loop().run_in_executor(
        None,
        run_review_sync,
        req.repo_url,
        queue,
        loop,
    )

    return ReviewResponse(
        job_id=job_id,
        stream_url=f"/review/{job_id}",
    )


@app.get("/review/{job_id}")
async def stream_review(job_id: str):
    """SSE stream — yields live events until the review is complete."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    queue = jobs[job_id]

    async def event_generator() -> AsyncIterator[dict]:
        try:
            while True:
                event = await asyncio.wait_for(queue.get(), timeout=300)
                if event is None:          # sentinel — agent finished
                    yield {"event": "done", "data": json.dumps({"type": "done"})}
                    break
                yield {"event": event["type"], "data": json.dumps(event)}
        except asyncio.TimeoutError:
            yield {"event": "error", "data": json.dumps({"type": "error", "message": "Timed out"})}
        finally:
            jobs.pop(job_id, None)

    return EventSourceResponse(event_generator())


@app.get("/health")
async def health():
    return {"status": "ok"}