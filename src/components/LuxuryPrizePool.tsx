import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

interface LuxuryPrizePoolProps {
  prizePool: number;
}

export function LuxuryPrizePool({ prizePool }: LuxuryPrizePoolProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-2xl" />
      
      <div className="relative text-center py-6 px-8 rounded-2xl bg-black/40 backdrop-blur-sm border border-primary/20">
        {/* 装饰角 */}
        <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-primary/50 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-primary/50 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-primary/50 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-primary/50 rounded-br-lg" />

        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase font-display">
            Grand Prize Pool
          </span>
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        </div>

        <motion.div
          animate={{
            textShadow: [
              '0 0 20px hsl(45 100% 50% / 0.3)',
              '0 0 40px hsl(45 100% 50% / 0.5)',
              '0 0 20px hsl(45 100% 50% / 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl md:text-6xl font-display text-shimmer"
        >
          {prizePool.toFixed(2)}
          <span className="text-2xl ml-2 text-primary">BNB</span>
        </motion.div>

        <div className="flex items-center justify-center gap-1 mt-3 text-xs text-emerald-400">
          <TrendingUp className="w-3 h-3" />
          <span>每次旋转持续增长</span>
        </div>
      </div>
    </motion.div>
  );
}
