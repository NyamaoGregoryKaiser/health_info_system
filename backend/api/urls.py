from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HealthProgramViewSet, ClientViewSet, EnrollmentViewSet

router = DefaultRouter()
router.register(r'programs', HealthProgramViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'enrollments', EnrollmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 