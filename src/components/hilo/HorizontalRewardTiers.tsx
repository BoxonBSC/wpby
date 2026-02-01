import { motion } from 'framer-motion';
import { 
  REWARD_TIERS, 
  calculateHiLoReward, 
  BetTier,
  ZONE_COLORS,
  RewardZone,
} from '@/config/hilo';
import { Trophy, Star, Crown, Sparkles, ChevronRight } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface HorizontalRewardTiersProps {
  currentStreak: number;
  prizePool: number;
  currentBetTier: BetTier;
}

export function HorizontalRewardTiers({ currentStreak, prizePool, currentBetTier }: HorizontalRewardTiersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  // 自动滚动到当前连胜
  useEffect(() => {
    if (currentStreak > 0 && currentRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = currentRef.current;
      const containerWidth = container.offsetWidth;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      
      container.scrollTo({
        left: elementLeft - containerWidth / 2 + elementWidth / 2,
        behavior: 'smooth'
      });
    }
  }, [currentStreak]);

  // 按区域分组
  const zones: RewardZone[] = ['common', 'advanced', 'elite', 'legendary'];
  const groupedTiers = REWARD_TIERS.reduce((acc, tier) => {
    if (!acc[tier.zone]) acc[tier.zone] = [];
    acc[tier.zone].push(tier);
    return acc;
  }, {} as Record<RewardZone, typeof REWARD_TIERS>);

  const currentReward = calculateHiLoReward(currentStreak, currentBetTier.maxStreak, prizePool);
  const currentTier = REWARD_TIERS.find(t => t.streak === currentStreak);
  const maxReward = calculateHiLoReward(currentBetTier.maxStreak, currentBetTier.maxStreak, prizePool);
  const maxTier = REWARD_TIERS.find(t => t.streak === currentBetTier.maxStreak);

  return (
    <div 
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
      }}
    >
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* 当前等级 */}
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: currentBetTier.color }}
            >
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: currentBetTier.color, fontFamily: '"Cinzel", serif' }}>
                {currentBetTier.name}等级
              </div>
              <div className="text-xs text-[#C9A347]/60">
                最高 {currentBetTier.maxStreak} 连胜
              </div>
            </div>
          </div>

          {/* 当前连胜 */}
          {currentStreak > 0 && (
            <div 
              className="px-4 py-2 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(201, 163, 71, 0.08) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.4)',
              }}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#FFD700]" />
                <span className="text-[#FFD700] font-bold">
                  连胜 {currentStreak}
                </span>
                <span className="text-[#C9A347]/60">|</span>
                <span className="text-[#FFD700]">
                  {currentTier?.percentage ?? 0}%
                </span>
                <span className="text-[#FFD700]/70 text-sm">
                  ≈{currentReward.toFixed(4)} BNB
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 最高奖励 */}
        <div 
          className="px-4 py-2 rounded-xl text-right"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
          }}
        >
          <div className="text-[10px] text-[#C9A347]/60">最高可赢</div>
          <div className="text-lg font-bold text-[#FFD700]" style={{ fontFamily: '"Cinzel", serif' }}>
            {maxTier?.percentage}% <span className="text-xs text-[#C9A347]/60">≈{maxReward.toFixed(4)} BNB</span>
          </div>
        </div>
      </div>

      {/* 横向奖励阶梯 */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto pb-2 hide-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex gap-2 min-w-max">
          {zones.map((zone, zoneIndex) => (
            <div key={zone} className="flex items-center gap-2">
              {/* 区域分隔 */}
              {zoneIndex > 0 && (
                <div className="flex items-center px-2">
                  <ChevronRight className="w-4 h-4 text-[#C9A347]/30" />
                </div>
              )}
              
              {/* 区域标签 */}
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
                style={{ 
                  background: ZONE_COLORS[zone].bg,
                  color: ZONE_COLORS[zone].text,
                  borderLeft: `2px solid ${ZONE_COLORS[zone].border}`,
                }}
              >
                {zone === 'legendary' && <Crown className="w-3 h-3" />}
                {zone === 'elite' && <Sparkles className="w-3 h-3" />}
                {zone === 'common' && '基础'}
                {zone === 'advanced' && '进阶'}
                {zone === 'elite' && '精英'}
                {zone === 'legendary' && '传奇'}
              </div>

              {/* 该区域的奖励项 */}
              {groupedTiers[zone]?.map((tier) => {
                const isUnlocked = tier.streak <= currentBetTier.maxStreak;
                const isActive = currentStreak >= tier.streak;
                const isCurrent = currentStreak === tier.streak;
                const reward = calculateHiLoReward(tier.streak, 20, prizePool);
                const colors = ZONE_COLORS[tier.zone];

                return (
                  <motion.div
                    key={tier.streak}
                    ref={isCurrent ? currentRef : null}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className={`
                      relative flex flex-col items-center p-2 rounded-xl min-w-[70px] transition-all cursor-default
                      ${isCurrent ? 'ring-2 ring-[#FFD700] ring-offset-1 ring-offset-black' : ''}
                      ${!isUnlocked ? 'opacity-40' : ''}
                    `}
                    style={{
                      background: isActive 
                        ? colors.bg
                        : 'rgba(0, 0, 0, 0.3)',
                      border: `1px solid ${isActive ? colors.border + '80' : 'rgba(201, 163, 71, 0.15)'}`,
                    }}
                  >
                    {/* 连胜数 */}
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm mb-1"
                      style={{
                        background: isActive ? colors.border : 'rgba(201, 163, 71, 0.2)',
                        color: isActive ? '#000' : colors.text,
                      }}
                    >
                      {tier.streak}
                    </div>

                    {/* 里程碑标签 */}
                    {tier.milestone && (
                      <div className="text-[10px] mb-0.5" style={{ color: colors.text }}>
                        {tier.milestone.emoji}
                      </div>
                    )}

                    {/* 百分比 */}
                    <div 
                      className="font-bold text-sm"
                      style={{ color: isActive ? '#FFD700' : 'rgba(255, 215, 0, 0.5)' }}
                    >
                      {tier.percentage}%
                    </div>

                    {/* 奖励金额 */}
                    <div 
                      className="text-[9px] whitespace-nowrap"
                      style={{ color: isActive ? '#FFD700' : 'rgba(255, 215, 0, 0.3)' }}
                    >
                      ≈{reward.toFixed(3)}
                    </div>

                    {/* 当前指示器 */}
                    {isCurrent && (
                      <motion.div
                        className="absolute -top-1 left-1/2 -translate-x-1/2"
                        initial={{ y: -5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                      >
                        <div 
                          className="w-0 h-0"
                          style={{
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: '6px solid #FFD700',
                          }}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-[#C9A347]/50">
        <span>💡 奖励为替换式（非累进）</span>
        <span>|</span>
        <span>← 左右滑动查看全部 →</span>
      </div>
    </div>
  );
}
