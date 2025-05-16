from django.contrib import admin
from .models import Job, UserProfile, Application, Skill

# Register your models here.

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'location', 'career_level', 'experience_required', 'is_active')
    list_filter = ('career_level', 'is_active', 'location')
    search_fields = ('title', 'company', 'description')
    filter_horizontal = ('required_skills',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'experience_years')
    list_filter = ('experience_years',)
    search_fields = ('user__username', 'user__email')
    filter_horizontal = ('skills',)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'job__title')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name', 'description')
