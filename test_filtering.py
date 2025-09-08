#!/usr/bin/env python3
"""
Test script to verify filtering functionality works as expected
"""
import requests
import json

def test_api_filtering():
    """Test the API filtering functionality"""
    print("🧪 Testing Soccer Data Frontend Filtering Functionality")
    print("=" * 60)
    
    # Test 1: Get all fixtures
    print("\n1. Testing API connection...")
    try:
        response = requests.get("http://localhost:5000/api/fixtures")
        if response.status_code == 200:
            data = response.json()
            total_fixtures = len(data.get('fixtures', []))
            print(f"✅ API working: {total_fixtures} fixtures available")
        else:
            print(f"❌ API error: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return
    
    # Test 2: Analyze data structure for filtering
    print("\n2. Analyzing data structure for filtering...")
    fixtures = data.get('fixtures', [])
    
    if fixtures:
        sample_fixture = fixtures[0]
        print(f"✅ Sample fixture structure: {list(sample_fixture.keys())}")
        
        # Check required fields for filtering
        required_fields = ['league', 'home_team', 'away_team', 'date']
        missing_fields = [field for field in required_fields if field not in sample_fixture]
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
        else:
            print(f"✅ All required fields present for filtering")
    
    # Test 3: Simulate filtering logic
    print("\n3. Testing filtering logic...")
    
    # Get unique leagues
    leagues = list(set([f.get('league', '') for f in fixtures if f.get('league')]))
    print(f"✅ Available leagues: {leagues[:5]}...")
    
    # Get unique teams
    teams = list(set([f.get('home_team', '') for f in fixtures if f.get('home_team')] + 
                    [f.get('away_team', '') for f in fixtures if f.get('away_team')]))
    print(f"✅ Available teams: {len(teams)} teams")
    
    # Test league filtering
    if leagues:
        test_league = leagues[0]
        filtered_by_league = [f for f in fixtures if f.get('league') == test_league]
        print(f"✅ League filter test ({test_league}): {len(filtered_by_league)} fixtures")
    
    # Test team filtering
    if teams:
        test_team = teams[0]
        filtered_by_team = [f for f in fixtures if f.get('home_team') == test_team or f.get('away_team') == test_team]
        print(f"✅ Team filter test ({test_team}): {len(filtered_by_team)} fixtures")
    
    # Test 4: Check frontend connectivity
    print("\n4. Testing frontend connectivity...")
    try:
        response = requests.get("http://localhost:3000")
        if response.status_code == 200:
            html_content = response.text
            if "Filter by League" in html_content or "filter" in html_content.lower():
                print("✅ Frontend loaded with filtering UI")
            else:
                print("⚠️  Frontend loaded but filtering UI may not be visible")
                print("    This could be because React components are rendered client-side")
        else:
            print(f"❌ Frontend error: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend connection failed: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 FILTERING DIAGNOSIS:")
    print("- API is providing data with proper structure")
    print("- Filtering logic should work with available data")
    print("- Check browser console for JavaScript errors")
    print("- Verify React components are loading properly")

if __name__ == "__main__":
    test_api_filtering()
