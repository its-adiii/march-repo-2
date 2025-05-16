import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

class JobRecommender:
    def __init__(self):
        try:
            # Initialize vectorizers with enhanced settings for better text analysis
            self.skills_vectorizer = TfidfVectorizer(
                stop_words='english',
                ngram_range=(1, 3),
                max_features=1000,
                min_df=1,  # Include terms that appear in at least 1 document
                max_df=0.9,  # Exclude terms that appear in more than 90% of documents
                token_pattern=r'(?u)\b\w[\w+#-]*\w\b',  # Allow special chars in skills
                analyzer='word',
                sublinear_tf=True  # Apply sublinear scaling to term frequencies
            )
            
            self.text_vectorizer = TfidfVectorizer(
                stop_words='english',
                ngram_range=(1, 3),
                max_features=5000,
                min_df=1,
                max_df=0.9,
                analyzer='word',
                sublinear_tf=True
            )
            
            self.description_vectorizer = TfidfVectorizer(
                stop_words='english',
                ngram_range=(1, 2),
                max_features=3000,
                min_df=1,
                max_df=0.95,
                analyzer='word',
                sublinear_tf=True
            )
        except Exception as e:
            print(f"Error initializing vectorizers: {str(e)}")
            raise

        # Enhanced profession-specific keywords with more detailed categorization
        self.profession_keywords = {
            'cnc': {
                'primary': [
                    'cnc', 'machining', 'programmer', 'operator', 'g-code', 'cam', 'machinist',
                    'fanuc', 'haas', 'mastercam', 'turning', 'milling', 'lathe', 'toolpath'
                ],
                'secondary': [
                    'manufacturing', 'tooling', 'production', 'mechanical', 'quality control',
                    'inspection', 'precision', 'measurement', 'blueprint reading', 'cad',
                    'machine setup', 'preventive maintenance', 'troubleshooting'
                ],
                'tools': [
                    'calipers', 'micrometers', 'gauges', 'cutting tools', 'fixtures',
                    'coordinate measuring machine', 'cmm', 'indicators'
                ],
                'certifications': [
                    'nims', 'mastercam certification', 'fanuc certification',
                    'haas certification', 'apprenticeship'
                ]
            },
            'welding': {
                'primary': [
                    'welding', 'welder', 'mig', 'tig', 'arc', 'fabrication',
                    'shielded metal arc welding', 'gas metal arc welding', 'gas tungsten arc welding'
                ],
                'secondary': [
                    'metal', 'steel', 'aluminum', 'fabricator', 'boilermaker',
                    'pipefitter', 'sheet metal', 'structural steel'
                ],
                'tools': [
                    'welding machine', 'mig welder', 'tig welder', 'arc welder',
                    'shielding gas', 'welding helmet', 'welding gloves'
                ],
                'certifications': [
                    'aws certification', 'asme certification', 'api certification',
                    'csa certification', 'apprenticeship'
                ]
            },
            'textile': {
                'primary': [
                    'textile', 'designer', 'handloom', 'jacquard', 'weaving', 'fabric',
                    'apparel', 'garment', 'fashion', 'knitting'
                ],
                'secondary': [
                    'pattern', 'design', 'material', 'fashion', 'style',
                    'color', 'texture', 'fiber', 'yarn'
                ],
                'tools': [
                    'loom', 'jacquard machine', 'computer-aided design', 'cad',
                    'textile testing equipment', 'color matching software'
                ],
                'certifications': [
                    'aicca certification', 'itaa certification', 'astm certification',
                    'iso certification', 'apprenticeship'
                ]
            },
            'accounts': {
                'primary': [
                    'accounts', 'payroll', 'accounting', 'finance', 'salary',
                    'general ledger', 'journal entry', 'financial statement'
                ],
                'secondary': [
                    'reconciliation', 'ledger', 'balance sheet', 'tax',
                    'budgeting', 'forecasting', 'financial analysis'
                ],
                'tools': [
                    'quickbooks', 'xero', 'sage', 'erp', 'accounting software',
                    'spreadsheets', 'financial modeling'
                ],
                'certifications': [
                    'cpa certification', 'cba certification', 'cma certification',
                    'cfm certification', 'apprenticeship'
                ]
            },
            'assembly': {
                'primary': [
                    'assembly', 'operator', 'production', 'manufacturing', 'mechanical',
                    'electrical', 'electronic', 'quality control'
                ],
                'secondary': [
                    'quality', 'inspection', 'tools', 'components',
                    'soldering', 'wiring', 'circuit boards'
                ],
                'tools': [
                    'screwdriver', 'wrench', 'pliers', 'wire cutters',
                    'soldering iron', 'multimeter', 'oscilloscope'
                ],
                'certifications': [
                    'ipc certification', 'iso certification', 'six sigma certification',
                    'lean manufacturing certification', 'apprenticeship'
                ]
            }
        }

    def identify_profession(self, text):
        """Enhanced profession identification with more sophisticated scoring"""
        text = text.lower()
        profession_scores = {}
        
        for profession, keywords in self.profession_keywords.items():
            score = 0
            # Primary keywords carry highest weight (4x)
            score += sum(4 for keyword in keywords['primary'] if keyword in text)
            # Secondary keywords (2x)
            score += sum(2 for keyword in keywords['secondary'] if keyword in text)
            # Tools and certifications (1.5x)
            if 'tools' in keywords:
                score += sum(1.5 for tool in keywords['tools'] if tool in text)
            if 'certifications' in keywords:
                score += sum(1.5 for cert in keywords['certifications'] if cert in text)
            
            # Additional scoring for job title matches
            title_patterns = [
                f'{profession}\\s+(?:operator|programmer|technician|specialist)',
                f'senior\\s+{profession}',
                f'lead\\s+{profession}',
                f'{profession}\\s+supervisor'
            ]
            for pattern in title_patterns:
                if re.search(pattern, text):
                    score += 5  # Heavy weight for title matches
            
            profession_scores[profession] = score
        
        # Return profession with highest score, but only if score is significant
        max_score = max(profession_scores.values())
        if max_score > 0:
            return max(profession_scores.items(), key=lambda x: x[1])[0]
        return None

    def extract_skills(self, text):
        """Extract skills from text using common patterns"""
        text = text.lower()
        skills = set()  # Use set to avoid duplicates
        
        # Add profession-specific skills based on identified profession
        profession = self.identify_profession(text)
        if profession in self.profession_keywords:
            skills.update(self.profession_keywords[profession]['primary'])
            skills.update(self.profession_keywords[profession]['secondary'])
        
        # Extract skills from patterns
        skill_patterns = [
            r'proficient (?:in|with)\s+([\w\s,/\-+#]+)',
            r'experience (?:with|in)\s+([\w\s,/\-+#]+)',
            r'knowledge of\s+([\w\s,/\-+#]+)',
            r'skilled (?:with|in)\s+([\w\s,/\-+#]+)',
            r'expertise in\s+([\w\s,/\-+#]+)',
            r'familiar with\s+([\w\s,/\-+#]+)',
            r'competent in\s+([\w\s,/\-+#]+)',
            r'certified in\s+([\w\s,/\-+#]+)',
            r'(\w+(?:\s+\w+)*)\s+(?:operator|programmer|designer|executive)',
            r'(?:using|operate|program)\s+([\w\s,/\-+#]+)',
            r'(?:trained|certified) (?:in|on)\s+([\w\s,/\-+#]+)',
            r'(?:specializing|specialized) in\s+([\w\s,/\-+#]+)',
            r'\b(cnc|g-code|cam|haas|fanuc|mastercam)\b'  # Specific CNC-related terms
        ]
        
        for pattern in skill_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                # Split by common delimiters and add individual skills
                if match.groups():
                    new_skills = re.split(r'[,/&]|\band\b', match.group(1))
                    skills.update(skill.strip() for skill in new_skills if skill.strip())
        
        # Add explicitly mentioned technical terms
        technical_terms = [
            'cnc programming', 'g-code', 'cam software', 'machining', 'cnc operation',
            'fanuc', 'haas', 'mastercam', 'tooling', 'quality inspection',
            'welding', 'mig welding', 'tig welding', 'arc welding', 'fabrication',
            'textile design', 'jacquard', 'handloom', 'weaving',
            'payroll processing', 'accounting', 'sap hr',
            'mechanical assembly', 'quality control', 'production'
        ]
        
        for term in technical_terms:
            if term in text:
                skills.add(term)
        
        return ' '.join(skills)

    def preprocess_job(self, job):
        """Enhanced job preprocessing with stronger profession matching"""
        # Extract skills with heavy weighting for profession-specific skills
        skills_text = ' '.join(job['required_skills']) if isinstance(job['required_skills'], list) else str(job['required_skills'])
        title_text = job['title'].lower()
        description_text = job['description'].lower()
        
        # Identify job profession with enhanced confidence
        job_profession = None
        max_score = 0
        
        for prof, keywords in self.profession_keywords.items():
            score = 0
            # Check title (highest weight)
            title_keywords = keywords['primary'] + [f"{prof} operator", f"{prof} programmer", f"senior {prof}"]
            score += sum(8 for keyword in title_keywords if keyword in title_text)
            
            # Check description
            score += sum(3 for keyword in keywords['primary'] if keyword in description_text)
            score += sum(2 for keyword in keywords['secondary'] if keyword in description_text)
            
            if score > max_score:
                max_score = score
                job_profession = prof
        
        # Apply stronger profession-specific weighting
        if job_profession:
            keywords = self.profession_keywords[job_profession]
            # Add primary keywords with very high weight
            primary_keywords = ' '.join(keywords['primary'])
            skills_text = f"{skills_text} {primary_keywords} " * 8
            
            # Add secondary keywords with medium weight
            secondary_keywords = ' '.join(keywords['secondary'])
            skills_text = f"{skills_text} {secondary_keywords} " * 4
            
            # Add tools and certifications
            if 'tools' in keywords:
                tools = ' '.join(keywords['tools'])
                skills_text = f"{skills_text} {tools} " * 2
            
            if 'certifications' in keywords:
                certs = ' '.join(keywords['certifications'])
                skills_text = f"{skills_text} {certs} " * 2
            
            # Heavy weight for title
            title_text = f"{title_text} " * 10
        
        # Combine all text with appropriate weighting
        general_text = f"{title_text} {description_text}"
        
        return skills_text.lower(), general_text.lower(), job_profession

    def calculate_similarity_scores(self, resume_text, job):
        """Calculate detailed similarity scores between resume and job"""
        try:
            # Input validation
            if not resume_text or not job:
                return {
                    'combined_score': 0,
                    'skills_score': 0,
                    'description_score': 0,
                    'title_score': 0
                }
            
            # 1. Skills Similarity
            resume_skills = self.extract_skills(resume_text)
            job_skills = ' '.join(job.get('required_skills', [])) if isinstance(job.get('required_skills'), list) else str(job.get('required_skills', ''))
            
            skills_matrix = self.skills_vectorizer.fit_transform([resume_skills, job_skills])
            skills_similarity = cosine_similarity(skills_matrix[0:1], skills_matrix[1:])[0][0]
            
            # 2. Description Similarity
            job_description = job.get('description', '').lower()
            desc_matrix = self.description_vectorizer.fit_transform([resume_text.lower(), job_description])
            description_similarity = cosine_similarity(desc_matrix[0:1], desc_matrix[1:])[0][0]
            
            # 3. Title Relevance
            job_title = job.get('title', '').lower()
            title_matrix = self.text_vectorizer.fit_transform([resume_text.lower(), job_title])
            title_similarity = cosine_similarity(title_matrix[0:1], title_matrix[1:])[0][0]
            
            # Calculate weighted similarity score
            weights = {
                'skills': 0.5,       # 50% weight for skills match
                'description': 0.3,  # 30% weight for description match
                'title': 0.2        # 20% weight for title match
            }
            
            combined_similarity = (
                skills_similarity * weights['skills'] +
                description_similarity * weights['description'] +
                title_similarity * weights['title']
            )
            
            return {
                'combined_score': combined_similarity,
                'skills_score': skills_similarity,
                'description_score': description_similarity,
                'title_score': title_similarity
            }
        except Exception as e:
            print(f"Error in calculate_similarity_scores: {str(e)}")
            return {
                'combined_score': 0,
                'skills_score': 0,
                'description_score': 0,
                'title_score': 0
            }

    def calculate_role_fit(self, resume_text, job, skills_similarity, profession_match):
        """Calculate role fit score (0-100) based on multiple factors"""
        # Initialize weights for different components
        weights = {
            'skills_match': 0.4,        # 40% weight for skills match
            'profession_match': 0.3,    # 30% weight for profession match
            'experience_match': 0.2,    # 20% weight for experience match
            'education_match': 0.1      # 10% weight for education match
        }
        
        scores = {}
        
        # 1. Skills Match Score (0-100)
        scores['skills_match'] = min(skills_similarity * 100, 100)
        
        # 2. Profession Match Score (0-100)
        scores['profession_match'] = 100 if profession_match else 0
        
        # 3. Experience Match Score (0-100)
        experience_patterns = [
            r'(\d+)\+?\s*(?:year|yr)s?\s*(?:of\s*)?experience',
            r'experience\s*(?:of|:)?\s*(\d+)\+?\s*(?:year|yr)s?',
            r'worked\s*(?:for)?\s*(\d+)\+?\s*(?:year|yr)s?'
        ]
        
        resume_experience = 0
        for pattern in experience_patterns:
            matches = re.finditer(pattern, resume_text.lower())
            for match in matches:
                years = int(match.group(1))
                resume_experience = max(resume_experience, years)
        
        required_exp = 0
        if 'experience' in job and isinstance(job['experience'], str):
            for pattern in experience_patterns:
                matches = re.finditer(pattern, job['experience'].lower())
                for match in matches:
                    years = int(match.group(1))
                    required_exp = max(required_exp, years)
        
        if required_exp == 0:
            scores['experience_match'] = 100  # No experience requirement specified
        else:
            # Score based on how close the experience matches
            experience_ratio = min(resume_experience / required_exp, 1.5)  # Cap at 150%
            scores['experience_match'] = min(experience_ratio * 100, 100)
        
        # 4. Education Match Score (0-100)
        education_levels = {
            'phd': 5,
            'master': 4,
            'bachelor': 3,
            'diploma': 2,
            'certificate': 1
        }
        
        education_patterns = [
            r'\b(?:phd|ph\.d|doctorate)\b',
            r'\b(?:master|mba|m\.tech|m\.sc|m\.e)\b',
            r'\b(?:bachelor|b\.tech|b\.e|b\.sc)\b',
            r'\b(?:diploma)\b',
            r'\b(?:certificate|certification)\b'
        ]
        
        resume_edu_level = 0
        for level, pattern in zip(education_levels.values(), education_patterns):
            if re.search(pattern, resume_text.lower()):
                resume_edu_level = max(resume_edu_level, level)
        
        required_edu_level = 0
        if 'requirements' in job and isinstance(job['requirements'], str):
            for level, pattern in zip(education_levels.values(), education_patterns):
                if re.search(pattern, job['requirements'].lower()):
                    required_edu_level = max(required_edu_level, level)
        
        if required_edu_level == 0:
            scores['education_match'] = 100  # No education requirement specified
        else:
            # Score based on education level match
            edu_ratio = min(resume_edu_level / required_edu_level, 1.5)  # Cap at 150%
            scores['education_match'] = min(edu_ratio * 100, 100)
        
        # Calculate weighted average for final role fit score
        role_fit = sum(scores[component] * weight 
                      for component, weight in weights.items())
        
        return int(role_fit), scores

    def get_recommendations(self, resume_text, jobs, num_recommendations=10):
        """Enhanced recommendation logic with improved TF-IDF similarity calculation"""
        if not jobs or not resume_text:
            return []

        # Identify profession from resume with confidence threshold
        resume_profession = self.identify_profession(resume_text)
        if not resume_profession:
            return []
        
        # Filter jobs by profession first
        filtered_jobs = []
        for job in jobs:
            _, _, job_profession = self.preprocess_job(job)
            if job_profession == resume_profession:
                filtered_jobs.append(job)
        
        if not filtered_jobs:
            return []

        try:
            # Calculate similarity scores for each job
            job_scores = []
            for job in filtered_jobs:
                similarity_scores = self.calculate_similarity_scores(resume_text, job)
                role_fit, component_scores = self.calculate_role_fit(
                    resume_text,
                    job,
                    similarity_scores['skills_score'],
                    True
                )
                
                # Calculate final score with weights
                final_score = (
                    similarity_scores['combined_score'] * 0.6 +  # 60% TF-IDF similarity
                    (role_fit / 100) * 0.4                      # 40% role fit
                )
                
                job_scores.append({
                    'job': job,
                    'final_score': final_score,
                    'similarity_scores': similarity_scores,
                    'role_fit': role_fit,
                    'role_fit_breakdown': component_scores
                })
            
            # Sort by final score and get top recommendations
            job_scores.sort(key=lambda x: x['final_score'], reverse=True)
            top_recommendations = job_scores[:num_recommendations]
            
            # Format recommendations
            recommendations = []
            for score in top_recommendations:
                recommendations.append({
                    'job': score['job'],
                    'similarity_score': float(score['final_score']),
                    'skills_match_score': float(score['similarity_scores']['skills_score']),
                    'profession_match': True,
                    'role_fit': score['role_fit'],
                    'role_fit_breakdown': {
                        'skills_match': int(score['role_fit_breakdown']['skills_match']),
                        'profession_match': 100,
                        'experience_match': int(score['role_fit_breakdown']['experience_match']),
                        'education_match': int(score['role_fit_breakdown']['education_match'])
                    },
                    'similarity_breakdown': {
                        'skills_similarity': float(score['similarity_scores']['skills_score']),
                        'description_similarity': float(score['similarity_scores']['description_score']),
                        'title_similarity': float(score['similarity_scores']['title_score'])
                    }
                })
            
            return recommendations

        except Exception as e:
            print(f"Error in get_recommendations: {str(e)}")
            return []
