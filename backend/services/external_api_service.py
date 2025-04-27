import logging
import requests
from typing import Dict, Any, Optional
from requests.exceptions import RequestException
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

class ExternalAPIService:
    """Service for interacting with external health information APIs."""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the API service with configuration.
        
        Args:
            config: Configuration dictionary containing API settings
        """
        self.api_config = config.get('api', {})
        self.base_url = self.api_config.get('base_url')
        self.token = self.api_config.get('token')
        self.timeout = self.api_config.get('timeout', 30)
        self.retry_attempts = self.api_config.get('retry_attempts', 3)
        
        if not self.base_url:
            raise ValueError("API base URL is required")
        
        logger.info(f"ExternalAPIService initialized with base URL: {self.base_url}")
    
    def _get_headers(self) -> Dict[str, str]:
        """
        Get the headers for API requests.
        
        Returns:
            Dict containing the headers
        """
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
            
        return headers
    
    @retry(
        retry=retry_if_exception_type(RequestException),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def _request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """
        Make a request to the API with automatic retries.
        
        Args:
            method: HTTP method (get, post, put, etc.)
            endpoint: API endpoint
            **kwargs: Additional arguments to pass to requests
            
        Returns:
            Response object
            
        Raises:
            RequestException: If the request fails after retries
        """
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        
        if 'headers' not in kwargs:
            kwargs['headers'] = self._get_headers()
            
        if 'timeout' not in kwargs:
            kwargs['timeout'] = self.timeout
            
        try:
            response = requests.request(method, url, **kwargs)
            response.raise_for_status()
            return response
        except RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            raise
    
    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Make a GET request to the API.
        
        Args:
            endpoint: API endpoint
            params: Query parameters
            
        Returns:
            JSON response as dictionary
        """
        response = self._request('get', endpoint, params=params)
        return response.json()
    
    def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a POST request to the API.
        
        Args:
            endpoint: API endpoint
            data: Request data
            
        Returns:
            JSON response as dictionary
        """
        response = self._request('post', endpoint, json=data)
        return response.json()
    
    def put(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a PUT request to the API.
        
        Args:
            endpoint: API endpoint
            data: Request data
            
        Returns:
            JSON response as dictionary
        """
        response = self._request('put', endpoint, json=data)
        return response.json()
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        """
        Make a DELETE request to the API.
        
        Args:
            endpoint: API endpoint
            
        Returns:
            JSON response as dictionary
        """
        response = self._request('delete', endpoint)
        return response.json()
    
    def search_health_records(self, query: str, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Search for health records using the external API.
        
        Args:
            query: Search query
            filters: Optional filters for the search
            
        Returns:
            Search results
        """
        params = {'q': query}
        if filters:
            params.update(filters)
            
        return self.get('records/search', params=params)
    
    def get_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """
        Get patient data from the API.
        
        Args:
            patient_id: ID of the patient
            
        Returns:
            Patient data
        """
        return self.get(f'patients/{patient_id}')
    
    def submit_health_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit health data to the API.
        
        Args:
            data: Health data to submit
            
        Returns:
            API response
        """
        return self.post('data/submit', data) 