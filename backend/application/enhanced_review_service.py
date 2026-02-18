"""
Comprehensive Code Review Service with Execution, Linting, and AI Scoring
Integrates file execution, compilation, linting, and deep AI analysis
"""

import os
import asyncio
import tempfile
import shutil
import subprocess
import json
from datetime import datetime
from typing import Dict, Set, List, Tuple
from pathlib import Path

# Code file extensions with execution support
CODE_EXTENSIONS: Dict[str, str] = {
    '.py': 'python',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.r': 'r',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.sh': 'bash',
    '.bash': 'bash',
    '.sql': 'sql',
    '.md': 'markdown',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.xml': 'xml',
    '.toml': 'toml',
}

SKIP_DIRECTORIES = {'.git', 'node_modules', 'venv', '__pycache__', 'dist', 'build', '.next', '.vscode', '.idea', 'coverage', '__mocks__', '.pytest_cache', 'target', 'bin', 'obj'}

def get_execution_command(file_path: str, language: str) -> Tuple[str, bool]:
    """
    Returns (command, needs_compilation) for a file
    """
    runners = {
        'python': (f'python "{file_path}"', False),
        'javascript': (f'node "{file_path}"', False),
        'typescript': (f'npx ts-node "{file_path}"', False),
        'bash': (f'bash "{file_path}"', False),
        'ruby': (f'ruby "{file_path}"', False),
        'go': (f'go run "{file_path}"', False),
        'php': (f'php "{file_path}"', False),
        'java': (f'javac "{file_path}"', True),  # Needs compilation
        'cpp': (f'g++ -o output "{file_path}" && ./output', True),
        'c': (f'gcc -o output "{file_path}" && ./output', True),
        'rust': (f'rustc "{file_path}" -o output && ./output', True),
    }
    return runners.get(language, (None, False))

async def execute_file(file_path: str, language: str, timeout: int = 30) -> Dict:
    """Execute a file and return results"""
    cmd, needs_compile = get_execution_command(file_path, language)
    
    if not cmd:
        return {
            "success": False,
            "output": f"Execution not supported for {language}",
            "error": "Unsupported language",
            "exit_code": -1
        }
    
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=os.path.dirname(file_path)
        )
        
        return {
            "success": result.returncode == 0,
            "output": result.stdout.strip() or "(no output)",
            "error": result.stderr.strip() if result.stderr else None,
            "exit_code": result.returncode,
            "compiled": needs_compile
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "",
            "error": f"Execution timeout ({timeout}s)",
            "exit_code": -1
        }
    except Exception as e:
        return {
            "success": False,
            "output": "",
            "error": str(e),
            "exit_code": -1
        }

async def lint_file(file_path: str, language: str) -> Dict:
    """Run linter on a file"""
    linter_output = ""
    issues_count = 0
    
    try:
        if language == 'python':
            # Try flake8 first (lighter)
            result = subprocess.run(
                f'flake8 "{file_path}"',
                shell=True,
                capture_output=True,
                text=True,
                timeout=20
            )
            linter_output = result.stdout.strip()
            issues_count = len(linter_output.split('\n')) if linter_output else 0
            
        elif language in ['javascript', 'typescript']:
            result = subprocess.run(
                f'npx eslint "{file_path}" --format compact',
                shell=True,
                capture_output=True,
                text=True,
                timeout=20
            )
            linter_output = result.stdout.strip()
            issues_count = linter_output.count('problem')
            
        else:
            return {
                "available": False,
                "output": f"No linter configured for {language}",
                "issues_count": 0
            }
        
        return {
            "available": True,
            "output": linter_output or "No issues found",
            "issues_count": issues_count,
            "clean": issues_count == 0
        }
    except Exception as e:
        return {
            "available": False,
            "output": f"Linter error: {str(e)}",
            "issues_count": 0
        }

async def analyze_file_with_ai(file_path: str, code: str, language: str, execution_result: Dict, lint_result: Dict) -> Dict:
    """Use AI to deeply analyze a single file"""
    try:
        from llm_service import _get_llm
        llm = _get_llm(model="gemini-1.5-flash", temperature=0.2)
        
        prompt = f"""Analyze this {language} code file and provide a professional review.

File: {file_path}
Language: {language}

```{language}
{code[:3000]}  
```

Execution Result: {'SUCCESS' if execution_result.get('success') else 'FAILED'}
{f"Exit Code: {execution_result.get('exit_code')}" if not execution_result.get('success') else ""}
{f"Error: {execution_result.get('error')}" if execution_result.get('error') else ""}

Linter: {'Clean' if lint_result.get('clean') else f"{lint_result.get('issues_count', 0)} issues"}

Provide:
1. **Quality Score** (0-10): Rate code quality
2. **Issues** (list 3-5 specific issues or "None")
3. **Security** (any security concerns)
4. **Best Practices** (violations or improvements)
5. **Verdict** (PASS/WARN/FAIL with brief reason)

Format as JSON:
{{
    "score": 8,
    "issues": ["issue1", "issue2"],
    "security": "concern or None",
    "best_practices": "recommendation",
    "verdict": "PASS",
    "reason": "brief explanation"
}}"""
        
        response = llm.invoke(prompt)
        
        # Try to parse JSON from response
        content = response.content.strip()
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0].strip()
        elif '```' in content:
            content = content.split('```')[1].split('```')[0].strip()
        
        try:
            analysis = json.loads(content)
        except:
            # Fallback if JSON parsing fails
            analysis = {
                "score": 7,
                "issues": ["AI analysis parsing failed"],
                "security": "Unknown",
                "best_practices": "Manual review recommended",
                "verdict": "WARN",
                "reason": "Unable to parse AI response"
            }
        
        return analysis
        
    except Exception as e:
        return {
            "score": 5,
            "issues": [f"AI analysis failed: {str(e)}"],
            "security": "Unknown",
            "best_practices": "Manual review required",
            "verdict": "WARN",
            "reason": "AI unavailable"
        }

async def comprehensive_code_review_stream(job_id: str, repo_url: str, review_jobs: dict):
    """
    Comprehensive code review with execution, linting, and AI analysis
    """
    code_files = {}
    file_reviews = []
    overall_score = 0
    
    try:
        # Step 1: Clone
        yield {
            "event": "step",
            "data": '{"message": "🔄 Cloning repository..."}'
        }
        
        temp_dir = tempfile.mkdtemp()
        clone_result = subprocess.run(
            ["git", "clone", "--depth=1", repo_url, temp_dir],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if clone_result.returncode != 0:
            error_msg = clone_result.stderr.replace('"', '\\"').replace('\n', ' ')
            yield {
                "event": "error",
                "data": f'{{"message": "Failed to clone: {error_msg}"}}'
            }
            return
        
        yield {
            "event": "step",
            "data": '{"message": "✅ Repository cloned successfully"}'
        }
        
        # Step 2: Extract code files
        yield {
            "event": "step",
            "data": '{"message": "📁 Scanning for code files..."}'
        }
        
        file_count = 0
        code_file_count = 0
        
        for root, dirs, files in os.walk(temp_dir):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRECTORIES]
            
            for file in files:
                file_count += 1
                ext = os.path.splitext(file)[1].lower()
                
                if ext in CODE_EXTENSIONS or file.lower() in {'makefile', 'dockerfile', 'rakefile'}:
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, temp_dir).replace('\\', '/')
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            if len(content) < 500000:
                                language = CODE_EXTENSIONS.get(ext, 'text')
                                code_files[relative_path] = {
                                    "content": content,
                                    "language": language,
                                    "size": len(content),
                                    "lines": content.count('\n') + 1,
                                    "path": file_path
                                }
                                code_file_count += 1
                    except:
                        pass
        
        yield {
            "event": "step",
            "data": f'{{"message": "✅ Found {code_file_count} code files to analyze"}}'
        }
        
        # Step 3: Comprehensive analysis of each file
        analyzed_count = 0
        total_score = 0
        
        for relative_path, file_data in list(code_files.items())[:20]:  # Limit to 20 files for performance
            analyzed_count += 1
            
            yield {
                "event": "file",
                "data": f'{{"message": "🔍 Analyzing {relative_path} ({analyzed_count}/{min(code_file_count, 20)})..."}}'
            }
            
            # Execute file
            yield {
                "event": "execute",
                "data": f'{{"message": "  ⚙️ Executing {relative_path} ({file_data["language"]})..."}}'
            }
            
            exec_result = await execute_file(file_data["path"], file_data["language"])
            
            # Report execution result
            exec_status = "✅ Success" if exec_result["success"] else f"❌ Failed (exit {exec_result['exit_code']})"
            yield {
                "event": "execute",
                "data": f'{{"message": "    → {exec_status}"}}'
            }
            
            # Lint file
            yield {
                "event": "lint",
                "data": f'{{"message": "  🔍 Linting {relative_path}..."}}'
            }
            
            lint_result = await lint_file(file_data["path"], file_data["language"])
            
            # Report lint result
            if lint_result.get("available"):
                lint_status = "✅ Clean" if lint_result.get("clean") else f"⚠️ {lint_result.get('issues_count', 0)} issues"
                yield {
                    "event": "lint",
                    "data": f'{{"message": "    → {lint_status}"}}'
                }
            
            # AI Analysis
            yield {
                "event": "step",
                "data": f'{{"message": "  🤖 Running AI analysis on {relative_path}..."}}'
            }
            
            ai_analysis = await analyze_file_with_ai(
                relative_path,
                file_data["content"],
                file_data["language"],
                exec_result,
                lint_result
            )
            
            file_score = ai_analysis.get("score", 5)
            total_score += file_score
            
            # Report AI analysis result
            verdict_emoji = "✅" if ai_analysis["verdict"] == "PASS" else "⚠️" if ai_analysis["verdict"] == "WARN" else "❌"
            yield {
                "event": "step",
                "data": f'{{"message": "    → {verdict_emoji} Score: {file_score}/10 - {ai_analysis["verdict"]}"}}'
            }
            
            # Store review
            file_reviews.append({
                "path": relative_path,
                "language": file_data["language"],
                "lines": file_data["lines"],
                "execution": exec_result,
                "linting": lint_result,
                "ai_analysis": ai_analysis,
                "score": file_score
            })
            
            await asyncio.sleep(0.1)
        
        overall_score = total_score / analyzed_count if analyzed_count > 0 else 0
        
        # Send files for IDE
        yield {
            "event": "files",
            "data": json.dumps({"files": {k: {k2: v2 for k2, v2 in v.items() if k2 != 'path'} for k, v in code_files.items()}})
        }
        
        # Step 4: Generate comprehensive report
        yield {
            "event": "step",
            "data": '{"message": "📝 Generating comprehensive report..."}'
        }
        
        total_lines = sum(f["lines"] for f in code_files.values())
        pass_count = sum(1 for r in file_reviews if r["ai_analysis"]["verdict"] == "PASS")
        warn_count = sum(1 for r in file_reviews if r["ai_analysis"]["verdict"] == "WARN")
        fail_count = sum(1 for r in file_reviews if r["ai_analysis"]["verdict"] == "FAIL")
        
        health_status = "✅ EXCELLENT" if overall_score >= 8 else "⚠️ NEEDS WORK" if overall_score >= 6 else "❌ CRITICAL ISSUES"
        
        report = f"""# 🔍 Comprehensive Code Review Report

## 📊 Repository Overview

**Repository**: {repo_url}  
**Analysis Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Files Scanned**: {file_count}  
**Code Files Analyzed**: {analyzed_count}  
**Total Lines of Code**: {total_lines:,}  

## 🎯 Overall Score: {overall_score:.1f}/10

**Health Status**: {health_status}

**Verdict Distribution**:
- ✅ PASS: {pass_count} files
- ⚠️ WARN: {warn_count} files
- ❌ FAIL: {fail_count} files

---

## 📁 Detailed File Reviews

"""
        
        for review in file_reviews:
            verdict_emoji = "✅" if review["ai_analysis"]["verdict"] == "PASS" else "⚠️" if review["ai_analysis"]["verdict"] == "WARN" else "❌"
            
            exec_status = '✅ SUCCESS' if review["execution"]["success"] else f'❌ FAILED (exit {review["execution"]["exit_code"]})'
            exec_error_section = f'```\n{review["execution"]["error"][:200]}\n```' if review["execution"].get("error") else ''
            
            lint_status = '✅ Clean' if review["linting"].get("clean") else f'⚠️ {review["linting"]["issues_count"]} issues found'
            
            report += f"""### {verdict_emoji} `{review["path"]}`  [{review["ai_analysis"]["verdict"]}]

**Language**: {review["language"]}  
**Lines**: {review["lines"]}  
**Quality Score**: {review["score"]}/10  

**Execution**: {exec_status}  
{exec_error_section}

**Linter**: {lint_status}  

**Issues Found**:
"""
            for issue in review["ai_analysis"]["issues"]:
                report += f"- {issue}\n"
            
            report += f"""
**Security**: {review["ai_analysis"]["security"]}  
**Best Practices**: {review["ai_analysis"]["best_practices"]}  

**Verdict**: {review["ai_analysis"]["reason"]}

---

"""
        
        report += f"""
## 🎯 Overall Recommendations

1. **Quality Improvements**: Focus on {fail_count + warn_count} files flagged with warnings or failures
2. **Testing**: Add comprehensive unit tests for critical functionality
3. **Security**: Review security concerns identified in {sum(1 for r in file_reviews if r["ai_analysis"]["security"] != "None")} files
4. **Best Practices**: Apply recommended improvements across the codebase
5. **Documentation**: Add inline comments and documentation

## 📈 Statistics

- **Average Score**: {overall_score:.1f}/10
- **Execution Success Rate**: {sum(1 for r in file_reviews if r["execution"]["success"]) / analyzed_count * 100:.1f}%
- **Clean Linting**: {sum(1 for r in file_reviews if r["linting"].get("clean", False)) / analyzed_count * 100:.1f}%

---

*AI-powered comprehensive review with execution testing and scoring. Manual verification recommended for production.*
"""
        
        yield {
            "event": "report",
            "data": json.dumps({"data": report})
        }
        
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)
        
        # Store results
        review_jobs[job_id]["files"] = {k: {k2: v2 for k2, v2 in v.items() if k2 != 'path'} for k, v in code_files.items()}
        review_jobs[job_id]["reviews"] = file_reviews
        review_jobs[job_id]["score"] = overall_score
        review_jobs[job_id]["report"] = report
        
        yield {
            "event": "done",
            "data": f'{{"message": "✅ Review complete! Overall Score: {overall_score:.1f}/10"}}'
        }
        
    except subprocess.TimeoutExpired:
        yield {
            "event": "error",
            "data": '{"message": "⏱️ Timeout: Repository too large"}'
        }
    except Exception as e:
        error_msg = str(e).replace('"', "'")
        yield {
            "event": "error",
            "data": f'{{"message": "❌ Error: {error_msg}"}}'
        }
