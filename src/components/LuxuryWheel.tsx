import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Crown, Volume2, VolumeX } from 'lucide-react';
import { 
  WHEEL_SECTORS, 
  calculateSectorAngles, 
  determineWheelResult, 
  getResultRotation,
  calculateWheelPayout,
  WheelSector 
} from '@/config/wheelConfig';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/hooks/use-toast';
import { BET_LEVELS } from '@/config/contracts';

interface LuxuryWheelProps {
  prizePool: number;
  onSpin?: (result: WheelSector, payout: number) => void;
}

export function LuxuryWheel({ prizePool, onSpin }: LuxuryWheelProps) {
  const { t } = useLanguage();
  const { isConnected, connect, gameCredits } = useWallet();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSector | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedBet, setSelectedBet] = useState(BET_LEVELS[0].value);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const sectorAngles = calculateSectorAngles();
  const wheelSize = 420; // Larger wheel
  const centerX = wheelSize / 2;
  const centerY = wheelSize / 2;
  const radius = wheelSize / 2 - 15;

  // 奢华配色方案
  const luxuryColors: Record<string, { bg: string; border: string }> = {
    super_jackpot: { bg: 'hsl(45, 100%, 50%)', border: 'hsl(45, 100%, 70%)' },
    jackpot: { bg: 'hsl(280, 80%, 45%)', border: 'hsl(280, 80%, 65%)' },
    first: { bg: 'hsl(350, 85%, 45%)', border: 'hsl(350, 85%, 65%)' },
    second: { bg: 'hsl(220, 80%, 45%)', border: 'hsl(220, 80%, 65%)' },
    third: { bg: 'hsl(160, 70%, 35%)', border: 'hsl(160, 70%, 55%)' },
    small: { bg: 'hsl(30, 80%, 40%)', border: 'hsl(30, 80%, 60%)' },
    consolation: { bg: 'hsl(200, 30%, 35%)', border: 'hsl(200, 30%, 55%)' },
    none: { bg: 'hsl(0, 0%, 15%)', border: 'hsl(0, 0%, 30%)' },
  };

  const handleSpin = async () => {
    if (!isConnected) {
      toast({
        title: '请先连接钱包',
        description: '需要连接钱包才能开始游戏',
        variant: 'destructive',
      });
      return;
    }

    if (gameCredits < selectedBet) {
      toast({
        title: '凭证不足',
        description: '请先充值游戏凭证',
        variant: 'destructive',
      });
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    const randomValue = Math.random();
    const wheelResult = determineWheelResult(randomValue);
    const targetRotation = getResultRotation(wheelResult);
    
    setRotation(prev => prev + targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(wheelResult);
      setShowResult(true);
      
      const payout = calculateWheelPayout(wheelResult, prizePool);
      onSpin?.(wheelResult, payout);
      
      if (wheelResult.type !== 'none') {
        toast({
          title: `${wheelResult.emoji} ${wheelResult.name}!`,
          description: payout > 0 
            ? `恭喜获得 ${payout.toFixed(4)} BNB!`
            : '恭喜中奖！',
        });
      }
    }, 6000);
  };

  const createSectorPath = (startAngle: number, endAngle: number): string => {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (startAngle: number, endAngle: number) => {
    const midAngle = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180;
    const textRadius = radius * 0.68;
    return {
      x: centerX + textRadius * Math.cos(midAngle),
      y: centerY + textRadius * Math.sin(midAngle),
      rotation: (startAngle + endAngle) / 2,
    };
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* 装饰光效 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-primary/20 via-transparent to-transparent blur-2xl" />
      </div>

      {/* 转盘容器 */}
      <div className="relative" style={{ width: wheelSize + 40, height: wheelSize + 40 }}>
        {/* 外圈装饰 - 金色边框 */}
        <div 
          className="absolute inset-0 rounded-full gold-pulse"
          style={{
            background: `conic-gradient(
              from 0deg,
              hsl(45, 100%, 50%),
              hsl(45, 100%, 30%),
              hsl(45, 100%, 50%),
              hsl(45, 100%, 30%),
              hsl(45, 100%, 50%),
              hsl(45, 100%, 30%),
              hsl(45, 100%, 50%),
              hsl(45, 100%, 30%),
              hsl(45, 100%, 50%)
            )`,
            padding: '6px',
          }}
        >
          <div className="w-full h-full rounded-full bg-background" />
        </div>

        {/* 灯泡装饰 */}
        <div className="absolute inset-0">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 - 90) * Math.PI / 180;
            const r = (wheelSize + 40) / 2 - 3;
            const x = (wheelSize + 40) / 2 + r * Math.cos(angle);
            const y = (wheelSize + 40) / 2 + r * Math.sin(angle);
            return (
              <motion.div
                key={i}
                animate={{
                  opacity: isSpinning ? [0.3, 1, 0.3] : 0.6,
                  scale: isSpinning ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.05,
                  repeat: isSpinning ? Infinity : 0,
                }}
                className="absolute w-2 h-2 rounded-full bg-primary"
                style={{
                  left: x - 4,
                  top: y - 4,
                  boxShadow: '0 0 10px hsl(45 100% 50% / 0.8)',
                }}
              />
            );
          })}
        </div>

        {/* 指针 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            animate={isSpinning ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <svg width="40" height="50" viewBox="0 0 40 50">
              <defs>
                <linearGradient id="pointerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(45, 100%, 70%)" />
                  <stop offset="50%" stopColor="hsl(45, 100%, 50%)" />
                  <stop offset="100%" stopColor="hsl(45, 80%, 35%)" />
                </linearGradient>
                <filter id="pointerGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <polygon 
                points="20,45 5,5 20,15 35,5" 
                fill="url(#pointerGrad)"
                stroke="hsl(45, 100%, 70%)"
                strokeWidth="2"
                filter="url(#pointerGlow)"
              />
            </svg>
          </motion.div>
        </div>

        {/* 转盘 SVG */}
        <motion.div
          ref={wheelRef}
          animate={{ rotate: rotation }}
          transition={{ 
            duration: 6, 
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="absolute"
          style={{ top: 20, left: 20 }}
        >
          <svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
            <defs>
              <filter id="sectorShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
              </filter>
            </defs>
            
            {/* 扇区 */}
            {sectorAngles.map(({ start, end, sector }) => {
              const textPos = getTextPosition(start, end);
              const colors = luxuryColors[sector.type];
              const isWinning = result?.type === sector.type && showResult;
              
              return (
                <g key={sector.type}>
                  <defs>
                    <linearGradient id={`grad-${sector.type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={colors.border} />
                      <stop offset="50%" stopColor={colors.bg} />
                      <stop offset="100%" stopColor={colors.bg} stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  
                  <path
                    d={createSectorPath(start, end)}
                    fill={`url(#grad-${sector.type})`}
                    stroke="hsl(45, 100%, 50%)"
                    strokeWidth="1.5"
                    filter="url(#sectorShadow)"
                    className={isWinning ? 'animate-pulse' : ''}
                    style={{
                      filter: isWinning 
                        ? `drop-shadow(0 0 30px ${colors.border})` 
                        : undefined,
                    }}
                  />
                  
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                    className="fill-white font-display"
                    style={{ 
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      fontSize: sector.type === 'none' ? '11px' : '12px',
                      fontWeight: '600',
                    }}
                  >
                    <tspan x={textPos.x} dy="-0.6em" fontSize="18">{sector.emoji}</tspan>
                    <tspan x={textPos.x} dy="1.4em">{sector.name}</tspan>
                  </text>
                </g>
              );
            })}
            
            {/* 中心装饰 */}
            <circle
              cx={centerX}
              cy={centerY}
              r={45}
              fill="url(#centerGrad)"
              stroke="hsl(45, 100%, 60%)"
              strokeWidth="3"
            />
            <defs>
              <radialGradient id="centerGrad">
                <stop offset="0%" stopColor="hsl(0, 0%, 15%)" />
                <stop offset="100%" stopColor="hsl(0, 0%, 5%)" />
              </radialGradient>
            </defs>
            <text
              x={centerX}
              y={centerY - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-primary font-display text-sm font-bold"
            >
              FORTUNE
            </text>
            <text
              x={centerX}
              y={centerY + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-primary font-display text-lg"
            >
              🎰
            </text>
          </svg>
        </motion.div>

        {/* 旋转光效 */}
        <AnimatePresence>
          {isSpinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full pointer-events-none spin-glow"
            />
          )}
        </AnimatePresence>
      </div>

      {/* 奖池显示 */}
      <motion.div 
        className="mt-8 text-center"
        animate={isSpinning ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <div className="text-sm text-muted-foreground uppercase tracking-widest mb-1">
          Prize Pool
        </div>
        <div className="text-5xl font-display text-shimmer">
          {prizePool.toFixed(2)} BNB
        </div>
      </motion.div>

      {/* 下注选择 */}
      <div className="mt-6 flex items-center gap-3 flex-wrap justify-center">
        {BET_LEVELS.map((bet) => (
          <motion.button
            key={bet.value}
            onClick={() => setSelectedBet(bet.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSpinning}
            className={`
              px-4 py-2 rounded-lg font-display text-sm transition-all
              ${selectedBet === bet.value
                ? 'bg-primary/30 border-2 border-primary text-primary shadow-[0_0_20px_hsl(45_100%_50%/0.4)]'
                : 'bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }
            `}
          >
            <div className="font-bold">{bet.label}</div>
            <div className="text-xs opacity-70">{bet.multiplier}</div>
          </motion.button>
        ))}
      </div>

      {/* 旋转按钮 */}
      <motion.button
        onClick={isConnected ? handleSpin : () => connect()}
        disabled={isSpinning}
        whileHover={{ scale: isSpinning ? 1 : 1.03 }}
        whileTap={{ scale: isSpinning ? 1 : 0.97 }}
        className="mt-8 luxury-button min-w-[280px] text-xl disabled:opacity-50"
      >
        {isSpinning ? (
          <span className="flex items-center justify-center gap-3">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.span>
            旋转中...
          </span>
        ) : isConnected ? (
          <span className="flex items-center justify-center gap-3">
            <Crown className="w-6 h-6" />
            开始旋转
          </span>
        ) : (
          '连接钱包开始游戏'
        )}
      </motion.button>

      {/* 中奖弹窗 */}
      <AnimatePresence>
        {showResult && result && result.type !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-md"
            onClick={() => setShowResult(false)}
          >
            {/* 粒子效果 */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: '50%', 
                  y: '50%', 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                }}
                className="absolute text-3xl"
              >
                {['💰', '⭐', '✨', '👑', '💎'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}

            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="luxury-card p-10 text-center max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-7xl mb-6"
              >
                {result.emoji}
              </motion.div>
              <h3 className="text-3xl font-display text-shimmer mb-4">
                {result.name}
              </h3>
              <div className="text-5xl font-display text-primary mb-4">
                +{calculateWheelPayout(result, prizePool).toFixed(4)}
              </div>
              <div className="text-2xl font-display text-primary/80 mb-6">BNB</div>
              <p className="text-muted-foreground text-sm mb-8">
                奖池 {(result.poolPercent * 100).toFixed(1)}%
              </p>
              <button
                onClick={() => setShowResult(false)}
                className="luxury-button px-10 py-3"
              >
                继续游戏
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
