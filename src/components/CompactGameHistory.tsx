import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, User } from 'lucide-react';
import { useCyberSlots, formatSymbols, shortenAddress } from '@/hooks/useCyberSlots';
import { formatEther } from 'ethers';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  address: string;
  result: string;
  winAmount: number;
  timestamp: Date;
  isWin: boolean;
  txHash?: string;
}

const VISIBLE_COUNT = 5; // 每次显示5条
const ROTATE_INTERVAL = 4000; // 每4秒轮动一次

export function CompactGameHistory() {
  const { recentWins } = useCyberSlots();
  const { t } = useLanguage();
  const [startIndex, setStartIndex] = useState(0);

  // 获取最多20条中奖记录
  const allHistory: HistoryItem[] = recentWins
    .filter(win => win.winAmount > 0n)
    .slice(0, 20)
    .map((win, index) => ({
      id: `${win.requestId}-${index}`,
      address: shortenAddress(win.player),
      result: formatSymbols(win.symbols).join(' '),
      winAmount: parseFloat(formatEther(win.winAmount)),
      timestamp: new Date(win.timestamp),
      isWin: true,
      txHash: win.txHash,
    }));

  // 轮动效果：当记录超过5条时自动切换
  useEffect(() => {
    if (allHistory.length <= VISIBLE_COUNT) return;
    
    const interval = setInterval(() => {
      setStartIndex((prev) => {
        const nextIndex = prev + 1;
        // 循环回到开始
        return nextIndex >= allHistory.length ? 0 : nextIndex;
      });
    }, ROTATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [allHistory.length]);

  // 计算当前显示的记录（支持循环）
  const displayHistory = (() => {
    if (allHistory.length === 0) return [];
    if (allHistory.length <= VISIBLE_COUNT) return allHistory;
    
    const result: HistoryItem[] = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      const index = (startIndex + i) % allHistory.length;
      result.push(allHistory[index]);
    }
    return result;
  })();

  const getBscScanUrl = (hash: string) => `https://bscscan.com/tx/${hash}`;

  return (
    <div className="cyber-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-display neon-text-cyan flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {t('compactHistory.title')}
        </h3>
        <div className="flex items-center gap-2">
          {allHistory.length > VISIBLE_COUNT && (
            <span className="text-xs text-muted-foreground">
              {startIndex + 1}-{Math.min(startIndex + VISIBLE_COUNT, allHistory.length)}/{allHistory.length}
            </span>
          )}
          {allHistory.length > 0 && (
            <span className="text-xs text-neon-green">🔗 {t('compactHistory.live')}</span>
          )}
        </div>
      </div>

      <div className="space-y-1.5 flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {displayHistory.map((item, index) => {
            const content = (
              <motion.div
                key={`${item.id}-${startIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={`
                  flex items-center gap-2 p-2 rounded-lg text-xs
                  ${item.isWin ? 'neon-border bg-neon-green/5' : 'border border-border bg-muted/20'}
                  ${item.txHash ? 'cursor-pointer hover:bg-neon-green/10 transition-colors' : ''}
                `}
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {item.address}
                  </span>
                </div>
                <div className="text-sm flex-shrink-0">
                  {item.result}
                </div>
                <div className="text-right flex-shrink-0">
                  {item.isWin && (
                    <div className="flex items-center gap-1 text-neon-yellow">
                      <Trophy className="w-3 h-3" />
                      <span className="font-display">+{item.winAmount.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );

            return item.txHash ? (
              <a
                key={`${item.id}-${startIndex}-link`}
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
          })}
        </AnimatePresence>
        
        {allHistory.length === 0 && (
          <div className="text-center text-muted-foreground text-xs py-4">
            {t('compactHistory.noRecords')}
          </div>
        )}
      </div>
      
      <a 
        href="/history" 
        className="mt-3 text-xs text-neon-cyan hover:underline text-center block"
      >
        {t('compactHistory.viewMore')}
      </a>
    </div>
  );
}
