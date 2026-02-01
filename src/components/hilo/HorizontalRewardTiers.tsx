import { motion } from 'framer-motion';
import { 
  REWARD_TIERS, 
  calculateHiLoReward, 
  BetTier,
  ZONE_COLORS,
  RewardZone,
} from '@/config/hilo';
import { Trophy, Star, Crown, Sparkles } from 'lucide-react';

interface HorizontalRewardTiersProps {
  currentStreak: number;
  prizePool: number;
  currentBetTier: BetTier;
}

export function HorizontalRewardTiers({ currentStreak, prizePool, currentBetTier }: HorizontalRewardTiersProps) {
  const currentReward = calculateHiLoReward(currentStreak, currentBetTier.maxStreak, prizePool);
  const currentTier = REWARD_TIERS.find(t => t.streak === currentStreak);
  const maxReward = calculateHiLoReward(currentBetTier.maxStreak, currentBetTier.maxStreak, prizePool);
  const maxTier = REWARD_TIERS.find(t => t.streak === currentBetTier.maxStreak);

  // 按区域分组
  const zones: RewardZone[] = ['common', 'advanced', 'elite', 'legendary'];
  const groupedTiers = REWARD_TIERS.reduce((acc, tier) => {
    if (!acc[tier.zone]) acc[tier.zone] = [];
    acc[tier.zone].push(tier);
    return acc;
  }, {} as Record<RewardZone, typeof REWARD_TIERS>);

  const zoneLabels: Record<RewardZone, string> = {
    common: '基础',
    advanced: '进阶', 
    elite: '精英',
    legendary: '传奇',
  };

  const zoneIcons: Record<RewardZone, React.ReactNode> = {
    common: null,
    advanced: null,
    elite: <Sparkles className="w-3 h-3" />,
    legendary: <Crown className="w-3 h-3" />,
  };

  return (
    <div 
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
      }}
    >
      {/* 顶部信息栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-4">
          {/* 当前等级 */}
          <div className="flex items-center gap-2">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: currentBetTier.color }}
            >
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: currentBetTier.color, fontFamily: '"Cinzel", serif' }}>
                {currentBetTier.name}
              </div>
              <div className="text-[10px] text-[#C9A347]/60">
                最高{currentBetTier.maxStreak}连胜
              </div>
            </div>
          </div>

          {/* 当前连胜 */}
          {currentStreak > 0 && (
            <div 
              className="px-3 py-1.5 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(201, 163, 71, 0.08) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.4)',
              }}
            >
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-3.5 h-3.5 text-[#FFD700]" />
                <span className="text-[#FFD700] font-bold">
                  {currentStreak}连胜
                </span>
                <span className="text-[#C9A347]/60">|</span>
                <span className="text-[#FFD700]">
                  {currentTier?.percentage ?? 0}%
                </span>
                <span className="text-[#FFD700]/70 text-xs">
                  ≈{currentReward.toFixed(4)} BNB
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 最高奖励 */}
        <div 
          className="px-3 py-1.5 rounded-lg text-right"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
          }}
        >
          <div className="text-[10px] text-[#C9A347]/60">最高可赢</div>
          <div className="text-base font-bold text-[#FFD700]" style={{ fontFamily: '"Cinzel", serif' }}>
            {maxTier?.percentage}% <span className="text-[10px] text-[#C9A347]/60">≈{maxReward.toFixed(4)} BNB</span>
          </div>
        </div>
      </div>

      {/* 奖励网格 - 按区域分4行 */}
      <div className="space-y-2">
        {zones.map((zone) => {
          const colors = ZONE_COLORS[zone];
          const tiers = groupedTiers[zone] || [];
          
          return (
            <div key={zone} className="flex items-center gap-2">
              {/* 区域标签 */}
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold min-w-[52px] justify-center"
                style={{ 
                  background: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}40`,
                }}
              >
                {zoneIcons[zone]}
                {zoneLabels[zone]}
              </div>

              {/* 该区域的所有奖励项 */}
              <div className="flex-1 grid grid-cols-5 gap-1.5">
                {tiers.map((tier) => {
                  const isUnlocked = tier.streak <= currentBetTier.maxStreak;
                  const isActive = currentStreak >= tier.streak;
                  const isCurrent = currentStreak === tier.streak;
                  const reward = calculateHiLoReward(tier.streak, 20, prizePool);
                  const tierColors = ZONE_COLORS[tier.zone];

                  return (
                    <motion.div
                      key={tier.streak}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        boxShadow: isCurrent 
                          ? ['0 0 8px rgba(255, 215, 0, 0.4)', '0 0 20px rgba(255, 215, 0, 0.8)', '0 0 8px rgba(255, 215, 0, 0.4)']
                          : 'none'
                      }}
                      transition={{
                        boxShadow: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }
                      }}
                      whileHover={{ scale: 1.08, boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)' }}
                      className={`
                        relative flex flex-col items-center py-2 px-1.5 rounded-xl transition-all cursor-default
                        ${isCurrent ? 'ring-2 ring-[#FFD700] ring-offset-2 ring-offset-black z-10' : ''}
                        ${!isUnlocked ? 'opacity-30 grayscale' : ''}
                      `}
                      style={{
                        background: isActive 
                          ? `linear-gradient(135deg, ${tierColors.bg}, rgba(0,0,0,0.4))`
                          : 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${isActive ? tierColors.border + '80' : 'rgba(201, 163, 71, 0.15)'}`,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {/* 里程碑标签 */}
                      {tier.milestone && (
                        <div 
                          className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[8px] font-bold whitespace-nowrap"
                          style={{
                            background: `linear-gradient(135deg, ${tierColors.border}, ${tierColors.border}80)`,
                            color: '#000',
                            boxShadow: `0 2px 8px ${tierColors.border}60`,
                          }}
                        >
                          {tier.milestone.emoji} {tier.milestone.label}
                        </div>
                      )}

                      {/* 连胜数徽章 */}
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg"
                        style={{
                          background: isActive 
                            ? `linear-gradient(135deg, ${tierColors.border}, ${tierColors.border}90)`
                            : 'rgba(201, 163, 71, 0.15)',
                          color: isActive ? '#000' : tierColors.text,
                          border: `2px solid ${isActive ? tierColors.border : 'transparent'}`,
                        }}
                      >
                        {tier.streak}
                      </div>

                      {/* 百分比 */}
                      <div 
                        className="font-bold text-sm mt-1"
                        style={{ 
                          color: isActive ? '#FFD700' : 'rgba(255, 215, 0, 0.35)',
                          textShadow: isActive ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none',
                        }}
                      >
                        {tier.percentage}%
                      </div>

                      {/* 奖励金额 */}
                      <div 
                        className="text-[9px] font-medium"
                        style={{ color: isActive ? '#C9A347' : 'rgba(201, 163, 71, 0.3)' }}
                      >
                        ≈{reward.toFixed(3)}
                      </div>

                      {/* 当前选中发光指示器 */}
                      {isCurrent && (
                        <motion.div
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                          initial={{ scale: 0 }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: '#FFD700',
                              boxShadow: '0 0 8px #FFD700, 0 0 16px #FFD700',
                            }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 提示信息 */}
      <div className="mt-3 text-center text-[10px] text-[#C9A347]/50">
        💡 奖励为替换式（非累进）· 达到更高连胜将替换之前的奖励等级
      </div>
    </div>
  );
}
