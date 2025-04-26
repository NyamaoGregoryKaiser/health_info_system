#!/usr/bin/env python
"""
Fix authentication issues for Afya Yetu Health System
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
django.setup()

from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from health_programs.models import HealthProgram, ProgramCategory
from clients.models import Client, Enrollment
from rest_framework.authtoken.models import Token

def fix_admin_user():
    """Fix or create admin user with proper permissions"""
    print("Fixing admin user permissions...")
    
    try:
        # Get or create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@afyayetu.org',
                'first_name': 'System',
                'last_name': 'Administrator',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        if created:
            admin_user.set_password('password123')
            admin_user.save()
            print("Created new admin user with username 'admin' and password 'password123'")
        else:
            # Make sure admin has proper permissions
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            print("Updated existing admin user with proper permissions")
        
        # Make sure admin is in Administrators group
        admin_group, _ = Group.objects.get_or_create(name='Administrators')
        admin_user.groups.add(admin_group)
        
        # Give admin all necessary model permissions
        for model in [HealthProgram, ProgramCategory, Client, Enrollment]:
            content_type = ContentType.objects.get_for_model(model)
            permissions = Permission.objects.filter(content_type=content_type)
            
            for permission in permissions:
                admin_user.user_permissions.add(permission)
                admin_group.permissions.add(permission)
                
        print("Added all model permissions to admin user and Administrators group")
        
        # Create or get auth token for API access
        token, _ = Token.objects.get_or_create(user=admin_user)
        print(f"API token for admin user: {token.key}")
        print(f"Use this token in API requests with header: Authorization: Token {token.key}")
        
    except Exception as e:
        print(f"Error fixing admin user: {e}")

def fix_frontend_auth_views():
    """Create a direct login view that doesn't require CSRF for testing"""
    print("\nCreating a test_auth.py in backend/ folder...")
    
    test_auth_content = """#!/usr/bin/env python
\"\"\"
Test authentication endpoints for Afya Yetu Health System
\"\"\"

import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login

def setup_test_auth(urlpatterns):
    \"\"\"Add test auth endpoints to URLs\"\"\"
    from django.urls import path
    
    @csrf_exempt
    def test_login(request):
        \"\"\"Simple login endpoint for testing\"\"\"
        if request.method == 'POST':
            import json
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'success': True,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'is_staff': user.is_staff,
                    }
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid credentials'
                }, status=401)
        
        return JsonResponse({
            'error': 'Method not allowed'
        }, status=405)
    
    urlpatterns += [
        path('api/test-login/', test_login, name='test_login'),
    ]
    
    print("Added test login endpoint at /api/test-login/")
"""
    
    # Write the test_auth.py file
    with open(os.path.join(os.path.dirname(__file__), 'test_auth.py'), 'w') as f:
        f.write(test_auth_content)
    
    # Update urls.py to include the test auth endpoints
    urls_file = os.path.join(os.path.dirname(__file__), 'health_system', 'urls.py')
    with open(urls_file, 'r') as f:
        urls_content = f.read()
    
    # Check if test_auth import is already there
    if 'import test_auth' not in urls_content:
        # Add import and setup call to the urls.py file
        if 'urlpatterns = [' in urls_content:
            new_urls_content = urls_content.replace(
                'urlpatterns = [', 
                'import test_auth\n\nurlpatterns = ['
            )
            
            # Add the setup call after the urlpatterns
            if ']' in new_urls_content:
                last_bracket_pos = new_urls_content.rindex(']')
                new_urls_content = (
                    new_urls_content[:last_bracket_pos+1] + 
                    '\n\n# Set up test auth endpoints\ntest_auth.setup_test_auth(urlpatterns)' +
                    new_urls_content[last_bracket_pos+1:]
                )
                
                with open(urls_file, 'w') as f:
                    f.write(new_urls_content)
                    
                print(f"Updated {urls_file} to include test auth endpoints")
            else:
                print(f"Could not find closing bracket in {urls_file}")
        else:
            print(f"Could not find urlpatterns in {urls_file}")
    else:
        print(f"Test auth already imported in {urls_file}")

if __name__ == "__main__":
    with transaction.atomic():
        fix_admin_user()
        fix_frontend_auth_views()
    
    print("\nAuth fixes applied successfully!")
    print("You can test login with:")
    print("1. Username: admin")
    print("2. Password: password123")
    print("\nPlease restart the Django server to apply changes.") 