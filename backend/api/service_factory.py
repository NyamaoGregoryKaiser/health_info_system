import os
import logging
from .external_api_service import ExternalAPIService

logger = logging.getLogger('api_factory')

class APIServiceFactory:
    """
    Factory for creating and configuring API service instances.
    This factory helps with dependency injection and configuration management.
    """
    
    def __init__(self, config=None):
        """
        Initialize the factory with optional configuration
        
        Args:
            config (dict, optional): Configuration parameters for services
        """
        self.config = config or {}
        self._load_environment_config()
    
    def _load_environment_config(self):
        """Load configuration from environment variables"""
        # API token
        if not self.config.get('api_token') and os.environ.get('EXTERNAL_API_TOKEN'):
            self.config['api_token'] = os.environ.get('EXTERNAL_API_TOKEN')
        
        # Base URL
        if not self.config.get('base_url') and os.environ.get('EXTERNAL_API_BASE_URL'):
            self.config['base_url'] = os.environ.get('EXTERNAL_API_BASE_URL')
        
        # Logging level
        if not self.config.get('log_level') and os.environ.get('API_LOG_LEVEL'):
            self.config['log_level'] = os.environ.get('API_LOG_LEVEL')
    
    def create_external_api_service(self):
        """
        Create an instance of the External API Service
        
        Returns:
            ExternalAPIService: Configured service instance
        """
        # Configure logging if specified
        if self.config.get('log_level'):
            log_level = self._parse_log_level(self.config['log_level'])
            logging.getLogger('external_api').setLevel(log_level)
            logging.getLogger('external_api_client').setLevel(log_level)
        
        # Create service with API token if available
        api_token = self.config.get('api_token')
        if not api_token:
            logger.warning("No API token provided for external API service")
        
        return ExternalAPIService(token=api_token)
    
    def _parse_log_level(self, level_str):
        """Convert string log level to logging constant"""
        levels = {
            'debug': logging.DEBUG,
            'info': logging.INFO,
            'warning': logging.WARNING,
            'error': logging.ERROR,
            'critical': logging.CRITICAL
        }
        
        level_str = level_str.lower()
        if level_str in levels:
            return levels[level_str]
        
        # Default to INFO if invalid level provided
        logger.warning(f"Invalid log level '{level_str}', defaulting to INFO")
        return logging.INFO 