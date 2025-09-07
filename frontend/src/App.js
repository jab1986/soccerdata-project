import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [fixtures, setFixtures] = useState([]);
  const [filteredFixtures, setFilteredFixtures] = useState([]);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [allTeams, setAllTeams] = useState([]);

  const leagues = [
    'ENG-Premier League',
    'ENG-Championship',
    'ENG-League One',
    'ENG-League Two',
    'ESP-La Liga',
    'ESP-La Liga 2',
    'ITA-Serie A',
    'ITA-Serie B',
    'GER-Bundesliga',
    'GER-Bundesliga 2',
    'FRA-Ligue 1',
    'FRA-Ligue 2'
  ];

  // Load fixtures data on component mount
  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    setIsLoading(true);
    setMessage('Loading fixtures data...');

    try {
      const response = await fetch('/api/fixtures');
      const result = await response.json();

      if (response.ok) {
        setFixtures(result.fixtures);
        setFilteredFixtures(result.fixtures);

        // Extract unique teams for filtering
        const teams = [...new Set([
          ...result.fixtures.map(f => f.home_team),
          ...result.fixtures.map(f => f.away_team)
        ].filter(Boolean))].sort();

        setAllTeams(teams);
        setMessage(`Loaded ${result.total_count} fixtures from ${result.file}`);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error loading data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeagueChange = (league) => {
    setSelectedLeagues(prev =>
      prev.includes(league)
        ? prev.filter(l => l !== league)
        : [...prev, league]
    );
  };

  const handleTeamChange = (team) => {
    setSelectedTeams(prev =>
      prev.includes(team)
        ? prev.filter(t => t !== team)
        : [...prev, team]
    );
  };

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let filtered = fixtures;

    if (selectedLeagues.length > 0) {
      filtered = filtered.filter(fixture => selectedLeagues.includes(fixture.league));
    }

    if (selectedTeams.length > 0) {
      filtered = filtered.filter(fixture =>
        selectedTeams.includes(fixture.home_team) || selectedTeams.includes(fixture.away_team)
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(fixture => fixture.date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter(fixture => fixture.date <= dateTo);
    }

    setFilteredFixtures(filtered);
  }, [fixtures, selectedLeagues, selectedTeams, dateFrom, dateTo]);

  const exportFilteredData = async () => {
    if (filteredFixtures.length === 0) {
      setMessage('No fixtures to export');
      return;
    }

    setIsLoading(true);
    setMessage('Exporting data...');

    try {
      const response = await fetch('/api/fixtures/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fixtures: filteredFixtures,
          filename: `filtered_fixtures_${new Date().toISOString().split('T')[0]}.csv`
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Success! ${result.message}`);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedLeagues([]);
    setSelectedTeams([]);
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>European Soccer Fixtures</h1>
        <p>Filter and export comprehensive fixtures data</p>
      </header>

      <main className="App-main">
        <div className="filter-section">
          <div className="filter-controls">
            <div className="option-group">
              <h3>Filter by League</h3>
              <div className="league-grid">
                {leagues.map(league => (
                  <label key={league} className="league-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedLeagues.includes(league)}
                      onChange={() => handleLeagueChange(league)}
                    />
                    {league.replace('ENG-', '').replace('ESP-', '').replace('ITA-', '').replace('GER-', '').replace('FRA-', '')}
                  </label>
                ))}
              </div>
            </div>

            <div className="option-group">
              <h3>Filter by Team</h3>
              <select
                multiple
                value={selectedTeams}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedTeams(values);
                }}
                className="team-select"
              >
                {allTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              <small>Hold Ctrl/Cmd to select multiple teams</small>
            </div>

            <div className="option-group">
              <h3>Date Range</h3>
              <div className="date-inputs">
                <div>
                  <label>From:</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label>To:</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="button-group">
              <button className="clear-button" onClick={clearFilters}>
                Clear Filters
              </button>
              <button
                className="export-button"
                onClick={exportFilteredData}
                disabled={isLoading || filteredFixtures.length === 0}
              >
                {isLoading ? 'Exporting...' : `Export ${filteredFixtures.length} Fixtures`}
              </button>
            </div>
          </div>

          <div className="results-section">
            <div className="results-header">
              <h3>Fixtures ({filteredFixtures.length})</h3>
              <button className="refresh-button" onClick={loadFixtures} disabled={isLoading}>
                Refresh Data
              </button>
            </div>

            {filteredFixtures.length > 0 ? (
              <div className="fixtures-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>League</th>
                      <th>Home Team</th>
                      <th>Away Team</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFixtures.slice(0, 50).map((fixture, index) => (
                      <tr key={index}>
                        <td>{fixture.date}</td>
                        <td>{fixture.league?.replace('ENG-', '').replace('ESP-', '').replace('ITA-', '').replace('GER-', '').replace('FRA-', '')}</td>
                        <td>{fixture.home_team}</td>
                        <td>{fixture.away_team}</td>
                        <td>{fixture.home_score && fixture.away_score ? `${fixture.home_score}-${fixture.away_score}` : 'TBD'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredFixtures.length > 50 && (
                  <p className="more-results">... and {filteredFixtures.length - 50} more fixtures</p>
                )}
              </div>
            ) : (
              <p className="no-results">No fixtures match your filters</p>
            )}
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;