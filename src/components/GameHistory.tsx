import { motion } from 'framer-motion';
import { Clock, Trophy, User } from 'lucide-react';
import { useCyberSlots, formatSymbols, shortenAddress } from '@/hooks/useCyberSlots';
import { formatEther } from 'ethers';
import { useLanguage } from '@/contexts/LanguageContext';

interface HistoryItem {
  id: string;
  address: string;
  fullAddress: string;
  result: string;
  winAmount: number;
  timestamp: Date;
  isWin: boolean;
  txHash?: string;
}

export function GameHistory() {
  const { recentWins } = useCyberSlots();
  const { t, language } = useLanguage();

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('history.justNow');
    if (minutes < 60) return t('history.minutesAgo').replace('{n}', String(minutes));
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('history.hoursAgo').replace('{n}', String(hours));
    return t('history.daysAgo').replace('{n}', String(Math.floor(hours / 24)));
  };

  // 显示所有中奖记录（最多20条）
  const displayHistory: HistoryItem[] = recentWins
    .filter(win => win.winAmount > 0n)
    .slice(0, 20)
    .map((win, index) => ({
      id: `${win.requestId}-${index}`,
      address: shortenAddress(win.player),
      fullAddress: win.player,
      result: formatSymbols(win.symbols).join(' '),
      winAmount: parseFloat(formatEther(win.winAmount)),
      timestamp: new Date(win.timestamp),
      isWin: true,
      txHash: win.txHash,
    }));

  const getBscScanUrl = (hash: string) => `https://bscscan.com/tx/${hash}`;

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display neon-text-cyan flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {t('history.recentWins')}
        </h3>
        {displayHistory.length > 0 && (
          <span className="text-xs text-neon-green">🔗 {language === 'zh' ? '链上实时' : 'Live'}</span>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayHistory.length > 0 ? (
          displayHistory.map((item, index) => {
            const content = (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center gap-3 p-3 rounded-lg
                  ${item.isWin ? 'neon-border bg-neon-green/5' : 'border border-border bg-muted/20'}
                  ${item.txHash ? 'cursor-pointer hover:bg-neon-green/10 transition-colors' : ''}
                `}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {item.address}
                  </span>
                </div>
                <div className="text-lg flex-shrink-0">
                  {item.result}
                </div>
                <div className="text-right flex-shrink-0">
                  {item.isWin ? (
                    <div className="flex items-center gap-1 text-neon-yellow">
                      <Trophy className="w-4 h-4" />
                      <span className="font-display">+{item.winAmount.toFixed(4)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">{t('slot.noWin')}</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0 w-16 text-right">
                  {formatTime(item.timestamp)}
                </div>
              </motion.div>
            );

            return item.txHash ? (
              <a
                key={item.id}
                href={getBscScanUrl(item.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {content}
              </a>
            ) : (
              content
            );
          })
        ) : (
          <div className="text-center text-muted-foreground py-8">
            {t('history.noWins')}
          </div>
        )}
      </div>
    </div>
  );
}
