import { motion } from 'framer-motion';
import { WHEEL_SECTORS } from '@/config/wheelConfig';
import { Info } from 'lucide-react';

interface LuxuryPaytableProps {
  prizePool: number;
  expanded?: boolean;
}

export function LuxuryPaytable({ prizePool, expanded = false }: LuxuryPaytableProps) {
  const tiers = WHEEL_SECTORS.filter(s => s.type !== 'none');

  const getTierStyle = (type: string) => {
    const styles: Record<string, { bg: string; border: string; text: string }> = {
      super_jackpot: { 
        bg: 'from-yellow-500/20 to-amber-600/20', 
        border: 'border-yellow-500/50',
        text: 'text-yellow-400'
      },
      jackpot: { 
        bg: 'from-purple-500/20 to-violet-600/20', 
        border: 'border-purple-500/50',
        text: 'text-purple-400'
      },
      first: { 
        bg: 'from-red-500/20 to-rose-600/20', 
        border: 'border-red-500/50',
        text: 'text-red-400'
      },
      second: { 
        bg: 'from-blue-500/20 to-indigo-600/20', 
        border: 'border-blue-500/50',
        text: 'text-blue-400'
      },
      third: { 
        bg: 'from-emerald-500/20 to-green-600/20', 
        border: 'border-emerald-500/50',
        text: 'text-emerald-400'
      },
      small: { 
        bg: 'from-orange-500/20 to-amber-600/20', 
        border: 'border-orange-500/50',
        text: 'text-orange-400'
      },
      consolation: { 
        bg: 'from-slate-500/20 to-gray-600/20', 
        border: 'border-slate-500/50',
        text: 'text-slate-400'
      },
    };
    return styles[type] || styles.consolation;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      <div className="rounded-2xl bg-black/40 backdrop-blur-sm border border-primary/20 overflow-hidden">
        {/* 标题 */}
        <div className="px-4 py-3 border-b border-primary/20 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm tracking-wider text-primary flex items-center gap-2">
              <Info className="w-4 h-4" />
              奖项说明
            </h3>
            <span className="text-xs text-muted-foreground">
              总概率 9.375%
            </span>
          </div>
        </div>

        {/* 奖项列表 */}
        <div className="p-3 space-y-2">
          {tiers.map((tier, index) => {
            const style = getTierStyle(tier.type);
            const payout = tier.poolPercent * prizePool;

            return (
              <motion.div
                key={tier.type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative p-3 rounded-xl 
                  bg-gradient-to-r ${style.bg}
                  border ${style.border}
                  group hover:scale-[1.02] transition-transform
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tier.emoji}</span>
                    <div>
                      <div className={`font-display text-sm ${style.text}`}>
                        {tier.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        概率 {(tier.probability * 100).toFixed(3)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-display text-lg ${style.text}`}>
                      {payout.toFixed(3)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      BNB · {(tier.poolPercent * 100).toFixed(1)}%池
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 未中奖说明 */}
        <div className="px-4 py-3 border-t border-primary/10 bg-black/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>💫 再来一次</span>
            <span>90.625% · 旋转费全部进入奖池</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
