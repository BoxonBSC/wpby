import { motion } from 'framer-motion';
import { 
  REWARD_TIERS, 
  calculateHiLoReward, 
  BetTier,
  ZONE_COLORS,
  RewardZone,
} from '@/config/hilo';
import { Trophy, Target, TrendingUp, Crown, Sparkles, ChevronRight } from 'lucide-react';

interface HorizontalRewardTiersProps {
  currentStreak: number;
  prizePool: number;
  currentBetTier: BetTier;
}

export function HorizontalRewardTiers({ currentStreak, prizePool, currentBetTier }: HorizontalRewardTiersProps) {
  const currentReward = calculateHiLoReward(currentStreak, currentBetTier.maxStreak, prizePool);
  const currentTier = REWARD_TIERS.find(t => t.streak === currentStreak);
  const nextTier = REWARD_TIERS.find(t => t.streak === currentStreak + 1);
  const maxTier = REWARD_TIERS.find(t => t.streak === currentBetTier.maxStreak);
  const maxReward = calculateHiLoReward(currentBetTier.maxStreak, currentBetTier.maxStreak, prizePool);

  // 按区域分组
  const zones: { key: RewardZone; label: string; streaks: string; icon: React.ReactNode }[] = [
    { key: 'common', label: '入门区', streaks: '1-5连胜', icon: null },
    { key: 'advanced', label: '进阶区', streaks: '6-10连胜', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'elite', label: '精英区', streaks: '11-15连胜', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'legendary', label: '传奇区', streaks: '16-20连胜', icon: <Crown className="w-3.5 h-3.5" /> },
  ];

  const getZoneForStreak = (streak: number): RewardZone => {
    if (streak <= 5) return 'common';
    if (streak <= 10) return 'advanced';
    if (streak <= 15) return 'elite';
    return 'legendary';
  };

  const currentZone = currentStreak > 0 ? getZoneForStreak(currentStreak) : null;

  return (
    <div 
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.3)',
      }}
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#C9A347] flex items-center gap-2" style={{ fontFamily: '"Cinzel", serif' }}>
          <Trophy className="w-5 h-5 text-[#FFD700]" />
          奖励阶梯
        </h3>
        <div className="text-xs text-[#C9A347]/60">
          当前等级: <span className="text-[#FFD700] font-bold">{currentBetTier.name}</span> (最高{currentBetTier.maxStreak}连胜)
        </div>
      </div>

      {/* 当前状态大卡片 */}
      <div 
        className="rounded-xl p-4 mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
        }}
      >
        <div className="grid grid-cols-3 gap-4">
          {/* 当前连胜 */}
          <div className="text-center">
            <div className="text-xs text-[#C9A347]/70 mb-1">当前连胜</div>
            <motion.div 
              className="text-3xl font-bold text-[#FFD700]"
              key={currentStreak}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              style={{ fontFamily: '"Cinzel", serif', textShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}
            >
              {currentStreak}
            </motion.div>
            <div className="text-[10px] text-[#C9A347]/50">连胜次数</div>
          </div>

          {/* 当前可获得奖励 */}
          <div className="text-center border-x border-[#C9A347]/20 px-4">
            <div className="text-xs text-[#C9A347]/70 mb-1">当前奖励</div>
            <motion.div 
              className="text-2xl font-bold text-[#FFD700]"
              key={currentReward}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              {currentTier?.percentage ?? 0}%
            </motion.div>
            <div className="text-xs text-[#C9A347]/80">
              ≈ <span className="text-[#FFD700]">{currentReward.toFixed(4)}</span> BNB
            </div>
          </div>

          {/* 下一目标 */}
          <div className="text-center">
            <div className="text-xs text-[#C9A347]/70 mb-1">下一目标</div>
            {nextTier && nextTier.streak <= currentBetTier.maxStreak ? (
              <>
                <div className="text-2xl font-bold text-[#C9A347]" style={{ fontFamily: '"Cinzel", serif' }}>
                  {nextTier.percentage}%
                </div>
                <div className="text-[10px] text-[#C9A347]/60">
                  再赢{1}局 → {nextTier.streak}连胜
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-[#FFD700]" style={{ fontFamily: '"Cinzel", serif' }}>
                  🎉 已达上限
                </div>
                <div className="text-[10px] text-[#C9A347]/60">
                  升级门槛解锁更高
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 四个区域卡片 */}
      <div className="grid grid-cols-4 gap-3">
        {zones.map((zone) => {
          const colors = ZONE_COLORS[zone.key];
          const zoneStart = zone.key === 'common' ? 1 : zone.key === 'advanced' ? 6 : zone.key === 'elite' ? 11 : 16;
          const zoneEnd = zone.key === 'common' ? 5 : zone.key === 'advanced' ? 10 : zone.key === 'elite' ? 15 : 20;
          const zoneTiers = REWARD_TIERS.filter(t => t.streak >= zoneStart && t.streak <= zoneEnd);
          const isCurrentZone = currentZone === zone.key;
          const isZoneUnlocked = zoneStart <= currentBetTier.maxStreak;
          const isZoneCompleted = currentStreak >= zoneEnd;
          const minReward = calculateHiLoReward(zoneStart, 20, prizePool);
          const maxZoneReward = calculateHiLoReward(zoneEnd, 20, prizePool);

          return (
            <motion.div
              key={zone.key}
              className={`rounded-xl p-3 transition-all ${!isZoneUnlocked ? 'opacity-40' : ''}`}
              style={{
                background: isCurrentZone 
                  ? colors.bg 
                  : 'rgba(0, 0, 0, 0.3)',
                border: `2px solid ${isCurrentZone ? colors.border : 'rgba(201, 163, 71, 0.15)'}`,
                boxShadow: isCurrentZone ? `0 0 20px ${colors.border}40` : 'none',
              }}
              whileHover={isZoneUnlocked ? { scale: 1.02 } : {}}
            >
              {/* 区域标题 */}
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="flex items-center gap-1.5 font-bold text-sm"
                  style={{ color: colors.text }}
                >
                  {zone.icon}
                  {zone.label}
                </div>
                {isZoneCompleted && (
                  <span className="text-green-400 text-xs">✓</span>
                )}
              </div>

              {/* 连胜范围 */}
              <div className="text-xs text-[#C9A347]/60 mb-2">
                {zone.streaks}
              </div>

              {/* 奖励范围 */}
              <div 
                className="text-xs font-medium mb-2"
                style={{ color: colors.text }}
              >
                {zoneTiers[0]?.percentage}% ~ {zoneTiers[zoneTiers.length - 1]?.percentage}%
              </div>

              {/* BNB范围 */}
              <div className="text-[10px] text-[#C9A347]/50">
                {minReward.toFixed(3)} ~ {maxZoneReward.toFixed(3)} BNB
              </div>

              {/* 该区域的5个等级小点 */}
              <div className="flex justify-between mt-3 pt-2 border-t border-[#C9A347]/10">
                {zoneTiers.map((tier) => {
                  const isActive = currentStreak >= tier.streak;
                  const isCurrent = currentStreak === tier.streak;
                  const isUnlocked = tier.streak <= currentBetTier.maxStreak;

                  return (
                    <div key={tier.streak} className="flex flex-col items-center">
                      <motion.div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all
                          ${!isUnlocked ? 'opacity-30' : ''}`}
                        style={{
                          background: isActive ? colors.border : 'rgba(201, 163, 71, 0.15)',
                          color: isActive ? '#000' : colors.text,
                          boxShadow: isCurrent ? `0 0 10px ${colors.border}` : 'none',
                        }}
                        animate={isCurrent ? {
                          boxShadow: [`0 0 5px ${colors.border}`, `0 0 15px ${colors.border}`, `0 0 5px ${colors.border}`]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {tier.streak}
                      </motion.div>
                      <div 
                        className="text-[8px] mt-0.5"
                        style={{ color: isActive ? '#FFD700' : 'rgba(255, 215, 0, 0.3)' }}
                      >
                        {tier.percentage}%
                      </div>
                      {tier.milestone && (
                        <div className="text-[8px] mt-0.5" style={{ color: colors.text }}>
                          {tier.milestone.emoji}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 最高奖励提示 */}
      <div 
        className="mt-4 p-3 rounded-xl flex items-center justify-between"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 0, 128, 0.08) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
        }}
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#FFD700]" />
          <span className="text-sm text-[#C9A347]">
            您的最高目标 ({currentBetTier.name}等级):
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-[#FFD700]" style={{ fontFamily: '"Cinzel", serif' }}>
            {currentBetTier.maxStreak}连胜 = {maxTier?.percentage}%
          </span>
          <span className="text-sm text-[#C9A347]/80">
            ≈ {maxReward.toFixed(4)} BNB
          </span>
        </div>
      </div>

      {/* 说明 */}
      <div className="mt-3 text-center text-[10px] text-[#C9A347]/50 space-y-1">
        <div>💡 <strong>规则说明</strong>: 每次猜对+1连胜，奖励随连胜数增加</div>
        <div>🎯 随时可点「收手」领取当前奖励 · 猜错则失去所有累积</div>
      </div>
    </div>
  );
}
