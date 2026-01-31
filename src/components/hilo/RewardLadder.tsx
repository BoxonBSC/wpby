import { motion } from 'framer-motion';
import { 
  REWARD_TIERS, 
  BET_TIERS, 
  calculateHiLoReward, 
  BetTier,
  ZONE_COLORS,
  ZONE_LABELS,
  RewardZone,
} from '@/config/hilo';
import { Trophy, Zap, Star, Lock, Crown, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface RewardLadderProps {
  currentStreak: number;
  prizePool: number;
  currentBetTier: BetTier;
}

// 区域分隔组件
function ZoneDivider({ zone }: { zone: RewardZone }) {
  const colors = ZONE_COLORS[zone];
  const label = ZONE_LABELS[zone];
  
  return (
    <div 
      className="flex items-center gap-2 py-2 px-3 my-1 rounded-lg"
      style={{ 
        background: typeof colors.bg === 'string' && colors.bg.includes('gradient') 
          ? colors.bg 
          : colors.bg,
        borderLeft: `3px solid ${colors.border}`,
      }}
    >
      {zone === 'legendary' && <Crown className="w-3 h-3" style={{ color: colors.text }} />}
      {zone === 'elite' && <Sparkles className="w-3 h-3" style={{ color: colors.text }} />}
      <span className="text-xs font-bold" style={{ color: colors.text }}>
        {label}
      </span>
    </div>
  );
}

export function RewardLadder({ currentStreak, prizePool, currentBetTier }: RewardLadderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentItemRef = useRef<HTMLDivElement>(null);

  // 自动滚动到当前连胜位置
  useEffect(() => {
    if (currentStreak > 0 && currentItemRef.current) {
      currentItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStreak]);

  // 按区域分组奖励
  const groupedTiers = REWARD_TIERS.reduce((acc, tier) => {
    if (!acc[tier.zone]) acc[tier.zone] = [];
    acc[tier.zone].push(tier);
    return acc;
  }, {} as Record<RewardZone, typeof REWARD_TIERS>);

  const zones: RewardZone[] = ['common', 'advanced', 'elite', 'legendary'];

  // 最高可能奖励
  const maxPossibleReward = calculateHiLoReward(currentBetTier.maxStreak, currentBetTier.maxStreak, prizePool);
  const maxTier = REWARD_TIERS.find(t => t.streak === currentBetTier.maxStreak);

  return (
    <div 
      className="rounded-2xl p-4 h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
      }}
    >
      {/* 当前门槛等级 */}
      <div 
        className="flex items-center justify-between p-3 rounded-xl mb-3"
        style={{
          background: `linear-gradient(90deg, ${currentBetTier.color}20 0%, transparent 100%)`,
          border: `1px solid ${currentBetTier.color}40`,
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: currentBetTier.color }}
          >
            <Trophy className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: currentBetTier.color }}>
              {currentBetTier.name}等级
            </div>
            <div className="text-xs text-[#C9A347]/60">
              最高 {currentBetTier.maxStreak} 连胜
            </div>
          </div>
        </div>
      </div>

      {/* 最高奖励预览 */}
      <div 
        className="p-3 rounded-xl mb-3 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
        }}
      >
        <div className="text-[10px] text-[#C9A347]/60 mb-1">最高可赢</div>
        <div className="text-lg font-bold text-[#FFD700]">
          {maxPossibleReward.toFixed(4)} BNB
        </div>
        <div className="text-[10px] text-[#C9A347]/40">
          {maxTier?.percentage}% 奖池 · {maxTier?.oddsDescription}
        </div>
      </div>

      {/* 奖励阶梯标题 */}
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-4 h-4 text-[#C9A347]" />
        <h3 className="text-[#C9A347] font-bold text-sm">奖励阶梯</h3>
      </div>

      {/* 可滚动奖励列表 */}
      <ScrollArea className="flex-1 pr-2" ref={scrollRef}>
        <div className="space-y-1">
          {zones.map(zone => (
            <div key={zone}>
              <ZoneDivider zone={zone} />
              {groupedTiers[zone]?.map((tier) => {
                const isUnlocked = tier.streak <= currentBetTier.maxStreak;
                const isActive = currentStreak >= tier.streak && isUnlocked;
                const isCurrent = currentStreak === tier.streak && isUnlocked;
                const reward = calculateHiLoReward(tier.streak, currentBetTier.maxStreak, prizePool);
                const colors = ZONE_COLORS[tier.zone];

                // 找到解锁此等级的门槛
                const requiredTier = BET_TIERS.find(bt => bt.maxStreak >= tier.streak);

                return (
                  <motion.div
                    key={tier.streak}
                    ref={isCurrent ? currentItemRef : null}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`
                      relative flex items-center justify-between p-2 rounded-lg transition-all
                      ${isCurrent ? 'ring-2 ring-[#FFD700] ring-offset-1 ring-offset-black' : ''}
                      ${!isUnlocked ? 'opacity-40' : ''}
                    `}
                    style={{
                      background: isActive 
                        ? typeof colors.bg === 'string' && colors.bg.includes('gradient')
                          ? colors.bg
                          : colors.bg
                        : 'rgba(0, 0, 0, 0.2)',
                      border: `1px solid ${isActive ? colors.border + '60' : 'rgba(201, 163, 71, 0.1)'}`,
                    }}
                  >
                    {/* 连胜数 */}
                    <div className="flex items-center gap-2">
                      <div 
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs
                        `}
                        style={{
                          background: isActive ? colors.border : 'rgba(201, 163, 71, 0.2)',
                          color: isActive ? '#000' : colors.text,
                        }}
                      >
                        {tier.streak}
                      </div>
                      <div>
                        <div 
                          className="text-xs font-bold"
                          style={{ color: isActive ? colors.text : 'rgba(201, 163, 71, 0.4)' }}
                        >
                          {tier.label}
                        </div>
                        <div 
                          className="text-[10px]"
                          style={{ color: isActive ? colors.text + '99' : 'rgba(201, 163, 71, 0.3)' }}
                        >
                          {tier.percentage}% · {tier.oddsDescription}
                        </div>
                      </div>
                    </div>

                    {/* 奖励金额 / 锁定提示 */}
                    <div className="text-right">
                      {isUnlocked ? (
                        <div 
                          className="font-bold text-sm"
                          style={{ color: isActive ? '#FFD700' : 'rgba(255, 215, 0, 0.3)' }}
                        >
                          {reward.toFixed(4)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[#C9A347]/40">
                          <Lock className="w-3 h-3" />
                          <span className="text-[10px]">{requiredTier?.name}</span>
                        </div>
                      )}
                    </div>

                    {/* 当前指示器 */}
                    {isCurrent && (
                      <motion.div
                        className="absolute -left-1 top-1/2 -translate-y-1/2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Zap className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* 当前奖励提示 */}
      {currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(201, 163, 71, 0.1) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.4)',
          }}
        >
          <div className="flex items-center justify-center gap-2 text-[#FFD700]">
            <Star className="w-4 h-4" />
            <span className="text-sm">当前可兑现</span>
          </div>
          <div className="text-xl font-bold text-[#FFD700]">
            {calculateHiLoReward(currentStreak, currentBetTier.maxStreak, prizePool).toFixed(4)} BNB
          </div>
        </motion.div>
      )}
    </div>
  );
}
