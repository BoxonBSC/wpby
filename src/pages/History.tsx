import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Trophy, TrendingUp, Coins, Crown, Flame, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWallet } from '@/contexts/WalletContext';
import { useHiLoHistory } from '@/hooks/useHiLoHistory';
import { useCyberHiLo } from '@/hooks/useCyberHiLo';

const History = () => {
  const { t } = useLanguage();
  const { isConnected, address } = useWallet();
  const { results } = useHiLoHistory(address);
  const { prizePool } = useCyberHiLo();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond':
      case '钻石': return '#00D4FF';
      case 'platinum':
      case '铂金': return '#E5E4E2';
      case 'gold':
      case '黄金': return '#FFD700';
      case 'silver':
      case '白银': return '#C0C0C0';
      default: return '#CD7F32';
    }
  };

  const getTierName = (tier: string) => {
    const names: Record<string, string> = {
      'bronze': '青铜',
      'silver': '白银', 
      'gold': '黄金',
      'platinum': '铂金',
      'diamond': '钻石',
    };
    return names[tier] || tier;
  };

  // 计算统计数据
  const totalGames = results.length;
  const totalWins = results.filter(r => r.cashedOut && r.bnbWon > 0).length;
  const totalBnbWon = results.reduce((sum, r) => sum + (r.bnbWon || 0), 0);

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

        {/* 未连接钱包提示 */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 mb-6 rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.25)',
            }}
          >
            <AlertCircle className="w-12 h-12 text-[#C9A347]/50 mx-auto mb-4" />
            <p className="text-[#C9A347]/70 text-lg">请先连接钱包查看您的战绩</p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 排行榜 - 即将开放 */}
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

            <div className="text-center py-8">
              <Crown className="w-16 h-16 text-[#C9A347]/30 mx-auto mb-4" />
              <p className="text-[#C9A347]/50 text-lg">全球排行榜即将开放</p>
              <p className="text-[#C9A347]/30 text-sm mt-2">敬请期待</p>
            </div>
          </motion.div>

          {/* 我的战绩 */}
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
              我的战绩
            </h2>

            {results.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-[#C9A347]/30 mx-auto mb-4" />
                <p className="text-[#C9A347]/50 text-lg">
                  {isConnected ? '暂无游戏记录' : '连接钱包后查看'}
                </p>
                <p className="text-[#C9A347]/30 text-sm mt-2">
                  {isConnected ? '开始游戏创造传奇' : ''}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {results.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-4 p-3 rounded-lg"
                    style={{
                      background: record.cashedOut && record.bnbWon > 0 
                        ? 'rgba(34, 197, 94, 0.1)' 
                        : 'rgba(0, 0, 0, 0.2)',
                      border: record.cashedOut && record.bnbWon > 0
                        ? '1px solid rgba(34, 197, 94, 0.2)'
                        : '1px solid rgba(201, 163, 71, 0.1)',
                    }}
                  >
                    <div 
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        background: `${getTierColor(record.betTier)}20`,
                        color: getTierColor(record.betTier),
                        border: `1px solid ${getTierColor(record.betTier)}40`,
                      }}
                    >
                      {getTierName(record.betTier)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#C9A347]">
                        {record.cashedOut ? '✓ 收手成功' : '✗ 挑战失败'}
                      </div>
                      <div className="text-sm text-[#C9A347]/60">{record.streak} 连胜</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${record.bnbWon > 0 ? 'text-[#00FFC8]' : 'text-red-400'}`}>
                        {record.bnbWon > 0 ? `+${record.bnbWon.toFixed(4)}` : '0'} BNB
                      </div>
                      <div className="text-xs text-[#C9A347]/40">
                        {new Date(record.timestamp).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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
              <div className="text-2xl font-bold text-[#C9A347]">{totalGames}</div>
              <div className="text-sm text-[#C9A347]/60">我的对局</div>
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
              <div className="text-2xl font-bold text-[#FFD700]">{totalBnbWon.toFixed(4)} BNB</div>
              <div className="text-sm text-[#FFD700]/60">累计获得</div>
            </div>
          </div>
          
          <div 
            className="rounded-xl p-4 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 200, 0.1) 0%, rgba(15, 12, 8, 0.95) 100%)',
              border: '1px solid rgba(0, 255, 200, 0.2)',
            }}
          >
            <div className="p-3 rounded-lg bg-[#00FFC8]/20">
              <Trophy className="w-6 h-6 text-[#00FFC8]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#00FFC8]">{totalWins}</div>
              <div className="text-sm text-[#00FFC8]/60">成功收手</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default History;
