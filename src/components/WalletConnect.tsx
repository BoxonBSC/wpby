import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, WalletType, WalletInfo } from '@/contexts/WalletContext';
import { useCyberSlots } from '@/hooks/useCyberSlots';
import { Wallet, LogOut, Copy, ExternalLink, Ticket, ChevronDown, X, Smartphone, QrCode } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { getWalletBrand, WalletConnectIcon } from './WalletIcons';
import { useLanguage } from '@/contexts/LanguageContext';

// 钱包图标组件 - 使用官方品牌图标
function WalletIcon({ wallet, size = 'md' }: { wallet: WalletInfo; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 20,
    md: 28,
    lg: 36,
  };
  
  const brand = getWalletBrand(wallet.id);
  const IconComponent = brand.icon;
  
  return <IconComponent size={sizeMap[size]} />;
}

export function WalletConnect() {
  const { t } = useLanguage();
  const { 
    address, 
    isConnected, 
    balance, 
    connect, 
    connectWalletConnect,
    disconnect, 
    isConnecting, 
    error,
    availableWallets,
    connectedWallet,
  } = useWallet();
  
  // 从链上读取代币余额和游戏凭证
  const { tokenBalance: chainTokenBalance, gameCredits: chainGameCredits } = useCyberSlots();
  
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  
  // 使用链上数据
  const tokenBalance = parseFloat(chainTokenBalance);
  const gameCredits = parseFloat(chainGameCredits);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: t('walletUI.copied'),
        description: t('walletUI.copiedDesc'),
      });
    }
  };

  const openBscScan = () => {
    if (address) {
      window.open(`https://bscscan.com/address/${address}`, '_blank');
    }
  };

  const handleWalletSelect = async (walletType: WalletType) => {
    setShowWalletSelector(false);
    await connect(walletType);
  };

  const getConnectedWalletInfo = () => {
    return availableWallets.find(w => w.id === connectedWallet);
  };

  // 钱包选择弹窗
  const WalletSelectorModal = () => (
    <AnimatePresence>
      {showWalletSelector && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowWalletSelector(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="cyber-card w-full max-w-sm relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWalletSelector(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <h3 className="text-lg font-display neon-text-cyan mb-4 flex items-center gap-2">
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
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl transition-all border
                      ${wallet.detected 
                        ? `${brand.bgClass} ${brand.borderClass} ${brand.glowClass} hover:opacity-90 cursor-pointer` 
                        : 'border-border/30 bg-muted/10 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex-shrink-0">
                      <WalletIcon wallet={wallet} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-display ${wallet.detected ? brand.textClass : 'text-muted-foreground'}`}>
                        {wallet.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {wallet.detected ? t('walletUI.detected') : t('walletUI.notInstalled')}
                      </div>
                    </div>
                    {wallet.detected && (
                      <div className={`w-2.5 h-2.5 rounded-full animate-pulse`} style={{ backgroundColor: brand.primaryColor }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
            
            {/* WalletConnect 扫码连接 */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <motion.button
                onClick={() => {
                  setShowWalletSelector(false);
                  connectWalletConnect();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all border bg-[#3B99FC]/10 border-[#3B99FC]/60 shadow-[0_0_12px_rgba(59,153,252,0.3)] hover:opacity-90 cursor-pointer"
              >
                <div className="flex-shrink-0">
                  <WalletConnectIcon size={28} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-display text-[#3B99FC] flex items-center gap-2">
                    WalletConnect
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3B99FC]/20 text-[#3B99FC]">
                      {t('walletUI.scan')}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    {t('walletUI.mobileWallet')}
                  </div>
                </div>
                <QrCode className="w-5 h-5 text-[#3B99FC]" />
              </motion.button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
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
          className="neon-border-pink rounded-lg p-4 bg-destructive/10"
        >
          <p className="text-destructive text-sm">{error}</p>
          <button
            onClick={() => setShowWalletSelector(true)}
            className="mt-2 text-sm text-neon-blue hover:underline"
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
        className="cyber-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-neon-green">{t('wallet.connected')}</span>
            {walletInfo && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <WalletIcon wallet={walletInfo} size="sm" />
                {walletInfo.name.split(' ')[0]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                disconnect();
                setTimeout(() => setShowWalletSelector(true), 100);
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground hover:text-neon-cyan hover:bg-muted transition-colors"
            >
              <Wallet className="w-3 h-3" />
              {t('walletUI.switch')}
            </button>
            <button
              onClick={disconnect}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted/50 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              {t('wallet.disconnect')}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-center justify-between">
            <span className="font-display text-lg neon-text-cyan">
              {shortenAddress(address)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={copyAddress}
                className="p-1.5 rounded hover:bg-muted transition-colors"
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={openBscScan}
                className="p-1.5 rounded hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Balances */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="neon-border rounded-lg p-2.5 bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">{t('walletUI.bnbBalance')}</div>
                <div className="font-display text-neon-yellow text-sm">
                  {Number(balance).toFixed(4)}
                </div>
              </div>
              <div className="neon-border-purple rounded-lg p-2.5 bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">{t('walletUI.tokenBalance')}</div>
                <div className="font-display text-neon-purple text-sm">
                  {tokenBalance >= 1000000 
                    ? `${(tokenBalance / 1000000).toFixed(1)}M`
                    : tokenBalance >= 1000
                    ? `${(tokenBalance / 1000).toFixed(0)}K`
                    : tokenBalance.toLocaleString()
                  }
                </div>
              </div>
            </div>
            
            {/* 游戏凭证 */}
            <div className="neon-border rounded-lg p-3 bg-gradient-to-r from-neon-cyan/10 to-neon-green/5 border-neon-cyan/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Ticket className="w-3.5 h-3.5 text-neon-cyan" />
                  {t('walletUI.gameCredits')}
                </div>
                <div className="text-xs text-neon-green">{t('walletUI.permanent')}</div>
              </div>
              <div className="font-display text-neon-cyan text-xl mt-1">
                {gameCredits >= 1000000 
                  ? `${(gameCredits / 1000000).toFixed(2)}M`
                  : gameCredits >= 1000
                  ? `${(gameCredits / 1000).toFixed(1)}K`
                  : Math.floor(gameCredits).toLocaleString()
                }
              </div>
              <div className="text-xs text-muted-foreground mt-1">
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
        className="cyber-button w-full flex items-center justify-center gap-2 rounded-lg"
      >
        {isConnecting ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
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
