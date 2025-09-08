#!/usr/bin/env python3
"""
Test script for DS-03 Error Handling Enhancement

This script validates the error handling capabilities implemented for the soccer data pipeline.
It tests various error scenarios, retry mechanisms, and recovery strategies.

Usage: python3 test_error_handling.py
"""

import sys
import os
import time
from datetime import datetime

# Add scripts directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scripts'))

def test_error_handler_import():
    """Test that error handler module can be imported."""
    print("🔍 Testing error handler module import...")
    
    try:
        from error_handler import (
            logger, classify_error, create_error_context,
            retry_with_backoff, smart_retry, recovery_manager,
            NetworkError, DataParsingError, ScrapingError
        )
        print("✅ Error handler module imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Failed to import error handler: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error importing error handler: {e}")
        return False


def test_error_classification():
    """Test error classification functionality."""
    print("\n🔍 Testing error classification...")
    
    try:
        from error_handler import classify_error
        import requests
        
        # Test different error types
        test_cases = [
            (requests.exceptions.ConnectionError("Connection failed"), "network"),
            (requests.exceptions.Timeout("Request timeout"), "network"),
            (ValueError("Invalid value"), "parsing"),
            (KeyError("Missing key"), "parsing"),
        ]
        
        for error, expected_type in test_cases:
            actual_type = classify_error(error)
            if actual_type == expected_type:
                print(f"✅ {type(error).__name__} → {actual_type}")
            else:
                print(f"❌ {type(error).__name__} → {actual_type} (expected {expected_type})")
                return False
        
        print("✅ Error classification tests passed")
        return True
        
    except Exception as e:
        print(f"❌ Error classification test failed: {e}")
        return False


def test_retry_mechanism():
    """Test retry mechanism with controlled failures."""
    print("\n🔍 Testing retry mechanism...")
    
    try:
        from error_handler import retry_with_backoff, logger
        
        # Counter for tracking attempts
        attempt_count = {"count": 0}
        
        @retry_with_backoff(max_attempts=3, base_delay=0.1)
        def failing_function():
            attempt_count["count"] += 1
            if attempt_count["count"] < 3:
                raise ConnectionError(f"Attempt {attempt_count['count']} failed")
            return f"Success on attempt {attempt_count['count']}"
        
        # Test successful retry
        result = failing_function()
        if attempt_count["count"] == 3 and "Success" in result:
            print("✅ Retry mechanism working correctly")
            return True
        else:
            print(f"❌ Retry mechanism failed: attempts={attempt_count['count']}, result={result}")
            return False
            
    except Exception as e:
        print(f"❌ Retry mechanism test failed: {e}")
        return False


def test_circuit_breaker():
    """Test circuit breaker functionality."""
    print("\n🔍 Testing circuit breaker...")
    
    try:
        from error_handler import CircuitBreaker
        
        # Create circuit breaker with low threshold for testing
        circuit = CircuitBreaker(failure_threshold=2, recovery_timeout=1)
        
        def failing_function():
            raise ConnectionError("Test failure")
        
        # Test failure accumulation
        failures = 0
        for i in range(3):
            try:
                circuit.call(failing_function)
            except:
                failures += 1
        
        # Circuit should be open now
        if circuit.state == 'OPEN':
            print("✅ Circuit breaker opened after failures")
            
            # Test that circuit stays open
            try:
                circuit.call(failing_function)
                print("❌ Circuit breaker should have prevented call")
                return False
            except Exception as e:
                if "Circuit breaker is OPEN" in str(e):
                    print("✅ Circuit breaker correctly blocked call")
                    return True
                else:
                    print(f"❌ Unexpected error: {e}")
                    return False
        else:
            print(f"❌ Circuit breaker not opened (state: {circuit.state})")
            return False
            
    except Exception as e:
        print(f"❌ Circuit breaker test failed: {e}")
        return False


def test_logging_functionality():
    """Test structured logging functionality."""
    print("\n🔍 Testing logging functionality...")
    
    try:
        from error_handler import logger, create_error_context
        
        # Test success logging
        context = {"test": True, "timestamp": datetime.now().isoformat()}
        logger.log_success("test_operation", context)
        print("✅ Success logging works")
        
        # Test error logging
        try:
            raise ValueError("Test error for logging")
        except Exception as e:
            error_context = create_error_context("test_error", error_type="parsing")
            logger.log_error(e, error_context)
            print("✅ Error logging works")
        
        return True
        
    except Exception as e:
        print(f"❌ Logging test failed: {e}")
        return False


def test_scraper_integration():
    """Test that scrapers can handle error handling gracefully."""
    print("\n🔍 Testing scraper integration...")
    
    try:
        # Test that scrapers handle missing error handler gracefully
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'scripts'))
        
        # Mock the import to simulate when error_handler is not available
        original_modules = sys.modules.copy()
        
        # Test comprehensive_fixtures fallback
        if 'comprehensive_fixtures' in sys.modules:
            del sys.modules['comprehensive_fixtures']
        if 'error_handler' in sys.modules:
            del sys.modules['error_handler']
        
        # Temporarily rename error_handler to simulate missing dependency
        error_handler_path = os.path.join(os.path.dirname(__file__), 'scripts', 'error_handler.py')
        temp_path = error_handler_path + '.temp'
        
        if os.path.exists(error_handler_path):
            os.rename(error_handler_path, temp_path)
            
            try:
                # This should work without error_handler
                import comprehensive_fixtures
                if hasattr(comprehensive_fixtures, 'ERROR_HANDLING_AVAILABLE'):
                    if not comprehensive_fixtures.ERROR_HANDLING_AVAILABLE:
                        print("✅ Scraper gracefully handles missing error handler")
                        return True
                    else:
                        print("❌ ERROR_HANDLING_AVAILABLE should be False when module missing")
                        return False
                else:
                    print("❌ ERROR_HANDLING_AVAILABLE not defined in scraper")
                    return False
                    
            finally:
                # Restore error_handler
                if os.path.exists(temp_path):
                    os.rename(temp_path, error_handler_path)
                    
                # Restore modules
                sys.modules.clear()
                sys.modules.update(original_modules)
        else:
            print("⚠️ Skipping scraper integration test - error_handler.py not found")
            return True
            
    except Exception as e:
        print(f"❌ Scraper integration test failed: {e}")
        return False


def main():
    """Run all error handling tests."""
    print("🧪 DS-03 Error Handling Enhancement - Test Suite")
    print("=" * 60)
    
    tests = [
        ("Error Handler Import", test_error_handler_import),
        ("Error Classification", test_error_classification),
        ("Retry Mechanism", test_retry_mechanism),
        ("Circuit Breaker", test_circuit_breaker),
        ("Logging Functionality", test_logging_functionality),
        ("Scraper Integration", test_scraper_integration),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'=' * 60}")
        print(f"Running: {test_name}")
        print('-' * 60)
        
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print(f"\n{'=' * 60}")
    print("TEST SUMMARY")
    print('=' * 60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! DS-03 error handling implementation is working correctly.")
        return 0
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Please review the implementation.")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
