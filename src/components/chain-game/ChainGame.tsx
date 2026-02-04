import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, Trophy, Users, TrendingUp, Zap, Crown, Gift, ArrowUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@/contexts/WalletContext';
// 模拟数据
const mockRoundData = {
  roundId: 42,
  currentHolder: '0x1234...5678',
  currentPrice: 1234567,
  nextPrice: 1358024,
  prizePool: 8765432,
  taxPool: 123456,
  totalParticipants: 15,
  earlyBirds: [
    { address: '0xABC...DEF', earned: 12345 },
    { address: '0xDEF...GHI', earned: 10234 },
    { address: '0xGHI...JKL', earned: 8123 },
  ],
  history: [
    { address: '0x111...222', price: 100000, time: '2分钟前' },
    { address: '0x333...444', price: 110000, time: '1分30秒前' },
    { address: '0x555...666', price: 121000, time: '1分钟前' },
    { address: '0x777...888', price: 133100, time: '45秒前' },
    { address: '0x1234...5678', price: 1234567, time: '刚刚' },
  ],
};

export function ChainGame() {
  const [timeLeft, setTimeLeft] = useState(180);
  const [isEnded, setIsEnded] = useState(false);
  const [isTaking, setIsTaking] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const { isConnected, address } = useWallet();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsEnded(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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
          接盘价格递增10% · 无人接盘时最后持有者通吃
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
            {/* 轮次和参与人数 */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <Flame className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-medium">第 #{mockRoundData.roundId} 轮</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-4 h-4" />
                <span>{mockRoundData.totalParticipants} 人参与</span>
              </div>
            </div>

            {/* 倒计时区域 */}
            <div className="text-center mb-8">
              <AnimatePresence mode="wait">
                {!isEnded ? (
                  <motion.div
                    key="countdown"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">倒计时</span>
                    </div>
                    <div
                      className={`text-6xl md:text-8xl font-mono font-bold tracking-tight ${
                        timeLeft <= 30
                          ? 'text-red-400 animate-pulse'
                          : timeLeft <= 60
                          ? 'text-orange-400'
                          : 'text-white'
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </div>
                    {/* 进度条 */}
                    <div className="mt-4 mx-auto max-w-md h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(timeLeft / 300) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
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
                    <div className="text-slate-400">恭喜 {mockRoundData.currentHolder} 获胜</div>
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
                  <TrendingUp className="w-4 h-4" />
                  当前价格
                </div>
                <div className="text-xl font-bold text-white">{formatNumber(mockRoundData.currentPrice)}</div>
                <div className="text-xs text-slate-500">CYBER</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <ArrowUp className="w-4 h-4 text-green-400" />
                  接盘价格
                </div>
                <div className="text-xl font-bold text-green-400">{formatNumber(mockRoundData.nextPrice)}</div>
                <div className="text-xs text-slate-500">+10%</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Trophy className="w-4 h-4 text-cyan-400" />
                  奖池总额
                </div>
                <div className="text-xl font-bold text-cyan-400">{formatNumber(mockRoundData.prizePool)}</div>
                <div className="text-xs text-slate-500">CYBER</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Gift className="w-4 h-4 text-purple-400" />
                  税金加成
                </div>
                <div className="text-xl font-bold text-purple-400">{formatNumber(mockRoundData.taxPool)}</div>
                <div className="text-xs text-slate-500">CYBER</div>
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
                  接盘后倒计时重置，无人接盘则您赢得全部奖池
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
            <div className="flex items-center gap-2 text-white font-semibold mb-4">
              <Crown className="w-5 h-5 text-yellow-400" />
              早期玩家分红
            </div>
            <div className="space-y-3">
              {mockRoundData.earlyBirds.map((bird, index) => (
                <div
                  key={bird.address}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                    <span className="font-mono text-sm text-slate-300">{bird.address}</span>
                  </div>
                  <span className="text-green-400 font-medium">+{formatNumber(bird.earned)}</span>
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
                  <span className={`font-medium ${index === 0 ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {formatNumber(record.price)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 游戏规则 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-slate-900/40 border border-slate-700/50 p-5"
        >
          <div className="flex items-center gap-2 text-white font-semibold mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            游戏规则
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '📈', text: '接盘价格必须比上家高10%' },
              { icon: '⏱️', text: '每次接盘后倒计时重置为5分钟' },
              { icon: '🏆', text: '倒计时结束时，持有者赢得全部奖池' },
              { icon: '💰', text: '前3名参与者享受后续接盘分红' },
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
