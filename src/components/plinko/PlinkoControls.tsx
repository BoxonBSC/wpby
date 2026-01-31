import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PLINKO_BET_LEVELS, AUTO_DROP_OPTIONS } from '@/config/plinko';
import { Coins, Zap, Loader2, CircleDot } from 'lucide-react';

interface PlinkoControlsProps {
  credits: number;
  betAmount: number;
  onBetChange: (amount: number) => void;
  autoDropCount: number;
  onAutoDropChange: (count: number) => void;
  onDrop: () => void;
  isDropping: boolean;
  remainingDrops: number;
}

export function PlinkoControls({
  credits,
  betAmount,
  onBetChange,
  autoDropCount,
  onAutoDropChange,
  onDrop,
  isDropping,
  remainingDrops,
}: PlinkoControlsProps) {
  const canDrop = credits >= betAmount && !isDropping;

  return (
    <div 
      className="rounded-2xl p-6 h-full"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
        boxShadow: `
          0 0 40px rgba(201, 163, 71, 0.15),
          inset 0 1px 0 rgba(201, 163, 71, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.5)
        `,
      }}
    >
      {/* 余额显示 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Coins className="w-4 h-4 text-[#C9A347]/70" />
          <span className="text-[#C9A347]/70 text-sm tracking-wider">游戏凭证</span>
        </div>
        <div 
          className="text-3xl font-bold tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #E8D490 0%, #C9A347 50%, #8B7230 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {credits.toLocaleString()}
        </div>
      </div>

      {/* 下注金额选择 */}
      <div className="mb-6">
        <div className="text-[#C9A347]/70 text-sm mb-3 tracking-wider">下注金额</div>
        <div className="grid grid-cols-5 gap-2">
          {PLINKO_BET_LEVELS.map((level) => (
            <motion.button
              key={level.value}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onBetChange(level.value)}
              className="relative py-2.5 px-1 rounded-xl text-xs font-bold transition-all overflow-hidden"
              style={{
                background: betAmount === level.value 
                  ? 'linear-gradient(135deg, #C9A347 0%, #FFD700 50%, #C9A347 100%)'
                  : 'linear-gradient(135deg, rgba(26, 22, 18, 0.9) 0%, rgba(15, 12, 8, 0.95) 100%)',
                color: betAmount === level.value ? '#0a0806' : '#C9A347',
                border: `1px solid ${betAmount === level.value ? '#FFD700' : 'rgba(201, 163, 71, 0.3)'}`,
                boxShadow: betAmount === level.value 
                  ? '0 0 20px rgba(201, 163, 71, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  : 'none',
              }}
            >
              {level.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 自动投球设置 */}
      <div className="mb-6">
        <div className="text-[#C9A347]/70 text-sm mb-3 tracking-wider">自动投球</div>
        <div className="grid grid-cols-3 gap-2">
          {AUTO_DROP_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAutoDropChange(option.value)}
              className="py-2.5 px-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: autoDropCount === option.value 
                  ? 'linear-gradient(135deg, #C9A347 0%, #FFD700 50%, #C9A347 100%)'
                  : 'linear-gradient(135deg, rgba(26, 22, 18, 0.9) 0%, rgba(15, 12, 8, 0.95) 100%)',
                color: autoDropCount === option.value ? '#0a0806' : '#C9A347',
                border: `1px solid ${autoDropCount === option.value ? '#FFD700' : 'rgba(201, 163, 71, 0.3)'}`,
                boxShadow: autoDropCount === option.value 
                  ? '0 0 20px rgba(201, 163, 71, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  : 'none',
              }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 剩余次数显示 */}
      {remainingDrops > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 text-center py-3 rounded-xl"
          style={{
            background: 'rgba(201, 163, 71, 0.1)',
            border: '1px solid rgba(201, 163, 71, 0.2)',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <CircleDot className="w-4 h-4 text-[#C9A347]" />
            </motion.div>
            <span className="text-[#C9A347]/70 text-sm">剩余投球</span>
            <span className="text-[#FFD700] font-bold text-lg">{remainingDrops}</span>
          </div>
        </motion.div>
      )}

      {/* 投球按钮 */}
      <motion.div
        whileHover={{ scale: canDrop ? 1.02 : 1 }}
        whileTap={{ scale: canDrop ? 0.98 : 1 }}
      >
        <Button
          onClick={onDrop}
          disabled={!canDrop}
          className="w-full h-16 text-lg font-bold rounded-xl transition-all duration-300 border-0"
          style={{
            background: canDrop 
              ? 'linear-gradient(135deg, #B8953F 0%, #C9A347 25%, #FFD700 50%, #C9A347 75%, #B8953F 100%)'
              : 'linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%)',
            color: canDrop ? '#0a0806' : '#666',
            boxShadow: canDrop 
              ? `
                  0 4px 20px rgba(201, 163, 71, 0.5),
                  0 0 40px rgba(255, 215, 0, 0.3),
                  inset 0 2px 0 rgba(255, 255, 255, 0.4),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.2)
                `
              : 'none',
            textShadow: canDrop ? '0 1px 0 rgba(255, 255, 255, 0.3)' : 'none',
          }}
        >
          {isDropping ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              投球中...
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 mr-2" />
              {autoDropCount > 0 ? `开始投球 (${autoDropCount}次)` : '投放弹珠'}
            </>
          )}
        </Button>
      </motion.div>

      {/* 提示信息 */}
      {credits < betAmount && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-red-400/80 text-sm py-2 px-4 rounded-lg"
          style={{
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.2)',
          }}
        >
          凭证不足，请先充值
        </motion.div>
      )}

      {/* 赔率表简介 */}
      <div className="mt-6 pt-6 border-t border-[#C9A347]/10">
        <div className="text-[#C9A347]/50 text-xs text-center mb-3">赔率范围</div>
        <div className="flex justify-between text-xs">
          <div className="text-center">
            <div className="text-green-400 font-bold">1x</div>
            <div className="text-[#C9A347]/40">中间</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold">5-10x</div>
            <div className="text-[#C9A347]/40">两侧</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-bold">110x</div>
            <div className="text-[#C9A347]/40">边缘</div>
          </div>
        </div>
      </div>
    </div>
  );
}
