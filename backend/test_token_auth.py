#!/usr/bin/env python
"""
Test token authentication for Afya Yetu Health System
"""

import requests
import json

# Your token from the fix_auth.py script
TOKEN = "49a0d9e84271bb0ed79b5f253054a1e54f808990"  # Replace with your actual token

def test_token_auth():
    """Test API access using token authentication"""
    print("Testing token authentication...")
    
    # Base URL for API
    base_url = "http://127.0.0.1:8000/api"
    
    # Headers with token authentication
    headers = {
        'Authorization': f'Token {TOKEN}',
        'Content-Type': 'application/json',
    }
    
    # Test dashboard endpoint
    try:
        response = requests.get(f"{base_url}/dashboard/", headers=headers)
        
        if response.status_code == 200:
            print("Successfully accessed dashboard with token authentication!")
            print(f"Dashboard data: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Failed to access dashboard. Status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error accessing dashboard: {e}")
    
    # Test clients endpoint
    try:
        response = requests.get(f"{base_url}/clients/", headers=headers)
        
        if response.status_code == 200:
            print("Successfully accessed clients with token authentication!")
            # Only print the count to avoid excessive output
            data = response.json()
            count = data.get('count', 0)
            print(f"Number of clients: {count}")
        else:
            print(f"Failed to access clients. Status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error accessing clients: {e}")

if __name__ == "__main__":
    test_token_auth() 