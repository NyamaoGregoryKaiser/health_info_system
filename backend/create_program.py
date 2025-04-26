import os
import django
from datetime import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
django.setup()

from health_programs.models import HealthProgram as Program, ProgramCategory as Category

def create_test_programs():
    """
    Create test health programs and categories
    """
    print("Creating test health programs...")
    
    # Create categories if they don't exist
    categories = [
        {"name": "Maternal Health", "description": "Programs focused on maternal and child health care."},
        {"name": "Chronic Disease", "description": "Programs for managing chronic diseases like diabetes and hypertension."},
        {"name": "Preventive Care", "description": "Programs focused on health prevention and wellness."}
    ]
    
    created_categories = []
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data["name"],
            defaults={"description": cat_data["description"]}
        )
        if created:
            print(f"Created category: {category.name}")
        else:
            print(f"Category {category.name} already exists.")
        created_categories.append(category)
    
    # Create programs if they don't exist
    programs = [
        {
            "name": "Maternal Care Initiative",
            "description": "A comprehensive program for expectant mothers.",
            "code": "MCR-001",
            "category": created_categories[0],
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "eligibility_criteria": "Expectant mothers in the first trimester",
            "capacity": 100,
            "location": "Community Health Center, Block A"
        },
        {
            "name": "Diabetes Management",
            "description": "A program to help patients manage diabetes effectively.",
            "code": "DM-002",
            "category": created_categories[1],
            "start_date": "2023-02-01",
            "end_date": "2023-11-30",
            "eligibility_criteria": "Diagnosed diabetic patients",
            "capacity": 75,
            "location": "Regional Hospital, Diabetes Clinic"
        },
        {
            "name": "Vaccination Drive",
            "description": "Regular vaccination program for children and adults.",
            "code": "VAX-003",
            "category": created_categories[2],
            "start_date": "2023-03-01",
            "end_date": "2023-10-31",
            "eligibility_criteria": "All residents of the district",
            "capacity": 500,
            "location": "Multiple locations across the district"
        }
    ]
    
    for prog_data in programs:
        try:
            program, created = Program.objects.get_or_create(
                name=prog_data["name"],
                defaults={
                    "description": prog_data["description"],
                    "code": prog_data["code"],
                    "category": prog_data["category"],
                    "start_date": prog_data["start_date"],
                    "end_date": prog_data["end_date"],
                    "eligibility_criteria": prog_data["eligibility_criteria"],
                    "capacity": prog_data["capacity"],
                    "location": prog_data["location"]
                }
            )
            if created:
                print(f"Created program: {program.name}")
            else:
                print(f"Program {program.name} already exists.")
        except Exception as e:
            print(f"Error creating program {prog_data['name']}: {e}")
    
    print("Health programs setup completed successfully.")

if __name__ == "__main__":
    create_test_programs() 