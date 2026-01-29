import { motion, AnimatePresence } from 'framer-motion';
import { SYMBOLS, type SlotSymbol, type SymbolInfo } from '@/hooks/useAdvancedSlotMachine';
import { useEffect, useState, useRef } from 'react';

interface AdvancedSlotReelProps {
  symbols: SlotSymbol[];
  isSpinning: boolean;
  reelIndex: number;
  winningPositions: Set<string>;
  onSpinComplete?: () => void;
}

const getSymbolInfo = (id: SlotSymbol): SymbolInfo => {
  return SYMBOLS.find(s => s.id === id) || SYMBOLS[0];
};

const ALL_SYMBOL_IDS: SlotSymbol[] = ['seven', 'diamond', 'crown', 'bell', 'star', 'cherry', 'lemon', 'grape', 'watermelon', 'clover'];

const rarityGlow: Record<string, string> = {
  legendary: 'shadow-[0_0_20px_hsl(50_100%_50%/0.8),0_0_40px_hsl(50_100%_50%/0.4)]',
  epic: 'shadow-[0_0_15px_hsl(280_100%_60%/0.6),0_0_30px_hsl(280_100%_60%/0.3)]',
  rare: 'shadow-[0_0_10px_hsl(195_100%_50%/0.5),0_0_20px_hsl(195_100%_50%/0.2)]',
  common: '',
};

const rarityBorder: Record<string, string> = {
  legendary: 'border-neon-yellow',
  epic: 'border-neon-purple',
  rare: 'border-neon-cyan',
  common: 'border-border',
};

export function AdvancedSlotReel({ 
  symbols, 
  isSpinning, 
  reelIndex,
  winningPositions,
}: AdvancedSlotReelProps) {
  // 旋转时随机符号
  const [spinningSymbols, setSpinningSymbols] = useState<SlotSymbol[]>(symbols);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (isSpinning) {
      // 开始旋转动画 - 快速切换随机符号
      const baseSpeed = 80; // 基础速度 ms
      const reelDelay = reelIndex * 20; // 每个轮子有轻微延迟差
      
      spinIntervalRef.current = setInterval(() => {
        setSpinningSymbols([
          ALL_SYMBOL_IDS[Math.floor(Math.random() * ALL_SYMBOL_IDS.length)],
          ALL_SYMBOL_IDS[Math.floor(Math.random() * ALL_SYMBOL_IDS.length)],
          ALL_SYMBOL_IDS[Math.floor(Math.random() * ALL_SYMBOL_IDS.length)],
        ]);
      }, baseSpeed + reelDelay);
    } else {
      // 停止旋转，显示实际结果
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
      setSpinningSymbols(symbols);
    }
    
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
    };
  }, [isSpinning, symbols, reelIndex]);
  
  const displaySymbols = isSpinning ? spinningSymbols : symbols;
  
  return (
    <div className="relative">
      {/* 轮子外框 */}
      <div className={`
        relative rounded-xl overflow-hidden
        bg-gradient-to-b from-background via-card to-background
        border-2 ${isSpinning ? 'border-neon-cyan/60' : 'border-neon-purple/30'}
        shadow-[inset_0_0_30px_hsl(280_100%_60%/0.1),0_0_20px_hsl(280_100%_60%/0.2)]
        transition-colors duration-300
      `}>
        {/* 顶部渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        
        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        
        {/* 旋转时的扫描线效果 */}
        {isSpinning && (
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, hsl(195 100% 50% / 0.1) 50%, transparent 100%)',
              backgroundSize: '100% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '0% 200%'],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
        
        {/* 符号容器 */}
        <div className="flex flex-col">
          {displaySymbols.map((symbolId, rowIndex) => {
            const symbolInfo = getSymbolInfo(symbolId);
            const posKey = `${reelIndex}-${rowIndex}`;
            const isWinning = winningPositions.has(posKey);
            
            return (
              <motion.div
                key={`${reelIndex}-${rowIndex}`}
                animate={{ 
                  y: isSpinning ? [0, -5, 0] : 0,
                  scale: isWinning ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  y: {
                    duration: 0.1,
                    repeat: isSpinning ? Infinity : 0,
                  },
                  scale: {
                    duration: 0.5,
                    repeat: isWinning ? Infinity : 0,
                  }
                }}
                className={`
                  relative w-16 h-16 md:w-20 md:h-20 
                  flex items-center justify-center
                  ${isWinning ? 'z-20' : 'z-0'}
                `}
              >
                {/* 符号背景 */}
                <div className={`
                  absolute inset-1 rounded-lg
                  bg-gradient-to-br from-muted/50 to-muted/20
                  border ${rarityBorder[symbolInfo.rarity]}
                  ${isWinning ? `${rarityGlow[symbolInfo.rarity]} animate-pulse` : ''}
                  ${isSpinning ? 'opacity-70' : ''}
                  transition-all duration-300
                `} />
                
                {/* 符号 */}
                <motion.span 
                  className={`
                    relative z-10 text-3xl md:text-4xl
                    ${isWinning ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}
                    ${isSpinning ? 'blur-[0.5px]' : ''}
                  `}
                  animate={isWinning ? {
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: isWinning ? Infinity : 0,
                  }}
                >
                  {symbolInfo.emoji}
                </motion.span>

                {/* 中奖闪光效果 */}
                <AnimatePresence>
                  {isWinning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.5, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-yellow/30 via-transparent to-neon-yellow/30"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 轮子编号 */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <span className="text-xs font-display text-muted-foreground">
          R{reelIndex + 1}
        </span>
      </div>
    </div>
  );
}
