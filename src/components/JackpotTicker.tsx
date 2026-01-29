import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { useCyberSlots, formatSymbols, formatPrizeType, shortenAddress } from '@/hooks/useCyberSlots';
import { formatEther } from 'ethers';

interface WinDisplay {
  address: string;
  amount: string;
  prize: string;
  symbols: string[];
}

const MOCK_WINNERS: WinDisplay[] = [
  { address: '0x1a2b...3c4d', amount: '2.45', prize: '头奖', symbols: ['💎', '💎', '💎', '💎', '💎'] },
  { address: '0x5e6f...7g8h', amount: '0.85', prize: '一等奖', symbols: ['👑', '👑', '👑', '👑', '👑'] },
  { address: '0x9i0j...1k2l', amount: '0.32', prize: '二等奖', symbols: ['🔔', '🔔', '🔔', '🔔', '🍒'] },
];

export function JackpotTicker() {
  const { recentWins, prizePool } = useCyberSlots();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayWins, setDisplayWins] = useState<WinDisplay[]>(MOCK_WINNERS);

  useEffect(() => {
    if (recentWins.length > 0) {
      const realWins: WinDisplay[] = recentWins
        .filter(win => win.winAmount > 0n)
        .map(win => ({
          address: shortenAddress(win.player),
          amount: formatEther(win.winAmount),
          prize: formatPrizeType(win.prizeType).name,
          symbols: formatSymbols(win.symbols),
        }));
      
      if (realWins.length > 0) {
        setDisplayWins(realWins);
      }
    }
  }, [recentWins]);

  useEffect(() => {
    if (displayWins.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayWins.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayWins.length]);

  const winner = displayWins[currentIndex] || MOCK_WINNERS[0];
  const poolDisplay = parseFloat(prizePool) > 0 ? parseFloat(prizePool).toFixed(2) : '10.50';

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-neon-yellow/10 via-neon-orange/10 to-neon-pink/10 border border-neon-yellow/30 px-4 py-2">
      <div className="absolute inset-0 shine-effect opacity-50" />
      
      <div className="relative">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xs text-muted-foreground">奖池</span>
          <span className="text-lg font-display text-neon-yellow">{poolDisplay} BNB</span>
        </div>
        
        <div className="flex items-center justify-center gap-3">
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
              <span className="text-neon-green font-display">+{parseFloat(winner.amount).toFixed(4)} BNB</span>
            </motion.div>
          </AnimatePresence>
          
          <Sparkles className="w-4 h-4 text-neon-pink animate-pulse" />
        </div>
      </div>
    </div>
  );
}
