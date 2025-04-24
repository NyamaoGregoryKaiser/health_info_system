from django.test import TestCase
from django.utils import timezone
from datetime import datetime, timedelta
from .models import ProgramCategory, HealthProgram


class ProgramCategoryModelTest(TestCase):
    
    def setUp(self):
        ProgramCategory.objects.create(
            name="Maternal Health",
            description="Programs for expectant and new mothers"
        )
    
    def test_category_creation(self):
        category = ProgramCategory.objects.get(name="Maternal Health")
        self.assertEqual(category.description, "Programs for expectant and new mothers")
        self.assertEqual(str(category), "Maternal Health")


class HealthProgramModelTest(TestCase):
    
    def setUp(self):
        category = ProgramCategory.objects.create(
            name="Child Health",
            description="Programs for children under 5 years"
        )
        
        today = timezone.now().date()
        
        # Active program
        HealthProgram.objects.create(
            name="Immunization Campaign",
            description="Routine immunization for children",
            start_date=today - timedelta(days=30),
            end_date=today + timedelta(days=30),
            location="Nationwide",
            capacity=5000,
            category=category
        )
        
        # Ended program
        HealthProgram.objects.create(
            name="Past Program",
            description="A program that has ended",
            start_date=today - timedelta(days=60),
            end_date=today - timedelta(days=10),
            location="Nairobi",
            category=category
        )
        
        # Future program
        HealthProgram.objects.create(
            name="Future Program",
            description="A program that hasn't started yet",
            start_date=today + timedelta(days=10),
            end_date=today + timedelta(days=40),
            location="Mombasa",
            category=category
        )
    
    def test_program_creation(self):
        program = HealthProgram.objects.get(name="Immunization Campaign")
        self.assertEqual(program.capacity, 5000)
        self.assertEqual(program.category.name, "Child Health")
        
    def test_active_program(self):
        active_program = HealthProgram.objects.get(name="Immunization Campaign")
        self.assertTrue(active_program.is_active)
        
        past_program = HealthProgram.objects.get(name="Past Program")
        self.assertFalse(past_program.is_active)
        
        future_program = HealthProgram.objects.get(name="Future Program")
        self.assertFalse(future_program.is_active) 