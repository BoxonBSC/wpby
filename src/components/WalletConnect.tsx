import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, WalletType, WalletInfo } from '@/contexts/WalletContext';
import { useCyberHiLo } from '@/hooks/useCyberHiLo';
import { Wallet, LogOut, Copy, ExternalLink, Ticket, ChevronDown, X, Smartphone, QrCode, Gift, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { getWalletBrand, WalletConnectIcon } from './WalletIcons';
import { useLanguage } from '@/contexts/LanguageContext';

// 钱包图标组件
function WalletIcon({ wallet, size = 'md' }: { wallet: WalletInfo; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 20, md: 28, lg: 36 };
  const brand = getWalletBrand(wallet.id);
  const IconComponent = brand.icon;
  return <IconComponent size={sizeMap[size]} />;
}

export function WalletConnect() {
  const { t } = useLanguage();
  const { 
    address, isConnected, balance, connect, connectWalletConnect,
    disconnect, isConnecting, error, availableWallets, connectedWallet,
  } = useWallet();
  
  const { tokenBalance: chainTokenBalance, gameCredits: chainGameCredits, unclaimedPrize, claimPrize } = useCyberHiLo();
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  const tokenBalance = parseFloat(chainTokenBalance);
  const gameCredits = parseFloat(chainGameCredits);
  const unclaimedAmount = parseFloat(unclaimedPrize || '0');

  const handleClaimPrize = async () => {
    if (isClaiming || unclaimedAmount <= 0) return;
    setIsClaiming(true);
    try {
      const success = await claimPrize();
      if (success) {
        toast({ title: '🎉 领取成功！', description: `已将 ${unclaimedAmount.toFixed(4)} BNB 发送至您的钱包` });
      }
    } catch (err) {
      toast({ title: '领取失败', description: '请稍后重试', variant: 'destructive' });
    } finally {
      setIsClaiming(false);
    }
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({ title: t('walletUI.copied'), description: t('walletUI.copiedDesc') });
    }
  };

  const openBscScan = () => {
    if (address) window.open(`https://bscscan.com/address/${address}`, '_blank');
  };

  const handleWalletSelect = async (walletType: WalletType) => {
    setShowWalletSelector(false);
    await connect(walletType);
  };

  const getConnectedWalletInfo = () => availableWallets.find(w => w.id === connectedWallet);

  // 钱包选择弹窗
  const WalletSelectorModal = () => (
    <AnimatePresence>
      {showWalletSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowWalletSelector(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm relative p-5 rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.98) 0%, rgba(15, 12, 8, 0.98) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.3)',
              boxShadow: '0 0 40px rgba(201, 163, 71, 0.15), inset 0 1px 0 rgba(201, 163, 71, 0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWalletSelector(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: '#C9A347' }}
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 
              className="text-lg font-bold mb-4 flex items-center gap-2"
              style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}
            >
              <Wallet className="w-5 h-5" />
              {t('walletUI.selectWallet')}
            </h3>
            
            <div className="space-y-2">
              {availableWallets.map(wallet => {
                const brand = getWalletBrand(wallet.id);
                return (
                  <motion.button
                    key={wallet.id}
                    onClick={() => handleWalletSelect(wallet.id)}
                    disabled={!wallet.detected && wallet.id !== 'metamask'}
                    whileHover={{ scale: wallet.detected ? 1.02 : 1 }}
                    whileTap={{ scale: wallet.detected ? 0.98 : 1 }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{
                      background: wallet.detected 
                        ? 'rgba(201, 163, 71, 0.1)' 
                        : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${wallet.detected ? 'rgba(201, 163, 71, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                      opacity: wallet.detected ? 1 : 0.5,
                      cursor: wallet.detected ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <div className="flex-shrink-0">
                      <WalletIcon wallet={wallet} />
                    </div>
                    <div className="flex-1 text-left">
                      <div style={{ 
                        fontFamily: '"Cinzel", serif',
                        color: wallet.detected ? '#FFD700' : 'rgba(201, 163, 71, 0.5)' 
                      }}>
                        {wallet.name}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>
                        {wallet.detected ? t('walletUI.detected') : t('walletUI.notInstalled')}
                      </div>
                    </div>
                    {wallet.detected && (
                      <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: '#00FFC8' }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
            
            {/* WalletConnect */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(201, 163, 71, 0.2)' }}>
              <motion.button
                onClick={() => { setShowWalletSelector(false); connectWalletConnect(); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  background: 'rgba(59, 153, 252, 0.1)',
                  border: '1px solid rgba(59, 153, 252, 0.4)',
                }}
              >
                <WalletConnectIcon size={28} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2" style={{ fontFamily: '"Cinzel", serif', color: '#3B99FC' }}>
                    WalletConnect
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(59, 153, 252, 0.2)' }}>
                      {t('walletUI.scan')}
                    </span>
                  </div>
                  <div className="text-xs flex items-center gap-1" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>
                    <Smartphone className="w-3 h-3" />
                    {t('walletUI.mobileWallet')}
                  </div>
                </div>
                <QrCode className="w-5 h-5" style={{ color: '#3B99FC' }} />
              </motion.button>
            </div>
            
            <p className="text-xs text-center mt-4" style={{ color: 'rgba(201, 163, 71, 0.5)' }}>
              {t('walletUI.selectHint')}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (error) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl p-4"
          style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.4)',
          }}
        >
          <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
          <button
            onClick={() => setShowWalletSelector(true)}
            className="mt-2 text-sm hover:underline"
            style={{ color: '#FFD700' }}
          >
            {t('walletUI.reselectWallet')}
          </button>
        </motion.div>
        <WalletSelectorModal />
      </>
    );
  }

  if (isConnected && address) {
    const walletInfo = getConnectedWalletInfo();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.95) 100%)',
          border: '1px solid rgba(201, 163, 71, 0.3)',
          boxShadow: '0 0 20px rgba(201, 163, 71, 0.1)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#00FFC8' }} />
            <span className="text-sm" style={{ color: '#00FFC8' }}>{t('wallet.connected')}</span>
            {walletInfo && (
              <span className="text-sm flex items-center gap-1" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>
                <WalletIcon wallet={walletInfo} size="sm" />
                {walletInfo.name.split(' ')[0]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { disconnect(); setTimeout(() => setShowWalletSelector(true), 100); }}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
              style={{ background: 'rgba(201, 163, 71, 0.1)', color: '#C9A347' }}
            >
              <Wallet className="w-3 h-3" />
              {t('walletUI.switch')}
            </button>
            <button
              onClick={disconnect}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors hover:bg-red-500/20"
              style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#EF4444' }}
            >
              <LogOut className="w-3 h-3" />
              {t('wallet.disconnect')}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-center justify-between">
            <span 
              className="text-lg"
              style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}
            >
              {shortenAddress(address)}
            </span>
            <div className="flex gap-2">
              <button onClick={copyAddress} className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <Copy className="w-4 h-4" style={{ color: '#C9A347' }} />
              </button>
              <button onClick={openBscScan} className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <ExternalLink className="w-4 h-4" style={{ color: '#C9A347' }} />
              </button>
            </div>
          </div>

          {/* Balances */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="rounded-xl p-2.5 text-center"
                style={{ background: 'rgba(201, 163, 71, 0.1)', border: '1px solid rgba(201, 163, 71, 0.2)' }}
              >
                <div className="text-xs mb-1" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>{t('walletUI.bnbBalance')}</div>
                <div className="text-sm" style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}>
                  {Number(balance).toFixed(4)}
                </div>
              </div>
              <div 
                className="rounded-xl p-2.5 text-center"
                style={{ background: 'rgba(201, 163, 71, 0.1)', border: '1px solid rgba(201, 163, 71, 0.2)' }}
              >
                <div className="text-xs mb-1" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>{t('walletUI.tokenBalance')}</div>
                <div className="text-sm" style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}>
                  {tokenBalance >= 1000000 
                    ? `${(tokenBalance / 1000000).toFixed(1)}M`
                    : tokenBalance >= 1000
                    ? `${(tokenBalance / 1000).toFixed(0)}K`
                    : tokenBalance.toLocaleString()
                  }
                </div>
              </div>
            </div>
            
            {/* 🎁 待领取奖励 - 醒目显示 */}
            {unclaimedAmount > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 180, 0, 0.1) 100%)',
                  border: '2px solid rgba(255, 215, 0, 0.5)',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 30px rgba(255, 215, 0, 0.1)',
                }}
              >
                {/* 金光动画背景 */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.4) 0%, transparent 50%)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5" style={{ color: '#FFD700' }} />
                      <span className="text-sm font-bold" style={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
                        🎉 待领取奖励
                      </span>
                    </div>
                  </div>
                  
                  <div 
                    className="text-3xl font-bold mb-3"
                    style={{ 
                      fontFamily: '"Cinzel", serif', 
                      color: '#FFD700',
                      textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                    }}
                  >
                    {unclaimedAmount.toFixed(4)} BNB
                  </div>
                  
                  <motion.button
                    onClick={handleClaimPrize}
                    disabled={isClaiming}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      color: '#1a1510',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                      opacity: isClaiming ? 0.7 : 1,
                    }}
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        领取中...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        立即领取
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* 游戏凭证 */}
            <div 
              className="rounded-xl p-3"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 200, 0.1) 0%, rgba(0, 200, 150, 0.05) 100%)',
                border: '1px solid rgba(0, 255, 200, 0.3)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(0, 255, 200, 0.8)' }}>
                  <Ticket className="w-3.5 h-3.5" style={{ color: '#00FFC8' }} />
                  {t('walletUI.gameCredits')}
                </div>
                <div className="text-xs" style={{ color: '#00FFC8' }}>{t('walletUI.permanent')}</div>
              </div>
              <div className="text-xl mt-1" style={{ fontFamily: '"Cinzel", serif', color: '#00FFC8' }}>
                {gameCredits >= 1000000 
                  ? `${(gameCredits / 1000000).toFixed(2)}M`
                  : gameCredits >= 1000
                  ? `${(gameCredits / 1000).toFixed(1)}K`
                  : Math.floor(gameCredits).toLocaleString()
                }
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(0, 255, 200, 0.5)' }}>
                {t('walletUI.nonTransferable')}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.button
        onClick={() => setShowWalletSelector(true)}
        disabled={isConnecting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(201, 163, 71, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)',
          border: '2px solid rgba(255, 215, 0, 0.5)',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)',
          fontFamily: '"Cinzel", serif',
          color: '#FFD700',
        }}
      >
        {isConnecting ? (
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            ⏳
          </motion.span>
        ) : (
          <Wallet className="w-5 h-5" />
        )}
        {isConnecting ? t('wallet.connecting') : t('wallet.connect')}
        <ChevronDown className="w-4 h-4" />
      </motion.button>
      <WalletSelectorModal />
    </>
  );
}
