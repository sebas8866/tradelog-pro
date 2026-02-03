export interface Trade {
  id: string;
  entryDate: string;
  exitDate?: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  positionSize: number;
  stopLoss?: number;
  takeProfit?: number;
  fees: number;
  pnl?: number;
  pnlPercent?: number;
  setup?: string;
  emotion?: 'confident' | 'fearful' | 'greedy' | 'neutral' | 'fomo';
  notes?: string;
  tags?: string[];
  screenshot?: string;
  status: 'open' | 'closed';
}

export interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  avgRR: number;
  currentStreak: number;
  maxDrawdown: number;
  bestSetup?: string;
  worstSetup?: string;
}

export interface DailyStats {
  date: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
}

export interface SetupPerformance {
  setup: string;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
}

export interface PsychologyStats {
  emotion: string;
  count: number;
  winRate: number;
  avgPnL: number;
}

export type TimeRange = '7d' | '30d' | '90d' | 'ytd' | 'all';
