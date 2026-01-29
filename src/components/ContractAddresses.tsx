import { motion } from 'framer-motion';
import { Copy, ExternalLink, FileCode } from 'lucide-react';
import { CYBER_SLOTS_ADDRESS, CYBER_TOKEN_ADDRESS } from '@/config/contracts';
import { toast } from 'sonner';

export function ContractAddresses() {
  const copyAddress = (address: string, name: string) => {
    navigator.clipboard.writeText(address);
    toast.success(`${name}地址已复制`);
  };

  const isDeployed = (address: string) => 
    address !== '0x0000000000000000000000000000000000000000';

  const formatAddress = (address: string) => 
    isDeployed(address) 
      ? `${address.slice(0, 10)}...${address.slice(-8)}`
      : '待部署...';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap justify-center gap-3 mt-3"
    >
      {/* 游戏合约 */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-neon-cyan/10 to-neon-blue/5 border border-neon-cyan/30 backdrop-blur-sm">
        <FileCode className="w-3.5 h-3.5 text-neon-cyan" />
        <span className="text-xs text-neon-cyan font-display">游戏合约:</span>
        <code className="text-xs text-foreground/80 font-mono">
          {formatAddress(CYBER_SLOTS_ADDRESS.mainnet)}
        </code>
        <div className="flex items-center gap-1">
          <button
            onClick={() => copyAddress(CYBER_SLOTS_ADDRESS.mainnet, '游戏合约')}
            className="p-1 hover:bg-neon-cyan/20 rounded transition-colors"
            title="复制地址"
          >
            <Copy className="w-3 h-3 text-muted-foreground hover:text-neon-cyan" />
          </button>
          {isDeployed(CYBER_SLOTS_ADDRESS.mainnet) && (
            <a
              href={`https://bscscan.com/address/${CYBER_SLOTS_ADDRESS.mainnet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-neon-cyan/20 rounded transition-colors"
              title="在BSCScan查看"
            >
              <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-neon-cyan" />
            </a>
          )}
        </div>
      </div>

      {/* 代币合约 */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-neon-yellow/10 to-neon-orange/5 border border-neon-yellow/30 backdrop-blur-sm">
        <span className="text-sm">🪙</span>
        <span className="text-xs text-neon-yellow font-display">CST代币:</span>
        <code className="text-xs text-foreground/80 font-mono">
          {formatAddress(CYBER_TOKEN_ADDRESS.mainnet)}
        </code>
        <div className="flex items-center gap-1">
          <button
            onClick={() => copyAddress(CYBER_TOKEN_ADDRESS.mainnet, '代币合约')}
            className="p-1 hover:bg-neon-yellow/20 rounded transition-colors"
            title="复制地址"
          >
            <Copy className="w-3 h-3 text-muted-foreground hover:text-neon-yellow" />
          </button>
          {isDeployed(CYBER_TOKEN_ADDRESS.mainnet) && (
            <a
              href={`https://bscscan.com/token/${CYBER_TOKEN_ADDRESS.mainnet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-neon-yellow/20 rounded transition-colors"
              title="在BSCScan查看"
            >
              <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-neon-yellow" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
