import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { GameHistory } from '@/components/GameHistory';
import { Trophy, TrendingUp, Users } from 'lucide-react';

// Mock leaderboard data
const leaderboard = [
  { rank: 1, address: '0x1234...5678', totalWins: 15.234, winCount: 42 },
  { rank: 2, address: '0xabcd...ef01', totalWins: 12.891, winCount: 38 },
  { rank: 3, address: '0x9876...5432', totalWins: 10.567, winCount: 31 },
  { rank: 4, address: '0xfedc...ba98', totalWins: 8.234, winCount: 27 },
  { rank: 5, address: '0x2468...1357', totalWins: 6.789, winCount: 22 },
];

const History = () => {
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
            游戏记录
          </h1>
          <p className="text-muted-foreground">查看最近的游戏记录和排行榜</p>
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
              中奖排行榜
            </h2>

            <div className="space-y-2">
              {leaderboard.map((player, index) => (
                <motion.div
                  key={player.address}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    flex items-center gap-4 p-3 rounded-lg
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
                      {player.winCount} 次中奖
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-neon-yellow">
                      {player.totalWins.toFixed(3)} BNB
                    </div>
                  </div>
                </motion.div>
              ))}
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
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="cyber-card flex items-center gap-4">
            <div className="p-3 rounded-lg bg-neon-blue/20">
              <Users className="w-6 h-6 text-neon-blue" />
            </div>
            <div>
              <div className="text-2xl font-display text-foreground">1,234</div>
              <div className="text-sm text-muted-foreground">总玩家数</div>
            </div>
          </div>
          <div className="cyber-card flex items-center gap-4">
            <div className="p-3 rounded-lg bg-neon-purple/20">
              <TrendingUp className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <div className="text-2xl font-display text-foreground">45,678</div>
              <div className="text-sm text-muted-foreground">总游戏次数</div>
            </div>
          </div>
          <div className="cyber-card flex items-center gap-4">
            <div className="p-3 rounded-lg bg-neon-yellow/20">
              <Trophy className="w-6 h-6 text-neon-yellow" />
            </div>
            <div>
              <div className="text-2xl font-display text-foreground">234.56 BNB</div>
              <div className="text-sm text-muted-foreground">总派奖金额</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default History;
