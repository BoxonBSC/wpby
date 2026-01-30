import { motion } from 'framer-motion';
import { AdvancedSlotMachine } from '@/components/AdvancedSlotMachine';
import { WalletConnect } from '@/components/WalletConnect';
import { CompactRewardTiers } from '@/components/CompactRewardTiers';
import { CompactGameHistory } from '@/components/CompactGameHistory';
import { EmberParticles } from '@/components/EmberParticles';
import { JackpotTicker } from '@/components/JackpotTicker';
import { CreditsExchange } from '@/components/CreditsExchange';

import { Navbar } from '@/components/Navbar';
import { ContractAddresses } from '@/components/ContractAddresses';
import { Flame, Zap, Trophy } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-x-hidden">
      {/* 扫描线效果 - 更微妙 */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-10" />
      
      {/* 深红渐变背景 */}
      <div className="fixed inset-0 bg-gradient-to-b from-fire-crimson/8 via-transparent to-fire-deep/20 pointer-events-none" />
      
      {/* 底部热浪效果 */}
      <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-fire-crimson/15 via-fire-orange/5 to-transparent pointer-events-none" />
      
      {/* 动态火焰光晕 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* 左侧深红光晕 */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, hsl(355 85% 35% / 0.4) 0%, transparent 70%)' }}
        />
        {/* 右侧橙红光晕 */}
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.12, 0.2, 0.12],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, hsl(15 90% 50% / 0.35) 0%, transparent 70%)' }}
        />
        {/* 中央微弱金色光 */}
        <motion.div
          animate={{
            opacity: [0.05, 0.12, 0.05],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, hsl(40 95% 55% / 0.15) 0%, transparent 60%)' }}
        />
      </div>

      {/* 余烬粒子效果 */}
      <EmberParticles count={25} />
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          {/* 主标题 - 火焰效果 */}
          <div className="relative inline-block">
            <motion.h1 
              className="text-4xl md:text-6xl font-display text-shimmer mb-2 flex items-center justify-center gap-4"
              animate={{ 
                textShadow: [
                  '0 0 30px hsl(25 100% 55% / 0.5)',
                  '0 0 50px hsl(15 90% 50% / 0.6)',
                  '0 0 30px hsl(25 100% 55% / 0.5)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [-3, 3, -3],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="relative"
              >
                <Flame className="w-10 h-10 md:w-12 md:h-12 text-fire-ember flame-flicker" />
                <div className="absolute inset-0 blur-md bg-fire-orange/40 rounded-full" />
              </motion.div>
              
              <span className="relative">
                BURN SLOTS
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(25 100% 55%), transparent)' }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
              
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [3, -3, 3],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="relative"
              >
                <Flame className="w-10 h-10 md:w-12 md:h-12 text-fire-ember flame-flicker" />
                <div className="absolute inset-0 blur-md bg-fire-orange/40 rounded-full" />
              </motion.div>
            </motion.h1>
          </div>
          
          <motion.p 
            className="text-sm md:text-base text-muted-foreground mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            燃烧老虎机 · 通缩即奖励
          </motion.p>
          
          {/* 特性标签 - 更精致 */}
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-3 py-1.5 rounded-lg text-xs font-display bg-fire-crimson/15 text-fire-ember border border-fire-crimson/30 flex items-center gap-1.5 backdrop-blur-sm"
            >
              <Zap className="w-3 h-3" /> 5轮 × 3行
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-3 py-1.5 rounded-lg text-xs font-display bg-fire-orange/10 text-fire-gold border border-fire-orange/25 backdrop-blur-sm"
            >
              15条赔付线
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-3 py-1.5 rounded-lg text-xs font-display bg-fire-ember/10 text-fire-ember border border-fire-ember/25 backdrop-blur-sm"
            >
              10种符号
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-3 py-1.5 rounded-lg text-xs font-display bg-neon-green/10 text-neon-green border border-neon-green/25 flex items-center gap-1.5 backdrop-blur-sm"
            >
              <Trophy className="w-3 h-3" /> 100% 返还
            </motion.span>
          </div>

          {/* 智能合约地址 */}
          <ContractAddresses />

          {/* 中奖播报 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <JackpotTicker />
          </motion.div>
        </motion.div>

        {/* 主游戏区域 */}
        <div className="grid xl:grid-cols-[280px_1fr_300px] lg:grid-cols-[240px_1fr_260px] gap-4 items-stretch">
          {/* 左侧 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4 order-2 lg:order-1"
          >
            <WalletConnect />
            <CreditsExchange />
            <div className="flex-1 hidden lg:block">
              <CompactGameHistory />
            </div>
          </motion.div>

          {/* 中间 - 老虎机 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <AdvancedSlotMachine />
          </motion.div>

          {/* 右侧 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="order-3"
          >
            <CompactRewardTiers />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <div className="inline-block px-5 py-2.5 rounded-lg bg-fire-crimson/10 border border-fire-crimson/20 backdrop-blur-sm">
            <p className="flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 text-fire-ember" />
              链上版本 | 智能合约已连接
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">Powered by BNB Chain & Chainlink VRF</p>
          </div>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
