import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, Trophy, Users, TrendingUp, Zap, Crown, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// 模拟数据 - 实际会从合约读取
const mockRoundData = {
  roundId: 42,
  currentHolder: '0x1234...5678',
  currentPrice: 1234567,
  nextPrice: 1358024, // +10%
  prizePool: 8765432,
  taxPool: 123456,
  deadline: Date.now() + 180000, // 3分钟后
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

  // 倒计时逻辑
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

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const handleTakeover = async () => {
    setIsTaking(true);
    // 模拟交易
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTaking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c07] via-[#1a1510] to-[#0f0c07] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] font-cinzel">
            🔥 击鼓传花
          </h1>
          <p className="text-[#C9A347]/80 text-sm md:text-base">
            接盘越高，赢得越多！无人接盘时，最后持有者通吃奖池
          </p>
        </motion.div>

        {/* 主游戏区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧 - 游戏状态 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 轮次信息卡片 */}
            <Card className="bg-black/40 backdrop-blur-sm border-[#C9A347]/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                  <span className="text-[#C9A347] font-cinzel">
                    第 #{mockRoundData.roundId} 轮
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#C9A347]/70">
                  <Users className="w-4 h-4" />
                  <span>{mockRoundData.totalParticipants} 人参与</span>
                </div>
              </div>

              {/* 倒计时 */}
              <div className="text-center py-6">
                <AnimatePresence mode="wait">
                  {!isEnded ? (
                    <motion.div
                      key="countdown"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-center gap-2 text-[#C9A347]/70">
                        <Clock className="w-5 h-5" />
                        <span>倒计时</span>
                      </div>
                      <div
                        className={`text-5xl md:text-6xl font-bold font-mono ${
                          timeLeft <= 30
                            ? 'text-red-500 animate-pulse'
                            : timeLeft <= 60
                            ? 'text-orange-500'
                            : 'text-[#FFD700]'
                        }`}
                      >
                        {formatTime(timeLeft)}
                      </div>
                      <Progress
                        value={(timeLeft / 300) * 100}
                        className="h-2 bg-[#C9A347]/20"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ended"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-4"
                    >
                      <Trophy className="w-16 h-16 text-[#FFD700] mx-auto animate-bounce" />
                      <div className="text-2xl text-[#FFD700] font-cinzel">
                        🎉 本轮结束！
                      </div>
                      <div className="text-[#C9A347]">
                        恭喜 {mockRoundData.currentHolder} 获胜！
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 当前持有者 */}
              <div className="bg-gradient-to-r from-[#C9A347]/10 via-[#C9A347]/20 to-[#C9A347]/10 rounded-lg p-4 border border-[#C9A347]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#FFD700]" />
                    <span className="text-[#C9A347]/70">当前持有者</span>
                  </div>
                  <span className="text-[#FFD700] font-mono">
                    {mockRoundData.currentHolder}
                  </span>
                </div>
              </div>
            </Card>

            {/* 价格和奖池 */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-black/40 backdrop-blur-sm border-[#C9A347]/30 p-4">
                <div className="flex items-center gap-2 text-[#C9A347]/70 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>当前价格</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-[#FFD700]">
                  {formatNumber(mockRoundData.currentPrice)}
                </div>
                <div className="text-sm text-[#C9A347]/50">CYBER</div>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-[#C9A347]/30 p-4">
                <div className="flex items-center gap-2 text-[#C9A347]/70 mb-2">
                  <Trophy className="w-4 h-4" />
                  <span>奖池总额</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-[#00FFC8]">
                  {formatNumber(mockRoundData.prizePool)}
                </div>
                <div className="text-sm text-[#C9A347]/50">CYBER</div>
              </Card>
            </div>

            {/* 接盘按钮区域 */}
            <Card className="bg-gradient-to-b from-[#1a1510] to-black/60 backdrop-blur-sm border-[#C9A347]/30 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#C9A347]/70">接盘价格 (+10%)</span>
                  <span className="text-xl font-bold text-[#FFD700]">
                    {formatNumber(mockRoundData.nextPrice)} CYBER
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#C9A347]/50">
                  <Gift className="w-4 h-4" />
                  <span>
                    额外税金奖励: {formatNumber(mockRoundData.taxPool)} CYBER
                  </span>
                </div>

                <Button
                  onClick={handleTakeover}
                  disabled={isEnded || isTaking}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] hover:from-[#FFA500] hover:via-[#FFD700] hover:to-[#FFA500] text-black transition-all duration-300 disabled:opacity-50"
                >
                  {isTaking ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      接盘中...
                    </span>
                  ) : isEnded ? (
                    '本轮已结束'
                  ) : (
                    <span className="flex items-center gap-2">
                      <Flame className="w-5 h-5" />
                      🔥 我要接盘
                    </span>
                  )}
                </Button>

                {!isEnded && (
                  <p className="text-center text-xs text-[#C9A347]/50">
                    接盘后倒计时重置，无人接盘则您赢得全部奖池
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* 右侧 - 参与记录 */}
          <div className="space-y-4">
            {/* 早期玩家分红 */}
            <Card className="bg-black/40 backdrop-blur-sm border-[#C9A347]/30 p-4">
              <div className="flex items-center gap-2 text-[#C9A347] mb-4">
                <Crown className="w-5 h-5" />
                <span className="font-cinzel">早期玩家分红</span>
              </div>
              <div className="space-y-3">
                {mockRoundData.earlyBirds.map((bird, index) => (
                  <motion.div
                    key={bird.address}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#C9A347]/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <span className="text-sm text-[#C9A347]/80 font-mono">
                        {bird.address}
                      </span>
                    </div>
                    <span className="text-sm text-[#00FFC8]">
                      +{formatNumber(bird.earned)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* 接盘历史 */}
            <Card className="bg-black/40 backdrop-blur-sm border-[#C9A347]/30 p-4">
              <div className="flex items-center gap-2 text-[#C9A347] mb-4">
                <Users className="w-5 h-5" />
                <span className="font-cinzel">接盘记录</span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {mockRoundData.history
                  .slice()
                  .reverse()
                  .map((record, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        index === 0
                          ? 'bg-[#FFD700]/20 border border-[#FFD700]/30'
                          : 'bg-[#C9A347]/5'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm text-[#C9A347]/80 font-mono">
                          {record.address}
                        </span>
                        <span className="text-xs text-[#C9A347]/50">
                          {record.time}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          index === 0 ? 'text-[#FFD700]' : 'text-[#C9A347]/70'
                        }`}
                      >
                        {formatNumber(record.price)}
                      </span>
                    </motion.div>
                  ))}
              </div>
            </Card>

            {/* 规则说明 */}
            <Card className="bg-black/40 backdrop-blur-sm border-[#C9A347]/30 p-4">
              <div className="flex items-center gap-2 text-[#C9A347] mb-3">
                <Zap className="w-5 h-5" />
                <span className="font-cinzel">游戏规则</span>
              </div>
              <ul className="space-y-2 text-sm text-[#C9A347]/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">•</span>
                  <span>接盘价格必须比上家高10%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">•</span>
                  <span>每次接盘后倒计时重置为5分钟</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">•</span>
                  <span>倒计时结束时，持有者赢得全部奖池</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">•</span>
                  <span>前3名参与者享受后续接盘分红</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
