import { motion, AnimatePresence } from 'framer-motion';
import { RewardType, REWARDS, isBigWin, isJackpot } from '@/config/chest';

interface RewardRevealProps {
  reward: RewardType | null;
  bnbAmount: number;
  visible: boolean;
  onClose: () => void;
}

export function RewardReveal({ reward, bnbAmount, visible, onClose }: RewardRevealProps) {
  if (!reward) return null;

  const config = REWARDS[reward];
  const isBig = isBigWin(reward);
  const isLegendary = isJackpot(reward);
  const hasWon = reward !== 'no_win';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
            className="relative p-8 rounded-3xl text-center"
            style={{
              background: `radial-gradient(circle at center, ${config.color}20 0%, transparent 70%)`,
              border: `3px solid ${config.color}`,
              boxShadow: `
                0 0 60px ${config.color}40,
                0 0 120px ${config.color}20,
                inset 0 0 60px ${config.color}10
              `,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 背景光效 */}
            {isBig && (
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${config.color}40, transparent, ${config.color}40, transparent)`,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            )}

            {/* 传奇额外光效 */}
            {isLegendary && (
              <>
                <motion.div
                  className="absolute -inset-10"
                  style={{
                    background: `radial-gradient(circle, ${config.color}30 0%, transparent 70%)`,
                  }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-3xl overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <div className="absolute inset-0 bg-white/30" />
                </motion.div>
              </>
            )}

            {/* 内容 */}
            <div className="relative z-10">
              {/* Emoji */}
              <motion.div
                className="text-8xl mb-4"
                animate={isBig ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                } : {}}
                transition={{ duration: 0.5, repeat: isBig ? Infinity : 0, repeatDelay: 1 }}
              >
                {config.emoji}
              </motion.div>

              {/* 奖励名称 */}
              <motion.h2
                className="text-4xl font-bold mb-2"
                style={{ color: config.color }}
                animate={isLegendary ? { 
                  textShadow: [
                    `0 0 20px ${config.color}`,
                    `0 0 40px ${config.color}`,
                    `0 0 20px ${config.color}`,
                  ]
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {config.label}
              </motion.h2>

              {/* BNB金额 */}
              {hasWon ? (
                <motion.div
                  className="text-5xl font-bold text-[#FFD700] mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  +{bnbAmount.toFixed(4)} BNB
                </motion.div>
              ) : (
                <motion.div
                  className="text-2xl text-[#C9A347]/50 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  再接再厉
                </motion.div>
              )}

              {/* 奖池比例提示 */}
              {hasWon && config.poolPercent > 0 && (
                <motion.div
                  className="text-sm mt-2 opacity-60"
                  style={{ color: config.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.5 }}
                >
                  奖池 {(config.poolPercent * 100).toFixed(0)}% (上限 {config.maxBNB} BNB)
                </motion.div>
              )}

              {/* 关闭提示 */}
              <motion.p
                className="text-[#C9A347]/40 text-sm mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                点击任意位置关闭
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
