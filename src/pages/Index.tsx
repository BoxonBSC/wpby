import { motion } from 'framer-motion';
import { SlotMachine } from '@/components/SlotMachine';
import { WalletConnect } from '@/components/WalletConnect';
import { RewardTiers } from '@/components/RewardTiers';
import { GameHistory } from '@/components/GameHistory';
import { Navbar } from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background cyber-grid relative">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-50" />
      
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-neon-purple/5 via-transparent to-neon-blue/5 pointer-events-none" />
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-display neon-text-blue mb-4 glitch">
            CYBER SLOTS
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            赛博朋克链上老虎机 | 公平透明 | Chainlink VRF 随机数 | BNB Chain
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Wallet & Rewards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <WalletConnect />
            <RewardTiers />
          </motion.div>

          {/* Center Column - Slot Machine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <SlotMachine />
          </motion.div>

          {/* Right Column - History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GameHistory />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          <div className="neon-border-purple inline-block px-6 py-3 rounded-lg bg-muted/20">
            <p>⚠️ 本游戏为演示版本 | 智能合约需单独部署</p>
            <p className="mt-1">Powered by BNB Chain & Chainlink VRF</p>
          </div>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
