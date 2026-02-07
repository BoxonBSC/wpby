import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Sparkles } from 'lucide-react';

interface WinCelebrationProps {
  winnerAddress: string;
  winnerAmount: string;
  prizePoolBNB: number;
  onManualSettle?: () => void;
  isSettling?: boolean;
}

const CONFETTI_COLORS = [
  '#a855f7', // violet
  '#facc15', // yellow
  '#f472b6', // pink
  '#22d3ee', // cyan
  '#4ade80', // green
  '#fb923c', // orange
  '#ffffff', // white
];

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

function createConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

export function WinCelebration({ winnerAddress, winnerAmount, prizePoolBNB, onManualSettle, isSettling }: WinCelebrationProps) {
  const [confetti] = useState(() => createConfetti(30));
  const [showAmount, setShowAmount] = useState(false);

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  useEffect(() => {
    const timer = setTimeout(() => setShowAmount(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative py-8 overflow-hidden">
      {/* Confetti rain */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute top-0 pointer-events-none"
          style={{ left: `${piece.x}%` }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{
            y: ['0%', '120%'],
            opacity: [0, 1, 1, 0],
            rotate: [0, piece.rotation, piece.rotation * 2],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="rounded-sm"
            style={{
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              boxShadow: `0 0 ${piece.size}px ${piece.color}40`,
            }}
          />
        </motion.div>
      ))}

      {/* Radial glow behind trophy */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, rgba(139,92,246,0.05) 50%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Trophy with golden glow */}
      <div className="relative flex justify-center mb-5">
        {/* Pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-400/20"
            initial={{ width: 40, height: 40, opacity: 0 }}
            animate={{
              width: [40, 120 + i * 30],
              height: [40, 120 + i * 30],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeOut',
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
        >
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <Trophy
              className="w-20 h-20 text-yellow-400"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(250,204,21,0.5)) drop-shadow(0 0 40px rgba(250,204,21,0.2))',
              }}
            />
            {/* Sparkle accents */}
            {[
              { x: -20, y: -10, delay: 0 },
              { x: 22, y: -15, delay: 0.5 },
              { x: -15, y: 20, delay: 1 },
              { x: 25, y: 15, delay: 1.5 },
            ].map((spark, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: `calc(50% + ${spark.x}px)`, top: `calc(50% + ${spark.y}px)` }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: spark.delay, ease: 'easeInOut' }}
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center mb-2"
      >
        <span className="text-3xl font-display font-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
          🎉 本轮结束！
        </span>
      </motion.div>

      {/* Winner address */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-neutral-400 text-sm mb-3"
      >
        恭喜 <span className="text-violet-300 font-medium">{shortenAddress(winnerAddress || '0x0')}</span> 获胜
      </motion.div>

      {/* Prize amount — animated counter */}
      <AnimatePresence>
        {showAmount && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-center mb-5"
          >
            <motion.span
              className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                filter: 'drop-shadow(0 0 15px rgba(250,204,21,0.4))',
              }}
            >
              +{winnerAmount} BNB
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settlement status & manual settle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-2 text-violet-400 text-sm font-medium">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="w-5 h-5" />
          </motion.div>
          正在等待结算...
        </div>

        {/* Manual settle button */}
        {onManualSettle && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            onClick={onManualSettle}
            disabled={isSettling}
            className={`mt-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              isSettling
                ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 active:scale-95'
            }`}
          >
            {isSettling ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
                结算中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                手动触发结算
              </span>
            )}
          </motion.button>
        )}

        <p className="text-[11px] text-neutral-600 mt-1">
          {onManualSettle ? '点击手动结算可获得 0.001 BNB 奖励' : '奖金将自动发放至赢家钱包'}
        </p>
      </motion.div>
    </div>
  );
}
