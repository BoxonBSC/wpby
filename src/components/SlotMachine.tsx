import { motion, AnimatePresence } from 'framer-motion';
import { SlotReel } from './SlotReel';
import { useSlotMachine } from '@/hooks/useSlotMachine';
import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';
import { Zap, TrendingUp, Coins } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function SlotMachine() {
  const { gameState, prizePool, tokensPerSpin, spin } = useSlotMachine();
  const { isConnected, tokenBalance, connect } = useWallet();
  const [showWinEffect, setShowWinEffect] = useState(false);

  const handleSpin = async () => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        description: "需要连接 MetaMask 钱包才能开始游戏",
        variant: "destructive",
      });
      return;
    }

    if (Number(tokenBalance) < tokensPerSpin) {
      toast({
        title: "代币不足",
        description: `需要 ${tokensPerSpin.toLocaleString()} 代币才能游戏`,
        variant: "destructive",
      });
      return;
    }

    const result = await spin();
    
    if (result.isWin) {
      setShowWinEffect(true);
      setTimeout(() => setShowWinEffect(false), 3000);
      
      const winMessages = {
        jackpot: `🎉 头奖！恭喜赢得 ${result.winAmount.toFixed(4)} BNB！`,
        second: `🥈 二等奖！赢得 ${result.winAmount.toFixed(4)} BNB！`,
        small: `🥉 小奖！赢得 ${result.winAmount.toFixed(4)} BNB！`,
      };

      toast({
        title: result.winType === 'jackpot' ? '🎰 JACKPOT!' : '恭喜中奖！',
        description: winMessages[result.winType!],
      });
    }
  };

  return (
    <div className="relative">
      {/* Win Effect Overlay */}
      <AnimatePresence>
        {showWinEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {/* Particle effects */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: '50vw', 
                  y: '50vh',
                  scale: 0,
                }}
                animate={{ 
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1, 0],
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 0.5,
                }}
                className="absolute text-4xl"
              >
                {['⭐', '💎', '🎉', '✨'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Machine Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="cyber-card relative overflow-hidden"
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-blue" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-blue" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-blue" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-blue" />

        {/* Title */}
        <h2 className="text-center text-2xl md:text-3xl font-display neon-text-blue mb-6 glitch">
          BURN SLOTS
        </h2>

        {/* Prize Pool Display */}
        <div className="flex justify-center mb-6">
          <div className="neon-border-pink rounded-lg px-6 py-3 bg-muted/50">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-neon-yellow" />
              <span className="text-muted-foreground text-sm">奖池</span>
              <span className="text-2xl font-display neon-text-pink">
                {prizePool.toFixed(2)} BNB
              </span>
            </div>
          </div>
        </div>

        {/* Slot Reels */}
        <div className="flex justify-center items-center gap-3 md:gap-4 mb-6">
          {gameState.currentReels.map((symbol, index) => (
            <SlotReel
              key={index}
              symbol={symbol}
              isSpinning={gameState.isSpinning}
              isWinning={gameState.lastResult?.isWin && !gameState.isSpinning}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="neon-border rounded-lg p-3 bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-neon-green" />
              当前概率
            </div>
            <div className="text-xl font-display text-neon-green">
              {gameState.winProbability}%
            </div>
          </div>
          <div className="neon-border rounded-lg p-3 bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-neon-cyan" />
              消耗代币
            </div>
            <div className="text-xl font-display text-neon-cyan">
              {tokensPerSpin.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Spin Button */}
        {isConnected ? (
          <motion.button
            onClick={handleSpin}
            disabled={gameState.isSpinning}
            whileHover={{ scale: gameState.isSpinning ? 1 : 1.02 }}
            whileTap={{ scale: gameState.isSpinning ? 1 : 0.98 }}
            className="cyber-button w-full text-lg rounded-lg disabled:opacity-50"
          >
            {gameState.isSpinning ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  🎰
                </motion.span>
                转动中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                开始游戏
              </span>
            )}
          </motion.button>
        ) : (
          <motion.button
            onClick={() => connect()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cyber-button w-full text-lg rounded-lg"
          >
            连接钱包开始游戏
          </motion.button>
        )}

        {/* Game Stats */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          总游戏次数: {gameState.totalSpins} | 总中奖次数: {gameState.totalWins}
        </div>
      </motion.div>
    </div>
  );
}
