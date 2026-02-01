import { motion } from 'framer-motion';
import { 
  REWARD_TIERS, 
  calculateHiLoReward, 
  BetTier,
  ZONE_COLORS,
  RewardZone,
} from '@/config/hilo';
import { Trophy, Target, TrendingUp, Crown, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HorizontalRewardTiersProps {
  currentStreak: number;
  prizePool: number;
  currentBetTier: BetTier;
}

export function HorizontalRewardTiers({ currentStreak, prizePool, currentBetTier }: HorizontalRewardTiersProps) {
  const { t } = useLanguage();
  const currentReward = calculateHiLoReward(currentStreak, currentBetTier.maxStreak, prizePool);
  const currentTier = REWARD_TIERS.find(t => t.streak === currentStreak);
  const nextTier = REWARD_TIERS.find(t => t.streak === currentStreak + 1);
  const maxTier = REWARD_TIERS.find(t => t.streak === currentBetTier.maxStreak);
  const maxReward = calculateHiLoReward(currentBetTier.maxStreak, currentBetTier.maxStreak, prizePool);

  // 按区域分组 (12连胜版本)
  const zones: { key: RewardZone; label: string; streaks: string; icon: React.ReactNode }[] = [
    { key: 'common', label: t('hreward.entryZone'), streaks: '1-3连胜', icon: null },
    { key: 'advanced', label: t('hreward.advancedZone'), streaks: '4-6连胜', icon: <TrendingUp className="w-5 h-5" /> },
    { key: 'elite', label: t('hreward.eliteZone'), streaks: '7-9连胜', icon: <Sparkles className="w-5 h-5" /> },
    { key: 'legendary', label: t('hreward.legendZone'), streaks: '10-12连胜', icon: <Crown className="w-5 h-5" /> },
  ];

  const getZoneForStreak = (streak: number): RewardZone => {
    if (streak <= 3) return 'common';
    if (streak <= 6) return 'advanced';
    if (streak <= 9) return 'elite';
    return 'legendary';
  };

  const currentZone = currentStreak > 0 ? getZoneForStreak(currentStreak) : null;

  return (
    <div 
      className="rounded-2xl p-4 sm:p-6 lg:p-8 w-full"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.3)',
      }}
    >
      {/* 标题 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#C9A347] flex items-center gap-2 sm:gap-3" style={{ fontFamily: '"Cinzel", serif' }}>
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#FFD700]" />
          {t('hreward.title')}
        </h3>
        <div className="text-xs sm:text-sm lg:text-base text-[#C9A347]/60">
          {t('hreward.currentLevel')} <span className="text-[#FFD700] font-bold text-sm sm:text-lg lg:text-xl">{currentBetTier.name}</span> {t('hreward.maxStreakLabel').replace('{n}', currentBetTier.maxStreak.toString())}
        </div>
      </div>

      {/* 当前状态大卡片 */}
      <div 
        className="rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
        }}
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8">
          {/* 当前连胜 */}
          <div className="text-center">
            <div className="text-[10px] sm:text-xs lg:text-base text-[#C9A347]/70 mb-1 sm:mb-2 lg:mb-3">{t('hreward.currentStreak')}</div>
            <motion.div 
              className="text-2xl sm:text-4xl lg:text-6xl font-bold text-[#FFD700]"
              key={currentStreak}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              style={{ fontFamily: '"Cinzel", serif', textShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}
            >
              {currentStreak}
            </motion.div>
            <div className="text-[9px] sm:text-xs lg:text-sm text-[#C9A347]/50 mt-1">{t('hreward.streakCount')}</div>
          </div>

          {/* 当前可获得奖励 */}
          <div className="text-center border-x border-[#C9A347]/20 px-1 sm:px-4 lg:px-8">
            <div className="text-[10px] sm:text-xs lg:text-base text-[#C9A347]/70 mb-1 sm:mb-2 lg:mb-3">{t('hreward.currentReward')}</div>
            <motion.div 
              className="text-xl sm:text-3xl lg:text-5xl font-bold text-[#FFD700]"
              key={currentReward}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              {currentTier?.percentage ?? 0}%
            </motion.div>
            <div className="text-[10px] sm:text-sm lg:text-lg text-[#C9A347]/80 mt-1 sm:mt-2">
              ≈ <span className="text-[#FFD700] font-semibold">{currentReward.toFixed(4)}</span> BNB
            </div>
          </div>

          {/* 下一目标 */}
          <div className="text-center">
            <div className="text-[10px] sm:text-xs lg:text-base text-[#C9A347]/70 mb-1 sm:mb-2 lg:mb-3">{t('hreward.nextTarget')}</div>
            {nextTier && nextTier.streak <= currentBetTier.maxStreak ? (
              <>
                <div className="text-xl sm:text-3xl lg:text-5xl font-bold text-[#C9A347]" style={{ fontFamily: '"Cinzel", serif' }}>
                  {nextTier.percentage}%
                </div>
                <div className="text-[9px] sm:text-xs lg:text-sm text-[#C9A347]/60 mt-1 sm:mt-2">
                  {t('hreward.winMore').replace('{n}', nextTier.streak.toString())}
                </div>
              </>
            ) : (
              <>
                <div className="text-base sm:text-2xl lg:text-3xl font-bold text-[#FFD700]" style={{ fontFamily: '"Cinzel", serif' }}>
                  {t('hreward.reachedMax')}
                </div>
                <div className="text-[9px] sm:text-xs lg:text-sm text-[#C9A347]/60 mt-1 sm:mt-2">
                  {t('hreward.upgradeUnlock')}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 四个区域卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-5">
        {zones.map((zone) => {
          const colors = ZONE_COLORS[zone.key];
          const zoneStart = zone.key === 'common' ? 1 : zone.key === 'advanced' ? 4 : zone.key === 'elite' ? 7 : 10;
          const zoneEnd = zone.key === 'common' ? 3 : zone.key === 'advanced' ? 6 : zone.key === 'elite' ? 9 : 12;
          const zoneTiers = REWARD_TIERS.filter(t => t.streak >= zoneStart && t.streak <= zoneEnd);
          const isCurrentZone = currentZone === zone.key;
          const isZoneUnlocked = zoneStart <= currentBetTier.maxStreak;
          const isZoneCompleted = currentStreak >= zoneEnd;
          const minReward = calculateHiLoReward(zoneStart, 12, prizePool);
          const maxZoneReward = calculateHiLoReward(zoneEnd, 12, prizePool);

          return (
            <motion.div
              key={zone.key}
              className={`rounded-xl p-2 sm:p-3 lg:p-5 transition-all ${!isZoneUnlocked ? 'opacity-40' : ''}`}
              style={{
                background: isCurrentZone 
                  ? colors.bg 
                  : 'rgba(0, 0, 0, 0.3)',
                border: `2px solid ${isCurrentZone ? colors.border : 'rgba(201, 163, 71, 0.15)'}`,
                boxShadow: isCurrentZone ? `0 0 25px ${colors.border}40` : 'none',
              }}
              whileHover={isZoneUnlocked ? { scale: 1.02 } : {}}
            >
              {/* 区域标题 */}
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                <div 
                  className="flex items-center gap-1 sm:gap-2 font-bold text-xs sm:text-sm lg:text-xl"
                  style={{ color: colors.text }}
                >
                  {zone.icon && <span className="hidden sm:inline">{zone.icon}</span>}
                  {zone.label}
                </div>
                {isZoneCompleted && (
                  <span className="text-green-400 text-sm sm:text-base lg:text-lg">✓</span>
                )}
              </div>

              {/* 连胜范围 */}
              <div className="text-[10px] sm:text-xs lg:text-base text-[#C9A347]/60 mb-1 sm:mb-2 lg:mb-3">
                {zone.streaks}
              </div>

              {/* 奖励范围 */}
              <div 
                className="text-xs sm:text-sm lg:text-lg font-semibold mb-1 sm:mb-2"
                style={{ color: colors.text }}
              >
                {zoneTiers[0]?.percentage}% ~ {zoneTiers[zoneTiers.length - 1]?.percentage}%
              </div>

              {/* BNB范围 */}
              <div className="text-[9px] sm:text-xs lg:text-sm text-[#C9A347]/50">
                {minReward.toFixed(3)} ~ {maxZoneReward.toFixed(3)} BNB
              </div>

              {/* 该区域的5个等级 - 在移动端隐藏 */}
              <div className="hidden sm:flex justify-between mt-3 sm:mt-4 lg:mt-5 pt-2 sm:pt-3 lg:pt-4 border-t border-[#C9A347]/10">
                {zoneTiers.map((tier) => {
                  const isActive = currentStreak >= tier.streak;
                  const isCurrent = currentStreak === tier.streak;
                  const isUnlocked = tier.streak <= currentBetTier.maxStreak;

                  return (
                    <div key={tier.streak} className="flex flex-col items-center">
                      <motion.div
                        className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-[10px] sm:text-xs lg:text-base font-bold transition-all
                          ${!isUnlocked ? 'opacity-30' : ''}`}
                        style={{
                          background: isActive ? colors.border : 'rgba(201, 163, 71, 0.15)',
                          color: isActive ? '#000' : colors.text,
                          boxShadow: isCurrent ? `0 0 15px ${colors.border}` : 'none',
                        }}
                        animate={isCurrent ? {
                          boxShadow: [`0 0 8px ${colors.border}`, `0 0 20px ${colors.border}`, `0 0 8px ${colors.border}`]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {tier.streak}
                      </motion.div>
                      <div 
                        className="text-[10px] sm:text-xs lg:text-base mt-1 sm:mt-2 font-medium"
                        style={{ color: isActive ? '#FFD700' : 'rgba(255, 215, 0, 0.35)' }}
                      >
                        {tier.percentage}%
                      </div>
                      {tier.milestone && (
                        <div className="text-[10px] sm:text-xs lg:text-sm mt-1" style={{ color: colors.text }}>
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
        className="mt-4 sm:mt-5 lg:mt-6 p-3 sm:p-4 lg:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 0, 128, 0.08) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#FFD700]" />
          <span className="text-xs sm:text-sm lg:text-lg text-[#C9A347]">
            {t('hreward.yourMaxTarget').replace('{tier}', currentBetTier.name)}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
          <span className="text-sm sm:text-lg lg:text-2xl font-bold text-[#FFD700]" style={{ fontFamily: '"Cinzel", serif' }}>
            {t('hreward.nStreakEquals').replace('{n}', currentBetTier.maxStreak.toString()).replace('{percent}', (maxTier?.percentage ?? 0).toString())}
          </span>
          <span className="text-xs sm:text-sm lg:text-lg text-[#C9A347]/80">
            ≈ {maxReward.toFixed(4)} BNB
          </span>
        </div>
      </div>

      {/* 详细奖励说明 - 12连胜版本 */}
      <div 
        className="mt-4 sm:mt-5 lg:mt-6 p-3 sm:p-4 lg:p-5 rounded-xl"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(201, 163, 71, 0.15)',
        }}
      >
        <div className="text-xs sm:text-sm lg:text-base text-[#C9A347] font-semibold mb-2 sm:mb-3">
          {t('hreward.percentDetail')}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-[10px] sm:text-xs lg:text-sm">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-[#C9A347]/70">{t('hreward.entryZone')} (1-3连胜)</div>
            <div className="text-[#FFD700]">1连胜 → 0.2%</div>
            <div className="text-[#FFD700]">2连胜 → 0.4%</div>
            <div className="text-[#FFD700]">3连胜 → 0.8%</div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-[#C9A347]/70">{t('hreward.advancedZone')} (4-6连胜)</div>
            <div className="text-[#FFD700]">4连胜 → 1.5%</div>
            <div className="text-[#FFD700]">5连胜 → 3%</div>
            <div className="text-[#FFD700]">6连胜 → 5%</div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-[#C9A347]/70">{t('hreward.eliteZone')} (7-9连胜)</div>
            <div className="text-[#FFD700]">7连胜 → 10%</div>
            <div className="text-[#FFD700]">8连胜 → 18%</div>
            <div className="text-[#FFD700]">9连胜 → 30%</div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-[#C9A347]/70">{t('hreward.legendZone')} (10-12连胜)</div>
            <div className="text-[#FFD700]">10连胜 → 50%</div>
            <div className="text-[#FFD700]">11连胜 → 70%</div>
            <div className="text-[#FFD700]">12连胜 → 100% 👑</div>
          </div>
        </div>
        <div className="mt-2 sm:mt-3 lg:mt-4 pt-2 sm:pt-3 lg:pt-4 border-t border-[#C9A347]/15 text-[10px] sm:text-xs lg:text-sm text-[#C9A347]/60">
          <strong className="text-[#FFD700]">示例：奖池10 BNB，12连胜清空奖池 = 10 BNB（扣除5%服务费后实际到手9.5 BNB）</strong>
        </div>
      </div>

      {/* 规则提示 */}
      <div className="mt-3 sm:mt-4 lg:mt-5 text-center text-[10px] sm:text-xs lg:text-base text-[#C9A347]/50 space-y-1 sm:space-y-2">
        <div dangerouslySetInnerHTML={{ __html: t('hreward.ruleNote') }} />
        <div>{t('hreward.cashoutTip')}</div>
      </div>
    </div>
  );
}
