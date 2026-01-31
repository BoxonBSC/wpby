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
  generateRandomCard,
  calculateHiLoReward,
  calculateWinProbability,
  getCurrentRewardTier,
} from '@/config/hilo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [betAmount, setBetAmount] = useState(HILO_CONFIG.bet.default);
  
  // 历史记录
  const [results, setResults] = useState<HiLoResult[]>([]);
  const [lastGuess, setLastGuess] = useState<Guess | null>(null);
  const [guessCorrect, setGuessCorrect] = useState<boolean | null>(null);

  // 开始游戏
  const startGame = useCallback(() => {
    if (credits < betAmount) return;
    
    setCredits(prev => prev - betAmount);
    setCurrentCard(generateRandomCard());
    setNextCard(null);
    setStreak(0);
    setGameState('playing');
    setLastGuess(null);
    setGuessCorrect(null);
  }, [credits, betAmount]);

  // 猜测
  const makeGuess = useCallback((guess: Guess) => {
    if (gameState !== 'playing' || !currentCard || isRevealing) return;
    
    setIsRevealing(true);
    setLastGuess(guess);
    
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
        // 猜对
        setStreak(prev => prev + 1);
        setCurrentCard(newCard);
        setNextCard(null);
        setGameState('playing');
      } else {
        // 猜错 - 游戏结束
        setGameState('lost');
        const result: HiLoResult = {
          id: `${Date.now()}-${Math.random()}`,
          betAmount,
          streak,
          bnbWon: 0,
          cashedOut: false,
          timestamp: Date.now(),
        };
        setResults(prev => [result, ...prev]);
      }
      
      setIsRevealing(false);
    }, HILO_CONFIG.animation.flipDuration + HILO_CONFIG.animation.revealDelay);
  }, [gameState, currentCard, isRevealing, betAmount, streak]);

  // 收手兑现
  const cashOut = useCallback(() => {
    if (gameState !== 'playing' || streak <= 0) return;
    
    const reward = calculateHiLoReward(streak, prizePool);
    setGameState('won');
    
    const result: HiLoResult = {
      id: `${Date.now()}-${Math.random()}`,
      betAmount,
      streak,
      bnbWon: reward,
      cashedOut: true,
      timestamp: Date.now(),
    };
    setResults(prev => [result, ...prev]);
  }, [gameState, streak, prizePool, betAmount]);

  // 重新开始
  const resetGame = useCallback(() => {
    setGameState('idle');
    setCurrentCard(null);
    setNextCard(null);
    setStreak(0);
    setLastGuess(null);
    setGuessCorrect(null);
  }, []);

  const currentReward = calculateHiLoReward(streak, prizePool);
  const currentTier = getCurrentRewardTier(streak);

  // 计算概率显示
  const higherProb = currentCard ? (calculateWinProbability(currentCard.value, 'higher') * 100).toFixed(1) : '0';
  const lowerProb = currentCard ? (calculateWinProbability(currentCard.value, 'lower') * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-[#0a0908] pt-4">
      <div className="container mx-auto px-4">
        {/* 顶部信息栏 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-[#C9A347]/10 border border-[#C9A347]/20">
              <span className="text-[#C9A347]/60 text-sm">凭证: </span>
              <span className="text-[#C9A347] font-bold">{credits.toLocaleString()}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20">
              <span className="text-[#FFD700]/60 text-sm">奖池: </span>
              <span className="text-[#FFD700] font-bold">{prizePool} BNB</span>
            </div>
          </div>
          
          <Button variant="outline" className="border-[#C9A347]/30 text-[#C9A347]">
            <Wallet className="w-4 h-4 mr-2" />
            连接钱包
          </Button>
        </div>

        {/* 主游戏区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧 - 奖励阶梯 */}
          <div className="lg:col-span-3">
            <RewardLadder currentStreak={streak} prizePool={prizePool} />
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
              {gameState === 'playing' && streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.2) 0%, rgba(201, 163, 71, 0.2) 100%)',
                    border: '1px solid rgba(255, 215, 0, 0.4)',
                  }}
                >
                  <span className="text-[#FFD700] font-bold">连胜 {streak} 次</span>
                  <span className="text-[#C9A347] ml-2">| {currentReward.toFixed(4)} BNB</span>
                </motion.div>
              )}

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
                {/* 闲置状态 - 下注 */}
                {gameState === 'idle' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#C9A347]/60 text-sm mb-2 block">下注金额</label>
                      <Input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="bg-black/30 border-[#C9A347]/20 text-[#C9A347]"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {HILO_CONFIG.bet.presets.map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setBetAmount(preset)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-[#C9A347]/10 text-[#C9A347]/70 hover:bg-[#C9A347]/20"
                          >
                            {(preset / 1000)}K
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      onClick={startGame}
                      disabled={credits < betAmount}
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#C9A347] to-[#FFD700] text-black hover:from-[#FFD700] hover:to-[#C9A347]"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      开始游戏
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
                    {streak > 0 && (
                      <Button
                        onClick={cashOut}
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:from-[#FFA500] hover:to-[#FFD700]"
                      >
                        <HandCoins className="w-5 h-5 mr-2" />
                        收手兑现 {currentReward.toFixed(4)} BNB
                      </Button>
                    )}
                  </div>
                )}

                {/* 等待揭示 */}
                {isRevealing && (
                  <div className="text-center py-8">
                    <div className="text-[#C9A347] text-xl animate-pulse">揭示中...</div>
                  </div>
                )}

                {/* 游戏结束 */}
                {(gameState === 'won' || gameState === 'lost') && (
                  <div className="text-center space-y-4">
                    <div 
                      className={`
                        text-3xl font-bold py-4
                        ${gameState === 'won' ? 'text-[#FFD700]' : 'text-red-400'}
                      `}
                    >
                      {gameState === 'won' ? (
                        <>恭喜获得 {currentReward.toFixed(4)} BNB!</>
                      ) : (
                        <>游戏结束 - 连胜 {streak} 次</>
                      )}
                    </div>
                    
                    <Button
                      onClick={resetGame}
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#C9A347] to-[#FFD700] text-black"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      再来一局
                    </Button>
                  </div>
                )}
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
