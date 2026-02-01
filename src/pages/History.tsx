import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Trophy, TrendingUp, Coins, Crown, Flame, AlertCircle, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWallet } from '@/contexts/WalletContext';
import { useHiLoHistory } from '@/hooks/useHiLoHistory';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Button } from '@/components/ui/button';

const History = () => {
  const { t } = useLanguage();
  const { isConnected, address } = useWallet();
  const { results } = useHiLoHistory(address);
  const { leaderboard, recentWins, globalStats, isLoading, error, refresh } = useLeaderboard();

  const getTierColor = (tier: string) => {
    // 单一门槛，统一使用金色
    return '#FFD700';
  };

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 计算我的统计
  const myTotalGames = results.length;
  const myTotalWins = results.filter(r => r.cashedOut && r.bnbWon > 0).length;
  const myTotalBnbWon = results.reduce((sum, r) => sum + (r.bnbWon || 0), 0);

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
            {t('history.title')}
          </h1>
          <p 
            className="text-[#C9A347]/60"
            style={{ fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif' }}
          >
            {t('history.subtitle')}
          </p>
        </motion.div>

        {/* 全局统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
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
              <div className="text-2xl font-bold text-[#C9A347]">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : globalStats.totalGames.toLocaleString()}
              </div>
              <div className="text-sm text-[#C9A347]/60">{t('history.totalSpins')}</div>
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
              <div className="text-2xl font-bold text-[#FFD700]">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${globalStats.totalPaidOut.toFixed(4)} BNB`}
              </div>
              <div className="text-sm text-[#FFD700]/60">{t('history.totalPaidOut')}</div>
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
              <Crown className="w-6 h-6 text-[#00FFC8]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#00FFC8]">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : globalStats.totalPlayers}
              </div>
              <div className="text-sm text-[#00FFC8]/60">{t('history.totalPlayers')}</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 全球排行榜 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.25)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-xl font-bold text-[#FFD700] flex items-center gap-2"
                style={{ fontFamily: '"Cinzel", "Noto Serif SC", serif', letterSpacing: '0.08em' }}
              >
                <Crown className="w-5 h-5" />
                {t('history.leaderboard')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
                className="text-[#C9A347]/60 hover:text-[#C9A347]"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400/50 mx-auto mb-4" />
                <p className="text-red-400/70">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  className="mt-2 text-[#C9A347]"
                >
                  {t('history.retry')}
                </Button>
              </div>
            ) : isLoading && leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-[#C9A347]/50 mx-auto mb-4 animate-spin" />
                <p className="text-[#C9A347]/50">{t('history.loadingOnchain')}</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Crown className="w-16 h-16 text-[#C9A347]/30 mx-auto mb-4" />
                <p className="text-[#C9A347]/50 text-lg">{t('history.noLeaderboard')}</p>
                <p className="text-[#C9A347]/30 text-sm mt-2">{t('history.beFirst')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <motion.div
                    key={player.player}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg"
                    style={{
                      background: index === 0 
                        ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, transparent 100%)'
                        : index === 1 
                          ? 'linear-gradient(90deg, rgba(192, 192, 192, 0.1) 0%, transparent 100%)'
                          : index === 2
                            ? 'linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, transparent 100%)'
                            : 'rgba(0, 0, 0, 0.2)',
                      border: index === 0 
                        ? '1px solid rgba(255, 215, 0, 0.3)' 
                        : '1px solid rgba(201, 163, 71, 0.1)',
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'rgba(201, 163, 71, 0.2)',
                        color: index < 3 ? '#000' : '#C9A347',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#C9A347] truncate">
                        {shortenAddress(player.player)}
                        {player.player.toLowerCase() === address?.toLowerCase() && (
                          <span className="ml-2 text-xs text-[#00FFC8]">{t('history.me')}</span>
                        )}
                      </div>
                      <div className="text-sm text-[#C9A347]/60">
                        {player.totalWins} {t('history.wins')} · {t('history.maxStreak').replace('{n}', String(player.maxStreak))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#FFD700]">{player.totalBnbWon.toFixed(4)} BNB</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* 最近全球获胜 */}
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
              <Flame className="w-5 h-5" />
              {t('history.realtime')}
            </h2>

            {isLoading && recentWins.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-[#C9A347]/50 mx-auto mb-4 animate-spin" />
                <p className="text-[#C9A347]/50">{t('history.loadingOnchain')}</p>
              </div>
            ) : recentWins.length === 0 ? (
              <div className="text-center py-8">
                <Flame className="w-16 h-16 text-[#C9A347]/30 mx-auto mb-4" />
                <p className="text-[#C9A347]/50 text-lg">{t('history.noWins')}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {recentWins.map((record, index) => (
                  <motion.div
                    key={`${record.txHash}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-4 p-3 rounded-lg"
                    style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    <div 
                      className="px-2 py-1 rounded text-xs font-bold bg-[#00FFC8]/20 text-[#00FFC8] border border-[#00FFC8]/40"
                    >
                      {t('history.streak').replace('{n}', String(record.streak))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#C9A347] truncate">
                        {shortenAddress(record.player)}
                        {record.player.toLowerCase() === address?.toLowerCase() && (
                          <span className="ml-2 text-xs text-[#00FFC8]">{t('history.me')}</span>
                        )}
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
                    <div className="text-right flex items-center gap-2">
                      <div className="font-bold text-[#00FFC8]">+{record.bnbWon.toFixed(4)} BNB</div>
                      <a
                        href={`https://bscscan.com/tx/${record.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C9A347]/50 hover:text-[#C9A347]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* 我的战绩统计 */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 rounded-2xl p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
              border: '1px solid rgba(0, 255, 200, 0.25)',
            }}
          >
            <h2 
              className="text-xl font-bold text-[#00FFC8] flex items-center gap-2 mb-4"
              style={{ fontFamily: '"Cinzel", "Noto Serif SC", serif', letterSpacing: '0.08em' }}
            >
              <Trophy className="w-5 h-5" />
              {t('history.myStats')}
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-[#C9A347]/10">
                <div className="text-2xl font-bold text-[#C9A347]">{myTotalGames}</div>
                <div className="text-sm text-[#C9A347]/60">{t('history.totalGames')}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#00FFC8]/10">
                <div className="text-2xl font-bold text-[#00FFC8]">{myTotalWins}</div>
                <div className="text-sm text-[#00FFC8]/60">{t('history.successCashout')}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#FFD700]/10">
                <div className="text-2xl font-bold text-[#FFD700]">{myTotalBnbWon.toFixed(4)} BNB</div>
                <div className="text-sm text-[#FFD700]/60">{t('history.totalEarned')}</div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default History;
