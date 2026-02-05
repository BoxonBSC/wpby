import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, Trophy, Users, Zap, Crown, Gift, ArrowUp, Wallet, Coins, Percent, Timer, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@/contexts/WalletContext';

// 游戏配置
const GAME_CONFIG = {
  roundDurationMinutes: 60,   // 每轮60分钟
  priceIncrement: 10,         // 每次接盘价格递增10%
  startPrice: 10000,          // 每轮起始价格（最小接盘金额）
  minPrice: 10000,            // 最小接盘金额
};

// 动态比例配置
const DYNAMIC_TIERS = [
  { minPlayers: 1, maxPlayers: 10, winnerRate: 35, label: '🥶 冷启动' },
  { minPlayers: 11, maxPlayers: 20, winnerRate: 42, label: '🌱 萌芽期' },
  { minPlayers: 21, maxPlayers: 30, winnerRate: 48, label: '🔥 活跃期' },
  { minPlayers: 31, maxPlayers: 40, winnerRate: 54, label: '🚀 热门期' },
  { minPlayers: 41, maxPlayers: Infinity, winnerRate: 60, label: '💎 爆发期' },
];

// 资金分配比例
const FUND_DISTRIBUTION = {
  prizePoolRate: 70,      // 70% 进入奖池
  earlyBirdRate: 15,      // 15% 早期玩家分红
  previousHolderRate: 10, // 10% 上一任持有者
  taxRate: 5,             // 5% VRF费用
};

// 获取当前动态比例
const getCurrentTier = (participants: number) => {
  return DYNAMIC_TIERS.find(tier => 
    participants >= tier.minPlayers && participants <= tier.maxPlayers
  ) || DYNAMIC_TIERS[0];
};

// 模拟数据
const mockRoundData = {
  roundId: 42,
  currentHolder: '0x1234...5678',
  previousHolder: '0x9ABC...DEF0',
  currentPrice: 50000,
  nextPrice: 55000,
  prizePoolBNB: 2.847,
  totalBurned: 1250000,
  totalParticipants: 15,
  earlyBirds: [
    { address: '0xABC...DEF', rank: 1, earnedBNB: 0.142 },
    { address: '0xDEF...GHI', rank: 2, earnedBNB: 0.098 },
    { address: '0xGHI...JKL', rank: 3, earnedBNB: 0.067 },
  ],
  history: [
    { address: '0x111...222', price: 50000, bnbAdded: 0.035, time: '14:35' },
    { address: '0x333...444', price: 55000, bnbAdded: 0.039, time: '14:42' },
    { address: '0x555...666', price: 60500, bnbAdded: 0.042, time: '14:48' },
    { address: '0x777...888', price: 66550, bnbAdded: 0.047, time: '14:53' },
    { address: '0x1234...5678', price: 73205, bnbAdded: 0.051, time: '14:57' },
  ],
};

// 计算下一个整点时间
const getNextHourTime = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(next.getHours() + 1, 0, 0, 0);
  return next;
};

// 格式化时间为 HH:MM
const formatHourMinute = (date: Date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export function ChainGame() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [nextDrawTime, setNextDrawTime] = useState(getNextHourTime());
  const [isEnded, setIsEnded] = useState(false);
  const [isTaking, setIsTaking] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const { isConnected, address } = useWallet();

  // 当前动态比例
  const currentTier = useMemo(() => getCurrentTier(mockRoundData.totalParticipants), []);
  const winnerAmount = (mockRoundData.prizePoolBNB * currentTier.winnerRate / 100).toFixed(3);
  const rolloverAmount = (mockRoundData.prizePoolBNB * (100 - currentTier.winnerRate) / 100).toFixed(3);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((nextDrawTime.getTime() - now.getTime()) / 1000));
      
      if (diff <= 0) {
        setIsEnded(true);
        // 自动开启下一轮
        setTimeout(() => {
          setNextDrawTime(getNextHourTime());
          setIsEnded(false);
        }, 5000);
      }
      
      setTimeLeft(diff);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextDrawTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // 是否在最后5分钟
  const isLastFiveMinutes = timeLeft <= 300 && timeLeft > 0;

  const handleTakeover = async () => {
    if (!isConnected) {
      setShowWallet(true);
      return;
    }
    setIsTaking(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTaking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-4 md:p-8">
      {/* 背景动效 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* 钱包弹窗 */}
      <AnimatePresence>
        {showWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowWallet(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <WalletConnect />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-5xl mx-auto space-y-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
          >
            ⚡ 击鼓传花
          </motion.h1>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowWallet(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 transition-colors"
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            {isConnected && address ? (
              <span className="text-sm font-mono text-white">{shortenAddress(address)}</span>
            ) : (
              <span className="text-sm text-slate-300">连接钱包</span>
            )}
          </motion.button>
        </div>

        {/* 副标题 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-slate-400 -mt-4"
        >
          每整点开奖 · 销毁代币，赢取BNB · 动态奖励比例
        </motion.p>

        {/* 主卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 overflow-hidden"
        >
          {/* 顶部光效 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          
          <div className="p-6 md:p-8">
            {/* 轮次和参与人数 + 动态比例 */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <Flame className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 font-medium">第 #{mockRoundData.roundId} 轮</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="w-4 h-4" />
                  <span>{mockRoundData.totalParticipants} 人</span>
                </div>
              </div>
              {/* 动态比例指示 */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                <span className="text-lg">{currentTier.label}</span>
                <span className="text-yellow-400 font-bold">{currentTier.winnerRate}%</span>
                <span className="text-slate-500 text-sm">赢家比例</span>
              </div>
            </div>

            {/* 开奖时间和倒计时 */}
            <div className="text-center mb-8">
              <AnimatePresence mode="wait">
                {!isEnded ? (
                  <motion.div
                    key="countdown"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    {/* 开奖时间 */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <CalendarClock className="w-5 h-5 text-cyan-400" />
                      <span className="text-slate-400">开奖时间</span>
                      <span className="text-2xl font-bold text-cyan-400">{formatHourMinute(nextDrawTime)}</span>
                    </div>
                    
                    {/* 倒计时 */}
                    <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">
                        {isLastFiveMinutes ? '⚡ 最后冲刺' : '距离开奖'}
                      </span>
                    </div>
                    <div
                      className={`text-6xl md:text-8xl font-mono font-bold tracking-tight ${
                        isLastFiveMinutes
                          ? timeLeft <= 60
                            ? 'text-red-400 animate-pulse'
                            : 'text-orange-400'
                          : 'text-white'
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </div>
                    
                    {/* 进度条 */}
                    <div className="mt-4 mx-auto max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${isLastFiveMinutes ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gradient-to-r from-cyan-400 to-purple-400'}`}
                        animate={{ width: `${(timeLeft / 3600) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    
                    {/* 奖金预览 */}
                    <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-slate-400">赢家获得</span>
                        <span className="text-yellow-400 font-bold">{winnerAmount} BNB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowUp className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-400">滚入下轮</span>
                        <span className="text-cyan-400 font-bold">{rolloverAmount} BNB</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ended"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-8"
                  >
                    <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
                    <div className="text-3xl font-bold text-white mb-2">🎉 本轮结束！</div>
                    <div className="text-slate-400 mb-2">恭喜 {mockRoundData.currentHolder} 获胜</div>
                    <div className="text-yellow-400 text-xl font-bold">+{winnerAmount} BNB</div>
                    <div className="text-sm text-slate-500 mt-2">下一轮即将开始...</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 当前持有者 */}
            <div className="flex items-center justify-center gap-3 mb-8 py-4 px-6 mx-auto max-w-md rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-400">当前持有者</span>
              <span className="font-mono text-white">{mockRoundData.currentHolder}</span>
            </div>

            {/* 数据卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Coins className="w-4 h-4 text-orange-400" />
                  接盘价格
                </div>
                <div className="text-xl font-bold text-orange-400">{formatNumber(mockRoundData.currentPrice)}</div>
                <div className="text-xs text-slate-500">代币 (销毁)</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <ArrowUp className="w-4 h-4 text-green-400" />
                  下次价格
                </div>
                <div className="text-xl font-bold text-green-400">{formatNumber(mockRoundData.nextPrice)}</div>
                <div className="text-xs text-slate-500">+{GAME_CONFIG.priceIncrement}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  BNB 奖池
                </div>
                <div className="text-xl font-bold text-yellow-400">{mockRoundData.prizePoolBNB.toFixed(3)}</div>
                <div className="text-xs text-slate-500">BNB</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Flame className="w-4 h-4 text-red-400" />
                  已销毁代币
                </div>
                <div className="text-xl font-bold text-red-400">{formatNumber(mockRoundData.totalBurned)}</div>
                <div className="text-xs text-slate-500">永久销毁</div>
              </div>
            </div>

            {/* 接盘按钮 */}
            <div className="max-w-md mx-auto">
              <Button
                onClick={handleTakeover}
                disabled={isEnded || isTaking}
                className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
              >
                {isTaking ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Zap className="w-6 h-6" />
                    </motion.div>
                    接盘中...
                  </span>
                ) : isEnded ? (
                  '本轮已结束'
                ) : (
                  <span className="flex items-center gap-2">
                    <Flame className="w-6 h-6" />
                    我要接盘
                  </span>
                )}
              </Button>
              {!isEnded && (
                <p className="text-center text-sm text-slate-500 mt-3">
                  🔥 接盘消耗 {formatNumber(mockRoundData.nextPrice)} 代币（永久销毁）· 赢取 {mockRoundData.prizePoolBNB.toFixed(3)} BNB
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* 底部信息卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 早期玩家分红 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-700/50 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Crown className="w-5 h-5 text-yellow-400" />
                早期玩家分红
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                <Percent className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400">{FUND_DISTRIBUTION.earlyBirdRate}%</span>
              </div>
            </div>
            <div className="space-y-3">
              {mockRoundData.earlyBirds.map((bird) => (
                <div
                  key={bird.address}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{bird.rank === 1 ? '🥇' : bird.rank === 2 ? '🥈' : '🥉'}</span>
                    <span className="font-mono text-sm text-slate-300">{bird.address}</span>
                  </div>
                  <span className="text-yellow-400 font-medium">+{bird.earnedBNB.toFixed(3)} BNB</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 接盘记录 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-700/50 p-5"
          >
            <div className="flex items-center gap-2 text-white font-semibold mb-4">
              <Users className="w-5 h-5 text-cyan-400" />
              接盘记录
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {mockRoundData.history.slice().reverse().map((record, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    index === 0 ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-800/30'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-slate-300">{record.address}</span>
                    <span className="text-xs text-slate-500">{record.time}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`font-medium ${index === 0 ? 'text-orange-400' : 'text-slate-400'}`}>
                      {formatNumber(record.price)} 代币
                    </span>
                    <span className="text-xs text-yellow-400">+{record.bnbAdded} BNB</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 经济模型说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-slate-900/40 border border-slate-700/50 p-5"
        >
          <div className="flex items-center gap-2 text-white font-semibold mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            游戏规则 · 销毁代币，赢取BNB
          </div>
          
          {/* 资金分配图示 */}
          <div className="mb-6 p-4 rounded-xl bg-slate-800/30">
            <div className="text-sm text-slate-400 mb-3">每次接盘的资金分配：</div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">{FUND_DISTRIBUTION.prizePoolRate}% 奖池</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Crown className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">{FUND_DISTRIBUTION.earlyBirdRate}% 早鸟分红</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                <Gift className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">{FUND_DISTRIBUTION.previousHolderRate}% 上任持有者</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <Percent className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">{FUND_DISTRIBUTION.taxRate}% VRF费用</span>
              </div>
            </div>
          </div>

          {/* 动态比例说明 */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/20">
            <div className="text-sm text-slate-400 mb-3">🎯 动态赢家比例（参与人数越多，奖励越高）：</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {DYNAMIC_TIERS.map((tier, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded-lg text-center ${
                    tier.winnerRate === currentTier.winnerRate 
                      ? 'bg-yellow-500/20 border border-yellow-500/50' 
                      : 'bg-slate-800/30'
                  }`}
                >
                  <div className="text-lg">{tier.label.split(' ')[0]}</div>
                  <div className={`text-xs ${tier.winnerRate === currentTier.winnerRate ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {tier.minPlayers}-{tier.maxPlayers === Infinity ? '∞' : tier.maxPlayers}人
                  </div>
                  <div className={`font-bold ${tier.winnerRate === currentTier.winnerRate ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {tier.winnerRate}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🔥', text: '接盘消耗的代币将被永久销毁' },
              { icon: '📈', text: `每次接盘价格递增${GAME_CONFIG.priceIncrement}%` },
              { icon: '⏰', text: '每整点自动开奖，开启新一轮' },
              { icon: '🏆', text: '开奖时最后持有者赢得BNB奖池' },
            ].map((rule, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30">
                <span className="text-2xl">{rule.icon}</span>
                <span className="text-sm text-slate-300">{rule.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
