from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from . import views

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'profiles', views.UserProfileViewSet)
router.register(r'jobs', views.JobViewSet)
router.register(r'applications', views.ApplicationViewSet)
router.register(r'skills', views.SkillViewSet)

# The API URLs are determined automatically by the router
urlpatterns = [
    # Authentication endpoints
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Include the router URLs
    path('', include(router.urls)),
]
