import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
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
  const { recentWins, prizePool, totalBurned } = useCyberSlots();
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayWins, setDisplayWins] = useState<WinDisplay[]>([]);

  const formatBnbDisplay = (value: string) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return '0';

    // 小额奖池不要被 toFixed(2) 四舍五入成 0.00
    const decimals = n >= 1 ? 2 : n >= 0.01 ? 4 : 6;
    const fixed = n.toFixed(decimals);

    // 去掉末尾多余的 0
    return fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  };

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

  const poolDisplay = formatBnbDisplay(prizePool);
  const burnedDisplay = formatBnbDisplay(totalBurned);
  const hasWins = displayWins.length > 0;
  const winner = hasWins ? displayWins[currentIndex] : null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-neon-yellow/10 via-neon-orange/10 to-neon-pink/10 border border-neon-yellow/30 px-4 py-2">
      <div className="absolute inset-0 shine-effect opacity-50" />
      
      <div className="relative">
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{t('jackpot.pool')}</span>
            <span className="text-base sm:text-lg font-display text-neon-yellow">{poolDisplay} BNB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{t('jackpot.burned')}</span>
            <span className="text-base sm:text-lg font-display text-neon-pink">{Number(burnedDisplay).toLocaleString()} 🔥</span>
          </div>
        </div>
        
        {hasWins ? (
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
                <span className="text-neon-yellow font-display">{winner?.prize}!</span>
                <span className="text-muted-foreground">{winner?.address}</span>
                <span className="text-neon-green font-display">+{parseFloat(winner?.amount || '0').toFixed(4)} BNB</span>
              </motion.div>
            </AnimatePresence>
            
            <Sparkles className="w-4 h-4 text-neon-pink animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 text-neon-yellow/50" />
            <span>{t('jackpot.waiting')}</span>
            <Sparkles className="w-4 h-4 text-neon-pink/50" />
          </div>
        )}
      </div>
    </div>
  );
}
