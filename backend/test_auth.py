#!/usr/bin/env python
"""
Test authentication endpoints for Afya Yetu Health System
"""

import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login

def setup_test_auth(urlpatterns):
    """Add test auth endpoints to URLs"""
    from django.urls import path
    
    @csrf_exempt
    def test_login(request):
        """Simple login endpoint for testing"""
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
