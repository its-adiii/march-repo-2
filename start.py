#!/usr/bin/env python3
"""
HireMe AI - Startup Script
Starts both backend and frontend servers
"""

import subprocess
import sys
import os
import time
from pathlib import Path

def start_backend():
    """Start the Flask backend server"""
    print("🚀 Starting Backend Server...")
    backend_path = Path(__file__).parent / "backend"
    
    try:
        # Start backend in background
        process = subprocess.Popen(
            [sys.executable, "app.py"],
            cwd=backend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print("✅ Backend server starting on http://localhost:5000")
        return process
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the React frontend server"""
    print("🎨 Starting Frontend Server...")
    frontend_path = Path(__file__).parent / "frontend"
    
    try:
        # Start frontend in background
        process = subprocess.Popen(
            ["npm", "start"],
            cwd=frontend_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        print("✅ Frontend server starting on http://localhost:3000")
        return process
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def main():
    """Main startup function"""
    print("🤖 HireMe AI - Starting Application...")
    print("=" * 50)
    
    # Check if model exists
    model_path = Path(__file__).parent / "backend" / "job_recommendation_model.pkl"
    if not model_path.exists():
        print("❌ Model not found. Please run 'python setup.py' first.")
        return
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Cannot start application without backend.")
        return
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ Cannot start application without frontend.")
        backend_process.terminate()
        return
    
    print("\n" + "=" * 50)
    print("🎉 HireMe AI is running!")
    print("🌐 Frontend: http://localhost:3000")
    print("📡 Backend API: http://localhost:5000")
    print("📚 API Docs: http://localhost:5000")
    print("\n💡 Press Ctrl+C to stop both servers")
    print("=" * 50)
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Servers stopped successfully")

if __name__ == "__main__":
    main()
