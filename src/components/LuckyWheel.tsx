import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Volume2, VolumeX } from 'lucide-react';
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
import { BetSelector } from './BetSelector';
import { BET_LEVELS } from '@/config/contracts';

interface LuckyWheelProps {
  prizePool: number;
  onSpin?: (result: WheelSector, payout: number) => void;
}

export function LuckyWheel({ prizePool, onSpin }: LuckyWheelProps) {
  const { t } = useLanguage();
  const { isConnected, connect, gameCredits } = useWallet();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelSector | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedBet, setSelectedBet] = useState(BET_LEVELS[0].value);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const sectorAngles = calculateSectorAngles();
  const wheelSize = 320;
  const centerX = wheelSize / 2;
  const centerY = wheelSize / 2;
  const radius = wheelSize / 2 - 10;

  const handleSpin = async () => {
    if (!isConnected) {
      toast({
        title: t('wallet.connectFirst'),
        description: t('wallet.connectDescription'),
        variant: 'destructive',
      });
      return;
    }

    if (gameCredits < selectedBet) {
      toast({
        title: t('game.insufficientCredits'),
        description: t('game.depositFirst'),
        variant: 'destructive',
      });
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    // 模拟VRF随机数（实际应从链上获取）
    const randomValue = Math.random();
    const wheelResult = determineWheelResult(randomValue);
    const targetRotation = getResultRotation(wheelResult);
    
    // 设置旋转
    setRotation(prev => prev + targetRotation);

    // 等待动画完成
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
    }, 5000);
  };

  // 生成扇区路径
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

  // 计算文字位置
  const getTextPosition = (startAngle: number, endAngle: number) => {
    const midAngle = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180;
    const textRadius = radius * 0.65;
    return {
      x: centerX + textRadius * Math.cos(midAngle),
      y: centerY + textRadius * Math.sin(midAngle),
      rotation: (startAngle + endAngle) / 2,
    };
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* 转盘容器 */}
      <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
        {/* 外圈装饰 */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--neon-blue)) 0%, hsl(var(--neon-purple)) 50%, hsl(var(--neon-pink)) 100%)',
            padding: '4px',
          }}
        >
          <div className="w-full h-full rounded-full bg-background" />
        </div>

        {/* 指针 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div 
            className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] 
              border-l-transparent border-r-transparent border-t-neon-yellow
              drop-shadow-[0_0_10px_hsl(50_100%_50%/0.8)]"
          />
        </div>

        {/* 转盘 SVG */}
        <motion.div
          ref={wheelRef}
          animate={{ rotate: rotation }}
          transition={{ 
            duration: 5, 
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="absolute inset-2"
        >
          <svg width="100%" height="100%" viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
            {/* 扇区 */}
            {sectorAngles.map(({ start, end, sector }, index) => {
              const textPos = getTextPosition(start, end);
              const isWinning = result?.type === sector.type && showResult;
              
              return (
                <g key={sector.type}>
                  {/* 扇区背景 */}
                  <path
                    d={createSectorPath(start, end)}
                    fill={sector.color}
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    className={isWinning ? 'animate-pulse' : ''}
                    style={{
                      filter: isWinning 
                        ? `drop-shadow(0 0 20px ${sector.glowColor})` 
                        : undefined,
                    }}
                  />
                  
                  {/* 扇区文字 */}
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                    className="fill-white font-bold text-xs"
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      fontSize: sector.type === 'none' ? '10px' : '11px',
                    }}
                  >
                    <tspan x={textPos.x} dy="-0.5em">{sector.emoji}</tspan>
                    <tspan x={textPos.x} dy="1.2em">{sector.name}</tspan>
                  </text>
                </g>
              );
            })}
            
            {/* 中心圆 */}
            <circle
              cx={centerX}
              cy={centerY}
              r={30}
              fill="hsl(var(--background))"
              stroke="hsl(var(--neon-blue))"
              strokeWidth="3"
            />
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-neon-blue font-display text-lg"
            >
              🎡
            </text>
          </svg>
        </motion.div>

        {/* 旋转中的光效 */}
        <AnimatePresence>
          {isSpinning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, transparent 40%, hsl(var(--neon-blue) / 0.2) 100%)',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 奖池显示 */}
      <div className="mt-6 text-center">
        <div className="text-sm text-muted-foreground">{t('game.prizePool')}</div>
        <div className="text-3xl font-display neon-text-pink">
          {prizePool.toFixed(2)} BNB
        </div>
      </div>

      {/* 下注选择器 */}
      <div className="mt-4 w-full max-w-xs">
        <BetSelector
          currentBet={selectedBet}
          onBetChange={setSelectedBet}
          disabled={isSpinning}
        />
      </div>

      {/* 旋转按钮 */}
      <motion.button
        onClick={isConnected ? handleSpin : () => connect()}
        disabled={isSpinning}
        whileHover={{ scale: isSpinning ? 1 : 1.02 }}
        whileTap={{ scale: isSpinning ? 1 : 0.98 }}
        className="mt-6 cyber-button w-full max-w-xs text-lg rounded-lg disabled:opacity-50"
      >
        {isSpinning ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              🎡
            </motion.span>
            {t('game.spinning')}
          </span>
        ) : isConnected ? (
          <span className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            {t('game.spin')}
          </span>
        ) : (
          t('wallet.connectToPlay')
        )}
      </motion.button>

      {/* 中奖结果弹窗 */}
      <AnimatePresence>
        {showResult && result && result.type !== 'none' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="cyber-card p-8 text-center max-w-sm mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">{result.emoji}</div>
              <h3 className="text-2xl font-display neon-text-pink mb-2">
                {result.name}
              </h3>
              <div className="text-4xl font-display text-neon-green mb-4">
                +{calculateWheelPayout(result, prizePool).toFixed(4)} BNB
              </div>
              <p className="text-muted-foreground text-sm">
                {t('winDisplay.poolPercent').replace('{n}', (result.poolPercent * 100).toFixed(1))}
              </p>
              <button
                onClick={() => setShowResult(false)}
                className="mt-6 cyber-button px-8 py-2 rounded-lg"
              >
                {t('common.close')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
