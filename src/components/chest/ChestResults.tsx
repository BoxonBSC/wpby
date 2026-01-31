import { motion, AnimatePresence } from 'framer-motion';
import { ChestResult, REWARDS, CHEST_TIERS, isWin, isBigWin, isJackpot } from '@/config/chest';
import { TrendingUp, TrendingDown, History, Trophy, Star } from 'lucide-react';

interface ChestResultsProps {
  results: ChestResult[];
  totalWin: number;
  totalBet: number;
}

export function ChestResults({ results, totalWin, totalBet }: ChestResultsProps) {
  const profit = totalWin - totalBet;
  const profitPercent = totalBet > 0 ? ((profit / totalBet) * 100).toFixed(1) : '0';
  const isProfit = profit >= 0;

  const winCount = results.filter(r => isWin(r.rewardType)).length;
  const jackpotCount = results.filter(r => isJackpot(r.rewardType)).length;

  return (
    <div 
      className="rounded-2xl p-6 h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
        boxShadow: `
          0 0 40px rgba(201, 163, 71, 0.15),
          inset 0 1px 0 rgba(201, 163, 71, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.5)
        `,
      }}
    >
      {/* 统计摘要 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div 
          className="text-center p-3 rounded-xl"
          style={{
            background: 'rgba(201, 163, 71, 0.05)',
            border: '1px solid rgba(201, 163, 71, 0.1)',
          }}
        >
          <div className="text-[#C9A347]/60 text-xs mb-1">总消耗</div>
          <div className="text-[#C9A347] font-bold text-sm">{totalBet.toLocaleString()}</div>
        </div>
        <div 
          className="text-center p-3 rounded-xl"
          style={{
            background: 'rgba(255, 215, 0, 0.05)',
            border: '1px solid rgba(255, 215, 0, 0.15)',
          }}
        >
          <div className="text-[#FFD700]/60 text-xs mb-1">总赢得</div>
          <div className="text-[#FFD700] font-bold text-sm">{totalWin.toFixed(4)} BNB</div>
        </div>
        <div 
          className="text-center p-3 rounded-xl"
          style={{
            background: isProfit ? 'rgba(0, 255, 0, 0.05)' : 'rgba(255, 0, 0, 0.05)',
            border: `1px solid ${isProfit ? 'rgba(0, 255, 0, 0.15)' : 'rgba(255, 0, 0, 0.15)'}`,
          }}
        >
          <div className="text-xs mb-1 flex items-center justify-center gap-1" style={{ color: isProfit ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)' }}>
            {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            盈亏
          </div>
          <div className={`font-bold text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{profit.toFixed(4)}
          </div>
        </div>
      </div>

      {/* 历史记录标题 */}
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-[#C9A347]/60" />
        <span className="text-[#C9A347]/60 text-sm">开箱记录</span>
        <span className="text-[#C9A347]/40 text-xs">({results.length})</span>
      </div>

      {/* 最近结果列表 */}
      <div className="flex-1 overflow-hidden">
        <div className="space-y-2 max-h-full overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {results.slice(0, 30).map((result, index) => {
              const rewardConfig = REWARDS[result.rewardType];
              const chestTier = CHEST_TIERS.find(t => t.id === result.chestTier);
              const hasWon = isWin(result.rewardType);
              const isBig = isBigWin(result.rewardType);
              const isJackpotWin = isJackpot(result.rewardType);
              
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="flex items-center justify-between p-3 rounded-xl relative overflow-hidden"
                  style={{
                    background: isBig 
                      ? `linear-gradient(135deg, ${rewardConfig.color}15 0%, transparent 100%)`
                      : 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${isBig ? `${rewardConfig.color}40` : 'rgba(201, 163, 71, 0.1)'}`,
                    boxShadow: isBig ? `0 0 20px ${rewardConfig.color}20` : 'none',
                  }}
                >
                  {/* 大奖闪光效果 */}
                  {isBig && (
                    <motion.div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${rewardConfig.color} 50%, transparent 100%)`,
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  
                  {/* 宝箱 + 奖励 */}
                  <div className="flex items-center gap-2 relative z-10">
                    {isJackpotWin && <Trophy className="w-4 h-4 text-[#FF00FF]" />}
                    {isBig && !isJackpotWin && <Star className="w-4 h-4 text-[#FF8800]" />}
                    <div
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{ 
                        backgroundColor: `${chestTier?.color}25`,
                        color: chestTier?.color,
                      }}
                    >
                      {chestTier?.name.replace('宝箱', '')}
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-lg font-bold text-xs"
                      style={{ 
                        backgroundColor: `${rewardConfig.color}25`,
                        color: rewardConfig.color,
                        boxShadow: `0 0 15px ${rewardConfig.color}30`,
                      }}
                    >
                      {rewardConfig.emoji} {rewardConfig.label}
                    </div>
                  </div>

                  {/* 赢得金额 */}
                  <div className={`font-bold text-sm relative z-10 ${hasWon ? 'text-green-400' : 'text-red-400'}`}>
                    {hasWon 
                      ? `+${result.bnbWinAmount.toFixed(4)} BNB`
                      : `-${result.cost.toLocaleString()}`
                    }
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {results.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[#C9A347]/30 text-4xl mb-3">📦</div>
              <div className="text-[#C9A347]/40 text-sm">
                还没有开箱记录
              </div>
              <div className="text-[#C9A347]/30 text-xs mt-1">
                选择宝箱开始游戏
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 快速统计 */}
      {results.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#C9A347]/10">
          <div className="flex justify-between text-xs text-[#C9A347]/50">
            <span>开箱次数: {results.length}</span>
            <span>中奖次数: {winCount}</span>
            {jackpotCount > 0 && (
              <span className="text-[#FF00FF]">👑 传奇: {jackpotCount}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
