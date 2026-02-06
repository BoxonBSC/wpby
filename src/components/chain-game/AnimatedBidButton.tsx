import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface AnimatedBidButtonProps {
  onClick: () => void;
  disabled: boolean;
  isTaking: boolean;
  isEnded: boolean;
  isConnected: boolean;
  bidAmount: string;
  minBidNum: number;
}

export function AnimatedBidButton({
  onClick,
  disabled,
  isTaking,
  isEnded,
  isConnected,
  bidAmount,
  minBidNum,
}: AnimatedBidButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      // Create ripple at click position
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const id = ++rippleId.current;
        setRipples((prev) => [
          ...prev,
          { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
        ]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 800);
      }

      onClick();
    },
    [disabled, onClick],
  );

  const label = isTaking ? null : isEnded ? (
    '本轮已结束'
  ) : !isConnected ? (
    '连接钱包后出价'
  ) : bidAmount && Number(bidAmount) >= minBidNum ? (
    `🔥 出价 ${Number(bidAmount).toLocaleString()} 代币`
  ) : (
    '我要出价'
  );

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.01, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98, y: 1 }}
      className="relative w-full h-14 sm:h-[60px] rounded-xl font-display font-bold text-base sm:text-lg text-white overflow-hidden border border-violet-400/25 disabled:opacity-40 disabled:cursor-not-allowed transition-shadow duration-300 group"
      style={{
        boxShadow: disabled
          ? 'none'
          : '0 4px 24px rgba(139,92,246,0.3), 0 0 48px rgba(139,92,246,0.12)',
      }}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: disabled
            ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(124,58,237,0.3))'
            : [
                'linear-gradient(135deg, rgba(139,92,246,1), rgba(124,58,237,1), rgba(139,92,246,1))',
                'linear-gradient(135deg, rgba(124,58,237,1), rgba(139,92,246,1), rgba(124,58,237,1))',
                'linear-gradient(135deg, rgba(139,92,246,1), rgba(124,58,237,1), rgba(139,92,246,1))',
              ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Shimmer sweep */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
        />
      )}

      {/* Hover glow intensifier */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-violet-400/10 via-transparent to-white/5" />

      {/* Pulse ring (when not disabled & idle) */}
      {!disabled && !isTaking && !isEnded && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-violet-400/30"
          animate={{ opacity: [0, 0.6, 0], scale: [1, 1.03, 1.06] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              left: ripple.x - 150,
              top: ripple.y - 150,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isTaking ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="w-5 h-5" />
            </motion.div>
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              出价中...
            </motion.span>
          </>
        ) : (
          <>
            {!isEnded && <Flame className="w-5 h-5" />}
            {label}
          </>
        )}
      </span>
    </motion.button>
  );
}
