import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedSlotReel } from './AdvancedSlotReel';
import { PaylineLines } from './PaylineLines';
import { WinDisplay } from './WinDisplay';
import { AutoSpinControls } from './AutoSpinControls';
import { BetSelector, BET_AMOUNTS } from './BetSelector';
import { useAdvancedSlotMachine, SYMBOLS } from '@/hooks/useAdvancedSlotMachine';
import { useCyberSlots, formatSymbols, formatPrizeType } from '@/hooks/useCyberSlots';
import { useWallet } from '@/contexts/WalletContext';
import { useAudioContext } from '@/contexts/AudioContext';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Zap, TrendingUp, Coins, Sparkles, Flame, Trophy, Ticket, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatEther } from 'ethers';

export function AdvancedSlotMachine() {
  const { gameState, spin: localSpin, setCallbacks } = useAdvancedSlotMachine();
  const { 
    prizePool: contractPrizePool,
    availablePool,
    playerStats,
    tokenBalance,
    unclaimedPrize,
    spin: contractSpin,
    claimPrize,
    isSpinning: isContractSpinning,
    recentWins,
    refreshData,
    error: contractError,
  } = useCyberSlots();
  const { isConnected, gameCredits, useCredits, connect, address } = useWallet();
  const { 
    playSpinSound, 
    playReelStopSound, 
    playSmallWinSound, 
    playMediumWinSound, 
    playJackpotSound,
    playClickSound,
  } = useAudioContext();
  const [showPaylines, setShowPaylines] = useState(false);
  const [currentBetCredits, setCurrentBetCredits] = useState(BET_AMOUNTS[0]);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const autoSpinRef = useRef(false);
  
  const [useRealContract, setUseRealContract] = useState(false);
  const [pendingResult, setPendingResult] = useState<{symbols: number[], winAmount: bigint, prizeType: string} | null>(null);

  const prizePool = useRealContract && parseFloat(contractPrizePool) > 0 
    ? parseFloat(contractPrizePool) 
    : 10.5;

  useEffect(() => {
    if (recentWins.length > 0 && address) {
      const myResult = recentWins.find(
        w => w.player.toLowerCase() === address.toLowerCase() && w.timestamp > Date.now() - 60000
      );
      if (myResult && isContractSpinning === false) {
        setPendingResult({
          symbols: myResult.symbols,
          winAmount: myResult.winAmount,
          prizeType: myResult.prizeType,
        });
        
        const prizeInfo = formatPrizeType(myResult.prizeType);
        if (myResult.winAmount > 0n) {
          if (myResult.prizeType === 'super_jackpot' || myResult.prizeType === 'jackpot') {
            playJackpotSound();
          } else if (myResult.prizeType === 'first' || myResult.prizeType === 'second') {
            playMediumWinSound();
          } else {
            playSmallWinSound();
          }
          
          toast({
            title: `${prizeInfo.emoji} ${prizeInfo.name}！`,
            description: `恭喜获得 ${formatEther(myResult.winAmount)} BNB！`,
          });
        }
      }
    }
  }, [recentWins, address, isContractSpinning, playJackpotSound, playMediumWinSound, playSmallWinSound]);

  useEffect(() => {
    setCallbacks({
      onSpinStart: () => playSpinSound(),
      onReelStop: (reelIndex) => playReelStopSound(reelIndex),
      onSpinEnd: (result) => {
        if (!useRealContract) {
          if (result.isJackpot) {
            playJackpotSound();
          } else if (result.winLines.length >= 3) {
            playMediumWinSound();
          } else if (result.winLines.length > 0) {
            playSmallWinSound();
          }
        }
      },
    });
  }, [setCallbacks, playSpinSound, playReelStopSound, playSmallWinSound, playMediumWinSound, playJackpotSound, useRealContract]);

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

  const activeLines = useMemo(() => {
    if (!gameState.lastResult?.winLines || gameState.isSpinning) return [];
    return gameState.lastResult.winLines.map(line => line.lineIndex);
  }, [gameState.lastResult, gameState.isSpinning]);

  const executeSpin = useCallback(async () => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        description: "需要连接钱包才能开始游戏",
        variant: "destructive",
      });
      return null;
    }

    if (useRealContract) {
      const txHash = await contractSpin(currentBetCredits);
      if (txHash) {
        toast({
          title: "🎰 游戏已提交",
          description: "等待VRF回调结果...",
        });
        playSpinSound();
        return { submitted: true };
      }
      return null;
    } else {
      if (gameCredits < currentBetCredits) {
        toast({
          title: "凭证不足",
          description: `需要 ${currentBetCredits.toLocaleString()} 游戏凭证。请先销毁代币兑换凭证。`,
          variant: "destructive",
        });
        return null;
      }

      const success = useCredits(currentBetCredits);
      if (!success) {
        toast({ title: "凭证扣除失败", variant: "destructive" });
        return null;
      }

      const result = await localSpin(currentBetCredits);
      
      if (result.poolPayout > 0 && result.prizeConfig) {
        toast({
          title: `${result.prizeConfig.emoji} ${result.prizeConfig.name}！`,
          description: `${result.winLines.length} 条赔付线中奖！获得奖池 ${(result.poolPercentUsed * 100).toFixed(1)}%，赢得 ${result.poolPayout.toFixed(4)} BNB！`,
        });
      }
      
      return result;
    }
  }, [isConnected, useRealContract, contractSpin, currentBetCredits, gameCredits, useCredits, localSpin, playSpinSound]);

  const handleSpin = async () => {
    playClickSound();
    await executeSpin();
  };

  const handleClaimPrize = async () => {
    const success = await claimPrize();
    if (success) {
      toast({ title: "✅ 奖金已领取！" });
    } else {
      toast({ title: "领取失败", variant: "destructive" });
    }
  };

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

  useEffect(() => {
    const isSpinning = useRealContract ? isContractSpinning : gameState.isSpinning;
    if (isAutoSpinning && !isSpinning && autoSpinCount > 0 && autoSpinRef.current) {
      const timer = setTimeout(() => runAutoSpin(), 500);
      return () => clearTimeout(timer);
    } else if (autoSpinCount <= 0 && isAutoSpinning) {
      setIsAutoSpinning(false);
      autoSpinRef.current = false;
      toast({ title: "自动旋转完成", description: "已完成所有自动旋转" });
    }
  }, [isAutoSpinning, gameState.isSpinning, isContractSpinning, autoSpinCount, runAutoSpin, useRealContract]);

  const handleStartAutoSpin = (count: number) => {
    if (!isConnected) {
      toast({ title: "请先连接钱包", variant: "destructive" });
      return;
    }
    setAutoSpinCount(count);
    setIsAutoSpinning(true);
    autoSpinRef.current = true;
  };

  const handleStopAutoSpin = () => {
    autoSpinRef.current = false;
    setIsAutoSpinning(false);
    setAutoSpinCount(0);
    toast({ title: "自动旋转已停止" });
  };

  const handlePaylineToggle = () => {
    playClickSound();
    setShowPaylines(!showPaylines);
  };

  const isSpinning = useRealContract ? isContractSpinning : gameState.isSpinning;
  const totalSpinsDisplay = useRealContract && playerStats ? Number(playerStats.totalSpins) : gameState.totalSpins;
  const totalWinsDisplay = useRealContract && playerStats ? Number(playerStats.totalWins) : gameState.totalWins;

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-r from-neon-purple/10 via-neon-blue/10 to-neon-pink/10 blur-3xl rounded-3xl" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative cyber-card overflow-visible"
      >
        <div className="absolute -top-2 -left-2 w-12 h-12 border-t-2 border-l-2 border-neon-blue rounded-tl-lg" />
        <div className="absolute -top-2 -right-2 w-12 h-12 border-t-2 border-r-2 border-neon-blue rounded-tr-lg" />
        <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-2 border-l-2 border-neon-purple rounded-bl-lg" />
        <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-2 border-r-2 border-neon-purple rounded-br-lg" />

        <div className="text-center mb-6">
          <motion.h2 
            className="text-3xl md:text-4xl font-display neon-text-blue glitch flex items-center justify-center gap-3"
            animate={isSpinning ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0 }}
          >
            <Sparkles className="w-8 h-8 text-neon-yellow animate-pulse" />
            CYBER SLOTS
            <Sparkles className="w-8 h-8 text-neon-yellow animate-pulse" />
          </motion.h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              5轮 × 3行 × 15条赔付线 | 💯 100%返还
            </p>
            <button
              onClick={() => setUseRealContract(!useRealContract)}
              className={`text-xs px-2 py-0.5 rounded ${
                useRealContract 
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {useRealContract ? '🔗 链上' : '🎮 演示'}
            </button>
          </div>
        </div>

        {parseFloat(unclaimedPrize) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-neon-green" />
              <span className="text-sm">待领取奖金: <strong className="text-neon-green">{parseFloat(unclaimedPrize).toFixed(4)} BNB</strong></span>
            </div>
            <button
              onClick={handleClaimPrize}
              className="px-3 py-1 rounded bg-neon-green/20 text-neon-green text-sm hover:bg-neon-green/30 transition-colors"
            >
              领取
            </button>
          </motion.div>
        )}

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

        <div className="relative p-4 rounded-2xl bg-gradient-to-b from-muted/30 to-muted/10 border border-border/50">
          <div className="relative">
            {(showPaylines || activeLines.length > 0) && (
              <PaylineLines 
                activeLines={activeLines}
                showAll={showPaylines && activeLines.length === 0}
              />
            )}
            
            <div className="flex justify-center items-center gap-2 relative z-10">
              {gameState.grid.map((column, reelIndex) => (
                <AdvancedSlotReel
                  key={reelIndex}
                  symbols={column}
                  isSpinning={isSpinning}
                  reelIndex={reelIndex}
                  winningPositions={winningPositions}
                />
              ))}
            </div>
          </div>

          <AnimatePresence>
            {gameState.lastResult && gameState.lastResult.poolPayout > 0 && !isSpinning && (
              <WinDisplay result={gameState.lastResult} />
            )}
          </AnimatePresence>
          
          {isContractSpinning && useRealContract && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mx-auto mb-2" />
                <p className="text-neon-cyan font-display">等待VRF回调...</p>
                <p className="text-xs text-muted-foreground mt-1">Chainlink正在生成随机数</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-4 neon-border rounded-xl p-4 bg-muted/20">
          <div className="text-center text-sm text-muted-foreground mb-3 flex items-center justify-center gap-2">
            <Ticket className="w-4 h-4 text-neon-cyan" />
            <span className="text-neon-cyan">投注凭证</span>
            <span className="text-xs text-muted-foreground">(凭证越多，中奖率越高)</span>
          </div>
          <BetSelector
            currentBet={currentBetCredits}
            onBetChange={setCurrentBetCredits}
            disabled={isSpinning || isAutoSpinning}
            playClickSound={playClickSound}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="neon-border rounded-lg p-3 bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Zap className="w-3 h-3 text-neon-cyan" />
              总游戏
            </div>
            <div className="text-xl font-display text-neon-cyan">
              {totalSpinsDisplay}
            </div>
          </div>
          <div className="neon-border rounded-lg p-3 bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3 text-neon-green" />
              总中奖
            </div>
            <div className="text-xl font-display text-neon-green">
              {totalWinsDisplay}
            </div>
          </div>
          <div className="neon-border rounded-lg p-3 bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Trophy className="w-3 h-3 text-neon-yellow" />
              胜率
            </div>
            <div className="text-xl font-display text-neon-yellow">
              {totalSpinsDisplay > 0 
                ? ((totalWinsDisplay / totalSpinsDisplay) * 100).toFixed(1) 
                : '0'}%
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {isConnected ? (
            <>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleSpin}
                  disabled={isSpinning || isAutoSpinning}
                  whileHover={{ scale: (isSpinning || isAutoSpinning) ? 1 : 1.02 }}
                  whileTap={{ scale: (isSpinning || isAutoSpinning) ? 1 : 0.98 }}
                  className={`
                    cyber-button flex-1 text-lg rounded-xl py-5
                    ${(isSpinning || isAutoSpinning)
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-[0_0_40px_hsl(195_100%_50%/0.5)]'}
                  `}
                >
                  {isSpinning ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                        className="text-2xl"
                      >
                        🎰
                      </motion.span>
                      <span>{useRealContract ? '等待结果...' : '转动中...'}</span>
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
                  disabled={isSpinning}
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

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <span>总游戏: {totalSpinsDisplay}</span>
          <span className="mx-3">|</span>
          <span>总中奖: {totalWinsDisplay}</span>
          {gameState.lastResult && gameState.lastResult.poolPayout > 0 && !useRealContract && (
            <>
              <span className="mx-3">|</span>
              <span className="text-neon-green">
                上次: +{gameState.lastResult.poolPayout.toFixed(4)} BNB
              </span>
            </>
          )}
        </div>
        
        {contractError && (
          <div className="mt-2 text-center text-xs text-destructive">
            {contractError}
          </div>
        )}
      </motion.div>
    </div>
  );
}
