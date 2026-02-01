import { useState, useEffect, useCallback } from 'react';
import { Contract, JsonRpcProvider, formatEther } from 'ethers';
import { CYBER_HILO_ADDRESS, CYBER_HILO_ABI } from '@/config/contracts';

// BSC RPC（只用于读取合约状态，不用于查询日志）
const BSC_RPC = 'https://bsc-dataseed1.binance.org';
const CONTRACT_ADDRESS = CYBER_HILO_ADDRESS.mainnet;

// BSCScan API（免费版有速率限制但比 RPC 宽松）
const BSCSCAN_API = 'https://api.bscscan.com/api';
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

// 解析事件数据
function parseGameCashedOutEvent(log: any): { player: string; playerPrize: number; streak: number } | null {
  try {
    // topics: [event_sig, indexed_player]
    // data: [grossPrize, playerPrize, finalStreak] (non-indexed)
    const player = '0x' + log.topics[1].slice(26); // 从 topic 中提取地址
    const data = log.data.slice(2); // 移除 0x
    
    // 每个参数 64 个字符（32 字节）
    // grossPrize (uint256) - 我们不需要
    // playerPrize (uint256)
    // finalStreak (uint8)
    const playerPrizeHex = data.slice(64, 128);
    const streakHex = data.slice(128, 192);
    
    const playerPrize = Number(BigInt('0x' + playerPrizeHex)) / 1e18;
    const streak = Number(BigInt('0x' + streakHex));
    
    return { player, playerPrize, streak };
  } catch (e) {
    console.error('Failed to parse event:', e);
    return null;
  }
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

      // 2. 使用 BSCScan API 获取事件日志（比 RPC 更宽松）
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 5000); // 约 4 小时

      const url = `${BSCSCAN_API}?module=logs&action=getLogs&address=${CONTRACT_ADDRESS}&topic0=${GAME_CASHED_OUT_TOPIC}&fromBlock=${fromBlock}&toBlock=${currentBlock}&page=1&offset=100`;
      
      const response = await fetch(url);
      const data = await response.json();

      const playerData = new Map<string, LeaderboardEntry>();
      const recent: RecentWin[] = [];

      if (data.status === '1' && Array.isArray(data.result)) {
        for (const log of data.result) {
          const parsed = parseGameCashedOutEvent(log);
          if (!parsed) continue;

          const { player, playerPrize, streak } = parsed;
          const timestamp = Number(log.timeStamp) * 1000;

          // 更新排行榜
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

          // 添加到最近获胜
          recent.push({
            player,
            bnbWon: playerPrize,
            streak,
            timestamp,
            txHash: log.transactionHash,
          });
        }
      }

      // 排序
      const sortedLeaderboard = Array.from(playerData.values())
        .sort((a, b) => b.totalBnbWon - a.totalBnbWon)
        .slice(0, 10);

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
