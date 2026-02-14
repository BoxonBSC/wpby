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
  const [selectedTier, setSelectedTier] = useState(0);

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
            燃烧后获得1个红包名额 · 人人有奖
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

  // Lucky mode (C)
  const tiers = LUCKY_ROUND_CONFIG.tiers;
  const selected = tiers[selectedTier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="text-sm text-muted-foreground text-center mb-2">
        选择燃烧档位 · 燃烧越多抽奖券越多
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tiers.map((tier, index) => (
          <button
            key={index}
            onClick={() => setSelectedTier(index)}
            className={`p-3 rounded-xl text-center transition-all ${
              selectedTier === index
                ? 'bg-primary/20 border-2 border-cny-gold shadow-lg'
                : 'bg-card border border-border hover:border-primary/30'
            }`}
          >
            <div className="text-lg">{tier.label.split(' ')[0]}</div>
            <div className="text-xs font-bold text-foreground mt-1">
              {tier.minBurn.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground">代币</div>
            <div className={`text-xs font-bold mt-1 ${
              selectedTier === index ? 'text-cny-gold' : 'text-muted-foreground'
            }`}>
              {tier.tickets}张抽奖券
            </div>
          </button>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-cny-gold/5 border border-cny-gold/20 text-center text-sm">
        <span className="text-muted-foreground">本轮 </span>
        <span className="text-cny-gold font-bold">{LUCKY_ROUND_CONFIG.winnersCount} 位幸运赢家</span>
        <span className="text-muted-foreground"> · VRF随机抽取</span>
      </div>

      <button
        onClick={() => onBurn(selected.minBurn)}
        disabled={!isConnected || isLoading}
        className="w-full cny-button text-foreground text-lg"
      >
        {!isConnected
          ? '🔗 连接钱包后参与'
          : isLoading
            ? '⏳ 处理中...'
            : `🔥 燃烧 ${selected.minBurn.toLocaleString()} 代币 · 获得 ${selected.tickets} 张券`
        }
      </button>
    </motion.div>
  );
}
