import { memo, useEffect, useState, useRef, useCallback, useMemo } from 'react';
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

const ALL_SYMBOL_IDS: SlotSymbol[] = ['seven', 'diamond', 'crown', 'bell', 'star', 'cherry', 'lemon', 'orange', 'grape', 'clover'];

const rarityGlow: Record<string, string> = {
  legendary: 'shadow-[0_0_12px_hsl(50_100%_50%/0.4)]',
  epic: 'shadow-[0_0_10px_hsl(280_100%_60%/0.3)]',
  rare: 'shadow-[0_0_8px_hsl(195_100%_50%/0.3)]',
  common: '',
};

const rarityBorder: Record<string, string> = {
  legendary: 'border-neon-yellow/60',
  epic: 'border-neon-purple/50',
  rare: 'border-neon-cyan/40',
  common: 'border-border/50',
};

// 生成用于滚动的符号带 - 包含足够多的符号以实现平滑滚动
const generateSymbolStrip = (finalSymbols: SlotSymbol[], stripLength: number = 20): SlotSymbol[] => {
  const strip: SlotSymbol[] = [];
  // 填充随机符号
  for (let i = 0; i < stripLength - 3; i++) {
    strip.push(ALL_SYMBOL_IDS[Math.floor(Math.random() * ALL_SYMBOL_IDS.length)]);
  }
  // 最后3个是最终要显示的符号
  strip.push(...finalSymbols);
  return strip;
};

// 单个符号渲染 - 极简化以提升性能
const SymbolCell = memo(function SymbolCell({ 
  symbolId, 
  isBlurred,
  isWinning,
  showLanding,
}: { 
  symbolId: SlotSymbol; 
  isBlurred: boolean;
  isWinning: boolean;
  showLanding: boolean;
}) {
  const symbolInfo = getSymbolInfo(symbolId);
  
  return (
    <div
      className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0"
    >
      <div className={`
        absolute inset-1 rounded-lg
        bg-gradient-to-br from-muted/60 to-muted/30
        border ${rarityBorder[symbolInfo.rarity]}
        ${rarityGlow[symbolInfo.rarity]}
        ${isWinning ? 'animate-pulse border-neon-yellow shadow-[0_0_25px_hsl(50_100%_50%/0.7)]' : ''}
        ${showLanding ? 'border-neon-cyan shadow-[0_0_20px_hsl(195_100%_50%/0.5)]' : ''}
        transition-shadow duration-150
      `} />
      
      <span 
        className={`
          relative z-10 text-3xl md:text-4xl select-none
          ${isBlurred ? 'blur-[1px] opacity-70' : ''}
          ${isWinning ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] animate-bounce' : ''}
          ${showLanding ? 'scale-110' : ''}
          transition-all duration-100
        `}
      >
        {symbolInfo.emoji}
      </span>

      {isWinning && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-yellow/20 via-transparent to-neon-yellow/20 animate-pulse" />
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
  // 动画状态
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'stopping' | 'landed'>('idle');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [symbolStrip, setSymbolStrip] = useState<SlotSymbol[]>(symbols);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const SYMBOL_HEIGHT = 64; // 对应 h-16
  const VISIBLE_SYMBOLS = 3;
  const STRIP_LENGTH = 25;
  
  // 计算当前可见的符号
  const visibleSymbols = useMemo(() => {
    if (phase === 'idle' || phase === 'landed') {
      return symbols;
    }
    
    const startIndex = Math.floor(scrollOffset / SYMBOL_HEIGHT) % symbolStrip.length;
    const result: SlotSymbol[] = [];
    for (let i = 0; i < VISIBLE_SYMBOLS; i++) {
      const idx = (startIndex + i) % symbolStrip.length;
      result.push(symbolStrip[idx]);
    }
    return result;
  }, [phase, scrollOffset, symbolStrip, symbols]);
  
  // 开始旋转
  useEffect(() => {
    if (isSpinning && !isRevealing && phase === 'idle') {
      // 生成新的符号带
      const newStrip = generateSymbolStrip(symbols, STRIP_LENGTH);
      setSymbolStrip(newStrip);
      setPhase('spinning');
      velocityRef.current = 15 + reelIndex * 2; // 初始速度，每个轮子略有不同
    }
  }, [isSpinning, isRevealing, phase, symbols, reelIndex]);
  
  // 处理停止信号
  useEffect(() => {
    if (shouldStop && phase === 'spinning' && isRevealing) {
      const stopDelay = reelIndex * 300; // 依次停止的延迟
      
      stopTimeoutRef.current = setTimeout(() => {
        // 重新生成符号带，确保最终符号正确
        const newStrip = generateSymbolStrip(symbols, STRIP_LENGTH);
        setSymbolStrip(newStrip);
        setPhase('stopping');
      }, stopDelay);
    }
    
    return () => {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
    };
  }, [shouldStop, phase, isRevealing, reelIndex, symbols]);
  
  // 主动画循环
  useEffect(() => {
    if (phase === 'idle' || phase === 'landed') {
      return;
    }
    
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16.67; // 标准化到60fps
      lastTime = currentTime;
      
      if (phase === 'spinning') {
        // 匀速旋转
        setScrollOffset(prev => prev + velocityRef.current * deltaTime);
      } else if (phase === 'stopping') {
        // 减速到停止
        velocityRef.current *= 0.92; // 减速系数
        setScrollOffset(prev => prev + velocityRef.current * deltaTime);
        
        if (velocityRef.current < 0.5) {
          // 停止动画，显示最终结果
          setPhase('landed');
          velocityRef.current = 0;
          
          // 触发完成回调
          setTimeout(() => {
            onSpinComplete?.();
            // 短暂延迟后重置为idle
            setTimeout(() => {
              setPhase('idle');
              setScrollOffset(0);
            }, 100);
          }, 150);
          
          return;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, onSpinComplete]);
  
  // 重置状态当 isSpinning 变为 false
  useEffect(() => {
    if (!isSpinning && !isRevealing) {
      setPhase('idle');
      setScrollOffset(0);
      velocityRef.current = 0;
    }
  }, [isSpinning, isRevealing]);
  
  const isAnimating = phase === 'spinning' || phase === 'stopping';
  const showLandingEffect = phase === 'landed';
  
  return (
    <div className="relative">
      {/* 轮子外框 */}
      <div 
        ref={containerRef}
        className={`
          relative rounded-xl overflow-hidden
          bg-gradient-to-b from-background via-card to-background
          border-2 
          ${isAnimating ? 'border-neon-cyan/70 shadow-[0_0_25px_hsl(195_100%_50%/0.4)]' : ''}
          ${showLandingEffect ? 'border-neon-yellow shadow-[0_0_35px_hsl(50_100%_50%/0.6)] scale-[1.03]' : ''}
          ${!isAnimating && !showLandingEffect ? 'border-neon-purple/30 shadow-[inset_0_0_20px_hsl(280_100%_60%/0.1)]' : ''}
          transition-all duration-200 ease-out
        `}
        style={{ 
          willChange: isAnimating ? 'transform' : 'auto',
          transform: showLandingEffect ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        {/* 顶部渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background via-background/80 to-transparent z-10 pointer-events-none" />
        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none" />
        
        {/* 旋转时的动态光效 */}
        {isAnimating && (
          <>
            <div 
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, 
                  transparent 0%, 
                  hsl(195 100% 50% / 0.08) 30%, 
                  hsl(195 100% 50% / 0.15) 50%, 
                  hsl(195 100% 50% / 0.08) 70%, 
                  transparent 100%)`,
                animation: 'scan-line 0.8s linear infinite',
              }}
            />
            {/* 侧边光效 */}
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-neon-cyan/40 to-transparent z-20" />
            <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-neon-cyan/40 to-transparent z-20" />
          </>
        )}
        
        {/* 停止闪光 */}
        {showLandingEffect && (
          <div 
            className="absolute inset-0 z-30 pointer-events-none rounded-xl"
            style={{
              background: 'radial-gradient(circle at center, hsl(50 100% 50% / 0.25) 0%, transparent 70%)',
              animation: 'flash 0.3s ease-out',
            }}
          />
        )}
        
        {/* 符号容器 */}
        <div 
          className="flex flex-col"
          style={{
            transform: isAnimating 
              ? `translateY(${-(scrollOffset % SYMBOL_HEIGHT)}px)` 
              : 'translateY(0)',
            transition: isAnimating ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {visibleSymbols.map((symbolId, rowIndex) => {
            const posKey = `${reelIndex}-${rowIndex}`;
            const isWinning = winningPositions.has(posKey) && !isAnimating;
            
            return (
              <SymbolCell
                key={`${rowIndex}-${symbolId}`}
                symbolId={symbolId}
                isBlurred={isAnimating && phase === 'spinning'}
                isWinning={isWinning}
                showLanding={showLandingEffect}
              />
            );
          })}
        </div>
      </div>

      {/* 轮子编号指示器 */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <span 
          className={`
            text-xs font-display transition-all duration-200
            ${showLandingEffect ? 'text-neon-yellow scale-125' : ''}
            ${isAnimating ? 'text-neon-cyan' : 'text-muted-foreground'}
          `}
        >
          R{reelIndex + 1}
        </span>
      </div>
      
      {/* 旋转状态指示点 */}
      {isAnimating && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_10px_hsl(195_100%_50%/0.8)]" />
        </div>
      )}
    </div>
  );
}

export const AdvancedSlotReel = memo(AdvancedSlotReelInner);
