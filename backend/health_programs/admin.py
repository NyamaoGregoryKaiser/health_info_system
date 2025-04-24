from django.contrib import admin
from .models import HealthProgram

@admin.register(HealthProgram)
class HealthProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at', 'updated_at')
    search_fields = ('name', 'code', 'description')
    list_filter = ('created_at',) 