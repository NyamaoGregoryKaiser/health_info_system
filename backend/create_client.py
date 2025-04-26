import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
django.setup()

from django.contrib.auth.models import User
from clients.models import Client
from health_programs.models import Program, Category
from datetime import date

def create_test_client():
    """
    Create a test client and enroll them in some health programs
    """
    print("Creating test client...")
    
    # Check if client already exists
    if Client.objects.filter(national_id='12345678').exists():
        client = Client.objects.get(national_id='12345678')
        print(f"Client {client.first_name} {client.last_name} already exists.")
    else:
        # Create a new client
        client = Client.objects.create(
            first_name="John",
            last_name="Doe",
            date_of_birth=date(1990, 1, 1),
            gender="Male",
            phone_number="+254700123456",
            email="johndoe@example.com",
            national_id="12345678",
            address="123 Main St, Nairobi",
            emergency_contact_name="Jane Doe",
            emergency_contact_phone="+254700123457"
        )
        print(f"Created client: {client.first_name} {client.last_name}")
    
    # Enroll client in programs
    available_programs = Program.objects.all()
    
    if available_programs.exists():
        # Enroll in the first two programs if they exist
        for program in available_programs[:2]:
            if not client.enrollments.filter(program=program).exists():
                client.enroll_in_program(program)
                print(f"Enrolled {client.first_name} in {program.name}")
            else:
                print(f"{client.first_name} is already enrolled in {program.name}")
    else:
        print("No health programs available for enrollment.")
    
    print("Client setup completed successfully.")
    return client

if __name__ == "__main__":
    client = create_test_client() 