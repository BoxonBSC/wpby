import { motion } from 'framer-motion';
import { CHEST_TIERS, ChestTier } from '@/config/chest';
import { Gem, Crown, Star, Sparkles } from 'lucide-react';

interface ChestSelectorProps {
  selectedTier: ChestTier;
  onSelectTier: (tier: ChestTier) => void;
  credits: number;
  disabled?: boolean;
}

const tierIcons: Record<string, React.ReactNode> = {
  bronze: <Star className="w-5 h-5" />,
  silver: <Sparkles className="w-5 h-5" />,
  gold: <Crown className="w-5 h-5" />,
  diamond: <Gem className="w-5 h-5" />,
};

export function ChestSelector({ selectedTier, onSelectTier, credits, disabled }: ChestSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-[#C9A347] font-bold text-lg mb-1">选择宝箱</h3>
        <p className="text-[#C9A347]/50 text-sm">等级越高，大奖概率越高</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CHEST_TIERS.map((tier) => {
          const isSelected = selectedTier.id === tier.id;
          const canAfford = credits >= tier.cost;
          const isDisabled = disabled || !canAfford;

          return (
            <motion.button
              key={tier.id}
              onClick={() => !isDisabled && onSelectTier(tier)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${isSelected 
                  ? 'border-[#C9A347] bg-[#C9A347]/10' 
                  : 'border-[#C9A347]/20 bg-black/30 hover:border-[#C9A347]/40'
                }
                ${isDisabled && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{
                boxShadow: isSelected ? `0 0 20px ${tier.color}40` : 'none',
              }}
            >
              {/* 选中指示器 */}
              {isSelected && (
                <motion.div
                  layoutId="chest-selector"
                  className="absolute inset-0 rounded-xl border-2 border-[#C9A347]"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* 宝箱图标 */}
              <div 
                className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${tier.color}40 0%, ${tier.metalColor}40 100%)`,
                  border: `2px solid ${tier.color}`,
                }}
              >
                <span style={{ color: tier.color }}>{tierIcons[tier.id]}</span>
              </div>

              {/* 宝箱名称 */}
              <h4 
                className="font-bold text-sm mb-1"
                style={{ color: tier.color }}
              >
                {tier.name}
              </h4>

              {/* 描述 */}
              <p className="text-[#C9A347]/50 text-xs mb-2">
                {tier.description}
              </p>

              {/* 价格 */}
              <div className={`text-sm font-bold ${canAfford ? 'text-[#C9A347]' : 'text-red-400'}`}>
                {tier.cost.toLocaleString()} 凭证
              </div>

              {/* 中奖率预览 */}
              <div className="mt-2 pt-2 border-t border-[#C9A347]/10">
                <div className="text-[10px] text-[#C9A347]/40">
                  中奖率: {(100 - (tier.rewards.find(r => r.type === 'no_win')?.probability || 100)).toFixed(1)}%
                </div>
              </div>

              {/* 不可用提示 */}
              {!canAfford && (
                <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center">
                  <span className="text-red-400 text-xs font-bold">凭证不足</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* 当前凭证余额 */}
      <div className="text-center pt-4 border-t border-[#C9A347]/10">
        <span className="text-[#C9A347]/50 text-sm">当前凭证: </span>
        <span className="text-[#C9A347] font-bold">{credits.toLocaleString()}</span>
      </div>
    </div>
  );
}
