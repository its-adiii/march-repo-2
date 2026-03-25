import os
import subprocess
import pandas as pd
from pathlib import Path

def download_dataset():
    if not os.environ.get('KAGGLE_API_TOKEN'):
        print("⚠️ Kaggle API key not found in KAGGLE_API_TOKEN environment variable.")
        print("Creating a seamless fallback dataset for now to keep the pipeline unbroken...")
        create_fallback_dataset()
        return

    print("📥 Downloading LinkedIn Job Postings via KaggleHub...")
    try:
        import kagglehub
        import shutil
        
        # Download the dataset using kagglehub (natively supports KAGGLE_API_TOKEN)
        path = kagglehub.dataset_download("arshkon/linkedin-job-postings")
        
        # Copy the CSV to current folder as postings.csv
        found_csv = False
        for file in os.listdir(path):
            if file == 'job_postings.csv' or file == 'postings.csv':
                shutil.copy(os.path.join(path, file), 'postings.csv')
                print("✅ KaggleHub successful! Real Dataset downloaded and extracted.")
                found_csv = True
                break
                
        if not found_csv:
            print("❌ CSV not found in downloaded Kaggle hub cache.")
            create_fallback_dataset()
            
    except Exception as e:
        print(f"❌ Failed to download dataset via KaggleHub: {e}")
        print("Creating a seamless fallback dataset for now...")
        create_fallback_dataset()

def create_fallback_dataset():
    data = {
        'title': ['Senior React Developer', 'Python Machine Learning Engineer', 'Full Stack Engineer', 'Cloud Architect'],
        'company_name': ['Boutique Tech', 'AI Innovators', 'Global Systems Inc.', 'CloudTech Labs'],
        'description': [
            'Looking for a senior frontend dev fluent in React, Tailwind, and Framer Motion to build luxury web tools.',
            'Seeking an ML engineer proficient in Python, Scikit-Learn, and NLP to build recommendation engines.',
            'Full stack developer needed with React frontend and Python Flask backend skills.',
            'Architect needed for AWS/GCP cloud environments. Strong understanding of scalable microservices.'
        ],
        'location': ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX'],
        'skills': [
            'React, JavaScript, Framer Motion, Frontend',
            'Python, Machine Learning, AI, Scikit-Learn, NLP',
            'React, Python, SQL, Flask, Full Stack',
            'AWS, GCP, Cloud Computing, Architecture'
        ],
        'formatted_experience_level': ['Senior', 'Mid-Senior', 'Mid-Senior', 'Director'],
        'formatted_work_type': ['Full-time', 'Full-time', 'Contract', 'Full-time'],
        'med_salary': ['150000', '160000', '140000', '190000'],
        'views': [120, 300, 50, 200],
        'applies': [10, 45, 5, 2]
    }
    df = pd.DataFrame(data)
    df.to_csv('postings.csv', index=False)
    print("✅ Fallback mock LinkedIn dataset created as postings.csv")

if __name__ == '__main__':
    download_dataset()
