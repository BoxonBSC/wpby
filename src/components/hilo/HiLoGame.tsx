import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from './PlayingCard';
import { HorizontalRewardTiers } from './HorizontalRewardTiers';
import { HiLoResults } from './HiLoResults';
import { VRFWaitingOverlay } from './VRFWaitingOverlay';
import { SuccessAnimation } from './SuccessAnimation';
import { CreditsExchange } from '@/components/CreditsExchange';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@/contexts/WalletContext';
import { useCyberHiLo } from '@/hooks/useCyberHiLo';
import { useHiLoHistory } from '@/hooks/useHiLoHistory';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  HILO_CONFIG,
  HiLoGameState,
  HiLoResult,
  Card,
  Guess,
  BET_TIERS,
  REWARD_TIERS,
  SUITS,
  RANKS,
  calculateHiLoReward,
  calculateWinProbability,
} from '@/config/hilo';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronUp, ChevronDown, Equal, HandCoins, Play, Loader2, Wallet, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { toast } from '@/hooks/use-toast';
import { formatEther } from 'ethers';
import { CYBER_HILO_ADDRESS, CYBER_TOKEN_ADDRESS } from '@/config/contracts';
import { Copy, ExternalLink } from 'lucide-react';


// 将合约牌值转换为Card对象（用唯一ID确保花色一致）
// 缓存：同一局游戏中同一牌值保持相同花色
const cardCache = new Map<string, Card>();

function cardFromValue(value: number, sessionKey?: string): Card {
  const cacheKey = sessionKey ? `${sessionKey}-${value}` : `default-${value}`;
  
  if (cardCache.has(cacheKey)) {
    return cardCache.get(cacheKey)!;
  }
  
  // 用牌值作为种子确定花色，保证同一牌值始终相同花色
  const suitIndex = value % SUITS.length;
  const suit = SUITS[suitIndex];
  const rank = RANKS[value - 1];
  const card = { suit, rank, value };
  
  cardCache.set(cacheKey, card);
  return card;
}

// 清除缓存（新游戏时调用）
function clearCardCache() {
  cardCache.clear();
}

type PendingGuess = {
  guess: Guess;
  prevValue: number;
};

export function HiLoGame() {
  const { t } = useLanguage();
  
  // 钱包状态
  const { isConnected, address } = useWallet();
  
  // 持久化游戏记录（按钱包地址存储）
  const { results, addResult } = useHiLoHistory(address);
  
  // 钱包连接弹窗状态
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // 合约Hook
  const {
    prizePool,
    availablePool,
    totalBurned,
    totalPaidOut,
    gameCredits,
    gameSession,
    pendingRequest,
    unclaimedPrize,
    isPlaying: contractIsPlaying,
    isWaitingVRF,
    vrfState,
    startGame: contractStartGame,
    guess: contractGuess,
    cashOut: contractCashOut,
    claimPrize,
    cancelStuckRequest,
    calculatePotentialReward,
    calculateSafeStreak,
    refreshData,
    error: contractError,
    forceSettledReason,
    clearForceSettledReason,
  } = useCyberHiLo();
  
  // 音效
  const { 
    playCardFlipSound, 
    playSelectTierSound, 
    playCorrectGuessSound, 
    playWrongGuessSound, 
    playCashOutSound,
    playMilestoneSound,
    playClickSound,
  } = useAudio();

  // UI状态
  const [gameState, setGameState] = useState<HiLoGameState>('idle');
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [streak, setStreak] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [pendingGuess, setPendingGuess] = useState<PendingGuess | null>(null);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [currentBetTier, setCurrentBetTier] = useState(BET_TIERS[0]);
  const [guessCorrect, setGuessCorrect] = useState<boolean | null>(null);
  const [prizePoolSnapshot, setPrizePoolSnapshot] = useState<number | null>(null);
  const [isRefreshingPrize, setIsRefreshingPrize] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [showPoolWarning, setShowPoolWarning] = useState(false);
  const [pendingStartTier, setPendingStartTier] = useState<number | null>(null);

  // 防止重复结算同一轮猜测
  const settledGuessRef = useRef<string | null>(null);

  // 防止“交易尚未发起/尚未产生 VRF 请求”时误触发结算（例如钱包弹窗确认授权阶段）
  // 只有当本轮曾出现过 pendingRequest > 0 时，才允许进入“VRF 完成 -> 结算”分支。
  const sawPendingRequestRef = useRef(false);
  
  // 获取实际使用的凭证余额
  const credits = Number(gameCredits);
  const effectivePrizePool = prizePoolSnapshot ?? Number(prizePool);
  const available = Number(availablePool);
  const locked = Number(prizePool) - available;
  
  // 计算当前选择门槛的安全连胜数
  const safeStreak = calculateSafeStreak(selectedTierIndex, available);
  const selectedTierMaxStreak = BET_TIERS[selectedTierIndex]?.maxStreak || 5;
  
  // 奖池状态判断
  const poolStatus = safeStreak >= selectedTierMaxStreak ? 'good' : safeStreak >= 3 ? 'warning' : 'danger';
  
  // 当钱包连接成功后自动关闭弹窗
  useEffect(() => {
    if (isConnected && showWalletModal) {
      setShowWalletModal(false);
    }
  }, [isConnected, showWalletModal]);
  
  // 同步合约游戏状态到UI
  useEffect(() => {
    if (!gameSession) return;

    // 使用 session timestamp 作为缓存 key，确保同一局游戏花色一致
    const sessionKey = gameSession.timestamp.toString();

    if (gameSession.active) {
      setGameState('playing');
      setStreak(gameSession.currentStreak);
      setCurrentBetTier(BET_TIERS[gameSession.betTierIndex] || BET_TIERS[0]);
      setPrizePoolSnapshot(Number(formatEther(gameSession.prizePoolSnapshot)));

      // 避免在"揭示动画中"覆盖 UI 的 current/next card
      if (!isRevealing && !pendingGuess) {
        setCurrentCard(cardFromValue(gameSession.currentCard, sessionKey));
        setNextCard(null);
      }
    } else {
      // 合约会话已结束（通常表示失败或已结算）。如果前端还停留在 playing，则切到 lost
      if (gameState === 'playing' && !isRevealing) {
        setGameState('lost');
      }
    }
  }, [gameSession, gameState, isRevealing, pendingGuess]);

  // 记录本轮是否已经真正产生过 VRF 请求
  useEffect(() => {
    if (pendingRequest > 0n) {
      sawPendingRequestRef.current = true;
    }
  }, [pendingRequest]);

  // 监听奖池不足强制结算
  useEffect(() => {
    if (!forceSettledReason) return;
    
    toast({
      title: '⚠️ 奖池保护性结算',
      description: `因奖池可用余额不足以锁定下一级奖励，系统已自动结算您当前的 ${forceSettledReason.streak} 连胜收益。这是为了保护您已赢得的奖励。`,
      duration: 8000,
    });
    
    // 清除标记，防止重复提示
    clearForceSettledReason();
    
    // 刷新数据
    refreshData();
  }, [forceSettledReason, clearForceSettledReason, refreshData]);

  // VRF 完成后：结算本轮猜测，展示结果并解除"揭示中"卡死
  useEffect(() => {
    if (!pendingGuess || !gameSession) return;
    if (!isRevealing) return;

    // 关键：如果本轮还没出现过 pendingRequest>0（仍处于钱包确认/授权阶段），不要结算。
    if (!sawPendingRequestRef.current) return;

    // 等待 VRF 完成（pendingRequest 清零）
    if (isWaitingVRF || pendingRequest !== 0n) return;

    // 同一轮只结算一次
    const settleKey = `${gameSession.timestamp.toString()}-${pendingGuess.prevValue}-${pendingGuess.guess}-${gameSession.currentCard}-${gameSession.currentStreak}-${gameSession.active}`;
    if (settledGuessRef.current === settleKey) return;
    settledGuessRef.current = settleKey;

    const newValue = Number(gameSession.currentCard);
    const { prevValue, guess } = pendingGuess;
    const sessionKey = gameSession.timestamp.toString();

    const won =
      guess === 'higher'
        ? newValue > prevValue
        : guess === 'lower'
          ? newValue < prevValue
          : newValue === prevValue;

    setGuessCorrect(won);
    const revealed = cardFromValue(newValue, sessionKey);
    setNextCard(revealed);

    playCardFlipSound();
    if (won) playCorrectGuessSound();
    else playWrongGuessSound();

    const t = window.setTimeout(() => {
      setCurrentCard(revealed);
      setNextCard(null);
      setIsRevealing(false);
      setPendingGuess(null);

      // 结束本轮，复位 guard
      sawPendingRequestRef.current = false;

      // 判断游戏结果：
      // 1. 猜错 -> lost
      // 2. 猜对但游戏结束(active=false) -> 达到门槛上限，应该是won
      // 3. 猜对且游戏继续 -> 继续playing
      if (!won) {
        setGameState('lost');
      } else if (!gameSession.active) {
        // 猜对但游戏已结束 = 达到门槛上限，自动结算成功！
        const newStreak = gameSession.currentStreak;
        setStreak(newStreak);
        playCashOutSound();
        setGameState('won');
        
        // 记录结果
        const reward = calculateHiLoReward(newStreak, currentBetTier.maxStreak, effectivePrizePool);
        const result: HiLoResult = {
          id: `${Date.now()}-${Math.random()}`,
          betAmount: currentBetTier.betAmount,
          betTier: currentBetTier.id,
          streak: newStreak,
          bnbWon: reward,
          cashedOut: true,
          timestamp: Date.now(),
        };
        addResult(result);
      }
      // else: won && gameSession.active -> 继续游戏，不改变状态

      // 结果提示展示片刻后自动消失
      window.setTimeout(() => setGuessCorrect(null), 900);
    }, HILO_CONFIG.animation.flipDuration);

    return () => window.clearTimeout(t);
  }, [
    pendingGuess,
    gameSession,
    isRevealing,
    isWaitingVRF,
    pendingRequest,
    playCardFlipSound,
    playCorrectGuessSound,
    playWrongGuessSound,
    playCashOutSound,
    currentBetTier,
    effectivePrizePool,
    addResult,
  ]);

  // 监听VRF结果
  useEffect(() => {
    // 当VRF完成时刷新数据
    if (!isWaitingVRF && pendingRequest === 0n && gameState === 'playing') {
      refreshData();
    }
  }, [isWaitingVRF, pendingRequest, gameState, refreshData]);
  
  // 胜利时自动刷新待领取余额
  useEffect(() => {
    if (gameState === 'won') {
      const timer = setTimeout(() => {
        refreshData();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, refreshData]);

  // 开始游戏（带预警检查）
  const handleStartGame = useCallback(() => {
    const tier = BET_TIERS[selectedTierIndex];
    if (credits < tier.betAmount || isStartingGame) return;
    
    // 检查是否需要显示预警
    const currentSafeStreak = calculateSafeStreak(selectedTierIndex, available);
    const maxStreak = tier.maxStreak;
    
    // 如果安全连胜数 < 门槛上限的一半，显示预警
    if (currentSafeStreak < maxStreak && currentSafeStreak < Math.ceil(maxStreak / 2)) {
      setPendingStartTier(selectedTierIndex);
      setShowPoolWarning(true);
      return;
    }
    
    // 直接开始游戏
    startGame();
  }, [credits, selectedTierIndex, isStartingGame, available, calculateSafeStreak]);

  // 确认开始游戏（预警确认后）
  const confirmStartGame = useCallback(() => {
    setShowPoolWarning(false);
    setPendingStartTier(null);
    startGame();
  }, []);

  // 实际开始游戏
  const startGame = useCallback(async () => {
    const tier = BET_TIERS[selectedTierIndex];
    if (credits < tier.betAmount || isStartingGame) return;
    
    setIsStartingGame(true);
    playClickSound();
    clearCardCache(); // 新游戏清除旧缓存
    
    try {
      const firstCard = await contractStartGame(tier.betAmount);
      if (firstCard !== null) {
        playCardFlipSound();
        // 用当前时间戳作为 sessionKey（此时还没有 gameSession.timestamp）
        const newSessionKey = Date.now().toString();
        setCurrentCard(cardFromValue(firstCard, newSessionKey));
        setCurrentBetTier(tier);
        setStreak(0);
        setGameState('playing');
        setGuessCorrect(null);
        setPrizePoolSnapshot(Number(prizePool));
      }
    } finally {
      setIsStartingGame(false);
    }
  }, [credits, selectedTierIndex, prizePool, playClickSound, playCardFlipSound, contractStartGame, isStartingGame]);

  // 猜测
  const makeGuess = useCallback(async (guess: Guess) => {
    if (gameState !== 'playing' || !currentCard || isRevealing) return;
    
    playClickSound();
    
    setGuessCorrect(null);
    setNextCard(null);
    setPendingGuess({ guess, prevValue: currentCard.value });

    // 本轮开始：先把“已见到 pendingRequest”标记清零，避免 pendingRequest 仍为 0 时被误判成“已完成”
    sawPendingRequestRef.current = false;

    setIsRevealing(true);
    const txHash = await contractGuess(guess);
    
    if (!txHash) {
      setIsRevealing(false);
      setPendingGuess(null);
      sawPendingRequestRef.current = false;
      return;
    }
    
    // 等待VRF回调，通过轮询检测结果
    // useCyberHiLo会自动轮询并更新gameSession
  }, [gameState, currentCard, isRevealing, playClickSound, contractGuess]);

  // 收手兑现
  const cashOut = useCallback(async () => {
    if (gameState !== 'playing' || streak <= 0 || isCashingOut) return;
    
    setIsCashingOut(true);
    playCashOutSound();
    
    try {
      const success = await contractCashOut();
      if (success) {
        setGameState('won');
        const reward = calculateHiLoReward(streak, currentBetTier.maxStreak, effectivePrizePool);
        const result: HiLoResult = {
          id: `${Date.now()}-${Math.random()}`,
          betAmount: currentBetTier.betAmount,
          betTier: currentBetTier.name,
          streak,
          bnbWon: reward,
          cashedOut: true,
          timestamp: Date.now(),
        };
        addResult(result);
        
        toast({
          title: t('hilo.cashoutSuccess'),
          description: t('hilo.cashoutSuccessDesc').replace('{amount}', reward.toFixed(4)),
        });
      }
    } finally {
      setIsCashingOut(false);
    }
  }, [gameState, streak, currentBetTier, effectivePrizePool, playCashOutSound, contractCashOut, addResult, isCashingOut, t]);

  // 重新开始
  const resetGame = useCallback(() => {
    playClickSound();
    clearCardCache(); // 清除牌缓存，新游戏重新生成花色
    setGameState('idle');
    setCurrentCard(null);
    setNextCard(null);
    setStreak(0);
    setGuessCorrect(null);
    setPrizePoolSnapshot(null);
    setIsRevealing(false);
    refreshData();
  }, [playClickSound, refreshData]);

  // 选择门槛
  const handleSelectTier = useCallback((index: number, canAfford: boolean) => {
    if (canAfford) {
      playSelectTierSound();
      setSelectedTierIndex(index);
    }
  }, [playSelectTierSound]);

  // 领取奖励
  const handleClaimPrize = useCallback(async () => {
    if (Number(unclaimedPrize) > 0) {
      const success = await claimPrize();
      if (success) {
        toast({ title: t('hilo.rewardClaimed') });
      }
    }
  }, [claimPrize, unclaimedPrize, t]);

  const currentReward = calculateHiLoReward(streak, currentBetTier.maxStreak, effectivePrizePool);
  const higherProb = currentCard ? (calculateWinProbability(currentCard.value, 'higher') * 100).toFixed(1) : '0';
  const lowerProb = currentCard ? (calculateWinProbability(currentCard.value, 'lower') * 100).toFixed(1) : '0';

  // 显示合约错误
  useEffect(() => {
    if (contractError) {
      toast({ title: contractError, variant: 'destructive' });
    }
  }, [contractError]);

  return (
    <div className="min-h-screen bg-background pt-4">
      <div className="container mx-auto px-4">
        {/* 合约地址展示 - 顶部 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3"
        >
          {/* 游戏合约 */}
          <div 
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm"
            style={{
              background: 'linear-gradient(90deg, rgba(201, 163, 71, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.25)',
            }}
          >
            <span className="text-xs sm:text-sm">🎴</span>
            <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap" style={{ color: '#C9A347' }}>{t('hilo.gameContract')}:</span>
            <code 
              className="text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
              style={{ 
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <span className="hidden sm:inline">{`${CYBER_HILO_ADDRESS.mainnet.slice(0, 10)}...${CYBER_HILO_ADDRESS.mainnet.slice(-8)}`}</span>
              <span className="sm:hidden">{`${CYBER_HILO_ADDRESS.mainnet.slice(0, 6)}...${CYBER_HILO_ADDRESS.mainnet.slice(-4)}`}</span>
            </code>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(CYBER_HILO_ADDRESS.mainnet);
                  toast({ title: t('contract.gameContractCopied') });
                }}
                className="p-1.5 rounded-lg transition-colors hover:bg-[#C9A347]/20"
                title={t('contract.copy')}
              >
                <Copy className="w-3.5 h-3.5" style={{ color: '#C9A347' }} />
              </button>
              <a
                href={`https://bscscan.com/address/${CYBER_HILO_ADDRESS.mainnet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg transition-colors hover:bg-[#C9A347]/20"
                title={t('contract.view')}
              >
                <ExternalLink className="w-3.5 h-3.5" style={{ color: '#C9A347' }} />
              </a>
            </div>
          </div>

          {/* 代币合约 */}
          <div 
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm"
            style={{
              background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.25)',
            }}
          >
            <span className="text-xs sm:text-sm">🪙</span>
            <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap" style={{ color: '#FFD700' }}>{t('hilo.tokenContract')}:</span>
            <code 
              className="text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
              style={{ 
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <span className="hidden sm:inline">{`${CYBER_TOKEN_ADDRESS.mainnet.slice(0, 10)}...${CYBER_TOKEN_ADDRESS.mainnet.slice(-8)}`}</span>
              <span className="sm:hidden">{`${CYBER_TOKEN_ADDRESS.mainnet.slice(0, 6)}...${CYBER_TOKEN_ADDRESS.mainnet.slice(-4)}`}</span>
            </code>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(CYBER_TOKEN_ADDRESS.mainnet);
                  toast({ title: t('contract.tokenContractCopied') });
                }}
                className="p-1.5 rounded-lg transition-colors hover:bg-[#FFD700]/20"
                title={t('contract.copy')}
              >
                <Copy className="w-3.5 h-3.5" style={{ color: '#FFD700' }} />
              </button>
              <a
                href={`https://bscscan.com/token/${CYBER_TOKEN_ADDRESS.mainnet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg transition-colors hover:bg-[#FFD700]/20"
                title={t('contract.view')}
              >
                <ExternalLink className="w-3.5 h-3.5" style={{ color: '#FFD700' }} />
              </a>
            </div>
          </div>
        </motion.div>

        {/* 资金分配说明 */}
        <div 
          className="mb-4 px-4 py-2 rounded-lg text-xs"
          style={{
            background: 'rgba(201, 163, 71, 0.08)',
            border: '1px solid rgba(201, 163, 71, 0.2)',
            color: '#C9A347',
          }}
        >
          <span className="font-semibold">{t('hilo.fundsAllocation')}</span>
          <span className="ml-2">{t('hilo.playerReward')}</span>
          <span className="mx-2">|</span>
          <span>{t('hilo.vrfFunding')}</span>
        </div>
        
        {/* 待领取奖励提示 */}
        {Number(unclaimedPrize) > 0 && (
          <div 
            className="mb-4 px-4 py-3 rounded-lg flex items-center justify-between"
            style={{
              background: 'rgba(0, 255, 200, 0.1)',
              border: '1px solid rgba(0, 255, 200, 0.3)',
            }}
          >
            <span style={{ color: '#00FFC8' }}>
              {t('hilo.unclaimedBnb').replace('{amount}', Number(unclaimedPrize).toFixed(4))}
            </span>
            <Button
              onClick={handleClaimPrize}
              size="sm"
              className="bg-[#00FFC8] text-black hover:bg-[#00FFC8]/80"
            >
              {t('hilo.claimReward')}
            </Button>
          </div>
        )}

        {/* 奖池预警弹窗 */}
        <AnimatePresence>
          {showPoolWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPoolWarning(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="mx-4 max-w-md rounded-2xl p-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(40, 30, 20, 0.98) 0%, rgba(20, 15, 10, 0.98) 100%)',
                  border: '1px solid rgba(255, 180, 0, 0.4)',
                  boxShadow: '0 0 40px rgba(255, 180, 0, 0.2)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                  <h3 className="text-xl font-bold text-orange-400">{t('hilo.poolWarningTitle')}</h3>
                </div>
                
                <p className="text-[#C9A347]/80 mb-6 leading-relaxed">
                  {t('hilo.poolWarningDesc')
                    .replace('{available}', available.toFixed(4))
                    .replace('{safe}', safeStreak.toString())}
                </p>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-[#C9A347]/30 text-[#C9A347] hover:bg-[#C9A347]/10"
                    onClick={() => setShowPoolWarning(false)}
                  >
                    {t('hilo.poolWarningCancel')}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
                    onClick={confirmStartGame}
                  >
                    {t('hilo.poolWarningConfirm')}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 主游戏区域 - 两栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* 左侧 - 游戏区 + 奖励阶梯 */}
          <div className="lg:col-span-9 space-y-3 sm:space-y-4">
            {/* 统计栏：奖池(含锁定详情) + 全网燃烧 + 我的凭证 */}
            <div className="mb-3 sm:mb-4 grid grid-cols-3 gap-2 sm:gap-3">
              {/* 奖池 - 带锁定详情 */}
              <div 
                className="rounded-xl p-2.5 sm:p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(201, 163, 71, 0.08) 100%)',
                  border: `1px solid ${poolStatus === 'good' ? 'rgba(0, 255, 200, 0.3)' : poolStatus === 'warning' ? 'rgba(255, 200, 0, 0.4)' : 'rgba(255, 100, 100, 0.4)'}`,
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.08)',
                }}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-lg flex-shrink-0"
                    style={{ background: 'rgba(255, 215, 0, 0.2)' }}
                  >
                    💰
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] sm:text-xs truncate" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>{t('hilo.currentPool')}</div>
                    <div 
                      className="text-sm sm:text-xl font-bold truncate"
                      style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}
                    >
                      {Number(prizePool).toFixed(4)} <span className="text-[10px] sm:text-sm">BNB</span>
                    </div>
                    {/* 可用/锁定详情 */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[8px] sm:text-[10px]" style={{ color: 'rgba(0, 255, 200, 0.8)' }}>
                        {t('hilo.availablePool')}: {available.toFixed(3)}
                      </span>
                      <span className="text-[8px] sm:text-[10px]" style={{ color: 'rgba(255, 100, 100, 0.6)' }}>
                        | {t('hilo.lockedPool')}: {locked.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 全网燃烧 */}
              <div 
                className="rounded-xl p-2.5 sm:p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 100, 50, 0.15) 0%, rgba(201, 80, 20, 0.08) 100%)',
                  border: '1px solid rgba(255, 100, 50, 0.3)',
                  boxShadow: '0 0 20px rgba(255, 100, 50, 0.08)',
                }}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-lg flex-shrink-0"
                    style={{ background: 'rgba(255, 100, 50, 0.2)' }}
                  >
                    🔥
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-xs truncate" style={{ color: 'rgba(255, 150, 100, 0.8)' }}>{t('hilo.totalBurned')}</div>
                    <div 
                      className="text-sm sm:text-xl font-bold truncate"
                      style={{ fontFamily: '"Cinzel", serif', color: '#FF6432' }}
                    >
                      {(() => {
                        const burned = Number(totalBurned);
                        if (burned >= 1000000) return `${(burned / 1000000).toFixed(2)}M`;
                        if (burned >= 1000) return `${(burned / 1000).toFixed(1)}K`;
                        return burned.toFixed(0);
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 已派发奖励 */}
              <div 
                className="rounded-xl p-2.5 sm:p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 200, 0.15) 0%, rgba(0, 200, 150, 0.08) 100%)',
                  border: '1px solid rgba(0, 255, 200, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 255, 200, 0.08)',
                }}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-lg flex-shrink-0"
                    style={{ background: 'rgba(0, 255, 200, 0.2)' }}
                  >
                    💵
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] sm:text-xs truncate" style={{ color: 'rgba(0, 255, 200, 0.7)' }}>{t('hilo.totalPaidOut')}</div>
                    <div 
                      className="text-sm sm:text-xl font-bold truncate"
                      style={{ fontFamily: '"Cinzel", serif', color: '#00FFC8' }}
                    >
                      {Number(totalPaidOut).toFixed(4)} <span className="text-[10px] sm:text-sm">BNB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 relative"
              style={{
                background: 'linear-gradient(180deg, rgba(20, 16, 12, 0.95) 0%, rgba(10, 8, 6, 0.98) 100%)',
                border: '1px solid rgba(201, 163, 71, 0.25)',
                minHeight: '400px',
              }}
            >
              {/* VRF等待状态覆盖层 */}
              <VRFWaitingOverlay
                isVisible={isWaitingVRF}
                requestId={vrfState.requestId}
                startTime={vrfState.startTime}
                onCancel={async () => {
                  const ok = await cancelStuckRequest();
                  if (ok) {
                    setIsRevealing(false);
                    setPendingGuess(null);
                    setNextCard(null);
                    setGuessCorrect(null);
                    settledGuessRef.current = null;
                  }
                  return ok;
                }}
              />
              
              {/* 连胜显示 */}
              {gameState === 'playing' && streak > 0 && (() => {
                const currentTier = REWARD_TIERS.find(t => t.streak === streak);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 px-3 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm"
                    style={{
                      background: `linear-gradient(90deg, ${currentBetTier.color}30 0%, transparent 100%)`,
                      border: `1px solid ${currentBetTier.color}60`,
                    }}
                  >
                    <span className="font-bold" style={{ color: currentBetTier.color }}>
                      {t('hilo.streak')} {streak}/{currentBetTier.maxStreak}
                    </span>
                    <span className="text-[#C9A347] ml-1 sm:ml-2 hidden sm:inline">| {currentTier?.percentage ?? 0}% (≈{currentReward.toFixed(4)} BNB)</span>
                    <span className="text-[#C9A347] ml-1 sm:hidden">| {currentTier?.percentage ?? 0}%</span>
                  </motion.div>
                );
              })()}

              {/* 牌区 */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 min-h-[220px] sm:min-h-[280px] mt-8 sm:mt-4">
                <div className="text-center">
                  <div className="text-[#C9A347]/60 text-xs sm:text-sm mb-1 sm:mb-2">{t('hilo.currentCard')}</div>
                  {/* 没有当前牌时显示牌背，有牌时正常显示 */}
                  <PlayingCard card={currentCard} isFlipped={!currentCard} />
                </div>

                {gameState === 'playing' && !isRevealing && !isWaitingVRF && (
                  <div className="text-[#C9A347]/40 text-4xl">→</div>
                )}

                {/* 揭示阶段：显示待揭示的牌（VRF等待中或正在揭示动画） */}
                {(isWaitingVRF || isRevealing) && (
                  <div className="text-center">
                    <div className="text-[#C9A347]/60 text-sm mb-2">{t('hilo.nextCard')}</div>
                    {/* VRF等待中或nextCard未设置时显示牌背 */}
                    {(isWaitingVRF || !nextCard) ? (
                      <PlayingCard card={null} isFlipped={true} />
                    ) : (
                      /* VRF完成且nextCard已设置：从牌背翻转揭示 */
                      <PlayingCard card={nextCard} isFlipped={false} isNew />
                    )}
                  </div>
                )}
              </div>

              {/* 结果提示 */}
              <AnimatePresence>
                {guessCorrect !== null && !isRevealing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`
                      absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      px-8 py-4 rounded-2xl text-3xl font-bold
                      ${guessCorrect ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-red-500/20 text-red-400 border-red-500/40'}
                      border
                    `}
                    style={{
                      textShadow: guessCorrect 
                        ? '0 0 20px rgba(74, 222, 128, 0.8)'
                        : '0 0 20px rgba(248, 113, 113, 0.8)',
                    }}
                  >
                    {guessCorrect ? t('hilo.correct') : t('hilo.wrong')}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 控制区 */}
              <div className="mt-8">
                {/* 闲置状态 - 单一门槛500K */}
                {gameState === 'idle' && (
                  <div className="space-y-4">
                    {/* 游戏说明 */}
                    <div 
                      className="rounded-xl p-4 text-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
                        border: '1px solid rgba(255, 215, 0, 0.25)',
                      }}
                    >
                      <div className="text-[#FFD700] font-bold text-lg mb-2" style={{ fontFamily: '"Cinzel", serif' }}>
                        {t('hilo.gameIntro')}
                      </div>
                      <div className="text-[#C9A347]/80 text-sm space-y-1">
                        <p>🎴 {t('hilo.gameIntroLine1')}</p>
                        <p>🏆 {t('hilo.gameIntroLine2')}</p>
                        <p>💰 {t('hilo.gameIntroLine3')}</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={isConnected ? handleStartGame : () => setShowWalletModal(true)}
                      disabled={(isConnected && credits < BET_TIERS[0].betAmount) || isStartingGame}
                      className="w-full h-14 text-lg font-bold"
                      style={{
                        background: isStartingGame
                          ? 'rgba(201, 163, 71, 0.3)'
                          : !isConnected 
                            ? 'linear-gradient(135deg, #C9A347 0%, #8B7230 100%)'
                            : credits >= BET_TIERS[0].betAmount
                              ? 'linear-gradient(135deg, #FFD700 0%, #C9A347 100%)'
                              : 'rgba(201, 163, 71, 0.2)',
                        color: isStartingGame
                          ? '#FFD700'
                          : !isConnected 
                            ? '#000' 
                            : credits >= BET_TIERS[0].betAmount ? '#000' : 'rgba(201, 163, 71, 0.5)',
                      }}
                    >
                      {isStartingGame ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="mr-2"
                          >
                            ⏳
                          </motion.span>
                          {t('hilo.authorizing')}
                        </>
                      ) : (
                        <>
                          {!isConnected ? <Wallet className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                          {!isConnected ? t('hilo.clickConnect') : (
                            <>{t('hilo.startGame')} (500K {t('hilo.credits')})</>
                          )}
                        </>
                      )}
                    </Button>
                    
                    {/* 凭证不足提示 */}
                    {isConnected && credits < BET_TIERS[0].betAmount && (
                      <div className="text-center text-sm text-[#FF6B6B]">
                        {t('hilo.needMore').replace('{n}', `${Math.ceil((BET_TIERS[0].betAmount - credits) / 1000)}K`)}
                      </div>
                    )}
                  </div>
                )}

                {/* 游戏中 - 选择 */}
                {gameState === 'playing' && !isRevealing && !isWaitingVRF && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => makeGuess('higher')}
                        className="h-16 flex flex-col items-center justify-center bg-green-600/80 hover:bg-green-500"
                      >
                        <ChevronUp className="w-6 h-6" />
                        <span className="text-sm">{t('hilo.higher')} ({higherProb}%)</span>
                      </Button>
                      
                      <Button
                        onClick={() => makeGuess('lower')}
                        className="h-16 flex flex-col items-center justify-center bg-red-600/80 hover:bg-red-500"
                      >
                        <ChevronDown className="w-6 h-6" />
                        <span className="text-sm">{t('hilo.lower')} ({lowerProb}%)</span>
                      </Button>
                    </div>

                    {/* 平局提示 - 猜大猜小时平局算输 */}
                    <div className="text-center text-[10px] text-[#C9A347]/50 py-1">
                      {t('hilo.tieWarning')}
                    </div>

                    {/* 收手按钮 */}
                    {streak > 0 && (() => {
                      const currentTier = REWARD_TIERS.find(t => t.streak === streak);
                      return (
                        <Button
                          onClick={cashOut}
                          disabled={isCashingOut}
                          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:from-[#FFA500] hover:to-[#FFD700] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isCashingOut ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              {t('hilo.settling')}
                            </>
                          ) : (
                            <>
                              <HandCoins className="w-5 h-5 mr-2" />
                              {t('hilo.cashout').replace('{percent}', String(currentTier?.percentage ?? 0)).replace('{amount}', currentReward.toFixed(4))}
                            </>
                          )}
                        </Button>
                      );
                    })()}
                  </div>
                )}

                {/* 等待揭示 */}
                {isRevealing && !isWaitingVRF && (
                  <div className="text-center py-8">
                    <div className="text-[#C9A347] text-xl animate-pulse">{t('hilo.revealing')}</div>
                  </div>
                )}

                {/* 游戏结束 */}
                {(gameState === 'won' || gameState === 'lost') && (() => {
                  const currentTier = REWARD_TIERS.find(t => t.streak === streak);
                  const hasUnclaimedPrize = Number(unclaimedPrize) > 0;
                  
                  return (
                    <div className="text-center space-y-4">
                      <div 
                        className={`text-2xl font-bold py-4 ${gameState === 'won' ? 'text-[#FFD700]' : 'text-red-400'}`}
                      >
                        {gameState === 'won' ? (
                          <>
                            <div>{t('hilo.congrats').replace('{percent}', String(currentTier?.percentage ?? 0))}</div>
                            <div className="text-lg mt-1">≈ {currentReward.toFixed(4)} BNB</div>
                          </>
                        ) : (
                          <>{t('hilo.gameOver').replace('{n}', String(streak))}</>
                        )}
                      </div>
                      
                      {/* 胜利时始终显示领取奖励提示 */}
                      {gameState === 'won' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative p-4 rounded-xl overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)',
                            border: '2px solid rgba(255, 215, 0, 0.5)',
                            boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1)',
                          }}
                        >
                          {/* 闪烁光效 */}
                          <motion.div
                            className="absolute inset-0 opacity-30"
                            animate={{
                              background: [
                                'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.4) 50%, transparent 100%)',
                                'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.4) 50%, transparent 100%)',
                              ],
                              x: ['-100%', '100%'],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          
                          <div className="relative z-10">
                            {hasUnclaimedPrize ? (
                              <>
                                {/* 转账失败，需要手动领取 */}
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <HandCoins className="w-6 h-6 text-[#FFD700]" />
                                  <span className="text-[#FFD700] font-bold text-lg">
                                    {t('hilo.pendingReward')}
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-white mb-3">
                                  {Number(unclaimedPrize).toFixed(4)} BNB
                                </div>
                                <Button
                                  onClick={async () => {
                                    const success = await claimPrize();
                                    if (success) {
                                      toast({
                                        title: t('hilo.claimSuccess'),
                                        description: t('hilo.claimSuccessDesc').replace('{amount}', Number(unclaimedPrize).toFixed(4)),
                                      });
                                    }
                                  }}
                                  className="w-full h-12 text-lg font-bold animate-pulse"
                                  style={{
                                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                    color: '#000',
                                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                                  }}
                                >
                                  <HandCoins className="w-5 h-5 mr-2" />
                                  {t('hilo.claimNow')}
                                </Button>
                                <p className="text-[#C9A347]/70 text-xs mt-2">
                                  {t('hilo.gasFeeNote')}
                                </p>
                              </>
                            ) : (
                              <>
                                {/* 奖励已自动发送到钱包 - 使用醒目动画 */}
                                <SuccessAnimation amount={currentReward} />
                                <Button
                                  onClick={() => resetGame()}
                                  className="w-full h-12 text-lg font-bold mt-4"
                                  style={{
                                    background: 'linear-gradient(135deg, #00FFC8 0%, #00AA88 100%)',
                                    color: '#000',
                                  }}
                                >
                                  <Play className="w-5 h-5 mr-2" />
                                  {t('hilo.playAgain')}
                                </Button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                      
                      {/* 失败时如果有待领取奖励也显示 */}
                      {gameState === 'lost' && hasUnclaimedPrize && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg"
                          style={{
                            background: 'rgba(201, 163, 71, 0.1)',
                            border: '1px solid rgba(201, 163, 71, 0.3)',
                          }}
                        >
                          <p className="text-[#C9A347] text-sm mb-2">
                            {t('hilo.unclaimedBnb').replace('{amount}', Number(unclaimedPrize).toFixed(4))}
                          </p>
                          <Button
                            onClick={claimPrize}
                            size="sm"
                            className="bg-[#C9A347] text-black hover:bg-[#FFD700]"
                          >
                            <HandCoins className="w-4 h-4 mr-1" />
                            {t('hilo.claimReward')}
                          </Button>
                        </motion.div>
                      )}
                      
                      <Button
                        onClick={resetGame}
                        className="w-full h-14 text-lg font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${currentBetTier.color} 0%, ${currentBetTier.color}CC 100%)`,
                          color: '#000',
                        }}
                      >
                        <Play className="w-5 h-5 mr-2" />
                        {t('hilo.playAgain')}
                      </Button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* 右侧 - 代币兑换 + 历史记录 */}
          <div className="lg:col-span-3 space-y-4">
            <CreditsExchange onExchangeSuccess={refreshData} />
            <HiLoResults results={results} />
          </div>
        </div>

        {/* 横向奖励阶梯 - 铺满整个页面宽度 */}
        <div className="mt-6">
          <HorizontalRewardTiers
            currentStreak={streak}
            prizePool={effectivePrizePool}
            currentBetTier={currentBetTier}
          />
        </div>

      </div>

      {/* 钱包连接弹窗 */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            key="wallet-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowWalletModal(false)}
                className="absolute -top-10 right-0 text-[#C9A347]/60 hover:text-[#C9A347] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <WalletConnect />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
