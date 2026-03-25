# 📊 Kaggle Dataset Integration Guide

This guide shows you how to integrate Kaggle job datasets with HireMe AI to train a more powerful recommendation model.

## 🎯 Recommended Kaggle Datasets

### 1. [LinkedIn Job Postings](https://www.kaggle.com/datasets/arshkon/linkedin-job-postings)
- **Size**: ~20,000 job postings
- **Columns**: title, company, description, location, skills, salary
- **Quality**: ⭐⭐⭐⭐⭐

### 2. [Indeed Job Postings](https://www.kaggle.com/datasets/promptcloud/indeed-job-posting-dataset)
- **Size**: ~15,000 job postings
- **Columns**: job_title, company_name, job_description, location, reviews
- **Quality**: ⭐⭐⭐⭐

### 3. [Data Science Job Postings](https://www.kaggle.com/datasets/andrewmvd/data-science-job-postings)
- **Size**: ~4,000 data science jobs
- **Columns**: title, company, description, location, salary_range
- **Quality**: ⭐⭐⭐⭐⭐

## 🚀 Quick Integration Steps

### Step 1: Download Dataset
```bash
# Install Kaggle API
pip install kaggle

# Download dataset (example: LinkedIn jobs)
kaggle datasets download -d arshkon/linkedin-job-postings

# Unzip
unzip linkedin-job-postings.zip
```

### Step 2: Prepare the Data
Create a new Python script `prepare_kaggle_data.py`:

```python
import pandas as pd
import numpy as np

def prepare_linkedin_data():
    """Prepare LinkedIn job postings dataset"""
    # Load the dataset
    df = pd.read_csv('postings.csv')
    
    # Select and rename columns
    df_clean = df[[
        'title', 'company_name', 'description', 'location',
        'skills', 'formatted_experience_level', 'formatted_work_type',
        'med_salary', 'views', 'applies'
    ]].copy()
    
    # Rename to match our expected format
    df_clean = df_clean.rename(columns={
        'company_name': 'company',
        'formatted_experience_level': 'experience',
        'formatted_work_type': 'type',
        'med_salary': 'salary'
    })
    
    # Fill missing values
    df_clean['description'] = df_clean['description'].fillna('')
    df_clean['skills'] = df_clean['skills'].fillna('')
    df_clean['requirements'] = df_clean['skills']  # Use skills as requirements
    df_clean['location'] = df_clean['location'].fillna('Remote')
    df_clean['type'] = df_clean['type'].fillna('Full-time')
    df_clean['salary'] = df_clean['salary'].fillna('Competitive')
    
    # Create posted_date (random for demo)
    df_clean['posted_date'] = np.random.choice(
        ['1 day ago', '2 days ago', '1 week ago', '2 weeks ago', '1 month ago'],
        size=len(df_clean)
    )
    
    # Filter for relevant tech jobs
    tech_keywords = [
        'software', 'developer', 'engineer', 'data', 'analyst',
        'frontend', 'backend', 'full stack', 'devops', 'cloud',
        'react', 'python', 'java', 'javascript', 'machine learning'
    ]
    
    mask = df_clean['title'].str.lower().str.contains('|'.join(tech_keywords), na=False)
    df_tech = df_clean[mask].copy()
    
    # Limit to 5000 jobs for faster training
    df_final = df_tech.head(5000)
    
    # Save prepared data
    df_final.to_csv('prepared_jobs.csv', index=False)
    print(f"✅ Prepared {len(df_final)} tech jobs for training")
    
    return df_final

if __name__ == "__main__":
    prepare_linkedin_data()
```

### Step 3: Update Training Script
Modify `backend/train_model.py`:

```python
def main():
    """Main function to train and test the model"""
    print("🚀 Starting Job Recommendation Model Training...")
    
    # Load Kaggle dataset instead of sample data
    try:
        print("📊 Loading Kaggle dataset...")
        df = pd.read_csv('prepared_jobs.csv')
        print(f"✅ Loaded {len(df)} jobs from Kaggle dataset")
    except FileNotFoundError:
        print("❌ Kaggle dataset not found. Using sample data...")
        df = create_sample_dataset()
    
    # Remove rows with missing critical data
    df = df.dropna(subset=['title', 'description'])
    df = df[df['description'].str.len() > 50]  # Remove very short descriptions
    
    print(f"📈 Final dataset size: {len(df)} jobs")
    
    # Initialize and train model
    model = JobRecommendationModel()
    accuracy = model.train(df)
    
    # Save the model
    model.save_model('kaggle_model.pkl')
    
    print(f"\n✅ Training completed! Model accuracy: {accuracy:.2%}")
```

### Step 4: Train the Model
```bash
cd backend
python prepare_kaggle_data.py
python train_model.py
```

## 📊 Advanced Data Processing

### Multiple Dataset Combination
```python
def combine_multiple_datasets():
    """Combine multiple Kaggle datasets"""
    
    # Load datasets
    linkedin = pd.read_csv('linkedin_jobs.csv')
    indeed = pd.read_csv('indeed_jobs.csv')
    data_science = pd.read_csv('data_science_jobs.csv')
    
    # Standardize column names
    def standardize_columns(df, source):
        if source == 'linkedin':
            return df.rename(columns={
                'company_name': 'company',
                'job_description': 'description',
                'job_title': 'title'
            })
        elif source == 'indeed':
            return df.rename(columns={
                'company': 'company',
                'job_description': 'description',
                'job_title': 'title'
            })
        # Add more standardization as needed
    
    linkedin_std = standardize_columns(linkedin, 'linkedin')
    indeed_std = standardize_columns(indeed, 'indeed')
    
    # Combine datasets
    combined = pd.concat([linkedin_std, indeed_std, data_science], ignore_index=True)
    
    # Remove duplicates
    combined = combined.drop_duplicates(subset=['title', 'company', 'description'])
    
    return combined
```

### Data Quality Enhancement
```python
def enhance_data_quality(df):
    """Enhance data quality for better training"""
    
    # Clean text data
    df['title'] = df['title'].str.strip().str.title()
    df['description'] = df['description'].str.strip()
    
    # Extract salary ranges
    def extract_salary(text):
        if pd.isna(text):
            return 'Competitive'
        
        # Look for salary patterns
        import re
        salary_patterns = [
            r'\$(\d+)k?\s*-\s*\$(\d+)k?',
            r'\$(\d+),?\d*\s*-\s*\$(\d+),?\d*',
            r'(\d+)k?\s*-\s*(\d+)k?'
        ]
        
        for pattern in salary_patterns:
            match = re.search(pattern, str(text), re.IGNORECASE)
            if match:
                return f"${match.group(1)}k - ${match.group(2)}k"
        
        return 'Competitive'
    
    df['salary'] = df['salary'].apply(extract_salary)
    
    # Categorize experience level
    def categorize_experience(title):
        title_lower = str(title).lower()
        if any(word in title_lower for word in ['senior', 'sr.', 'lead', 'principal']):
            return 'Senior'
        elif any(word in title_lower for word in ['junior', 'jr.', 'entry', 'associate']):
            return 'Junior'
        elif any(word in title_lower for word in ['manager', 'head', 'director']):
            return 'Management'
        else:
            return 'Mid-level'
    
    df['experience'] = df['title'].apply(categorize_experience)
    
    return df
```

## 🎯 Custom Model Training

### Hyperparameter Optimization
```python
from sklearn.model_selection import GridSearchCV

def optimize_hyperparameters(X, y):
    """Find optimal hyperparameters for the model"""
    
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }
    
    rf = RandomForestClassifier(random_state=42)
    grid_search = GridSearchCV(rf, param_grid, cv=3, scoring='accuracy', n_jobs=-1)
    grid_search.fit(X, y)
    
    print(f"Best parameters: {grid_search.best_params_}")
    return grid_search.best_estimator_
```

### Advanced Feature Engineering
```python
def create_advanced_features(df):
    """Create advanced features for better matching"""
    
    # Extract technical skills
    technical_skills = [
        'python', 'java', 'javascript', 'react', 'nodejs', 'aws',
        'docker', 'kubernetes', 'tensorflow', 'pytorch', 'sql'
    ]
    
    # Create skill presence features
    for skill in technical_skills:
        df[f'has_{skill}'] = df['description'].str.lower().str.contains(skill, na=False).astype(int)
    
    # Extract experience years
    def extract_years(text):
        import re
        years = re.findall(r'(\d+)\+?\s*years?', str(text), re.IGNORECASE)
        return int(years[0]) if years else 0
    
    df['min_experience'] = df['description'].apply(extract_years)
    
    # Company size estimation
    def estimate_company_size(company):
        # Simple heuristic based on company name patterns
        if any(word in str(company).lower() for word in ['corp', 'inc', 'ltd', 'llc']):
            return 'Large'
        elif any(word in str(company).lower() for word in ['startup', 'labs', 'tech']):
            return 'Small'
        else:
            return 'Medium'
    
    df['company_size'] = df['company'].apply(estimate_company_size)
    
    return df
```

## 📈 Model Evaluation

### Cross-Validation
```python
from sklearn.model_selection import cross_val_score

def evaluate_model(model, X, y):
    """Evaluate model with cross-validation"""
    
    scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f"Cross-validation scores: {scores}")
    print(f"Mean accuracy: {scores.mean():.2%} (+/- {scores.std() * 2:.2%})")
    
    return scores
```

### Performance Metrics
```python
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

def detailed_evaluation(y_true, y_pred, class_names):
    """Generate detailed evaluation report"""
    
    # Classification report
    print(classification_report(y_true, y_pred, target_names=class_names))
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.show()
```

## 🚀 Production Deployment

### Model Versioning
```python
import joblib
from datetime import datetime

def save_model_with_metadata(model, metrics, dataset_info):
    """Save model with metadata for versioning"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_data = {
        'model': model,
        'metrics': metrics,
        'dataset_info': dataset_info,
        'timestamp': timestamp,
        'version': f'v{timestamp}'
    }
    
    filename = f'model_{timestamp}.pkl'
    joblib.dump(model_data, filename)
    
    print(f"✅ Model saved as {filename}")
    return filename
```

### API Performance Monitoring
```python
import time
from functools import wraps

def monitor_performance(func):
    """Decorator to monitor API performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        print(f"{func.__name__} took {end_time - start_time:.2f} seconds")
        return result
    return wrapper

@app.route('/api/recommendations')
@monitor_performance
def get_recommendations():
    # Your API logic here
    pass
```

## 📚 Next Steps

1. **Download a Kaggle dataset** from the recommended list
2. **Run the preparation script** to clean and format the data
3. **Train the model** with your custom dataset
4. **Evaluate performance** using the provided metrics
5. **Deploy to production** with the enhanced model

## 🆘 Troubleshooting

### Common Issues

**Memory Issues with Large Datasets:**
```python
# Process data in chunks
chunk_size = 1000
chunks = pd.read_csv('large_dataset.csv', chunksize=chunk_size)
for chunk in chunks:
    process_chunk(chunk)
```

**Imbalanced Classes:**
```python
# Use class weights
model = RandomForestClassifier(class_weight='balanced', random_state=42)
```

**Slow Training:**
```python
# Use subset for testing
df_sample = df.sample(n=1000, random_state=42)
```

---

🎉 **Your HireMe AI is now powered by real-world job data!**
