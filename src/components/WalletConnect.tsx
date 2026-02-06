import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, WalletType, WalletInfo } from '@/contexts/WalletContext';
import { Wallet, LogOut, Copy, ExternalLink, X, Smartphone, QrCode } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState, useCallback } from 'react';
import { getWalletBrand, WalletConnectIcon } from './WalletIcons';

function WalletIcon({ wallet, size = 'md' }: { wallet: WalletInfo; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 20, md: 28, lg: 36 };
  const brand = getWalletBrand(wallet.id);
  const IconComponent = brand.icon;
  return <IconComponent size={sizeMap[size]} />;
}

export function WalletConnect() {
  const { 
    address, isConnected, balance, connect, connectWalletConnect,
    disconnect, isConnecting, error, availableWallets, connectedWallet,
  } = useWallet();
  
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({ title: '已复制', description: '地址已复制到剪贴板' });
    }
  }, [address]);

  const openBscScan = useCallback(() => {
    if (address) window.open(`https://bscscan.com/address/${address}`, '_blank');
  }, [address]);

  const handleWalletSelect = useCallback(async (walletType: WalletType) => {
    setShowWalletSelector(false);
    await connect(walletType);
  }, [connect]);

  const handleWalletConnectClick = useCallback(() => {
    setShowWalletSelector(false);
    connectWalletConnect();
  }, [connectWalletConnect]);

  const getConnectedWalletInfo = () => availableWallets.find(w => w.id === connectedWallet);

  // 钱包选择弹窗 - 内联渲染，避免闪烁
  const walletSelectorModal = (
    <AnimatePresence>
      {showWalletSelector && (
        <motion.div
          key="wallet-selector-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowWalletSelector(false)}
        >
          <motion.div
            key="wallet-selector-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm relative p-5 rounded-2xl bg-stone-900 border border-stone-700"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWalletSelector(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-stone-400"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <Wallet className="w-5 h-5" />
              选择钱包
            </h3>
            
            <div className="space-y-2">
              {availableWallets.map(wallet => (
                <motion.button
                  key={wallet.id}
                  onClick={() => handleWalletSelect(wallet.id)}
                  disabled={!wallet.detected && wallet.id !== 'metamask'}
                  whileHover={{ scale: wallet.detected ? 1.02 : 1 }}
                  whileTap={{ scale: wallet.detected ? 0.98 : 1 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all bg-stone-800/50 border border-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <WalletIcon wallet={wallet} />
                  <div className="flex-1 text-left">
                    <div className="text-white">{wallet.name}</div>
                    <div className="text-xs text-slate-500">
                       {wallet.detected ? '已检测到' : '未安装'}
                    </div>
                  </div>
                  {wallet.detected && (
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-green-400" />
                  )}
                </motion.button>
              ))}
            </div>
            
            {/* WalletConnect */}
            <div className="mt-4 pt-4 border-t border-stone-700">
              <motion.button
                onClick={handleWalletConnectClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all bg-blue-500/10 border border-blue-500/30"
              >
                <WalletConnectIcon size={28} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 text-blue-400">
                    WalletConnect
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20">扫码</span>
                  </div>
                  <div className="text-xs flex items-center gap-1 text-stone-500">
                    <Smartphone className="w-3 h-3" />
                    手机钱包
                  </div>
                </div>
                <QrCode className="w-5 h-5 text-blue-400" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (error) {
    return (
      <>
        <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setShowWalletSelector(true)}
            className="mt-2 text-sm hover:underline text-violet-400"
          >
            重新选择钱包
          </button>
        </div>
        {walletSelectorModal}
      </>
    );
  }

  if (isConnected && address) {
    const walletInfo = getConnectedWalletInfo();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4 bg-stone-900/80 border border-stone-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full animate-pulse bg-green-400" />
            <span className="text-sm text-green-400">已连接</span>
            {walletInfo && (
              <span className="text-sm flex items-center gap-1 text-stone-400">
                <WalletIcon wallet={walletInfo} size="sm" />
                {walletInfo.name.split(' ')[0]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { disconnect(); setTimeout(() => setShowWalletSelector(true), 100); }}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors bg-stone-800 text-stone-300 hover:bg-stone-700"
            >
              <Wallet className="w-3 h-3" />
              切换
            </button>
            <button
              onClick={disconnect}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="w-3 h-3" />
              断开
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-mono text-white">{shortenAddress(address)}</span>
            <div className="flex gap-2">
              <button onClick={copyAddress} className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <Copy className="w-4 h-4 text-stone-400" />
              </button>
              <button onClick={openBscScan} className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <ExternalLink className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>

          <div className="rounded-xl p-3 bg-stone-800/50 border border-stone-700">
            <div className="text-xs text-stone-500 mb-1">BNB 余额</div>
            <div className="text-xl font-bold text-white">{Number(balance).toFixed(4)} BNB</div>
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
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25 disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Wallet className="w-5 h-5" />
            </motion.div>
            连接中...
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            连接钱包
          </>
        )}
      </motion.button>
      {walletSelectorModal}
    </>
  );
}
