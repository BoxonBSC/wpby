import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Trophy, Sparkles } from 'lucide-react';

const MOCK_WINNERS = [
  { address: '0x1a2b...3c4d', amount: 2.45, prize: '头奖' },
  { address: '0x5e6f...7g8h', amount: 0.85, prize: '一等奖' },
  { address: '0x9i0j...1k2l', amount: 0.32, prize: '二等奖' },
  { address: '0x3m4n...5o6p', amount: 1.28, prize: '头奖' },
  { address: '0x7q8r...9s0t', amount: 0.15, prize: '三等奖' },
];

export function JackpotTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOCK_WINNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const winner = MOCK_WINNERS[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-neon-yellow/10 via-neon-orange/10 to-neon-pink/10 border border-neon-yellow/30 px-4 py-2">
      {/* 闪烁背景 */}
      <div className="absolute inset-0 shine-effect opacity-50" />
      
      <div className="relative flex items-center justify-center gap-3">
        <Trophy className="w-4 h-4 text-neon-yellow animate-pulse" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 text-sm"
          >
            <span className="text-neon-yellow font-display">{winner.prize}!</span>
            <span className="text-muted-foreground">{winner.address}</span>
            <span className="text-neon-green font-display">+{winner.amount} BNB</span>
          </motion.div>
        </AnimatePresence>
        
        <Sparkles className="w-4 h-4 text-neon-pink animate-pulse" />
      </div>
    </div>
  );
}
