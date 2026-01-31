import { motion } from 'framer-motion';
import { HiLoResult } from '@/config/hilo';
import { History, TrendingUp, TrendingDown, Trophy, Coins, Target, Percent } from 'lucide-react';

interface HiLoResultsProps {
  results: HiLoResult[];
}

export function HiLoResults({ results }: HiLoResultsProps) {
  const totalBet = results.reduce((sum, r) => sum + r.betAmount, 0);
  const totalWon = results.reduce((sum, r) => sum + r.bnbWon, 0);
  const winCount = results.filter(r => r.bnbWon > 0).length;
  const winRate = results.length > 0 ? (winCount / results.length * 100).toFixed(1) : '0';
  const maxStreak = Math.max(...results.map(r => r.streak), 0);

  const formatBet = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div 
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
        maxHeight: 'calc(100vh - 520px)',
        minHeight: '280px',
      }}
    >
      {/* 统计面板 - 紧凑型横向布局 */}
      <div 
        className="px-3 py-2 flex items-center justify-between gap-2 flex-shrink-0"
        style={{
          background: 'linear-gradient(90deg, rgba(201, 163, 71, 0.08) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(201, 163, 71, 0.15)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <Coins className="w-3 h-3 flex-shrink-0" style={{ color: '#C9A347' }} />
          <span className="text-[10px]" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>消耗</span>
          <span className="text-xs font-bold" style={{ color: '#C9A347' }}>{formatBet(totalBet)}</span>
        </div>
        <div className="w-px h-4 bg-[#C9A347]/20" />
        <div className="flex items-center gap-1.5">
          <Target className="w-3 h-3 flex-shrink-0" style={{ color: '#FFD700' }} />
          <span className="text-[10px]" style={{ color: 'rgba(255, 215, 0, 0.6)' }}>赢得</span>
          <span className="text-xs font-bold" style={{ color: '#FFD700' }}>{totalWon.toFixed(3)}</span>
        </div>
        <div className="w-px h-4 bg-[#C9A347]/20" />
        <div className="flex items-center gap-1.5">
          <Percent className="w-3 h-3 flex-shrink-0" style={{ color: '#00FFC8' }} />
          <span className="text-xs font-bold" style={{ color: '#00FFC8' }}>{winRate}%</span>
        </div>
        <div className="w-px h-4 bg-[#C9A347]/20" />
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3 h-3 flex-shrink-0" style={{ color: '#B388FF' }} />
          <span className="text-xs font-bold" style={{ color: '#B388FF' }}>{maxStreak}</span>
        </div>
      </div>

      {/* 历史记录标题 */}
      <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0">
        <History className="w-3.5 h-3.5 text-[#C9A347]" />
        <h3 className="text-[#C9A347] font-bold text-xs">游戏记录</h3>
        <span className="text-[10px] text-[#C9A347]/40">({results.length})</span>
      </div>

      {/* 历史记录列表 */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 scrollbar-thin scrollbar-thumb-[#C9A347]/20">
        {results.length === 0 ? (
          <div className="text-center py-6 text-[#C9A347]/40 text-xs">
            暂无游戏记录
          </div>
        ) : (
          results.slice(0, 20).map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`
                px-2.5 py-2 rounded-lg flex items-center justify-between
                ${result.bnbWon > 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}
              `}
            >
              <div className="flex items-center gap-2">
                {result.bnbWon > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <div className={`text-xs font-bold ${result.bnbWon > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {result.cashedOut ? `收手 x${result.streak}` : `猜错 x${result.streak}`}
                  </div>
                  <div className="text-[10px] text-[#C9A347]/40">
                    {formatBet(result.betAmount)} 凭证
                  </div>
                </div>
              </div>
              <div className="text-right">
                {result.bnbWon > 0 ? (
                  <div className="text-green-400 font-bold text-xs">+{result.bnbWon.toFixed(4)}</div>
                ) : (
                  <div className="text-red-400 font-bold text-xs">-{formatBet(result.betAmount)}</div>
                )}
                <div className="text-[9px] text-[#C9A347]/30">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
