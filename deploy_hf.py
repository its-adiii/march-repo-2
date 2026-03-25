from huggingface_hub import HfApi
import os

def deploy():
    print("🚀 Connecting to Hugging Face API...")
    try:
        api = HfApi()
        
        print("📦 Uploading project to aroneo/hireme-backend Space...")
        print("This may take a minute or two as it transfers the 43MB ML payloads...")
        
        api.upload_folder(
            folder_path=".",
            repo_id="aroneo/hireme-backend",
            repo_type="space",
            allow_patterns=["Dockerfile", "backend/**", "requirements.txt"],
            commit_message="Direct API Deployment of 20MB ML Models"
        )
        print("✅ Successfully deployed! Your AI is now spinning up on Hugging Face Spaces.")
    except Exception as e:
        print(f"❌ Deployment failed: {e}")

if __name__ == "__main__":
    deploy()
