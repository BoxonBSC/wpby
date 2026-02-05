import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, History, ChevronDown, ChevronUp, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';
import {
  CYBER_CHAIN_GAME_ADDRESS,
  CYBER_CHAIN_GAME_ABI,
  CHAIN_GAME_DYNAMIC_TIERS,
} from '@/config/contracts';

const GAME_CONTRACT = CYBER_CHAIN_GAME_ADDRESS.mainnet;
const IS_CONTRACT_DEPLOYED = GAME_CONTRACT !== '0x0000000000000000000000000000000000000000';
const BSCSCAN_URL = 'https://bscscan.com/address/';

interface RoundResult {
  roundId: number;
  winner: string;
  prize: string;
  prizePool: string;
  participantCount: number;
  endTime: string;
  winnerRate: number;
  paymentStatus: 'paid' | 'pending' | 'unknown';
  pendingAmount: string;
}

const getEthereumProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum as unknown as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }
  return null;
};

const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// Demo data
const DEMO_HISTORY: RoundResult[] = [
  { roundId: 5, winner: '0x1234567890abcdef1234567890abcdef12345678', prize: '0.8750', prizePool: '2.5000', participantCount: 18, endTime: '14:00', winnerRate: 42, paymentStatus: 'paid', pendingAmount: '0' },
  { roundId: 4, winner: '0xabcdef1234567890abcdef1234567890abcdef12', prize: '0.3325', prizePool: '1.0000', participantCount: 8, endTime: '13:30', winnerRate: 35, paymentStatus: 'paid', pendingAmount: '0' },
  { roundId: 3, winner: '0x9876543210fedcba9876543210fedcba98765432', prize: '1.3680', prizePool: '3.0000', participantCount: 25, endTime: '13:00', winnerRate: 48, paymentStatus: 'pending', pendingAmount: '1.3680' },
  { roundId: 2, winner: '0xfedcba9876543210fedcba9876543210fedcba98', prize: '0.4988', prizePool: '1.5000', participantCount: 12, endTime: '12:30', winnerRate: 35, paymentStatus: 'paid', pendingAmount: '0' },
  { roundId: 1, winner: '0x1111222233334444555566667777888899990000', prize: '0.1663', prizePool: '0.5000', participantCount: 5, endTime: '12:00', winnerRate: 35, paymentStatus: 'paid', pendingAmount: '0' },
];

interface RoundHistoryProps {
  currentRoundId: number;
}

export function RoundHistory({ currentRoundId }: RoundHistoryProps) {
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!IS_CONTRACT_DEPLOYED) {
        setHistory(DEMO_HISTORY);
        setIsLoading(false);
        return;
      }

      const ethereum = getEthereumProvider();
      if (!ethereum) {
        setIsLoading(false);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(ethereum);
        const contract = new ethers.Contract(GAME_CONTRACT, CYBER_CHAIN_GAME_ABI, provider);

        const totalRounds = Number(await contract.totalRounds());
        if (totalRounds === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch last 10 settled rounds
        const results: RoundResult[] = [];
        const startRound = Math.max(1, currentRoundId - 10);

        for (let i = currentRoundId - 1; i >= startRound && results.length < 10; i--) {
          if (i < 1) break;
          try {
            const result = await contract.getRoundResult(i);
            if (result.winner === ethers.ZeroAddress) continue;

            // Check if winner has pending (unclaimed) rewards
            let paymentStatus: 'paid' | 'pending' | 'unknown' = 'unknown';
            let pendingAmount = '0';
            try {
              const pending = await contract.pendingRewards(result.winner);
              const pendingNum = Number(ethers.formatEther(pending));
              if (pendingNum > 0) {
                paymentStatus = 'pending';
                pendingAmount = pendingNum.toFixed(4);
              } else {
                paymentStatus = 'paid';
              }
            } catch {
              paymentStatus = 'unknown';
            }

            results.push({
              roundId: i,
              winner: result.winner,
              prize: Number(ethers.formatEther(result.prize)).toFixed(4),
              prizePool: Number(ethers.formatEther(result.prizePool)).toFixed(4),
              participantCount: Number(result.participantCount),
              endTime: new Date(Number(result.endTime) * 1000).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              winnerRate: Number(result.winnerRate),
              paymentStatus,
              pendingAmount,
            });
          } catch (e) {
            console.warn(`Failed to fetch round ${i}:`, e);
          }
        }

        setHistory(results);
      } catch (error) {
        console.error('Failed to fetch round history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [currentRoundId]);

  if (isLoading) return null;
  if (history.length === 0) return null;

  const displayHistory = expanded ? history : history.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-700/50 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <History className="w-5 h-5 text-yellow-400" />
          中奖记录
        </div>
        <div className="flex items-center gap-3">
          {!IS_CONTRACT_DEPLOYED && (
            <span className="text-xs text-yellow-400/60">演示数据</span>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> 已发放</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-orange-400" /> 待领取</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {displayHistory.map((round, index) => {
          const tierLabel = CHAIN_GAME_DYNAMIC_TIERS.find(
            (t) => round.participantCount >= t.minPlayers && round.participantCount <= t.maxPlayers
          )?.label.split(' ')[0] || '🎮';

          return (
            <motion.div
              key={round.roundId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm font-bold">
                  #{round.roundId}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <a
                      href={`${BSCSCAN_URL}${round.winner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1"
                    >
                      {shortenAddress(round.winner)}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{round.endTime}</span>
                    <span>·</span>
                    <span>{round.participantCount} 人</span>
                    <span>·</span>
                    <span>{tierLabel} {round.winnerRate}%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Payment status indicator */}
                <div className="flex flex-col items-end">
                  <span className="text-yellow-400 font-bold text-sm">
                    +{round.prize} BNB
                  </span>
                  {round.paymentStatus === 'paid' ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      已发放
                    </span>
                  ) : round.paymentStatus === 'pending' ? (
                    <span className="flex items-center gap-1 text-xs text-orange-400">
                      <Clock className="w-3 h-3" />
                      待领取 {round.pendingAmount}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">
                      奖池 {round.prizePool}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {history.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-1 py-2 rounded-xl text-sm text-slate-400 hover:text-cyan-400 hover:bg-slate-800/30 transition-colors"
        >
          {expanded ? (
            <>收起 <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>查看更多 ({history.length - 3}) <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}

      {/* BSCScan verification hint */}
      {IS_CONTRACT_DEPLOYED && (
        <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-center">
          <a
            href={`${BSCSCAN_URL}${GAME_CONTRACT}#internaltx`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            🔍 在 BscScan 上验证所有转账记录
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </motion.div>
  );
}
