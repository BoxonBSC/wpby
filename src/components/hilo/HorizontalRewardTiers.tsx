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

  // 按区域分组
  const zones: { key: RewardZone; label: string; streaks: string; icon: React.ReactNode }[] = [
    { key: 'common', label: t('hreward.entryZone'), streaks: t('hreward.streakRange1'), icon: null },
    { key: 'advanced', label: t('hreward.advancedZone'), streaks: t('hreward.streakRange2'), icon: <TrendingUp className="w-5 h-5" /> },
    { key: 'elite', label: t('hreward.eliteZone'), streaks: t('hreward.streakRange3'), icon: <Sparkles className="w-5 h-5" /> },
    { key: 'legendary', label: t('hreward.legendZone'), streaks: t('hreward.streakRange4'), icon: <Crown className="w-5 h-5" /> },
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
      className="rounded-2xl p-8 w-full"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.3)',
      }}
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#C9A347] flex items-center gap-3" style={{ fontFamily: '"Cinzel", serif' }}>
          <Trophy className="w-7 h-7 text-[#FFD700]" />
          {t('hreward.title')}
        </h3>
        <div className="text-base text-[#C9A347]/60">
          {t('hreward.currentLevel')} <span className="text-[#FFD700] font-bold text-xl">{currentBetTier.name}</span> {t('hreward.maxStreakLabel').replace('{n}', currentBetTier.maxStreak.toString())}
        </div>
      </div>

      {/* 当前状态大卡片 */}
      <div 
        className="rounded-xl p-6 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
        }}
      >
        <div className="grid grid-cols-3 gap-8">
          {/* 当前连胜 */}
          <div className="text-center">
            <div className="text-base text-[#C9A347]/70 mb-3">{t('hreward.currentStreak')}</div>
            <motion.div 
              className="text-6xl font-bold text-[#FFD700]"
              key={currentStreak}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              style={{ fontFamily: '"Cinzel", serif', textShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}
            >
              {currentStreak}
            </motion.div>
            <div className="text-sm text-[#C9A347]/50 mt-2">{t('hreward.streakCount')}</div>
          </div>

          {/* 当前可获得奖励 */}
          <div className="text-center border-x border-[#C9A347]/20 px-8">
            <div className="text-base text-[#C9A347]/70 mb-3">{t('hreward.currentReward')}</div>
            <motion.div 
              className="text-5xl font-bold text-[#FFD700]"
              key={currentReward}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              {currentTier?.percentage ?? 0}%
            </motion.div>
            <div className="text-lg text-[#C9A347]/80 mt-2">
              ≈ <span className="text-[#FFD700] font-semibold">{currentReward.toFixed(4)}</span> BNB
            </div>
          </div>

          {/* 下一目标 */}
          <div className="text-center">
            <div className="text-base text-[#C9A347]/70 mb-3">{t('hreward.nextTarget')}</div>
            {nextTier && nextTier.streak <= currentBetTier.maxStreak ? (
              <>
                <div className="text-5xl font-bold text-[#C9A347]" style={{ fontFamily: '"Cinzel", serif' }}>
                  {nextTier.percentage}%
                </div>
                <div className="text-sm text-[#C9A347]/60 mt-2">
                  {t('hreward.winMore').replace('{n}', nextTier.streak.toString())}
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-[#FFD700]" style={{ fontFamily: '"Cinzel", serif' }}>
                  {t('hreward.reachedMax')}
                </div>
                <div className="text-sm text-[#C9A347]/60 mt-2">
                  {t('hreward.upgradeUnlock')}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 四个区域卡片 */}
      <div className="grid grid-cols-4 gap-5">
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
              className={`rounded-xl p-5 transition-all ${!isZoneUnlocked ? 'opacity-40' : ''}`}
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
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="flex items-center gap-2 font-bold text-xl"
                  style={{ color: colors.text }}
                >
                  {zone.icon}
                  {zone.label}
                </div>
                {isZoneCompleted && (
                  <span className="text-green-400 text-lg">✓</span>
                )}
              </div>

              {/* 连胜范围 */}
              <div className="text-base text-[#C9A347]/60 mb-3">
                {zone.streaks}
              </div>

              {/* 奖励范围 */}
              <div 
                className="text-lg font-semibold mb-2"
                style={{ color: colors.text }}
              >
                {zoneTiers[0]?.percentage}% ~ {zoneTiers[zoneTiers.length - 1]?.percentage}%
              </div>

              {/* BNB范围 */}
              <div className="text-sm text-[#C9A347]/50">
                {minReward.toFixed(3)} ~ {maxZoneReward.toFixed(3)} BNB
              </div>

              {/* 该区域的5个等级 */}
              <div className="flex justify-between mt-5 pt-4 border-t border-[#C9A347]/10">
                {zoneTiers.map((tier) => {
                  const isActive = currentStreak >= tier.streak;
                  const isCurrent = currentStreak === tier.streak;
                  const isUnlocked = tier.streak <= currentBetTier.maxStreak;

                  return (
                    <div key={tier.streak} className="flex flex-col items-center">
                      <motion.div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all
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
                        className="text-base mt-2 font-medium"
                        style={{ color: isActive ? '#FFD700' : 'rgba(255, 215, 0, 0.35)' }}
                      >
                        {tier.percentage}%
                      </div>
                      {tier.milestone && (
                        <div className="text-sm mt-1" style={{ color: colors.text }}>
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
        className="mt-6 p-5 rounded-xl flex items-center justify-between"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 0, 128, 0.08) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-[#FFD700]" />
          <span className="text-lg text-[#C9A347]">
            {t('hreward.yourMaxTarget').replace('{tier}', currentBetTier.name)}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-2xl font-bold text-[#FFD700]" style={{ fontFamily: '"Cinzel", serif' }}>
            {t('hreward.nStreakEquals').replace('{n}', currentBetTier.maxStreak.toString()).replace('{percent}', (maxTier?.percentage ?? 0).toString())}
          </span>
          <span className="text-lg text-[#C9A347]/80">
            ≈ {maxReward.toFixed(4)} BNB
          </span>
        </div>
      </div>

      {/* 详细奖励说明 */}
      <div 
        className="mt-6 p-5 rounded-xl"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(201, 163, 71, 0.15)',
        }}
      >
        <div className="text-base text-[#C9A347] font-semibold mb-3">
          {t('hreward.percentDetail')}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-[#C9A347]/70">{t('hreward.entryZone')} ({t('hreward.streakRange1')})</div>
            <div className="text-[#FFD700]">1{t('ladder.nStreak').replace('{n}', '')} → 0.02%</div>
            <div className="text-[#FFD700]">2{t('ladder.nStreak').replace('{n}', '')} → 0.05%</div>
            <div className="text-[#FFD700]">3{t('ladder.nStreak').replace('{n}', '')} → 0.1%</div>
            <div className="text-[#FFD700]">4{t('ladder.nStreak').replace('{n}', '')} → 0.15%</div>
            <div className="text-[#FFD700]">5{t('ladder.nStreak').replace('{n}', '')} → 0.25%</div>
          </div>
          <div className="space-y-1">
            <div className="text-[#C9A347]/70">{t('hreward.advancedZone')} ({t('hreward.streakRange2')})</div>
            <div className="text-[#FFD700]">6{t('ladder.nStreak').replace('{n}', '')} → 0.4%</div>
            <div className="text-[#FFD700]">7{t('ladder.nStreak').replace('{n}', '')} → 0.6%</div>
            <div className="text-[#FFD700]">8{t('ladder.nStreak').replace('{n}', '')} → 1%</div>
            <div className="text-[#FFD700]">9{t('ladder.nStreak').replace('{n}', '')} → 1.5%</div>
            <div className="text-[#FFD700]">10{t('ladder.nStreak').replace('{n}', '')} → 2.5%</div>
          </div>
          <div className="space-y-1">
            <div className="text-[#C9A347]/70">{t('hreward.eliteZone')} ({t('hreward.streakRange3')})</div>
            <div className="text-[#FFD700]">11{t('ladder.nStreak').replace('{n}', '')} → 4%</div>
            <div className="text-[#FFD700]">12{t('ladder.nStreak').replace('{n}', '')} → 6%</div>
            <div className="text-[#FFD700]">13{t('ladder.nStreak').replace('{n}', '')} → 9%</div>
            <div className="text-[#FFD700]">14{t('ladder.nStreak').replace('{n}', '')} → 13%</div>
            <div className="text-[#FFD700]">15{t('ladder.nStreak').replace('{n}', '')} → 18%</div>
          </div>
          <div className="space-y-1">
            <div className="text-[#C9A347]/70">{t('hreward.legendZone')} ({t('hreward.streakRange4')})</div>
            <div className="text-[#FFD700]">16{t('ladder.nStreak').replace('{n}', '')} → 25%</div>
            <div className="text-[#FFD700]">17{t('ladder.nStreak').replace('{n}', '')} → 35%</div>
            <div className="text-[#FFD700]">18{t('ladder.nStreak').replace('{n}', '')} → 50%</div>
            <div className="text-[#FFD700]">19{t('ladder.nStreak').replace('{n}', '')} → 70%</div>
            <div className="text-[#FFD700]">20{t('ladder.nStreak').replace('{n}', '')} → 100% 🏆</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#C9A347]/15 text-sm text-[#C9A347]/60">
          <strong className="text-[#FFD700]">{t('hreward.exampleNote')}</strong>
        </div>
      </div>

      {/* 规则提示 */}
      <div className="mt-5 text-center text-base text-[#C9A347]/50 space-y-2">
        <div dangerouslySetInnerHTML={{ __html: t('hreward.ruleNote') }} />
        <div>{t('hreward.cashoutTip')}</div>
      </div>
    </div>
  );
}
