import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X } from 'lucide-react';
import { SYMBOLS, type SlotSymbol } from '@/hooks/useAdvancedSlotMachine';

interface WinRevealOverlayProps {
  isVisible: boolean;
  winAmount: string;
  prizeType: string;
  prizeEmoji: string;
  symbols: SlotSymbol[];
  onClose: () => void;
}

const getSymbolEmoji = (id: SlotSymbol): string => {
  return SYMBOLS.find(s => s.id === id)?.emoji || '❓';
};

export function WinRevealOverlay({
  isVisible,
  winAmount,
  prizeType,
  prizeEmoji,
  symbols,
  onClose,
}: WinRevealOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="relative p-8 rounded-2xl bg-card border-2 border-neon-yellow/50 shadow-[0_0_60px_hsl(50_100%_50%/0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* 背景粒子效果 */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-neon-yellow/60 rounded-full"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              ))}
            </div>

            {/* 标题 */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-center mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-5xl mb-2"
              >
                {prizeEmoji}
              </motion.div>
              <h2 className="text-3xl font-display neon-text-yellow flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                {prizeType}
                <Sparkles className="w-6 h-6" />
              </h2>
            </motion.div>

            {/* 符号显示 */}
            <div className="flex justify-center gap-3 mb-6">
              {symbols.map((symbolId, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 10,
                    stiffness: 200,
                    delay: index * 0.1,
                  }}
                  className="w-16 h-16 flex items-center justify-center rounded-xl bg-muted/50 border-2 border-neon-yellow/50 shadow-[0_0_20px_hsl(50_100%_50%/0.3)]"
                >
                  <span className="text-3xl">{getSymbolEmoji(symbolId)}</span>
                </motion.div>
              ))}
            </div>

            {/* 奖金金额 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                <Trophy className="w-4 h-4 text-neon-yellow" />
                获得奖金
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-4xl font-display neon-text-green"
              >
                +{winAmount} BNB
              </motion.div>
            </motion.div>

            {/* 底部提示 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-sm text-muted-foreground mt-4"
            >
              点击任意位置关闭
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
