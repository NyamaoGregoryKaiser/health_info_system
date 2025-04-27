import logging
import requests
from typing import Dict, Any, Optional, Union
from requests.exceptions import RequestException, Timeout
from datetime import datetime
from .external_api_client import ExternalAPIClient, APIRateLimitExceeded

logger = logging.getLogger('external_api')

class ExternalAPIService:
    """
    Service for interacting with external health information APIs
    """
    
    def __init__(
        self, 
        base_url: str, 
        api_token: Optional[str] = None,
        timeout: int = 30,
        retry_attempts: int = 3,
        logger: Optional[logging.Logger] = None
    ):
        """
        Initialize the external API service
        
        Args:
            base_url: Base URL for the API
            api_token: Authentication token for the API
            timeout: Request timeout in seconds
            retry_attempts: Number of retry attempts for failed requests
            logger: Logger instance for this service
        """
        self.base_url = base_url.rstrip('/')
        self.api_token = api_token
        self.timeout = timeout
        self.retry_attempts = retry_attempts
        self.logger = logger or logging.getLogger(__name__)
        
        self.session = requests.Session()
        
        # Configure authentication if token is provided
        if self.api_token:
            self.session.headers.update({
                'Authorization': f'Bearer {self.api_token}'
            })
        
        self.logger.info(f"Initialized ExternalAPIService with base URL: {self.base_url}")
    
    def _handle_request(
        self, 
        method: str, 
        endpoint: str, 
        **kwargs
    ) -> Dict[str, Any]:
        """
        Handle API requests with retry logic and error handling
        
        Args:
            method: HTTP method (get, post, put, delete)
            endpoint: API endpoint to call
            **kwargs: Additional arguments to pass to the request
            
        Returns:
            Dict[str, Any]: Response data from the API
            
        Raises:
            Exception: If the request fails after all retry attempts
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        attempts = 0
        last_error = None
        
        while attempts < self.retry_attempts:
            try:
                self.logger.debug(f"Making {method.upper()} request to {url}")
                response = getattr(self.session, method)(
                    url, 
                    timeout=self.timeout,
                    **kwargs
                )
                
                response.raise_for_status()
                return response.json()
                
            except Timeout as e:
                attempts += 1
                last_error = e
                self.logger.warning(f"Request timeout ({attempts}/{self.retry_attempts}): {url}")
                
            except RequestException as e:
                attempts += 1
                last_error = e
                self.logger.warning(f"Request failed ({attempts}/{self.retry_attempts}): {url} - {str(e)}")
        
        # Log the final error after all retries
        self.logger.error(f"Request failed after {self.retry_attempts} attempts: {url} - {str(last_error)}")
        raise last_error or RequestException(f"Failed to connect to {url} after {self.retry_attempts} attempts")
    
    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Get data from the API"""
        return self._handle_request('get', endpoint, params=params)
    
    def post(self, endpoint: str, data: Optional[Dict[str, Any]] = None, json: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Post data to the API"""
        return self._handle_request('post', endpoint, data=data, json=json)
    
    def put(self, endpoint: str, data: Optional[Dict[str, Any]] = None, json: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Update data via the API"""
        return self._handle_request('put', endpoint, data=data, json=json)
    
    def delete(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Delete data via the API"""
        return self._handle_request('delete', endpoint, params=params)
        
    def get_health_records(self, patient_id: Union[str, int]) -> Dict[str, Any]:
        """
        Get health records for a specific patient
        
        Args:
            patient_id: The ID of the patient
            
        Returns:
            Dict[str, Any]: Patient health records
        """
        self.logger.info(f"Fetching health records for patient: {patient_id}")
        return self.get(f"patients/{patient_id}/records")
    
    def get_medications(self, patient_id: Union[str, int]) -> Dict[str, Any]:
        """
        Get medication information for a specific patient
        
        Args:
            patient_id: The ID of the patient
            
        Returns:
            Dict[str, Any]: Patient medication data
        """
        self.logger.info(f"Fetching medication data for patient: {patient_id}")
        return self.get(f"patients/{patient_id}/medications")
    
    def submit_health_data(self, patient_id: Union[str, int], data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit new health data for a patient
        
        Args:
            patient_id: The ID of the patient
            data: The health data to submit
            
        Returns:
            Dict[str, Any]: Submission result
        """
        self.logger.info(f"Submitting health data for patient: {patient_id}")
        return self.post(f"patients/{patient_id}/data", json=data)

    # Patient methods
    def get_patient(self, patient_id):
        """
        Get a patient's information by ID
        
        Args:
            patient_id (str): The patient's unique identifier
            
        Returns:
            dict: Patient information
        """
        try:
            return self.get('patient_detail', params={'id': patient_id})
        except APIRateLimitExceeded as e:
            logger.warning(f"Rate limit exceeded: {e}")
            return {'error': 'Service temporarily unavailable due to rate limiting'}
        except Exception as e:
            logger.error(f"Error fetching patient data: {e}")
            return {'error': 'Failed to retrieve patient information'}
    
    def search_patients(self, query=None, **filters):
        """
        Search for patients by name or other attributes
        
        Args:
            query (str, optional): Search query for patient name
            **filters: Additional filters like age, gender, etc.
            
        Returns:
            list: Matching patients
        """
        params = filters.copy()
        if query:
            params['q'] = query
        
        try:
            return self.get('patient_search', params=params)
        except Exception as e:
            logger.error(f"Error searching patients: {e}")
            return {'error': 'Failed to search patients'}
    
    def create_patient(self, patient_data):
        """
        Create a new patient record
        
        Args:
            patient_data (dict): Patient information
            
        Returns:
            dict: Created patient data with ID
        """
        try:
            return self.post('patient_create', data=patient_data)
        except Exception as e:
            logger.error(f"Error creating patient: {e}")
            return {'error': 'Failed to create patient record'}
    
    def update_patient(self, patient_id, patient_data):
        """
        Update an existing patient record
        
        Args:
            patient_id (str): The patient's unique identifier
            patient_data (dict): Updated patient information
            
        Returns:
            dict: Updated patient data
        """
        try:
            patient_data['id'] = patient_id
            return self.put('patient_update', data=patient_data)
        except Exception as e:
            logger.error(f"Error updating patient: {e}")
            return {'error': 'Failed to update patient record'}
    
    # Medical history methods
    def get_patient_history(self, patient_id):
        """
        Get a patient's medical history
        
        Args:
            patient_id (str): The patient's unique identifier
            
        Returns:
            dict: Patient's medical history
        """
        try:
            return self.get('patient_history', params={'patient_id': patient_id})
        except Exception as e:
            logger.error(f"Error fetching patient history: {e}")
            return {'error': 'Failed to retrieve patient medical history'}
    
    def add_medical_record(self, patient_id, record_data):
        """
        Add a new medical record to patient history
        
        Args:
            patient_id (str): The patient's unique identifier
            record_data (dict): Medical record information
            
        Returns:
            dict: Created medical record
        """
        try:
            data = record_data.copy()
            data['patient_id'] = patient_id
            data['created_at'] = datetime.now().isoformat()
            
            return self.post('medical_record_create', data=data)
        except Exception as e:
            logger.error(f"Error adding medical record: {e}")
            return {'error': 'Failed to add medical record'}
    
    # Lab results methods
    def get_lab_results(self, patient_id, start_date=None, end_date=None):
        """
        Get a patient's lab results
        
        Args:
            patient_id (str): The patient's unique identifier
            start_date (str, optional): Filter by start date (ISO format)
            end_date (str, optional): Filter by end date (ISO format)
            
        Returns:
            list: Patient's lab results
        """
        try:
            params = {'patient_id': patient_id}
            if start_date:
                params['start_date'] = start_date
            if end_date:
                params['end_date'] = end_date
                
            return self.get('lab_results', params=params)
        except Exception as e:
            logger.error(f"Error fetching lab results: {e}")
            return {'error': 'Failed to retrieve lab results'}
    
    def add_lab_result(self, patient_id, lab_data):
        """
        Add new lab results for a patient
        
        Args:
            patient_id (str): The patient's unique identifier
            lab_data (dict): Lab result information
            
        Returns:
            dict: Created lab result
        """
        try:
            data = lab_data.copy()
            data['patient_id'] = patient_id
            data['recorded_at'] = datetime.now().isoformat()
            
            return self.post('lab_result_create', data=data)
        except Exception as e:
            logger.error(f"Error adding lab result: {e}")
            return {'error': 'Failed to add lab result'}
    
    # Prescription methods
    def get_prescriptions(self, patient_id, active_only=False):
        """
        Get a patient's prescriptions
        
        Args:
            patient_id (str): The patient's unique identifier
            active_only (bool): Filter for active prescriptions only
            
        Returns:
            list: Patient's prescriptions
        """
        try:
            params = {'patient_id': patient_id}
            if active_only:
                params['active'] = 'true'
                
            return self.get('prescriptions', params=params)
        except Exception as e:
            logger.error(f"Error fetching prescriptions: {e}")
            return {'error': 'Failed to retrieve prescriptions'}
    
    def add_prescription(self, patient_id, prescription_data):
        """
        Add a new prescription for a patient
        
        Args:
            patient_id (str): The patient's unique identifier
            prescription_data (dict): Prescription information
            
        Returns:
            dict: Created prescription
        """
        try:
            data = prescription_data.copy()
            data['patient_id'] = patient_id
            data['prescribed_at'] = datetime.now().isoformat()
            
            return self.post('prescription_create', data=data)
        except Exception as e:
            logger.error(f"Error adding prescription: {e}")
            return {'error': 'Failed to add prescription'}
    
    # Facility methods
    def get_facilities(self, location=None, service_type=None):
        """
        Get healthcare facilities, optionally filtered by location or services
        
        Args:
            location (str, optional): Geographic location to filter by
            service_type (str, optional): Type of service to filter by
            
        Returns:
            list: Healthcare facilities
        """
        try:
            params = {}
            if location:
                params['location'] = location
            if service_type:
                params['service_type'] = service_type
                
            return self.get('facilities', params=params)
        except Exception as e:
            logger.error(f"Error fetching facilities: {e}")
            return {'error': 'Failed to retrieve healthcare facilities'} 