import { useState, useEffect, useCallback } from 'react';
import { Contract, JsonRpcProvider, formatEther } from 'ethers';
import { CYBER_HILO_ADDRESS, CYBER_HILO_ABI } from '@/config/contracts';

// BSC 主网 RPC
const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const CONTRACT_ADDRESS = CYBER_HILO_ADDRESS.mainnet;

export interface LeaderboardEntry {
  player: string;
  totalWins: number;
  totalBnbWon: number;
  maxStreak: number;
  lastWinTime: number;
}

export interface RecentWin {
  player: string;
  bnbWon: number;
  streak: number;
  timestamp: number;
  txHash: string;
}

export interface GlobalStats {
  totalGames: number;
  totalPaidOut: number;
  totalPlayers: number;
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentWins, setRecentWins] = useState<RecentWin[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalGames: 0,
    totalPaidOut: 0,
    totalPlayers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = new JsonRpcProvider(BSC_RPC);
      const contract = new Contract(CONTRACT_ADDRESS, CYBER_HILO_ABI, provider);

      // 获取合约统计数据
      const [totalGames, totalPaidOut] = await Promise.all([
        contract.totalGames(),
        contract.totalPaidOut(),
      ]);

      // 获取 GameCashedOut 事件（最近 10000 个区块，约 8 小时）
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);

      // 查询 GameCashedOut 事件
      const filter = contract.filters.GameCashedOut();
      const events = await contract.queryFilter(filter, fromBlock, currentBlock);

      // 处理事件数据
      const playerData = new Map<string, LeaderboardEntry>();
      const recent: RecentWin[] = [];

      for (const event of events) {
        const log = event as any;
        const player = log.args[0] as string;
        const playerPrize = Number(formatEther(log.args[2]));
        const finalStreak = Number(log.args[3]);
        const block = await event.getBlock();
        const timestamp = block?.timestamp ? Number(block.timestamp) * 1000 : Date.now();

        // 更新排行榜数据
        const existing = playerData.get(player) || {
          player,
          totalWins: 0,
          totalBnbWon: 0,
          maxStreak: 0,
          lastWinTime: 0,
        };

        existing.totalWins += 1;
        existing.totalBnbWon += playerPrize;
        existing.maxStreak = Math.max(existing.maxStreak, finalStreak);
        existing.lastWinTime = Math.max(existing.lastWinTime, timestamp);
        playerData.set(player, existing);

        // 添加到最近获胜列表
        recent.push({
          player,
          bnbWon: playerPrize,
          streak: finalStreak,
          timestamp,
          txHash: event.transactionHash,
        });
      }

      // 按总赢利排序
      const sortedLeaderboard = Array.from(playerData.values())
        .sort((a, b) => b.totalBnbWon - a.totalBnbWon)
        .slice(0, 10);

      // 最近获胜按时间排序
      const sortedRecent = recent
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);

      setLeaderboard(sortedLeaderboard);
      setRecentWins(sortedRecent);
      setGlobalStats({
        totalGames: Number(totalGames),
        totalPaidOut: Number(formatEther(totalPaidOut)),
        totalPlayers: playerData.size,
      });
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('加载排行榜失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
    
    // 每 30 秒刷新一次
    const interval = setInterval(fetchLeaderboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboardData]);

  return {
    leaderboard,
    recentWins,
    globalStats,
    isLoading,
    error,
    refresh: fetchLeaderboardData,
  };
}
