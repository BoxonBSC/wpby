import { motion, AnimatePresence } from 'framer-motion';
import { CrashResult } from '@/config/crash';
import { TrendingUp, TrendingDown, History, Rocket, Flame } from 'lucide-react';

interface CrashResultsProps {
  results: CrashResult[];
  recentCrashPoints: number[];
}

function getPointColor(point: number): string {
  if (point < 1.5) return '#FF4444';
  if (point < 2) return '#FF8800';
  if (point < 3) return '#FFCC00';
  if (point < 5) return '#00FF88';
  if (point < 10) return '#00CCFF';
  return '#FF00FF';
}

export function CrashResults({ results, recentCrashPoints }: CrashResultsProps) {
  const totalBet = results.reduce((sum, r) => sum + r.betAmount, 0);
  const totalWin = results.reduce((sum, r) => sum + r.bnbWon, 0);
  const winCount = results.filter(r => r.cashoutMultiplier !== null).length;

  return (
    <div 
      className="rounded-2xl p-6 h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
        boxShadow: '0 0 40px rgba(201, 163, 71, 0.15)',
      }}
    >
      {/* 最近崩盘点 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-red-400" />
          <span className="text-[#C9A347]/60 text-sm">最近崩盘点</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {recentCrashPoints.slice(0, 10).map((point, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-2 py-1 rounded-lg text-xs font-bold"
              style={{
                background: `${getPointColor(point)}20`,
                color: getPointColor(point),
                border: `1px solid ${getPointColor(point)}40`,
              }}
            >
              {point.toFixed(2)}x
            </motion.div>
          ))}
        </div>
      </div>

      {/* 统计摘要 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-xl bg-[#C9A347]/5 border border-[#C9A347]/10">
          <div className="text-[#C9A347]/60 text-xs">总下注</div>
          <div className="text-[#C9A347] font-bold text-sm">{totalBet.toLocaleString()}</div>
        </div>
        <div className="text-center p-2 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/15">
          <div className="text-[#FFD700]/60 text-xs">总赢得</div>
          <div className="text-[#FFD700] font-bold text-sm">{totalWin.toFixed(4)}</div>
        </div>
        <div className="text-center p-2 rounded-xl bg-green-500/5 border border-green-500/15">
          <div className="text-green-400/60 text-xs">胜率</div>
          <div className="text-green-400 font-bold text-sm">
            {results.length > 0 ? ((winCount / results.length) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      {/* 历史记录 */}
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-[#C9A347]/60" />
        <span className="text-[#C9A347]/60 text-sm">游戏记录</span>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="space-y-2 max-h-full overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {results.slice(0, 20).map((result, index) => {
              const won = result.cashoutMultiplier !== null;
              
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: won ? 'rgba(0, 255, 100, 0.05)' : 'rgba(255, 0, 0, 0.05)',
                    border: `1px solid ${won ? 'rgba(0, 255, 100, 0.15)' : 'rgba(255, 0, 0, 0.15)'}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {won ? (
                      <Rocket className="w-4 h-4 text-green-400" />
                    ) : (
                      <Flame className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <div className="text-xs text-[#C9A347]/50">
                        崩盘 {result.crashPoint.toFixed(2)}x
                      </div>
                      {won && (
                        <div className="text-xs font-bold text-green-400">
                          兑现 {result.cashoutMultiplier?.toFixed(2)}x
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`font-bold text-sm ${won ? 'text-green-400' : 'text-red-400'}`}>
                    {won ? `+${result.bnbWon.toFixed(4)} BNB` : `-${result.betAmount.toLocaleString()}`}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {results.length === 0 && (
            <div className="text-center py-8">
              <Rocket className="w-12 h-12 mx-auto text-[#C9A347]/20 mb-2" />
              <div className="text-[#C9A347]/40 text-sm">还没有游戏记录</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
