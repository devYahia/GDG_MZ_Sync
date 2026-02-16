"""
Code Review Agent — LangChain v1 + Daytona + Claude
-----------------------------------------------------
Given a GitHub repo URL the agent will:
  1. Clone the repo into a Daytona sandbox
  2. Walk every source file and read its code
  3. Execute each file and capture output / errors
  4. Run linters (pylint + flake8 for Python, eslint for JS/TS)
  5. Ask Claude to review code quality, bugs, and best-practice issues
  6. Write a full Markdown report to ./code_review_report.md

Usage:
    python agent.py

Requirements:
    pip install daytona langchain langchain-anthropic python-dotenv
"""

import os
import sys
import json
import re
from datetime import datetime
from dotenv import load_dotenv

from daytona import Daytona, DaytonaConfig, CreateSandboxBaseParams
from langchain.tools import tool
from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# ─────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────
DAYTONA_API_KEY   = os.getenv("DAYTONA_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("GOOGLE_API_KEY", "")
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
# Sandbox singleton
# ─────────────────────────────────────────────────────────────────
_daytona: Daytona | None = None
_sandbox = None


def get_sandbox():
    global _daytona, _sandbox
    if _sandbox is None:
        print("🏗  Creating Daytona sandbox ...")
        _daytona = Daytona(DaytonaConfig(api_key=DAYTONA_API_KEY))
        _sandbox = _daytona.create(CreateSandboxBaseParams(language="python"))
        print(f"✅ Sandbox ready  (id={_sandbox.id})\n")
    return _sandbox


def delete_sandbox():
    global _daytona, _sandbox
    if _sandbox and _daytona:
        print("\n🧹 Deleting sandbox ...")
        _daytona.delete(_sandbox)
        _sandbox = None
        print("✅ Done.")


# ─────────────────────────────────────────────────────────────────
# Tools
# ─────────────────────────────────────────────────────────────────

@tool
def clone_repo(github_url: str) -> str:
    """
    Clone a GitHub repository into the Daytona sandbox at /repo.
    Returns the list of top-level files/folders cloned.
    Input: the full GitHub URL, e.g. https://github.com/owner/repo
    """
    sandbox = get_sandbox()
    print(f"  📥 Cloning {github_url} ...")
    result = sandbox.process.exec(
        f"git clone --depth 1 {github_url} /repo 2>&1",
        timeout=120,
    )
    if result.exit_code != 0:
        return f"CLONE FAILED:\n{result.result}"
    ls = sandbox.process.exec("ls /repo")
    print(f"  ✅ Clone successful")
    return f"Cloned successfully. Top-level contents:\n{ls.result}"


@tool
def list_source_files(directory: str = "/repo") -> str:
    """
    Recursively list all source code files inside the sandbox directory.
    Returns a JSON array of objects: [{path, language}].
    Skips hidden folders, node_modules, __pycache__, etc.
    """
    sandbox = get_sandbox()
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
    result = sandbox.process.code_run(script)
    if result.exit_code != 0:
        return f"FAILED to list files:\n{result.result}"

    files = json.loads(result.result.strip())
    print(f"  📂 Found {len(files)} source file(s)")
    for f in files:
        print(f"     • {f['path']}  [{f['language']}]")
    print()
    return result.result.strip()


@tool
def read_file_code(file_path: str) -> str:
    """
    Read and return the source code of a single file from the sandbox.
    Input: absolute path inside the sandbox, e.g. /repo/src/main.py
    Returns the file content as a string.
    """
    sandbox = get_sandbox()
    print(f"  📖 Reading   {file_path}")
    try:
        content = sandbox.fs.download_file(file_path).decode("utf-8", errors="replace")
        return content
    except Exception as e:
        return f"ERROR reading {file_path}: {e}"


@tool
def execute_file(file_path: str, language: str) -> str:
    """
    Execute a single source file inside the sandbox and return its output.
    Supports: python, javascript (node), typescript (ts-node), bash, ruby, go.
    Input: absolute file path and language string.
    Returns stdout + stderr and the exit code.
    """
    sandbox = get_sandbox()
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
        return f"Execution not supported for language: {language}"

    print(f"  ⚙️  Executing  {file_path}")
    result = sandbox.process.exec(f"{cmd} 2>&1", timeout=30)
    status = "SUCCESS" if result.exit_code == 0 else f"FAILED (exit_code={result.exit_code})"
    print(f"     → {status}")
    output = result.result.strip() or "(no output)"
    return f"[{status}]\n{output}"


@tool
def run_linter(file_path: str, language: str) -> str:
    """
    Run a static analysis / linter tool on a source file inside the sandbox.
    Python → pylint + flake8. JavaScript/TypeScript → eslint (if available).
    Returns the linter output.
    """
    sandbox = get_sandbox()
    print(f"  🔍 Linting   {file_path}")
    if language == "python":
        sandbox.process.exec("pip install -q pylint flake8", timeout=60)
        pylint = sandbox.process.exec(f"pylint --score=yes {file_path} 2>&1", timeout=30)
        flake8 = sandbox.process.exec(f"flake8 {file_path} 2>&1", timeout=30)
        return (
            f"=== pylint ===\n{pylint.result.strip()}\n\n"
            f"=== flake8 ===\n{flake8.result.strip() or 'No issues found.'}"
        )
    elif language in ("javascript", "typescript"):
        result = sandbox.process.exec(f"npx eslint {file_path} 2>&1", timeout=30)
        return result.result.strip() or "No ESLint issues found."
    else:
        return f"No linter configured for: {language}"


@tool
def write_report(content: str, output_path: str = "/tmp/code_review_report.md") -> str:
    """
    Write the final Markdown review report to a file inside the sandbox,
    then download it locally as code_review_report.md.
    Input: the full Markdown content as a string.
    """
    sandbox = get_sandbox()
    sandbox.fs.upload_file(content.encode(), output_path)
    local_path = "code_review_report.md"
    data = sandbox.fs.download_file(output_path)
    with open(local_path, "wb") as f:
        f.write(data)
    return f"Report written to sandbox at {output_path} and saved locally as {local_path}"


# ─────────────────────────────────────────────────────────────────
# Report printer  — renders the Markdown cleanly in the terminal
# ─────────────────────────────────────────────────────────────────
def print_report(path: str = "code_review_report.md") -> None:
    if not os.path.exists(path):
        print("⚠️  Report file not found.")
        return

    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # ANSI colours
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    CYAN   = "\033[96m"
    YELLOW = "\033[93m"
    GREEN  = "\033[92m"
    RED    = "\033[91m"
    DIM    = "\033[2m"

    def verdict_colour(line: str) -> str:
        if "[PASS]" in line: return line.replace("[PASS]", f"{GREEN}[PASS]{RESET}")
        if "[WARN]" in line: return line.replace("[WARN]", f"{YELLOW}[WARN]{RESET}")
        if "[FAIL]" in line: return line.replace("[FAIL]", f"{RED}[FAIL]{RESET}")
        return line

    print("\n" + "═" * 64)
    print(f"{BOLD}{'CODE REVIEW REPORT':^64}{RESET}")
    print("═" * 64 + "\n")

    for line in lines:
        line = line.rstrip()

        if line.startswith("# "):                          # H1 title
            print(f"\n{BOLD}{CYAN}{line[2:]}{RESET}")
            print(f"{CYAN}{'─' * len(line[2:])}{RESET}")

        elif line.startswith("## "):                       # H2 section
            print(f"\n{BOLD}{line[3:]}{RESET}")
            print("─" * 48)

        elif line.startswith("### "):                      # H3 file header
            coloured = verdict_colour(line[4:])
            print(f"\n  {BOLD}{coloured}{RESET}")

        elif line.startswith("**") and line.endswith("**"):
            print(f"  {BOLD}{line.strip('*')}{RESET}")

        elif re.match(r"\*\*(.+?)\*\*", line):            # inline bold labels
            formatted = re.sub(r"\*\*(.+?)\*\*", f"{BOLD}\\1{RESET}", line)
            print(f"  {formatted}")

        elif line.startswith("- "):                        # bullet
            print(f"    {YELLOW}•{RESET} {line[2:]}")

        elif re.match(r"^\d+\.", line):                    # numbered list
            print(f"    {line}")

        elif line.startswith("---"):                       # divider
            print(f"\n  {DIM}{'·' * 56}{RESET}")

        elif line == "":
            print()

        else:
            print(f"  {line}")

    print("\n" + "═" * 64 + "\n")


# ─────────────────────────────────────────────────────────────────
# Agent
# ─────────────────────────────────────────────────────────────────
TOOLS = [clone_repo, list_source_files, read_file_code, execute_file, run_linter, write_report]

SYSTEM_PROMPT = """You are an expert code review agent with access to an isolated Daytona sandbox.

Given a GitHub repository URL, your job is to:

1. Clone the repo with clone_repo.
2. Discover all source files with list_source_files (returns a JSON array).
3. For EACH file:
   a. Read the code with read_file_code.
   b. Execute it with execute_file — note if it runs successfully or crashes.
   c. Lint it with run_linter — collect warnings and errors.
   d. Analyse the code for: bugs, security issues, missing error handling,
      code quality (naming/structure/complexity), and best-practice violations.
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

Be thorough but concise. If a file is clean, say so. If it has critical bugs, flag it FAIL.
"""


def build_agent():
    llm = ChatGoogleGenerativeAI(
        model=MODEL,
        anthropic_api_key=ANTHROPIC_API_KEY,
        temperature=0,
        max_tokens=8192,
    )
    return create_agent(
        model=llm,
        tools=TOOLS,
        system_prompt=SYSTEM_PROMPT,
    )


# ─────────────────────────────────────────────────────────────────
# Progress printer — shows what the agent is doing step by step
# ─────────────────────────────────────────────────────────────────
STEP_LABELS = {
    "clone_repo":         "🔧 Cloning repository",
    "list_source_files":  "📂 Discovering source files",
    "read_file_code":     "📖 Reading file",
    "execute_file":       "⚙️  Executing file",
    "run_linter":         "🔍 Running linter",
    "write_report":       "📝 Writing report",
}

def on_tool_start(tool_name: str, tool_input: dict) -> None:
    label = STEP_LABELS.get(tool_name, f"🔧 {tool_name}")
    arg   = next(iter(tool_input.values()), "") if tool_input else ""
    short = str(arg)[:60] + ("…" if len(str(arg)) > 60 else "")
    print(f"\n{label}  {short}")


# ─────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────
def run_agent(repo_url: str) -> None:
    if not DAYTONA_API_KEY:
        sys.exit("❌  DAYTONA_API_KEY not set. Add it to your .env file.")
    if not ANTHROPIC_API_KEY:
        sys.exit("❌  GOOGLE_API_KEY not set. Add it to your .env file.")

    print(f"\n{'═' * 48}")
    print(f"  🔍 Code Review Agent")
    print(f"  Repo  : {repo_url}")
    print(f"  Model : {MODEL}")
    print(f"{'═' * 48}\n")

    agent = build_agent()

    task = (
        f"Review the code in this GitHub repository: {repo_url}\n"
        f"Today's date: {datetime.now().strftime('%Y-%m-%d')}\n"
        "Follow the full review process: clone → list files → "
        "read + execute + lint each file → write the Markdown report."
    )

    try:
        result = agent.invoke({
            "messages": [{"role": "user", "content": task}]
        })

        # ── Print the clean report ────────────────────────────────
        print_report("code_review_report.md")
        print("📄 Full report also saved to: code_review_report.md\n")

    finally:
        delete_sandbox()


if __name__ == "__main__":
    print("\n╔══════════════════════════════════════════╗")
    print("║       🤖  Code Review Agent              ║")
    print("╚══════════════════════════════════════════╝\n")

    repo_url = input("  Enter GitHub repo URL: ").strip()

    if not repo_url:
        print("❌  No URL provided. Exiting.")
        sys.exit(1)

    if not repo_url.startswith("http"):
        print("❌  URL must start with https://  Exiting.")
        sys.exit(1)

    run_agent(repo_url)