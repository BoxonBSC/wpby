import { motion } from 'framer-motion';

interface PrizePoolProps {
  normalPool: number;
  luckyPool: number;
  totalBurned: string;
  participantCount: number;
}

export function PrizePool({ normalPool, luckyPool, totalBurned, participantCount }: PrizePoolProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="relative">
          <div className="text-xs text-cny-cream/60 mb-1.5 font-medium">🧧 普通红包池</div>
          <div className="text-2xl sm:text-3xl font-bold gold-shimmer">
            {normalPool.toFixed(4)}
          </div>
          <div className="text-xs text-cny-cream/40 mt-0.5 font-medium">BNB</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-gradient-to-br from-cny-gold/10 to-cny-gold/3 border border-cny-gold/25 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-cny-gold/5 to-transparent" />
        <div className="relative">
          <div className="text-xs text-cny-cream/60 mb-1.5 font-medium">🔥 幸运红包池</div>
          <div className="text-2xl sm:text-3xl font-bold gold-shimmer">
            {luckyPool.toFixed(4)}
          </div>
          <div className="text-xs text-cny-cream/40 mt-0.5 font-medium">BNB</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-card/80 border border-border/50 text-center"
      >
        <div className="text-xs text-cny-cream/60 mb-1.5 font-medium">🔥 累计销毁</div>
        <div className="text-xl font-bold text-primary">{totalBurned}</div>
        <div className="text-xs text-cny-cream/40 mt-0.5">代币</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-card/80 border border-border/50 text-center"
      >
        <div className="text-xs text-cny-cream/60 mb-1.5 font-medium">👥 本轮参与</div>
        <div className="text-xl font-bold text-foreground">{participantCount}</div>
        <div className="text-xs text-cny-cream/40 mt-0.5">人</div>
      </motion.div>
    </div>
  );
}
