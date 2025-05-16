from rest_framework import viewsets, status, filters, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from typing import List, Dict, Set, Any
from django.db.models import Q
import logging
from datetime import datetime
import random
from functools import lru_cache
import os
from django.conf import settings
from django.contrib.auth.models import User
from .models import Job, Skill, UserProfile, Application
from .serializers import JobSerializer, UserSerializer, UserProfileSerializer, ApplicationSerializer, SkillSerializer
from .ml_recommender import JobRecommender

logger = logging.getLogger(__name__)

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = []
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'company', 'location', 'description']
    ordering_fields = ['created_at', 'updated_at', 'title']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.job_recommender = JobRecommender()
        # Cache common skill patterns
        self._skill_patterns = self._initialize_skill_patterns()

    @staticmethod
    @lru_cache(maxsize=1)
    def _initialize_skill_patterns() -> Dict[str, Set[str]]:
        """Cache skill patterns for reuse."""
        return {
            'python': {'python', 'py', 'python3', 'django', 'flask', 'fastapi'},
            'java': {'java', 'java8', 'java11', 'j2ee', 'spring', 'hibernate'},
            'javascript': {'javascript', 'js', 'es6', 'ecmascript', 'node.js', 'typescript'},
            'sql': {'sql', 'mysql', 'postgresql', 'oracle', 'sqlite', 'plsql'},
            'nosql': {'mongodb', 'dynamodb', 'cassandra', 'redis', 'couchdb'},
            'web': {'html', 'css', 'react', 'angular', 'vue', 'jquery', 'bootstrap'},
            'cloud': {'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes'},
            'devops': {'docker', 'kubernetes', 'jenkins', 'ci/cd', 'git', 'terraform'},
            'ml': {'machine learning', 'deep learning', 'ai', 'nlp', 'tensorflow', 'pytorch'},
            'mobile': {'android', 'ios', 'swift', 'kotlin', 'react native', 'flutter'},
            'cnc_programmer': {'cnc', 'g-code', 'm-code', 'cnc milling', 'lathe', 'fanuc', 'siemens', 'cad', 'cam', 'cnc programming'},
            'welding_operator': {'welding', 'arc welding', 'mig', 'tig', 'mma', 'gas welding', 'fabrication', 'weld inspection', 'smaw', 'fca'},
            'textile_designer_handloom_jacquard': {'handloom', 'jacquard', 'weaving', 'fabric design', 'loom operation', 'textile patterns', 'yarn', 'threading', 'dobby', 'color matching'},
            'accounts_executive_payroll': {'payroll', 'salary processing', 'tally', 'excel', 'erp', 'gst', 'epf', 'esi', 'financial reporting', 'payroll management'},
            'mechanical_assembly_operator_ele': {'assembly', 'mechanical assembly', 'electrical components', 'wiring', 'blueprints', 'soldering', 'tools', 'precision assembly', 'mechatronics', 'quality inspection'}
        }

    def get_queryset(self):
        """Get active jobs with optional filters."""
        queryset = Job.objects.filter(is_active=True)
        location = self.request.query_params.get('location')
        experience = self.request.query_params.get('experience')
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        if experience:
            queryset = queryset.filter(experience_required__lte=float(experience))
            
        return queryset

    @action(detail=False, methods=['POST'])
    def upload_cv(self, request):
        """Process CV upload with improved error handling and validation."""
        try:
            self._validate_cv_file(request.FILES)
            cv_text = self._process_cv_file(request.FILES['cv_file'])
            
            analysis_results = self._analyze_cv(cv_text)
            matching_jobs = self.get_job_recommendations(
                cv_text, 
                analysis_results['experience_years']
            )

            return Response({
                'message': 'CV processed successfully',
                **analysis_results,
                'recommendations': matching_jobs
            })

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error processing CV: {str(e)}")
            return Response(
                {'error': 'Internal server error processing CV'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _validate_cv_file(self, files):
        """Validate CV file presence, format and size."""
        if 'cv_file' not in files:
            raise ValueError('No CV file provided')
            
        cv_file = files['cv_file']
        if not cv_file.name.lower().endswith('.pdf'):
            raise ValueError('Only PDF files are supported')
            
        if cv_file.size > settings.MAX_UPLOAD_SIZE:
            raise ValueError(f'File too large. Maximum size is {settings.MAX_UPLOAD_SIZE/1024/1024}MB')

    def _process_cv_file(self, cv_file) -> str:
        """Process CV file with automatic cleanup."""
        os.makedirs(settings.TEMP_CV_DIR, exist_ok=True)
        temp_path = os.path.join(settings.TEMP_CV_DIR, cv_file.name)

        try:
            with open(temp_path, 'wb+') as destination:
                for chunk in cv_file.chunks():
                    destination.write(chunk)
            return self.extract_text_from_pdf(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def _analyze_cv(self, cv_text: str) -> Dict[str, Any]:
        """Analyze CV text and extract relevant information."""
        extracted_skills = self.extract_skills(cv_text)
        experience_years = self.extract_experience(cv_text)
        career_level = self.determine_career_level(experience_years)

        logger.info(f"CV Analysis - Skills: {extracted_skills}, "
                   f"Experience: {experience_years}, Level: {career_level}")

        return {
            'extracted_skills': list(extracted_skills),
            'experience_years': experience_years,
            'career_level': career_level
        }

    def get_job_recommendations(self, cv_text: str, experience_years: float) -> List[Dict]:
        """Get job recommendations with improved scoring and diversity."""
        cv_skills = self.extract_skills(cv_text.lower())
        jobs_data = self._prepare_jobs_data()
        
        scored_jobs = self._score_jobs(
            cv_text, cv_skills, experience_years, jobs_data
        )
        diverse_recommendations = self._apply_diversity(scored_jobs)
        
        return self._format_recommendations(diverse_recommendations[:8])

    def _prepare_jobs_data(self) -> List[Dict]:
        """Prepare job data for processing."""
        return [{
            'job': job,
            'description': f"{job.title} {job.description}",
            'skills': set(skill.name.lower() for skill in job.required_skills.all())
        } for job in Job.objects.filter(is_active=True)]

    def _score_jobs(self, cv_text: str, cv_skills: Set[str], 
                   experience_years: float, jobs_data: List[Dict]) -> List[Dict]:
        """Score jobs based on multiple criteria."""
        scored_jobs = []
        
        for job_data in jobs_data:
            ml_scores = self.job_recommender.calculate_enhanced_score(
                cv_text, job_data['description'], cv_skills, job_data['skills']
            )
            
            exp_score = self._calculate_experience_score(
                experience_years, job_data['job'].experience_required
            )
            career_score = self.calculate_career_level_score(
                experience_years, job_data['job'].career_level
            ) * 10
            diversity_bonus = random.uniform(0, 5)
            
            total_score = (
                ml_scores[0] * 0.65 +  # ML score weight
                exp_score * 0.20 +     # Experience score weight
                career_score * 0.10 +  # Career level score weight
                diversity_bonus * 0.05  # Diversity bonus weight
            )
            
            scored_jobs.append({
                'job': job_data['job'],
                'total_score': total_score,
                'scores': {
                    'ml_score': ml_scores[0],
                    'exp_score': exp_score,
                    'career_score': career_score,
                    'diversity_bonus': diversity_bonus
                },
                'matching_skills': list(cv_skills.intersection(job_data['skills'])),
                'required_skills': list(job_data['skills'])
            })
            
        return sorted(scored_jobs, key=lambda x: x['total_score'], reverse=True)

    @staticmethod
    def _calculate_experience_score(candidate_exp: float, required_exp: float) -> float:
        """Calculate experience match score with exponential decay."""
        exp_diff = abs(float(required_exp) - float(candidate_exp))
        return max(0, (1 - exp_diff/10)) * 20

    def _format_recommendations(self, recommendations: List[Dict]) -> List[Dict]:
        """Format recommendations for API response."""
        return [{
            'id': rec['job'].id,
            'title': rec['job'].title,
            'company': rec['job'].company,
            'location': rec['job'].location,
            'description': rec['job'].description,
            'experience_required': rec['job'].experience_required,
            'career_level': rec['job'].career_level,
            'matching_skills': rec['matching_skills'],
            'required_skills': rec['required_skills'],
            'match_score': round(rec['total_score'], 2),
            'score_breakdown': {
                'ml_score': round(rec['scores']['ml_score'], 2),
                'experience_score': round(rec['scores']['exp_score'], 2),
                'career_level_score': round(rec['scores']['career_score'], 2),
                'diversity_bonus': round(rec['scores']['diversity_bonus'], 2)
            }
        } for rec in recommendations]

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file."""
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise ValueError("Failed to extract text from PDF file")

    def extract_skills(self, text: str) -> Set[str]:
        """Extract skills from text using cached patterns."""
        skills = set()
        text = text.lower()
        
        # Check for exact matches
        for skill_group, patterns in self._skill_patterns.items():
            for pattern in patterns:
                if pattern in text:
                    skills.add(skill_group)
                    break
        
        # Get skills from database that appear in text
        db_skills = Skill.objects.all()
        for skill in db_skills:
            if skill.name.lower() in text:
                skills.add(skill.name.lower())
            # Check aliases
            for alias in skill.aliases:
                if alias.lower() in text:
                    skills.add(skill.name.lower())
                    break
        
        return skills

    def extract_experience(self, text: str) -> float:
        """Extract years of experience from text."""
        import re
        text = text.lower()
        experience = 0.0
        
        # Common patterns for experience
        patterns = [
            r'(\d+(?:\.\d+)?)\s*(?:\+\s*)?years?\s+(?:of\s+)?experience',
            r'experience\s*(?:of|:)?\s*(\d+(?:\.\d+)?)\s*(?:\+\s*)?years?',
            r'worked\s*(?:for)?\s*(\d+(?:\.\d+)?)\s*(?:\+\s*)?years?'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                years = float(match.group(1))
                experience = max(experience, years)
        
        return experience

    def determine_career_level(self, experience_years: float) -> str:
        """Determine career level based on years of experience."""
        if experience_years < 2:
            return 'Entry Level'
        elif experience_years < 5:
            return 'Mid Level'
        elif experience_years < 8:
            return 'Senior Level'
        else:
            return 'Expert Level'

    def calculate_career_level_score(self, candidate_exp: float, job_level: str) -> float:
        """Calculate how well candidate's experience matches job level."""
        level_ranges = {
            'Entry Level': (0, 2),
            'Mid Level': (2, 5),
            'Senior Level': (5, 8),
            'Expert Level': (8, float('inf'))
        }
        
        job_range = level_ranges.get(job_level, (0, float('inf')))
        if job_range[0] <= candidate_exp <= job_range[1]:
            return 1.0
        
        # Calculate distance to range
        if candidate_exp < job_range[0]:
            distance = job_range[0] - candidate_exp
        else:
            distance = candidate_exp - job_range[1]
        
        return max(0, 1 - (distance / 5))  # Linear decay over 5 years

    def _apply_diversity(self, scored_jobs: List[Dict]) -> List[Dict]:
        """Apply diversity to recommendations to avoid similar jobs."""
        if not scored_jobs:
            return []
            
        diverse_jobs = [scored_jobs[0]]  # Start with highest scored job
        remaining_jobs = scored_jobs[1:]
        
        while remaining_jobs and len(diverse_jobs) < 8:
            # Calculate diversity scores
            max_diversity_score = float('-inf')
            most_diverse_idx = 0
            
            for i, job in enumerate(remaining_jobs):
                # Calculate average similarity to selected jobs
                avg_similarity = sum(
                    self._calculate_job_similarity(job['job'], selected['job'])
                    for selected in diverse_jobs
                ) / len(diverse_jobs)
                
                # Combine original score with diversity
                diversity_score = job['total_score'] * (1 - avg_similarity)
                
                if diversity_score > max_diversity_score:
                    max_diversity_score = diversity_score
                    most_diverse_idx = i
            
            # Add most diverse job to selection
            diverse_jobs.append(remaining_jobs.pop(most_diverse_idx))
        
        return diverse_jobs

    def _calculate_job_similarity(self, job1: Job, job2: Job) -> float:
        """Calculate similarity between two jobs."""
        # Compare skills
        skills1 = set(skill.name.lower() for skill in job1.required_skills.all())
        skills2 = set(skill.name.lower() for skill in job2.required_skills.all())
        skill_similarity = len(skills1.intersection(skills2)) / len(skills1.union(skills2)) if skills1 or skills2 else 0
        
        # Compare titles
        from difflib import SequenceMatcher
        title_similarity = SequenceMatcher(None, job1.title.lower(), job2.title.lower()).ratio()
        
        # Compare companies (lower weight if different companies)
        company_factor = 1.0 if job1.company.lower() == job2.company.lower() else 0.7
        
        return (0.5 * skill_similarity + 0.3 * title_similarity) * company_factor


class SkillViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows skills to be viewed or edited.
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = []  # Add appropriate permissions in production

    def get_queryset(self):
        """
        Optionally restricts the returned skills,
        by filtering against query parameters in the URL.
        """
        queryset = Skill.objects.all()
        name = self.request.query_params.get('name', None)
        if name is not None:
            queryset = queryset.filter(name__icontains=name)
        return queryset.order_by('name')


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = []  # Add appropriate permissions in production

    def get_queryset(self):
        """
        Optionally restricts the returned users,
        by filtering against query parameters in the URL.
        """
        queryset = User.objects.all()
        username = self.request.query_params.get('username', None)
        if username is not None:
            queryset = queryset.filter(username__icontains=username)
        return queryset

    @action(detail=False, methods=['GET'])
    def me(self, request):
        """
        Get current user's profile
        """
        if request.user.is_authenticated:
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        return Response(status=status.HTTP_401_UNAUTHORIZED)


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows user profiles to be viewed or edited.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = []  # Add appropriate permissions in production

    def get_queryset(self):
        """
        Optionally restricts the returned profiles to the current user.
        """
        queryset = UserProfile.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset

    def perform_create(self, serializer):
        """
        Set the user profile owner to the current user when creating.
        """
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['GET'])
    def me(self, request):
        """
        Get current user's profile
        """
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows job applications to be viewed or edited.
    """
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = []  # Add appropriate permissions in production

    def get_queryset(self):
        """
        Optionally restricts the returned applications to a given user,
        by filtering against query parameters in the URL.
        """
        queryset = Application.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        
        status = self.request.query_params.get('status', None)
        if status is not None:
            queryset = queryset.filter(status=status)
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """
        Set the application owner to the current user when creating.
        """
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def update_status(self, request, pk=None):
        """
        Update application status
        """
        application = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Application.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        application.status = new_status
        application.save()
        
        serializer = self.get_serializer(application)
        return Response(serializer.data)