import { useState, useEffect, useCallback } from 'react';
import { Contract, JsonRpcProvider, formatEther } from 'ethers';
import { CYBER_HILO_ADDRESS, CYBER_HILO_ABI } from '@/config/contracts';

// 多个 BSC RPC 节点轮换使用，避免速率限制
const BSC_RPCS = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org',
  'https://bsc-dataseed4.binance.org',
];

const CONTRACT_ADDRESS = CYBER_HILO_ADDRESS.mainnet;

// 获取随机 RPC
const getRandomRpc = () => BSC_RPCS[Math.floor(Math.random() * BSC_RPCS.length)];

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
      // 使用随机 RPC 避免速率限制
      const provider = new JsonRpcProvider(getRandomRpc());
      const contract = new Contract(CONTRACT_ADDRESS, CYBER_HILO_ABI, provider);

      // 获取合约统计数据
      const [totalGames, totalPaidOut] = await Promise.all([
        contract.totalGames(),
        contract.totalPaidOut(),
      ]);

      // 缩小查询范围到 2000 个区块（约 1.5 小时），避免速率限制
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 2000);

      // 查询 GameCashedOut 事件
      const filter = contract.filters.GameCashedOut();
      let events: any[] = [];
      
      try {
        events = await contract.queryFilter(filter, fromBlock, currentBlock);
      } catch (e) {
        // 如果仍然触发限制，尝试更小的范围
        console.log('First query failed, trying smaller range...');
        const smallerFromBlock = Math.max(0, currentBlock - 500);
        events = await contract.queryFilter(filter, smallerFromBlock, currentBlock);
      }

      // 处理事件数据 - 使用区块号估算时间戳，避免额外 RPC 调用
      const playerData = new Map<string, LeaderboardEntry>();
      const recent: RecentWin[] = [];
      const baseTimestamp = Date.now();
      const blockTime = 3000; // BSC 约 3 秒一个区块

      for (const event of events) {
        const log = event as any;
        const player = log.args[0] as string;
        const playerPrize = Number(formatEther(log.args[2]));
        const finalStreak = Number(log.args[3]);
        
        // 估算时间戳（避免为每个事件调用 getBlock）
        const blocksAgo = currentBlock - event.blockNumber;
        const estimatedTimestamp = baseTimestamp - (blocksAgo * blockTime);

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
        existing.lastWinTime = Math.max(existing.lastWinTime, estimatedTimestamp);
        playerData.set(player, existing);

        // 添加到最近获胜列表
        recent.push({
          player,
          bnbWon: playerPrize,
          streak: finalStreak,
          timestamp: estimatedTimestamp,
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
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('加载排行榜失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
    
    // 每 60 秒刷新一次（降低频率避免限制）
    const interval = setInterval(fetchLeaderboardData, 60000);
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
