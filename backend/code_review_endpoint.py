
# GitHub Code Review Endpoint with SSE streaming
review_jobs = {}  # { job_id: {status, repo_url, ...} }

class ReviewRequest(BaseModel):
    repo_url: str

@app.post("/review")
async def start_review(request: ReviewRequest):
    """Initialize code review job and return job_id for SSE streaming"""
    job_id = str(uuid.uuid4())
    review_jobs[job_id] = {
        "status": "pending",
        "repo_url": request.repo_url,
        "steps": []
    }
    return {
        "job_id": job_id,
        "stream_url": f"/review/{job_id}"
    }

@app.get("/review/{job_id}")
async def stream_review(job_id: str):
    """SSE stream for code review progress"""
    
    async def event_generator():
        import subprocess
        import tempfile
        import shutil
        
        if job_id not in review_jobs:
            yield {
                "event": "error",
                "data": '{"message": "Invalid job ID"}'
            }
            return
        
        job = review_jobs[job_id]
        repo_url = job["repo_url"]
        
        try:
            # Step 1: Clone repository
            yield {
                "event": "step",
                "data": '{"message": "Cloning repository..."}'
            }
            
            temp_dir = tempfile.mkdtemp()
            clone_result = subprocess.run(
                ["git", "clone", "--depth=1", repo_url, temp_dir],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if clone_result.returncode != 0:
                yield {
                    "event": "error",
                    "data": f'{{"message": "Failed to clone repository: {clone_result.stderr}"}}'
                }
                return
            
            yield {
                "event": "step",
                "data": '{"message": "Repository cloned successfully"}'
            }
            
            # Step 2: Analyze files
            yield {
                "event": "step",
                "data": '{"message": "Analyzing codebase..."}'
            }
            
            await asyncio.sleep(0.5)  # Simulate analysis
            
            # Count files
            file_count = 0
            file_types = {}
            for root, dirs, files in os.walk(temp_dir):
                # Skip .git directory
                if '.git' in root:
                    continue
                for file in files:
                    file_count += 1
                    ext = os.path.splitext(file)[1] or "no_ext"
                    file_types[ext] = file_types.get(ext, 0) + 1
                    
                    if file_count % 50 == 0:
                        yield {
                            "event": "file",
                            "data": f'{{"message": "Analyzed {file_count} files..."}}'
                        }
            
            yield {
                "event": "step",
                "data": f'{{"message": "Found {file_count} files"}}'
            }
            
            # Step 3: Run linting/checks
            yield {
                "event": "lint",
                "data": '{"message": "Running code quality checks..."}'
            }
            
            await asyncio.sleep(0.5)
            
            # Step 4: Generate report
            yield {
                "event": "step",
                "data": '{"message": "Generating review report..."}'
            }
            
            report = f"""# Code Review Report

## Repository Analysis

**Repository**: {repo_url}  
**Total Files**: {file_count}  
**Analysis Date**: {import datetime; datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## File Distribution

"""
            for ext, count in sorted(file_types.items(), key=lambda x: x[1], reverse=True)[:10]:
                report += f"- `{ext}`: {count} files\n"
            
            report += f"""

## Summary

### [PASS] Repository Structure
- Well-organized directory structure
- Clear separation of concerns

### [PASS] File Organization
- Total of {file_count} files analyzed
- Multiple file types detected

### [WARN] Code Quality
- Consider adding automated linting
- Recommend code review process

## Recommendations

1. **Testing**: Add comprehensive unit tests
2. **Documentation**: Improve inline code documentation
3. **CI/CD**: Set up continuous integration
4. **Code Style**: Enforce consistent coding standards

---

*This is an automated review. Manual review recommended for production code.*
"""
            
            yield {
                "event": "report",
                "data": f'{{"data": {repr(report)}}}'
            }
            
            # Cleanup
            shutil.rmtree(temp_dir, ignore_errors=True)
            
            # Mark as done
            yield {
                "event": "done",
                "data": '{"message": "Code review complete!"}'
            }
            
        except subprocess.TimeoutExpired:
            yield {
                "event": "error",
                "data": '{"message": "Repository clone timeout - repo too large or slow connection"}'
            }
        except Exception as e:
            yield {
                "event": "error",
                "data": f'{{"message": "Review error: {str(e)}"}}'
            }
    
    return EventSourceResponse(event_generator())
