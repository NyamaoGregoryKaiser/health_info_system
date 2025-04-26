import os
import django
from datetime import datetime, timedelta
import random

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
django.setup()

from clients.models import Client, Enrollment
from health_programs.models import HealthProgram
from django.utils import timezone

def create_test_clients():
    """
    Create test clients and enroll them in health programs
    """
    print("Creating test clients...")
    
    # Test client data
    test_clients = [
        {
            "first_name": "John",
            "last_name": "Doe",
            "id_number": "12345678",
            "date_of_birth": datetime(1985, 5, 15).date(),
            "gender": "M",
            "phone_number": "+254712345678",
            "email": "john.doe@example.com",
            "county": "Nairobi",
            "sub_county": "Westlands",
            "ward": "Parklands",
            "blood_type": "O+",
            "allergies": "Penicillin"
        },
        {
            "first_name": "Jane",
            "last_name": "Smith",
            "id_number": "87654321",
            "date_of_birth": datetime(1990, 8, 22).date(),
            "gender": "F",
            "phone_number": "+254723456789",
            "email": "jane.smith@example.com",
            "county": "Mombasa",
            "sub_county": "Nyali",
            "ward": "Frere Town",
            "blood_type": "A-",
            "allergies": "None"
        },
        {
            "first_name": "Michael",
            "last_name": "Johnson",
            "id_number": "23456789",
            "date_of_birth": datetime(1975, 2, 10).date(),
            "gender": "M",
            "phone_number": "+254734567890",
            "email": "michael.johnson@example.com",
            "county": "Kisumu",
            "sub_county": "Kisumu Central",
            "ward": "Railways",
            "blood_type": "B+",
            "allergies": "Shellfish"
        },
        {
            "first_name": "Mary",
            "last_name": "Williams",
            "id_number": "34567890",
            "date_of_birth": datetime(1982, 11, 5).date(),
            "gender": "F",
            "phone_number": "+254745678901",
            "email": "mary.williams@example.com",
            "county": "Nakuru",
            "sub_county": "Nakuru East",
            "ward": "Biashara",
            "blood_type": "AB+",
            "allergies": "Peanuts"
        },
        {
            "first_name": "Robert",
            "last_name": "Brown",
            "id_number": "45678901",
            "date_of_birth": datetime(1995, 7, 30).date(),
            "gender": "M",
            "phone_number": "+254756789012",
            "email": "robert.brown@example.com",
            "county": "Eldoret",
            "sub_county": "Eldoret East",
            "ward": "Kapsoya",
            "blood_type": "O-",
            "allergies": "Latex"
        }
    ]
    
    created_clients = []
    for client_data in test_clients:
        try:
            client, created = Client.objects.get_or_create(
                id_number=client_data["id_number"],
                defaults={
                    "first_name": client_data["first_name"],
                    "last_name": client_data["last_name"],
                    "date_of_birth": client_data["date_of_birth"],
                    "gender": client_data["gender"],
                    "phone_number": client_data["phone_number"],
                    "email": client_data["email"],
                    "county": client_data["county"],
                    "sub_county": client_data["sub_county"],
                    "ward": client_data["ward"],
                    "blood_type": client_data["blood_type"],
                    "allergies": client_data["allergies"]
                }
            )
            
            if created:
                print(f"Created client: {client.get_full_name()}")
            else:
                print(f"Client {client.get_full_name()} already exists.")
                
            created_clients.append(client)
        
        except Exception as e:
            print(f"Error creating client {client_data['first_name']} {client_data['last_name']}: {e}")
    
    # Enroll clients in programs
    print("\nEnrolling clients in health programs...")
    programs = list(HealthProgram.objects.all())
    facilities = [
        "Kenyatta National Hospital", 
        "Moi Teaching and Referral Hospital", 
        "Coast General Hospital", 
        "Aga Khan University Hospital",
        "Nairobi West Hospital"
    ]
    
    for client in created_clients:
        # Randomly select 1-2 programs for each client
        num_programs = random.randint(1, min(2, len(programs)))
        selected_programs = random.sample(programs, num_programs)
        
        for program in selected_programs:
            try:
                # Random enrollment date between program start date and now
                program_start = program.start_date
                today = timezone.now().date()
                days_since_start = (today - program_start).days
                
                if days_since_start > 0:
                    random_days = random.randint(0, days_since_start)
                    enrollment_date = program_start + timedelta(days=random_days)
                else:
                    enrollment_date = today
                
                # Random facility
                facility = random.choice(facilities)
                mfl_code = f"MFL{random.randint(1000, 9999)}"
                
                enrollment, created = Enrollment.objects.get_or_create(
                    client=client,
                    program=program,
                    defaults={
                        "enrollment_date": enrollment_date,
                        "is_active": True,
                        "facility_name": facility,
                        "mfl_code": mfl_code,
                        "notes": f"Test enrollment for {client.get_full_name()} in {program.name}"
                    }
                )
                
                if created:
                    print(f"Enrolled {client.get_full_name()} in {program.name} at {facility}")
                else:
                    print(f"{client.get_full_name()} already enrolled in {program.name}")
            
            except Exception as e:
                print(f"Error enrolling {client.get_full_name()} in {program.name}: {e}")
    
    print("Client and enrollment creation completed successfully.")

if __name__ == "__main__":
    create_test_clients() 