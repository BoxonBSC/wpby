import { motion } from 'framer-motion';
import { Crown, Gem, Wallet } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

export function LuxuryHeader() {
  const { isConnected, gameCredits, address } = useWallet();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* 毛玻璃背景 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border-b border-primary/20" />
      
      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Crown className="w-8 h-8 text-primary" />
              </motion.div>
              <div className="absolute inset-0 blur-lg bg-primary/30" />
            </div>
            <div>
              <h1 className="font-display text-xl tracking-wider text-shimmer">
                FORTUNE WHEEL
              </h1>
              <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                Royal Casino
              </p>
            </div>
          </motion.div>

          {/* 右侧信息 */}
          <div className="flex items-center gap-4">
            {/* 凭证显示 */}
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
              >
                <Gem className="w-4 h-4 text-primary" />
                <span className="font-display text-sm text-primary">
                  {gameCredits.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">凭证</span>
              </motion.div>
            )}
            
            {/* 钱包按钮 */}
            <CompactWalletButton />
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function CompactWalletButton() {
  const { isConnected, address, connect, disconnect } = useWallet();
  
  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isConnected && address) {
    return (
      <motion.button
        onClick={disconnect}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 border border-primary/30 hover:border-primary/60 transition-colors"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-display text-sm text-foreground">
          {shortenAddress(address)}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={() => connect()}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/80 to-primary text-black font-display text-sm"
    >
      <Wallet className="w-4 h-4" />
      连接钱包
    </motion.button>
  );
}
