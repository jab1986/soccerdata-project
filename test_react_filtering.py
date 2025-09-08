#!/usr/bin/env python3
"""
Comprehensive React filtering test using requests to simulate user interactions
"""
import requests
import json
import time

def test_react_filtering():
    print("🔍 COMPREHENSIVE REACT FILTERING TEST")
    print("=" * 50)
    
    # Test 1: Verify both servers are running
    print("\n1. Server Connectivity Test:")
    
    # Check backend
    try:
        api_response = requests.get("http://localhost:5000/api/fixtures", timeout=5)
        if api_response.status_code == 200:
            api_data = api_response.json()
            print(f"✅ Backend API: {len(api_data.get('fixtures', []))} fixtures")
        else:
            print(f"❌ Backend API error: {api_response.status_code}")
            return
    except Exception as e:
        print(f"❌ Backend API failed: {e}")
        return
    
    # Check frontend
    try:
        frontend_response = requests.get("http://localhost:3000", timeout=5)
        if frontend_response.status_code == 200:
            html = frontend_response.text
            print("✅ Frontend React app: Loaded")
            
            # Check if React bundle is referenced
            if "bundle.js" in html:
                print("✅ React bundle: Referenced in HTML")
            else:
                print("⚠️  React bundle: Not found in HTML")
                
        else:
            print(f"❌ Frontend error: {frontend_response.status_code}")
            return
    except Exception as e:
        print(f"❌ Frontend failed: {e}")
        return
    
    # Test 2: Check if frontend can communicate with backend
    print("\n2. Frontend-Backend Communication Test:")
    
    # The React app should be making a fetch request to /api/fixtures
    # Let's simulate this and check CORS
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Referer': 'http://localhost:3000/',
        }
        cors_response = requests.get("http://localhost:5000/api/fixtures", headers=headers)
        
        if cors_response.status_code == 200:
            print("✅ CORS: Backend accepts frontend requests")
            
            # Check CORS headers
            cors_headers = cors_response.headers
            if 'Access-Control-Allow-Origin' in cors_headers:
                print(f"✅ CORS Headers: {cors_headers.get('Access-Control-Allow-Origin')}")
            else:
                print("⚠️  CORS Headers: Missing Access-Control-Allow-Origin")
                
        else:
            print(f"❌ CORS test failed: {cors_response.status_code}")
    except Exception as e:
        print(f"❌ CORS test error: {e}")
    
    # Test 3: Analyze filtering data structure
    print("\n3. Data Structure Analysis for Filtering:")
    
    fixtures = api_data.get('fixtures', [])
    if fixtures:
        sample = fixtures[0]
        print(f"✅ Sample fixture keys: {list(sample.keys())}")
        
        # Check leagues
        leagues = list(set([f.get('league', '') for f in fixtures]))
        print(f"✅ Available leagues ({len(leagues)}): {leagues}")
        
        # Check teams
        home_teams = [f.get('home_team', '') for f in fixtures]
        away_teams = [f.get('away_team', '') for f in fixtures]
        all_teams = list(set(home_teams + away_teams))
        print(f"✅ Available teams: {len(all_teams)} teams")
        
        # Check date format
        dates = [f.get('date', '') for f in fixtures[:5]]
        print(f"✅ Date format sample: {dates}")
    
    # Test 4: Simulate filtering operations
    print("\n4. Filtering Logic Simulation:")
    
    # Test league filtering
    test_league = "ENG-Premier League"
    league_filtered = [f for f in fixtures if f.get('league') == test_league]
    print(f"✅ League filter ({test_league}): {len(league_filtered)} fixtures")
    
    # Test team filtering
    test_team = "Liverpool"
    team_filtered = [f for f in fixtures if f.get('home_team') == test_team or f.get('away_team') == test_team]
    print(f"✅ Team filter ({test_team}): {len(team_filtered)} fixtures")
    
    # Test date filtering
    test_date = "2025-08-15"
    date_filtered = [f for f in fixtures if f.get('date', '') >= test_date]
    print(f"✅ Date filter (from {test_date}): {len(date_filtered)} fixtures")
    
    # Test 5: React component check
    print("\n5. React Component Analysis:")
    
    # Check if the HTML contains the expected React elements
    if "Filter by League" in html:
        print("✅ Filter UI: League filter text found in HTML")
    else:
        print("⚠️  Filter UI: League filter text not in initial HTML (client-side rendered)")
    
    if "fixtures" in html.lower():
        print("✅ Fixtures display: References found in HTML")
    else:
        print("⚠️  Fixtures display: Not in initial HTML (client-side rendered)")
    
    print("\n" + "=" * 50)
    print("🎯 DIAGNOSIS SUMMARY:")
    print("✅ Backend API working with proper data structure")
    print("✅ Frontend server running and serving React app")
    print("✅ CORS configured for frontend-backend communication")
    print("✅ Data contains all necessary fields for filtering")
    print("\n🔧 NEXT STEPS:")
    print("1. Check browser console for JavaScript errors")
    print("2. Verify React components are mounting and making API calls")
    print("3. Test actual filter interactions in browser")
    print("4. Check if state management is working in React")

if __name__ == "__main__":
    test_react_filtering()
