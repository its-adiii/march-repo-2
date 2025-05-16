from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Job, Application, Skill

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Skill.objects.all(),
        source='skills',
        required=False
    )
    
    class Meta:
        model = UserProfile
        fields = (
            'id', 'user', 'user_type', 'experience_years', 'location',
            'preferred_job_type', 'bio', 'skills', 'skill_ids',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def validate_experience_years(self, value):
        if value < 0:
            raise serializers.ValidationError("Experience years cannot be negative")
        if value > 50:
            raise serializers.ValidationError("Experience years cannot exceed 50")
        return value

class JobSerializer(serializers.ModelSerializer):
    posted_by = UserSerializer(read_only=True)
    application_count = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    required_skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Skill.objects.all(),
        source='required_skills',
        required=False
    )
    match_score = serializers.FloatField(read_only=True, required=False)
    score_breakdown = serializers.DictField(read_only=True, required=False)
    matching_skills = serializers.ListField(read_only=True, required=False)
    
    class Meta:
        model = Job
        fields = (
            'id', 'title', 'company', 'location', 'description',
            'required_skills', 'skill_ids', 'experience_required',
            'career_level', 'salary_range', 'requirements',
            'employment_type', 'shift', 'industry', 'is_active',
            'posted_by', 'created_at', 'updated_at', 'match_score',
            'score_breakdown', 'matching_skills', 'application_count', 'has_applied'
        )
        read_only_fields = ('id', 'posted_by', 'created_at', 'updated_at', 'application_count', 'has_applied')

    def get_application_count(self, obj):
        return obj.application_set.count()

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.application_set.filter(applicant=request.user).exists()
        return False

    def validate_experience_required(self, value):
        if value < 0:
            raise serializers.ValidationError("Experience required cannot be negative")
        if value > 30:
            raise serializers.ValidationError("Experience required cannot exceed 30 years")
        return value

    def validate_category(self, value):
        valid_categories = ['Blue Collar', 'IT']
        if value not in valid_categories:
            raise serializers.ValidationError(
                f"Category must be one of: {', '.join(valid_categories)}"
            )
        return value

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    applicant = UserSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=Job.objects.all(),
        source='job'
    )
    
    class Meta:
        model = Application
        fields = (
            'id', 'job', 'job_id', 'applicant', 'status',
            'cover_letter', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'applicant', 'created_at', 'updated_at')

    def validate(self, data):
        job = data.get('job')
        request = self.context.get('request')
        
        if not job.is_active:
            raise serializers.ValidationError("This job is no longer active")
        
        if request and request.user.is_authenticated:
            if Application.objects.filter(
                job=job,
                applicant=request.user
            ).exists():
                raise serializers.ValidationError(
                    "You have already applied for this job"
                )
        
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['applicant'] = request.user
        return super().create(validated_data)
