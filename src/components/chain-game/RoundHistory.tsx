import { useState, useEffect, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, History, ChevronDown, ChevronUp, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';
import {
  CYBER_CHAIN_GAME_ADDRESS,
  CYBER_CHAIN_GAME_ABI,
  CHAIN_GAME_DYNAMIC_TIERS,
} from '@/config/contracts';

const GAME_CONTRACT = CYBER_CHAIN_GAME_ADDRESS.mainnet;
const BSCSCAN_URL = 'https://bscscan.com/address/';

// 需要隐藏的测试地址（小写）
const HIDDEN_ADDRESSES = new Set([
  '0x21483e0c9e4087ddcd81c736bd831058efc0dadf',
]);

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

interface RoundHistoryProps {
  currentRoundId: number;
}

export const RoundHistory = forwardRef<HTMLDivElement, RoundHistoryProps>(function RoundHistory({ currentRoundId }, ref) {
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
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

        const results: RoundResult[] = [];
        const startRound = Math.max(1, currentRoundId - 10);

        for (let i = currentRoundId - 1; i >= startRound && results.length < 10; i--) {
          if (i < 1) break;
          try {
            const result = await contract.getRoundResult(i);
            if (result.winner === ethers.ZeroAddress) continue;
            // 跳过测试地址
            if (HIDDEN_ADDRESSES.has(result.winner.toLowerCase())) continue;

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

  if (history.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">中奖记录</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm">
          暂无中奖记录
        </div>
      </div>
    );
  }

  const displayHistory = expanded ? history : history.slice(0, 3);

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">中奖记录</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-neutral-600">
          <span className="flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5 text-emerald-500" /> 已发放</span>
          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-violet-400" /> 待领取</span>
        </div>
      </div>

      <div className="space-y-1.5 flex-1 overflow-y-auto">
        {displayHistory.map((round, index) => {
          const tierLabel = CHAIN_GAME_DYNAMIC_TIERS.find(
            (t) => round.participantCount >= t.minPlayers && round.participantCount <= t.maxPlayers
          )?.label.split(' ')[0] || '🎮';

          return (
            <motion.div
              key={round.roundId}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/[0.08] flex items-center justify-center text-yellow-500 text-[11px] font-bold">
                  #{round.roundId}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-yellow-500/70" />
                    <a
                      href={`${BSCSCAN_URL}${round.winner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-neutral-400 hover:text-violet-400 transition-colors flex items-center gap-1"
                    >
                      {shortenAddress(round.winner)}
                      <ExternalLink className="w-2.5 h-2.5 opacity-40" />
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 mt-0.5">
                    <span>{round.endTime}</span>
                    <span>·</span>
                    <span>{round.participantCount}人</span>
                    <span>·</span>
                    <span>{tierLabel} {round.winnerRate}%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-yellow-400 font-bold text-xs">
                  +{round.prize} BNB
                </span>
                {round.paymentStatus === 'paid' ? (
                  <span className="flex items-center gap-0.5 text-[10px] text-emerald-500">
                    <CheckCircle className="w-2.5 h-2.5" />
                    已发放
                  </span>
                ) : round.paymentStatus === 'pending' ? (
                  <span className="flex items-center gap-0.5 text-[10px] text-violet-400">
                    <Clock className="w-2.5 h-2.5" />
                    待领取 {round.pendingAmount}
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-600">
                    奖池 {round.prizePool}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {history.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 flex items-center justify-center gap-1 py-2 rounded-lg text-xs text-neutral-500 hover:text-violet-400 hover:bg-white/[0.02] transition-colors"
        >
          {expanded ? (
            <>收起 <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>查看更多 ({history.length - 3}) <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}

      <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-center">
        <a
          href={`${BSCSCAN_URL}${GAME_CONTRACT}#internaltx`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-neutral-600 hover:text-violet-400 transition-colors flex items-center gap-1"
        >
          🔍 在 BscScan 上验证所有转账记录
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
});
