import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedSlotReel } from './AdvancedSlotReel';
import { PaylineLines } from './PaylineLines';
import { WinDisplay } from './WinDisplay';
import { AutoSpinControls } from './AutoSpinControls';
import { BetSelector, BET_AMOUNTS } from './BetSelector';
import { useAdvancedSlotMachine } from '@/hooks/useAdvancedSlotMachine';
import { useWallet } from '@/contexts/WalletContext';
import { useAudioContext } from '@/contexts/AudioContext';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Zap, TrendingUp, Coins, Sparkles, Flame, Trophy, Ticket } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function AdvancedSlotMachine() {
  const { gameState, prizePool, spin, setCallbacks } = useAdvancedSlotMachine();
  const { isConnected, gameCredits, useCredits, connect } = useWallet();
  const { 
    playSpinSound, 
    playReelStopSound, 
    playSmallWinSound, 
    playMediumWinSound, 
    playJackpotSound,
    playClickSound,
  } = useAudioContext();
  const [showPaylines, setShowPaylines] = useState(false);
  
  // 投注金额状态 (游戏凭证)
  const [currentBetCredits, setCurrentBetCredits] = useState(BET_AMOUNTS[2]); // 默认 20K 凭证
  
  // 自动旋转状态
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const autoSpinRef = useRef(false);

  // 设置音效回调
  useEffect(() => {
    setCallbacks({
      onSpinStart: () => {
        playSpinSound();
      },
      onReelStop: (reelIndex) => {
        playReelStopSound(reelIndex);
      },
      onSpinEnd: (result) => {
        if (result.isJackpot) {
          playJackpotSound();
        } else if (result.winLines.length >= 3) {
          playMediumWinSound();
        } else if (result.winLines.length > 0) {
          playSmallWinSound();
        }
      },
    });
  }, [setCallbacks, playSpinSound, playReelStopSound, playSmallWinSound, playMediumWinSound, playJackpotSound]);

  // 计算中奖位置
  const winningPositions = useMemo(() => {
    const positions = new Set<string>();
    if (gameState.lastResult?.winLines && !gameState.isSpinning) {
      gameState.lastResult.winLines.forEach(line => {
        line.positions.forEach(([reel, row]) => {
          positions.add(`${reel}-${row}`);
        });
      });
    }
    return positions;
  }, [gameState.lastResult, gameState.isSpinning]);

  // 活跃的赔付线
  const activeLines = useMemo(() => {
    if (!gameState.lastResult?.winLines || gameState.isSpinning) return [];
    return gameState.lastResult.winLines.map(line => line.lineIndex);
  }, [gameState.lastResult, gameState.isSpinning]);

  // 执行单次旋转
  const executeSpin = useCallback(async () => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        description: "需要连接 MetaMask 钱包才能开始游戏",
        variant: "destructive",
      });
      return null;
    }

    if (gameCredits < currentBetCredits) {
      toast({
        title: "凭证不足",
        description: `需要 ${currentBetCredits.toLocaleString()} 游戏凭证。请先销毁代币兑换凭证。`,
        variant: "destructive",
      });
      return null;
    }

    // 消耗凭证
    const success = useCredits(currentBetCredits);
    if (!success) {
      toast({
        title: "凭证扣除失败",
        variant: "destructive",
      });
      return null;
    }

    const result = await spin(currentBetCredits);
    
    if (result.poolPayout > 0 && result.prizeConfig) {
      toast({
        title: `${result.prizeConfig.emoji} ${result.prizeConfig.name}！`,
        description: `${result.winLines.length} 条赔付线中奖！获得奖池 ${(result.poolPercentUsed * 100).toFixed(1)}%，赢得 ${result.poolPayout.toFixed(4)} BNB！`,
      });
    }
    
    return result;
  }, [isConnected, gameCredits, currentBetCredits, spin, useCredits]);

  // 手动旋转
  const handleSpin = async () => {
    playClickSound();
    await executeSpin();
  };

  // 自动旋转逻辑
  const runAutoSpin = useCallback(async () => {
    if (!autoSpinRef.current || autoSpinCount <= 0) {
      setIsAutoSpinning(false);
      autoSpinRef.current = false;
      return;
    }

    const result = await executeSpin();
    
    if (result === null) {
      setIsAutoSpinning(false);
      autoSpinRef.current = false;
      setAutoSpinCount(0);
      toast({
        title: "自动旋转已停止",
        description: "由于代币不足或其他原因",
        variant: "destructive",
      });
      return;
    }

    setAutoSpinCount(prev => prev - 1);
  }, [autoSpinCount, executeSpin]);

  // 监听自动旋转
  useEffect(() => {
    if (isAutoSpinning && !gameState.isSpinning && autoSpinCount > 0 && autoSpinRef.current) {
      const timer = setTimeout(() => {
        runAutoSpin();
      }, 500);
      return () => clearTimeout(timer);
    } else if (autoSpinCount <= 0 && isAutoSpinning) {
      setIsAutoSpinning(false);
      autoSpinRef.current = false;
      toast({
        title: "自动旋转完成",
        description: "已完成所有自动旋转",
      });
    }
  }, [isAutoSpinning, gameState.isSpinning, autoSpinCount, runAutoSpin]);

  // 开始自动旋转
  const handleStartAutoSpin = (count: number) => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }
    setAutoSpinCount(count);
    setIsAutoSpinning(true);
    autoSpinRef.current = true;
  };

  // 停止自动旋转
  const handleStopAutoSpin = () => {
    autoSpinRef.current = false;
    setIsAutoSpinning(false);
    setAutoSpinCount(0);
    toast({
      title: "自动旋转已停止",
    });
  };

  const handlePaylineToggle = () => {
    playClickSound();
    setShowPaylines(!showPaylines);
  };

  return (
    <div className="relative">
      {/* 背景装饰 */}
      <div className="absolute -inset-4 bg-gradient-to-r from-neon-purple/10 via-neon-blue/10 to-neon-pink/10 blur-3xl rounded-3xl" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative cyber-card overflow-visible"
      >
        {/* 装饰边角 */}
        <div className="absolute -top-2 -left-2 w-12 h-12 border-t-2 border-l-2 border-neon-blue rounded-tl-lg" />
        <div className="absolute -top-2 -right-2 w-12 h-12 border-t-2 border-r-2 border-neon-blue rounded-tr-lg" />
        <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-2 border-l-2 border-neon-purple rounded-bl-lg" />
        <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-2 border-r-2 border-neon-purple rounded-br-lg" />

        {/* 标题区域 */}
        <div className="text-center mb-6">
          <motion.h2 
            className="text-3xl md:text-4xl font-display neon-text-blue glitch flex items-center justify-center gap-3"
            animate={gameState.isSpinning ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.3, repeat: gameState.isSpinning ? Infinity : 0 }}
          >
            <Sparkles className="w-8 h-8 text-neon-yellow animate-pulse" />
            CYBER SLOTS
            <Sparkles className="w-8 h-8 text-neon-yellow animate-pulse" />
          </motion.h2>
          <p className="text-sm text-muted-foreground mt-1">
            5轮 × 3行 × 15条赔付线 | 💯 100%返还 零抽成
          </p>
        </div>

        {/* 顶部信息栏 */}
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="neon-border-pink rounded-lg px-4 py-2 bg-muted/50 flex items-center gap-2">
            <Coins className="w-4 h-4 text-neon-yellow" />
            <span className="text-xs text-muted-foreground">奖池</span>
            <span className="text-lg font-display neon-text-pink">{prizePool.toFixed(2)}</span>
            <span className="text-xs text-neon-pink">BNB</span>
          </div>
          
          {gameState.combo > 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="neon-border rounded-lg px-4 py-2 bg-neon-yellow/10 flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-neon-orange" />
              <span className="font-display text-neon-orange">{gameState.combo}x</span>
              <span className="text-xs text-muted-foreground">连胜</span>
            </motion.div>
          )}
          
          <button
            onClick={handlePaylineToggle}
            className={`px-3 py-2 rounded-lg text-xs font-display transition-colors ${
              showPaylines 
                ? 'bg-neon-cyan/20 text-neon-cyan neon-border' 
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            赔付线
          </button>
        </div>

        {/* 老虎机主体 */}
        <div className="relative p-4 rounded-2xl bg-gradient-to-b from-muted/30 to-muted/10 border border-border/50">
          {/* 赔付线显示 */}
          <div className="relative">
            {(showPaylines || activeLines.length > 0) && (
              <PaylineLines 
                activeLines={activeLines}
                showAll={showPaylines && activeLines.length === 0}
              />
            )}
            
            {/* 转轮容器 */}
            <div className="flex justify-center items-center gap-2 relative z-10">
              {gameState.grid.map((column, reelIndex) => (
                <AdvancedSlotReel
                  key={reelIndex}
                  symbols={column}
                  isSpinning={gameState.isSpinning}
                  reelIndex={reelIndex}
                  winningPositions={winningPositions}
                />
              ))}
            </div>
          </div>

          {/* 中奖显示 */}
          <AnimatePresence>
            {gameState.lastResult && gameState.lastResult.poolPayout > 0 && !gameState.isSpinning && (
              <WinDisplay result={gameState.lastResult} />
            )}
          </AnimatePresence>
        </div>

        {/* 投注选择器 */}
        <div className="mt-4 neon-border rounded-xl p-4 bg-muted/20">
          <div className="text-center text-sm text-muted-foreground mb-3 flex items-center justify-center gap-2">
            <Ticket className="w-4 h-4 text-neon-cyan" />
            <span className="text-neon-cyan">投注凭证</span>
            <span className="text-xs text-muted-foreground">(凭证越多，中奖率越高)</span>
          </div>
          <BetSelector
            currentBet={currentBetCredits}
            onBetChange={setCurrentBetCredits}
            disabled={gameState.isSpinning || isAutoSpinning}
            playClickSound={playClickSound}
          />
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="neon-border rounded-lg p-3 bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Zap className="w-3 h-3 text-neon-cyan" />
              总游戏
            </div>
            <div className="text-xl font-display text-neon-cyan">
              {gameState.totalSpins}
            </div>
          </div>
          <div className="neon-border rounded-lg p-3 bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3 text-neon-green" />
              总中奖
            </div>
            <div className="text-xl font-display text-neon-green">
              {gameState.totalWins}
            </div>
          </div>
          <div className="neon-border rounded-lg p-3 bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Trophy className="w-3 h-3 text-neon-yellow" />
              胜率
            </div>
            <div className="text-xl font-display text-neon-yellow">
              {gameState.totalSpins > 0 
                ? ((gameState.totalWins / gameState.totalSpins) * 100).toFixed(1) 
                : '0'}%
            </div>
          </div>
        </div>

        {/* 旋转按钮区域 */}
        <div className="mt-6 space-y-3">
          {isConnected ? (
            <>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleSpin}
                  disabled={gameState.isSpinning || isAutoSpinning}
                  whileHover={{ scale: (gameState.isSpinning || isAutoSpinning) ? 1 : 1.02 }}
                  whileTap={{ scale: (gameState.isSpinning || isAutoSpinning) ? 1 : 0.98 }}
                  className={`
                    cyber-button flex-1 text-lg rounded-xl py-5
                    ${(gameState.isSpinning || isAutoSpinning)
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-[0_0_40px_hsl(195_100%_50%/0.5)]'}
                  `}
                >
                  {gameState.isSpinning ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                        className="text-2xl"
                      >
                        🎰
                      </motion.span>
                      <span>转动中...</span>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                        className="text-2xl"
                      >
                        🎰
                      </motion.span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="w-6 h-6" />
                      开始游戏
                      <Zap className="w-6 h-6" />
                    </span>
                  )}
                </motion.button>
              </div>
              
              <div className="flex justify-center">
                <AutoSpinControls
                  isAutoSpinning={isAutoSpinning}
                  remainingSpins={autoSpinCount}
                  onStartAutoSpin={handleStartAutoSpin}
                  onStopAutoSpin={handleStopAutoSpin}
                  disabled={gameState.isSpinning}
                  playClickSound={playClickSound}
                />
              </div>
            </>
          ) : (
            <motion.button
              onClick={() => { playClickSound(); connect(); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cyber-button w-full text-lg rounded-xl py-5"
            >
              连接钱包开始游戏
            </motion.button>
          )}
        </div>

        {/* 游戏统计 */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <span>总游戏: {gameState.totalSpins}</span>
          <span className="mx-3">|</span>
          <span>总中奖: {gameState.totalWins}</span>
          {gameState.lastResult && gameState.lastResult.poolPayout > 0 && (
            <>
              <span className="mx-3">|</span>
              <span className="text-neon-green">
                上次: +{gameState.lastResult.poolPayout.toFixed(4)} BNB
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
