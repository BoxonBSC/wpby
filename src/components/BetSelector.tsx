import { motion } from 'framer-motion';
import { Ticket, Minus, Plus, TrendingUp } from 'lucide-react';

// 最低20000凭证起投
const BET_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

// 投注对应的概率加成倍数
const BET_MULTIPLIERS: Record<number, number> = {
  20000: 1,
  50000: 2.5,
  100000: 5,
  200000: 10,
  500000: 20,
};

interface BetSelectorProps {
  currentBet: number;
  onBetChange: (bet: number) => void;
  disabled?: boolean;
  playClickSound?: () => void;
}

export function BetSelector({ 
  currentBet, 
  onBetChange, 
  disabled = false,
  playClickSound 
}: BetSelectorProps) {
  const currentIndex = BET_AMOUNTS.indexOf(currentBet);
  
  const handleDecrease = () => {
    if (currentIndex > 0) {
      playClickSound?.();
      onBetChange(BET_AMOUNTS[currentIndex - 1]);
    }
  };
  
  const handleIncrease = () => {
    if (currentIndex < BET_AMOUNTS.length - 1) {
      playClickSound?.();
      onBetChange(BET_AMOUNTS[currentIndex + 1]);
    }
  };
  
  const handlePresetClick = (bet: number) => {
    playClickSound?.();
    onBetChange(bet);
  };

  // 使用完整数字显示，不用K/M缩写
  const formatBet = (amount: number) => {
    return amount.toLocaleString();
  };

  const currentMultiplier = BET_MULTIPLIERS[currentBet] || 1;

  return (
    <div className="space-y-3">
      {/* 概率加成显示 */}
      <motion.div
        key={currentMultiplier}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center justify-center gap-2"
      >
        <div className={`
          px-4 py-2 rounded-xl flex items-center gap-2
          ${currentMultiplier >= 10 
            ? 'bg-gradient-to-r from-neon-yellow/20 to-neon-orange/20 border border-neon-yellow/50' 
            : currentMultiplier >= 5
            ? 'bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/50'
            : currentMultiplier > 1
            ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 border border-neon-cyan/50'
            : 'bg-muted/30 border border-border/50'
          }
        `}>
          <TrendingUp className={`w-4 h-4 ${
            currentMultiplier >= 10 ? 'text-neon-yellow' : 
            currentMultiplier >= 5 ? 'text-neon-purple' : 
            currentMultiplier > 1 ? 'text-neon-cyan' : 
            'text-muted-foreground'
          }`} />
          <span className={`font-display text-lg ${
            currentMultiplier >= 10 ? 'text-neon-yellow' : 
            currentMultiplier >= 5 ? 'text-neon-purple' : 
            currentMultiplier > 1 ? 'text-neon-cyan' : 
            'text-foreground'
          }`}>
            {currentMultiplier}x
          </span>
          <span className="text-xs text-muted-foreground">中奖概率</span>
        </div>
        {currentMultiplier > 1 && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-neon-green"
          >
            ↑ 提升 {((currentMultiplier - 1) * 100).toFixed(0)}%
          </motion.span>
        )}
      </motion.div>

      {/* 主选择器 */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          onClick={handleDecrease}
          disabled={disabled || currentIndex === 0}
          whileHover={{ scale: disabled || currentIndex === 0 ? 1 : 1.1 }}
          whileTap={{ scale: disabled || currentIndex === 0 ? 1 : 0.9 }}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            border transition-all
            ${disabled || currentIndex === 0
              ? 'bg-muted/30 border-border/50 text-muted-foreground cursor-not-allowed'
              : 'bg-muted/50 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20 hover:border-neon-cyan'
            }
          `}
        >
          <Minus className="w-5 h-5" />
        </motion.button>
        
        <div className="neon-border-purple rounded-xl px-4 py-3 bg-muted/50 min-w-[160px] text-center">
          <div className="flex items-center justify-center gap-2">
            <Ticket className="w-5 h-5 text-neon-cyan" />
            <span className="text-xl font-display neon-text-purple">
              {formatBet(currentBet)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">凭证/次</span>
        </div>
        
        <motion.button
          onClick={handleIncrease}
          disabled={disabled || currentIndex === BET_AMOUNTS.length - 1}
          whileHover={{ scale: disabled || currentIndex === BET_AMOUNTS.length - 1 ? 1 : 1.1 }}
          whileTap={{ scale: disabled || currentIndex === BET_AMOUNTS.length - 1 ? 1 : 0.9 }}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            border transition-all
            ${disabled || currentIndex === BET_AMOUNTS.length - 1
              ? 'bg-muted/30 border-border/50 text-muted-foreground cursor-not-allowed'
              : 'bg-muted/50 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20 hover:border-neon-cyan'
            }
          `}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* 快捷选择按钮 */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {BET_AMOUNTS.map((bet) => (
          <motion.button
            key={bet}
            onClick={() => handlePresetClick(bet)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-display transition-all
              ${currentBet === bet
                ? 'bg-neon-purple/30 border border-neon-purple text-neon-purple shadow-[0_0_10px_hsl(280_100%_50%/0.3)]'
                : disabled
                  ? 'bg-muted/30 text-muted-foreground cursor-not-allowed'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/50'
              }
            `}
          >
            {formatBet(bet)}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export { BET_AMOUNTS, BET_MULTIPLIERS };
