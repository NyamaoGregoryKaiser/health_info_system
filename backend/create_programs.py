#!/usr/bin/env python
"""
Create sample health programs for Afya Yetu Health System
"""

import os
import django
from datetime import date, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
django.setup()

from health_programs.models import ProgramCategory, HealthProgram
from django.db import transaction

def create_programs():
    """Create sample program categories and health programs"""
    print("Creating sample health programs...")
    
    with transaction.atomic():
        # Create program categories
        categories = {
            'Maternal Health': 'Programs focused on the health and wellbeing of mothers during pregnancy, childbirth and postpartum',
            'Child Health': 'Programs dedicated to the health and development of children from infancy through adolescence',
            'Non-Communicable Diseases': 'Programs targeting chronic conditions such as diabetes, hypertension, and cancer',
            'Infectious Diseases': 'Programs for prevention and treatment of communicable diseases',
            'Mental Health': 'Programs supporting mental and emotional wellbeing'
        }
        
        category_objects = {}
        for name, description in categories.items():
            category, created = ProgramCategory.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )
            category_objects[name] = category
            if created:
                print(f"Created category: {name}")
            else:
                print(f"Category already exists: {name}")
        
        # Create health programs
        programs = [
            {
                'name': 'Maternal Nutrition Initiative',
                'description': 'Program to improve nutrition for pregnant and lactating mothers',
                'code': 'MNI-001',
                'start_date': date(2023, 1, 1),
                'end_date': date(2024, 12, 31),
                'eligibility_criteria': 'Pregnant women and those with children under 2 years',
                'capacity': 500,
                'location': 'Countrywide',
                'category': category_objects['Maternal Health']
            },
            {
                'name': 'Childhood Immunization Program',
                'description': 'Comprehensive vaccination program for children',
                'code': 'CIP-002',
                'start_date': date(2023, 1, 15),
                'end_date': date(2024, 12, 31),
                'eligibility_criteria': 'Children under 5 years',
                'capacity': 1000,
                'location': 'All counties',
                'category': category_objects['Child Health']
            },
            {
                'name': 'Diabetes Management',
                'description': 'Support and management for diabetes patients',
                'code': 'DMG-003',
                'start_date': date(2023, 2, 1),
                'end_date': date(2025, 1, 31),
                'eligibility_criteria': 'Diagnosed diabetes patients of all ages',
                'capacity': 300,
                'location': 'Urban centers',
                'category': category_objects['Non-Communicable Diseases']
            },
            {
                'name': 'HIV/AIDS Support Program',
                'description': 'Comprehensive care for HIV/AIDS patients',
                'code': 'HIV-004',
                'start_date': date(2023, 1, 1),
                'end_date': None,
                'eligibility_criteria': 'HIV positive individuals',
                'capacity': 800,
                'location': 'Countrywide',
                'category': category_objects['Infectious Diseases']
            },
            {
                'name': 'Adolescent Mental Health',
                'description': 'Mental health support for teenagers and young adults',
                'code': 'AMH-005',
                'start_date': date(2023, 3, 15),
                'end_date': date(2024, 12, 31),
                'eligibility_criteria': 'Individuals 13-24 years old',
                'capacity': 250,
                'location': 'Selected counties',
                'category': category_objects['Mental Health']
            }
        ]
        
        for program_data in programs:
            program, created = HealthProgram.objects.get_or_create(
                code=program_data['code'],
                defaults=program_data
            )
            
            if created:
                print(f"Created program: {program.name}")
            else:
                print(f"Program already exists: {program.name}")
                
    print("Health programs setup complete!")

if __name__ == "__main__":
    create_programs() 