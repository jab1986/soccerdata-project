import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';
import {
  CHART_COLORS,
  TOOLTIP_STYLES,
  processTeamPerformance,
  formatNumber,
  formatPercentage,
  TeamPerformanceData,
} from '../../utils/chartHelpers';
import { Fixture } from '../../types';

interface TeamPerformanceProps {
  fixtures: Fixture[];
  className?: string;
}

type PerformanceView = 'leagueTable' | 'formGuide' | 'goalAnalysis' | 'headToHead';

const TeamPerformance: React.FC<TeamPerformanceProps> = ({ 
  fixtures, 
  className = '' 
}) => {
  const [activeView, setActiveView] = useState<PerformanceView>('leagueTable');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Process team performance data
  const teamsData = useMemo(() => {
    return processTeamPerformance(fixtures);
  }, [fixtures]);

  // Filter teams for comparison
  const filteredTeams = useMemo(() => {
    if (selectedTeams.length === 0) return teamsData.slice(0, 10); // Top 10 by default
    return teamsData.filter(team => selectedTeams.includes(team.team));
  }, [teamsData, selectedTeams]);

  // Radar chart data for team comparison
  const radarData = useMemo(() => {
    if (selectedTeams.length === 0) return [];
    
    const metrics = ['winPercentage', 'goalsFor', 'goalsAgainst', 'goalDifference'];
    const maxValues = {
      winPercentage: 100,
      goalsFor: Math.max(...teamsData.map(t => t.goalsFor)),
      goalsAgainst: Math.max(...teamsData.map(t => t.goalsAgainst)),
      goalDifference: Math.max(...teamsData.map(t => Math.abs(t.goalDifference))),
    };

    return metrics.map(metric => {
      const dataPoint: any = { metric };
      selectedTeams.forEach(teamName => {
        const team = teamsData.find(t => t.team === teamName);
        if (team) {
          let value = team[metric as keyof TeamPerformanceData] as number;
          if (metric === 'goalDifference') value = Math.abs(value);
          dataPoint[teamName] = (value / maxValues[metric as keyof typeof maxValues]) * 100;
        }
      });
      return dataPoint;
    });
  }, [teamsData, selectedTeams]);

  // Form guide data for line chart
  const formGuideData = useMemo(() => {
    return filteredTeams.map(team => {
      const formPoints = team.form.map(result => {
        switch (result) {
          case 'W': return 3;
          case 'D': return 1;
          case 'L': return 0;
          default: return 0;
        }
      });
      
      const cumulativePoints = formPoints.reduce((acc: number[], points, index) => {
        acc.push((acc[index - 1] || 0) + points);
        return acc;
      }, []);

      return {
        team: team.team,
        form: team.form.join(''),
        points: cumulativePoints[cumulativePoints.length - 1] || 0,
        formData: formPoints.map((points, index) => ({
          match: `Match ${index + 1}`,
          points: cumulativePoints[index],
          result: team.form[index],
        })),
      };
    });
  }, [filteredTeams]);

  // Goal analysis scatter data
  const goalAnalysisData = useMemo(() => {
    return filteredTeams.map((team, index) => ({
      team: team.team,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalDifference,
      winPercentage: team.winPercentage,
      color: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length],
    }));
  }, [filteredTeams]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={TOOLTIP_STYLES}>
          <p className="font-semibold text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => {
            let displayValue = entry.value;
            if (typeof displayValue === 'number') {
              displayValue = entry.dataKey.includes('Percentage') 
                ? formatPercentage(displayValue)
                : formatNumber(displayValue);
            }
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {`${entry.dataKey || entry.name}: ${displayValue}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Scatter chart tooltip
  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={TOOLTIP_STYLES}>
          <p className="font-semibold text-gray-900">{data.team}</p>
          <p className="text-sm text-gray-600">Goals For: {data.goalsFor}</p>
          <p className="text-sm text-gray-600">Goals Against: {data.goalsAgainst}</p>
          <p className="text-sm text-gray-600">Goal Difference: {data.goalDifference > 0 ? '+' : ''}{data.goalDifference}</p>
          <p className="text-sm text-gray-600">Win Rate: {formatPercentage(data.winPercentage)}</p>
        </div>
      );
    }
    return null;
  };

  // Toggle team selection
  const toggleTeam = (team: string) => {
    setSelectedTeams(prev => {
      if (prev.includes(team)) {
        return prev.filter(t => t !== team);
      } else {
        return prev.length < 4 ? [...prev, team] : prev; // Limit to 4 teams for readability
      }
    });
  };

  const renderChart = () => {
    switch (activeView) {
      case 'leagueTable':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredTeams} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#666" />
              <YAxis 
                dataKey="team" 
                type="category" 
                tick={{ fontSize: 11 }}
                stroke="#666"
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="winPercentage"
                name="Win Rate %"
                fill={CHART_COLORS.success}
                animationDuration={animationEnabled ? 800 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'formGuide':
        return (
          <div className="space-y-4">
            {/* Form visualization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formGuideData.slice(0, 6).map((team, index) => (
                <div key={team.team} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{team.team}</h4>
                  <div className="flex items-center space-x-1 mb-2">
                    {team.form.split('').map((result, resultIndex) => (
                      <div
                        key={resultIndex}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          result === 'W' 
                            ? 'bg-green-500' 
                            : result === 'D' 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Form Points: <span className="font-medium">{team.points}/15</span>
                  </p>
                </div>
              ))}
            </div>
            
            {/* Line chart for selected teams */}
            {selectedTeams.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="match" tick={{ fontSize: 12 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666" domain={[0, 15]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedTeams.map((teamName, index) => {
                    const teamFormData = formGuideData.find(t => t.team === teamName);
                    return teamFormData ? (
                      <Line
                        key={teamName}
                        type="monotone"
                        data={teamFormData.formData}
                        dataKey="points"
                        name={teamName}
                        stroke={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        animationDuration={animationEnabled ? 1000 : 0}
                      />
                    ) : null;
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        );

      case 'goalAnalysis':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="goalsFor" 
                name="Goals For" 
                tick={{ fontSize: 12 }}
                stroke="#666"
                label={{ value: 'Goals For', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="goalsAgainst" 
                name="Goals Against" 
                tick={{ fontSize: 12 }}
                stroke="#666"
                label={{ value: 'Goals Against', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter 
                data={goalAnalysisData} 
                fill={CHART_COLORS.primary}
                animationDuration={animationEnabled ? 800 : 0}
              >
                {goalAnalysisData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'headToHead':
        return selectedTeams.length >= 2 ? (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={0} 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }}
                tickCount={5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedTeams.map((teamName, index) => (
                <Radar
                  key={teamName}
                  name={teamName}
                  dataKey={teamName}
                  stroke={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                  fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  animationDuration={animationEnabled ? 1000 : 0}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🔄</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Select teams to compare
            </h4>
            <p className="text-gray-500">
              Choose 2-4 teams from the list below to see their head-to-head comparison
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-primary-red mr-2" role="img" aria-label="team performance">⚽</span>
              Team Performance Analysis
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Compare team statistics, form, and head-to-head performance
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAnimationEnabled(!animationEnabled)}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary-red focus:ring-offset-1"
              aria-label={`${animationEnabled ? 'Disable' : 'Enable'} chart animations`}
            >
              {animationEnabled ? '⏸️' : '▶️'} Animation
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(teamsData.length)}
            </div>
            <div className="text-xs text-gray-500">Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {teamsData.length > 0 ? teamsData[0].team : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Top Team</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(teamsData.reduce((sum, team) => sum + team.goalsFor, 0))}
            </div>
            <div className="text-xs text-gray-500">Total Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {formatPercentage(
                teamsData.length > 0
                  ? teamsData.reduce((sum, team) => sum + team.winPercentage, 0) / teamsData.length
                  : 0
              )}
            </div>
            <div className="text-xs text-gray-500">Avg Win Rate</div>
          </div>
        </div>
      </div>

      {/* Team Selection */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            ⚽ Select Teams ({selectedTeams.length}/4):
          </span>
          <div className="flex flex-wrap gap-1">
            {teamsData.slice(0, 12).map(team => (
              <button
                key={team.team}
                onClick={() => toggleTeam(team.team)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  selectedTeams.includes(team.team)
                    ? 'bg-primary-red text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={!selectedTeams.includes(team.team) && selectedTeams.length >= 4}
              >
                {team.team}
              </button>
            ))}
          </div>
          {selectedTeams.length > 0 && (
            <button
              onClick={() => setSelectedTeams([])}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-600 text-white hover:bg-gray-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <nav className="flex flex-wrap gap-1" aria-label="Chart view options">
          {[
            { key: 'leagueTable', label: '🏆 League Table', desc: 'Team standings and win rates' },
            { key: 'formGuide', label: '📊 Form Guide', desc: 'Recent form analysis' },
            { key: 'goalAnalysis', label: '⚽ Goal Analysis', desc: 'Goals scored vs conceded' },
            { key: 'headToHead', label: '🔄 Head to Head', desc: 'Compare selected teams' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as PerformanceView)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === tab.key
                  ? 'bg-white text-primary-red shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
              role="tab"
              aria-selected={activeView === tab.key}
              aria-label={tab.desc}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Chart Content */}
      <div className="p-6" role="region">
        {teamsData.length > 0 ? (
          renderChart()
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">⚽</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No team data available
            </h4>
            <p className="text-gray-500">
              Team performance data will appear once matches are completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPerformance;
