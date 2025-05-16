from django.core.management.base import BaseCommand
from job_talent_api.models import Job, Skill
import json
import os

class Command(BaseCommand):
    help = 'Load jobs data from jobs.json into the database'

    def handle(self, *args, **options):
        try:
            # Get the path to jobs.json
            current_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            json_file_path = os.path.join(current_dir, 'data', 'jobs.json')
            
            # Read the JSON file
            with open(json_file_path, 'r') as f:
                jobs_data = json.load(f)
            
            jobs_created = 0
            skills_created = 0
            
            # First, clear existing jobs
            self.stdout.write('Clearing existing jobs...')
            Job.objects.all().delete()
            
            self.stdout.write('Loading new jobs...')
            for job_data in jobs_data:
                try:
                    # Extract required_skills before creating job
                    required_skills = job_data.pop('required_skills', [])
                    
                    # Convert experience_required to integer if it's a string
                    if isinstance(job_data.get('experience_required'), str):
                        exp = job_data['experience_required'].split('+')[0]
                        job_data['experience_required'] = int(exp)
                    
                    # Create job
                    job = Job.objects.create(**job_data)
                    jobs_created += 1
                    
                    # Process skills
                    for skill_name in required_skills:
                        skill, skill_created = Skill.objects.get_or_create(
                            name=skill_name,
                            defaults={
                                'category': 'technical'  # Default category
                            }
                        )
                        if skill_created:
                            skills_created += 1
                        job.required_skills.add(skill)
                    
                    job.save()
                    
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Error processing job {job_data.get("title", "Unknown")}: {str(e)}'
                        )
                    )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully loaded {jobs_created} new jobs and {skills_created} new skills'
                )
            )
            
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(
                    f'Could not find jobs.json file at {json_file_path}'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f'Error loading jobs data: {str(e)}'
                )
            )
