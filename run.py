"""
CliniqAI Single-Step Launcher
Runs both backend and frontend with a single command
"""
import subprocess
import sys
import os
import time
import webbrowser
import threading
import shutil
import signal

def kill_port(port):
    """Kill any process using the specified port"""
    try:
        # Windows: find and kill process using the port
        result = subprocess.run(
            f'netstat -ano | findstr :{port}',
            shell=True,
            capture_output=True,
            text=True
        )
        if result.stdout:
            for line in result.stdout.strip().split('\n'):
                if 'LISTENING' in line:
                    parts = line.split()
                    if len(parts) >= 5:
                        pid = parts[-1]
                        try:
                            os.kill(int(pid), signal.SIGTERM)
                            print(f"✅ Killed process on port {port} (PID: {pid})")
                        except:
                            pass
    except:
        pass

def run_backend():
    """Run the FastAPI backend server"""
    os.chdir("D:/cliniqai/backend")
    env = os.environ.copy()
    env["PYTHONPATH"] = "D:/cliniqai/backend"
    subprocess.run([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"], env=env)

def run_frontend():
    """Run the React frontend dev server"""
    # Wait a bit for backend to start
    time.sleep(3)
    os.chdir("D:/cliniqai/frontend")
    # Use system npm (not python's)
    npm_cmd = shutil.which("npm")
    subprocess.run([npm_cmd, "run", "dev", "--", "--port", "5173"])

def open_browser():
    """Open browser after servers start"""
    time.sleep(6)
    webbrowser.open("http://localhost:5173")

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Starting CliniqAI...")
    print("=" * 50)
    
    # Kill existing processes on ports
    print("🔄 Checking for existing processes...")
    kill_port(8000)
    kill_port(5173)
    kill_port(5174)
    
    time.sleep(1)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    print("✅ Backend starting at http://localhost:8000")
    
    # Start frontend
    frontend_thread = threading.Thread(target=run_frontend, daemon=True)
    frontend_thread.start()
    print("✅ Frontend starting at http://localhost:5173")
    
    # Open browser
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()
    print("🌐 Opening browser...")
    
    print("\n" + "=" * 50)
    print("📍 CliniqAI is running!")
    print("   Backend: http://localhost:8000")
    print("   Frontend: http://localhost:5173")
    print("=" * 50)
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
        sys.exit(0)
