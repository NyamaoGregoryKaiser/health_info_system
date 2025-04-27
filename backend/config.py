import os
import json
import logging
from typing import Dict, Any, Optional
from pathlib import Path

# Set up logging
logger = logging.getLogger(__name__)

# Default configuration
default_config = {
    "api": {
        "base_url": "https://api.healthinfo.example.com", 
        "token": os.environ.get("API_TOKEN", ""),
        "timeout": 30,
        "retry_attempts": 3
    },
    "database": {
        "url": os.environ.get("DATABASE_URL", "sqlite:///health_info.db"),
        "pool_size": 5,
        "max_overflow": 10
    },
    "logging": {
        "level": os.environ.get("LOG_LEVEL", "INFO"),
        "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    },
    "security": {
        "secret_key": os.environ.get("SECRET_KEY", "dev_key_replace_in_production"),
        "jwt_expiration": 3600  # 1 hour
    }
}

# Global application config
app_config: Dict[str, Any] = {}


def load_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Load configuration from a file or environment variables.
    
    Args:
        config_path: Path to the configuration file (JSON format)
        
    Returns:
        Dict containing the application configuration
    """
    global app_config
    
    # Start with default configuration
    config = default_config.copy()
    
    # Try to load from file if provided
    if config_path:
        path = Path(config_path)
        if path.exists() and path.is_file():
            try:
                with open(path, 'r') as f:
                    file_config = json.load(f)
                    _merge_config(config, file_config)
                    logger.info(f"Loaded configuration from {config_path}")
            except Exception as e:
                logger.error(f"Failed to load configuration from {config_path}: {e}")
    
    # Override with environment variables
    _load_from_env(config)
    
    # Update global config
    app_config = config
    return config


def _merge_config(base: Dict[str, Any], override: Dict[str, Any]) -> None:
    """
    Recursively merge configurations.
    
    Args:
        base: Base configuration to update
        override: Configuration that overrides the base
    """
    for key, value in override.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            _merge_config(base[key], value)
        else:
            base[key] = value


def _load_from_env(config: Dict[str, Any], prefix: str = "APP_") -> None:
    """
    Load configuration from environment variables.
    
    Environment variables should be in the format PREFIX_SECTION_KEY.
    For example, APP_API_TIMEOUT will set config["api"]["timeout"].
    
    Args:
        config: Configuration dictionary to update
        prefix: Prefix for environment variables
    """
    for env_key, env_value in os.environ.items():
        if env_key.startswith(prefix):
            parts = env_key[len(prefix):].lower().split('_', 1)
            if len(parts) == 2:
                section, key = parts
                if section in config and key in config[section]:
                    # Try to convert to the same type as the default
                    orig_value = config[section][key]
                    try:
                        if isinstance(orig_value, bool):
                            config[section][key] = env_value.lower() in ('true', 'yes', '1')
                        elif isinstance(orig_value, int):
                            config[section][key] = int(env_value)
                        elif isinstance(orig_value, float):
                            config[section][key] = float(env_value)
                        else:
                            config[section][key] = env_value
                    except (ValueError, TypeError):
                        config[section][key] = env_value
                        
                    logger.debug(f"Set {section}.{key} from environment variable {env_key}")


# Load configuration on module import
load_config()


def configure_logging() -> None:
    """
    Configure logging based on application configuration.
    """
    log_config = app_config.get("logging", {})
    log_level = getattr(logging, log_config.get("level", "INFO"))
    log_format = log_config.get("format", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    
    logging.basicConfig(
        level=log_level,
        format=log_format
    )
    
    # Silence noisy loggers
    logging.getLogger("requests").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    
    logger.info(f"Logging configured at level {log_config.get('level', 'INFO')}") 