import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { GameHistory } from '@/components/GameHistory';
import { Trophy, TrendingUp, Coins } from 'lucide-react';
import { useCyberSlots } from '@/hooks/useCyberSlots';
import { formatEther } from 'ethers';
import { useLanguage } from '@/contexts/LanguageContext';

const History = () => {
  const { totalSpins, totalPaidOut, recentWins } = useCyberSlots();
  const { t } = useLanguage();

  // 从链上事件中计算排行榜数据
  const leaderboard = (() => {
    const playerMap = new Map<string, { totalWins: bigint; winCount: number }>();
    
    recentWins.forEach(win => {
      if (win.winAmount > 0n) {
        const existing = playerMap.get(win.player) || { totalWins: 0n, winCount: 0 };
        playerMap.set(win.player, {
          totalWins: existing.totalWins + win.winAmount,
          winCount: existing.winCount + 1,
        });
      }
    });

    return Array.from(playerMap.entries())
      .map(([address, data]) => ({
        address: `${address.slice(0, 6)}...${address.slice(-4)}`,
        fullAddress: address,
        totalWins: parseFloat(formatEther(data.totalWins)),
        winCount: data.winCount,
      }))
      .sort((a, b) => b.totalWins - a.totalWins)
      .slice(0, 5)
      .map((player, index) => ({ ...player, rank: index + 1 }));
  })();

  return (
    <div className="min-h-screen bg-background cyber-grid relative">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-50" />
      <div className="fixed inset-0 bg-gradient-to-b from-neon-purple/5 via-transparent to-neon-blue/5 pointer-events-none" />
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display neon-text-purple mb-2">
            {t('history.title')}
          </h1>
          <p className="text-muted-foreground">{t('history.subtitle')}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cyber-card"
          >
            <h2 className="text-xl font-display neon-text-yellow flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5" />
              {t('history.leaderboard')}
              <span className="text-xs text-neon-green ml-2">🔗 {t('history.realtime')}</span>
            </h2>

            <div className="space-y-2">
              {leaderboard.length > 0 ? (
                leaderboard.map((player, index) => (
                  <motion.a
                    key={player.fullAddress}
                    href={`https://bscscan.com/address/${player.fullAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity
                      ${index === 0 ? 'neon-border bg-neon-yellow/10' : 
                        index === 1 ? 'border border-neon-purple/50 bg-neon-purple/5' :
                        index === 2 ? 'border border-neon-cyan/50 bg-neon-cyan/5' :
                        'border border-border bg-muted/20'}
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-display
                      ${index === 0 ? 'bg-neon-yellow/20 text-neon-yellow' :
                        index === 1 ? 'bg-neon-purple/20 text-neon-purple' :
                        index === 2 ? 'bg-neon-cyan/20 text-neon-cyan' :
                        'bg-muted text-muted-foreground'}
                    `}>
                      {player.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-foreground">{player.address}</div>
                      <div className="text-sm text-muted-foreground">
                        {player.winCount} {t('history.wins')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-neon-yellow">
                        {player.totalWins.toFixed(4)} BNB
                      </div>
                    </div>
                  </motion.a>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {t('history.noLeaderboard')}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GameHistory />
          </motion.div>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="cyber-card flex items-center gap-4">
            <div className="p-3 rounded-lg bg-neon-purple/20">
              <TrendingUp className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <div className="text-2xl font-display text-foreground">
                {totalSpins.toString()}
              </div>
              <div className="text-sm text-muted-foreground">{t('history.totalSpins')} 🔗</div>
            </div>
          </div>
          <div className="cyber-card flex items-center gap-4">
            <div className="p-3 rounded-lg bg-neon-yellow/20">
              <Coins className="w-6 h-6 text-neon-yellow" />
            </div>
            <div>
              <div className="text-2xl font-display text-foreground">
                {parseFloat(totalPaidOut).toFixed(4)} BNB
              </div>
              <div className="text-sm text-muted-foreground">{t('history.totalPaidOut')} 🔗</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default History;
