from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import os
from train_model import JobRecommendationModel
import pdfplumber
import docx
import re
from werkzeug.utils import secure_filename
import tempfile

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize the model
model = JobRecommendationModel()

# Load or create model
if os.path.exists('job_recommendation_model.pkl'):
    print("📂 Loading pre-trained model...")
    model.load_model('job_recommendation_model.pkl')
else:
    print("🤖 Training new model...")
    from train_model import create_sample_dataset, main as train_main
    df = create_sample_dataset()
    model.train(df)
    model.save_model('job_recommendation_model.pkl')

# Load job dataset
def load_job_dataset():
    """Load job dataset from SQLite or fallback"""
    import os
    if os.path.exists('jobs.db'):
        from database import engine
        import pandas as pd
        return pd.read_sql('job_listings', con=engine)
    elif os.path.exists('prepared_jobs.csv'):
        import pandas as pd
        return pd.read_csv('prepared_jobs.csv')
    else:
        from train_model import create_sample_dataset
        return create_sample_dataset()
job_data = load_job_dataset()

# RAM DOWN-SAMPLING: Temporarily restrict to 1,000 random diverse jobs to fit in Render's 512MB limit!
if len(job_data) > 1000:
    print(f"📉 Downsampling {len(job_data)} jobs to 1000 to prevent Render 502 Bad Gateway OOM...")
    job_data = job_data.sample(n=1000, random_state=42).reset_index(drop=True)

# OOM Prevention: Precalculate the intensive TF-IDF Vectors once dynamically at startup!
print("🧠 System: Pre-calculating 21k NLP arrays for instant API serving...")
global_job_features, _ = model.create_features(job_data, is_training=False)
print("✅ Vector Space Active!")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def extract_text_from_docx(file_path):
    """Extract text from DOCX file"""
    text = ""
    try:
        doc = docx.Document(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX: {e}")
    return text

def extract_text_from_doc(file_path):
    """Extract text from DOC file (basic implementation)"""
    # This is a simplified implementation
    # For production, you might want to use antiword or similar tools
    return "DOC file text extraction requires additional dependencies. Please convert to PDF or DOCX."

def extract_resume_text(file_path, file_extension):
    """Extract text from uploaded resume file"""
    if file_extension == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension == 'docx':
        return extract_text_from_docx(file_path)
    elif file_extension == 'doc':
        return extract_text_from_doc(file_path)
    else:
        return "Unsupported file format"

def clean_resume_text(text):
    """Clean and preprocess resume text"""
    if not text:
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove email addresses and phone numbers for privacy
    text = re.sub(r'\S+@\S+', '[EMAIL]', text)
    text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)
    
    # Remove special characters but keep important ones
    text = re.sub(r'[^\w\s\-\.\,\#\+]', ' ', text)
    
    return text.strip()

@app.route('/')
def home():
    """Home page with API documentation"""
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'jobs_in_dataset': len(job_data),
        'version': '1.0.0'
    })

@app.route('/api/upload-cv', methods=['POST'])
def upload_cv():
    """Upload and process CV file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'File type not supported. Please upload PDF, DOC, or DOCX files.'
            }), 400
        
        # Save the file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Extract text from file
        file_extension = filename.rsplit('.', 1)[1].lower()
        resume_text = extract_text_from_pdf(file_path) if file_extension == 'pdf' else extract_resume_text(file_path, file_extension)
        
        # Clean the text
        cleaned_text = clean_resume_text(resume_text)
        
        # Get job recommendations
        recommendations = model.predict_job_match(cleaned_text, job_data, top_k=5, precomputed_job_features=global_job_features)
        
        # Save to database
        try:
            from database import SessionLocal, UserSubmission, MatchResult
            session = SessionLocal()
            
            name = request.form.get('name', 'Anonymous Candidate')
            email = request.form.get('email', 'anonymous@example.com')
            
            user_sub = UserSubmission(name=name, email=email, cv_text=cleaned_text[:5000])
            session.add(user_sub)
            session.commit()
            
            # Save matches
            for rec in recommendations:
                if rec.get('id'):
                    match = MatchResult(
                        user_id=user_sub.id,
                        job_id=rec['id'],
                        match_score=rec['match_score']
                    )
                    session.add(match)
            session.commit()
            session.close()
            print(f"💾 Saved UserSubmission {user_sub.id} to SQLite database!")
        except Exception as db_err:
            print(f"⚠️ Failed to save to DB: {db_err}")
        
        # Clean up the uploaded file
        os.remove(file_path)
        
        return jsonify({
            'success': True,
            'message': 'CV processed successfully',
            'recommendations': recommendations,
            'extracted_text_length': len(cleaned_text)
        })
        
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get job recommendations from text input"""
    try:
        data = request.get_json()
        
        if not data or 'resume_text' not in data:
            return jsonify({'error': 'Resume text is required'}), 400
        
        resume_text = data['resume_text']
        top_k = data.get('top_k', 5)
        
        # Clean the text
        cleaned_text = clean_resume_text(resume_text)
        
        # Get recommendations
        recommendations = model.predict_job_match(cleaned_text, job_data, top_k=top_k, precomputed_job_features=global_job_features)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'error': f'Error generating recommendations: {str(e)}'}), 500

@app.route('/api/jobs', methods=['GET'])
def get_all_jobs():
    """Get all available jobs"""
    try:
        # Convert DataFrame to list of dictionaries
        jobs_list = job_data.to_dict('records')
        
        return jsonify({
            'success': True,
            'jobs': jobs_list,
            'total_jobs': len(jobs_list)
        })
        
    except Exception as e:
        return jsonify({'error': f'Error fetching jobs: {str(e)}'}), 500

@app.route('/api/jobs', methods=['POST'])
def create_job():
    """Create a new job posting"""
    global job_data
    try:
        data = request.get_json()
        
        required_fields = ['title', 'company', 'description', 'location']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({'error': f'Missing required field: {field}'}), 400
                
        # Generate new ID
        new_id = len(job_data) + 1
        
        new_job = {
            'id': new_id,
            'title': data['title'],
            'company': data['company'],
            'description': data['description'],
            'requirements': data.get('requirements', ''),
            'location': data.get('location', 'Remote'),
            'type': data.get('type', 'Full-time'),
            'salary': data.get('salary', 'Not Specified'),
            'experience': data.get('experience', 'Entry-Senior'),
            'skills': data.get('skills', [])
        }
        
        # Append to global job_data dataframe
        job_data = pd.concat([job_data, pd.DataFrame([new_job])], ignore_index=True)
        
        return jsonify({
            'success': True,
            'job': new_job,
            'message': 'Job posted successfully!'
        })
    except Exception as e:
        return jsonify({'error': f'Error posting job: {str(e)}'}), 500

@app.route('/api/jobs/search', methods=['POST'])
def search_jobs():
    """Search jobs by keyword"""
    try:
        data = request.get_json()
        
        if not data or 'keyword' not in data:
            return jsonify({'error': 'Search keyword is required'}), 400
        
        keyword = data['keyword'].lower()
        
        # Search in title, description, and requirements
        mask = (
            job_data['title'].str.lower().str.contains(keyword, na=False) |
            job_data['description'].str.lower().str.contains(keyword, na=False) |
            job_data['requirements'].str.lower().str.contains(keyword, na=False)
        )
        
        filtered_jobs = job_data[mask]
        jobs_list = filtered_jobs.to_dict('records')
        
        return jsonify({
            'success': True,
            'jobs': jobs_list,
            'total_jobs': len(jobs_list),
            'keyword': keyword
        })
        
    except Exception as e:
        return jsonify({'error': f'Error searching jobs: {str(e)}'}), 500

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    try:
        return jsonify({
            'success': True,
            'model_info': {
                'type': 'RandomForestClassifier',
                'features': 'TF-IDF + Skill Extraction',
                'categories': list(model.label_encoder.classes_),
                'dataset_size': len(job_data),
                'accuracy': 'Training completed successfully'
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Error getting model info: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting HireMe AI Backend Server...")
    print("📊 Model loaded with {} jobs".format(len(job_data)))
    print("🌐 Server running on http://localhost:5000")
    print("📚 API Documentation: http://localhost:5000")
    
    app.run(debug=False, host='0.0.0.0', port=5000)
