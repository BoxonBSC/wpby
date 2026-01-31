import { motion } from 'framer-motion';
import { REWARD_TIERS, BET_TIERS, getCurrentRewardTier, calculateHiLoReward, BetTier } from '@/config/hilo';
import { Trophy, Zap, Star, Lock } from 'lucide-react';

interface RewardLadderProps {
  currentStreak: number;
  prizePool: number;
  currentBetTier: BetTier;
}

export function RewardLadder({ currentStreak, prizePool, currentBetTier }: RewardLadderProps) {
  return (
    <div 
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
      }}
    >
      {/* 当前门槛等级 */}
      <div 
        className="flex items-center justify-between p-3 rounded-xl mb-4"
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
              最高连胜 {currentBetTier.maxStreak} 次
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-[#C9A347]/60">
          {(currentBetTier.betAmount / 1000)}K 凭证
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-[#C9A347]" />
        <h3 className="text-[#C9A347] font-bold text-sm">奖励阶梯</h3>
      </div>

      <div className="space-y-2">
        {REWARD_TIERS.map((tier, index) => {
          const isUnlocked = tier.streak <= currentBetTier.maxStreak;
          const isActive = currentStreak >= tier.streak && isUnlocked;
          const isCurrent = currentStreak === tier.streak && isUnlocked;
          const reward = calculateHiLoReward(tier.streak, currentBetTier.maxStreak, prizePool);

          // 找到解锁此等级的门槛
          const requiredTier = BET_TIERS.find(bt => bt.maxStreak >= tier.streak);

          return (
            <motion.div
              key={tier.streak}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative flex items-center justify-between p-2.5 rounded-xl transition-all
                ${isCurrent ? 'ring-2 ring-[#FFD700]' : ''}
                ${!isUnlocked ? 'opacity-50' : ''}
              `}
              style={{
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(201, 163, 71, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)'
                  : 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${isActive ? 'rgba(201, 163, 71, 0.4)' : 'rgba(201, 163, 71, 0.1)'}`,
              }}
            >
              {/* 连胜数 */}
              <div className="flex items-center gap-2">
                <div 
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs
                    ${isActive ? 'bg-[#C9A347] text-black' : 'bg-[#C9A347]/20 text-[#C9A347]/50'}
                  `}
                >
                  {tier.streak}
                </div>
                <div>
                  <div className={`text-xs font-bold ${isActive ? 'text-[#C9A347]' : 'text-[#C9A347]/40'}`}>
                    {tier.label}
                  </div>
                  <div className={`text-[10px] ${isActive ? 'text-[#C9A347]/60' : 'text-[#C9A347]/30'}`}>
                    {tier.percentage}% 奖池
                  </div>
                </div>
              </div>

              {/* 奖励金额 / 锁定提示 */}
              <div className="text-right">
                {isUnlocked ? (
                  <>
                    <div className={`font-bold text-sm ${isActive ? 'text-[#FFD700]' : 'text-[#FFD700]/40'}`}>
                      {reward.toFixed(4)} BNB
                    </div>
                    <div className={`text-[10px] ${isActive ? 'text-[#C9A347]/60' : 'text-[#C9A347]/30'}`}>
                      ~{tier.probability}% 概率
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-[#C9A347]/40">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs">{requiredTier?.name}</span>
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

      {/* 当前奖励提示 */}
      {currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 163, 71, 0.1) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
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

      {/* 门槛说明 */}
      <div className="mt-4 pt-4 border-t border-[#C9A347]/10">
        <div className="text-xs text-[#C9A347]/40 mb-2">解锁更高奖励</div>
        <div className="space-y-1">
          {BET_TIERS.map(tier => (
            <div 
              key={tier.id}
              className="flex items-center justify-between text-xs"
              style={{ color: tier.color, opacity: tier.betAmount <= currentBetTier.betAmount ? 1 : 0.5 }}
            >
              <span>{tier.name}</span>
              <span>{(tier.betAmount / 1000)}K → {tier.maxStreak}连胜</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
