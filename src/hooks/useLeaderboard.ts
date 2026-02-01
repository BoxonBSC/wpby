import { useState, useEffect, useCallback } from 'react';
import { Contract, JsonRpcProvider, formatEther } from 'ethers';
import { CYBER_HILO_ADDRESS, CYBER_HILO_ABI } from '@/config/contracts';
import { supabase } from '@/integrations/supabase/client';

// BSC RPC 用于读取合约状态
const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const CONTRACT_ADDRESS = CYBER_HILO_ADDRESS.mainnet;

// GameCashedOut 事件的 topic0
const GAME_CASHED_OUT_TOPIC = '0x340c7e0efa4aebe5bb15c89f558c061e1571b89465d352d428911984552cbcbf';

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

// 解析事件数据（来自 Etherscan API）
function parseGameCashedOutEvent(log: any): { player: string; playerPrize: number; streak: number; timestamp: number } | null {
  try {
    // topics: [event_sig, indexed_player]
    // data: [grossPrize, playerPrize, finalStreak] (non-indexed)
    const player = '0x' + log.topics[1].slice(26); // 从 topic 中提取地址
    const data = log.data.slice(2); // 移除 0x
    
    // 每个参数 64 个字符（32 字节）
    const playerPrizeHex = data.slice(64, 128);
    const streakHex = data.slice(128, 192);
    
    const playerPrize = Number(BigInt('0x' + playerPrizeHex)) / 1e18;
    const streak = Number(BigInt('0x' + streakHex));
    // Etherscan 返回的时间戳是十六进制
    const timestamp = parseInt(log.timeStamp, 16) * 1000;
    
    return { player, playerPrize, streak, timestamp };
  } catch (e) {
    console.error('Failed to parse event:', e);
    return null;
  }
}

// 通过 Edge Function 调用 Etherscan V2 API
async function fetchLogsViaEdgeFunction(fromBlock: number, toBlock: number): Promise<any[]> {
  // 使用 URL 参数方式调用
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-bsc-logs?address=${CONTRACT_ADDRESS}&topic0=${GAME_CASHED_OUT_TOPIC}&fromBlock=${fromBlock}&toBlock=${toBlock}`,
    {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
    }
  );

  const result = await response.json();
  
  if (result.status === '1' && Array.isArray(result.result)) {
    return result.result;
  }
  
  console.error('Etherscan API error:', result);
  return [];
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
      // 1. 从合约读取全局统计
      const provider = new JsonRpcProvider(BSC_RPC);
      const contract = new Contract(CONTRACT_ADDRESS, CYBER_HILO_ABI, provider);

      const [totalGames, totalPaidOut] = await Promise.all([
        contract.totalGames(),
        contract.totalPaidOut(),
      ]);

      // 2. 通过 Edge Function 调用 Etherscan V2 API 获取事件日志
      const currentBlock = await provider.getBlockNumber();
      const totalBlocks = 864000; // 约 30 天的数据 (BSC 每 3 秒一个区块)
      const fromBlock = Math.max(0, currentBlock - totalBlocks);

      const playerData = new Map<string, LeaderboardEntry>();
      const recent: RecentWin[] = [];

      // 使用 Edge Function 获取日志（单次请求，无需分批）
      const logs = await fetchLogsViaEdgeFunction(fromBlock, currentBlock);
      
      for (const log of logs) {
        const parsed = parseGameCashedOutEvent(log);
        if (!parsed) continue;

        const { player, playerPrize, streak, timestamp } = parsed;

        const existing = playerData.get(player.toLowerCase()) || {
          player,
          totalWins: 0,
          totalBnbWon: 0,
          maxStreak: 0,
          lastWinTime: 0,
        };

        existing.totalWins += 1;
        existing.totalBnbWon += playerPrize;
        existing.maxStreak = Math.max(existing.maxStreak, streak);
        existing.lastWinTime = Math.max(existing.lastWinTime, timestamp);
        playerData.set(player.toLowerCase(), existing);

        recent.push({
          player,
          bnbWon: playerPrize,
          streak,
          timestamp,
          txHash: log.transactionHash,
        });
      }

      // 排序
      const sortedLeaderboard = Array.from(playerData.values())
        .sort((a, b) => b.totalBnbWon - a.totalBnbWon)
        .slice(0, 20);

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
    
    // 每 2 分钟刷新一次
    const interval = setInterval(fetchLeaderboardData, 120000);
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
