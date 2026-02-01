import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from './PlayingCard';
import { RewardLadder } from './RewardLadder';
import { HiLoResults } from './HiLoResults';
import { VRFWaitingOverlay } from './VRFWaitingOverlay';
import { CreditsExchange } from '@/components/CreditsExchange';
import { useWallet } from '@/contexts/WalletContext';
import { useCyberHiLo } from '@/hooks/useCyberHiLo';
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
import { ChevronUp, ChevronDown, Equal, HandCoins, Play, Loader2 } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { toast } from '@/hooks/use-toast';
import { formatEther } from 'ethers';
import { CYBER_HILO_ADDRESS } from '@/config/contracts';
import { Copy, ExternalLink } from 'lucide-react';


// 将合约牌值转换为Card对象
function cardFromValue(value: number): Card {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const rank = RANKS[value - 1];
  return { suit, rank, value };
}

export function HiLoGame() {
  // 钱包状态
  const { isConnected, connectWalletConnect } = useWallet();
  
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
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [currentBetTier, setCurrentBetTier] = useState(BET_TIERS[0]);
  const [results, setResults] = useState<HiLoResult[]>([]);
  const [guessCorrect, setGuessCorrect] = useState<boolean | null>(null);
  const [prizePoolSnapshot, setPrizePoolSnapshot] = useState<number | null>(null);
  
  // 获取实际使用的凭证余额
  const credits = Number(gameCredits);
  const effectivePrizePool = prizePoolSnapshot ?? Number(prizePool);
  
  // 同步合约游戏状态到UI
  useEffect(() => {
    if (!gameSession) return;
    
    if (gameSession.active) {
      setGameState('playing');
      setCurrentCard(cardFromValue(gameSession.currentCard));
      setStreak(gameSession.currentStreak);
      setCurrentBetTier(BET_TIERS[gameSession.betTierIndex] || BET_TIERS[0]);
      setPrizePoolSnapshot(Number(formatEther(gameSession.prizePoolSnapshot)));
    }
  }, [gameSession]);

  // 监听VRF结果
  useEffect(() => {
    // 当VRF完成时刷新数据
    if (!isWaitingVRF && pendingRequest === 0n && gameState === 'playing') {
      refreshData();
    }
  }, [isWaitingVRF, pendingRequest, gameState, refreshData]);

  // 开始游戏
  const startGame = useCallback(async () => {
    const tier = BET_TIERS[selectedTierIndex];
    if (credits < tier.betAmount) return;
    
    playClickSound();
    
    const firstCard = await contractStartGame(tier.betAmount);
    if (firstCard !== null) {
      playCardFlipSound();
      setCurrentCard(cardFromValue(firstCard));
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
    
    setIsRevealing(true);
    const txHash = await contractGuess(guess);
    
    if (!txHash) {
      setIsRevealing(false);
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
      setResults(prev => [result, ...prev]);
    }
  }, [gameState, streak, currentBetTier, effectivePrizePool, playCashOutSound, contractCashOut]);

  // 重新开始
  const resetGame = useCallback(() => {
    playClickSound();
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

        {/* 主游戏区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧 - 奖励阶梯 */}
          <div className="lg:col-span-3">
            <RewardLadder 
              currentStreak={streak} 
              prizePool={effectivePrizePool} 
              currentBetTier={currentBetTier}
            />
          </div>

          {/* 中间 - 游戏区 */}
          <div className="lg:col-span-6">
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
                pollCount={vrfState.pollCount}
                onCancel={cancelStuckRequest}
                onRefresh={refreshData}
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

                {nextCard && (
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
                      onClick={isConnected ? startGame : connectWalletConnect}
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
                      <Play className="w-5 h-5 mr-2" />
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
                  return (
                    <div className="text-center space-y-4">
                      <div 
                        className={`text-2xl font-bold py-4 ${gameState === 'won' ? 'text-[#FFD700]' : 'text-red-400'}`}
                      >
                        {gameState === 'won' ? (
                          <>
                            <div>恭喜获得 {currentTier?.percentage ?? 0}% 奖池!</div>
                            <div className="text-lg mt-1">≈ {currentReward.toFixed(4)} BNB</div>
                          </>
                        ) : (
                          <>游戏结束 - 连胜 {streak} 次</>
                        )}
                      </div>
                      
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

        {/* 合约地址展示 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <div 
            className="flex items-center gap-3 px-4 py-2 rounded-xl"
            style={{
              background: 'linear-gradient(90deg, rgba(201, 163, 71, 0.08) 0%, rgba(201, 163, 71, 0.03) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.2)',
            }}
          >
            <span className="text-xs" style={{ color: '#C9A347' }}>🎴 游戏合约:</span>
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
                  toast({ title: '合约地址已复制!' });
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
        </motion.div>
      </div>
    </div>
  );
}
