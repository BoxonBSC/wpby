import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Trophy, TrendingUp, Coins, Crown, Flame } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// 模拟历史数据（后续接入链上数据）
const mockHistory = [
  { id: '1', player: '0x1234...5678', streak: 12, reward: 0.6, tier: '黄金', timestamp: Date.now() - 3600000 },
  { id: '2', player: '0xabcd...efgh', streak: 8, reward: 0.1, tier: '白银', timestamp: Date.now() - 7200000 },
  { id: '3', player: '0x9876...4321', streak: 16, reward: 2.5, tier: '铂金', timestamp: Date.now() - 10800000 },
  { id: '4', player: '0xfedc...ba98', streak: 5, reward: 0.025, tier: '青铜', timestamp: Date.now() - 14400000 },
  { id: '5', player: '0x5555...6666', streak: 20, reward: 10, tier: '钻石', timestamp: Date.now() - 18000000 },
];

const mockLeaderboard = [
  { rank: 1, player: '0x5555...6666', totalWins: 15.5, winCount: 8 },
  { rank: 2, player: '0x9876...4321', totalWins: 8.2, winCount: 12 },
  { rank: 3, player: '0x1234...5678', totalWins: 3.1, winCount: 6 },
  { rank: 4, player: '0xabcd...efgh', totalWins: 1.8, winCount: 15 },
  { rank: 5, player: '0xfedc...ba98', totalWins: 0.9, winCount: 20 },
];

const History = () => {
  const { t } = useLanguage();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case '钻石': return '#00D4FF';
      case '铂金': return '#E5E4E2';
      case '黄金': return '#FFD700';
      case '白银': return '#C0C0C0';
      default: return '#CD7F32';
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(180deg, #0f0c07 0%, #0a0908 100%)',
      }}
    >
      {/* 背景装饰 */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(201, 163, 71, 0.1) 0%, transparent 50%)',
        }}
      />
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{
              fontFamily: '"Cinzel", "Noto Serif SC", serif',
              letterSpacing: '0.1em',
              background: 'linear-gradient(135deg, #FFD700 0%, #C9A347 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🃏 战绩殿堂
          </h1>
          <p 
            className="text-[#C9A347]/60"
            style={{ fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif' }}
          >
            记录每一次精彩博弈
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 排行榜 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.25)',
            }}
          >
            <h2 
              className="text-xl font-bold text-[#FFD700] flex items-center gap-2 mb-4"
              style={{ fontFamily: '"Cinzel", "Noto Serif SC", serif', letterSpacing: '0.08em' }}
            >
              <Crown className="w-5 h-5" />
              王者榜单
            </h2>

            <div className="space-y-2">
              {mockLeaderboard.map((player, index) => (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg"
                  style={{
                    background: index === 0 
                      ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, transparent 100%)'
                      : index === 1 
                        ? 'linear-gradient(90deg, rgba(192, 192, 0.1) 0%, transparent 100%)'
                        : 'rgba(0, 0, 0, 0.2)',
                    border: index === 0 
                      ? '1px solid rgba(255, 215, 0, 0.3)' 
                      : '1px solid rgba(201, 163, 71, 0.1)',
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                    style={{
                      background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'rgba(201, 163, 71, 0.2)',
                      color: index < 3 ? '#000' : '#C9A347',
                    }}
                  >
                    {player.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#C9A347]">{player.player}</div>
                    <div className="text-sm text-[#C9A347]/60">{player.winCount} 次胜利</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#FFD700]">{player.totalWins.toFixed(4)} BNB</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 最近记录 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.25)',
            }}
          >
            <h2 
              className="text-xl font-bold text-[#FFD700] flex items-center gap-2 mb-4"
              style={{ fontFamily: '"Cinzel", "Noto Serif SC", serif', letterSpacing: '0.08em' }}
            >
              <Trophy className="w-5 h-5" />
              最近战绩
            </h2>

            <div className="space-y-2">
              {mockHistory.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg"
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(201, 163, 71, 0.1)',
                  }}
                >
                  <div 
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{
                      background: `${getTierColor(record.tier)}20`,
                      color: getTierColor(record.tier),
                      border: `1px solid ${getTierColor(record.tier)}40`,
                    }}
                  >
                    {record.tier}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#C9A347]">{record.player}</div>
                    <div className="text-sm text-[#C9A347]/60">{record.streak} 连胜</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#FFD700]">+{record.reward.toFixed(4)} BNB</div>
                    <div className="text-xs text-[#C9A347]/40">
                      {new Date(record.timestamp).toLocaleTimeString('zh-CN')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 统计概览 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div 
            className="rounded-xl p-4 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 163, 71, 0.1) 0%, rgba(15, 12, 8, 0.95) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.2)',
            }}
          >
            <div className="p-3 rounded-lg bg-[#C9A347]/20">
              <TrendingUp className="w-6 h-6 text-[#C9A347]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#C9A347]">1,234</div>
              <div className="text-sm text-[#C9A347]/60">总对局数</div>
            </div>
          </div>
          
          <div 
            className="rounded-xl p-4 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(15, 12, 8, 0.95) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
            }}
          >
            <div className="p-3 rounded-lg bg-[#FFD700]/20">
              <Coins className="w-6 h-6 text-[#FFD700]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#FFD700]">45.67 BNB</div>
              <div className="text-sm text-[#FFD700]/60">累计派奖</div>
            </div>
          </div>
          
          <div 
            className="rounded-xl p-4 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 100, 50, 0.1) 0%, rgba(15, 12, 8, 0.95) 100%)',
              border: '1px solid rgba(255, 100, 50, 0.2)',
            }}
          >
            <div className="p-3 rounded-lg bg-orange-500/20">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">500M</div>
              <div className="text-sm text-orange-500/60">代币燃烧</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default History;
