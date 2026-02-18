import os
import shutil
import subprocess
import tempfile
from fastapi import HTTPException
from typing import Dict, Optional, List, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Configuration ---
MAX_FILE_SIZE = 1 * 1024 * 1024  # 1MB per file (optimized for browser display)
MAX_FILES = 300                 # Increased slightly
CLONE_TIMEOUT = 60

class RepoService:
    def __init__(self):
        self.active_sessions: Dict[str, str] = {}

    def create_session(self, initial_files: Dict[str, str]) -> str:
        import uuid
        session_id = str(uuid.uuid4())
        temp_root = tempfile.mkdtemp()
        self.active_sessions[session_id] = temp_root
        
        repo_path = os.path.join(temp_root, "repo")
        os.makedirs(repo_path, exist_ok=True)

        for rel_path, content in initial_files.items():
            full_path = os.path.join(repo_path, rel_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
        
        return session_id

    def get_session_files(self, session_id: str) -> Dict[str, str]:
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        temp_root = self.active_sessions[session_id]
        repo_path = os.path.join(temp_root, "repo")
        repo_data = {}
        
        for root, _, files in os.walk(repo_path):
            for file in files:
                f_path = os.path.join(root, file)
                rel_path = os.path.relpath(f_path, repo_path).replace("\\", "/")
                try:
                    with open(f_path, "r", encoding="utf-8") as f:
                        repo_data[rel_path] = f.read()
                except Exception:
                    pass
        return repo_data

    def clone_and_read(self, github_url: str, branch: str = "main", access_token: Optional[str] = None) -> Dict[str, Any]:
        import uuid
        session_id = str(uuid.uuid4())
        temp_root = tempfile.mkdtemp()
        self.active_sessions[session_id] = temp_root

        repo_data = {}

        try:
            repo_path = os.path.join(temp_root, "repo")
            
            # 1. Token Cleaning
            clean_token = None
            if access_token and str(access_token).strip().lower() not in ["", "none", "null"]:
                clean_token = access_token.strip()

            # 2. Setup Clone Command
            # Use strict checking to prevent command injection if possible, though git clone is generally safe with urls
            clone_cmd = ["git", "clone", "--depth", "1", "--single-branch", "--branch", branch]
            if clean_token:
                clone_cmd.extend(["-c", f"http.extraheader=AUTHORIZATION: bearer {clean_token}"])
            clone_cmd.extend([github_url, repo_path])

            logger.info(f"Cloning {github_url} (branch: {branch})...")
            
            # 3. Execution & Retry Logic
            result = subprocess.run(clone_cmd, capture_output=True, text=True, timeout=CLONE_TIMEOUT)

            if result.returncode != 0 and clean_token:
                logger.warning("Clone failed with token, retrying without token...")
                # Fallback for public repos if token is invalid
                shutil.rmtree(repo_path, ignore_errors=True)
                retry_cmd = ["git", "clone", "--depth", "1", github_url, repo_path]
                result = subprocess.run(retry_cmd, capture_output=True, text=True, timeout=CLONE_TIMEOUT)

            if result.returncode != 0:
                err = result.stderr.replace(clean_token, "****") if clean_token else result.stderr
                # Check for "Remote branch not found" to give a better error
                if "Remote branch" in err and "not found" in err:
                     raise HTTPException(status_code=404, detail=f"Branch '{branch}' not found in repository.")
                raise HTTPException(status_code=400, detail=f"Git Error: {err}")

            # 4. File Extraction Loop
            count = 0
            # We also want to exclude .git and maybe other binary/large folders
            exclude_dirs = {'.git', '.next', 'node_modules', '__pycache__', 'dist', 'build'}
            
            for root, dirs, files in os.walk(repo_path):
                # Modify dirs in-place to skip excluded directories
                dirs[:] = [d for d in dirs if d not in exclude_dirs]

                for file in files:
                    if count >= MAX_FILES: break
                    
                    f_path = os.path.join(root, file)
                    rel_path = os.path.relpath(f_path, repo_path).replace("\\", "/") # Ensure forward slashes
                    
                    try:
                        if os.path.getsize(f_path) <= MAX_FILE_SIZE:
                            # Try reading as text
                            with open(f_path, "r", encoding="utf-8") as f:
                                repo_data[rel_path] = f.read()
                                count += 1
                        else:
                            logger.debug(f"Skipping large file: {rel_path}")
                    except (UnicodeDecodeError, PermissionError):
                        # Construct a placeholder for binary files if we want to show them in the tree but not edit
                        # For now, just skip
                        continue 

            logger.info(f"Extracted {len(repo_data)} files.")
            return {"files": repo_data, "session_id": session_id}

        except subprocess.TimeoutExpired:
            self.cleanup_session(session_id)
            raise HTTPException(status_code=408, detail="Git clone timed out.")
        except Exception as e:
            if isinstance(e, HTTPException):
                try: self.cleanup_session(session_id)
                except: pass
                raise e
            logger.error(f"Error extracting repo: {e}")
            try: self.cleanup_session(session_id)
            except: pass
            raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
            
    def cleanup_session(self, session_id: str):
        if session_id in self.active_sessions:
            path = self.active_sessions.pop(session_id)
            try:
                shutil.rmtree(path, ignore_errors=True)
            except Exception as e:
                logger.warning(f"Cleanup failed for {path}: {e}")

    def get_file_path(self, session_id: str, rel_path: str) -> str:
        if session_id not in self.active_sessions:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        
        base_path = os.path.join(self.active_sessions[session_id], "repo")
        full_path = os.path.join(base_path, rel_path)
        
        # Security check: ensure path is within base_path
        if not os.path.abspath(full_path).startswith(os.path.abspath(base_path)):
             raise HTTPException(status_code=403, detail="Access denied")
        return full_path

    def update_file(self, session_id: str, rel_path: str, content: str):
        path = self.get_file_path(session_id, rel_path)
        try:
             with open(path, "w", encoding="utf-8") as f:
                 f.write(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Write failed: {e}")

    def create_file(self, session_id: str, rel_path: str, content: str = ""):
        path = self.get_file_path(session_id, rel_path)
        if os.path.exists(path):
            raise HTTPException(status_code=409, detail="File already exists")
        
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.update_file(session_id, rel_path, content)

    def delete_file(self, session_id: str, rel_path: str):
         path = self.get_file_path(session_id, rel_path)
         if not os.path.exists(path):
             raise HTTPException(status_code=404, detail="File not found")
         os.remove(path)


repo_service = RepoService()
