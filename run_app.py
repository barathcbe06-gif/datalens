"""
DataLens AI - Unified Application Launcher
Starts both the FastAPI Backend and Vite Frontend concurrently.
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def main():
    print("=" * 60)
    print("        Starting DataLens AI Intelligence Platform       ")
    print("=" * 60)

    # 1. Start Backend Server
    print("\n[1/3] Launching FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=str(BACKEND_DIR)
    )

    # Allow backend 1.5 seconds to initialize
    time.sleep(1.5)

    # 2. Start Frontend Dev Server
    print("[2/3] Launching Vite Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=str(FRONTEND_DIR)
    )

    # Allow frontend to spin up
    time.sleep(2)

    # 3. Open browser
    app_url = "http://localhost:5173"
    print(f"\n[3/3] Opening browser at {app_url} ...")
    print("-" * 60)
    print(f"  * Frontend Web App : {app_url}")
    print("  * Backend API      : http://127.0.0.1:8000")
    print("  * API Swagger Docs : http://127.0.0.1:8000/docs")
    print("-" * 60)
    print("Press Ctrl+C to terminate both servers at any time.\n")

    try:
        webbrowser.open(app_url)
    except Exception:
        pass

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("Backend process exited unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend process exited unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\nStopping DataLens AI services...")
    finally:
        for proc in (backend_proc, frontend_proc):
            try:
                proc.terminate()
                proc.wait(timeout=3)
            except Exception:
                try:
                    proc.kill()
                except Exception:
                    pass
        print("DataLens AI shutdown complete.")

if __name__ == "__main__":
    main()
