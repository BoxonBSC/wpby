import { motion } from 'framer-motion';
import { REWARD_TIERS, getCurrentRewardTier, calculateHiLoReward } from '@/config/hilo';
import { Trophy, Zap, Star } from 'lucide-react';

interface RewardLadderProps {
  currentStreak: number;
  prizePool: number;
}

export function RewardLadder({ currentStreak, prizePool }: RewardLadderProps) {
  return (
    <div 
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-[#C9A347]" />
        <h3 className="text-[#C9A347] font-bold">奖励阶梯</h3>
      </div>

      <div className="space-y-2">
        {REWARD_TIERS.map((tier, index) => {
          const isActive = currentStreak >= tier.streak;
          const isCurrent = currentStreak === tier.streak;
          const reward = calculateHiLoReward(tier.streak, prizePool);

          return (
            <motion.div
              key={tier.streak}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative flex items-center justify-between p-3 rounded-xl transition-all
                ${isCurrent ? 'ring-2 ring-[#FFD700]' : ''}
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
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${isActive ? 'bg-[#C9A347] text-black' : 'bg-[#C9A347]/20 text-[#C9A347]/50'}
                  `}
                >
                  {tier.streak}
                </div>
                <div>
                  <div className={`text-sm font-bold ${isActive ? 'text-[#C9A347]' : 'text-[#C9A347]/40'}`}>
                    {tier.label}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-[#C9A347]/60' : 'text-[#C9A347]/30'}`}>
                    {tier.percentage}% 奖池
                  </div>
                </div>
              </div>

              {/* 奖励金额 */}
              <div className="text-right">
                <div className={`font-bold ${isActive ? 'text-[#FFD700]' : 'text-[#FFD700]/40'}`}>
                  {reward.toFixed(4)} BNB
                </div>
                <div className={`text-xs ${isActive ? 'text-[#C9A347]/60' : 'text-[#C9A347]/30'}`}>
                  上限 {tier.maxBNB} BNB
                </div>
              </div>

              {/* 当前指示器 */}
              {isCurrent && (
                <motion.div
                  className="absolute -left-1 top-1/2 -translate-y-1/2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Zap className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
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
          <div className="text-2xl font-bold text-[#FFD700]">
            {calculateHiLoReward(currentStreak, prizePool).toFixed(4)} BNB
          </div>
        </motion.div>
      )}
    </div>
  );
}
