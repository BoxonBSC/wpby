import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedSlotReel } from './AdvancedSlotReel';
import { PaylineLines } from './PaylineLines';
import { AutoSpinControls } from './AutoSpinControls';
import { BetSelector, BET_AMOUNTS } from './BetSelector';
import { WinRevealOverlay } from './WinRevealOverlay';
import { useCyberSlots, formatPrizeType } from '@/hooks/useCyberSlots';
import { useWallet } from '@/contexts/WalletContext';
import { useAudioContext } from '@/contexts/AudioContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, TrendingUp, Coins, Sparkles, Trophy, Ticket, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatEther } from 'ethers';
import { type SlotSymbol } from '@/hooks/useAdvancedSlotMachine';

// 链上符号ID到本地符号ID的映射
const CHAIN_SYMBOL_MAP: Record<number, SlotSymbol> = {
  0: 'seven',
  1: 'diamond',
  2: 'crown',
  3: 'bell',
  4: 'star',
  5: 'cherry',
  6: 'lemon',
  7: 'grape',
  8: 'watermelon',
  9: 'clover',
};

// 默认转轮显示
const DEFAULT_GRID: SlotSymbol[][] = [
  ['seven', 'diamond', 'crown'],
  ['bell', 'star', 'cherry'],
  ['diamond', 'lemon', 'grape'],
  ['crown', 'watermelon', 'clover'],
  ['bell', 'seven', 'star'],
];

export function AdvancedSlotMachine() {
  const { 
    prizePool: contractPrizePool,
    playerStats,
    gameCredits,
    pendingRequest,
    unclaimedPrize,
    spin: contractSpin,
    claimPrize,
    cancelStuckRequest,
    isSpinning,
    recentWins,
    error: contractError,
  } = useCyberSlots();
  const { isConnected, connect, address } = useWallet();
  const { 
    playSpinSound, 
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
  const [displayGrid, setDisplayGrid] = useState<SlotSymbol[][]>(DEFAULT_GRID);
  const lastActionRef = useRef<'spin' | null>(null);
  
  // 揭示动画状态
  const [isRevealing, setIsRevealing] = useState(false);
  const [shouldStopReels, setShouldStopReels] = useState(false);
  const [stoppedReelCount, setStoppedReelCount] = useState(0);
  
  // 中奖弹窗状态
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const [winOverlayData, setWinOverlayData] = useState<{
    winAmount: string;
    prizeType: string;
    prizeEmoji: string;
    symbols: SlotSymbol[];
  } | null>(null);
  
  // 待处理的结果（等待揭示动画完成后显示）
  const pendingResultRef = useRef<{
    symbols: SlotSymbol[];
    winAmount: bigint;
    prizeType: string;
  } | null>(null);

  // 直接使用合约奖池数据
  const prizePool = parseFloat(contractPrizePool);
  const totalSpinsDisplay = playerStats ? Number(playerStats.totalSpins) : 0;
  const totalWinsDisplay = playerStats ? Number(playerStats.totalWins) : 0;
  const creditsDisplay = parseFloat(gameCredits);

  // 监听中奖结果
  useEffect(() => {
    if (recentWins.length > 0 && address) {
      const myResult = recentWins.find(
        w => w.player.toLowerCase() === address.toLowerCase() && w.timestamp > Date.now() - 60000
      );
      if (myResult && isSpinning) {
        // 收到结果，开始揭示动画
        const newGrid: SlotSymbol[][] = myResult.symbols.map(s => {
          const symbol = CHAIN_SYMBOL_MAP[s] || 'seven';
          return [symbol, symbol, symbol];
        });
        
        // 保存结果，准备揭示
        const symbolsForOverlay = myResult.symbols.map(s => CHAIN_SYMBOL_MAP[s] || 'seven');
        pendingResultRef.current = {
          symbols: symbolsForOverlay,
          winAmount: myResult.winAmount,
          prizeType: myResult.prizeType,
        };
        
        // 设置显示网格
        setDisplayGrid(newGrid);
        
        // 开始揭示动画
        setIsRevealing(true);
        setShouldStopReels(true);
        setStoppedReelCount(0);
      }
    }
  }, [recentWins, address, isSpinning]);
  
  // 处理轮子停止完成
  const handleReelStopped = useCallback(() => {
    setStoppedReelCount(prev => prev + 1);
  }, []);
  
  // 当所有轮子停止后，显示结果
  useEffect(() => {
    if (stoppedReelCount >= 5 && isRevealing) {
      // 所有轮子都停止了
      setIsRevealing(false);
      setShouldStopReels(false);
      setStoppedReelCount(0);
      
      const result = pendingResultRef.current;
      if (result) {
        const prizeInfo = formatPrizeType(result.prizeType);
        
        if (result.winAmount > 0n) {
          // 播放音效
          if (result.prizeType === 'super_jackpot' || result.prizeType === 'jackpot') {
            playJackpotSound();
          } else if (result.prizeType === 'first' || result.prizeType === 'second') {
            playMediumWinSound();
          } else {
            playSmallWinSound();
          }
          
          // 显示中奖弹窗
          setWinOverlayData({
            winAmount: parseFloat(formatEther(result.winAmount)).toFixed(4),
            prizeType: prizeInfo.name,
            prizeEmoji: prizeInfo.emoji,
            symbols: result.symbols,
          });
          setShowWinOverlay(true);
        } else {
          // 未中奖，显示简单提示
          toast({
            title: "未中奖",
            description: "再接再厉！下次好运！",
          });
        }
        
        pendingResultRef.current = null;
      }
    }
  }, [stoppedReelCount, isRevealing, playJackpotSound, playMediumWinSound, playSmallWinSound]);

  const executeSpin = useCallback(async () => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        description: "需要连接钱包才能开始游戏",
        variant: "destructive",
      });
      return null;
    }

    // 检查游戏凭证
    if (creditsDisplay < currentBetCredits) {
      toast({
        title: "凭证不足",
        description: `需要 ${currentBetCredits.toLocaleString()} 游戏凭证。请先销毁代币兑换凭证。`,
        variant: "destructive",
      });
      return null;
    }

    lastActionRef.current = 'spin';
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
  }, [isConnected, creditsDisplay, currentBetCredits, contractSpin, playSpinSound]);

  // 仅在“开始游戏”动作触发后，把 hook 里的错误以更友好的方式弹出
  useEffect(() => {
    if (!contractError) return;
    if (lastActionRef.current !== 'spin') return;

    toast({
      title: '开始游戏失败',
      description: contractError,
      variant: 'destructive',
    });
    lastActionRef.current = null;
  }, [contractError]);

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

  const handleCancelStuck = async () => {
    playClickSound();
    const ok = await cancelStuckRequest();
    toast({
      title: ok ? '已尝试解除卡住请求' : '解除失败',
      description: ok ? '如确实已超时，将会重置你的挂起状态。' : (contractError || '请稍后重试（注意：需要超过 1 小时超时才能解除）'),
      variant: ok ? undefined : 'destructive',
    });
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
        description: "由于凭证不足或其他原因",
        variant: "destructive",
      });
      return;
    }

    setAutoSpinCount(prev => prev - 1);
  }, [autoSpinCount, executeSpin]);

  useEffect(() => {
    if (isAutoSpinning && !isSpinning && autoSpinCount > 0 && autoSpinRef.current) {
      const timer = setTimeout(() => runAutoSpin(), 500);
      return () => clearTimeout(timer);
    } else if (autoSpinCount <= 0 && isAutoSpinning) {
      setIsAutoSpinning(false);
      autoSpinRef.current = false;
      toast({ title: "自动旋转完成", description: "已完成所有自动旋转" });
    }
  }, [isAutoSpinning, isSpinning, autoSpinCount, runAutoSpin]);

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
            <span className="text-xs px-2 py-0.5 rounded bg-neon-green/20 text-neon-green border border-neon-green/30">
              🔗 链上模式
            </span>
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

        {pendingRequest > 0n && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div className="text-sm">
                <div>
                  检测到挂起旋转请求：<strong className="text-destructive">#{pendingRequest.toString()}</strong>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  等待 VRF 回调；如超过 1 小时可尝试解除。
                </div>
              </div>
            </div>
            <button
              onClick={handleCancelStuck}
              disabled={isSpinning}
              className="px-3 py-1 rounded bg-destructive/15 text-destructive text-sm hover:bg-destructive/25 transition-colors disabled:opacity-50"
            >
              解除
            </button>
          </motion.div>
        )}

        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="neon-border-pink rounded-lg px-4 py-2 bg-muted/50 flex items-center gap-2">
            <Coins className="w-4 h-4 text-neon-yellow" />
            <span className="text-xs text-muted-foreground">奖池</span>
            <span className="text-lg font-display neon-text-pink">
              {prizePool >= 1 ? prizePool.toFixed(2) : prizePool >= 0.01 ? prizePool.toFixed(4) : prizePool.toFixed(6)}
            </span>
            <span className="text-xs text-neon-pink">BNB</span>
          </div>
          
          <div className="neon-border rounded-lg px-4 py-2 bg-muted/50 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs text-muted-foreground">凭证</span>
            <span className="text-lg font-display text-neon-cyan">{creditsDisplay.toLocaleString()}</span>
          </div>
          
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
            {showPaylines && (
              <PaylineLines 
                activeLines={[]}
                showAll={true}
              />
            )}
            
            <div className="flex justify-center items-center gap-2 relative z-10">
              {displayGrid.map((column, reelIndex) => (
                <AdvancedSlotReel
                  key={reelIndex}
                  symbols={column}
                  isSpinning={isSpinning || isRevealing}
                  reelIndex={reelIndex}
                  winningPositions={new Set()}
                  isRevealing={isRevealing}
                  shouldStop={shouldStopReels}
                  onSpinComplete={handleReelStopped}
                />
              ))}
            </div>
          </div>
          
          {(isSpinning || isRevealing) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-background/95 border border-neon-cyan/50 shadow-[0_0_20px_hsl(195_100%_50%/0.3)]"
            >
              <Loader2 className="w-4 h-4 text-neon-cyan animate-spin" />
              <span className="text-sm text-neon-cyan font-display whitespace-nowrap">
                {isRevealing ? '开奖中...' : '等待随机数...'}
              </span>
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
                  disabled={isSpinning || isAutoSpinning || isRevealing}
                  whileHover={{ scale: (isSpinning || isAutoSpinning || isRevealing) ? 1 : 1.02 }}
                  whileTap={{ scale: (isSpinning || isAutoSpinning || isRevealing) ? 1 : 0.98 }}
                  className={`
                    cyber-button flex-1 text-lg rounded-xl py-5
                    ${(isSpinning || isAutoSpinning || isRevealing)
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-[0_0_40px_hsl(195_100%_50%/0.5)]'}
                  `}
                >
                  {(isSpinning || isRevealing) ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                        className="text-2xl"
                      >
                        🎰
                      </motion.span>
                      <span>{isRevealing ? '开奖中...' : '等待结果...'}</span>
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
                  disabled={isSpinning || isRevealing}
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
        </div>
        
        {contractError && (
          <div className="mt-2 text-center text-xs text-destructive">
            {contractError}
          </div>
        )}
      </motion.div>
      
      {/* 中奖弹窗 */}
      {winOverlayData && (
        <WinRevealOverlay
          isVisible={showWinOverlay}
          winAmount={winOverlayData.winAmount}
          prizeType={winOverlayData.prizeType}
          prizeEmoji={winOverlayData.prizeEmoji}
          symbols={winOverlayData.symbols}
          onClose={() => setShowWinOverlay(false)}
        />
      )}
    </div>
  );
}
