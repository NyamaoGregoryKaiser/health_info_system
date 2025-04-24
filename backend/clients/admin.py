from django.contrib import admin
from .models import Client, Enrollment

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'id_number', 'phone_number', 'gender', 'county', 'date_of_birth')
    list_filter = ('gender', 'county')
    search_fields = ('first_name', 'last_name', 'id_number', 'phone_number', 'email')
    date_hierarchy = 'created_at'
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    get_full_name.short_description = 'Full Name'

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('client', 'program', 'enrollment_date', 'is_active')
    list_filter = ('is_active', 'enrollment_date', 'program')
    search_fields = ('client__first_name', 'client__last_name', 'program__name', 'notes')
    date_hierarchy = 'enrollment_date'
    raw_id_fields = ('client', 'program') 