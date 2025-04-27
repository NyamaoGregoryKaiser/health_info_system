from django.conf import settings

# API Version
API_VERSION = 'v1'

# Base endpoints
BASE_API_URL = getattr(settings, 'EXTERNAL_API_BASE_URL', 'https://api.afyayetu.health/api')
API_ENDPOINT = f'{BASE_API_URL}/{API_VERSION}'

# Endpoint paths
ENDPOINTS = {
    'patient_profile': f'{API_ENDPOINT}/patients/profile/',
    'patient_history': f'{API_ENDPOINT}/patients/history/',
    'patient_medications': f'{API_ENDPOINT}/patients/medications/',
    'patient_allergies': f'{API_ENDPOINT}/patients/allergies/',
    'patient_lab_results': f'{API_ENDPOINT}/patients/lab_results/',
    'facilities': f'{API_ENDPOINT}/facilities/',
    'practitioners': f'{API_ENDPOINT}/practitioners/',
}

# Request settings
REQUEST_TIMEOUT = getattr(settings, 'EXTERNAL_API_TIMEOUT', 30)  # seconds
MAX_RETRIES = getattr(settings, 'EXTERNAL_API_MAX_RETRIES', 3)
RETRY_BACKOFF = getattr(settings, 'EXTERNAL_API_RETRY_BACKOFF', 0.5)  # seconds

# Rate limiting
RATE_LIMIT_CALLS = getattr(settings, 'EXTERNAL_API_RATE_LIMIT_CALLS', 100)
RATE_LIMIT_PERIOD = getattr(settings, 'EXTERNAL_API_RATE_LIMIT_PERIOD', 60)  # seconds

# Cache settings
CACHE_ENABLED = getattr(settings, 'EXTERNAL_API_CACHE_ENABLED', True)
CACHE_TIMEOUT = getattr(settings, 'EXTERNAL_API_CACHE_TIMEOUT', 300)  # seconds

# Logging
LOG_REQUESTS = getattr(settings, 'EXTERNAL_API_LOG_REQUESTS', True)
LOG_RESPONSES = getattr(settings, 'EXTERNAL_API_LOG_RESPONSES', True)
LOG_LEVEL = getattr(settings, 'EXTERNAL_API_LOG_LEVEL', 'INFO')

# Security
VERIFY_SSL = getattr(settings, 'EXTERNAL_API_VERIFY_SSL', True) 