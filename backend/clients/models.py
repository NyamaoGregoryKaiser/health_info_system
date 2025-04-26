from django.db import models
from django.utils.translation import gettext_lazy as _
from health_programs.models import HealthProgram
from django.utils import timezone
import uuid


class Client(models.Model):
    """
    Client/beneficiary of health programs
    """
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other')
    ]
    
    # Using UUID as client ID for better security and to avoid sequential IDs
    client_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    
    # Afya Yetu-specific fields
    county = models.CharField(max_length=50)
    sub_county = models.CharField(max_length=50)
    ward = models.CharField(max_length=50, null=True, blank=True)
    
    # Health info
    blood_type = models.CharField(max_length=5, null=True, blank=True)
    allergies = models.TextField(null=True, blank=True)
    
    # Programs this client is enrolled in
    programs = models.ManyToManyField(HealthProgram, through='Enrollment')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.client_id})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_age(self):
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))


class Enrollment(models.Model):
    """
    Client enrollment in a health program
    """
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    program = models.ForeignKey(HealthProgram, on_delete=models.CASCADE)
    enrollment_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(null=True, blank=True)
    
    # Additional Afya Yetu-specific program data
    facility_name = models.CharField(max_length=100, null=True, blank=True)
    mfl_code = models.CharField(max_length=10, null=True, blank=True, help_text="Master Facility List Code")
    
    class Meta:
        verbose_name = _("Program Enrollment")
        verbose_name_plural = _("Program Enrollments")
        ordering = ['-enrollment_date']
        unique_together = ['client', 'program']
    
    def __str__(self):
        return f"{self.client.get_full_name()} - {self.program.name}" 