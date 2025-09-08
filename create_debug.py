#!/usr/bin/env python3
"""
Create a test HTML page to debug the React filtering functionality
"""
import os

def create_debug_page():
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Filtering Debug</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
        .info { background-color: #d1ecf1; color: #0c5460; }
        button { padding: 10px 15px; margin: 5px; cursor: pointer; }
        #results { margin-top: 20px; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>React Filtering Debug Tool</h1>
    
    <div class="status info">
        <strong>Debug Tool:</strong> Testing React app filtering functionality
    </div>

    <div>
        <button onclick="testAPIConnection()">Test API Connection</button>
        <button onclick="testFilteringLogic()">Test Filtering Logic</button>
        <button onclick="testReactApp()">Test React App</button>
        <button onclick="simulateUserInteraction()">Simulate User Interaction</button>
    </div>

    <div id="results"></div>

    <script>
        function log(message, type = 'info') {
            const results = document.getElementById('results');
            const div = document.createElement('div');
            div.className = `status ${type}`;
            div.innerHTML = message;
            results.appendChild(div);
        }

        async function testAPIConnection() {
            log('Testing API connection...', 'info');
            try {
                const response = await fetch('/api/fixtures');
                const data = await response.json();
                
                if (response.ok) {
                    log(`✅ API Success: ${data.fixtures.length} fixtures loaded`, 'success');
                    log(`Sample fixture: <pre>${JSON.stringify(data.fixtures[0], null, 2)}</pre>`, 'info');
                } else {
                    log(`❌ API Error: ${response.status} - ${data.error}`, 'error');
                }
            } catch (error) {
                log(`❌ API Connection Failed: ${error.message}`, 'error');
            }
        }

        async function testFilteringLogic() {
            log('Testing filtering logic...', 'info');
            try {
                const response = await fetch('/api/fixtures');
                const data = await response.json();
                const fixtures = data.fixtures;

                // Test league filtering
                const premierLeagueFixtures = fixtures.filter(f => f.league === 'ENG-Premier League');
                log(`League Filter Test: ${premierLeagueFixtures.length} Premier League fixtures`, 'success');

                // Test team filtering
                const liverpoolFixtures = fixtures.filter(f => 
                    f.home_team === 'Liverpool' || f.away_team === 'Liverpool'
                );
                log(`Team Filter Test: ${liverpoolFixtures.length} Liverpool fixtures`, 'success');

                // Test date filtering
                const recentFixtures = fixtures.filter(f => f.date >= '2025-08-15');
                log(`Date Filter Test: ${recentFixtures.length} fixtures from 2025-08-15 onwards`, 'success');

            } catch (error) {
                log(`❌ Filtering Test Failed: ${error.message}`, 'error');
            }
        }

        async function testReactApp() {
            log('Testing React app functionality...', 'info');
            
            // Check if React app is loaded
            const reactRoot = document.querySelector('#root');
            if (reactRoot) {
                log('❌ React app not found - this debug page is separate', 'error');
                log('💡 Open http://localhost:3000 in another tab to see the React app', 'info');
            }

            // Test if we can access React app data
            try {
                const response = await fetch('http://localhost:3000');
                const html = await response.text();
                
                if (html.includes('Soccer Data Scraper')) {
                    log('✅ React app is accessible', 'success');
                } else {
                    log('❌ React app not responding correctly', 'error');
                }
            } catch (error) {
                log(`❌ React app test failed: ${error.message}`, 'error');
            }
        }

        async function simulateUserInteraction() {
            log('Simulating user filtering interaction...', 'info');
            
            try {
                // Get fixtures data
                const response = await fetch('/api/fixtures');
                const data = await response.json();
                let fixtures = data.fixtures;
                
                log(`Initial fixtures: ${fixtures.length}`, 'info');

                // Simulate selecting Premier League
                let filteredFixtures = fixtures.filter(f => f.league === 'ENG-Premier League');
                log(`After Premier League filter: ${filteredFixtures.length} fixtures`, 'success');

                // Simulate selecting Liverpool
                filteredFixtures = filteredFixtures.filter(f => 
                    f.home_team === 'Liverpool' || f.away_team === 'Liverpool'
                );
                log(`After Liverpool filter: ${filteredFixtures.length} fixtures`, 'success');

                // Simulate date range
                filteredFixtures = filteredFixtures.filter(f => f.date >= '2025-08-15');
                log(`After date filter: ${filteredFixtures.length} fixtures`, 'success');

                if (filteredFixtures.length > 0) {
                    log(`Sample filtered result: <pre>${JSON.stringify(filteredFixtures[0], null, 2)}</pre>`, 'info');
                } else {
                    log('⚠️ No fixtures match the combined filters', 'error');
                }

            } catch (error) {
                log(`❌ Simulation failed: ${error.message}`, 'error');
            }
        }

        // Auto-run tests on page load
        window.onload = function() {
            log('Debug page loaded. Click buttons to run tests.', 'info');
        };
    </script>
</body>
</html>
"""

    # Write to a debug file
    with open('/home/joe/soccerdata_project/debug_filtering.html', 'w') as f:
        f.write(html_content)
    
    print("Created debug page: /home/joe/soccerdata_project/debug_filtering.html")
    print("You can open this in a browser to test the filtering functionality")

if __name__ == "__main__":
    create_debug_page()
