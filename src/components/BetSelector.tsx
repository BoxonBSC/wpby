import { motion } from 'framer-motion';
import { Coins, Minus, Plus } from 'lucide-react';

const BET_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

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

  const formatBet = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  return (
    <div className="space-y-3">
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
        
        <div className="neon-border-purple rounded-xl px-6 py-3 bg-muted/50 min-w-[140px] text-center">
          <div className="flex items-center justify-center gap-2">
            <Coins className="w-5 h-5 text-neon-yellow" />
            <span className="text-2xl font-display neon-text-purple">
              {formatBet(currentBet)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">代币/次</span>
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

export { BET_AMOUNTS };
