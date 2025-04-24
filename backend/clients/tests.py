from django.test import TestCase
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Client, Enrollment
from health_programs.models import HealthProgram, ProgramCategory


class ClientModelTest(TestCase):
    
    def setUp(self):
        # Create a client born 30 years ago
        today = timezone.now().date()
        birth_date = today.replace(year=today.year - 30)
        
        Client.objects.create(
            first_name="John",
            last_name="Doe",
            national_id="12345678",
            phone_number="+254700123456",
            email="john.doe@example.com",
            date_of_birth=birth_date,
            gender="M",
            county="Nairobi",
            sub_county="Westlands",
            ward="Parklands"
        )
    
    def test_client_creation(self):
        client = Client.objects.get(national_id="12345678")
        self.assertEqual(client.first_name, "John")
        self.assertEqual(client.county, "Nairobi")
        self.assertEqual(str(client), "John Doe (12345678)")
        
    def test_client_age(self):
        client = Client.objects.get(national_id="12345678")
        self.assertEqual(client.age, 30)


class EnrollmentModelTest(TestCase):
    
    def setUp(self):
        # Create a client
        today = timezone.now().date()
        birth_date = today.replace(year=today.year - 25)
        
        client = Client.objects.create(
            first_name="Jane",
            last_name="Smith",
            national_id="87654321",
            date_of_birth=birth_date,
            gender="F",
            county="Mombasa"
        )
        
        # Create a program category and program
        category = ProgramCategory.objects.create(
            name="Maternal Health",
            description="Programs for expectant and new mothers"
        )
        
        program = HealthProgram.objects.create(
            name="Antenatal Care",
            description="Routine care for pregnant women",
            start_date=today - timedelta(days=30),
            end_date=today + timedelta(days=180),
            location="Mombasa County Hospital",
            category=category
        )
        
        # Create an enrollment
        Enrollment.objects.create(
            client=client,
            program=program,
            enrollment_date=today,
            status='active',
            notes="First-time mother"
        )
    
    def test_enrollment_creation(self):
        enrollment = Enrollment.objects.first()
        self.assertEqual(enrollment.status, 'active')
        self.assertEqual(enrollment.client.first_name, "Jane")
        self.assertEqual(enrollment.program.name, "Antenatal Care")
        
    def test_unique_constraint(self):
        """Test that a client can't be enrolled twice in the same program"""
        enrollment = Enrollment.objects.first()
        
        # Try to create a duplicate enrollment
        with self.assertRaises(Exception):
            Enrollment.objects.create(
                client=enrollment.client,
                program=enrollment.program,
                enrollment_date=timezone.now().date(),
                status='pending'
            ) 