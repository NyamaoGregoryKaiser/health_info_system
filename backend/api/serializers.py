from rest_framework import serializers
from django.contrib.auth.models import User
from health_programs.models import HealthProgram, ProgramCategory
from clients.models import Client, Enrollment
from django.db import transaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id', 'is_staff']
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add a name field that combines first and last name
        data['name'] = f"{instance.first_name} {instance.last_name}".strip() or instance.username
        return data

class ProgramCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramCategory
        fields = ['id', 'name', 'description']

class HealthProgramSerializer(serializers.ModelSerializer):
    category = ProgramCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = HealthProgram
        fields = ['id', 'name', 'description', 'code', 'start_date', 'end_date', 
                  'eligibility_criteria', 'capacity', 'location', 'category', 'category_id', 'is_active']

    def get_is_active(self, obj):
        try:
            return obj.is_active
        except:
            # Default to True if there's an error calculating is_active
            return True

    def validate_code(self, value):
        """
        Check that the code is not empty or just whitespace.
        """
        if not value or value.strip() == '':
            raise serializers.ValidationError("Program code cannot be empty.")
        return value.strip()

class ClientSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = ['client_id', 'first_name', 'last_name', 'id_number', 'date_of_birth', 
                  'age', 'gender', 'phone_number', 'email', 'county', 'sub_county', 
                  'ward', 'blood_type', 'allergies', 'created_at', 'updated_at']
    
    def get_age(self, obj):
        return obj.get_age()

class ClientDetailSerializer(ClientSerializer):
    enrollments = serializers.SerializerMethodField()
    
    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + ['enrollments']
    
    def get_enrollments(self, obj):
        enrollments = Enrollment.objects.filter(client=obj)
        return EnrollmentSerializer(enrollments, many=True).data

class EnrollmentSerializer(serializers.ModelSerializer):
    program_name = serializers.ReadOnlyField(source='program.name')
    program_code = serializers.ReadOnlyField(source='program.code')
    client_name = serializers.SerializerMethodField()
    client_id_number = serializers.SerializerMethodField()
    
    class Meta:
        model = Enrollment
        fields = ['id', 'client', 'client_name', 'client_id_number', 'program', 'program_name', 'program_code', 'enrollment_date', 
                  'is_active', 'notes', 'facility_name', 'mfl_code']
    
    def get_client_name(self, obj):
        return obj.client.get_full_name() if obj.client else None
    
    def get_client_id_number(self, obj):
        return obj.client.id_number if obj.client else None

class EnrollmentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating enrollments, excluding client field which shouldn't change
    """
    class Meta:
        model = Enrollment
        fields = ['program', 'enrollment_date', 'is_active', 'notes', 'facility_name', 'mfl_code']

class EnrollClientSerializer(serializers.Serializer):
    client_id = serializers.UUIDField()
    program_id = serializers.IntegerField()
    enrollment_date = serializers.DateField(required=False)
    facility_name = serializers.CharField(required=False, allow_blank=True)
    mfl_code = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def create(self, validated_data):
        client = Client.objects.get(client_id=validated_data['client_id'])
        program = HealthProgram.objects.get(id=validated_data['program_id'])
        
        enrollment, created = Enrollment.objects.get_or_create(
            client=client,
            program=program,
            defaults={
                'enrollment_date': validated_data.get('enrollment_date'),
                'facility_name': validated_data.get('facility_name', ''),
                'mfl_code': validated_data.get('mfl_code', ''),
                'notes': validated_data.get('notes', '')
            }
        )
        
        if not created:
            enrollment.enrollment_date = validated_data.get('enrollment_date', enrollment.enrollment_date)
            enrollment.facility_name = validated_data.get('facility_name', enrollment.facility_name)
            enrollment.mfl_code = validated_data.get('mfl_code', enrollment.mfl_code)
            enrollment.notes = validated_data.get('notes', enrollment.notes)
            enrollment.is_active = True
            enrollment.save()
            
        return enrollment 

class ClientRegistrationSerializer(serializers.Serializer):
    # User account fields
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    
    # Client personal info
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    date_of_birth = serializers.DateField(required=True)
    gender = serializers.ChoiceField(choices=['Male', 'Female', 'Other'], required=True)
    national_id = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=True)
    address = serializers.CharField(required=False, allow_blank=True)
    
    # Emergency contact
    emergency_contact_name = serializers.CharField(required=False, allow_blank=True)
    emergency_contact_phone = serializers.CharField(required=False, allow_blank=True)
    
    @transaction.atomic
    def create(self, validated_data):
        # Create user account
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        # Map gender to single letter code for Client model
        gender_map = {
            'Male': 'M',
            'Female': 'F',
            'Other': 'O'
        }
        
        # Create client profile
        client = Client.objects.create(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            id_number=validated_data['national_id'],
            date_of_birth=validated_data['date_of_birth'],
            gender=gender_map[validated_data['gender']],
            phone_number=validated_data['phone_number'],
            email=validated_data.get('email', ''),
            county=validated_data.get('address', '').split(',')[0] if validated_data.get('address') else 'Unknown',
            sub_county=validated_data.get('address', '').split(',')[1] if validated_data.get('address') and ',' in validated_data.get('address') else 'Unknown',
        )
        
        return client 

class ExternalClientProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for external API integration.
    
    This serializer exposes client profile data in a standardized format for external systems
    to consume. It includes all necessary fields for interoperability while maintaining
    privacy constraints.
    """
    age = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    enrollments = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    updated_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    
    class Meta:
        model = Client
        fields = [
            'client_id', 'full_name', 'first_name', 'last_name', 
            'id_number', 'date_of_birth', 'age', 'gender',
            'phone_number', 'email', 'county', 'sub_county', 
            'ward', 'blood_type', 'allergies',
            'enrollments', 'created_at', 'updated_at'
        ]
    
    def get_age(self, obj):
        return obj.get_age()
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_enrollments(self, obj):
        enrollments = Enrollment.objects.filter(client=obj)
        # Return simplified enrollment data for external systems
        return [{
            'program_name': enrollment.program.name,
            'program_code': enrollment.program.code,
            'enrollment_date': enrollment.enrollment_date,
            'is_active': enrollment.is_active,
            'facility_name': enrollment.facility_name,
            'mfl_code': enrollment.mfl_code
        } for enrollment in enrollments] 