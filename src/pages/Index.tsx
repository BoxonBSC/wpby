import { motion } from 'framer-motion';
import { AdvancedSlotMachine } from '@/components/AdvancedSlotMachine';
import { WalletConnect } from '@/components/WalletConnect';
import { CompactRewardTiers } from '@/components/CompactRewardTiers';
import { CompactGameHistory } from '@/components/CompactGameHistory';
import { FloatingElements } from '@/components/FloatingElements';
import { JackpotTicker } from '@/components/JackpotTicker';
import { CreditsExchange } from '@/components/CreditsExchange';
import { BurnStats } from '@/components/BurnStats';

import { Navbar } from '@/components/Navbar';
import { ContractAddresses } from '@/components/ContractAddresses';
import { Sparkles, Zap, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-x-hidden">
      {/* 扫描线效果 */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-30" />
      
      {/* 背景渐变 */}
      <div className="fixed inset-0 bg-gradient-to-b from-neon-purple/5 via-transparent to-neon-blue/5 pointer-events-none" />
      
      {/* 动态光晕背景 - 手机端简化 */}
      {!isMobile && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[100px]"
          />
        </div>
      )}

      {/* 浮动装饰元素 - 手机端减少 */}
      <FloatingElements count={isMobile ? 5 : 10} />
      
      <Navbar />
      
      <main className="container mx-auto px-2 sm:px-4 pt-16 sm:pt-20 pb-4 sm:pb-8 relative z-10">
        {/* Hero Section - 手机端更紧凑 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-3 sm:mb-6"
        >
          <motion.div
            animate={{ 
              textShadow: [
                '0 0 20px hsl(195 100% 50% / 0.5)',
                '0 0 40px hsl(195 100% 50% / 0.8)',
                '0 0 20px hsl(195 100% 50% / 0.5)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-display text-shimmer mb-1 sm:mb-2 flex items-center justify-center gap-2 sm:gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-neon-yellow" />
              </motion.div>
              BURN SLOTS
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-neon-yellow" />
              </motion.div>
            </h1>
          </motion.div>
          
          {/* 动态标签 - 手机端隐藏部分 */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-2">
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-display bg-neon-purple/20 text-neon-purple border border-neon-purple/30 flex items-center gap-1"
            >
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {t('home.tag.symbols')}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-display bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
            >
              {t('home.tag.payline')}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-display bg-neon-pink/20 text-neon-pink border border-neon-pink/30"
            >
              {t('home.tag.symbolCount')}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-display bg-neon-green/20 text-neon-green border border-neon-green/30 flex items-center gap-1"
            >
              <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {t('home.tag.return')}
            </motion.span>
          </div>

          {/* 智能合约地址 - 手机端更紧凑 */}
          <ContractAddresses />

          {/* 全局统计 - 销毁/奖池/旋转 */}
          <BurnStats />

          {/* 中奖播报 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <JackpotTicker />
          </motion.div>
        </motion.div>

        {/* 手机端布局 - 单列 */}
        <div className="lg:hidden space-y-3">
          {/* 老虎机 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdvancedSlotMachine />
          </motion.div>
          
          {/* 钱包 + 凭证兑换 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <WalletConnect />
            <CreditsExchange />
          </motion.div>
          
          {/* 赔付表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CompactRewardTiers />
          </motion.div>
        </div>

        {/* 桌面端布局 - 三栏等高 */}
        <div className="hidden lg:grid xl:grid-cols-[320px_1fr_300px] lg:grid-cols-[280px_1fr_260px] gap-4 items-stretch">
          {/* 左侧 - 钱包 + 凭证兑换 + 历史记录 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <WalletConnect />
            <CreditsExchange />
            <div className="flex-1">
              <CompactGameHistory />
            </div>
          </motion.div>

          {/* 中间 - 老虎机 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdvancedSlotMachine />
          </motion.div>

          {/* 右侧 - 赔付表 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CompactRewardTiers />
          </motion.div>
        </div>


        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground"
        >
          <div className="neon-border-purple inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-muted/20">
            <p>{t('footer.onchain')}</p>
            <p className="mt-0.5 text-[10px] sm:text-xs">{t('footer.poweredBy')}</p>
          </div>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
