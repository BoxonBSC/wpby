import { motion } from 'framer-motion';
import type { SlotSymbol } from '@/hooks/useSlotMachine';

interface SlotReelProps {
  symbol: SlotSymbol;
  isSpinning: boolean;
  isWinning?: boolean;
  delay?: number;
}

const symbolColors: Record<SlotSymbol, string> = {
  '7': 'text-neon-yellow',
  '🍒': 'text-neon-pink',
  '🍋': 'text-neon-yellow',
  '🔔': 'text-neon-orange',
  '💎': 'text-neon-cyan',
  '⭐': 'text-neon-yellow',
  '🍀': 'text-neon-green',
};

export function SlotReel({ symbol, isSpinning, isWinning = false, delay = 0 }: SlotReelProps) {
  return (
    <div className={`
      slot-reel relative w-24 h-28 md:w-32 md:h-36 rounded-lg overflow-hidden
      flex items-center justify-center
      ${isWinning ? 'win-animation' : ''}
    `}>
      <motion.div
        key={symbol}
        initial={{ y: isSpinning ? -100 : 0, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          rotateX: isSpinning ? [0, 360] : 0,
        }}
        transition={{
          duration: isSpinning ? 0.1 : 0.3,
          delay: delay,
          repeat: isSpinning ? Infinity : 0,
        }}
        className={`
          text-5xl md:text-6xl font-bold
          ${symbol === '7' ? symbolColors[symbol] + ' neon-text-blue font-display' : ''}
          ${isWinning ? 'jackpot' : ''}
        `}
      >
        {symbol}
      </motion.div>
      
      {/* Glow overlay for winning */}
      {isWinning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute inset-0 bg-neon-yellow/20 pointer-events-none"
        />
      )}
    </div>
  );
}
