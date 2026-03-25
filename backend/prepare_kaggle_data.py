import pandas as pd
import numpy as np
import os

def prepare_linkedin_data():
    """Prepare LinkedIn job postings dataset"""
    print("⚙️ Preparing LinkedIn data for ML pipeline...")
    if not os.path.exists('postings.csv'):
        print("❌ postings.csv not found! Please run download_kaggle.py first.")
        return None
        
    df = pd.read_csv('postings.csv')
    
    # Expected columns based on the LinkedIn dataset structure
    # Safely select columns that exist
    expected = {
        'title': 'title', 
        'company_name': 'company', 
        'description': 'description', 
        'location': 'location',
        'skills': 'skills', 
        'formatted_experience_level': 'experience', 
        'formatted_work_type': 'type',
        'med_salary': 'salary'
    }
    
    # Add existing columns and rename
    df_clean = pd.DataFrame()
    for raw_col, new_col in expected.items():
        if raw_col in df.columns:
            df_clean[new_col] = df[raw_col]
        else:
            df_clean[new_col] = ''
            
    # Fill missing values to satisfy SQLite NOT NULL constraints
    df_clean['company'] = df_clean['company'].fillna('Unknown Company')
    df_clean['description'] = df_clean['description'].fillna('')
    df_clean['skills'] = df_clean['skills'].fillna('')
    df_clean['requirements'] = df_clean['skills']
    df_clean['location'] = df_clean['location'].fillna('Remote')
    df_clean['type'] = df_clean['type'].fillna('Full-time')
    df_clean['salary'] = df_clean['salary'].fillna('Competitive')
    
    # Ensure title is a string and handle NaNs
    df_clean['title'] = df_clean['title'].astype(str)
    
    # Filter for tech jobs
    tech_keywords = [
        'software', 'developer', 'engineer', 'data', 'analyst',
        'frontend', 'backend', 'full stack', 'devops', 'cloud', 'architect',
        'react', 'python', 'java', 'javascript', 'machine learning'
    ]
    
    mask = df_clean['title'].str.lower().str.contains('|'.join(tech_keywords), na=False)
    df_tech = df_clean[mask].copy()
    
    # Fallback to all if tech filter wiped everything (like in mock dataset)
    if len(df_tech) == 0:
        df_tech = df_clean.copy()
        
    # No limit: Use entire dataset (approx. 20,000 jobs) for maximum ML yield
    df_final = df_tech.copy()
    
    # Save prepared data to database
    try:
        from database import engine, JobListing, Base, SessionLocal
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Clear existing
        session = SessionLocal()
        session.query(JobListing).delete()
        session.commit()
        session.close()
        
        # Insert new
        df_final.to_sql('job_listings', con=engine, if_exists='append', index=False)
        print(f"✅ Migrated {len(df_final)} tech jobs into SQLite database 'jobs.db'")
    except Exception as e:
        print(f"⚠️ Could not save to database: {e}")
        # Fallback to CSV if DB fails
        df_final.to_csv('prepared_jobs.csv', index=False)
        print(f"✅ Prepared {len(df_final)} tech jobs for training in prepared_jobs.csv")    
    return df_final

if __name__ == "__main__":
    prepare_linkedin_data()
