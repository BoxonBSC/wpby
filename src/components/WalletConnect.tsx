import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, WalletType, WalletInfo } from '@/contexts/WalletContext';
import { Wallet, LogOut, Copy, ExternalLink, X, Smartphone, QrCode, Shield, Zap, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState, useCallback } from 'react';
import { getWalletBrand, WalletConnectIcon } from './WalletIcons';

function WalletIcon({ wallet, size = 'md' }: { wallet: WalletInfo; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 20, md: 32, lg: 40 };
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
  const [hoveredWallet, setHoveredWallet] = useState<WalletType | null>(null);

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

  // ━━━ Wallet Selector Modal ━━━
  const walletSelectorModal = (
    <AnimatePresence>
      {showWalletSelector && (
        <motion.div
          key="wallet-selector-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md"
          onClick={() => setShowWalletSelector(false)}
        >
          <motion.div
            key="wallet-selector-content"
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="w-full max-w-[420px] relative overflow-hidden rounded-t-3xl sm:rounded-3xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-t-3xl sm:rounded-3xl p-px bg-gradient-to-b from-violet-500/30 via-violet-500/10 to-transparent">
              <div className="w-full h-full rounded-t-3xl sm:rounded-3xl bg-[#0c0a14]" />
            </div>

            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-violet-600/[0.08] rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative p-6 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                      <Shield className="w-4.5 h-4.5 text-violet-400" />
                    </div>
                    连接钱包
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 ml-[46px]">选择你常用的钱包进行连接</p>
                </div>
                <button
                  onClick={() => setShowWalletSelector(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/[0.06] transition-colors text-neutral-500 hover:text-white"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Mobile drag handle */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/10 sm:hidden" />
              
              {/* Wallet grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {availableWallets.map((wallet, index) => {
                  const brand = getWalletBrand(wallet.id);
                  const isHovered = hoveredWallet === wallet.id;
                  const isDetected = wallet.detected;
                  
                  return (
                    <motion.button
                      key={wallet.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, type: 'spring', damping: 20 }}
                      onClick={() => handleWalletSelect(wallet.id)}
                      disabled={!isDetected && wallet.id !== 'metamask'}
                      onMouseEnter={() => setHoveredWallet(wallet.id)}
                      onMouseLeave={() => setHoveredWallet(null)}
                      className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 border group overflow-hidden ${
                        isDetected
                          ? 'bg-white/[0.03] border-white/[0.06] hover:border-violet-500/30 hover:bg-violet-500/[0.04] cursor-pointer'
                          : 'bg-white/[0.01] border-white/[0.03] opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {/* Hover glow */}
                      {isDetected && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          animate={isHovered ? {
                            boxShadow: `inset 0 0 30px ${brand.primaryColor}08, 0 0 20px ${brand.primaryColor}06`,
                          } : {
                            boxShadow: 'inset 0 0 0px transparent, 0 0 0px transparent',
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      {/* Icon container */}
                      <motion.div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isHovered && isDetected
                            ? `${brand.bgClass} border ${brand.borderClass}`
                            : 'bg-white/[0.04] border border-white/[0.06]'
                        }`}
                        animate={isHovered && isDetected ? { scale: 1.08, y: -2 } : { scale: 1, y: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                      >
                        <WalletIcon wallet={wallet} />
                      </motion.div>

                      {/* Name */}
                      <div className="text-center">
                        <div className={`text-sm font-medium transition-colors ${
                          isHovered && isDetected ? 'text-white' : 'text-neutral-300'
                        }`}>
                          {wallet.name.split(' ')[0]}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          {isDetected ? (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] text-emerald-400/70">已检测</span>
                            </>
                          ) : (
                            <span className="text-[10px] text-neutral-600">未安装</span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                <span className="text-[10px] text-neutral-600 uppercase tracking-widest">或</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              </div>

              {/* WalletConnect */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={handleWalletConnectClick}
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 bg-gradient-to-r from-[#3B99FC]/[0.06] to-[#3B99FC]/[0.02] border border-[#3B99FC]/15 hover:border-[#3B99FC]/30 hover:from-[#3B99FC]/[0.1] hover:to-[#3B99FC]/[0.04] group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#3B99FC]/10 border border-[#3B99FC]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <WalletConnectIcon size={28} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#3B99FC]">
                    WalletConnect
                  </div>
                  <div className="text-[11px] flex items-center gap-1.5 text-neutral-500 mt-0.5">
                    <Smartphone className="w-3 h-3" />
                    扫码连接手机钱包
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#3B99FC]/10 flex items-center justify-center group-hover:bg-[#3B99FC]/20 transition-colors">
                  <QrCode className="w-4 h-4 text-[#3B99FC]" />
                </div>
              </motion.button>

              {/* Security note */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-neutral-600">
                <Shield className="w-3 h-3" />
                <span>钱包连接由您的浏览器本地处理，不会泄露密钥</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ━━━ Error State ━━━
  if (error) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 bg-red-500/[0.06] border border-red-500/20 backdrop-blur-sm"
        >
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setShowWalletSelector(true)}
            className="mt-2 text-sm font-medium hover:underline text-violet-400"
          >
            重新选择钱包
          </button>
        </motion.div>
        {walletSelectorModal}
      </>
    );
  }

  // ━━━ Connected State ━━━
  if (isConnected && address) {
    const walletInfo = getConnectedWalletInfo();
    const brand = walletInfo ? getWalletBrand(walletInfo.id) : null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
      >
        {/* Subtle gradient border */}
        <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-b from-violet-500/20 via-white/[0.06] to-transparent">
          <div className="w-full h-full rounded-2xl bg-[#0c0a14]" />
        </div>

        <div className="relative p-5">
          {/* Top row: wallet info + actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400/50 animate-ping" />
              </motion.div>
              <span className="text-sm font-medium text-emerald-400">已连接</span>
              {walletInfo && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <WalletIcon wallet={walletInfo} size="sm" />
                  <span className="text-xs text-neutral-400">{walletInfo.name.split(' ')[0]}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { disconnect(); setTimeout(() => setShowWalletSelector(true), 100); }}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg transition-all bg-white/[0.04] border border-white/[0.06] text-neutral-400 hover:border-violet-500/30 hover:text-violet-400"
              >
                <Wallet className="w-3 h-3" />
                切换
              </button>
              <button
                onClick={disconnect}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg transition-all bg-red-500/[0.06] border border-red-500/15 text-red-400/80 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
              >
                <LogOut className="w-3 h-3" />
                断开
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-bold text-white tracking-wider">{shortenAddress(address)}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={copyAddress}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors group"
              >
                <Copy className="w-3.5 h-3.5 text-neutral-500 group-hover:text-violet-400 transition-colors" />
              </button>
              <button
                onClick={openBscScan}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors group"
              >
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-violet-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Balance card */}
          <div className="relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/[0.06] via-purple-500/[0.04] to-violet-500/[0.06]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />
            <div className="relative p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">BNB 余额</div>
                <div className="text-xl font-display font-bold text-white">
                  {Number(balance).toFixed(4)}
                  <span className="text-sm text-violet-400/50 font-medium ml-1.5">BNB</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-400" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ━━━ Disconnected State (CTA Button) ━━━
  return (
    <>
      <motion.button
        onClick={() => setShowWalletSelector(true)}
        disabled={isConnecting}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className="relative w-full overflow-hidden rounded-2xl font-bold text-base disabled:opacity-50 group"
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(168,85,247,0.8) 50%, rgba(139,92,246,0.9) 100%)',
              'linear-gradient(135deg, rgba(168,85,247,0.9) 0%, rgba(139,92,246,0.8) 50%, rgba(168,85,247,0.9) 100%)',
              'linear-gradient(135deg, rgba(139,92,246,0.9) 0%, rgba(168,85,247,0.8) 50%, rgba(139,92,246,0.9) 100%)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{
            background: [
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
            ],
            x: ['-100%', '100%'],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        />

        {/* Glow */}
        <div className="absolute inset-0 shadow-[0_0_30px_rgba(139,92,246,0.4)] rounded-2xl pointer-events-none group-hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-shadow duration-300" />
        
        <div className="relative flex items-center justify-center gap-2.5 py-4 text-white">
          {isConnecting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Wallet className="w-5 h-5" />
              </motion.div>
              <span>连接中...</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span>连接钱包</span>
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </div>
      </motion.button>
      {walletSelectorModal}
    </>
  );
}
