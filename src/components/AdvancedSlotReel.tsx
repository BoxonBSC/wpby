import { motion, AnimatePresence } from 'framer-motion';
import { SYMBOLS, type SlotSymbol, type SymbolInfo } from '@/hooks/useAdvancedSlotMachine';
import { useEffect, useState, useRef } from 'react';

interface AdvancedSlotReelProps {
  symbols: SlotSymbol[];
  isSpinning: boolean;
  reelIndex: number;
  winningPositions: Set<string>;
  onSpinComplete?: () => void;
  isRevealing?: boolean; // 新增：是否处于揭示阶段
  shouldStop?: boolean;  // 新增：该轮是否应该停止
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
  onSpinComplete,
  isRevealing = false,
  shouldStop = false,
}: AdvancedSlotReelProps) {
  // 旋转时随机符号
  const [spinningSymbols, setSpinningSymbols] = useState<SlotSymbol[]>(symbols);
  const [localStopped, setLocalStopped] = useState(false);
  const [showStopEffect, setShowStopEffect] = useState(false);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 判断当前轮子是否应该显示旋转
  const isActuallySpinning = isSpinning && !localStopped;
  
  useEffect(() => {
    // 重置状态当新一轮旋转开始
    if (isSpinning && !isRevealing) {
      setLocalStopped(false);
      setShowStopEffect(false);
    }
  }, [isSpinning, isRevealing]);
  
  useEffect(() => {
    // 当收到停止信号时，执行停止动画
    if (shouldStop && !localStopped && isRevealing) {
      // 延迟停止，产生递进效果
      const stopDelay = reelIndex * 300; // 每个轮子延迟300ms
      
      setTimeout(() => {
        setLocalStopped(true);
        setShowStopEffect(true);
        setSpinningSymbols(symbols);
        
        // 停止效果持续一小段时间
        setTimeout(() => {
          setShowStopEffect(false);
          onSpinComplete?.();
        }, 200);
      }, stopDelay);
    }
  }, [shouldStop, localStopped, isRevealing, reelIndex, symbols, onSpinComplete]);
  
  useEffect(() => {
    if (isActuallySpinning) {
      // 开始旋转动画 - 快速切换随机符号
      const baseSpeed = 60; // 更快的基础速度
      const reelDelay = reelIndex * 15;
      
      spinIntervalRef.current = setInterval(() => {
        setSpinningSymbols([
          ALL_SYMBOL_IDS[Math.floor(Math.random() * ALL_SYMBOL_IDS.length)],
          ALL_SYMBOL_IDS[Math.floor(Math.random() * ALL_SYMBOL_IDS.length)],
          ALL_SYMBOL_IDS[Math.floor(Math.random() * ALL_SYMBOL_IDS.length)],
        ]);
      }, baseSpeed + reelDelay);
    } else {
      // 停止旋转
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
      if (!isSpinning) {
        setSpinningSymbols(symbols);
      }
    }
    
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
    };
  }, [isActuallySpinning, isSpinning, symbols, reelIndex]);
  
  const displaySymbols = isActuallySpinning ? spinningSymbols : (localStopped ? symbols : spinningSymbols);
  
  return (
    <div className="relative">
      {/* 轮子外框 */}
      <motion.div 
        animate={showStopEffect ? { 
          scale: [1, 1.05, 1],
          borderColor: ['hsl(195 100% 50% / 0.6)', 'hsl(50 100% 50% / 1)', 'hsl(280 100% 60% / 0.3)']
        } : {}}
        transition={{ duration: 0.2 }}
        className={`
          relative rounded-xl overflow-hidden
          bg-gradient-to-b from-background via-card to-background
          border-2 ${isActuallySpinning ? 'border-neon-cyan/60' : showStopEffect ? 'border-neon-yellow' : 'border-neon-purple/30'}
          shadow-[inset_0_0_30px_hsl(280_100%_60%/0.1),0_0_20px_hsl(280_100%_60%/0.2)]
          ${showStopEffect ? 'shadow-[0_0_30px_hsl(50_100%_50%/0.5)]' : ''}
          transition-colors duration-300
        `}>
        {/* 顶部渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        
        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        
        {/* 旋转时的扫描线效果 */}
        {isActuallySpinning && (
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, hsl(195 100% 50% / 0.15) 50%, transparent 100%)',
              backgroundSize: '100% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '0% 200%'],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
        
        {/* 停止时的闪光效果 */}
        <AnimatePresence>
          {showStopEffect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 pointer-events-none bg-neon-yellow/20 rounded-xl"
            />
          )}
        </AnimatePresence>
        
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
                  y: isActuallySpinning ? [0, -8, 0] : 0,
                  scale: isWinning ? [1, 1.1, 1] : showStopEffect ? [0.9, 1.05, 1] : 1,
                }}
                transition={{
                  y: {
                    duration: 0.08,
                    repeat: isActuallySpinning ? Infinity : 0,
                  },
                  scale: {
                    duration: isWinning ? 0.5 : 0.2,
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
                  ${isActuallySpinning ? 'opacity-60' : ''}
                  ${showStopEffect ? 'border-neon-yellow' : ''}
                  transition-all duration-300
                `} />
                
                {/* 符号 */}
                <motion.span 
                  className={`
                    relative z-10 text-3xl md:text-4xl
                    ${isWinning ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}
                    ${isActuallySpinning ? 'blur-[1px]' : ''}
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
      </motion.div>

      {/* 轮子编号 */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <motion.span 
          animate={showStopEffect ? { scale: [1, 1.2, 1], color: 'hsl(50 100% 50%)' } : {}}
          className="text-xs font-display text-muted-foreground"
        >
          R{reelIndex + 1}
        </motion.span>
      </div>
    </div>
  );
}
