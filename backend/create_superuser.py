#!/usr/bin/env python
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
django.setup()

from django.contrib.auth.models import User

def create_superuser():
    # Check if the superuser already exists
    if User.objects.filter(username='admin').exists():
        print('Superuser "admin" already exists.')
        return
    
    # Create a test superuser
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    print('Created superuser: admin / admin123')

if __name__ == '__main__':
    create_superuser() 