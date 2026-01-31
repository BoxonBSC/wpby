import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuxuryWheel } from '@/components/LuxuryWheel';
import { WheelPaytable } from '@/components/WheelPaytable';
import { WalletConnect } from '@/components/WalletConnect';
import { CreditsExchange } from '@/components/CreditsExchange';
import { JackpotTicker } from '@/components/JackpotTicker';
import { Navbar } from '@/components/Navbar';
import { ContractAddresses } from '@/components/ContractAddresses';
import { Crown, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [prizePool] = useState(10.5);

  return (
    <div className="min-h-screen bg-background luxury-pattern relative overflow-hidden">
      {/* 暗角效果 */}
      <div className="fixed inset-0 pointer-events-none vignette" />
      
      {/* 顶部聚光灯效果 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      </div>

      {/* 装饰性金色光点 */}
      {!isMobile && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                y: [0, -100],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              className="absolute w-1 h-1 rounded-full bg-primary"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${50 + Math.random() * 50}%`,
                boxShadow: '0 0 10px hsl(45 100% 50% / 0.5)',
              }}
            />
          ))}
        </div>
      )}
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-8 relative z-10">
        {/* Hero 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ 
              textShadow: [
                '0 0 20px hsl(45 100% 50% / 0.3)',
                '0 0 40px hsl(45 100% 50% / 0.6)',
                '0 0 20px hsl(45 100% 50% / 0.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h1 className="text-4xl md:text-6xl font-display text-shimmer mb-3 flex items-center justify-center gap-4">
              <Crown className="w-8 h-8 md:w-12 md:h-12 text-primary" />
              FORTUNE WHEEL
              <Crown className="w-8 h-8 md:w-12 md:h-12 text-primary" />
            </h1>
          </motion.div>
          
          <p className="text-muted-foreground text-lg font-display tracking-widest">
            旋转命运之轮 · 赢取丰厚奖励
          </p>

          {/* 合约地址 */}
          <div className="mt-4">
            <ContractAddresses />
          </div>

          {/* 中奖播报 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <JackpotTicker />
          </motion.div>
        </motion.div>

        {/* 手机端布局 */}
        <div className="lg:hidden space-y-4">
          {/* 转盘 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <LuxuryWheel prizePool={prizePool} />
          </motion.div>
          
          {/* 钱包和凭证 */}
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
            <WheelPaytable prizePool={prizePool} />
          </motion.div>
        </div>

        {/* 桌面端布局 - 沉浸式 */}
        <div className="hidden lg:flex items-start justify-center gap-8">
          {/* 左侧 - 钱包和凭证 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-80 space-y-4 sticky top-24"
          >
            <WalletConnect />
            <CreditsExchange />
          </motion.div>

          {/* 中间 - 转盘（主视觉） */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex-shrink-0"
          >
            <LuxuryWheel prizePool={prizePool} />
          </motion.div>

          {/* 右侧 - 赔付表 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="w-80 sticky top-24"
          >
            <WheelPaytable prizePool={prizePool} />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="ornament text-muted-foreground text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="mt-4 text-muted-foreground text-sm">
            Powered by BNB Chain · Chainlink VRF
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            智能合约保障公平 · 每次旋转链上可查
          </p>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
