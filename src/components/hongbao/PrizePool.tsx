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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center"
      >
        <div className="text-xs text-muted-foreground mb-1">🧧 普通红包池</div>
        <div className="text-xl sm:text-2xl font-bold text-cny-gold gold-shimmer">
          {normalPool.toFixed(4)}
        </div>
        <div className="text-xs text-muted-foreground">BNB</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-cny-gold/5 border border-cny-gold/20 text-center"
      >
        <div className="text-xs text-muted-foreground mb-1">🔥 幸运红包池</div>
        <div className="text-xl sm:text-2xl font-bold text-cny-gold gold-shimmer">
          {luckyPool.toFixed(4)}
        </div>
        <div className="text-xs text-muted-foreground">BNB</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-card border border-border text-center"
      >
        <div className="text-xs text-muted-foreground mb-1">🔥 累计销毁</div>
        <div className="text-lg font-bold text-primary">{totalBurned}</div>
        <div className="text-xs text-muted-foreground">代币</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-card border border-border text-center"
      >
        <div className="text-xs text-muted-foreground mb-1">👥 本轮参与</div>
        <div className="text-lg font-bold text-foreground">{participantCount}</div>
        <div className="text-xs text-muted-foreground">人</div>
      </motion.div>
    </div>
  );
}
