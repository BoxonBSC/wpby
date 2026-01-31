import { useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/ParticleBackground';
import { LuxuryHeader } from '@/components/LuxuryHeader';
import { LuxuryWheel } from '@/components/LuxuryWheel';
import { LuxuryPrizePool } from '@/components/LuxuryPrizePool';
import { LuxuryPaytable } from '@/components/LuxuryPaytable';
import { LuxuryCreditsPanel } from '@/components/LuxuryCreditsPanel';
import { JackpotTicker } from '@/components/JackpotTicker';
import { ContractAddresses } from '@/components/ContractAddresses';
import { Sparkles, Shield, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BET_LEVELS } from '@/config/contracts';

const Index = () => {
  const isMobile = useIsMobile();
  const [prizePool] = useState(10.5);
  const [selectedBet, setSelectedBet] = useState(BET_LEVELS[0].value);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 动态粒子背景 */}
      <ParticleBackground />
      
      {/* 顶部导航 */}
      <LuxuryHeader />

      {/* 主内容区 */}
      <main className="relative z-10 pt-20 pb-12 min-h-screen flex flex-col">
        {/* 滚动中奖播报 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 mb-4"
        >
          <JackpotTicker />
        </motion.div>

        {/* 手机端布局 */}
        <div className="lg:hidden flex-1 flex flex-col px-4 space-y-6">
          {/* 奖池显示 */}
          <LuxuryPrizePool prizePool={prizePool} />
          
          {/* 转盘 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <LuxuryWheel prizePool={prizePool} />
          </motion.div>
          
          {/* 凭证面板 */}
          <LuxuryCreditsPanel 
            selectedBet={selectedBet}
            onBetChange={setSelectedBet}
          />
          
          {/* 赔付表 */}
          <LuxuryPaytable prizePool={prizePool} />
        </div>

        {/* 桌面端布局 - 全屏沉浸式 */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-8 gap-12">
          {/* 左侧面板 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-80 space-y-6 flex-shrink-0"
          >
            <LuxuryPrizePool prizePool={prizePool} />
            <LuxuryCreditsPanel 
              selectedBet={selectedBet}
              onBetChange={setSelectedBet}
            />
          </motion.div>

          {/* 中央转盘 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.3, 
              type: 'spring',
              stiffness: 100,
            }}
            className="flex-shrink-0"
          >
            <LuxuryWheel prizePool={prizePool} />
          </motion.div>

          {/* 右侧面板 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="w-80 flex-shrink-0"
          >
            <LuxuryPaytable prizePool={prizePool} />
          </motion.div>
        </div>

        {/* 底部信息 */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-auto pt-8 px-4"
        >
          {/* 合约地址 */}
          <div className="max-w-xl mx-auto mb-6">
            <ContractAddresses />
          </div>

          {/* 特性展示 */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>智能合约保障</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Chainlink VRF</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>链上可验证</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground/60">
            Powered by BNB Chain · 每次旋转结果链上可查
          </p>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;
