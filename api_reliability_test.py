#!/usr/bin/env python3
"""
Comprehensive API Reliability Test Suite for Soccer Data Betting Club
Tests all endpoints, error handling, and CORS configuration
"""

import requests
import json
import time
from datetime import datetime

# API Configuration
API_BASE_URL = "http://localhost:5000"
API_ENDPOINTS = {
    'fixtures': '/api/fixtures',
    'filter': '/api/fixtures/filter', 
    'export': '/api/fixtures/export',
    'scrape': '/api/scrape'
}

class APIReliabilityTester:
    def __init__(self):
        self.test_results = []
        self.passed = 0
        self.failed = 0
        
    def log_test(self, test_name, passed, details=None, http_status=None, response_time=None):
        """Log test results"""
        result = {
            'test_name': test_name,
            'passed': passed,
            'timestamp': datetime.now().isoformat(),
            'details': details,
            'http_status': http_status,
            'response_time': response_time
        }
        self.test_results.append(result)
        
        if passed:
            self.passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed += 1
            print(f"❌ {test_name}: {details}")
            
        if http_status:
            print(f"   HTTP Status: {http_status}")
        if response_time:
            print(f"   Response Time: {response_time:.3f}s")
            
    def test_endpoint_connectivity(self):
        """Test basic endpoint connectivity"""
        try:
            start_time = time.time()
            response = requests.get(f"{API_BASE_URL}{API_ENDPOINTS['fixtures']}")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if 'fixtures' in data and 'total_count' in data:
                    self.log_test(
                        "GET /api/fixtures - Basic Connectivity", 
                        True, 
                        f"Retrieved {data['total_count']} fixtures",
                        response.status_code,
                        response_time
                    )
                else:
                    self.log_test(
                        "GET /api/fixtures - Response Format",
                        False,
                        "Missing required fields in response",
                        response.status_code,
                        response_time
                    )
            else:
                self.log_test(
                    "GET /api/fixtures - HTTP Status",
                    False,
                    f"Expected 200, got {response.status_code}",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            self.log_test(
                "GET /api/fixtures - Connection", 
                False, 
                f"Connection failed: {str(e)}"
            )
            
    def test_filter_endpoint(self):
        """Test the filtering endpoint with various scenarios"""
        # Test 1: Valid filter request
        filter_data = {
            "leagues": ["ENG-Premier League"],
            "date_from": "2025-08-15",
            "date_to": "2025-08-20"
        }
        
        try:
            start_time = time.time()
            response = requests.post(
                f"{API_BASE_URL}{API_ENDPOINTS['filter']}",
                json=filter_data,
                headers={'Content-Type': 'application/json'}
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if 'fixtures' in data and 'count' in data and 'filters_applied' in data:
                    self.log_test(
                        "POST /api/fixtures/filter - Valid Request",
                        True,
                        f"Filtered to {data['count']} fixtures",
                        response.status_code,
                        response_time
                    )
                    
                    # Validate filter was applied correctly
                    if data['filters_applied']['leagues'] == filter_data['leagues']:
                        self.log_test(
                            "POST /api/fixtures/filter - Filter Application",
                            True,
                            "Filters correctly applied and returned",
                            response.status_code
                        )
                    else:
                        self.log_test(
                            "POST /api/fixtures/filter - Filter Application",
                            False,
                            "Filters not correctly applied",
                            response.status_code
                        )
                else:
                    self.log_test(
                        "POST /api/fixtures/filter - Response Format",
                        False,
                        "Missing required fields in filter response",
                        response.status_code,
                        response_time
                    )
            else:
                self.log_test(
                    "POST /api/fixtures/filter - HTTP Status",
                    False,
                    f"Expected 200, got {response.status_code}",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            self.log_test(
                "POST /api/fixtures/filter - Request",
                False,
                f"Request failed: {str(e)}"
            )
            
    def test_export_endpoint(self):
        """Test the export functionality"""
        export_data = {
            "fixtures": [
                {
                    "home_team": "Liverpool",
                    "away_team": "Bournemouth", 
                    "date": "2025-08-15",
                    "league": "ENG-Premier League"
                }
            ],
            "filename": "test_export_reliability.csv"
        }
        
        try:
            start_time = time.time()
            response = requests.post(
                f"{API_BASE_URL}{API_ENDPOINTS['export']}",
                json=export_data,
                headers={'Content-Type': 'application/json'}
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'filename' in data and 'path' in data:
                    self.log_test(
                        "POST /api/fixtures/export - Valid Request",
                        True,
                        f"Export successful: {data['filename']}",
                        response.status_code,
                        response_time
                    )
                else:
                    self.log_test(
                        "POST /api/fixtures/export - Response Format",
                        False,
                        "Missing required fields in export response",
                        response.status_code,
                        response_time
                    )
            else:
                self.log_test(
                    "POST /api/fixtures/export - HTTP Status",
                    False,
                    f"Expected 200, got {response.status_code}",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            self.log_test(
                "POST /api/fixtures/export - Request",
                False,
                f"Request failed: {str(e)}"
            )
            
    def test_legacy_endpoint(self):
        """Test the legacy scrape endpoint"""
        try:
            start_time = time.time()
            response = requests.post(f"{API_BASE_URL}{API_ENDPOINTS['scrape']}")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'note' in data:
                    self.log_test(
                        "POST /api/scrape - Legacy Support",
                        True,
                        "Legacy endpoint returns proper guidance",
                        response.status_code,
                        response_time
                    )
                else:
                    self.log_test(
                        "POST /api/scrape - Response Format",
                        False,
                        "Missing guidance in legacy response",
                        response.status_code,
                        response_time
                    )
            else:
                self.log_test(
                    "POST /api/scrape - HTTP Status",
                    False,
                    f"Expected 200, got {response.status_code}",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            self.log_test(
                "POST /api/scrape - Request",
                False,
                f"Request failed: {str(e)}"
            )
            
    def test_error_handling(self):
        """Test various error scenarios"""
        # Test 1: 404 for non-existent endpoint
        try:
            start_time = time.time()
            response = requests.get(f"{API_BASE_URL}/nonexistent")
            response_time = time.time() - start_time
            
            if response.status_code == 404:
                self.log_test(
                    "GET /nonexistent - 404 Handling",
                    True,
                    "Properly returns 404 for non-existent endpoints",
                    response.status_code,
                    response_time
                )
            else:
                self.log_test(
                    "GET /nonexistent - 404 Handling",
                    False,
                    f"Expected 404, got {response.status_code}",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            self.log_test(
                "GET /nonexistent - Error Handling",
                False,
                f"Request failed: {str(e)}"
            )
            
        # Test 2: Malformed JSON handling
        try:
            start_time = time.time()
            response = requests.post(
                f"{API_BASE_URL}{API_ENDPOINTS['filter']}",
                data='{invalid json}',
                headers={'Content-Type': 'application/json'}
            )
            response_time = time.time() - start_time
            
            # Should now return 400 (not 500) after our fix
            if response.status_code == 400:
                try:
                    error_data = response.json()
                    if 'error' in error_data:
                        self.log_test(
                            "POST /api/fixtures/filter - Malformed JSON",
                            True,
                            "Properly handles malformed JSON with 400 status",
                            response.status_code,
                            response_time
                        )
                    else:
                        self.log_test(
                            "POST /api/fixtures/filter - Malformed JSON",
                            False,
                            "Error response missing 'error' field",
                            response.status_code,
                            response_time
                        )
                except json.JSONDecodeError:
                    self.log_test(
                        "POST /api/fixtures/filter - Malformed JSON",
                        False,
                        "Error response is not valid JSON",
                        response.status_code,
                        response_time
                    )
            else:
                self.log_test(
                    "POST /api/fixtures/filter - Malformed JSON",
                    False,
                    f"Expected 400, got {response.status_code}",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            self.log_test(
                "POST /api/fixtures/filter - Malformed JSON",
                False,
                f"Request failed: {str(e)}"
            )
            
    def test_cors_configuration(self):
        """Test CORS headers for frontend compatibility"""
        try:
            # Test CORS with origin from React dev server
            headers = {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'X-Requested-With'
            }
            
            start_time = time.time()
            response = requests.get(
                f"{API_BASE_URL}{API_ENDPOINTS['fixtures']}",
                headers=headers
            )
            response_time = time.time() - start_time
            
            cors_header = response.headers.get('Access-Control-Allow-Origin')
            if cors_header:
                if 'localhost:3000' in cors_header or cors_header == '*':
                    self.log_test(
                        "CORS - Frontend Access",
                        True,
                        f"CORS properly configured: {cors_header}",
                        response.status_code,
                        response_time
                    )
                else:
                    self.log_test(
                        "CORS - Frontend Access",
                        False,
                        f"CORS header present but may not allow frontend: {cors_header}",
                        response.status_code,
                        response_time
                    )
            else:
                self.log_test(
                    "CORS - Frontend Access",
                    False,
                    "Missing CORS headers for frontend access",
                    response.status_code,
                    response_time
                )
        except Exception as e:
            self.log_test(
                "CORS - Configuration Test",
                False,
                f"CORS test failed: {str(e)}"
            )
            
    def test_response_consistency(self):
        """Test JSON response format consistency"""
        try:
            # Test GET /api/fixtures response format
            response = requests.get(f"{API_BASE_URL}{API_ENDPOINTS['fixtures']}")
            
            if response.status_code == 200:
                data = response.json()
                fixtures = data.get('fixtures', [])
                
                if fixtures:
                    # Check first fixture for required fields
                    fixture = fixtures[0]
                    required_fields = ['home_team', 'away_team', 'date', 'league']
                    missing_fields = [field for field in required_fields if field not in fixture]
                    
                    if not missing_fields:
                        self.log_test(
                            "Response Consistency - Required Fields",
                            True,
                            "All required fixture fields present",
                            response.status_code
                        )
                    else:
                        self.log_test(
                            "Response Consistency - Required Fields",
                            False,
                            f"Missing required fields: {missing_fields}",
                            response.status_code
                        )
                        
                    # Check for NaN/null handling
                    has_valid_nulls = True
                    nan_values_found = []
                    for fixture in fixtures[:10]:  # Check first 10 fixtures
                        for key, value in fixture.items():
                            if isinstance(value, str) and value.lower() in ['nan', 'null']:
                                has_valid_nulls = False
                                nan_values_found.append(f"{key}: {value}")
                                break
                        if not has_valid_nulls:
                            break
                            
                    if has_valid_nulls:
                        self.log_test(
                            "Response Consistency - NaN Handling",
                            True,
                            "NaN values properly converted to null",
                            response.status_code
                        )
                    else:
                        self.log_test(
                            "Response Consistency - NaN Handling",
                            False,
                            f"Found unconverted NaN values: {nan_values_found[:3]}",
                            response.status_code
                        )
                else:
                    self.log_test(
                        "Response Consistency - Data Availability",
                        False,
                        "No fixtures data available for testing",
                        response.status_code
                    )
            else:
                self.log_test(
                    "Response Consistency - API Access",
                    False,
                    f"Could not access API for consistency test: {response.status_code}",
                    response.status_code
                )
        except Exception as e:
            self.log_test(
                "Response Consistency - Test Execution",
                False,
                f"Consistency test failed: {str(e)}"
            )
            
    def run_all_tests(self):
        """Run the complete API reliability test suite"""
        print("🧪 Starting Comprehensive API Reliability Audit")
        print("=" * 60)
        
        print("\n📡 Testing Endpoint Connectivity...")
        self.test_endpoint_connectivity()
        
        print("\n🔍 Testing Filter Endpoint...")
        self.test_filter_endpoint()
        
        print("\n📤 Testing Export Endpoint...")
        self.test_export_endpoint()
        
        print("\n🔄 Testing Legacy Endpoint...")
        self.test_legacy_endpoint()
        
        print("\n⚠️  Testing Error Handling...")
        self.test_error_handling()
        
        print("\n🌐 Testing CORS Configuration...")
        self.test_cors_configuration()
        
        print("\n📋 Testing Response Consistency...")
        self.test_response_consistency()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"📈 Success Rate: {(self.passed / (self.passed + self.failed) * 100):.1f}%")
        
        if self.failed > 0:
            print("\n🚨 ISSUES FOUND:")
            for result in self.test_results:
                if not result['passed']:
                    print(f"   • {result['test_name']}: {result['details']}")
                    
        print("\n" + "=" * 60)
        
        return self.failed == 0
        
    def save_results(self, filename="api_reliability_results.json"):
        """Save test results to JSON file"""
        results_summary = {
            'test_timestamp': datetime.now().isoformat(),
            'total_tests': len(self.test_results),
            'passed': self.passed,
            'failed': self.failed,
            'success_rate': (self.passed / (self.passed + self.failed) * 100) if (self.passed + self.failed) > 0 else 0,
            'detailed_results': self.test_results
        }
        
        with open(filename, 'w') as f:
            json.dump(results_summary, f, indent=2)
        print(f"\n📄 Detailed results saved to: {filename}")


if __name__ == "__main__":
    tester = APIReliabilityTester()
    success = tester.run_all_tests()
    tester.save_results()
    
    if success:
        print("\n🎉 All tests passed! API is reliable and ready for production.")
        exit(0)
    else:
        print("\n🔧 Some tests failed. Please review and fix issues before deployment.")
        exit(1)
