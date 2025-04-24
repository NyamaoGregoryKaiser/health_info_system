from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HealthProgramViewSet, ClientViewSet, EnrollmentViewSet, 
    ProgramCategoryViewSet, login_view, logout_view, 
    get_csrf_token, get_user_info, dashboard_summary
)

router = DefaultRouter()
router.register(r'programs', HealthProgramViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'program-categories', ProgramCategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/login/', login_view, name='api_login'),
    path('auth/logout/', logout_view, name='api_logout'),
    path('auth/user/', get_user_info, name='user_info'),
    path('csrf-token/', get_csrf_token, name='get_csrf'),
    
    # Dashboard data
    path('dashboard/', dashboard_summary, name='dashboard_summary'),
] 