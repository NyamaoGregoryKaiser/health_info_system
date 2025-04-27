import os
import json
import yaml
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class ConfigService:
    """Service for handling application configuration."""
    
    def __init__(self, config_path: Optional[str] = None, env_prefix: str = "HEALTH_INFO"):
        """
        Initialize the configuration service.
        
        Args:
            config_path: Path to configuration file
            env_prefix: Environment variable prefix for overrides
        """
        self.config_path = config_path
        self.env_prefix = env_prefix
        self.config = {}
        
        # Load configuration
        self._load_config()
        
        # Override with environment variables
        self._override_from_env()
        
        logger.info("Configuration service initialized")
        
    def _load_config(self) -> None:
        """
        Load configuration from file.
        
        Raises:
            FileNotFoundError: If configuration file does not exist
            ValueError: If configuration file has invalid format
        """
        if not self.config_path:
            logger.warning("No configuration file specified, using default settings")
            self.config = self._get_default_config()
            return
            
        if not os.path.exists(self.config_path):
            logger.warning(f"Configuration file {self.config_path} not found, using default settings")
            self.config = self._get_default_config()
            return
            
        file_ext = os.path.splitext(self.config_path)[1].lower()
        
        try:
            if file_ext == '.json':
                with open(self.config_path, 'r') as f:
                    self.config = json.load(f)
            elif file_ext in ['.yml', '.yaml']:
                with open(self.config_path, 'r') as f:
                    self.config = yaml.safe_load(f)
            else:
                logger.error(f"Unsupported configuration file format: {file_ext}")
                self.config = self._get_default_config()
        except Exception as e:
            logger.error(f"Error loading configuration file: {str(e)}")
            self.config = self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """
        Get default configuration.
        
        Returns:
            Default configuration dictionary
        """
        return {
            "app": {
                "name": "Health Information System",
                "debug": False,
                "log_level": "INFO",
                "secret_key": "default_secret_key_replace_in_production"
            },
            "server": {
                "host": "127.0.0.1",
                "port": 5000,
                "workers": 4
            },
            "database": {
                "dialect": "sqlite",
                "database": "health_info.db",
                "echo": False
            },
            "external_api": {
                "base_url": "https://api.health.example.com",
                "timeout": 30,
                "retry_attempts": 3
            },
            "security": {
                "jwt_secret": "default_jwt_secret_replace_in_production",
                "token_expiry_minutes": 60,
                "password_min_length": 8,
                "password_require_uppercase": True,
                "password_require_lowercase": True,
                "password_require_numbers": True,
                "password_require_special": True
            },
            "cache": {
                "enabled": True,
                "type": "memory",
                "expiration": 300
            }
        }
    
    def _override_from_env(self) -> None:
        """
        Override configuration with environment variables.
        
        Environment variables should be in the format:
        {ENV_PREFIX}__SECTION__KEY=value
        
        For example:
        HEALTH_INFO__DATABASE__HOST=localhost
        """
        prefix = f"{self.env_prefix}__"
        
        for env_key, env_value in os.environ.items():
            if env_key.startswith(prefix):
                # Remove prefix and split into section and key
                key_parts = env_key[len(prefix):].split('__')
                
                if len(key_parts) != 2:
                    logger.warning(f"Invalid environment variable format: {env_key}")
                    continue
                    
                section, key = key_parts
                
                # Ensure section exists
                if section not in self.config:
                    self.config[section] = {}
                
                # Try to parse value as JSON, fallback to string
                try:
                    self.config[section][key] = json.loads(env_value)
                except json.JSONDecodeError:
                    self.config[section][key] = env_value
                
                logger.debug(f"Configuration override from environment: {section}.{key}")
    
    def get(self, section: str, key: str, default: Any = None) -> Any:
        """
        Get configuration value.
        
        Args:
            section: Configuration section
            key: Configuration key
            default: Default value if not found
            
        Returns:
            Configuration value or default
        """
        return self.config.get(section, {}).get(key, default)
    
    def get_section(self, section: str) -> Dict[str, Any]:
        """
        Get entire configuration section.
        
        Args:
            section: Configuration section
            
        Returns:
            Configuration section as dictionary
        """
        return self.config.get(section, {})
    
    def set(self, section: str, key: str, value: Any) -> None:
        """
        Set configuration value.
        
        Args:
            section: Configuration section
            key: Configuration key
            value: Configuration value
        """
        if section not in self.config:
            self.config[section] = {}
        
        self.config[section][key] = value
    
    def save(self, config_path: Optional[str] = None) -> None:
        """
        Save configuration to file.
        
        Args:
            config_path: Path to save configuration file, defaults to original path
            
        Raises:
            IOError: If saving fails
            ValueError: If file format is not supported
        """
        save_path = config_path or self.config_path
        
        if not save_path:
            raise ValueError("No configuration file path specified")
            
        file_ext = os.path.splitext(save_path)[1].lower()
        
        try:
            if file_ext == '.json':
                with open(save_path, 'w') as f:
                    json.dump(self.config, f, indent=2)
            elif file_ext in ['.yml', '.yaml']:
                with open(save_path, 'w') as f:
                    yaml.dump(self.config, f)
            else:
                raise ValueError(f"Unsupported configuration file format: {file_ext}")
                
            logger.info(f"Configuration saved to {save_path}")
        except Exception as e:
            logger.error(f"Error saving configuration: {str(e)}")
            raise 