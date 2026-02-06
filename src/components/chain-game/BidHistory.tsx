import { motion } from 'framer-motion';
import { Timer, TrendingUp } from 'lucide-react';

interface BidRecord {
  address: string;
  bid: string;
  time: string;
}

interface BidHistoryProps {
  bidHistory: BidRecord[];
}

const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export function BidHistory({ bidHistory }: BidHistoryProps) {
  if (bidHistory.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">出价记录</span>
        </div>
        <div className="text-center py-8 text-neutral-600 text-sm">
          暂无出价记录
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">出价记录</span>
        </div>
        <span className="text-xs text-neutral-600">{bidHistory.length} 条</span>
      </div>

      <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {bidHistory.map((record, index) => {
          const isLatest = index === 0;
          const orderNum = bidHistory.length - index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                isLatest
                  ? 'bg-violet-500/[0.08] border border-violet-500/20'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                isLatest
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'bg-white/[0.04] text-neutral-600'
              }`}>
                #{orderNum}
              </div>

              <div className="flex-1 min-w-0">
                <span className={`font-mono text-xs ${isLatest ? 'text-white' : 'text-neutral-500'}`}>
                  {shortenAddress(record.address)}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Timer className="w-2.5 h-2.5 text-neutral-700" />
                  <span className="text-[10px] text-neutral-700">{record.time}</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`font-bold text-xs ${isLatest ? 'text-violet-400' : 'text-neutral-500'}`}>
                  {Number(record.bid).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <div className="text-[10px] text-neutral-700">代币</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
