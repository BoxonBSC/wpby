import { motion } from 'framer-motion';
import { Clock, Trophy, User } from 'lucide-react';
import { useCyberSlots, formatSymbols, shortenAddress } from '@/hooks/useCyberSlots';
import { formatEther } from 'ethers';

interface HistoryItem {
  id: string;
  address: string;
  result: string;
  winAmount: number;
  timestamp: Date;
  isWin: boolean;
}

const mockHistory: HistoryItem[] = [
  { id: '1', address: '0x1234...5678', result: '7️⃣ 7️⃣ 7️⃣ 7️⃣ 7️⃣', winAmount: 2.1, timestamp: new Date(Date.now() - 60000), isWin: true },
  { id: '2', address: '0xabcd...ef01', result: '🍒 🍒 🍒 🍋 🍇', winAmount: 0.105, timestamp: new Date(Date.now() - 120000), isWin: true },
  { id: '3', address: '0x9876...5432', result: '💎 💎 💎 💎 💎', winAmount: 0.525, timestamp: new Date(Date.now() - 180000), isWin: true },
];

const formatTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
};

export function CompactGameHistory() {
  const { recentWins } = useCyberSlots();

  const displayHistory: HistoryItem[] = recentWins.length > 0
    ? recentWins
        .filter(win => win.winAmount > 0n)
        .slice(0, 5)
        .map((win, index) => ({
          id: `${win.requestId}-${index}`,
          address: shortenAddress(win.player),
          result: formatSymbols(win.symbols).join(' '),
          winAmount: parseFloat(formatEther(win.winAmount)),
          timestamp: new Date(win.timestamp),
          isWin: true,
        }))
    : mockHistory;

  return (
    <div className="cyber-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-display neon-text-cyan flex items-center gap-2">
          <Clock className="w-4 h-4" />
          最近中奖
        </h3>
        {recentWins.length > 0 && (
          <span className="text-xs text-neon-green">🔗 实时</span>
        )}
      </div>

      <div className="space-y-1.5 flex-1">
        {displayHistory.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              flex items-center gap-2 p-2 rounded-lg text-xs
              ${item.isWin ? 'neon-border bg-neon-green/5' : 'border border-border bg-muted/20'}
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
        ))}
        
        {displayHistory.length === 0 && (
          <div className="text-center text-muted-foreground text-xs py-4">
            暂无中奖记录
          </div>
        )}
      </div>
      
      <a 
        href="/history" 
        className="mt-3 text-xs text-neon-cyan hover:underline text-center block"
      >
        查看更多 →
      </a>
    </div>
  );
}
