import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Trophy, Sparkles, Crown } from 'lucide-react';
import { useCyberSlots, formatSymbols, formatPrizeType, shortenAddress } from '@/hooks/useCyberSlots';
import { formatEther } from 'ethers';
import { useLanguage } from '@/contexts/LanguageContext';

interface WinDisplay {
  address: string;
  amount: string;
  prize: string;
  symbols: string[];
}

export function JackpotTicker() {
  const { recentWins } = useCyberSlots();
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayWins, setDisplayWins] = useState<WinDisplay[]>([]);

  useEffect(() => {
    if (recentWins.length > 0) {
      const realWins: WinDisplay[] = recentWins
        .filter(win => win.winAmount > 0n)
        .map(win => ({
          address: shortenAddress(win.player),
          amount: formatEther(win.winAmount),
          prize: formatPrizeType(win.prizeType, language).name,
          symbols: formatSymbols(win.symbols),
        }));
      
      if (realWins.length > 0) {
        setDisplayWins(realWins);
      }
    }
  }, [recentWins, language]);

  useEffect(() => {
    if (displayWins.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayWins.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayWins.length]);

  const hasWins = displayWins.length > 0;
  const winner = hasWins ? displayWins[currentIndex] : null;

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative overflow-hidden rounded-full bg-black/60 backdrop-blur-md border border-primary/30 px-6 py-2.5">
        {/* 金色光效 */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'linear-gradient(90deg, transparent, hsl(45 100% 50% / 0.2), transparent)',
              'linear-gradient(90deg, transparent, hsl(45 100% 50% / 0.4), transparent)',
              'linear-gradient(90deg, transparent, hsl(45 100% 50% / 0.2), transparent)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <div className="relative">
          {hasWins ? (
            <div className="flex items-center justify-center gap-4">
              <Crown className="w-4 h-4 text-primary" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-primary font-display tracking-wider">{winner?.prize}!</span>
                  <span className="text-muted-foreground font-mono text-xs">{winner?.address}</span>
                  <span className="text-emerald-400 font-display">
                    +{parseFloat(winner?.amount || '0').toFixed(4)} BNB
                  </span>
                </motion.div>
              </AnimatePresence>
              
              <Trophy className="w-4 h-4 text-primary" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary/50" />
              <span className="font-display tracking-wider">{t('jackpot.waiting')}</span>
              <Sparkles className="w-4 h-4 text-primary/50" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
