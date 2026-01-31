import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlinkoCanvas } from './PlinkoCanvas';
import { PlinkoControls } from './PlinkoControls';
import { PlinkoResults } from './PlinkoResults';
import { SoundControls } from './SoundControls';
import { PlinkoResult, SLOT_REWARDS, calculateReward, isJackpot, isBigWin, isWin } from '@/config/plinko';
import { useWallet } from '@/contexts/WalletContext';
import { usePlinkoSounds } from '@/hooks/usePlinkoSounds';
import { Sparkles, Crown, Star, Coins } from 'lucide-react';

// 模拟BNB奖池（实际应从合约读取）
const DEMO_BNB_POOL = 5.5; // 5.5 BNB

// ========================================
// 模拟合约概率计算（Chainlink VRF 替代）
// ========================================
// 20行二项分布概率表（精确到小数点后6位）
const SLOT_PROBABILITIES = [
  0.000001,  // 槽位0:  0.0001% - 50% 大奖
  0.000019,  // 槽位1:  0.0019% - 未中奖
  0.000181,  // 槽位2:  0.018% - 40% 大奖
  0.001087,  // 槽位3:  0.109% - 未中奖
  0.004621,  // 槽位4:  0.46% - 30% 中大奖
  0.014786,  // 槽位5:  1.48% - 未中奖
  0.036964,  // 槽位6:  3.7% - 20% 中奖
  0.073929,  // 槽位7:  7.4% - 未中奖
  0.120134,  // 槽位8:  12% - 10% 小奖
  0.160179,  // 槽位9:  16% - 未中奖
  0.176197,  // 槽位10: 17.6% - 3% 安慰奖
  0.160179,  // 槽位11: 16% - 未中奖
  0.120134,  // 槽位12: 12% - 10% 小奖
  0.073929,  // 槽位13: 7.4% - 未中奖
  0.036964,  // 槽位14: 3.7% - 20% 中奖
  0.014786,  // 槽位15: 1.48% - 未中奖
  0.004621,  // 槽位16: 0.46% - 30% 中大奖
  0.001087,  // 槽位17: 0.109% - 未中奖
  0.000181,  // 槽位18: 0.018% - 40% 大奖
  0.000019,  // 槽位19: 0.0019% - 未中奖
  0.000001,  // 槽位20: 0.0001% - 50% 大奖
];

// 模拟 Chainlink VRF 随机数生成并选择槽位
function simulateContractResult(): number {
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < SLOT_PROBABILITIES.length; i++) {
    cumulative += SLOT_PROBABILITIES[i];
    if (random < cumulative) {
      return i;
    }
  }
  
  // 默认返回中间槽位
  return 10;
}

// 背景粒子
function BackgroundParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 20,
    size: 2 + Math.random() * 4,
    opacity: 0.1 + Math.random() * 0.2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#C9A347]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          initial={{ y: '100vh' }}
          animate={{ y: '-20px' }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export function PlinkoGame() {
  const { gameCredits, isConnected } = useWallet();
  const sounds = usePlinkoSounds();
  
  const [betAmount, setBetAmount] = useState(10000);
  const [autoDropCount, setAutoDropCount] = useState(0);
  const [isDropping, setIsDropping] = useState(false);
  const [remainingDrops, setRemainingDrops] = useState(0);
  const [results, setResults] = useState<PlinkoResult[]>([]);
  const [dropTrigger, setDropTrigger] = useState(0);
  const [targetSlot, setTargetSlot] = useState<number | undefined>(undefined);
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [lastWin, setLastWin] = useState<{ label: string; amount: number; bnbAmount: number; isJackpot: boolean } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [bnbPool, setBnbPool] = useState(DEMO_BNB_POOL);
  const [volume, setVolume] = useState(0.5);
  

  const [demoCredits, setDemoCredits] = useState(100000);
  const credits = isConnected ? gameCredits : demoCredits;

  const autoDropTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingDrops = useRef(0);

  const totalWin = results.reduce((sum, r) => sum + r.winAmount, 0);
  const totalBet = results.reduce((sum, r) => sum + r.betAmount, 0);

  // 音量控制
  const handleToggleMute = useCallback(() => {
    const newMuted = sounds.toggleMute();
    setIsMuted(newMuted);
  }, [sounds]);

  const handleVolumeChange = useCallback((vol: number) => {
    sounds.setVolume(vol);
    setVolume(vol);
  }, [sounds]);

  // 碰撞音效回调
  const handleCollision = useCallback(() => {
    sounds.playCollisionSound(0.5 + Math.random() * 0.5);
  }, [sounds]);

  // 处理球落入槽位
  const handleBallLanded = useCallback((slotIndex: number) => {
    const reward = calculateReward(slotIndex, betAmount, bnbPool);
    
    // 播放音效 - 根据新的奖励类型
    if (isJackpot(reward.type)) {
      sounds.playJackpotSound();
    } else if (isBigWin(reward.type)) {
      sounds.playWinSound(50);
    } else if (isWin(reward.type)) {
      sounds.playSlotSound(2);
    } else {
      sounds.playSlotSound(0);
    }
    
    const result: PlinkoResult = {
      id: `${Date.now()}_${Math.random()}`,
      betAmount,
      winAmount: reward.amount,
      bnbWinAmount: reward.bnbAmount,
      rewardType: reward.type,
      rewardLabel: reward.label,
      slotIndex,
      timestamp: Date.now(),
    };

    setResults(prev => [result, ...prev]);
    
    // 更新凭证和BNB奖池（演示模式）
    if (!isConnected) {
      // 模拟BNB奖池变化 - 中奖时减少奖池
      if (reward.bnbAmount > 0) {
        setBnbPool(prev => Math.max(0.1, prev - reward.bnbAmount));
      }
      // 模拟交易税补充奖池（每次投注补充少量）
      setBnbPool(prev => prev + 0.001);
    }

    // 显示大奖特效
    if (isBigWin(reward.type)) {
      setLastWin({ 
        label: reward.label, 
        amount: reward.amount,
        bnbAmount: reward.bnbAmount,
        isJackpot: isJackpot(reward.type)
      });
      setShowWinOverlay(true);
      setTimeout(() => setShowWinOverlay(false), 2500);
    }

    pendingDrops.current = Math.max(0, pendingDrops.current - 1);
    setRemainingDrops(pendingDrops.current);
    
    if (pendingDrops.current <= 0) {
      setIsDropping(false);
    }
  }, [betAmount, isConnected, bnbPool, sounds]);

  // 执行投球 - 使用合约模拟决定结果
  const executeDrop = useCallback(() => {
    if (!isConnected) {
      setDemoCredits(prev => prev - betAmount);
    }
    
    // 模拟合约调用：先确定结果，再播放动画
    const contractResult = simulateContractResult();
    setTargetSlot(contractResult);
    
    sounds.playDropSound();
    setDropTrigger(prev => prev + 1);
  }, [betAmount, isConnected, sounds]);

  // 开始投球
  const handleDrop = useCallback(() => {
    if (credits < betAmount) return;
    
    sounds.playClickSound();
    
    const totalDrops = autoDropCount > 0 ? autoDropCount : 1;
    pendingDrops.current = totalDrops;
    setRemainingDrops(totalDrops);
    setIsDropping(true);
    
    executeDrop();
  }, [credits, betAmount, autoDropCount, executeDrop, sounds]);

  // 自动投球
  useEffect(() => {
    if (isDropping && remainingDrops > 1 && credits >= betAmount) {
      autoDropTimer.current = setTimeout(() => {
        executeDrop();
      }, 600);
    }

    return () => {
      if (autoDropTimer.current) {
        clearTimeout(autoDropTimer.current);
      }
    };
  }, [isDropping, remainingDrops, credits, betAmount, executeDrop]);

  // 按钮点击音效
  const handleBetChange = useCallback((amount: number) => {
    sounds.playClickSound();
    setBetAmount(amount);
  }, [sounds]);

  const handleAutoDropChange = useCallback((count: number) => {
    sounds.playClickSound();
    setAutoDropCount(count);
  }, [sounds]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0806] via-[#12100a] to-[#0a0806] p-4 md:p-8 relative">
      <BackgroundParticles />
      
      {/* 装饰光晕 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#C9A347]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#C9A347]/3 rounded-full blur-[120px]" />
      </div>
      
      {/* 标题 */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 relative z-10"
      >
        <div className="flex items-center justify-center gap-4 mb-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Crown className="w-8 h-8 md:w-10 md:h-10 text-[#FFD700]" />
          </motion.div>
          
          <h1 
            className="text-5xl md:text-6xl font-bold tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #E8D490 0%, #C9A347 30%, #FFD700 50%, #C9A347 70%, #8B7230 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(201, 163, 71, 0.5)',
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
            }}
          >
            PLINKO
          </h1>
          
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            <Crown className="w-8 h-8 md:w-10 md:h-10 text-[#FFD700]" />
          </motion.div>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <p className="text-[#C9A347]/60 text-lg tracking-widest">
            — 弹珠落下，财富开启 —
          </p>
          
          {/* 音量控制 */}
          <SoundControls
            isMuted={isMuted}
            volume={volume}
            onToggleMute={handleToggleMute}
            onVolumeChange={handleVolumeChange}
          />
        </div>
        
        {/* 奖池显示 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.2) 0%, rgba(255, 100, 0, 0.1) 100%)',
            border: '1px solid rgba(255, 68, 68, 0.4)',
            boxShadow: '0 0 30px rgba(255, 68, 68, 0.2)',
          }}
        >
          <Coins className="w-5 h-5 text-[#FFD700]" />
          <span className="text-[#FFD700]/80 text-sm">BNB 奖池</span>
          <span className="text-[#FFD700] font-bold text-lg">
            {bnbPool.toFixed(4)} BNB
          </span>
        </motion.div>
      </motion.div>

      {/* 主游戏区域 */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 relative z-10">
        {/* 左侧控制面板 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        >
          <PlinkoControls
            credits={credits}
            betAmount={betAmount}
            onBetChange={handleBetChange}
            autoDropCount={autoDropCount}
            onAutoDropChange={handleAutoDropChange}
            onDrop={handleDrop}
            isDropping={isDropping}
            remainingDrops={remainingDrops}
          />
        </motion.div>

        {/* 中央游戏画布 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 15 }}
          className="flex justify-center"
        >
          <PlinkoCanvas
            width={680}
            height={780}
            onBallLanded={handleBallLanded}
            onCollision={handleCollision}
            dropBallTrigger={dropTrigger}
            targetSlot={targetSlot}
          />
        </motion.div>

        {/* 右侧结果面板 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: 'spring', damping: 20 }}
        >
          <PlinkoResults
            results={results}
            totalWin={totalWin}
            totalBet={totalBet}
          />
        </motion.div>
      </div>

      {/* 大奖特效遮罩 */}
      <AnimatePresence>
        {showWinOverlay && lastWin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: lastWin.isJackpot 
                ? 'radial-gradient(circle at center, rgba(255, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.9) 70%)'
                : 'radial-gradient(circle at center, rgba(201, 163, 71, 0.2) 0%, rgba(0, 0, 0, 0.8) 70%)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* 爆炸粒子 */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <Star 
                  className={lastWin.isJackpot ? 'text-[#FF4444]' : 'text-[#FFD700]'}
                  style={{ 
                    width: 10 + Math.random() * 20,
                    height: 10 + Math.random() * 20,
                  }}
                />
              </motion.div>
            ))}
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              className="text-center relative"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Sparkles className={`w-20 h-20 mx-auto mb-4 ${lastWin.isJackpot ? 'text-[#FF4444]' : 'text-[#FFD700]'}`} />
              </motion.div>
              
              <motion.div 
                className="text-5xl md:text-6xl font-bold mb-4"
                style={{
                  background: lastWin.isJackpot 
                    ? 'linear-gradient(135deg, #FF4444 0%, #FFF 50%, #FF4444 100%)'
                    : 'linear-gradient(135deg, #FFD700 0%, #FFF 50%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 0 30px ${lastWin.isJackpot ? 'rgba(255, 68, 68, 0.8)' : 'rgba(255, 215, 0, 0.8)'})`,
                }}
                animate={{
                  textShadow: [
                    `0 0 20px ${lastWin.isJackpot ? 'rgba(255, 68, 68, 0.5)' : 'rgba(255, 215, 0, 0.5)'}`,
                    `0 0 60px ${lastWin.isJackpot ? 'rgba(255, 68, 68, 1)' : 'rgba(255, 215, 0, 1)'}`,
                    `0 0 20px ${lastWin.isJackpot ? 'rgba(255, 68, 68, 0.5)' : 'rgba(255, 215, 0, 0.5)'}`,
                  ],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {lastWin.label}
              </motion.div>
              
              <motion.div 
                className={`text-4xl font-bold ${lastWin.isJackpot ? 'text-[#FF4444]' : 'text-[#FFD700]'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {lastWin.bnbAmount > 0 
                  ? `+${lastWin.bnbAmount.toFixed(4)} BNB`
                  : `+${lastWin.amount.toLocaleString()}`
                }
              </motion.div>
              
              <motion.div
                className="mt-4 text-[#C9A347]/80 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {lastWin.isJackpot ? '🎉 恭喜中得大奖！🎉' : '恭喜获奖！'}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 演示模式提示 */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
        >
          <div 
            className="px-6 py-3 rounded-full text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 163, 71, 0.2) 0%, rgba(201, 163, 71, 0.1) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.3)',
              color: '#C9A347',
              backdropFilter: 'blur(10px)',
            }}
          >
            🎮 演示模式 — 连接钱包开始真实游戏
          </div>
        </motion.div>
      )}
    </div>
  );
}
