import { motion } from 'framer-motion';
import { SpinResult } from '@/hooks/useAdvancedSlotMachine';
import { Trophy, Sparkles, Zap, Crown, Star } from 'lucide-react';

interface WinDisplayProps {
  result: SpinResult;
  prizePool: number;
}

export function WinDisplay({ result }: WinDisplayProps) {
  const prizeLabels = {
    jackpot: { title: '🎰 JACKPOT 🎰', subtitle: '超级大奖', color: 'text-neon-yellow' },
    second: { title: '👑 二等奖 👑', subtitle: '大奖', color: 'text-neon-purple' },
    small: { title: '⭐ 中奖 ⭐', subtitle: '小奖', color: 'text-neon-cyan' },
    none: { title: '', subtitle: '', color: '' },
  };
  
  const prizeInfo = prizeLabels[result.prizeType];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -50 }}
      className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
    >
      {/* 背景模糊 */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-2xl" />
      
      {/* 粒子效果 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 0,
            opacity: 1 
          }}
          animate={{ 
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 200,
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
          }}
          transition={{ 
            duration: 2,
            delay: Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
          className="absolute text-2xl"
        >
          {['⭐', '💎', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}
      
      {/* 主要内容 */}
      <motion.div
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative z-10 text-center"
      >
        {/* 奖励标题 */}
        {result.prizeType === 'jackpot' ? (
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -2, 2, 0],
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="mb-4"
          >
            <h3 className="text-4xl md:text-6xl font-display text-neon-yellow 
              drop-shadow-[0_0_30px_hsl(50_100%_50%/0.8)]">
              {prizeInfo.title}
            </h3>
          </motion.div>
        ) : result.prizeType === 'second' ? (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="mb-4 flex items-center justify-center gap-2"
          >
            <Crown className="w-8 h-8 text-neon-purple" />
            <h3 className="text-2xl md:text-4xl font-display neon-text-purple">
              {prizeInfo.title}
            </h3>
            <Crown className="w-8 h-8 text-neon-purple" />
          </motion.div>
        ) : (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="mb-4 flex items-center justify-center gap-2"
          >
            <Star className="w-6 h-6 text-neon-cyan" />
            <h3 className="text-2xl md:text-3xl font-display neon-text-cyan">
              {prizeInfo.title}
            </h3>
            <Star className="w-6 h-6 text-neon-cyan" />
          </motion.div>
        )}

        {/* 中奖金额 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="mb-4"
        >
          <div className="text-5xl md:text-7xl font-display text-neon-green
            drop-shadow-[0_0_20px_hsl(150_100%_50%/0.6)]">
            +{result.bnbWin.toFixed(4)}
          </div>
          <div className="text-xl text-neon-green/80 font-display">BNB</div>
        </motion.div>

        {/* 详细信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center gap-2 text-foreground">
            <Sparkles className="w-4 h-4 text-neon-purple" />
            <span>{result.winLines.length} 条赔付线中奖</span>
          </div>
          
          {result.multiplier > 1 && (
            <div className="flex items-center justify-center gap-2 text-neon-orange">
              <Zap className="w-4 h-4" />
              <span className="font-display">{result.multiplier}x 倍数奖励！</span>
            </div>
          )}

          {/* 中奖线详情 */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {result.winLines.slice(0, 5).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="px-3 py-1 rounded-full bg-muted/50 border border-border text-sm"
              >
                <span className="mr-1">{line.symbol.emoji}</span>
                <span className="text-muted-foreground">×{line.count}</span>
              </motion.div>
            ))}
            {result.winLines.length > 5 && (
              <div className="px-3 py-1 rounded-full bg-muted/50 border border-border text-sm text-muted-foreground">
                +{result.winLines.length - 5} 更多
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
