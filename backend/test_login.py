#!/usr/bin/env python
"""
Test the login functionality for Afya Yetu Health System
"""

import os
import django
import json
import requests

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
django.setup()

def test_login():
    """Test login functionality"""
    print("Testing login functionality...")
    
    # Base URL for API
    base_url = "http://127.0.0.1:8000/api"
    
    # Get CSRF token
    try:
        response = requests.get(f"{base_url}/csrf-token/", headers={
            'Content-Type': 'application/json',
        })
        
        if response.status_code == 200:
            csrf_token = response.json().get('csrfToken')
            print(f"Got CSRF token: {csrf_token}")
        else:
            print(f"Failed to get CSRF token. Status code: {response.status_code}")
            return
    except Exception as e:
        print(f"Error getting CSRF token: {e}")
        return
    
    # Test login
    try:
        login_payload = {
            'username': 'admin',
            'password': 'password123'
        }
        
        response = requests.post(
            f"{base_url}/auth/login/", 
            json=login_payload,
            headers={
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token,
            },
            cookies={'csrftoken': csrf_token}
        )
        
        if response.status_code == 200:
            print("Login successful!")
            user_data = response.json()
            print(f"User data: {json.dumps(user_data, indent=2)}")
            
            # Save cookies
            cookies = response.cookies
            
            # Now test an authenticated endpoint
            dashboard_response = requests.get(
                f"{base_url}/dashboard/",
                cookies=cookies,
                headers={
                    'X-CSRFToken': cookies.get('csrftoken', csrf_token),
                }
            )
            
            if dashboard_response.status_code == 200:
                print("Successfully accessed dashboard!")
                print(f"Dashboard data: {json.dumps(dashboard_response.json(), indent=2)}")
            else:
                print(f"Failed to access dashboard. Status code: {dashboard_response.status_code}")
                print(f"Response: {dashboard_response.text}")
        else:
            print(f"Login failed. Status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error during login: {e}")

if __name__ == "__main__":
    test_login() 