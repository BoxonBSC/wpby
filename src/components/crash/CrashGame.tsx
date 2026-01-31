import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrashChart } from './CrashChart';
import { CrashResults } from './CrashResults';
import { 
  CRASH_CONFIG, 
  GameState, 
  CrashResult,
  generateCrashPoint,
  calculatePayout,
  getMultiplierColor 
} from '@/config/crash';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, Wallet, TrendingUp, Zap, Target } from 'lucide-react';

// 模拟数据
const MOCK_CREDITS = 1000000;
const MOCK_PRIZE_POOL = 10;

export function CrashGame() {
  // 游戏状态
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(5);
  
  // 玩家状态
  const [credits, setCredits] = useState(MOCK_CREDITS);
  const [prizePool] = useState(MOCK_PRIZE_POOL);
  const [betAmount, setBetAmount] = useState(CRASH_CONFIG.bet.default);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [hasBet, setHasBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);
  
  // 历史记录
  const [results, setResults] = useState<CrashResult[]>([]);
  const [recentCrashPoints, setRecentCrashPoints] = useState<number[]>([]);
  
  // Refs
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // 下注
  const placeBet = useCallback(() => {
    if (gameState !== 'waiting' || credits < betAmount || hasBet) return;
    
    setCredits(prev => prev - betAmount);
    setHasBet(true);
    setHasCashedOut(false);
    setCashoutMultiplier(null);
  }, [gameState, credits, betAmount, hasBet]);

  // 兑现
  const cashout = useCallback(() => {
    if (gameState !== 'running' || !hasBet || hasCashedOut) return;
    
    const payout = calculatePayout(betAmount, multiplier, prizePool);
    setHasCashedOut(true);
    setCashoutMultiplier(multiplier);
    
    // 记录结果
    const result: CrashResult = {
      id: `${Date.now()}-${Math.random()}`,
      crashPoint: crashPoint || multiplier,
      betAmount,
      cashoutMultiplier: multiplier,
      bnbWon: payout,
      timestamp: Date.now(),
    };
    setResults(prev => [result, ...prev]);
  }, [gameState, hasBet, hasCashedOut, betAmount, multiplier, prizePool, crashPoint]);

  // 游戏循环
  useEffect(() => {
    if (gameState === 'waiting') {
      // 倒计时
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // 开始游戏
            const newCrashPoint = generateCrashPoint();
            setCrashPoint(newCrashPoint);
            setGameState('running');
            setMultiplier(1.00);
            startTimeRef.current = Date.now();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
    
    if (gameState === 'running') {
      const tick = () => {
        const elapsed = Date.now() - startTimeRef.current;
        // 指数增长公式
        const newMultiplier = Math.pow(Math.E, elapsed * CRASH_CONFIG.timing.multiplierSpeed);
        
        // 检查是否崩盘
        if (crashPoint && newMultiplier >= crashPoint) {
          setMultiplier(crashPoint);
          setGameState('crashed');
          setRecentCrashPoints(prev => [crashPoint, ...prev].slice(0, 20));
          
          // 如果玩家下注但没兑现
          if (hasBet && !hasCashedOut) {
            const result: CrashResult = {
              id: `${Date.now()}-${Math.random()}`,
              crashPoint,
              betAmount,
              cashoutMultiplier: null,
              bnbWon: 0,
              timestamp: Date.now(),
            };
            setResults(prev => [result, ...prev]);
          }
          
          // 3秒后重新开始
          setTimeout(() => {
            setGameState('waiting');
            setMultiplier(1.00);
            setCrashPoint(null);
            setHasBet(false);
            setHasCashedOut(false);
            setCashoutMultiplier(null);
            setCountdown(5);
          }, 3000);
          
          return;
        }
        
        setMultiplier(newMultiplier);
        
        // 自动兑现检查
        if (autoCashout && newMultiplier >= autoCashout && hasBet && !hasCashedOut) {
          cashout();
        }
        
        gameLoopRef.current = setTimeout(tick, CRASH_CONFIG.timing.tickInterval);
      };
      
      tick();
      
      return () => {
        if (gameLoopRef.current) {
          clearTimeout(gameLoopRef.current);
        }
      };
    }
  }, [gameState, crashPoint, autoCashout, hasBet, hasCashedOut, betAmount, cashout]);

  const canBet = gameState === 'waiting' && credits >= betAmount && !hasBet;
  const canCashout = gameState === 'running' && hasBet && !hasCashedOut;
  const multiplierColor = getMultiplierColor(multiplier);

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
          {/* 左侧 - 下注控制 */}
          <div className="lg:col-span-3">
            <div 
              className="rounded-2xl p-5 space-y-4"
              style={{
                background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
                border: '1px solid rgba(201, 163, 71, 0.25)',
              }}
            >
              {/* 下注金额 */}
              <div>
                <label className="text-[#C9A347]/60 text-sm mb-2 block">下注金额</label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={hasBet}
                  className="bg-black/30 border-[#C9A347]/20 text-[#C9A347]"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {CRASH_CONFIG.bet.presets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setBetAmount(preset)}
                      disabled={hasBet}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[#C9A347]/10 text-[#C9A347]/70 hover:bg-[#C9A347]/20 disabled:opacity-50"
                    >
                      {(preset / 1000)}K
                    </button>
                  ))}
                </div>
              </div>

              {/* 自动兑现 */}
              <div>
                <label className="text-[#C9A347]/60 text-sm mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  自动兑现
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="无"
                  value={autoCashout || ''}
                  onChange={(e) => setAutoCashout(e.target.value ? Number(e.target.value) : null)}
                  disabled={hasBet}
                  className="bg-black/30 border-[#C9A347]/20 text-[#C9A347]"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {CRASH_CONFIG.autoCashout.presets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAutoCashout(preset)}
                      disabled={hasBet}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[#C9A347]/10 text-[#C9A347]/70 hover:bg-[#C9A347]/20 disabled:opacity-50"
                    >
                      {preset}x
                    </button>
                  ))}
                </div>
              </div>

              {/* 下注/兑现按钮 */}
              <div className="pt-4">
                {gameState === 'waiting' && !hasBet && (
                  <Button
                    onClick={placeBet}
                    disabled={!canBet}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    下注 ({countdown}s)
                  </Button>
                )}
                
                {gameState === 'waiting' && hasBet && (
                  <div className="w-full h-14 flex items-center justify-center rounded-lg bg-[#C9A347]/20 text-[#C9A347] font-bold">
                    等待起飞... ({countdown}s)
                  </div>
                )}
                
                {gameState === 'running' && !hasBet && (
                  <div className="w-full h-14 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400">
                    本轮未下注
                  </div>
                )}
                
                {gameState === 'running' && hasBet && !hasCashedOut && (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={cashout}
                      className="w-full h-14 text-lg font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${multiplierColor} 0%, ${multiplierColor}CC 100%)`,
                      }}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      兑现 {multiplier.toFixed(2)}x
                    </Button>
                  </motion.div>
                )}
                
                {gameState === 'running' && hasCashedOut && (
                  <div className="w-full h-14 flex items-center justify-center rounded-lg bg-green-600/20 text-green-400 font-bold">
                    ✓ 已兑现 {cashoutMultiplier?.toFixed(2)}x
                  </div>
                )}
                
                {gameState === 'crashed' && (
                  <div className="w-full h-14 flex items-center justify-center rounded-lg bg-red-600/20 text-red-400 font-bold">
                    崩盘 @ {crashPoint?.toFixed(2)}x
                  </div>
                )}
              </div>

              {/* 潜在收益 */}
              {hasBet && !hasCashedOut && gameState === 'running' && (
                <div className="text-center p-3 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20">
                  <div className="text-[#FFD700]/60 text-xs">潜在收益</div>
                  <div className="text-[#FFD700] font-bold text-xl">
                    +{calculatePayout(betAmount, multiplier, prizePool).toFixed(4)} BNB
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 中间 - 游戏图表 */}
          <div className="lg:col-span-6">
            <div 
              className="rounded-2xl overflow-hidden relative"
              style={{
                background: 'linear-gradient(180deg, rgba(20, 16, 12, 0.95) 0%, rgba(10, 8, 6, 0.98) 100%)',
                border: '1px solid rgba(201, 163, 71, 0.25)',
                height: '500px',
              }}
            >
              {/* 图表 */}
              <CrashChart
                multiplier={multiplier}
                gameState={gameState}
                crashPoint={crashPoint || undefined}
              />

              {/* 倍数显示 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <AnimatePresence mode="wait">
                  {gameState === 'waiting' && (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-6xl font-bold text-[#C9A347]"
                    >
                      {countdown}
                    </motion.div>
                  )}
                  
                  {gameState === 'running' && (
                    <motion.div
                      key="running"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-7xl font-bold"
                      style={{ 
                        color: multiplierColor,
                        textShadow: `0 0 40px ${multiplierColor}`,
                      }}
                    >
                      {multiplier.toFixed(2)}x
                    </motion.div>
                  )}
                  
                  {gameState === 'crashed' && (
                    <motion.div
                      key="crashed"
                      initial={{ opacity: 0, scale: 2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-6xl font-bold text-red-500"
                      style={{ textShadow: '0 0 40px rgba(255,0,0,0.8)' }}
                    >
                      CRASHED!
                      <div className="text-3xl mt-2">{crashPoint?.toFixed(2)}x</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* 右侧 - 历史记录 */}
          <div className="lg:col-span-3">
            <CrashResults 
              results={results}
              recentCrashPoints={recentCrashPoints}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
