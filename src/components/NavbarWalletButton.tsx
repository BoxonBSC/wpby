import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, Ticket, X, Flame } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useCyberHiLo } from '@/hooks/useCyberHiLo';
import { useLanguage } from '@/contexts/LanguageContext';
import { WalletConnect } from './WalletConnect';
import { CreditsExchange } from './CreditsExchange';

export function NavbarWalletButton() {
  const { t } = useLanguage();
  const { address, isConnected, disconnect } = useWallet();
  const { gameCredits } = useCyberHiLo();
  const [showPanel, setShowPanel] = useState(false);

  const shortenAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  const creditsNum = parseFloat(gameCredits);

  const formatCredits = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return Math.floor(num).toString();
  };

  return (
    <>
      {/* 导航栏按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
        style={{
          background: isConnected 
            ? 'linear-gradient(135deg, rgba(201, 163, 71, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%)'
            : 'rgba(201, 163, 71, 0.1)',
          border: `1px solid ${isConnected ? 'rgba(255, 215, 0, 0.4)' : 'rgba(201, 163, 71, 0.3)'}`,
          boxShadow: isConnected ? '0 0 10px rgba(255, 215, 0, 0.2)' : 'none',
        }}
      >
        <Wallet className="w-4 h-4" style={{ color: isConnected ? '#FFD700' : '#C9A347' }} />
        {isConnected ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-display" style={{ color: '#FFD700' }}>
              {shortenAddress(address!)}
            </span>
            <div 
              className="flex items-center gap-1 px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(0, 255, 200, 0.1)', border: '1px solid rgba(0, 255, 200, 0.3)' }}
            >
              <Ticket className="w-3 h-3" style={{ color: '#00FFC8' }} />
              <span className="text-xs font-display" style={{ color: '#00FFC8' }}>
                {formatCredits(creditsNum)}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs font-display" style={{ color: '#C9A347' }}>
            {t('wallet.connect')}
          </span>
        )}
      </motion.button>

      {/* 侧边面板 */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPanel(false)}
            />
            
            {/* 面板 */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-sm overflow-y-auto"
              style={{
                background: 'linear-gradient(180deg, #1a1510 0%, #0f0c07 100%)',
                borderLeft: '2px solid rgba(201, 163, 71, 0.3)',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* 头部 */}
              <div 
                className="sticky top-0 flex items-center justify-between p-4 backdrop-blur-lg z-10"
                style={{
                  background: 'linear-gradient(180deg, rgba(26, 21, 16, 0.98) 0%, rgba(26, 21, 16, 0.9) 100%)',
                  borderBottom: '1px solid rgba(201, 163, 71, 0.2)',
                }}
              >
                <h2 
                  className="text-lg font-bold flex items-center gap-2"
                  style={{
                    fontFamily: '"Cinzel", "Noto Serif SC", serif',
                    color: '#FFD700',
                  }}
                >
                  <Wallet className="w-5 h-5" />
                  {t('wallet.title') || '钱包中心'}
                </h2>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ color: '#C9A347' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 内容 */}
              <div className="p-4 space-y-4">
                {/* 钱包连接 */}
                <WalletConnect />

                {/* 代币兑换 - 仅已连接时显示 */}
                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <CreditsExchange />
                  </motion.div>
                )}

                {/* 使用说明 */}
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(201, 163, 71, 0.05)',
                    border: '1px solid rgba(201, 163, 71, 0.2)',
                  }}
                >
                  <h4 
                    className="text-sm font-bold mb-3 flex items-center gap-2"
                    style={{ color: '#C9A347' }}
                  >
                    <Flame className="w-4 h-4" />
                    {t('exchange.howToPlay') || '游戏流程'}
                  </h4>
                  <ol className="space-y-2 text-xs" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>
                    <li className="flex items-start gap-2">
                      <span 
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: 'rgba(201, 163, 71, 0.2)', color: '#FFD700' }}
                      >
                        1
                      </span>
                      {t('exchange.step1') || '连接BSC钱包'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span 
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: 'rgba(201, 163, 71, 0.2)', color: '#FFD700' }}
                      >
                        2
                      </span>
                      {t('exchange.step2') || '焚毁代币兑换游戏凭证'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span 
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: 'rgba(201, 163, 71, 0.2)', color: '#FFD700' }}
                      >
                        3
                      </span>
                      {t('exchange.step3') || '使用凭证参与游戏'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span 
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: 'rgba(201, 163, 71, 0.2)', color: '#FFD700' }}
                      >
                        4
                      </span>
                      {t('exchange.step4') || '赢取BNB奖池奖励'}
                    </li>
                  </ol>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
