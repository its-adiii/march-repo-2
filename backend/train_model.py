import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import pickle
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import warnings
warnings.filterwarnings('ignore')

# Download NLTK data
try:
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
except:
    pass

class JobRecommendationModel:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
        self.label_encoder = LabelEncoder()
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.skill_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
    def preprocess_text(self, text):
        """Clean and preprocess text data"""
        if pd.isna(text):
            return ""
        
        # Convert to lowercase and remove special characters
        text = str(text).lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize and remove stopwords
        try:
            stop_words = set(stopwords.words('english'))
            tokens = word_tokenize(text)
            tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
            return ' '.join(tokens)
        except:
            return text
    
    def extract_skills(self, text):
        """Extract skills from job description or resume"""
        if pd.isna(text):
            return ""
        
        # Common tech skills to look for
        tech_skills = [
            'python', 'java', 'javascript', 'react', 'nodejs', 'html', 'css', 'sql',
            'mongodb', 'postgresql', 'mysql', 'aws', 'docker', 'kubernetes', 'git',
            'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'nlp',
            'data analysis', 'data science', 'tableau', 'power bi', 'excel',
            'typescript', 'vue', 'angular', 'flask', 'django', 'spring', 'rest api',
            'graphql', 'microservices', 'devops', 'ci/cd', 'jenkins', 'linux',
            'ubuntu', 'windows', 'mac', 'ios', 'android', 'swift', 'kotlin',
            'php', 'laravel', 'ruby', 'rails', 'c++', 'c#', '.net', 'scala',
            'spark', 'hadoop', 'azure', 'gcp', 'firebase', 'redis', 'elasticsearch'
        ]
        
        text_lower = str(text).lower()
        found_skills = []
        
        for skill in tech_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        return ' '.join(found_skills)
    
    def create_features(self, df, is_training=True):
        """Create features for the model"""
        features = []
        
        # Combine relevant text fields
        df['combined_text'] = (
            df['title'].fillna('') + ' ' + 
            df['description'].fillna('') + ' ' + 
            df['requirements'].fillna('')
        ).apply(self.preprocess_text)
        
        # Extract skills
        df['skills_text'] = (
            df['title'].fillna('') + ' ' + 
            df['description'].fillna('') + ' ' + 
            df['requirements'].fillna('')
        ).apply(self.extract_skills)
        
        if is_training:
            # Fit vectorizers on training data
            self.tfidf_vectorizer.fit(df['combined_text'])
            self.skill_vectorizer.fit(df['skills_text'])
            
            # Create target variable (job categories)
            df['category'] = self.categorize_jobs(df['title'])
            self.label_encoder.fit(df['category'])
        
        # Transform text features
        text_features = self.tfidf_vectorizer.transform(df['combined_text'])
        skill_features = self.skill_vectorizer.transform(df['skills_text'])
        
        # Combine features
        from scipy.sparse import hstack
        combined_features = hstack([text_features, skill_features])
        
        return combined_features, df['category'] if is_training else None
    
    def categorize_jobs(self, titles):
        """Categorize jobs based on titles"""
        categories = []
        
        for title in titles:
            title_lower = str(title).lower()
            
            if any(keyword in title_lower for keyword in ['software engineer', 'developer', 'programmer']):
                categories.append('Software Development')
            elif any(keyword in title_lower for keyword in ['data scientist', 'data analyst', 'machine learning']):
                categories.append('Data Science')
            elif any(keyword in title_lower for keyword in ['frontend', 'ui', 'ux', 'web designer']):
                categories.append('Frontend/UI/UX')
            elif any(keyword in title_lower for keyword in ['backend', 'server', 'api']):
                categories.append('Backend Development')
            elif any(keyword in title_lower for keyword in ['devops', 'cloud', 'infrastructure']):
                categories.append('DevOps/Cloud')
            elif any(keyword in title_lower for keyword in ['manager', 'lead', 'director']):
                categories.append('Management')
            elif any(keyword in title_lower for keyword in ['analyst', 'consultant']):
                categories.append('Consulting/Analysis')
            else:
                categories.append('General IT')
        
        return categories
    
    def train(self, df):
        """Train the recommendation model"""
        print("🔄 Creating features...")
        X, y = self.create_features(df, is_training=True)
        
        print("📊 Splitting data...")
        # Remove stratify for small datasets
        if len(df) < 50:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
        else:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
        
        print("🤖 Training model...")
        self.model.fit(X_train, y_train)
        
        print("📈 Evaluating model...")
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"\n✅ Model Accuracy: {accuracy:.2%}")
        print("\n📋 Classification Report:")
        print(classification_report(y_test, y_pred))
        
        return accuracy
    
    def predict_job_match(self, resume_text, job_data, top_k=5, precomputed_job_features=None):
        """Predict job matches for a given resume"""
        # Preprocess resume
        resume_df = pd.DataFrame({
            'title': ['Resume'],
            'description': [resume_text],
            'requirements': [resume_text]
        })
        
        resume_features, _ = self.create_features(resume_df, is_training=False)
        
        # Get job features
        if precomputed_job_features is not None:
            job_features = precomputed_job_features
        else:
            job_features, _ = self.create_features(job_data, is_training=False)
        
        # Calculate similarity scores
        from sklearn.metrics.pairwise import cosine_similarity
        similarities = cosine_similarity(resume_features, job_features).flatten()
        
        # Get top matches
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            job = job_data.iloc[idx]
            results.append({
                'id': int(job['id']) if 'id' in job else None,
                'title': job['title'],
                'company': job.get('company', 'Unknown Company'),
                'location': job.get('location', 'Remote'),
                'type': job.get('type', 'Full-time'),
                'description': job['description'][:300] + '...' if len(job['description']) > 300 else job['description'],
                'match_score': round(similarities[idx] * 100, 1),
                'skills': self.extract_skills(job['description']).split(),
                'posted_date': job.get('posted_date', 'Recently'),
                'salary': job.get('salary', 'Competitive')
            })
        
        return results
    
    def save_model(self, filepath):
        """Save the trained model"""
        model_data = {
            'model': self.model,
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'skill_vectorizer': self.skill_vectorizer,
            'label_encoder': self.label_encoder
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"💾 Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load a trained model"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.tfidf_vectorizer = model_data['tfidf_vectorizer']
        self.skill_vectorizer = model_data['skill_vectorizer']
        self.label_encoder = model_data['label_encoder']
        print(f"📂 Model loaded from {filepath}")

def create_sample_dataset():
    """Create a sample dataset for demonstration"""
    jobs = [
        {
            'title': 'Senior React Developer',
            'company': 'TechCorp Solutions',
            'description': 'Looking for an experienced React developer to join our growing team and work on cutting-edge web applications that impact millions of users worldwide. You will be responsible for developing responsive web applications using React, TypeScript, and modern JavaScript frameworks.',
            'requirements': '5+ years of experience with React, JavaScript, TypeScript, Node.js, and CSS. Experience with REST APIs and state management.',
            'location': 'San Francisco, CA',
            'type': 'Full-time',
            'salary': '$120k - $180k',
            'posted_date': '2 days ago'
        },
        {
            'title': 'Data Scientist',
            'company': 'AI Analytics Inc',
            'description': 'Join our data science team to build machine learning models and analyze complex datasets. You will work on predictive modeling, data visualization, and statistical analysis to drive business decisions.',
            'requirements': 'Strong background in statistics, machine learning, and Python. Experience with TensorFlow, scikit-learn, and data visualization tools.',
            'location': 'New York, NY',
            'type': 'Full-time',
            'salary': '$110k - $160k',
            'posted_date': '1 week ago'
        },
        {
            'title': 'Frontend Engineer',
            'company': 'Digital Innovations Inc',
            'description': 'Join our remote team to build beautiful, responsive web applications using modern frontend technologies and best practices. Work closely with designers to implement pixel-perfect UIs.',
            'requirements': '3+ years experience with HTML, CSS, JavaScript, React, and Vue.js. Strong understanding of responsive design and accessibility.',
            'location': 'Remote',
            'type': 'Remote',
            'salary': '$90k - $130k',
            'posted_date': '1 week ago'
        },
        {
            'title': 'DevOps Engineer',
            'company': 'CloudTech Systems',
            'description': 'Manage and optimize cloud infrastructure, implement CI/CD pipelines, and ensure system reliability. Work with AWS, Docker, Kubernetes, and modern DevOps tools.',
            'requirements': 'Experience with AWS, Docker, Kubernetes, Jenkins, and infrastructure as code. Strong scripting skills in Python or Bash.',
            'location': 'Austin, TX',
            'type': 'Full-time',
            'salary': '$100k - $150k',
            'posted_date': '3 days ago'
        },
        {
            'title': 'UI/UX Designer',
            'company': 'Creative Studios',
            'description': 'Design beautiful user interfaces and experiences for web and mobile applications. Create wireframes, prototypes, and work closely with development teams.',
            'requirements': 'Proficiency in Figma, Adobe XD, and design principles. Understanding of frontend technologies is a plus.',
            'location': 'Los Angeles, CA',
            'type': 'Hybrid',
            'salary': '$85k - $120k',
            'posted_date': '5 days ago'
        },
        {
            'title': 'Backend Developer',
            'company': 'ServerSide Tech',
            'description': 'Develop robust backend services and APIs. Work with Node.js, Python, databases, and cloud services to build scalable applications.',
            'requirements': 'Strong experience with Node.js, Python, REST APIs, databases like PostgreSQL or MongoDB, and cloud platforms.',
            'location': 'Seattle, WA',
            'type': 'Full-time',
            'salary': '$105k - $145k',
            'posted_date': '4 days ago'
        },
        {
            'title': 'Machine Learning Engineer',
            'company': 'ML Innovations',
            'description': 'Build and deploy machine learning models at scale. Work on computer vision, NLP, and predictive analytics projects.',
            'requirements': 'Experience with TensorFlow, PyTorch, Python, and production ML systems. Strong math and statistics background.',
            'location': 'Boston, MA',
            'type': 'Full-time',
            'salary': '$130k - $180k',
            'posted_date': '1 day ago'
        },
        {
            'title': 'Full Stack Developer',
            'company': 'StartupHub',
            'description': 'We need a versatile full stack developer who can handle both frontend and backend development for our innovative SaaS platform.',
            'requirements': 'React, Python, Django, PostgreSQL, AWS, Docker. Experience with full stack development and cloud deployment.',
            'location': 'Austin, TX',
            'type': 'Full-time',
            'salary': '$100k - $150k',
            'posted_date': '3 days ago'
        }
    ]
    
    # Create more variations for better training
    expanded_jobs = []
    for job in jobs:
        expanded_jobs.append(job)
        # Add multiple variations for each job type
        if 'React' in job['title']:
            expanded_jobs.extend([
                {
                    **job,
                    'title': 'React Developer',
                    'description': job['description'].replace('Senior ', ''),
                    'salary': '$80k - $120k',
                    'company': 'React Solutions Inc'
                },
                {
                    **job,
                    'title': 'Junior React Developer',
                    'description': 'Entry-level React position. ' + job['description'],
                    'salary': '$60k - $90k',
                    'company': 'StartUp Tech'
                },
                {
                    **job,
                    'title': 'React Frontend Developer',
                    'description': 'Frontend-focused React role. ' + job['description'],
                    'salary': '$85k - $125k',
                    'company': 'Frontend Masters'
                }
            ])
        elif 'Data Scientist' in job['title']:
            expanded_jobs.extend([
                {
                    **job,
                    'title': 'Senior Data Scientist',
                    'description': 'Senior ' + job['description'],
                    'salary': '$130k - $180k',
                    'company': 'DataTech Pro'
                },
                {
                    **job,
                    'title': 'Junior Data Scientist',
                    'description': 'Entry-level data science position. ' + job['description'],
                    'salary': '$70k - $100k',
                    'company': 'Analytics StartUp'
                },
                {
                    **job,
                    'title': 'Data Analyst',
                    'description': 'Focus on data analysis and visualization. ' + job['description'],
                    'salary': '$65k - $95k',
                    'company': 'Data Insights Co'
                }
            ])
        elif 'Frontend' in job['title']:
            expanded_jobs.extend([
                {
                    **job,
                    'title': 'Senior Frontend Developer',
                    'description': 'Senior frontend role. ' + job['description'],
                    'salary': '$100k - $140k',
                    'company': 'Frontend Experts'
                },
                {
                    **job,
                    'title': 'Vue.js Developer',
                    'description': job['description'].replace('React', 'Vue.js'),
                    'salary': '$85k - $125k',
                    'company': 'Vue Solutions'
                }
            ])
        elif 'DevOps' in job['title']:
            expanded_jobs.extend([
                {
                    **job,
                    'title': 'Senior DevOps Engineer',
                    'description': 'Senior DevOps role. ' + job['description'],
                    'salary': '$120k - $160k',
                    'company': 'DevOps Masters'
                },
                {
                    **job,
                    'title': 'Cloud Engineer',
                    'description': 'Focus on cloud infrastructure. ' + job['description'],
                    'salary': '$95k - $135k',
                    'company': 'Cloud Solutions Inc'
                }
            ])
    
    return pd.DataFrame(expanded_jobs)

def main():
    """Main function to train and test the model"""
    print("🚀 Starting Job Recommendation Model Training...")
    
    # Create or load dataset
    import os
    if os.path.exists('jobs.db'):
        print("📊 Loading Kaggle dataset from SQLite database...")
        from database import engine
        df = pd.read_sql('job_listings', con=engine)
    elif os.path.exists('prepared_jobs.csv'):
        print("📊 Loading prepared Kaggle dataset from CSV...")
        df = pd.read_csv('prepared_jobs.csv')
    else:
        print("📊 Creating sample dataset...")
        df = create_sample_dataset()
    
    print(f"📈 Dataset loaded with {len(df)} jobs")
    
    # Initialize and train model
    model = JobRecommendationModel()
    accuracy = model.train(df)
    
    # Save the model
    model.save_model('job_recommendation_model.pkl')
    
    # Test the model with sample resume
    print("\n🧪 Testing model with sample resume...")
    sample_resume = """
    Experienced React developer with 5 years of experience in frontend development.
    Proficient in JavaScript, TypeScript, React, Node.js, HTML, and CSS.
    Worked on multiple web applications using modern frontend technologies.
    Experience with REST APIs, state management, and responsive design.
    """
    
    recommendations = model.predict_job_match(sample_resume, df, top_k=3)
    
    print("\n🎯 Sample Recommendations:")
    for i, job in enumerate(recommendations, 1):
        print(f"\n{i}. {job['title']} at {job['company']}")
        print(f"   Match Score: {job['match_score']}%")
        print(f"   Location: {job['location']}")
        print(f"   Salary: {job['salary']}")
        print(f"   Skills: {', '.join(job['skills'][:5])}")
    
    print(f"\n✅ Training completed! Model accuracy: {accuracy:.2%}")

if __name__ == "__main__":
    main()
