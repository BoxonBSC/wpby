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
import { Trophy, Zap, Star, Lock, Crown, Sparkles, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';

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
  
  // 预览状态：允许用户点击锁定的等级来预览奖励
  const [previewTier, setPreviewTier] = useState<BetTier | null>(null);
  
  // 显示用的等级（预览或当前）
  const displayBetTier = previewTier || currentBetTier;

  // 自动滚动到当前连胜位置
  useEffect(() => {
    if (currentStreak > 0 && currentItemRef.current) {
      currentItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStreak]);
  
  // 当实际选择的等级变化时，清除预览
  useEffect(() => {
    setPreviewTier(null);
  }, [currentBetTier.maxStreak]);

  // 按区域分组奖励
  const groupedTiers = REWARD_TIERS.reduce((acc, tier) => {
    if (!acc[tier.zone]) acc[tier.zone] = [];
    acc[tier.zone].push(tier);
    return acc;
  }, {} as Record<RewardZone, typeof REWARD_TIERS>);

  const zones: RewardZone[] = ['common', 'advanced', 'elite', 'legendary'];

  // 最高可能奖励（基于显示的等级）
  const maxPossibleReward = calculateHiLoReward(displayBetTier.maxStreak, displayBetTier.maxStreak, prizePool);
  const maxTier = REWARD_TIERS.find(t => t.streak === displayBetTier.maxStreak);

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
          background: `linear-gradient(90deg, ${displayBetTier.color}20 0%, transparent 100%)`,
          border: `1px solid ${displayBetTier.color}40`,
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: displayBetTier.color }}
          >
            <Trophy className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-1" style={{ color: displayBetTier.color }}>
              {displayBetTier.name}等级
              {previewTier && (
                <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" />
                  预览
                </span>
              )}
            </div>
            <div className="text-xs text-[#C9A347]/60">
              最高 {displayBetTier.maxStreak} 连胜
            </div>
          </div>
        </div>
        {previewTier && (
          <button
            onClick={() => setPreviewTier(null)}
            className="text-[10px] px-2 py-1 rounded bg-[#C9A347]/20 text-[#C9A347] hover:bg-[#C9A347]/30 transition-colors"
          >
            返回
          </button>
        )}
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
        <div className="text-xl font-bold text-[#FFD700]">
          {maxTier?.percentage}% <span className="text-sm text-[#C9A347]/60">奖池</span>
        </div>
        <div className="text-sm text-[#FFD700]/80">
          ≈ {maxPossibleReward.toFixed(4)} BNB
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
                // 基于显示的等级（预览或当前）计算解锁状态
                const isUnlockedByDisplay = tier.streak <= displayBetTier.maxStreak;
                const isUnlockedByCurrent = tier.streak <= currentBetTier.maxStreak;
                const isActive = currentStreak >= tier.streak && isUnlockedByDisplay;
                const isCurrent = currentStreak === tier.streak && isUnlockedByCurrent;
                const reward = calculateHiLoReward(tier.streak, displayBetTier.maxStreak, prizePool);
                const colors = ZONE_COLORS[tier.zone];

                // 找到解锁此等级的门槛
                const requiredTier = BET_TIERS.find(bt => bt.maxStreak >= tier.streak);
                
                // 是否需要更高等级才能解锁
                const needsHigherTier = !isUnlockedByDisplay && requiredTier;

                return (
                  <motion.div
                    key={tier.streak}
                    ref={isCurrent ? currentItemRef : null}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      // 点击锁定的项目时，切换到对应的预览等级
                      if (!isUnlockedByDisplay && requiredTier) {
                        setPreviewTier(requiredTier);
                      }
                    }}
                    className={`
                      relative flex items-center justify-between p-2 rounded-lg transition-all
                      ${isCurrent ? 'ring-2 ring-[#FFD700] ring-offset-1 ring-offset-black' : ''}
                      ${!isUnlockedByDisplay ? 'opacity-60 cursor-pointer hover:opacity-80' : ''}
                    `}
                    style={{
                      background: isActive 
                        ? typeof colors.bg === 'string' && colors.bg.includes('gradient')
                          ? colors.bg
                          : colors.bg
                        : isUnlockedByDisplay 
                          ? 'rgba(0, 0, 0, 0.2)'
                          : 'rgba(0, 0, 0, 0.3)',
                      border: `1px solid ${isActive ? colors.border + '60' : 'rgba(201, 163, 71, 0.1)'}`,
                    }}
                  >
                    {/* 连胜数 */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{
                          background: isActive ? colors.border : 'rgba(201, 163, 71, 0.2)',
                          color: isActive ? '#000' : colors.text,
                        }}
                      >
                        {tier.streak}
                      </div>
                      <div>
                        <div 
                          className="text-xs font-bold flex items-center gap-1"
                          style={{ color: isActive ? colors.text : 'rgba(201, 163, 71, 0.4)' }}
                        >
                          {tier.milestone ? (
                            <>
                              <span>{tier.milestone.emoji}</span>
                              <span>{tier.milestone.label}</span>
                            </>
                          ) : (
                            <span>{tier.streak}连胜</span>
                          )}
                        </div>
                        <div 
                          className="text-[10px]"
                          style={{ color: isActive ? colors.text + '99' : 'rgba(201, 163, 71, 0.3)' }}
                        >
                          奖池 {tier.percentage}%
                        </div>
                      </div>
                    </div>

                    {/* 奖励金额 / 锁定提示 */}
                    <div className="text-right">
                      {isUnlockedByDisplay ? (
                        <>
                          <div 
                            className="font-bold text-sm"
                            style={{ color: isActive ? '#FFD700' : 'rgba(255, 215, 0, 0.4)' }}
                          >
                            {tier.percentage}%
                          </div>
                          <div 
                            className="text-[10px]"
                            style={{ color: isActive ? '#FFD700' : 'rgba(255, 215, 0, 0.25)' }}
                          >
                            ≈{reward.toFixed(4)}
                          </div>
                        </>
                      ) : (
                        <div 
                          className="flex items-center gap-1 text-[#C9A347]/50 hover:text-[#C9A347]/70 transition-colors"
                          title={`点击预览${requiredTier?.name}等级奖励`}
                        >
                          <Eye className="w-3 h-3" />
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
          {(() => {
            const currentTier = REWARD_TIERS.find(t => t.streak === currentStreak);
            const reward = calculateHiLoReward(currentStreak, currentBetTier.maxStreak, prizePool);
            return (
              <>
                <div className="text-xl font-bold text-[#FFD700]">
                  {currentTier?.percentage ?? 0}% <span className="text-sm text-[#C9A347]/60">奖池</span>
                </div>
                <div className="text-sm text-[#FFD700]/80">
                  ≈ {reward.toFixed(4)} BNB
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
