# Quick Backend Startup Guide

## Steps to Start Backend

1. **Open a terminal in the backend directory**:
```bash
cd d:\Other\Interns\GDG\GDG_MZ_Sync\backend
```

2. **Activate virtual environment** (if you have one):
```bash
# Windows
venv\Scripts\activate

# Or if using conda
conda activate your_env_name
```

3. **Install dependencies** (if not already):
```bash
pip install fastapi uvicorn sse-starlette python-dotenv asyncpg langchain langchain-google-genai
```

4. **Start the backend**:
```bash
uvicorn api.main:app --reload --port 8001 --host 0.0.0.0
```

5. **Verify backend is running**:
- Open browser: http://localhost:8001/health
- Should see: `{"status": "ok"}`
- FastAPI docs: http://localhost:8001/docs

## Common Issues

### Port Already in Use
```bash
# Find and kill process on port 8001
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```

### Backend Not Accessible
- Check firewall settings
- Verify .env file exists with GOOGLE_API_KEY
- Check backend terminal for errors

## Testing the Review Endpoint

Once backend is running:
1. Go to: http://localhost:3000/ide
2. Enter a GitHub URL
3. Click "Run Review"
4. Check browser console (F12) for logs
5. Check backend terminal for activity

## Backend Logs to Look For

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

When a review is requested:
```
INFO:     127.0.0.1:xxxxx - "POST /review HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "GET /review/{job_id} HTTP/1.1" 200 OK
```
