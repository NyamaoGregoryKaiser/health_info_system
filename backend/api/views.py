from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes, action, authentication_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.contrib.auth.models import User
from django.http import JsonResponse

from health_programs.models import HealthProgram, ProgramCategory
from clients.models import Client, Enrollment
from .serializers import (
    ClientSerializer, 
    HealthProgramSerializer, 
    ProgramCategorySerializer, 
    EnrollmentSerializer,
    EnrollmentUpdateSerializer,
    ClientDetailSerializer,
    EnrollClientSerializer,
    UserSerializer,
    ClientRegistrationSerializer
)

# Authentication views
@api_view(['POST'])
@csrf_exempt  # Exempt from CSRF protection for initial login
@authentication_classes([])  # No authentication required
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'detail': 'Please provide both username and password.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        # Return user data with a success indicator
        user_data = UserSerializer(user).data
        user_data['success'] = True
        return Response(user_data)
    else:
        return Response({
            'success': False,
            'detail': 'Invalid credentials. Please check your username and password.'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_view(request):
    if request.user.is_authenticated:
        logout(request)
        return Response({'success': True, 'detail': 'Successfully logged out.'})
    else:
        return Response({'success': False, 'detail': 'You are not logged in.'}, 
                        status=status.HTTP_200_OK)

@api_view(['GET'])
@ensure_csrf_cookie
@permission_classes([permissions.AllowAny])
def get_csrf_token(request):
    token = get_token(request)
    return Response({'csrfToken': token})

@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Allow any user to check auth status
def get_user_info(request):
    if not request.user.is_authenticated:
        return Response({'authenticated': False, 'detail': 'Not authenticated'}, status=status.HTTP_200_OK)
    return Response(UserSerializer(request.user).data)

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['county', 'sub_county', 'gender']
    search_fields = ['first_name', 'last_name', 'id_number', 'phone_number']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClientDetailSerializer
        return ClientSerializer
    
    @action(detail=True, methods=['get'])
    def enrollments(self, request, pk=None):
        client = self.get_object()
        enrollments = Enrollment.objects.filter(client=client)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {"error": "Please provide a search query with 'q' parameter"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        clients = Client.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(id_number__icontains=query) |
            Q(phone_number__icontains=query)
        )
        
        serializer = self.get_serializer(clients, many=True)
        return Response(serializer.data)

class HealthProgramViewSet(viewsets.ModelViewSet):
    queryset = HealthProgram.objects.all()
    serializer_class = HealthProgramSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code', 'description']

class ProgramCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProgramCategory.objects.all()
    serializer_class = ProgramCategorySerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return EnrollmentUpdateSerializer
        return EnrollmentSerializer
    
    @action(detail=False, methods=['post'])
    def enroll_client(self, request):
        serializer = EnrollClientSerializer(data=request.data)
        if serializer.is_valid():
            enrollment = serializer.save()
            return Response(
                EnrollmentSerializer(enrollment).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        enrollment = self.get_object()
        enrollment.is_active = not enrollment.is_active
        enrollment.save()
        return Response({
            'status': 'success',
            'is_active': enrollment.is_active
        })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    """
    Get a summary of dashboard data - active programs, clients, enrollments, etc.
    """
    from django.db.models import Count
    from django.db.models.functions import TruncMonth
    import datetime
    
    # Get current date
    today = timezone.now().date()
    month_ago = today - datetime.timedelta(days=30)
    
    # Count clients
    total_clients = Client.objects.count()
    new_clients = Client.objects.filter(created_at__gte=month_ago).count()
    
    # Count programs
    total_programs = HealthProgram.objects.count()
    active_programs = sum(1 for p in HealthProgram.objects.all() if p.is_active)
    
    # Enrollment stats
    enrollments_by_status = [
        {'status': 'Active', 'count': Enrollment.objects.filter(is_active=True).count()},
        {'status': 'Inactive', 'count': Enrollment.objects.filter(is_active=False).count()}
    ]
    
    # Get top programs by enrollment
    enrollments_by_program = []
    for program in HealthProgram.objects.all():
        count = Enrollment.objects.filter(program=program).count()
        if count > 0:
            enrollments_by_program.append({
                'id': program.id,
                'name': program.name,
                'count': count
            })
    
    # Sort by count, descending
    enrollments_by_program.sort(key=lambda x: x['count'], reverse=True)
    
    # Get clients by county
    clients_by_county = []
    counties = Client.objects.values('county').annotate(count=Count('county')).order_by('-count')
    for county in counties:
        clients_by_county.append({
            'county': county['county'],
            'count': county['count']
        })
    
    return Response({
        'clients': {
            'total': total_clients,
            'new_this_month': new_clients
        },
        'programs': {
            'total': total_programs,
            'active': active_programs
        },
        'enrollments': {
            'by_status': enrollments_by_status,
            'by_program': enrollments_by_program[:5]  # Top 5 programs
        },
        'clients_by_county': clients_by_county
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def client_search(request):
    """
    Search clients by various parameters
    """
    query = request.query_params.get('q', '')
    if not query:
        return Response({'results': []})
    
    clients = Client.objects.filter(
        Q(first_name__icontains=query) | 
        Q(last_name__icontains=query) | 
        Q(id_number__icontains=query) |
        Q(phone_number__icontains=query) |
        Q(email__icontains=query)
    )
    
    serializer = ClientSerializer(clients, many=True)
    return Response({'results': serializer.data})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def program_search(request):
    """
    Search health programs by various parameters
    """
    query = request.query_params.get('q', '')
    if not query:
        return Response({'results': []})
    
    programs = HealthProgram.objects.filter(
        Q(name__icontains=query) | 
        Q(description__icontains=query) | 
        Q(location__icontains=query) |
        Q(code__icontains=query)
    )
    
    serializer = HealthProgramSerializer(programs, many=True)
    return Response({'results': serializer.data})

@api_view(['POST'])
@authentication_classes([])  # No authentication required
@permission_classes([permissions.AllowAny])
def register_client(request):
    """
    Register a new client with a user account
    """
    serializer = ClientRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            client = serializer.save()
            return Response({
                'success': True,
                'message': 'Registration successful.',
                'client_id': client.client_id,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'detail': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST) 