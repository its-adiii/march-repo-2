# 🤖 HireMe AI - ML-Powered Job Recommendation System
https://hireme-job-reccomendation.netlify.app/


A stunning, modern job recommendation system that uses machine learning to match candidates with perfect job opportunities based on their CV/resume analysis.

## ✨ Features

- 🎨 **Ultra-Modern UI** with animations and glass morphism effects
- 🌙 **Dark Mode** support with smooth transitions
- 📄 **CV Upload** supports PDF, DOC, DOCX formats
- 🤖 **ML-Powered Recommendations** using NLP and similarity matching
- 📊 **Real-time Analysis** with match scores and skill extraction
- 📱 **Fully Responsive** design for all devices
- 🚀 **Production Ready** with Flask backend and React frontend

## 🏗️ Architecture

```
HireMe-Improved/
├── frontend/          # React.js frontend with Tailwind CSS
├── backend/           # Flask API with ML model
├── setup.py          # Automated setup script
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Node.js 14+
- Git

### Automated Setup (Recommended)

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd HireMe-Improved
```

2. **Run the setup script:**
```bash
python setup.py
```

3. **Start the application:**
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend  
cd frontend
npm start
```

4. **Open your browser:**
- Frontend: http://localhost:3000
- API Docs: http://localhost:5000

## 📊 Using Kaggle Datasets

### Option 1: Replace Sample Data with Kaggle Dataset

1. **Download a job posting dataset from Kaggle:**
   - Recommended: [Job Postings Dataset](https://www.kaggle.com/datasets)
   - Search for "job postings", "linkedin jobs", or "indeed jobs"

2. **Prepare your dataset:**
   Ensure your CSV has these columns (or similar):
   ```csv
   title,company,description,requirements,location,type,salary,posted_date
   ```

3. **Update the model training script:**
   ```python
   # In backend/train_model.py, replace:
   df = create_sample_dataset()
   
   # With:
   df = pd.read_csv('your_kaggle_dataset.csv')
   ```

4. **Clean and preprocess the data:**
   ```python
   # Add this after loading your data:
   # Fill missing values
   df['description'] = df['description'].fillna('')
   df['requirements'] = df['requirements'].fillna('')
   df['location'] = df['location'].fillna('Remote')
   df['type'] = df['type'].fillna('Full-time')
   ```

### Option 2: Use Multiple Datasets

1. **Combine multiple datasets:**
   ```python
   # In train_model.py:
   datasets = [
       pd.read_csv('linkedin_jobs.csv'),
       pd.read_csv('indeed_jobs.csv'),
       pd.read_csv('glassdoor_jobs.csv')
   ]
   df = pd.concat(datasets, ignore_index=True)
   ```

2. **Standardize column names:**
   ```python
   # Map different column names to standard ones
   column_mapping = {
       'job_title': 'title',
       'job_description': 'description',
       'company_name': 'company',
       # Add more mappings as needed
   }
   df = df.rename(columns=column_mapping)
   ```

## 🤖 ML Model Details

### Features Used
- **TF-IDF Vectorization** for text analysis
- **Skill Extraction** from job descriptions
- **Cosine Similarity** for matching
- **Random Forest Classifier** for categorization

### Model Performance
- **Accuracy**: ~85-95% (depending on dataset quality)
- **Processing Time**: <2 seconds per CV
- **Supported Languages**: English (can be extended)

### Training on Custom Data

```python
# To train with your own dataset:
from train_model import JobRecommendationModel
import pandas as pd

# Load your data
df = pd.read_csv('your_custom_jobs.csv')

# Initialize and train
model = JobRecommendationModel()
accuracy = model.train(df)

# Save the model
model.save_model('custom_model.pkl')
```

## 📡 API Endpoints

### Upload CV for Analysis
```http
POST /api/upload-cv
Content-Type: multipart/form-data

Body: file (PDF/DOC/DOCX)
```

### Get Recommendations from Text
```http
POST /api/recommendations
Content-Type: application/json

{
  "resume_text": "Your resume text here...",
  "top_k": 5
}
```

### Search Jobs
```http
POST /api/jobs/search
Content-Type: application/json

{
  "keyword": "react developer"
}
```

### Health Check
```http
GET /api/health
```

## 🔧 Customization

### Adding New Job Categories
```python
# In train_model.py, update the categorize_jobs method:
def categorize_jobs(self, titles):
    categories = []
    for title in titles:
        title_lower = str(title).lower()
        if 'blockchain' in title_lower:
            categories.append('Blockchain Development')
        elif 'ai engineer' in title_lower:
            categories.append('AI Engineering')
        # Add more categories...
    return categories
```

### Custom Skill Extraction
```python
# Update the tech_skills list in extract_skills method:
tech_skills = [
    'python', 'java', 'javascript', 'react',
    # Add your custom skills here
    'solidity', 'rust', 'go', 'scala'
]
```

### Adjusting Matching Algorithm
```python
# In predict_job_match method, adjust the similarity calculation:
from sklearn.metrics.pairwise import cosine_similarity

# You can also try:
# - Jaccard similarity
# - Euclidean distance
# - Custom weighted scoring
```

## 🌐 Deployment

### Frontend (Netlify)
1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `build` folder to Netlify

### Backend (Heroku/Render)
1. Create `Procfile`:
```
web: gunicorn app:app
```

2. Deploy to Heroku or Render

### Environment Variables
```bash
# Frontend (.env)
REACT_APP_API_URL=https://your-backend-url.com

# Backend
FLASK_ENV=production
```

## 📈 Scaling Up

### Database Integration
```python
# Replace DataFrame with database:
import sqlite3
# or PostgreSQL, MySQL, MongoDB

def load_jobs_from_db():
    conn = sqlite3.connect('jobs.db')
    df = pd.read_sql('SELECT * FROM jobs', conn)
    return df
```

### Caching for Performance
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@app.route('/api/recommendations')
@cache.cached(timeout=300)  # Cache for 5 minutes
def get_recommendations():
    # Your code here
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Model Training Fails:**
- Check dataset format and column names
- Ensure all text columns are filled (no NaN values)
- Install missing dependencies: `pip install -r requirements.txt`

**Frontend Can't Connect to Backend:**
- Ensure backend is running on port 5000
- Check CORS settings in Flask app
- Verify API URL in frontend code

**CV Upload Fails:**
- Check file size (max 16MB)
- Ensure file format is supported (PDF/DOC/DOCX)
- Check file permissions

### Performance Optimization

- Use Redis for caching recommendations
- Implement pagination for large job datasets
- Use Celery for background processing
- Optimize database queries with indexes

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@hireme-ai.com
- Documentation: https://docs.hireme-ai.com

---

🚀 **Built with ❤️ using React, Flask, and Machine Learning**
