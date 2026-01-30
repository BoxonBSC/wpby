import { motion } from 'framer-motion';
import { Ticket, Minus, Plus, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// 与合约 CyberSlots.sol 保持一致的投注档位
// betLevel1-5: 10K, 25K, 50K, 100K, 250K 代币
const BET_AMOUNTS = [10000, 25000, 50000, 100000, 250000];

// 投注对应的概率加成倍数 (与合约 getBetMultiplier 一致)
// 合约返回: 100, 250, 500, 1000, 2000 (即 1x, 2.5x, 5x, 10x, 20x)
const BET_MULTIPLIERS: Record<number, number> = {
  10000: 1,
  25000: 2.5,
  50000: 5,
  100000: 10,
  250000: 20,
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
  const { t } = useLanguage();
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

  // 手机端用简短格式 K，桌面端完整数字
  const formatBet = (amount: number, short = false) => {
    if (short && amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  const currentMultiplier = BET_MULTIPLIERS[currentBet] || 1;

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* 概率加成显示 */}
      <motion.div
        key={currentMultiplier}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center justify-center gap-1.5 sm:gap-2"
      >
        <div className={`
          px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2
          ${currentMultiplier >= 10 
            ? 'bg-gradient-to-r from-neon-yellow/20 to-neon-orange/20 border border-neon-yellow/50' 
            : currentMultiplier >= 5
            ? 'bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/50'
            : currentMultiplier > 1
            ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 border border-neon-cyan/50'
            : 'bg-muted/30 border border-border/50'
          }
        `}>
          <TrendingUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
            currentMultiplier >= 10 ? 'text-neon-yellow' : 
            currentMultiplier >= 5 ? 'text-neon-purple' : 
            currentMultiplier > 1 ? 'text-neon-cyan' : 
            'text-muted-foreground'
          }`} />
          <span className={`font-display text-base sm:text-lg ${
            currentMultiplier >= 10 ? 'text-neon-yellow' : 
            currentMultiplier >= 5 ? 'text-neon-purple' : 
            currentMultiplier > 1 ? 'text-neon-cyan' : 
            'text-foreground'
          }`}>
            {currentMultiplier}x
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">{t('bet.probability')}</span>
        </div>
        {currentMultiplier > 1 && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] sm:text-xs text-neon-green"
          >
            ↑ {((currentMultiplier - 1) * 100).toFixed(0)}%
          </motion.span>
        )}
      </motion.div>

      {/* 快捷选择按钮 - 手机端更大更易点击 */}
      <div className="grid grid-cols-5 gap-1.5 sm:flex sm:items-center sm:justify-center sm:gap-2 sm:flex-wrap">
        {BET_AMOUNTS.map((bet) => {
          const multiplier = BET_MULTIPLIERS[bet];
          const isSelected = currentBet === bet;
          
          return (
            <motion.button
              key={bet}
              onClick={() => handlePresetClick(bet)}
              disabled={disabled}
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              className={`
                py-2.5 sm:py-2 px-1 sm:px-3 rounded-lg text-xs font-display transition-all
                flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5
                min-h-[52px] sm:min-h-0
                ${isSelected
                  ? 'bg-neon-purple/30 border-2 border-neon-purple text-neon-purple shadow-[0_0_15px_hsl(280_100%_50%/0.4)]'
                  : disabled
                    ? 'bg-muted/30 text-muted-foreground cursor-not-allowed border border-border/30'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/50 active:bg-neon-purple/20'
                }
              `}
            >
              <span className="text-[11px] sm:text-xs font-bold">{formatBet(bet, true)}</span>
              <span className={`
                text-[9px] sm:text-[10px] 
                ${isSelected 
                  ? multiplier >= 10 ? 'text-neon-yellow' : multiplier >= 5 ? 'text-neon-pink' : 'text-neon-cyan'
                  : 'text-muted-foreground/70'
                }
              `}>
                {multiplier}x
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* 当前选择提示 - 手机端显示 */}
      <div className="sm:hidden text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50">
          <Ticket className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="text-sm font-display text-neon-purple">
            {formatBet(currentBet)}
          </span>
          <span className="text-[10px] text-muted-foreground">{t('bet.perSpin')}</span>
        </div>
      </div>

      {/* 桌面端主选择器 - 加减按钮 */}
      <div className="hidden sm:flex items-center justify-center gap-3">
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
          <span className="text-xs text-muted-foreground">{t('bet.perSpin')}</span>
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
    </div>
  );
}

export { BET_AMOUNTS, BET_MULTIPLIERS };
