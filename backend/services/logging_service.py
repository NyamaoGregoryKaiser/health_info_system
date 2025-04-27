import logging
import logging.handlers
import os
import sys
from typing import Dict, Any, Optional

class LoggingService:
    """Service for configuring and managing application logging."""
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the logging service.
        
        Args:
            config: Logging configuration dictionary
        """
        self.config = config or {}
        self.loggers = {}
        
        # Configure root logger by default
        self.configure_logging()
        
    def configure_logging(self):
        """Configure logging based on provided configuration."""
        # Get configuration values with defaults
        log_level = self.config.get("log_level", "INFO")
        log_format = self.config.get("log_format", 
                                    "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        log_date_format = self.config.get("log_date_format", "%Y-%m-%d %H:%M:%S")
        log_file = self.config.get("log_file")
        log_file_max_bytes = self.config.get("log_file_max_bytes", 10 * 1024 * 1024)  # 10 MB
        log_file_backup_count = self.config.get("log_file_backup_count", 5)
        
        # Create formatter
        formatter = logging.Formatter(log_format, log_date_format)
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(self._get_log_level(log_level))
        
        # Remove existing handlers to avoid duplicates
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Add console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)
        
        # Add file handler if log file is specified
        if log_file:
            # Ensure log directory exists
            log_dir = os.path.dirname(log_file)
            if log_dir and not os.path.exists(log_dir):
                os.makedirs(log_dir)
                
            file_handler = logging.handlers.RotatingFileHandler(
                log_file,
                maxBytes=log_file_max_bytes,
                backupCount=log_file_backup_count
            )
            file_handler.setFormatter(formatter)
            root_logger.addHandler(file_handler)
        
        # Store root logger
        self.loggers["root"] = root_logger
        
        # Log configuration completed
        logging.info("Logging configured with level: %s", log_level)
        if log_file:
            logging.info("Log file: %s", log_file)
    
    def _get_log_level(self, level_name: str) -> int:
        """
        Convert log level name to logging module constant.
        
        Args:
            level_name: Log level name
            
        Returns:
            Log level constant
        """
        level_map = {
            "CRITICAL": logging.CRITICAL,
            "ERROR": logging.ERROR,
            "WARNING": logging.WARNING,
            "INFO": logging.INFO,
            "DEBUG": logging.DEBUG,
            "NOTSET": logging.NOTSET
        }
        
        return level_map.get(level_name.upper(), logging.INFO)
    
    def get_logger(self, name: str, level: Optional[str] = None) -> logging.Logger:
        """
        Get logger with specified name.
        
        Args:
            name: Logger name
            level: Optional level for this specific logger
            
        Returns:
            Logger instance
        """
        if name in self.loggers:
            return self.loggers[name]
            
        logger = logging.getLogger(name)
        
        if level:
            logger.setLevel(self._get_log_level(level))
            
        self.loggers[name] = logger
        return logger
    
    def set_log_level(self, level: str, logger_name: Optional[str] = None) -> None:
        """
        Set log level for specified logger or root logger.
        
        Args:
            level: Log level name
            logger_name: Logger name, default is root logger
        """
        log_level = self._get_log_level(level)
        
        if logger_name:
            logger = self.get_logger(logger_name)
            logger.setLevel(log_level)
            logging.info("Set log level for %s to %s", logger_name, level)
        else:
            # Set for root logger
            root_logger = logging.getLogger()
            root_logger.setLevel(log_level)
            logging.info("Set global log level to %s", level)
    
    def add_file_handler(self, log_file: str, level: Optional[str] = None, 
                         logger_name: Optional[str] = None) -> None:
        """
        Add additional file handler to logger.
        
        Args:
            log_file: Path to log file
            level: Log level for this handler
            logger_name: Logger name, default is root logger
        """
        # Ensure log directory exists
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        log_format = self.config.get("log_format", 
                                   "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        log_date_format = self.config.get("log_date_format", "%Y-%m-%d %H:%M:%S")
        log_file_max_bytes = self.config.get("log_file_max_bytes", 10 * 1024 * 1024)
        log_file_backup_count = self.config.get("log_file_backup_count", 5)
        
        # Create handler
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=log_file_max_bytes,
            backupCount=log_file_backup_count
        )
        
        # Set formatter
        formatter = logging.Formatter(log_format, log_date_format)
        file_handler.setFormatter(formatter)
        
        # Set level if specified
        if level:
            file_handler.setLevel(self._get_log_level(level))
        
        # Add to logger
        if logger_name:
            logger = self.get_logger(logger_name)
            logger.addHandler(file_handler)
        else:
            # Add to root logger
            root_logger = logging.getLogger()
            root_logger.addHandler(file_handler)
        
        logging.info("Added file handler for %s to %s", 
                  logger_name or "root logger", log_file) 