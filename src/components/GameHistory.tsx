import { motion } from 'framer-motion';
import { Clock, Trophy, User } from 'lucide-react';

interface HistoryItem {
  id: string;
  address: string;
  result: string;
  winAmount: number;
  timestamp: Date;
  isWin: boolean;
}

// Mock data for demo
const mockHistory: HistoryItem[] = [
  { id: '1', address: '0x1234...5678', result: '7️⃣ 7️⃣ 7️⃣', winAmount: 2.1, timestamp: new Date(Date.now() - 60000), isWin: true },
  { id: '2', address: '0xabcd...ef01', result: '🍒 🍒 🍋', winAmount: 0.105, timestamp: new Date(Date.now() - 120000), isWin: true },
  { id: '3', address: '0x9876...5432', result: '💎 💎 💎', winAmount: 0.525, timestamp: new Date(Date.now() - 180000), isWin: true },
  { id: '4', address: '0xfedc...ba98', result: '⭐ 🔔 🍀', winAmount: 0, timestamp: new Date(Date.now() - 240000), isWin: false },
  { id: '5', address: '0x2468...1357', result: '🍋 🍋 🍒', winAmount: 0.105, timestamp: new Date(Date.now() - 300000), isWin: true },
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

export function GameHistory() {
  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display neon-text-cyan flex items-center gap-2">
          <Clock className="w-5 h-5" />
          最近中奖记录
        </h3>
      </div>

      <div className="space-y-2">
        {mockHistory.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              flex items-center gap-3 p-3 rounded-lg
              ${item.isWin ? 'neon-border bg-neon-green/5' : 'border border-border bg-muted/20'}
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
                  <span className="font-display">+{item.winAmount.toFixed(3)}</span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">未中奖</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex-shrink-0 w-16 text-right">
              {formatTime(item.timestamp)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
