#!/usr/bin/env python
"""
Create sample users for Afya Yetu Health System
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
django.setup()

from django.contrib.auth.models import User, Group, Permission
from django.db import transaction

def create_users():
    """Create sample users and groups"""
    print("Creating sample users and groups...")
    
    with transaction.atomic():
        # Create groups if they don't exist
        admin_group, _ = Group.objects.get_or_create(name='Administrators')
        health_officers, _ = Group.objects.get_or_create(name='Health Officers')
        data_entry, _ = Group.objects.get_or_create(name='Data Entry')
        
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@afyayetu.org',
                password='password123',
                first_name='System',
                last_name='Administrator'
            )
            admin_user.groups.add(admin_group)
            print("Created admin user: admin / password123")
        else:
            print("Admin user already exists")
        
        # Create staff users
        if not User.objects.filter(username='receptionist').exists():
            receptionist = User.objects.create_user(
                username='receptionist',
                email='jane.doe@afyayetu.org',
                password='password123',
                first_name='Jane',
                last_name='Doe',
                is_staff=True
            )
            receptionist.groups.add(data_entry)
            print("Created receptionist user: receptionist / password123")
        else:
            print("Receptionist user already exists")
            
        if not User.objects.filter(username='nurse1').exists():
            nurse = User.objects.create_user(
                username='nurse1',
                email='john.smith@afyayetu.org',
                password='password123',
                first_name='John',
                last_name='Smith',
                is_staff=True
            )
            nurse.groups.add(health_officers)
            print("Created nurse user: nurse1 / password123")
        else:
            print("Nurse user already exists")
            
        if not User.objects.filter(username='officermanager').exists():
            manager = User.objects.create_user(
                username='officermanager',
                email='mary.johnson@afyayetu.org',
                password='password123',
                first_name='Mary',
                last_name='Johnson',
                is_staff=True
            )
            manager.groups.add(health_officers)
            print("Created manager user: officermanager / password123")
        else:
            print("Manager user already exists")
            
    print("User setup complete!")

if __name__ == "__main__":
    create_users() 