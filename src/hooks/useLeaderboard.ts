import { useState, useEffect, useCallback } from 'react';
import { Contract, JsonRpcProvider, formatEther } from 'ethers';
import { CYBER_HILO_ADDRESS, CYBER_HILO_ABI } from '@/config/contracts';

// 使用多个 BSC RPC 节点做负载均衡
const BSC_RPC_LIST = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org',
  'https://bsc-dataseed4.binance.org',
];
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

// 解析事件数据（来自 eth_getLogs RPC）
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

// 使用 JSON-RPC 直接调用 eth_getLogs
async function fetchLogsViaRPC(fromBlock: number, toBlock: number): Promise<any[]> {
  const rpcUrl = BSC_RPC_LIST[Math.floor(Math.random() * BSC_RPC_LIST.length)];
  
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getLogs',
      params: [{
        address: CONTRACT_ADDRESS,
        topics: [GAME_CASHED_OUT_TOPIC],
        fromBlock: '0x' + fromBlock.toString(16),
        toBlock: '0x' + toBlock.toString(16),
      }],
    }),
  });
  
  const data = await response.json();
  if (data.error) {
    console.error('RPC error:', data.error);
    return [];
  }
  return data.result || [];
}

// 根据区块号估算时间戳（BSC 约 3 秒/块）
function estimateTimestamp(blockNumber: number, currentBlock: number): number {
  const blockDiff = currentBlock - blockNumber;
  const secondsAgo = blockDiff * 3; // BSC 约 3 秒一个区块
  return Date.now() - (secondsAgo * 1000);
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
      const rpcUrl = BSC_RPC_LIST[0];
      const provider = new JsonRpcProvider(rpcUrl);
      const contract = new Contract(CONTRACT_ADDRESS, CYBER_HILO_ABI, provider);

      const [totalGames, totalPaidOut] = await Promise.all([
        contract.totalGames(),
        contract.totalPaidOut(),
      ]);

      // 2. 使用原生 eth_getLogs RPC 获取事件日志（免费）
      const currentBlock = await provider.getBlockNumber();
      // 分批查询，每批 2000 个区块（避免 RPC 限制）
      const batchSize = 2000;
      const totalBlocks = 10000; // 约 8 小时
      const fromBlock = Math.max(0, currentBlock - totalBlocks);

      const playerData = new Map<string, LeaderboardEntry>();
      const recent: RecentWin[] = [];

      // 分批获取日志
      for (let start = fromBlock; start < currentBlock; start += batchSize) {
        const end = Math.min(start + batchSize - 1, currentBlock);
        const logs = await fetchLogsViaRPC(start, end);
        
        for (const log of logs) {
          const parsed = parseGameCashedOutEvent(log);
          if (!parsed) continue;

          const { player, playerPrize, streak } = parsed;
          // RPC 返回的区块号是十六进制
          const blockNum = parseInt(log.blockNumber, 16);
          const timestamp = estimateTimestamp(blockNum, currentBlock);

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
