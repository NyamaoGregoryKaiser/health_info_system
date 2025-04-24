from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .models import Client, Enrollment
from health_programs.models import HealthProgram


@login_required
def client_list(request):
    """
    Display list of all clients
    """
    clients = Client.objects.all()
    
    # Handle search
    query = request.GET.get('q')
    if query:
        clients = clients.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(national_id__icontains=query) |
            Q(phone_number__icontains=query)
        )
    
    # Handle filtering
    county = request.GET.get('county')
    if county:
        clients = clients.filter(county__iexact=county)
    
    # Get unique counties for filter dropdown
    counties = Client.objects.values_list('county', flat=True).distinct()
    
    context = {
        'clients': clients,
        'counties': counties,
        'query': query,
        'selected_county': county,
    }
    
    return render(request, 'clients/client_list.html', context)


@login_required
def client_detail(request, client_id):
    """
    Display client details and their program enrollments
    """
    client = get_object_or_404(Client, id=client_id)
    enrollments = client.enrollments.all().select_related('program')
    
    context = {
        'client': client,
        'enrollments': enrollments,
    }
    
    return render(request, 'clients/client_detail.html', context)


@login_required
def enrollment_list(request):
    """
    Display list of all program enrollments
    """
    enrollments = Enrollment.objects.all().select_related('client', 'program')
    
    # Handle filtering
    status = request.GET.get('status')
    if status:
        enrollments = enrollments.filter(status=status)
    
    program_id = request.GET.get('program')
    if program_id:
        enrollments = enrollments.filter(program_id=program_id)
    
    # Get programs for filter dropdown
    programs = HealthProgram.objects.all()
    
    context = {
        'enrollments': enrollments,
        'programs': programs,
        'selected_status': status,
        'selected_program': program_id,
    }
    
    return render(request, 'clients/enrollment_list.html', context) 