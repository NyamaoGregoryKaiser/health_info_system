from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from .models import HealthProgram, ProgramCategory


@login_required
def program_list(request):
    """
    Display all health programs
    """
    programs = HealthProgram.objects.all().order_by('-start_date')
    categories = ProgramCategory.objects.all()
    
    # Filter by category if requested
    category_id = request.GET.get('category')
    if category_id:
        programs = programs.filter(category_id=category_id)
        
    # Filter by status if requested
    status = request.GET.get('status')
    today = timezone.now().date()
    if status == 'active':
        programs = programs.filter(start_date__lte=today, end_date__gte=today)
    elif status == 'upcoming':
        programs = programs.filter(start_date__gt=today)
    elif status == 'past':
        programs = programs.filter(end_date__lt=today)
    
    context = {
        'programs': programs,
        'categories': categories,
        'selected_category': category_id,
        'selected_status': status,
    }
    
    return render(request, 'health_programs/program_list.html', context)


@login_required
def program_detail(request, program_id):
    """
    Display details of a specific health program
    """
    program = get_object_or_404(HealthProgram, id=program_id)
    
    # Get enrollment data if available
    enrollments = program.enrollments.all()
    enrollment_count = enrollments.count()
    
    context = {
        'program': program,
        'enrollments': enrollments,
        'enrollment_count': enrollment_count,
    }
    
    return render(request, 'health_programs/program_detail.html', context) 