from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from job_talent_api.models import UserProfile, Skill
from django.db import transaction

class Command(BaseCommand):
    help = 'Create a test user with profile'

    def handle(self, *args, **kwargs):
        try:
            with transaction.atomic():
                # Create test user
                username = 'testuser'
                email = 'test@example.com'
                password = 'testpass123'

                # Delete existing user if exists
                User.objects.filter(username=username).delete()

                # Create new user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name='Test',
                    last_name='User'
                )
                
                # Create user profile
                profile = UserProfile.objects.create(
                    user=user,
                    user_type='job_seeker',
                    experience_years=5,
                    location='Bangalore, India',
                    preferred_job_type='IT',
                    bio='Experienced software developer looking for opportunities'
                )

                # Add some skills to the profile
                it_skills = Skill.objects.filter(category='IT')[:5]
                general_skills = Skill.objects.filter(category='Both')[:3]
                
                for skill in list(it_skills) + list(general_skills):
                    profile.skills.add(skill)

                self.stdout.write(self.style.SUCCESS(
                    f'Successfully created test user:\n'
                    f'Username: {username}\n'
                    f'Password: {password}\n'
                    f'Email: {email}'
                ))

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating test user: {str(e)}')
            )
