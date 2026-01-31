import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from './PlayingCard';
import { RewardLadder } from './RewardLadder';
import { HiLoResults } from './HiLoResults';
import { 
  HILO_CONFIG,
  HiLoGameState,
  HiLoResult,
  Card,
  Guess,
  BET_TIERS,
  REWARD_TIERS,
  generateRandomCard,
  calculateHiLoReward,
  calculateWinProbability,
  getCurrentRewardTier,
  getBetTier,
} from '@/config/hilo';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronUp, ChevronDown, Equal, HandCoins, Play } from 'lucide-react';

// 模拟数据
const MOCK_CREDITS = 1000000;
const MOCK_PRIZE_POOL = 10;

export function HiLoGame() {
  // 游戏状态
  const [gameState, setGameState] = useState<HiLoGameState>('idle');
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [streak, setStreak] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  
  // 玩家状态
  const [credits, setCredits] = useState(MOCK_CREDITS);
  const [prizePool] = useState(MOCK_PRIZE_POOL);
  const [prizePoolSnapshot, setPrizePoolSnapshot] = useState<number | null>(null); // 开始游戏时锁定的奖池快照
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [currentBetTier, setCurrentBetTier] = useState(BET_TIERS[0]);
  
  // 历史记录
  const [results, setResults] = useState<HiLoResult[]>([]);
  const [guessCorrect, setGuessCorrect] = useState<boolean | null>(null);
  
  // 获取用于计算奖励的奖池（游戏中用快照，否则用实时）
  const effectivePrizePool = prizePoolSnapshot ?? prizePool;

  // 开始游戏
  const startGame = useCallback(() => {
    const tier = BET_TIERS[selectedTierIndex];
    if (credits < tier.betAmount) return;
    
    setCredits(prev => prev - tier.betAmount);
    setCurrentBetTier(tier);
    setCurrentCard(generateRandomCard());
    setNextCard(null);
    setStreak(0);
    setGameState('playing');
    setGuessCorrect(null);
    // 锁定当前奖池快照 - 整局游戏的奖励都基于此计算
    setPrizePoolSnapshot(prizePool);
  }, [credits, selectedTierIndex, prizePool]);

  // 猜测
  const makeGuess = useCallback((guess: Guess) => {
    if (gameState !== 'playing' || !currentCard || isRevealing) return;
    
    setIsRevealing(true);
    
    // 生成下一张牌
    const newCard = generateRandomCard();
    setNextCard(newCard);
    
    // 判断结果
    setTimeout(() => {
      let correct = false;
      
      if (guess === 'higher') {
        correct = newCard.value > currentCard.value;
      } else if (guess === 'lower') {
        correct = newCard.value < currentCard.value;
      } else {
        correct = newCard.value === currentCard.value;
      }
      
      setGuessCorrect(correct);
      
      if (correct) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        
        // 检查是否达到门槛上限
        if (newStreak >= currentBetTier.maxStreak) {
          // 自动兑现 - 使用锁定的奖池快照
          const reward = calculateHiLoReward(newStreak, currentBetTier.maxStreak, effectivePrizePool);
          setGameState('won');
          const result: HiLoResult = {
            id: `${Date.now()}-${Math.random()}`,
            betAmount: currentBetTier.betAmount,
            betTier: currentBetTier.name,
            streak: newStreak,
            bnbWon: reward,
            cashedOut: true,
            timestamp: Date.now(),
          };
          setResults(prev => [result, ...prev]);
        } else {
          setCurrentCard(newCard);
          setNextCard(null);
          setGameState('playing');
        }
      } else {
        // 猜错 - 游戏结束
        setGameState('lost');
        const result: HiLoResult = {
          id: `${Date.now()}-${Math.random()}`,
          betAmount: currentBetTier.betAmount,
          betTier: currentBetTier.name,
          streak,
          bnbWon: 0,
          cashedOut: false,
          timestamp: Date.now(),
        };
        setResults(prev => [result, ...prev]);
      }
      
      setIsRevealing(false);
    }, HILO_CONFIG.animation.flipDuration + HILO_CONFIG.animation.revealDelay);
  }, [gameState, currentCard, isRevealing, streak, currentBetTier, effectivePrizePool]);

  // 收手兑现
  const cashOut = useCallback(() => {
    if (gameState !== 'playing' || streak <= 0) return;
    
    // 使用锁定的奖池快照计算奖励
    const reward = calculateHiLoReward(streak, currentBetTier.maxStreak, effectivePrizePool);
    setGameState('won');
    
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
  }, [gameState, streak, currentBetTier, effectivePrizePool]);

  // 重新开始
  const resetGame = useCallback(() => {
    setGameState('idle');
    setCurrentCard(null);
    setNextCard(null);
    setStreak(0);
    setGuessCorrect(null);
    setPrizePoolSnapshot(null); // 清除快照，下局重新锁定
  }, []);

  const currentReward = calculateHiLoReward(streak, currentBetTier.maxStreak, effectivePrizePool);

  // 计算概率显示
  const higherProb = currentCard ? (calculateWinProbability(currentCard.value, 'higher') * 100).toFixed(1) : '0';
  const lowerProb = currentCard ? (calculateWinProbability(currentCard.value, 'lower') * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-4">
        {/* 顶部信息栏 - 与主系统风格一致 */}
        <div 
          className="flex justify-between items-center mb-6 px-4 py-3 rounded-xl backdrop-blur-lg"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 12, 7, 0.9) 0%, rgba(10, 9, 8, 0.95) 100%)',
            border: '1px solid rgba(201, 163, 71, 0.2)',
          }}
        >
          {/* 左侧 - 游戏名称 */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🃏</span>
            <span className="font-display text-xl text-neon-cyan font-bold tracking-wide">
              王牌博弈
            </span>
          </div>

          {/* 中间 - 凭证和奖池 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50">
              <span className="text-muted-foreground text-sm">凭证</span>
              <span className="text-foreground font-bold">{credits.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-gold/10 border border-neon-gold/30">
              <span className="text-neon-gold/70 text-sm">奖池</span>
              <span className="text-neon-gold font-bold">{prizePool} BNB</span>
            </div>
          </div>
          
          {/* 右侧 - 连接钱包 */}
          <Button 
            variant="outline" 
            className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/50"
          >
            <Wallet className="w-4 h-4 mr-2" />
            连接钱包
          </Button>
        </div>

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
                {/* 当前牌 */}
                <div className="text-center">
                  <div className="text-[#C9A347]/60 text-sm mb-2">当前牌</div>
                  <PlayingCard card={currentCard} isFlipped={false} />
                </div>

                {/* 箭头指示 */}
                {gameState === 'playing' && !isRevealing && (
                  <div className="text-[#C9A347]/40 text-4xl">→</div>
                )}

                {/* 下一张牌 */}
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
                      {/* 5列布局 - 第一行3个，第二行2个居中 */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          {BET_TIERS.slice(0, 3).map((tier, index) => {
                            const canAfford = credits >= tier.betAmount;
                            const isSelected = selectedTierIndex === index;
                            const maxRewardTier = REWARD_TIERS.find(r => r.streak === tier.maxStreak);
                            
                            return (
                              <button
                                key={tier.id}
                                onClick={() => canAfford && setSelectedTierIndex(index)}
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
                                <div 
                                  className="font-bold text-base"
                                  style={{ color: tier.color }}
                                >
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
                                onClick={() => canAfford && setSelectedTierIndex(index)}
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
                                <div 
                                  className="font-bold text-base"
                                  style={{ color: tier.color }}
                                >
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
                      onClick={startGame}
                      disabled={credits < BET_TIERS[selectedTierIndex].betAmount}
                      className="w-full h-14 text-lg font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${BET_TIERS[selectedTierIndex].color} 0%, ${BET_TIERS[selectedTierIndex].color}CC 100%)`,
                        color: '#000',
                      }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      开始游戏 ({BET_TIERS[selectedTierIndex].betAmount >= 1000000 
                        ? `${BET_TIERS[selectedTierIndex].betAmount / 1000000}M` 
                        : `${BET_TIERS[selectedTierIndex].betAmount / 1000}K`})
                    </Button>
                  </div>
                )}

                {/* 游戏中 - 选择 */}
                {gameState === 'playing' && !isRevealing && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Button
                        onClick={() => makeGuess('higher')}
                        className="h-16 flex flex-col items-center justify-center bg-green-600/80 hover:bg-green-500"
                      >
                        <ChevronUp className="w-6 h-6" />
                        <span className="text-sm">更高 ({higherProb}%)</span>
                      </Button>
                      
                      <Button
                        onClick={() => makeGuess('same')}
                        className="h-16 flex flex-col items-center justify-center bg-[#C9A347]/80 hover:bg-[#C9A347]"
                      >
                        <Equal className="w-6 h-6" />
                        <span className="text-sm">相同</span>
                      </Button>
                      
                      <Button
                        onClick={() => makeGuess('lower')}
                        className="h-16 flex flex-col items-center justify-center bg-red-600/80 hover:bg-red-500"
                      >
                        <ChevronDown className="w-6 h-6" />
                        <span className="text-sm">更低 ({lowerProb}%)</span>
                      </Button>
                    </div>

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
                {isRevealing && (
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
                        className={`
                          text-2xl font-bold py-4
                          ${gameState === 'won' ? 'text-[#FFD700]' : 'text-red-400'}
                        `}
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

          {/* 右侧 - 历史记录 */}
          <div className="lg:col-span-3">
            <HiLoResults results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}
