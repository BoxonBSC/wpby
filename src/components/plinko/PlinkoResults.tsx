import { motion, AnimatePresence } from 'framer-motion';
import { PlinkoResult, getSlotColor } from '@/config/plinko';
import { TrendingUp, TrendingDown, History } from 'lucide-react';

interface PlinkoResultsProps {
  results: PlinkoResult[];
  totalWin: number;
  totalBet: number;
}

function hexToRgb(hex: number): string {
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

export function PlinkoResults({ results, totalWin, totalBet }: PlinkoResultsProps) {
  const profit = totalWin - totalBet;
  const profitPercent = totalBet > 0 ? ((profit / totalBet) * 100).toFixed(1) : '0';
  const isProfit = profit >= 0;

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
          <div className="text-[#C9A347]/60 text-xs mb-1">总下注</div>
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
          <div className="text-[#FFD700] font-bold text-sm">{totalWin.toLocaleString()}</div>
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
            {isProfit ? '+' : ''}{profit.toLocaleString()}
          </div>
          <div className={`text-xs ${isProfit ? 'text-green-400/60' : 'text-red-400/60'}`}>
            {profitPercent}%
          </div>
        </div>
      </div>

      {/* 历史记录标题 */}
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-[#C9A347]/60" />
        <span className="text-[#C9A347]/60 text-sm">最近结果</span>
        <span className="text-[#C9A347]/40 text-xs">({results.length})</span>
      </div>

      {/* 最近结果列表 */}
      <div className="flex-1 overflow-hidden">
        <div className="space-y-2 max-h-full overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {results.slice(0, 30).map((result, index) => {
              const color = hexToRgb(getSlotColor(result.multiplier));
              const isWin = result.winAmount > result.betAmount;
              const isBigWin = result.multiplier >= 10;
              
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="flex items-center justify-between p-3 rounded-xl relative overflow-hidden"
                  style={{
                    background: isBigWin 
                      ? `linear-gradient(135deg, ${color}15 0%, transparent 100%)`
                      : 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${isBigWin ? `${color}40` : 'rgba(201, 163, 71, 0.1)'}`,
                    boxShadow: isBigWin ? `0 0 20px ${color}20` : 'none',
                  }}
                >
                  {/* 大奖闪光效果 */}
                  {isBigWin && (
                    <motion.div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                  
                  {/* 倍率标签 */}
                  <div
                    className="px-3 py-1.5 rounded-lg font-bold text-sm relative z-10"
                    style={{ 
                      backgroundColor: `${color}25`,
                      color: color,
                      boxShadow: `0 0 15px ${color}30`,
                      minWidth: '60px',
                      textAlign: 'center',
                    }}
                  >
                    {result.multiplier}x
                  </div>

                  {/* 下注 → 赢得 */}
                  <div className="flex-1 text-center relative z-10 px-2">
                    <span className="text-[#C9A347]/50 text-xs">
                      {result.betAmount.toLocaleString()}
                    </span>
                    <span className="text-[#C9A347]/30 mx-2">→</span>
                    <span className={`font-bold text-sm ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                      {result.winAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* 盈亏 */}
                  <div 
                    className={`text-xs font-bold px-2 py-1 rounded relative z-10 ${isWin ? 'text-green-400' : 'text-red-400'}`}
                    style={{
                      background: isWin ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                    }}
                  >
                    {isWin ? '+' : ''}{(result.winAmount - result.betAmount).toLocaleString()}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {results.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[#C9A347]/30 text-4xl mb-3">🎱</div>
              <div className="text-[#C9A347]/40 text-sm">
                还没有游戏记录
              </div>
              <div className="text-[#C9A347]/30 text-xs mt-1">
                投放弹珠开始游戏
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 快速统计 */}
      {results.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#C9A347]/10">
          <div className="flex justify-between text-xs text-[#C9A347]/50">
            <span>游戏次数: {results.length}</span>
            <span>最高倍率: {Math.max(...results.map(r => r.multiplier))}x</span>
          </div>
        </div>
      )}
    </div>
  );
}
