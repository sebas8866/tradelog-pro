import { Trade, TradeStats, DailyStats, SetupPerformance, PsychologyStats } from '@/types';

export function calculateTradeStats(trades: Trade[]): TradeStats {
  const closedTrades = trades.filter(t => t.status === 'closed');
  const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.pnl || 0) <= 0);
  
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = winningTrades.length;
  const losses = losingTrades.length;
  
  const avgWin = wins > 0 
    ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / wins 
    : 0;
  const avgLoss = losses > 0 
    ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)) / losses 
    : 0;
  
  const grossProfit = winningTrades.reduce((sum, t) => sum + Math.max(0, t.pnl || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + Math.min(0, t.pnl || 0), 0));
  
  // Calculate R:R
  const tradesWithRR = closedTrades.filter(t => t.stopLoss && t.takeProfit);
  const avgRR = tradesWithRR.length > 0
    ? tradesWithRR.reduce((sum, t) => {
        const risk = Math.abs(t.entryPrice - (t.stopLoss || t.entryPrice));
        const reward = Math.abs((t.takeProfit || t.entryPrice) - t.entryPrice);
        return sum + (risk > 0 ? reward / risk : 0);
      }, 0) / tradesWithRR.length
    : 0;
  
  // Calculate streak
  let currentStreak = 0;
  const sortedTrades = [...closedTrades].sort((a, b) => 
    new Date(b.exitDate || '').getTime() - new Date(a.exitDate || '').getTime()
  );
  
  for (const trade of sortedTrades) {
    if ((trade.pnl || 0) > 0) {
      if (currentStreak >= 0) currentStreak++;
      else break;
    } else {
      if (currentStreak <= 0) currentStreak--;
      else break;
    }
  }
  
  return {
    totalTrades: closedTrades.length,
    winningTrades: wins,
    losingTrades: losses,
    winRate: closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0,
    totalPnL,
    avgWin,
    avgLoss,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : 0,
    avgRR,
    currentStreak,
    maxDrawdown: calculateMaxDrawdown(closedTrades),
  };
}

export function calculateMaxDrawdown(trades: Trade[]): number {
  let maxDrawdown = 0;
  let peak = 0;
  let runningPnL = 0;
  
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.exitDate || '').getTime() - new Date(b.exitDate || '').getTime()
  );
  
  for (const trade of sortedTrades) {
    runningPnL += trade.pnl || 0;
    if (runningPnL > peak) peak = runningPnL;
    const drawdown = peak - runningPnL;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  
  return maxDrawdown;
}

export function getSetupPerformance(trades: Trade[]): SetupPerformance[] {
  const closedTrades = trades.filter(t => t.status === 'closed');
  const setupMap = new Map<string, Trade[]>();
  
  closedTrades.forEach(trade => {
    const setup = trade.setup || 'Unclassified';
    if (!setupMap.has(setup)) setupMap.set(setup, []);
    setupMap.get(setup)!.push(trade);
  });
  
  return Array.from(setupMap.entries())
    .map(([setup, trades]) => {
      const wins = trades.filter(t => (t.pnl || 0) > 0).length;
      const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      return {
        setup,
        count: trades.length,
        wins,
        losses: trades.length - wins,
        winRate: (wins / trades.length) * 100,
        totalPnL,
        avgPnL: totalPnL / trades.length,
      };
    })
    .sort((a, b) => b.totalPnL - a.totalPnL);
}

export function getPsychologyStats(trades: Trade[]): PsychologyStats[] {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.emotion);
  const emotionMap = new Map<string, Trade[]>();
  
  closedTrades.forEach(trade => {
    const emotion = trade.emotion || 'neutral';
    if (!emotionMap.has(emotion)) emotionMap.set(emotion, []);
    emotionMap.get(emotion)!.push(trade);
  });
  
  return Array.from(emotionMap.entries())
    .map(([emotion, trades]) => {
      const wins = trades.filter(t => (t.pnl || 0) > 0).length;
      const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      return {
        emotion,
        count: trades.length,
        winRate: (wins / trades.length) * 100,
        avgPnL: totalPnL / trades.length,
      };
    })
    .sort((a, b) => b.avgPnL - a.avgPnL);
}

export function getDailyStats(trades: Trade[]): DailyStats[] {
  const closedTrades = trades.filter(t => t.status === 'closed');
  const dateMap = new Map<string, { pnl: number; trades: number; wins: number; losses: number }>();
  
  closedTrades.forEach(trade => {
    const date = trade.exitDate?.split('T')[0] || 'Unknown';
    if (!dateMap.has(date)) {
      dateMap.set(date, { pnl: 0, trades: 0, wins: 0, losses: 0 });
    }
    const stats = dateMap.get(date)!;
    stats.pnl += trade.pnl || 0;
    stats.trades++;
    if ((trade.pnl || 0) > 0) stats.wins++;
    else stats.losses++;
  });
  
  return Array.from(dateMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'auto',
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    confident: 'bg-green-100 text-green-800',
    fearful: 'bg-red-100 text-red-800',
    greedy: 'bg-yellow-100 text-yellow-800',
    neutral: 'bg-gray-100 text-gray-800',
    fomo: 'bg-orange-100 text-orange-800',
  };
  return colors[emotion] || colors.neutral;
}

export function generateTradeId(): string {
  return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
