from django.db import models
from django.contrib.auth.models import User

class Skill(models.Model):
    SKILL_CATEGORIES = [
        ('technical', 'Technical'),
        ('soft', 'Soft Skills'),
        ('domain', 'Domain Knowledge'),
        ('tools', 'Tools'),
        ('other', 'Other')
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=SKILL_CATEGORIES, default='technical')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # New fields for ML-based matching
    aliases = models.JSONField(default=list, help_text="Alternative names for this skill")
    related_skills = models.ManyToManyField('self', blank=True, symmetrical=True, help_text="Related skills")
    skill_vector = models.JSONField(null=True, blank=True, help_text="Stored skill vector for ML")

    def __str__(self):
        return self.name

class Job(models.Model):
    CAREER_LEVEL_CHOICES = [
        ('Entry Level', 'Entry Level'),
        ('Mid Level', 'Mid Level'),
        ('Senior Level', 'Senior Level'),
        ('Expert Level', 'Expert Level')
    ]

    EMPLOYMENT_TYPE_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
        ('Temporary', 'Temporary'),
        ('Internship', 'Internship')
    ]

    SHIFT_CHOICES = [
        ('Day shift', 'Day shift'),
        ('Night shift', 'Night shift'),
        ('Rotating shift', 'Rotating shift'),
        ('Flexible', 'Flexible')
    ]

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    description = models.TextField()
    required_skills = models.ManyToManyField(Skill, related_name='jobs')
    experience_required = models.IntegerField(default=0)
    career_level = models.CharField(max_length=50, choices=CAREER_LEVEL_CHOICES, default='Entry Level')
    salary_range = models.CharField(max_length=100, default="Not Specified")
    
    # New fields
    requirements = models.TextField(blank=True, null=True)
    employment_type = models.CharField(max_length=50, choices=EMPLOYMENT_TYPE_CHOICES, default='Full-time')
    shift = models.CharField(max_length=50, choices=SHIFT_CHOICES, default='Day shift')
    industry = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # New fields for ML-based recommendations
    skill_keywords = models.TextField(blank=True, help_text="Keywords extracted from skills")
    job_vector = models.JSONField(null=True, blank=True, help_text="Stored job vector for ML")
    similar_jobs = models.ManyToManyField('self', blank=True, symmetrical=False, help_text="Similar jobs based on ML")

    def save(self, *args, **kwargs):
        # Only update skill_keywords if it's not explicitly set
        if not self.skill_keywords and self.pk and self.required_skills.exists():
            self.skill_keywords = ' '.join([skill.name for skill in self.required_skills.all()])
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} at {self.company}"

    class Meta:
        ordering = ['-created_at']

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    skills = models.ManyToManyField(Skill, related_name='users')
    experience_years = models.IntegerField(default=0)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    preferred_locations = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.username}"

class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Reviewing'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cover_letter = models.TextField(blank=True)
    resume = models.FileField(upload_to='applications/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s application for {self.job.title}"

    class Meta:
        unique_together = ('user', 'job')
