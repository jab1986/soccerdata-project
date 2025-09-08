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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  CHART_COLORS,
  TOOLTIP_STYLES,
  processBettingStats,
  formatNumber,
  formatPercentage,
} from '../../utils/chartHelpers';
import { Fixture } from '../../types';

interface BettingStatisticsProps {
  fixtures: Fixture[];
  className?: string;
}

type ChartView = 'accuracy' | 'volume' | 'profit' | 'distribution';

const BettingStatistics: React.FC<BettingStatisticsProps> = ({ 
  fixtures, 
  className = '' 
}) => {
  const [activeView, setActiveView] = useState<ChartView>('accuracy');
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Process betting statistics data
  const bettingData = useMemo(() => {
    return processBettingStats(fixtures);
  }, [fixtures]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalBets = bettingData.reduce((sum, data) => sum + data.totalBets, 0);
    const totalSuccessful = bettingData.reduce((sum, data) => sum + data.successfulBets, 0);
    const totalProfit = bettingData.reduce((sum, data) => sum + data.profit, 0);
    const overallAccuracy = totalBets > 0 ? (totalSuccessful / totalBets) * 100 : 0;

    return {
      totalBets,
      totalSuccessful,
      totalProfit,
      overallAccuracy,
    };
  }, [bettingData]);

  // Pie chart data for bet distribution
  const distributionData = useMemo(() => {
    const totalHomeWinBets = bettingData.reduce((sum, data) => sum + data.homeWinBets, 0);
    const totalAwayWinBets = bettingData.reduce((sum, data) => sum + data.awayWinBets, 0);
    const totalDrawBets = bettingData.reduce((sum, data) => sum + data.drawBets, 0);

    return [
      { name: 'Home Wins', value: totalHomeWinBets, color: CHART_COLORS.primary },
      { name: 'Away Wins', value: totalAwayWinBets, color: CHART_COLORS.info },
      { name: 'Draws', value: totalDrawBets, color: CHART_COLORS.secondary },
    ];
  }, [bettingData]);

  // Custom tooltip for different chart types
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={TOOLTIP_STYLES}>
          <p className="font-semibold text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.dataKey.includes('accuracy') || entry.dataKey.includes('Percentage') 
                ? formatPercentage(entry.value) 
                : formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom pie chart tooltip
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={TOOLTIP_STYLES}>
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p style={{ color: data.payload.color }} className="text-sm">
            {`Bets: ${formatNumber(data.value)}`}
          </p>
          <p className="text-xs text-gray-600">
            {`${formatPercentage((data.value / summaryStats.totalBets) * 100)} of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (activeView) {
      case 'accuracy':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bettingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                name="Accuracy (%)"
                stroke={CHART_COLORS.primary} 
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.primary, r: 5 }}
                activeDot={{ r: 7, fill: CHART_COLORS.primary }}
                animationDuration={animationEnabled ? 1000 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'volume':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bettingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="totalBets" 
                name="Total Bets"
                fill={CHART_COLORS.info}
                radius={[4, 4, 0, 0]}
                animationDuration={animationEnabled ? 800 : 0}
              />
              <Bar 
                dataKey="successfulBets" 
                name="Successful Bets"
                fill={CHART_COLORS.success}
                radius={[4, 4, 0, 0]}
                animationDuration={animationEnabled ? 800 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'profit':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bettingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="profit" 
                name="Profit/Loss ($)"
                radius={[4, 4, 0, 0]}
                animationDuration={animationEnabled ? 800 : 0}
              >
                {bettingData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.profit >= 0 ? CHART_COLORS.success : CHART_COLORS.primary}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                animationDuration={animationEnabled ? 1000 : 0}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
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
              <span className="text-primary-red mr-2" role="img" aria-label="betting stats">📊</span>
              Betting Statistics
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Performance metrics and betting patterns
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
            <div className="text-2xl font-bold text-primary-red">
              {formatNumber(summaryStats.totalBets)}
            </div>
            <div className="text-xs text-gray-500">Total Bets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(summaryStats.totalSuccessful)}
            </div>
            <div className="text-xs text-gray-500">Successful</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              summaryStats.overallAccuracy >= 50 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(summaryStats.overallAccuracy)}
            </div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              summaryStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${formatNumber(summaryStats.totalProfit)}
            </div>
            <div className="text-xs text-gray-500">Profit/Loss</div>
          </div>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <nav className="flex space-x-1" aria-label="Chart view options">
          {[
            { key: 'accuracy', label: '📈 Accuracy', desc: 'Betting accuracy over time' },
            { key: 'volume', label: '📊 Volume', desc: 'Betting volume and success' },
            { key: 'profit', label: '💰 Profit', desc: 'Profit and loss tracking' },
            { key: 'distribution', label: '🥧 Types', desc: 'Bet type distribution' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as ChartView)}
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
        {bettingData.length > 0 ? (
          renderChart()
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No betting data available
            </h4>
            <p className="text-gray-500">
              Start placing bets to see statistics and trends
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingStatistics;
