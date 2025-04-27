import logging
from typing import Dict, Any, Optional, Type, TypeVar, cast
from functools import lru_cache

from ..api.external_api_service import ExternalAPIService
from ..config import load_config, app_config

# Define a generic type for service classes
T = TypeVar('T')

class ServiceFactory:
    """
    Factory class for creating and caching service instances based on application configuration.
    
    This factory ensures services are properly configured and shared across the application.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the service factory with configuration.
        
        Args:
            config: Configuration dictionary, defaults to app_config if None
        """
        self.logger = logging.getLogger(__name__)
        self.config = config or app_config
        self.logger.info("Initialized ServiceFactory with configuration")
        
        # Services cache to avoid recreating instances
        self._services_cache: Dict[str, Any] = {}
    
    def get_external_api_service(self) -> ExternalAPIService:
        """
        Get or create an ExternalAPIService instance.
        
        Returns:
            ExternalAPIService: Configured instance of the external API service
        """
        service_key = "external_api_service"
        
        # Return cached instance if available
        if service_key in self._services_cache:
            return cast(ExternalAPIService, self._services_cache[service_key])
        
        # Get API configuration from app config
        api_config = self.config.get("api", {})
        base_url = api_config.get("base_url", "https://api.healthinfo.example.com")
        api_token = api_config.get("token")
        timeout = api_config.get("timeout", 30)
        retry_attempts = api_config.get("retry_attempts", 3)
        
        # Create new service instance
        service = ExternalAPIService(
            base_url=base_url,
            api_token=api_token,
            timeout=timeout,
            retry_attempts=retry_attempts,
            logger=logging.getLogger("api.external")
        )
        
        # Cache the service
        self._services_cache[service_key] = service
        self.logger.debug(f"Created new ExternalAPIService instance with base_url={base_url}")
        
        return service
    
    def get_service(self, service_class: Type[T], *args, **kwargs) -> T:
        """
        Generic method to get or create any service instance by its class.
        
        Args:
            service_class: The class of the service to create
            *args: Positional arguments to pass to the service constructor
            **kwargs: Keyword arguments to pass to the service constructor
            
        Returns:
            An instance of the requested service
        """
        service_key = service_class.__name__
        
        # Return cached instance if available
        if service_key in self._services_cache:
            return cast(T, self._services_cache[service_key])
        
        # Create new service instance
        service = service_class(*args, **kwargs)
        
        # Cache the service
        self._services_cache[service_key] = service
        self.logger.debug(f"Created new {service_key} instance")
        
        return service
    
    def reset_service(self, service_key: str) -> None:
        """
        Reset a cached service instance by its key.
        
        Args:
            service_key: The key of the service to reset
        """
        if service_key in self._services_cache:
            del self._services_cache[service_key]
            self.logger.debug(f"Reset {service_key} service instance")
    
    def reset_all_services(self) -> None:
        """
        Reset all cached service instances.
        """
        self._services_cache.clear()
        self.logger.debug("Reset all service instances")


# Create a globally accessible factory instance
@lru_cache(maxsize=1)
def get_service_factory(config: Optional[Dict[str, Any]] = None) -> ServiceFactory:
    """
    Get the global service factory instance.
    
    Args:
        config: Optional configuration to use, otherwise uses app_config
        
    Returns:
        ServiceFactory: The global service factory instance
    """
    return ServiceFactory(config or app_config) 