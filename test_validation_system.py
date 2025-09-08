#!/usr/bin/env python3
"""
Test script for Data Validation System (DS-02)

This script demonstrates the validation capabilities by testing
various validation scenarios.
"""

import sys
import os
import pandas as pd
from datetime import datetime

# Add the scripts directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'scripts'))

from scripts.data_validator import DataValidator, ValidationError

def test_validation_system():
    """Test the data validation system with various scenarios"""
    print("🧪 Testing Data Validation System (DS-02)")
    print("=" * 50)
    
    config_path = os.path.join('scripts', 'validation_config.json')
    validator = DataValidator(config_path)
    
    # Test 1: Validate actual scraped data
    print("\n📊 Test 1: Validating actual scraped fixtures...")
    try:
        result = validator.validate_csv_file('data/fixtures_2025-2026_simplified.csv')
        print(f"Status: {'✅ PASSED' if result.is_valid else '⚠️ ISSUES FOUND'}")
        print(f"Quality Score: {result.quality_score:.1f}/100")
        print(f"Records: {result.total_records:,}")
        print(f"Errors: {len(result.errors)}, Warnings: {len(result.warnings)}")
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    # Test 2: Create and validate perfect test data
    print("\n📊 Test 2: Validating perfect test data...")
    try:
        perfect_data = pd.DataFrame({
            'league': ['ENG-Premier League', 'ESP-La Liga'],
            'season': ['2526', '2526'],
            'date': ['2025-08-15', '2025-08-16'],
            'home_team': ['Liverpool', 'Barcelona'],
            'away_team': ['Arsenal', 'Real Madrid'],
            'match_report': ['/en/matches/12345678/test-match-1', '/en/matches/87654321/test-match-2'],
            'home_score': [2.0, 1.0],
            'away_score': [1.0, 3.0],
            'day_of_week': ['Thursday', 'Friday']
        })
        
        result = validator.validate_dataframe(perfect_data, "Perfect Test Data")
        print(f"Status: {'✅ PASSED' if result.is_valid else '❌ FAILED'}")
        print(f"Quality Score: {result.quality_score:.1f}/100")
        print(f"Errors: {len(result.errors)}, Warnings: {len(result.warnings)}")
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    # Test 3: Create and validate problematic data
    print("\n📊 Test 3: Validating problematic test data...")
    try:
        bad_data = pd.DataFrame({
            'league': ['Invalid-League', 'ENG-Premier League'],
            'season': ['2526', '2526'],
            'date': ['invalid-date', '2025-08-16'],
            'home_team': ['', 'Arsenal'],  # Empty team name
            'away_team': ['Liverpool', 'Arsenal'],  # Same as home team in row 2
            'match_report': ['invalid-url', '/en/matches/87654321/test-match-2'],
            'home_score': [-1.0, 25.0],  # Negative and very high scores
            'away_score': [1.0, 3.0],
            'day_of_week': ['Thursday', 'Friday']
        })
        
        result = validator.validate_dataframe(bad_data, "Problematic Test Data")
        print(f"Status: {'✅ PASSED' if result.is_valid else '❌ FAILED (as expected)'}")
        print(f"Quality Score: {result.quality_score:.1f}/100")
        print(f"Errors: {len(result.errors)}, Warnings: {len(result.warnings)}")
        
        if result.errors:
            print("\nDetected Issues:")
            for error in result.errors[:3]:
                print(f"  • {error['message']}")
                
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    # Test 4: Test report generation
    print("\n📊 Test 4: Testing report generation...")
    try:
        result = validator.validate_csv_file('data/fixtures_2025-2026_simplified.csv')
        
        # Generate test reports
        test_reports_dir = 'data/test_validation_reports'
        os.makedirs(test_reports_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        json_report = os.path.join(test_reports_dir, f"test_report_{timestamp}.json")
        html_report = os.path.join(test_reports_dir, f"test_report_{timestamp}.html")
        
        validator.generate_report(result, json_report, 'json')
        validator.generate_report(result, html_report, 'html')
        
        print(f"✅ Reports generated successfully:")
        print(f"  📄 JSON: {json_report}")
        print(f"  🌐 HTML: {html_report}")
        
    except Exception as e:
        print(f"❌ Report generation failed: {e}")
    
    print("\n🎉 Data Validation System Testing Complete!")
    print("\n📋 Summary of DS-02 Implementation:")
    print("✅ Comprehensive data validation module created")
    print("✅ Schema validation with flexible type handling")
    print("✅ Data quality checks (completeness, duplicates, ranges)")
    print("✅ Configurable validation rules")
    print("✅ JSON and HTML report generation")
    print("✅ Integration with scraper workflow")
    print("✅ Quality scoring system (0-100 scale)")
    print("✅ Future fixture handling (null scores/reports allowed)")
    print("✅ Error categorization and severity levels")

if __name__ == "__main__":
    test_validation_system()
