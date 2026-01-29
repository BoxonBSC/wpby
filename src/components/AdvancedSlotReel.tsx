import { memo, useEffect, useState, useRef, useCallback } from 'react';
import { SYMBOLS, type SlotSymbol, type SymbolInfo } from '@/hooks/useAdvancedSlotMachine';

interface AdvancedSlotReelProps {
  symbols: SlotSymbol[];
  isSpinning: boolean;
  reelIndex: number;
  winningPositions: Set<string>;
  onSpinComplete?: () => void;
  isRevealing?: boolean;
  shouldStop?: boolean;
}

const getSymbolInfo = (id: SlotSymbol): SymbolInfo => {
  return SYMBOLS.find(s => s.id === id) || SYMBOLS[0];
};

const ALL_SYMBOL_IDS: SlotSymbol[] = ['seven', 'diamond', 'crown', 'bell', 'star', 'cherry', 'lemon', 'grape', 'watermelon', 'clover'];

const rarityBorder: Record<string, string> = {
  legendary: 'border-neon-yellow',
  epic: 'border-neon-purple',
  rare: 'border-neon-cyan',
  common: 'border-border',
};

// 预生成随机符号序列以减少运行时计算
const generateRandomSymbols = (): SlotSymbol[] => [
  ALL_SYMBOL_IDS[Math.floor(Math.random() * ALL_SYMBOL_IDS.length)],
  ALL_SYMBOL_IDS[Math.floor(Math.random() * ALL_SYMBOL_IDS.length)],
  ALL_SYMBOL_IDS[Math.floor(Math.random() * ALL_SYMBOL_IDS.length)],
];

// 符号单元格组件 - 纯展示，使用 memo 优化
const SymbolCell = memo(function SymbolCell({ 
  symbolId, 
  isSpinning,
  isWinning,
  showStopEffect,
}: { 
  symbolId: SlotSymbol; 
  isSpinning: boolean;
  isWinning: boolean;
  showStopEffect: boolean;
}) {
  const symbolInfo = getSymbolInfo(symbolId);
  
  return (
    <div
      className={`
        relative w-16 h-16 md:w-20 md:h-20 
        flex items-center justify-center
        ${isWinning ? 'z-20' : 'z-0'}
      `}
      style={{ willChange: isSpinning ? 'transform' : 'auto' }}
    >
      {/* 符号背景 */}
      <div className={`
        absolute inset-1 rounded-lg
        bg-gradient-to-br from-muted/50 to-muted/20
        border ${rarityBorder[symbolInfo.rarity]}
        ${isWinning ? 'animate-pulse shadow-[0_0_20px_hsl(50_100%_50%/0.6)]' : ''}
        ${isSpinning ? 'opacity-60' : ''}
        ${showStopEffect ? 'border-neon-yellow shadow-[0_0_15px_hsl(50_100%_50%/0.5)]' : ''}
        transition-all duration-200
      `} />
      
      {/* 符号 */}
      <span 
        className={`
          relative z-10 text-3xl md:text-4xl select-none
          ${isWinning ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-bounce' : ''}
          ${isSpinning ? 'blur-[0.5px]' : ''}
          transition-all duration-150
        `}
      >
        {symbolInfo.emoji}
      </span>

      {/* 中奖闪光效果 - 使用 CSS 动画 */}
      {isWinning && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-yellow/30 via-transparent to-neon-yellow/30 animate-pulse" />
      )}
    </div>
  );
});

function AdvancedSlotReelInner({ 
  symbols, 
  isSpinning, 
  reelIndex,
  winningPositions,
  onSpinComplete,
  isRevealing = false,
  shouldStop = false,
}: AdvancedSlotReelProps) {
  const [spinningSymbols, setSpinningSymbols] = useState<SlotSymbol[]>(symbols);
  const [localStopped, setLocalStopped] = useState(false);
  const [showStopEffect, setShowStopEffect] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const isActuallySpinning = isSpinning && !localStopped;
  
  // 重置状态
  useEffect(() => {
    if (isSpinning && !isRevealing) {
      setLocalStopped(false);
      setShowStopEffect(false);
    }
  }, [isSpinning, isRevealing]);
  
  // 停止动画处理
  useEffect(() => {
    if (shouldStop && !localStopped && isRevealing) {
      const stopDelay = reelIndex * 250;
      
      stopTimeoutRef.current = setTimeout(() => {
        setLocalStopped(true);
        setShowStopEffect(true);
        setSpinningSymbols(symbols);
        
        setTimeout(() => {
          setShowStopEffect(false);
          onSpinComplete?.();
        }, 150);
      }, stopDelay);
    }
    
    return () => {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
    };
  }, [shouldStop, localStopped, isRevealing, reelIndex, symbols, onSpinComplete]);
  
  // 使用 requestAnimationFrame 进行流畅的旋转动画
  const animate = useCallback((timestamp: number) => {
    const interval = 70 + reelIndex * 10; // 每个轮子稍微不同的速度
    
    if (timestamp - lastUpdateRef.current >= interval) {
      setSpinningSymbols(generateRandomSymbols());
      lastUpdateRef.current = timestamp;
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [reelIndex]);
  
  useEffect(() => {
    if (isActuallySpinning) {
      lastUpdateRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (!isSpinning) {
        setSpinningSymbols(symbols);
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActuallySpinning, isSpinning, symbols, animate]);
  
  const displaySymbols = isActuallySpinning ? spinningSymbols : (localStopped ? symbols : spinningSymbols);
  
  return (
    <div className="relative">
      {/* 轮子外框 - 使用 CSS transition 而非 framer-motion */}
      <div 
        className={`
          relative rounded-xl overflow-hidden
          bg-gradient-to-b from-background via-card to-background
          border-2 
          ${isActuallySpinning ? 'border-neon-cyan/60 shadow-[0_0_20px_hsl(195_100%_50%/0.3)]' : ''}
          ${showStopEffect ? 'border-neon-yellow shadow-[0_0_30px_hsl(50_100%_50%/0.5)] scale-[1.02]' : ''}
          ${!isActuallySpinning && !showStopEffect ? 'border-neon-purple/30 shadow-[inset_0_0_30px_hsl(280_100%_60%/0.1)]' : ''}
          transition-all duration-200
        `}
        style={{ willChange: isActuallySpinning ? 'transform, box-shadow' : 'auto' }}
      >
        {/* 顶部/底部渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        
        {/* 旋转时的扫描线 - 使用 CSS animation */}
        {isActuallySpinning && (
          <div 
            className="absolute inset-0 z-20 pointer-events-none animate-scan-line"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, hsl(195 100% 50% / 0.12) 50%, transparent 100%)',
            }}
          />
        )}
        
        {/* 停止闪光 */}
        {showStopEffect && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-neon-yellow/15 rounded-xl animate-flash" />
        )}
        
        {/* 符号容器 */}
        <div className="flex flex-col">
          {displaySymbols.map((symbolId, rowIndex) => {
            const posKey = `${reelIndex}-${rowIndex}`;
            const isWinning = winningPositions.has(posKey);
            
            return (
              <SymbolCell
                key={rowIndex}
                symbolId={symbolId}
                isSpinning={isActuallySpinning}
                isWinning={isWinning}
                showStopEffect={showStopEffect}
              />
            );
          })}
        </div>
      </div>

      {/* 轮子编号 */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <span 
          className={`
            text-xs font-display transition-all duration-200
            ${showStopEffect ? 'text-neon-yellow scale-110' : 'text-muted-foreground'}
          `}
        >
          R{reelIndex + 1}
        </span>
      </div>
    </div>
  );
}

// 使用 memo 包装整个组件
export const AdvancedSlotReel = memo(AdvancedSlotReelInner);
