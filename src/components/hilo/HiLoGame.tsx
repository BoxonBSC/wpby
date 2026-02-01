import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from './PlayingCard';
import { HorizontalRewardTiers } from './HorizontalRewardTiers';
import { HiLoResults } from './HiLoResults';
import { VRFWaitingOverlay } from './VRFWaitingOverlay';
import { CreditsExchange } from '@/components/CreditsExchange';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@/contexts/WalletContext';
import { useCyberHiLo } from '@/hooks/useCyberHiLo';
import { useHiLoHistory } from '@/hooks/useHiLoHistory';
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
import { ChevronUp, ChevronDown, Equal, HandCoins, Play, Loader2, Wallet, X } from 'lucide-react';
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
  // 钱包状态
  const { isConnected, address } = useWallet();
  
  // 持久化游戏记录（按钱包地址存储）
  const { results, addResult } = useHiLoHistory(address);
  
  // 钱包连接弹窗状态
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // 合约Hook
  const {
    prizePool,
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
    refreshData,
    error: contractError,
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

  // 防止重复结算同一轮猜测
  const settledGuessRef = useRef<string | null>(null);
  
  // 获取实际使用的凭证余额
  const credits = Number(gameCredits);
  const effectivePrizePool = prizePoolSnapshot ?? Number(prizePool);
  
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

  // VRF 完成后：结算本轮猜测，展示结果并解除"揭示中"卡死
  useEffect(() => {
    if (!pendingGuess || !gameSession) return;
    if (!isRevealing) return;

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

  // 开始游戏
  const startGame = useCallback(async () => {
    const tier = BET_TIERS[selectedTierIndex];
    if (credits < tier.betAmount) return;
    
    playClickSound();
    clearCardCache(); // 新游戏清除旧缓存
    
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
  }, [credits, selectedTierIndex, prizePool, playClickSound, playCardFlipSound, contractStartGame]);

  // 猜测
  const makeGuess = useCallback(async (guess: Guess) => {
    if (gameState !== 'playing' || !currentCard || isRevealing) return;
    
    playClickSound();
    
    setGuessCorrect(null);
    setNextCard(null);
    setPendingGuess({ guess, prevValue: currentCard.value });
    setIsRevealing(true);
    const txHash = await contractGuess(guess);
    
    if (!txHash) {
      setIsRevealing(false);
      setPendingGuess(null);
      return;
    }
    
    // 等待VRF回调，通过轮询检测结果
    // useCyberHiLo会自动轮询并更新gameSession
  }, [gameState, currentCard, isRevealing, playClickSound, contractGuess]);

  // 收手兑现
  const cashOut = useCallback(async () => {
    if (gameState !== 'playing' || streak <= 0) return;
    
    playCashOutSound();
    
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
    }
  }, [gameState, streak, currentBetTier, effectivePrizePool, playCashOutSound, contractCashOut, addResult]);

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
        toast({ title: '奖励已领取!' });
      }
    }
  }, [claimPrize, unclaimedPrize]);

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
          className="mb-4 flex flex-wrap justify-center gap-3"
        >
          {/* 游戏合约 */}
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: 'linear-gradient(90deg, rgba(201, 163, 71, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.25)',
            }}
          >
            <span className="text-sm">🎴</span>
            <span className="text-xs font-semibold" style={{ color: '#C9A347' }}>游戏合约:</span>
            <code 
              className="text-xs font-mono px-2 py-1 rounded"
              style={{ 
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {`${CYBER_HILO_ADDRESS.mainnet.slice(0, 10)}...${CYBER_HILO_ADDRESS.mainnet.slice(-8)}`}
            </code>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(CYBER_HILO_ADDRESS.mainnet);
                  toast({ title: '游戏合约地址已复制!' });
                }}
                className="p-1.5 rounded-lg transition-colors hover:bg-[#C9A347]/20"
                title="复制地址"
              >
                <Copy className="w-3.5 h-3.5" style={{ color: '#C9A347' }} />
              </button>
              <a
                href={`https://bscscan.com/address/${CYBER_HILO_ADDRESS.mainnet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg transition-colors hover:bg-[#C9A347]/20"
                title="在 BscScan 查看"
              >
                <ExternalLink className="w-3.5 h-3.5" style={{ color: '#C9A347' }} />
              </a>
            </div>
          </div>

          {/* 代币合约 */}
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.25)',
            }}
          >
            <span className="text-sm">🪙</span>
            <span className="text-xs font-semibold" style={{ color: '#FFD700' }}>代币合约:</span>
            <code 
              className="text-xs font-mono px-2 py-1 rounded"
              style={{ 
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {`${CYBER_TOKEN_ADDRESS.mainnet.slice(0, 10)}...${CYBER_TOKEN_ADDRESS.mainnet.slice(-8)}`}
            </code>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(CYBER_TOKEN_ADDRESS.mainnet);
                  toast({ title: '代币合约地址已复制!' });
                }}
                className="p-1.5 rounded-lg transition-colors hover:bg-[#FFD700]/20"
                title="复制地址"
              >
                <Copy className="w-3.5 h-3.5" style={{ color: '#FFD700' }} />
              </button>
              <a
                href={`https://bscscan.com/token/${CYBER_TOKEN_ADDRESS.mainnet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg transition-colors hover:bg-[#FFD700]/20"
                title="在 BscScan 查看"
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
          <span className="font-semibold">💰 资金分配：</span>
          <span className="ml-2">95% 用于玩家奖励发放</span>
          <span className="mx-2">|</span>
          <span>5% 用于 VRF 随机数服务充值</span>
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
              您有 {Number(unclaimedPrize).toFixed(4)} BNB 待领取
            </span>
            <Button
              onClick={handleClaimPrize}
              size="sm"
              className="bg-[#00FFC8] text-black hover:bg-[#00FFC8]/80"
            >
              领取奖励
            </Button>
          </div>
        )}

        {/* 主游戏区域 - 两栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧 - 游戏区 + 奖励阶梯 */}
          <div className="lg:col-span-9 space-y-4">
            {/* 奖池显示 */}
            <div 
              className="mb-4 rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(201, 163, 71, 0.08) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.1)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ background: 'rgba(255, 215, 0, 0.2)' }}
                  >
                    💰
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>当前奖池</div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}
                    >
                      {Number(prizePool).toFixed(4)} BNB
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>我的凭证</div>
                  <div 
                    className="text-xl font-bold"
                    style={{ fontFamily: '"Cinzel", serif', color: '#00FFC8' }}
                  >
                    {credits >= 1000000 
                      ? `${(credits / 1000000).toFixed(2)}M`
                      : credits >= 1000
                      ? `${(credits / 1000).toFixed(1)}K`
                      : Math.floor(credits).toLocaleString()
                    }
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              className="rounded-2xl p-6 relative"
              style={{
                background: 'linear-gradient(180deg, rgba(20, 16, 12, 0.95) 0%, rgba(10, 8, 6, 0.98) 100%)',
                border: '1px solid rgba(201, 163, 71, 0.25)',
                minHeight: '500px',
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
                    className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${currentBetTier.color}30 0%, transparent 100%)`,
                      border: `1px solid ${currentBetTier.color}60`,
                    }}
                  >
                    <span className="font-bold" style={{ color: currentBetTier.color }}>
                      连胜 {streak}/{currentBetTier.maxStreak}
                    </span>
                    <span className="text-[#C9A347] ml-2">| {currentTier?.percentage ?? 0}% (≈{currentReward.toFixed(4)} BNB)</span>
                  </motion.div>
                );
              })()}

              {/* 牌区 */}
              <div className="flex items-center justify-center gap-8 min-h-[300px]">
                <div className="text-center">
                  <div className="text-[#C9A347]/60 text-sm mb-2">当前牌</div>
                  <PlayingCard card={currentCard} isFlipped={false} />
                </div>

                {gameState === 'playing' && !isRevealing && !isWaitingVRF && (
                  <div className="text-[#C9A347]/40 text-4xl">→</div>
                )}

                {/* VRF等待中：显示背面的牌 */}
                {(isWaitingVRF || (isRevealing && !nextCard)) && (
                  <div className="text-center">
                    <div className="text-[#C9A347]/60 text-sm mb-2">下一张</div>
                    <PlayingCard card={null} isFlipped={true} />
                  </div>
                )}

                {/* VRF完成后：显示揭示的牌 */}
                {nextCard && !isWaitingVRF && (
                  <div className="text-center">
                    <div className="text-[#C9A347]/60 text-sm mb-2">下一张</div>
                    <PlayingCard card={nextCard} isFlipped={false} isNew />
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
                    {guessCorrect ? '正确!' : '错误!'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 控制区 */}
              <div className="mt-8">
                {/* 闲置状态 - 选择门槛 */}
                {gameState === 'idle' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#C9A347]/60 text-sm mb-3 block">选择门槛等级</label>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          {BET_TIERS.slice(0, 3).map((tier, index) => {
                            const canAfford = credits >= tier.betAmount;
                            const isSelected = selectedTierIndex === index;
                            const maxRewardTier = REWARD_TIERS.find(r => r.streak === tier.maxStreak);
                            
                            return (
                              <button
                                key={tier.id}
                                onClick={() => handleSelectTier(index, canAfford)}
                                disabled={!canAfford}
                                className={`
                                  p-3 rounded-xl transition-all text-center
                                  ${canAfford ? 'hover:scale-105' : 'opacity-40 cursor-not-allowed'}
                                `}
                                style={{
                                  background: isSelected 
                                    ? `linear-gradient(135deg, ${tier.color}30 0%, ${tier.color}10 100%)`
                                    : 'rgba(0,0,0,0.3)',
                                  border: `2px solid ${isSelected ? tier.color : 'rgba(201, 163, 71, 0.2)'}`,
                                  boxShadow: isSelected ? `0 0 15px ${tier.color}40` : 'none',
                                }}
                              >
                                <div className="font-bold text-base" style={{ color: tier.color }}>
                                  {tier.name}
                                </div>
                                <div className="text-[#C9A347]/60 text-xs">
                                  {tier.betAmount >= 1000000 ? `${tier.betAmount / 1000000}M` : `${tier.betAmount / 1000}K`}
                                </div>
                                <div className="text-[10px] mt-1 text-[#FFD700]">
                                  最高 {maxRewardTier?.percentage ?? 0}% 奖池
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-w-[66%] mx-auto">
                          {BET_TIERS.slice(3).map((tier, i) => {
                            const index = i + 3;
                            const canAfford = credits >= tier.betAmount;
                            const isSelected = selectedTierIndex === index;
                            const maxRewardTier = REWARD_TIERS.find(r => r.streak === tier.maxStreak);
                            
                            return (
                              <button
                                key={tier.id}
                                onClick={() => handleSelectTier(index, canAfford)}
                                disabled={!canAfford}
                                className={`
                                  p-3 rounded-xl transition-all text-center
                                  ${canAfford ? 'hover:scale-105' : 'opacity-40 cursor-not-allowed'}
                                `}
                                style={{
                                  background: isSelected 
                                    ? `linear-gradient(135deg, ${tier.color}30 0%, ${tier.color}10 100%)`
                                    : 'rgba(0,0,0,0.3)',
                                  border: `2px solid ${isSelected ? tier.color : 'rgba(201, 163, 71, 0.2)'}`,
                                  boxShadow: isSelected ? `0 0 15px ${tier.color}40` : 'none',
                                }}
                              >
                                <div className="font-bold text-base" style={{ color: tier.color }}>
                                  {tier.name}
                                </div>
                                <div className="text-[#C9A347]/60 text-xs">
                                  {tier.betAmount >= 1000000 ? `${tier.betAmount / 1000000}M` : `${tier.betAmount / 1000}K`}
                                </div>
                                <div className="text-[10px] mt-1 text-[#FFD700]">
                                  最高 {maxRewardTier?.percentage ?? 0}% 奖池
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={isConnected ? startGame : () => setShowWalletModal(true)}
                      disabled={isConnected && credits < BET_TIERS[selectedTierIndex].betAmount}
                      className="w-full h-14 text-lg font-bold"
                      style={{
                        background: !isConnected 
                          ? 'linear-gradient(135deg, #C9A347 0%, #8B7230 100%)'
                          : credits >= BET_TIERS[selectedTierIndex].betAmount
                            ? `linear-gradient(135deg, ${BET_TIERS[selectedTierIndex].color} 0%, ${BET_TIERS[selectedTierIndex].color}CC 100%)`
                            : 'rgba(201, 163, 71, 0.2)',
                        color: !isConnected 
                          ? '#000' 
                          : credits >= BET_TIERS[selectedTierIndex].betAmount ? '#000' : 'rgba(201, 163, 71, 0.5)',
                      }}
                    >
                      {!isConnected ? <Wallet className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                      {!isConnected ? '点击连接钱包' : (
                        <>开始游戏 ({BET_TIERS[selectedTierIndex].betAmount >= 1000000 
                          ? `${BET_TIERS[selectedTierIndex].betAmount / 1000000}M` 
                          : `${BET_TIERS[selectedTierIndex].betAmount / 1000}K`})</>
                      )}
                    </Button>
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
                        <span className="text-sm">更高 ({higherProb}%)</span>
                      </Button>
                      
                      <Button
                        onClick={() => makeGuess('lower')}
                        className="h-16 flex flex-col items-center justify-center bg-red-600/80 hover:bg-red-500"
                      >
                        <ChevronDown className="w-6 h-6" />
                        <span className="text-sm">更低 ({lowerProb}%)</span>
                      </Button>
                    </div>

                    {/* 相同选项 - 高风险高回报 (7.7%胜率，成功跳2级) */}
                    <Button
                      onClick={() => makeGuess('same')}
                      className="w-full h-12 bg-gradient-to-r from-[#C9A347]/60 to-[#FFD700]/40 hover:from-[#C9A347]/80 hover:to-[#FFD700]/60 border border-[#C9A347]/40"
                    >
                      <Equal className="w-5 h-5 mr-2" />
                      <span>相同 (7.7%)</span>
                      <span className="ml-2 px-2 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] text-xs">+2级</span>
                    </Button>

                    {/* 收手按钮 */}
                    {streak > 0 && (() => {
                      const currentTier = REWARD_TIERS.find(t => t.streak === streak);
                      return (
                        <Button
                          onClick={cashOut}
                          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:from-[#FFA500] hover:to-[#FFD700]"
                        >
                          <HandCoins className="w-5 h-5 mr-2" />
                          收手兑现 {currentTier?.percentage ?? 0}% 奖池 (≈{currentReward.toFixed(4)} BNB)
                        </Button>
                      );
                    })()}
                  </div>
                )}

                {/* 等待揭示 */}
                {isRevealing && !isWaitingVRF && (
                  <div className="text-center py-8">
                    <div className="text-[#C9A347] text-xl animate-pulse">揭示中...</div>
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
                            <div>🎉 恭喜获得 {currentTier?.percentage ?? 0}% 奖池!</div>
                            <div className="text-lg mt-1">≈ {currentReward.toFixed(4)} BNB</div>
                          </>
                        ) : (
                          <>游戏结束 - 连胜 {streak} 次</>
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
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <HandCoins className="w-6 h-6 text-[#FFD700]" />
                              <span className="text-[#FFD700] font-bold text-lg">
                                {hasUnclaimedPrize ? '待领取奖励' : '奖励已存入合约'}
                              </span>
                            </div>
                            
                            {hasUnclaimedPrize ? (
                              <>
                                <div className="text-2xl font-bold text-white mb-3">
                                  {Number(unclaimedPrize).toFixed(4)} BNB
                                </div>
                                <Button
                                  onClick={async () => {
                                    const success = await claimPrize();
                                    if (success) {
                                      toast({
                                        title: "🎉 领取成功!",
                                        description: `${Number(unclaimedPrize).toFixed(4)} BNB 已发送到您的钱包`,
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
                                  立即领取奖励
                                </Button>
                              </>
                            ) : (
                              <>
                                <p className="text-[#C9A347]/80 text-sm mb-3">
                                  奖励已存入合约待领取余额，请稍候或点击刷新
                                </p>
                                <Button
                                  onClick={async () => {
                                    setIsRefreshingPrize(true);
                                    await refreshData();
                                    setTimeout(() => setIsRefreshingPrize(false), 1000);
                                  }}
                                  disabled={isRefreshingPrize}
                                  className="w-full h-12 text-lg font-bold"
                                  style={{
                                    background: 'linear-gradient(135deg, #C9A347 0%, #8B7230 100%)',
                                    color: '#000',
                                  }}
                                >
                                  {isRefreshingPrize ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  ) : (
                                    <HandCoins className="w-5 h-5 mr-2" />
                                  )}
                                  {isRefreshingPrize ? '刷新中...' : '刷新待领取余额'}
                                </Button>
                              </>
                            )}
                            
                            <p className="text-[#C9A347]/70 text-xs mt-2">
                              领取时需支付少量Gas费，95%奖励到账
                            </p>
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
                            您有 {Number(unclaimedPrize).toFixed(4)} BNB 待领取
                          </p>
                          <Button
                            onClick={claimPrize}
                            size="sm"
                            className="bg-[#C9A347] text-black hover:bg-[#FFD700]"
                          >
                            <HandCoins className="w-4 h-4 mr-1" />
                            领取奖励
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
                        再来一局
                      </Button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* 右侧 - 代币兑换 + 历史记录 */}
          <div className="lg:col-span-3 space-y-4">
            <CreditsExchange />
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
