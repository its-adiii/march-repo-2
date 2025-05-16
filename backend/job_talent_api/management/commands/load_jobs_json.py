from django.core.management.base import BaseCommand
from job_talent_api.models import Job, Skill
import json
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Load jobs from jobs.json file'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting job import from jobs.json...')
        
        # Clear existing jobs
        Job.objects.all().delete()
        self.stdout.write('Cleared existing jobs')

        # Load jobs from JSON
        data_file = os.path.join(settings.BASE_DIR, 'job_talent_api', 'data', 'jobs.json')
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                jobs_data = json.load(f)
                total_jobs = 0
                
                for job_data in jobs_data:
                    try:
                        # Create job
                        job = Job(
                            title=job_data.get('title', ''),
                            company=job_data.get('company', ''),
                            location=job_data.get('location', ''),
                            description=job_data.get('description', ''),
                            experience_required=job_data.get('experience_required', 0),
                            career_level=self.determine_career_level(job_data.get('experience_required', 0)),
                            salary_range=job_data.get('salary_range', 'Not Specified'),
                            is_active=True
                        )
                        # Set skill_keywords to empty initially
                        job.skill_keywords = ''
                        job.save()
                        
                        # Add skills
                        skills = job_data.get('required_skills', [])
                        for skill_name in skills:
                            skill, _ = Skill.objects.get_or_create(
                                name=skill_name.lower()
                            )
                            job.required_skills.add(skill)
                        
                        # Update skill_keywords after adding skills
                        job.skill_keywords = ' '.join([s.lower() for s in skills])
                        job.save()
                        
                        total_jobs += 1
                        self.stdout.write(f'Created job: {job.title} at {job.company}')
                        
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f'Error creating job: {str(e)}')
                        )
                        continue
                
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully imported {total_jobs} jobs from jobs.json')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error reading jobs.json: {str(e)}')
            )

    def determine_career_level(self, experience):
        experience = float(experience) if experience else 0
        if experience < 2:
            return 'Entry Level'
        elif experience < 5:
            return 'Mid Level'
        elif experience < 8:
            return 'Senior Level'
        else:
            return 'Expert Level'
