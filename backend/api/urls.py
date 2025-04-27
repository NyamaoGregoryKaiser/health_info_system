from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    HealthProgramViewSet, ClientViewSet, EnrollmentViewSet, 
    ProgramCategoryViewSet, login_view, logout_view, 
    get_csrf_token, get_user_info, dashboard_summary,
    register_client, program_search, client_search,
    external_client_profile
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
    
    # Registration endpoint
    path('clients/register/', register_client, name='register_client'),
    
    # Token authentication
    path('auth/token/', obtain_auth_token, name='api_token_auth'),
    
    # Dashboard data
    path('dashboard/', dashboard_summary, name='dashboard_summary'),
    
    # Search endpoints
    path('programs/search/', program_search, name='program_search'),
    path('clients/search/', client_search, name='client_search'),
    
    # External API endpoints
    path('external/clients/', external_client_profile, name='external_client_list'),
    path('external/clients/<uuid:client_id>/', external_client_profile, name='external_client_detail'),
] 