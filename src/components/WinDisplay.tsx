import { motion } from 'framer-motion';
import { SpinResult, PrizeType } from '@/hooks/useAdvancedSlotMachine';
import { Sparkles, Zap, Crown, Star, Gem, Trophy } from 'lucide-react';

interface WinDisplayProps {
  result: SpinResult;
  betAmount: number;
}

// 6级奖励显示配置
const PRIZE_DISPLAY: Record<PrizeType, { 
  title: string; 
  icon: React.ReactNode;
  colorClass: string;
  glowClass: string;
  animate: boolean;
}> = {
  mega_jackpot: {
    title: '🎰 MEGA JACKPOT 🎰',
    icon: <Trophy className="w-10 h-10 text-neon-yellow" />,
    colorClass: 'text-neon-yellow',
    glowClass: 'drop-shadow-[0_0_40px_hsl(50_100%_50%/0.9)]',
    animate: true,
  },
  jackpot: {
    title: '💎 JACKPOT 💎',
    icon: <Gem className="w-8 h-8 text-neon-purple" />,
    colorClass: 'text-neon-purple',
    glowClass: 'drop-shadow-[0_0_30px_hsl(280_100%_50%/0.8)]',
    animate: true,
  },
  first: {
    title: '👑 一等奖 👑',
    icon: <Crown className="w-7 h-7 text-neon-orange" />,
    colorClass: 'text-neon-orange',
    glowClass: 'drop-shadow-[0_0_20px_hsl(30_100%_50%/0.7)]',
    animate: true,
  },
  second: {
    title: '🔔 二等奖 🔔',
    icon: <Star className="w-6 h-6 text-neon-pink" />,
    colorClass: 'text-neon-pink',
    glowClass: 'drop-shadow-[0_0_15px_hsl(330_100%_50%/0.6)]',
    animate: false,
  },
  third: {
    title: '⭐ 三等奖 ⭐',
    icon: <Star className="w-5 h-5 text-neon-cyan" />,
    colorClass: 'text-neon-cyan',
    glowClass: 'drop-shadow-[0_0_10px_hsl(195_100%_50%/0.5)]',
    animate: false,
  },
  small: {
    title: '🍀 小奖 🍀',
    icon: <Sparkles className="w-4 h-4 text-neon-green" />,
    colorClass: 'text-neon-green',
    glowClass: '',
    animate: false,
  },
  none: {
    title: '',
    icon: null,
    colorClass: '',
    glowClass: '',
    animate: false,
  },
};

export function WinDisplay({ result, betAmount }: WinDisplayProps) {
  const displayConfig = PRIZE_DISPLAY[result.prizeType];
  const isHighTier = ['mega_jackpot', 'jackpot', 'first'].includes(result.prizeType);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -50 }}
      className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
    >
      {/* 背景模糊 */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-2xl" />
      
      {/* 粒子效果 - 高等级奖励才显示 */}
      {isHighTier && Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
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
        <motion.div
          animate={displayConfig.animate ? { 
            scale: [1, 1.1, 1],
            rotate: [0, -2, 2, 0],
          } : { scale: [1, 1.03, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="mb-4 flex items-center justify-center gap-3"
        >
          {displayConfig.icon}
          <h3 className={`text-2xl md:text-4xl font-display ${displayConfig.colorClass} ${displayConfig.glowClass}`}>
            {displayConfig.title}
          </h3>
          {displayConfig.icon}
        </motion.div>

        {/* 中奖倍数和金额 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="mb-4"
        >
          <div className="text-4xl md:text-6xl font-display text-neon-yellow
            drop-shadow-[0_0_20px_hsl(50_100%_50%/0.6)]">
            {result.totalMultiplier}x
          </div>
          <div className="text-2xl md:text-3xl text-neon-green font-display mt-2">
            +{result.totalWin.toFixed(4)} BNB
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            投注 {betAmount.toFixed(4)} BNB × {result.totalMultiplier} 倍
          </div>
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
          
          {result.winLines.length >= 3 && (
            <div className="flex items-center justify-center gap-2 text-neon-orange">
              <Zap className="w-4 h-4" />
              <span className="font-display">多线连中奖励！</span>
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
                <span className="text-neon-green ml-1">({line.multiplier}x)</span>
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
