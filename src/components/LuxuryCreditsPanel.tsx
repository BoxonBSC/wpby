import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, ArrowRight, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { BET_LEVELS } from '@/config/contracts';
import { toast } from '@/hooks/use-toast';

interface LuxuryCreditsPanelProps {
  onBetChange?: (bet: number) => void;
  selectedBet: number;
}

export function LuxuryCreditsPanel({ onBetChange, selectedBet }: LuxuryCreditsPanelProps) {
  const { isConnected, gameCredits, burnTokensForCredits } = useWallet();
  const [showExchange, setShowExchange] = useState(false);
  const [buyAmount, setBuyAmount] = useState(10000);
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyCredits = async () => {
    if (!isConnected) {
      toast({
        title: '请先连接钱包',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await burnTokensForCredits(buyAmount);
      if (success) {
        toast({
          title: '兑换成功！',
          description: `已获得 ${buyAmount.toLocaleString()} 游戏凭证`,
        });
      }
    } catch (error) {
      toast({
        title: '购买失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* 凭证余额卡片 */}
      <div className="rounded-2xl bg-black/40 backdrop-blur-sm border border-primary/20 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs tracking-wider text-muted-foreground uppercase">
              游戏凭证
            </span>
            <Gem className="w-4 h-4 text-primary" />
          </div>
          
          <motion.div
            key={gameCredits}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-display text-shimmer"
          >
            {gameCredits.toLocaleString()}
          </motion.div>
          
          <p className="text-xs text-muted-foreground mt-1">
            ≈ {(gameCredits * 0.00001).toFixed(4)} BNB
          </p>
        </div>

        {/* 展开/收起充值 */}
        <button
          onClick={() => setShowExchange(!showExchange)}
          className="w-full px-4 py-2 border-t border-primary/10 flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <span>{showExchange ? '收起' : '充值凭证'}</span>
          {showExchange ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showExchange && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-t border-primary/10 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[10000, 50000, 100000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBuyAmount(amount)}
                      className={`
                        px-3 py-2 rounded-lg text-xs font-display transition-all
                        ${buyAmount === amount
                          ? 'bg-primary/20 border border-primary text-primary'
                          : 'bg-black/20 border border-border text-muted-foreground hover:border-primary/50'
                        }
                      `}
                    >
                      {(amount / 1000)}K
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>支付: {(buyAmount * 0.00001).toFixed(4)} BNB</span>
                  <ArrowRight className="w-3 h-3" />
                  <span>获得: {buyAmount.toLocaleString()} 凭证</span>
                </div>

                <motion.button
                  onClick={handleBuyCredits}
                  disabled={isLoading || !isConnected}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary/80 to-primary text-black font-display text-sm disabled:opacity-50"
                >
                  {isLoading ? '处理中...' : '立即充值'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 下注选择 */}
      <div className="rounded-2xl bg-black/40 backdrop-blur-sm border border-primary/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs tracking-wider text-muted-foreground uppercase">
            选择下注
          </span>
          <Wallet className="w-4 h-4 text-primary" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {BET_LEVELS.map((bet) => (
            <motion.button
              key={bet.value}
              onClick={() => onBetChange?.(bet.value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={gameCredits < bet.value}
              className={`
                relative p-3 rounded-xl transition-all overflow-hidden
                ${selectedBet === bet.value
                  ? 'bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary'
                  : 'bg-black/20 border border-border hover:border-primary/50'
                }
                ${gameCredits < bet.value ? 'opacity-40' : ''}
              `}
            >
              {selectedBet === bet.value && (
                <motion.div
                  className="absolute inset-0 bg-primary/10"
                  animate={{ opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <div className="relative">
                <div className={`font-display text-lg ${selectedBet === bet.value ? 'text-primary' : 'text-foreground'}`}>
                  {bet.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {bet.multiplier}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
