import { useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';
import { ThemeType, THEME_COLORS, WheelSector, CinematicWheelProps } from './types';
import { WheelBackground } from './WheelBackground';
import { WheelSectors } from './WheelSectors';
import { CasinoPointer } from './CasinoPointer';
import { WheelPegs } from './WheelPegs';
import { ParticleExplosion } from './ParticleExplosion';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/hooks/use-toast';
import { withAlpha } from './color';

export function CinematicWheel({ 
  sectors, 
  prizePool, 
  theme = 'gold',
  onSpinComplete,
  demoMode = false
}: CinematicWheelProps) {
  const { isConnected, connect, gameCredits } = useWallet();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningSector, setWinningSector] = useState<WheelSector | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [spinPhase, setSpinPhase] = useState<'idle' | 'charging' | 'spinning' | 'decelerating' | 'complete'>('idle');
  
  const wheelControls = useAnimation();
  const colors = THEME_COLORS[theme];
  const wheelSize = 420;

  // 根据概率选择中奖扇区
  const selectWinningSector = useCallback((): WheelSector => {
    const random = Math.random();
    let cumulative = 0;
    
    for (const sector of sectors) {
      cumulative += sector.probability;
      if (random <= cumulative) {
        return sector;
      }
    }
    return sectors[sectors.length - 1];
  }, [sectors]);

  // 计算停止角度
  const calculateStopAngle = useCallback((sector: WheelSector): number => {
    const sectorIndex = sectors.findIndex(s => s.id === sector.id);
    const sectorAngle = 360 / sectors.length;
    // 停在扇区中间
    const targetAngle = sectorIndex * sectorAngle + sectorAngle / 2;
    // 需要旋转的总角度（多转几圈 + 目标位置）
    const spins = 8 + Math.random() * 4; // 8-12圈
    const totalRotation = spins * 360 + (360 - targetAngle);
    return totalRotation;
  }, [sectors]);

  // 执行旋转动画
  const handleSpin = async () => {
    // 演示模式跳过钱包检查
    if (!demoMode) {
      if (!isConnected) {
        toast({
          title: '请先连接钱包',
          description: '需要连接钱包才能开始游戏',
          variant: 'destructive',
        });
        return;
      }

      if (gameCredits < 10000) {
        toast({
          title: '凭证不足',
          description: '请先充值游戏凭证',
          variant: 'destructive',
        });
        return;
      }
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setShowCelebration(false);
    setWinningSector(null);

    // 选择中奖扇区
    const winner = selectWinningSector();
    const targetRotation = calculateStopAngle(winner);

    // Phase 1: 蓄力 (0.8s)
    setSpinPhase('charging');
    await wheelControls.start({
      rotate: rotation - 15,
      transition: {
        duration: 0.4,
        ease: [0.36, 0, 0.66, -0.56], // 后退蓄力
      },
    });

    // Phase 2: 爆发加速 (0.3s)
    setSpinPhase('spinning');
    const newRotation = rotation + targetRotation;
    
    // Phase 3: 主旋转 + 减速 (5-6s)
    await wheelControls.start({
      rotate: newRotation,
      transition: {
        duration: 5.5,
        ease: [0.12, 0.8, 0.2, 1], // 快速加速，优雅减速
      },
    });

    // Phase 4: 微抖动停止 (0.5s)
    setSpinPhase('decelerating');
    await wheelControls.start({
      rotate: [newRotation, newRotation + 2, newRotation - 1, newRotation],
      transition: {
        duration: 0.5,
        times: [0, 0.3, 0.7, 1],
        ease: 'easeOut',
      },
    });

    setRotation(newRotation);
    setSpinPhase('complete');
    setWinningSector(winner);
    
    // 触发庆祝效果
    if (winner.poolPercent > 0) {
      setShowCelebration(true);
      const payout = winner.poolPercent * prizePool;
      
      toast({
        title: `🎉 ${winner.emoji} ${winner.label}!`,
        description: payout > 0 ? `恭喜获得 ${payout.toFixed(4)} BNB!` : '恭喜中奖！',
      });
      
      onSpinComplete?.(winner, payout);
    } else {
      toast({
        title: '💫 再来一次',
        description: '运气就在下一把！',
      });
      onSpinComplete?.(winner, 0);
    }

    setTimeout(() => {
      setIsSpinning(false);
      setSpinPhase('idle');
      setShowCelebration(false);
    }, 2000);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* 环境光效背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: wheelSize + 200,
            height: wheelSize + 200,
            background: `radial-gradient(circle, ${withAlpha(colors.glow, 0.12)} 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* 轮盘主体容器 */}
      <div 
        className="relative"
        style={{ 
          width: wheelSize + 40, 
          height: wheelSize + 120,
          perspective: '1000px',
        }}
      >
        {/* 3D 倾斜效果容器 */}
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(8deg)',
          }}
          animate={spinPhase === 'spinning' ? {
            rotateX: [8, 5, 8],
          } : {}}
          transition={{ duration: 0.5, repeat: spinPhase === 'spinning' ? Infinity : 0 }}
        >
          {/* 轮盘阴影 */}
          <div 
            className="absolute rounded-full"
            style={{
              width: wheelSize,
              height: wheelSize,
              left: 20,
              top: 30,
              background: `radial-gradient(ellipse, ${withAlpha('hsl(var(--background))', 0.7)} 0%, transparent 70%)`,
              filter: 'blur(20px)',
              transform: 'rotateX(-8deg) translateZ(-50px)',
            }}
          />

          {/* 外圈装饰光环 */}
          <div 
            className="absolute rounded-full"
            style={{
              width: wheelSize + 30,
              height: wheelSize + 30,
              left: 5,
              top: 5,
              background: `conic-gradient(from 0deg, ${withAlpha(colors.gradient[0], 0.35)}, ${withAlpha(colors.gradient[1], 0.18)}, ${withAlpha(colors.gradient[0], 0.35)}, ${withAlpha(colors.gradient[1], 0.18)}, ${withAlpha(colors.gradient[0], 0.35)})`,
              filter: 'blur(1px)',
            }}
          />

          {/* 轮盘底座 */}
          <div 
            className="absolute rounded-full"
            style={{
              width: wheelSize + 20,
              height: wheelSize + 20,
              left: 10,
              top: 10,
              background: `linear-gradient(135deg, ${colors.gradient[2]} 0%, hsl(var(--background)) 50%, ${colors.gradient[2]} 100%)`,
              boxShadow: `
                inset 0 2px 20px rgba(255,255,255,0.1),
                inset 0 -2px 20px rgba(0,0,0,0.8),
                0 10px 40px rgba(0,0,0,0.5)
              `,
            }}
          />

          {/* 主轮盘 */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: wheelSize,
              height: wheelSize,
              left: 20,
              top: 20,
              overflow: 'visible',
            }}
            animate={wheelControls}
            initial={{ rotate: 0 }}
          >
            {/* 背景层 - z-index: 0 */}
            <WheelBackground theme={theme} isSpinning={isSpinning} />
            
            {/* 扇区层 - z-index: 10 */}
            <WheelSectors 
              sectors={sectors} 
              theme={theme} 
              size={wheelSize}
              winningSector={winningSector?.id || null}
            />

            {/* 外圈钉子 - z-index: 15 (跟随轮盘一起转) */}
            <WheelPegs theme={theme} size={wheelSize} count={Math.max(24, sectors.length * 2)} />
            
            {/* Motion Blur 效果 - z-index: 20 */}
            {spinPhase === 'spinning' && (
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, transparent 30%, ${withAlpha(colors.glow, 0.08)} 100%)`,
                  filter: 'blur(3px)',
                  zIndex: 20,
                }}
                animate={{
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 0.1,
                  repeat: Infinity,
                }}
              />
            )}
          </motion.div>
        </motion.div>

        {/* 赌场指针 */}
        <CasinoPointer isSpinning={isSpinning} theme={theme} />

        {/* 粒子爆炸效果 */}
        <ParticleExplosion isActive={showCelebration} theme={theme} />

        {/* 简易底座（轮盘支架） */}
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            top: wheelSize + 38,
            width: wheelSize * 0.72,
            height: 56,
            borderRadius: 18,
            background: `linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)`,
            border: `1px solid ${withAlpha(colors.accent, 0.25)}`,
            boxShadow: `0 14px 28px ${withAlpha('hsl(var(--background))', 0.55)}, inset 0 1px 0 ${withAlpha('hsl(var(--foreground))', 0.06)}`,
            zIndex: 5,
          }}
        />
      </div>

      {/* 旋转按钮 */}
      <motion.button
        onClick={demoMode ? handleSpin : (isConnected ? handleSpin : () => connect())}
        disabled={isSpinning}
        className="mt-8 relative overflow-hidden group"
        whileHover={{ scale: isSpinning ? 1 : 1.03 }}
        whileTap={{ scale: isSpinning ? 1 : 0.97 }}
      >
        {/* 按钮背景 */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]}, ${colors.gradient[2]})`,
            opacity: isSpinning ? 0.5 : 1,
          }}
        />
        
        {/* 光泽效果 */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />

        {/* 按钮内容 */}
        <div 
          className="relative px-12 py-4 font-display text-xl tracking-wider"
          style={{ color: 'hsl(var(--primary-foreground))' }}
        >
          {isSpinning ? (
            <span className="flex items-center justify-center gap-3">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-6 h-6" />
              </motion.span>
              {spinPhase === 'charging' ? '蓄力中...' : 
               spinPhase === 'spinning' ? '旋转中...' : 
               spinPhase === 'decelerating' ? '即将揭晓...' : '处理中...'}
            </span>
          ) : demoMode ? (
            <span className="flex items-center justify-center gap-3">
              <Crown className="w-6 h-6" />
              立即旋转
            </span>
          ) : isConnected ? (
            <span className="flex items-center justify-center gap-3">
              <Crown className="w-6 h-6" />
              开始旋转
            </span>
          ) : (
            '连接钱包'
          )}
        </div>
      </motion.button>

      {/* 中奖结果展示 */}
      <AnimatePresence>
        {winningSector && spinPhase === 'complete' && winningSector.poolPercent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -bottom-24 left-1/2 -translate-x-1/2 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                textShadow: [
                  `0 0 20px ${colors.glow}`,
                  `0 0 40px ${colors.glow}`,
                  `0 0 20px ${colors.glow}`,
                ],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-4xl font-display"
              style={{ color: colors.primary }}
            >
              +{(winningSector.poolPercent * prizePool).toFixed(4)} BNB
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type { ThemeType, WheelSector, CinematicWheelProps } from './types';
