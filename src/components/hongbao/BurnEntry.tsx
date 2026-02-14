import { useState } from 'react';
import { motion } from 'framer-motion';
import { NORMAL_ROUND_CONFIG, LUCKY_ROUND_CONFIG, type RoundMode } from '@/config/contracts';

interface BurnEntryProps {
  mode: RoundMode;
  isConnected: boolean;
  onBurn: (amount: number) => void;
  isLoading: boolean;
}

export function BurnEntry({ mode, isConnected, onBurn, isLoading }: BurnEntryProps) {
  const [ticketCount, setTicketCount] = useState(1);

  if (mode === 'normal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
          <div className="text-sm text-muted-foreground mb-2">固定燃烧参与</div>
          <div className="text-2xl font-bold text-cny-gold">
            🔥 {NORMAL_ROUND_CONFIG.fixedBurnAmount.toLocaleString()} 代币
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            燃烧后获得1个红包名额 · 独奖1人
          </div>
        </div>

        <button
          onClick={() => onBurn(NORMAL_ROUND_CONFIG.fixedBurnAmount)}
          disabled={!isConnected || isLoading}
          className="w-full cny-button text-foreground text-lg"
        >
          {!isConnected ? '🔗 连接钱包后参与' : isLoading ? '⏳ 处理中...' : '🧧 燃烧参与抢红包'}
        </button>
      </motion.div>
    );
  }

  // Lucky mode — 金马红包
  const tokensPerTicket = LUCKY_ROUND_CONFIG.tokensPerTicket;
  const totalBurn = ticketCount * tokensPerTicket;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="p-5 rounded-xl bg-cny-gold/5 border border-cny-gold/20 text-center space-y-3">
        <div className="text-sm text-cny-cream/60">
          每 <span className="text-cny-gold font-bold">{tokensPerTicket.toLocaleString()}</span> 代币 = 1 张抽奖券
        </div>

        {/* Ticket selector */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
            className="w-10 h-10 rounded-lg bg-card border border-border text-lg font-bold text-foreground hover:bg-muted/50 transition-colors"
          >
            −
          </button>
          <div className="text-center min-w-[120px]">
            <div className="text-4xl font-bold text-cny-gold">{ticketCount}</div>
            <div className="text-xs text-cny-cream/50">张抽奖券</div>
          </div>
          <button
            onClick={() => setTicketCount(ticketCount + 1)}
            className="w-10 h-10 rounded-lg bg-card border border-border text-lg font-bold text-foreground hover:bg-muted/50 transition-colors"
          >
            +
          </button>
        </div>

        {/* Quick select */}
        <div className="flex gap-2 justify-center">
          {[1, 5, 10, 20].map((n) => (
            <button
              key={n}
              onClick={() => setTicketCount(n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                ticketCount === n
                  ? 'bg-cny-gold/20 border border-cny-gold/40 text-cny-gold'
                  : 'bg-card/50 border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {n}张
            </button>
          ))}
        </div>

        <div className="text-sm text-foreground">
          燃烧 <span className="text-cny-gold font-bold">{totalBurn.toLocaleString()}</span> 代币
        </div>
      </div>

      <div className="p-3 rounded-xl bg-cny-gold/5 border border-cny-gold/20 text-center text-sm">
        <span className="text-muted-foreground">本轮 </span>
        <span className="text-cny-gold font-bold">{LUCKY_ROUND_CONFIG.winnersCount} 位幸运赢家</span>
        <span className="text-muted-foreground"> · VRF按比例抽取</span>
      </div>

      <button
        onClick={() => onBurn(totalBurn)}
        disabled={!isConnected || isLoading}
        className="w-full cny-button text-foreground text-lg"
      >
        {!isConnected
          ? '🔗 连接钱包后参与'
          : isLoading
            ? '⏳ 处理中...'
            : `💰 燃烧 ${totalBurn.toLocaleString()} 代币 · ${ticketCount} 张券`
        }
      </button>
    </motion.div>
  );
}
