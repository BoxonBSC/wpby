import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, LogOut, Copy, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function WalletConnect() {
  const { address, isConnected, balance, tokenBalance, connect, disconnect, isConnecting, error } = useWallet();

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "已复制",
        description: "钱包地址已复制到剪贴板",
      });
    }
  };

  const openBscScan = () => {
    if (address) {
      window.open(`https://bscscan.com/address/${address}`, '_blank');
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="neon-border-pink rounded-lg p-4 bg-destructive/10"
      >
        <p className="text-destructive text-sm">{error}</p>
        <button
          onClick={connect}
          className="mt-2 text-sm text-neon-blue hover:underline"
        >
          重试连接
        </button>
      </motion.div>
    );
  }

  if (isConnected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-neon-green">已连接</span>
          </div>
          <button
            onClick={disconnect}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            断开
          </button>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="neon-border rounded-lg p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">BNB 余额</div>
              <div className="font-display text-neon-yellow">
                {Number(balance).toFixed(4)}
              </div>
            </div>
            <div className="neon-border-purple rounded-lg p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">代币余额</div>
              <div className="font-display text-neon-purple">
                {Number(tokenBalance).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={connect}
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
      {isConnecting ? '连接中...' : '连接钱包'}
    </motion.button>
  );
}
