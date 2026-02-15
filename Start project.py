# Script to run both the front and back end with 1 click
import subprocess
import time
import sys
import os
import signal

def start_servers():
    print("\n🚀 Starting GDG_MZ_Sync project...")
    
    # Paths
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    venv_python = os.path.join(root_dir, "venv", "Scripts", "python.exe")
    
    # Check if venv exists
    if not os.path.exists(venv_python):
        print(f"❌ Error: Virtual environment not found at {venv_python}")
        print("Please ensure you have run the setup steps first.")
        return

    try:
        # Start Backend (FastAPI)
        print("📡 Starting Backend (FastAPI) on port 8000...")
        backend_process = subprocess.Popen(
            [venv_python, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
            cwd=backend_dir,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
        )

        # Start Frontend (Next.js)
        print("💻 Starting Frontend (Next.js) on port 3000...")
        frontend_process = subprocess.Popen(
            ["npm.cmd", "run", "dev"],
            cwd=root_dir,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
        )

        print("\n✅ Both servers are starting up!")
        print("🔗 Access the website at: http://localhost:3000")
        print("Press Ctrl+C to stop both servers.\n")

        # Keep the script running and pipe output if needed, or just wait
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        # Graceful shutdown
        if os.name == 'nt':
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(backend_process.pid)])
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(frontend_process.pid)])
        else:
            backend_process.terminate()
            frontend_process.terminate()
        print("👋 Servers stopped.")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    start_servers()
