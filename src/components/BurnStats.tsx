import { motion } from 'framer-motion';
import { Flame, TrendingUp, Zap } from 'lucide-react';
import { useCyberSlots } from '@/hooks/useCyberSlots';
import { useLanguage } from '@/contexts/LanguageContext';

export function BurnStats() {
  const { totalBurned, totalSpins, prizePool } = useCyberSlots();
  const { t } = useLanguage();

  const formatNumber = (value: string | bigint) => {
    const n = typeof value === 'bigint' ? Number(value) : Number(value);
    if (!Number.isFinite(n) || n <= 0) return '0';
    
    if (n >= 1_000_000) {
      return (n / 1_000_000).toFixed(2) + 'M';
    } else if (n >= 1_000) {
      return (n / 1_000).toFixed(1) + 'K';
    }
    return n.toLocaleString();
  };

  const formatBnb = (value: string) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return '0';
    const decimals = n >= 1 ? 2 : n >= 0.01 ? 4 : 6;
    return n.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mb-3 sm:mb-4"
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* 总销毁 - 主要突出 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neon-pink/20 via-neon-orange/10 to-transparent border border-neon-pink/40 p-2.5 sm:p-4"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-neon-pink/5 to-transparent" />
          <div className="absolute top-0 right-0 w-16 h-16 bg-neon-pink/10 rounded-full blur-2xl" />
          
          <div className="relative flex flex-col items-center text-center">
            <div className="flex items-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-pink animate-pulse" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">{t('stats.totalBurned')}</span>
            </div>
            <motion.span
              key={totalBurned}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-lg sm:text-2xl font-display text-neon-pink font-bold"
            >
              {formatNumber(totalBurned)}
            </motion.span>
            <span className="text-[10px] text-neon-pink/60">🔥 TOKENS</span>
          </div>
        </motion.div>

        {/* 奖池 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neon-yellow/20 via-neon-orange/10 to-transparent border border-neon-yellow/40 p-2.5 sm:p-4"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-neon-yellow/5 to-transparent" />
          
          <div className="relative flex flex-col items-center text-center">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-yellow" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">{t('jackpot.pool')}</span>
            </div>
            <motion.span
              key={prizePool}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-lg sm:text-2xl font-display text-neon-yellow font-bold"
            >
              {formatBnb(prizePool)}
            </motion.span>
            <span className="text-[10px] text-neon-yellow/60">BNB</span>
          </div>
        </motion.div>

        {/* 总旋转 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-neon-cyan/20 via-neon-blue/10 to-transparent border border-neon-cyan/40 p-2.5 sm:p-4"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/5 to-transparent" />
          
          <div className="relative flex flex-col items-center text-center">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-cyan" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">{t('stats.totalSpins')}</span>
            </div>
            <motion.span
              key={totalSpins.toString()}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-lg sm:text-2xl font-display text-neon-cyan font-bold"
            >
              {formatNumber(totalSpins)}
            </motion.span>
            <span className="text-[10px] text-neon-cyan/60">SPINS</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
