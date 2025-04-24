from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class ProgramCategory(models.Model):
    """
    Categories for health programs (e.g., Maternal Health, Child Immunization, etc.)
    """
    name = models.CharField(_("Category Name"), max_length=100)
    description = models.TextField(_("Description"), blank=True)
    
    class Meta:
        verbose_name = _("Program Category")
        verbose_name_plural = _("Program Categories")
        ordering = ['name']
    
    def __str__(self):
        return self.name


class HealthProgram(models.Model):
    """
    Health programs offered by the ministry
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    code = models.CharField(max_length=10, unique=True)
    start_date = models.DateField(_("Start Date"))
    end_date = models.DateField(_("End Date"), null=True, blank=True)
    eligibility_criteria = models.TextField(_("Eligibility Criteria"), blank=True)
    capacity = models.PositiveIntegerField(_("Capacity"), help_text=_("Maximum number of clients"), null=True, blank=True)
    location = models.CharField(_("Location"), max_length=255, help_text=_("Where the program is being conducted"))
    category = models.ForeignKey(
        ProgramCategory, 
        verbose_name=_("Category"),
        related_name="programs",
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    @property
    def is_active(self):
        """
        Check if program is currently active
        """
        today = timezone.now().date()
        return (self.start_date <= today and 
                (self.end_date is None or self.end_date >= today)) 