import { motion } from 'framer-motion';

interface Winner {
  address: string;
  amount: number;
  mode: 'normal' | 'lucky';
  time: string;
}

// Demo data for prototype
const DEMO_WINNERS: Winner[] = [
  { address: '0x1a2b...3c4d', amount: 0.15, mode: 'normal', time: '14:00' },
  { address: '0x5e6f...7g8h', amount: 0.08, mode: 'normal', time: '14:00' },
  { address: '0x9i0j...1k2l', amount: 0.52, mode: 'lucky', time: '12:00' },
  { address: '0x3m4n...5o6p', amount: 0.48, mode: 'lucky', time: '12:00' },
  { address: '0x7q8r...9s0t', amount: 0.12, mode: 'normal', time: '13:00' },
];

export function RecentWinners() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-card border border-border overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-bold text-cny-gold">🏆 最近中奖</h3>
      </div>

      <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
        {DEMO_WINNERS.map((winner, i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{winner.mode === 'lucky' ? '🔥' : '🧧'}</span>
              <div>
                <div className="text-sm font-medium text-foreground">{winner.address}</div>
                <div className="text-[10px] text-muted-foreground">
                  {winner.mode === 'lucky' ? '幸运红包' : '普通红包'} · {winner.time}
                </div>
              </div>
            </div>
            <div className="text-sm font-bold text-cny-gold">
              +{winner.amount} BNB
            </div>
          </div>
        ))}
      </div>

      {DEMO_WINNERS.length === 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          🧧 暂无中奖记录，参与红包即可查看
        </div>
      )}
    </motion.div>
  );
}
