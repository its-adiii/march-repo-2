#!/usr/bin/env python3
"""
HireMe AI - Setup Script
Automatically installs dependencies and trains the ML model
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Error running command: {command}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"❌ Exception running command: {command}")
        print(f"Exception: {e}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("❌ Python 3.7 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def install_backend_dependencies():
    """Install backend dependencies"""
    print("\n🔧 Installing backend dependencies...")
    backend_path = Path(__file__).parent / "backend"
    
    if not run_command(f"{sys.executable} -m pip install -r requirements.txt", cwd=backend_path):
        return False
    
    print("✅ Backend dependencies installed")
    return True

def train_model():
    """Train the ML model"""
    print("\n🤖 Training ML model...")
    backend_path = Path(__file__).parent / "backend"
    
    if not run_command(f"{sys.executable} train_model.py", cwd=backend_path):
        return False
    
    print("✅ Model trained successfully")
    return True

def install_frontend_dependencies():
    """Install frontend dependencies"""
    print("\n📦 Installing frontend dependencies...")
    frontend_path = Path(__file__).parent / "frontend"
    
    if not run_command("npm install", cwd=frontend_path):
        return False
    
    print("✅ Frontend dependencies installed")
    return True

def create_env_file():
    """Create environment file for frontend"""
    print("\n📝 Creating environment configuration...")
    frontend_path = Path(__file__).parent / "frontend"
    env_path = frontend_path / ".env"
    
    env_content = """# HireMe AI Environment Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_ENDPOINT=http://localhost:5000/api
"""
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print("✅ Environment file created")
    return True

def main():
    """Main setup function"""
    print("🚀 HireMe AI - Setup Starting...")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install backend dependencies
    if not install_backend_dependencies():
        print("❌ Failed to install backend dependencies")
        sys.exit(1)
    
    # Train the model
    if not train_model():
        print("❌ Failed to train model")
        sys.exit(1)
    
    # Install frontend dependencies
    if not install_frontend_dependencies():
        print("❌ Failed to install frontend dependencies")
        sys.exit(1)
    
    # Create environment file
    if not create_env_file():
        print("❌ Failed to create environment file")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\n📋 Next Steps:")
    print("1. Start the backend server:")
    print("   cd backend && python app.py")
    print("2. In a new terminal, start the frontend:")
    print("   cd frontend && npm start")
    print("3. Open http://localhost:3000 in your browser")
    print("\n🔗 API Documentation: http://localhost:5000")
    print("🌐 Frontend Application: http://localhost:3000")
    print("=" * 50)

if __name__ == "__main__":
    main()
