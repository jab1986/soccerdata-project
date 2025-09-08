"""
Error Handling and Retry Utilities for Soccer Data Pipeline

This module provides robust error handling, retry mechanisms, and structured logging
for the soccer data scraping pipeline. It implements exponential backoff strategies
and comprehensive error categorization to make the data collection more reliable.

Author: DS-03 Implementation
Version: 1.0
"""

import time
import logging
import traceback
from functools import wraps
from typing import Optional, Any, Callable, Type, Union, List
from datetime import datetime
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


# ========================================
# Custom Exception Classes
# ========================================

class SoccerDataError(Exception):
    """Base exception for soccer data pipeline errors."""
    
    def __init__(self, message: str, context: Optional[dict] = None):
        super().__init__(message)
        self.message = message
        self.context = context or {}
        self.timestamp = datetime.now()


class NetworkError(SoccerDataError):
    """Raised when network-related issues occur."""
    pass


class RateLimitError(SoccerDataError):
    """Raised when rate limiting is encountered."""
    pass


class DataParsingError(SoccerDataError):
    """Raised when data parsing fails."""
    pass


class ValidationError(SoccerDataError):
    """Raised when data validation fails."""
    pass


class ScrapingError(SoccerDataError):
    """Raised when general scraping issues occur."""
    pass


# ========================================
# Retry Configuration
# ========================================

class RetryConfig:
    """Configuration for retry strategies."""
    
    # Network errors: 3 retries with exponential backoff (1s, 2s, 4s)
    NETWORK_RETRIES = 3
    NETWORK_BACKOFF_FACTOR = 2
    NETWORK_BASE_DELAY = 1
    
    # Rate limiting: Longer backoff periods (30s, 60s, 120s)
    RATE_LIMIT_RETRIES = 3
    RATE_LIMIT_BACKOFF_FACTOR = 2
    RATE_LIMIT_BASE_DELAY = 30
    
    # Server errors: Immediate retry once, then exponential backoff
    SERVER_ERROR_RETRIES = 2
    SERVER_ERROR_BACKOFF_FACTOR = 2
    SERVER_ERROR_BASE_DELAY = 1
    
    # Data parsing errors: No retry, log and continue
    PARSING_RETRIES = 0


# ========================================
# Circuit Breaker Pattern
# ========================================

class CircuitBreaker:
    """Circuit breaker pattern for handling persistent failures."""
    
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func: Callable, *args, **kwargs):
        """Execute function with circuit breaker protection."""
        if self.state == 'OPEN':
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = 'HALF_OPEN'
            else:
                raise SoccerDataError("Circuit breaker is OPEN - too many failures")
        
        try:
            result = func(*args, **kwargs)
            if self.state == 'HALF_OPEN':
                self.state = 'CLOSED'
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = 'OPEN'
                logging.error(f"Circuit breaker opened due to {self.failure_count} failures")
            
            raise


# ========================================
# Structured Logging Setup
# ========================================

class SoccerDataLogger:
    """Structured logger for soccer data pipeline."""
    
    def __init__(self, name: str = "soccerdata_pipeline", log_file: Optional[str] = None):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # Prevent duplicate handlers
        if not self.logger.handlers:
            # Console handler
            console_handler = logging.StreamHandler()
            console_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            console_handler.setFormatter(console_formatter)
            self.logger.addHandler(console_handler)
            
            # File handler if specified
            if log_file:
                file_handler = logging.FileHandler(log_file)
                file_formatter = logging.Formatter(
                    '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
                )
                file_handler.setFormatter(file_formatter)
                self.logger.addHandler(file_handler)
    
    def log_error(self, error: Exception, context: Optional[dict] = None):
        """Log error with context and traceback."""
        context = context or {}
        error_info = {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context,
            'traceback': traceback.format_exc()
        }
        self.logger.error(f"Error occurred: {error_info}")
    
    def log_retry_attempt(self, attempt: int, max_attempts: int, delay: float, context: dict):
        """Log retry attempt information."""
        self.logger.warning(
            f"Retry attempt {attempt}/{max_attempts} in {delay}s - Context: {context}"
        )
    
    def log_success(self, operation: str, context: Optional[dict] = None):
        """Log successful operation."""
        context = context or {}
        self.logger.info(f"Operation '{operation}' completed successfully - Context: {context}")


# Global logger instance
logger = SoccerDataLogger()


# ========================================
# Retry Decorators
# ========================================

def retry_with_backoff(
    max_attempts: int = 3,
    backoff_factor: float = 2,
    base_delay: float = 1,
    exceptions: tuple = (Exception,),
    retry_on: Optional[Callable[[Exception], bool]] = None
):
    """
    Decorator for retrying functions with exponential backoff.
    
    Args:
        max_attempts: Maximum number of retry attempts
        backoff_factor: Multiplier for delay between attempts
        base_delay: Base delay in seconds
        exceptions: Tuple of exceptions to retry on
        retry_on: Optional function to determine if exception should trigger retry
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_attempts):
                try:
                    result = func(*args, **kwargs)
                    if attempt > 0:  # Log successful retry
                        logger.log_success(
                            f"{func.__name__}",
                            {"attempt": attempt + 1, "total_attempts": max_attempts}
                        )
                    return result
                    
                except exceptions as e:
                    last_exception = e
                    
                    # Check if we should retry this exception
                    if retry_on and not retry_on(e):
                        logger.log_error(e, {"function": func.__name__, "no_retry": True})
                        raise
                    
                    # Don't retry on last attempt
                    if attempt == max_attempts - 1:
                        break
                    
                    # Calculate delay
                    delay = base_delay * (backoff_factor ** attempt)
                    
                    # Log retry attempt
                    logger.log_retry_attempt(
                        attempt + 1, max_attempts, delay,
                        {"function": func.__name__, "error": str(e)}
                    )
                    
                    # Wait before retrying
                    time.sleep(delay)
            
            # All retries failed
            logger.log_error(
                last_exception,
                {"function": func.__name__, "max_attempts_reached": True}
            )
            raise last_exception
        
        return wrapper
    return decorator


def smart_retry(func):
    """
    Smart retry decorator that applies different retry strategies based on error type.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        def should_retry_network_error(e):
            """Determine if network error should be retried."""
            if isinstance(e, requests.exceptions.ConnectionError):
                return True
            if isinstance(e, requests.exceptions.Timeout):
                return True
            if isinstance(e, requests.exceptions.RequestException):
                return True
            return False
        
        def should_retry_rate_limit(e):
            """Determine if rate limit error should be retried."""
            if isinstance(e, requests.exceptions.HTTPError):
                if hasattr(e.response, 'status_code') and e.response.status_code == 429:
                    return True
            return False
        
        def should_retry_server_error(e):
            """Determine if server error should be retried."""
            if isinstance(e, requests.exceptions.HTTPError):
                if hasattr(e.response, 'status_code') and 500 <= e.response.status_code < 600:
                    return True
            return False
        
        # Try with different retry strategies based on error type
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if should_retry_network_error(e):
                retry_func = retry_with_backoff(
                    max_attempts=RetryConfig.NETWORK_RETRIES,
                    backoff_factor=RetryConfig.NETWORK_BACKOFF_FACTOR,
                    base_delay=RetryConfig.NETWORK_BASE_DELAY,
                    exceptions=(NetworkError, requests.exceptions.RequestException)
                )(func)
                return retry_func(*args, **kwargs)
            
            elif should_retry_rate_limit(e):
                retry_func = retry_with_backoff(
                    max_attempts=RetryConfig.RATE_LIMIT_RETRIES,
                    backoff_factor=RetryConfig.RATE_LIMIT_BACKOFF_FACTOR,
                    base_delay=RetryConfig.RATE_LIMIT_BASE_DELAY,
                    exceptions=(RateLimitError,)
                )(func)
                return retry_func(*args, **kwargs)
            
            elif should_retry_server_error(e):
                retry_func = retry_with_backoff(
                    max_attempts=RetryConfig.SERVER_ERROR_RETRIES,
                    backoff_factor=RetryConfig.SERVER_ERROR_BACKOFF_FACTOR,
                    base_delay=RetryConfig.SERVER_ERROR_BASE_DELAY,
                    exceptions=(requests.exceptions.HTTPError,)
                )(func)
                return retry_func(*args, **kwargs)
            
            else:
                # No retry for parsing errors and other exceptions
                logger.log_error(e, {"function": func.__name__, "no_retry_applied": True})
                raise
    
    return wrapper


# ========================================
# HTTP Session with Retry
# ========================================

def create_robust_session(
    total_retries: int = 3,
    backoff_factor: float = 0.3,
    status_forcelist: List[int] = None,
    timeout: int = 30
) -> requests.Session:
    """
    Create an HTTP session with built-in retry strategy.
    
    Args:
        total_retries: Total number of retries
        backoff_factor: Backoff factor for retries
        status_forcelist: HTTP status codes to retry on
        timeout: Request timeout in seconds
    
    Returns:
        Configured requests.Session object
    """
    if status_forcelist is None:
        status_forcelist = [429, 500, 502, 503, 504]
    
    session = requests.Session()
    
    # Configure retry strategy
    retry_strategy = Retry(
        total=total_retries,
        status_forcelist=status_forcelist,
        method_whitelist=["HEAD", "GET", "OPTIONS"],
        backoff_factor=backoff_factor
    )
    
    # Mount adapter with retry strategy
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    # Set default timeout
    session.timeout = timeout
    
    return session


# ========================================
# Error Recovery Strategies
# ========================================

class ErrorRecoveryManager:
    """Manager for error recovery strategies."""
    
    def __init__(self):
        self.circuit_breakers = {}
    
    def get_circuit_breaker(self, name: str) -> CircuitBreaker:
        """Get or create a circuit breaker for the given name."""
        if name not in self.circuit_breakers:
            self.circuit_breakers[name] = CircuitBreaker()
        return self.circuit_breakers[name]
    
    def safe_execute(self, func: Callable, circuit_name: str, *args, **kwargs):
        """Execute function with circuit breaker protection."""
        circuit_breaker = self.get_circuit_breaker(circuit_name)
        return circuit_breaker.call(func, *args, **kwargs)
    
    def handle_partial_failure(self, data, errors: List[Exception], context: dict):
        """Handle partial failure scenarios where some data was collected."""
        logger.logger.warning(
            f"Partial failure in {context.get('operation', 'unknown')}: "
            f"{len(errors)} errors occurred, but {len(data) if hasattr(data, '__len__') else 'some'} data collected"
        )
        
        # Log each error
        for i, error in enumerate(errors):
            logger.log_error(error, {**context, "error_index": i})
        
        return data  # Return the partial data
    
    def graceful_degradation(self, primary_func: Callable, fallback_func: Callable, *args, **kwargs):
        """Attempt primary function, fall back to secondary on failure."""
        try:
            return primary_func(*args, **kwargs)
        except Exception as e:
            logger.log_error(e, {"attempting_fallback": True})
            try:
                result = fallback_func(*args, **kwargs)
                logger.logger.info("Successfully used fallback strategy")
                return result
            except Exception as fallback_error:
                logger.log_error(fallback_error, {"fallback_also_failed": True})
                raise e  # Raise the original error


# Global error recovery manager
recovery_manager = ErrorRecoveryManager()


# ========================================
# Utility Functions
# ========================================

def classify_error(error: Exception) -> str:
    """Classify error into categories for proper handling."""
    if isinstance(error, requests.exceptions.ConnectionError):
        return "network"
    elif isinstance(error, requests.exceptions.Timeout):
        return "network"
    elif isinstance(error, requests.exceptions.HTTPError):
        if hasattr(error.response, 'status_code'):
            if error.response.status_code == 429:
                return "rate_limit"
            elif 500 <= error.response.status_code < 600:
                return "server_error"
        return "http_error"
    elif isinstance(error, (ValueError, KeyError, AttributeError)):
        return "parsing"
    elif "validation" in str(error).lower():
        return "validation"
    else:
        return "unknown"


def create_error_context(operation: str, **kwargs) -> dict:
    """Create standardized error context dictionary."""
    context = {
        "operation": operation,
        "timestamp": datetime.now().isoformat(),
    }
    context.update(kwargs)
    return context


# ========================================
# Example Usage Functions
# ========================================

def example_robust_web_request(url: str) -> dict:
    """Example of making a robust web request with error handling."""
    @smart_retry
    def _make_request(url: str):
        session = create_robust_session()
        try:
            response = session.get(url)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            error_type = classify_error(e)
            context = create_error_context("web_request", url=url, error_type=error_type)
            
            if error_type == "network":
                raise NetworkError(f"Network error accessing {url}: {e}", context)
            elif error_type == "rate_limit":
                raise RateLimitError(f"Rate limit exceeded for {url}: {e}", context)
            else:
                raise ScrapingError(f"Request failed for {url}: {e}", context)
    
    return _make_request(url)


if __name__ == "__main__":
    # Example usage
    print("Error Handler Module - Test Mode")
    
    # Test logging
    logger.log_success("test_operation", {"test": True})
    
    # Test error classification
    try:
        raise requests.exceptions.ConnectionError("Test connection error")
    except Exception as e:
        error_type = classify_error(e)
        print(f"Error classified as: {error_type}")
        logger.log_error(e, create_error_context("test", error_type=error_type))
