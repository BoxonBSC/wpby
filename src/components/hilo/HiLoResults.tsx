import { motion } from 'framer-motion';
import { HiLoResult } from '@/config/hilo';
import { History, TrendingUp, TrendingDown, Trophy } from 'lucide-react';

interface HiLoResultsProps {
  results: HiLoResult[];
}

export function HiLoResults({ results }: HiLoResultsProps) {
  const totalBet = results.reduce((sum, r) => sum + r.betAmount, 0);
  const totalWon = results.reduce((sum, r) => sum + r.bnbWon, 0);
  const winCount = results.filter(r => r.bnbWon > 0).length;
  const winRate = results.length > 0 ? (winCount / results.length * 100).toFixed(1) : '0';
  const maxStreak = Math.max(...results.map(r => r.streak), 0);

  return (
    <div 
      className="rounded-2xl p-4 h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
      }}
    >
      {/* 统计面板 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-black/30 border border-[#C9A347]/10">
          <div className="text-[#C9A347]/60 text-xs">总消耗</div>
          <div className="text-[#C9A347] font-bold">{(totalBet / 1000).toFixed(0)}K</div>
        </div>
        <div className="p-3 rounded-xl bg-black/30 border border-[#FFD700]/10">
          <div className="text-[#FFD700]/60 text-xs">总赢得</div>
          <div className="text-[#FFD700] font-bold">{totalWon.toFixed(4)} BNB</div>
        </div>
        <div className="p-3 rounded-xl bg-black/30 border border-green-500/10">
          <div className="text-green-500/60 text-xs">胜率</div>
          <div className="text-green-400 font-bold">{winRate}%</div>
        </div>
        <div className="p-3 rounded-xl bg-black/30 border border-purple-500/10">
          <div className="text-purple-500/60 text-xs">最高连胜</div>
          <div className="text-purple-400 font-bold flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            {maxStreak}
          </div>
        </div>
      </div>

      {/* 历史记录 */}
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-[#C9A347]" />
        <h3 className="text-[#C9A347] font-bold text-sm">游戏记录</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-[#C9A347]/20">
        {results.length === 0 ? (
          <div className="text-center py-8 text-[#C9A347]/40 text-sm">
            暂无游戏记录
          </div>
        ) : (
          results.slice(0, 20).map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`
                p-3 rounded-xl flex items-center justify-between
                ${result.bnbWon > 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}
              `}
            >
              <div className="flex items-center gap-2">
                {result.bnbWon > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <div>
                  <div className={`text-sm font-bold ${result.bnbWon > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {result.cashedOut ? `收手 x${result.streak}` : `猜错 x${result.streak}`}
                  </div>
                  <div className="text-xs text-[#C9A347]/40">
                    {(result.betAmount / 1000).toFixed(0)}K 凭证
                  </div>
                </div>
              </div>
              <div className="text-right">
                {result.bnbWon > 0 ? (
                  <div className="text-green-400 font-bold">+{result.bnbWon.toFixed(4)}</div>
                ) : (
                  <div className="text-red-400 font-bold">-{(result.betAmount / 1000).toFixed(0)}K</div>
                )}
                <div className="text-xs text-[#C9A347]/30">
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
