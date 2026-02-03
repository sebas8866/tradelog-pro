'use client';

import { useState, useMemo } from 'react';
import { Trade, TradeStats, SetupPerformance, PsychologyStats } from '@/types';
import { 
  calculateTradeStats, 
  getSetupPerformance, 
  getPsychologyStats,
  getDailyStats,
  formatCurrency,
  formatPercent,
  getEmotionColor,
  generateTradeId 
} from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity, 
  Calendar,
  Plus,
  Settings,
  LogOut
} from 'lucide-react';

// Mock data for demonstration
const mockTrades: Trade[] = [
  {
    id: generateTradeId(),
    entryDate: '2026-02-01T09:30:00',
    exitDate: '2026-02-01T10:15:00',
    symbol: 'AAPL',
    side: 'long',
    entryPrice: 185.50,
    exitPrice: 187.25,
    positionSize: 100,
    stopLoss: 184.00,
    takeProfit: 188.00,
    fees: 2.50,
    pnl: 175.00,
    pnlPercent: 0.94,
    setup: 'Breakout',
    emotion: 'confident',
    notes: 'Strong volume, clean breakout above resistance',
    tags: ['breakout', 'momentum'],
    status: 'closed',
  },
  {
    id: generateTradeId(),
    entryDate: '2026-02-01T14:20:00',
    exitDate: '2026-02-01T14:45:00',
    symbol: 'TSLA',
    side: 'short',
    entryPrice: 245.00,
    exitPrice: 242.50,
    positionSize: 50,
    stopLoss: 247.00,
    takeProfit: 240.00,
    fees: 2.50,
    pnl: 125.00,
    pnlPercent: 1.02,
    setup: 'Reversal',
    emotion: 'neutral',
    notes: 'Rejected at daily high, bearish divergence',
    tags: ['reversal', 'technical'],
    status: 'closed',
  },
  {
    id: generateTradeId(),
    entryDate: '2026-02-02T10:00:00',
    exitDate: '2026-02-02T10:30:00',
    symbol: 'NVDA',
    side: 'long',
    entryPrice: 520.00,
    exitPrice: 518.50,
    positionSize: 25,
    stopLoss: 515.00,
    takeProfit: 530.00,
    fees: 2.50,
    pnl: -37.50,
    pnlPercent: -0.29,
    setup: 'Pullback',
    emotion: 'fomo',
    notes: 'Entered too late, chased the move',
    tags: ['pullback', 'mistake'],
    status: 'closed',
  },
  {
    id: generateTradeId(),
    entryDate: '2026-02-02T11:15:00',
    exitDate: '2026-02-02T12:00:00',
    symbol: 'META',
    side: 'long',
    entryPrice: 380.00,
    exitPrice: 384.50,
    positionSize: 40,
    stopLoss: 377.00,
    takeProfit: 390.00,
    fees: 2.50,
    pnl: 180.00,
    pnlPercent: 1.18,
    setup: 'Breakout',
    emotion: 'confident',
    notes: 'Clean base breakout, held through chop',
    tags: ['breakout', 'trend'],
    status: 'closed',
  },
  {
    id: generateTradeId(),
    entryDate: '2026-02-03T09:45:00',
    exitDate: '2026-02-03T10:20:00',
    symbol: 'AMD',
    side: 'short',
    entryPrice: 165.00,
    exitPrice: 163.25,
    positionSize: 75,
    stopLoss: 167.00,
    takeProfit: 160.00,
    fees: 2.50,
    pnl: 131.25,
    pnlPercent: 1.06,
    setup: 'Breakout',
    emotion: 'confident',
    notes: 'Semiconductor weakness, relative strength fade',
    tags: ['breakout', 'sector'],
    status: 'closed',
  },
];

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'analytics'>('overview');

  const stats = useMemo(() => calculateTradeStats(trades), [trades]);
  const setupPerformance = useMemo(() => getSetupPerformance(trades), [trades]);
  const psychologyStats = useMemo(() => getPsychologyStats(trades), [trades]);
  const dailyStats = useMemo(() => getDailyStats(trades), [trades]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">TL</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">TradeLog Pro</h1>
              <p className="text-sm text-gray-500">Welcome back, Henry</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              New Trade
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-white p-1 rounded-xl border w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'trades', label: 'Trades', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total P&L"
                value={formatCurrency(stats.totalPnL)}
                change="+$573.75"
                changeType="positive"
                icon={stats.totalPnL >= 0 ? TrendingUp : TrendingDown}
              />
              <StatCard
                title="Win Rate"
                value={formatPercent(stats.winRate)}
                change="80% (4/5)"
                changeType="positive"
                icon={Target}
              />
              <StatCard
                title="Avg R:R"
                value={`1:${stats.avgRR.toFixed(1)}`}
                change="Target: 1:2"
                changeType="neutral"
                icon={Activity}
              />
              <StatCard
                title="Current Streak"
                value={stats.currentStreak > 0 ? `W${stats.currentStreak}` : `L${Math.abs(stats.currentStreak)}`}
                change={stats.currentStreak > 0 ? '🔥 Hot streak!' : 'Stay disciplined'}
                changeType={stats.currentStreak > 0 ? 'positive' : 'negative'}
                icon={Activity}
              />
            </div>

            {/* Setup Performance */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4">Setup Performance</h2>
              <div className="space-y-4">
                {setupPerformance.map((setup) => (
                  <div key={setup.setup} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{setup.setup}</p>
                      <p className="text-sm text-gray-500">{setup.count} trades • {formatPercent(setup.winRate)} win rate</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${setup.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(setup.totalPnL)}
                      </p>
                      <p className="text-sm text-gray-500">{formatCurrency(setup.avgPnL)}/trade</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Psychology Insights */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4">Psychology Insights</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {psychologyStats.map((psych) => (
                  <div key={psych.emotion} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getEmotionColor(psych.emotion)}`}>
                        {psych.emotion}
                      </span>
                      <span className="text-sm text-gray-500">{psych.count} trades</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${psych.avgPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(psych.avgPnL)}
                      </p>
                      <p className="text-sm text-gray-500">{formatPercent(psych.winRate)} wins</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {psychologyStats.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Insight:</strong> You trade {psychologyStats[0].emotion === 'confident' ? 'best when confident' : 'best when ' + psychologyStats[0].emotion}. 
                    Consider skipping trades when feeling {psychologyStats[psychologyStats.length - 1].emotion}.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b">
              <h2 className="font-bold">Recent Trades</h2>
            </div>
            <div className="divide-y">
              {trades.map((trade) => (
                <div key={trade.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        trade.side === 'long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {trade.side === 'long' ? 'L' : 'S'}
                      </div>
                      <div>
                        <p className="font-bold">{trade.symbol}</p>
                        <p className="text-sm text-gray-500">
                          {trade.setup} • {new Date(trade.entryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(trade.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(trade.pnl || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPercent(trade.pnlPercent || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold text-lg mb-4">Daily P&L</h2>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                [Chart: Daily P&L bars would render here]
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-bold text-lg mb-4">Win/Loss Distribution</h2>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                  [Pie chart would render here]
                </div>
              </div>

              <div className="bg-white rounded-xl border p-6">
                <h2 className="font-bold text-lg mb-4">Cumulative P&L</h2>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                  [Line chart would render here]
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon 
}: { 
  title: string; 
  value: string; 
  change: string; 
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className={`text-sm mt-2 ${
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {change}
          </p>
        </div>
        <div className="p-3 bg-gray-100 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    </div>
  );
}