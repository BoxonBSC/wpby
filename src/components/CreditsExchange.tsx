import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { useCyberSlots } from '@/hooks/useCyberSlots';
import { Flame, ArrowRight, Ticket, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const EXCHANGE_AMOUNTS = [100000, 500000, 1000000, 5000000];

export function CreditsExchange() {
  const { isConnected } = useWallet();
  const { tokenBalance, gameCredits, depositCredits, error: contractError, refreshData } = useCyberSlots();
  const { t } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState(EXCHANGE_AMOUNTS[1]);
  const [isExchanging, setIsExchanging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tokenBalanceNum = Number(tokenBalance);
  const gameCreditsNum = Number(gameCredits);

  const handleExchange = async () => {
    if (!isConnected) {
      toast({
        title: t('wallet.pleaseConnect'),
        variant: "destructive",
      });
      return;
    }

    if (tokenBalanceNum < selectedAmount) {
      toast({
        title: t('exchange.insufficientTokens'),
        description: t('exchange.needTokens').replace('{amount}', selectedAmount.toLocaleString()),
        variant: "destructive",
      });
      return;
    }

    setIsExchanging(true);
    
    try {
      const result = await depositCredits(selectedAmount);
      
      if (result.ok) {
        setShowSuccess(true);
        toast({
          title: `${t('exchange.success')} 🎉`,
          description: t('exchange.successDesc').replace('{amount}', selectedAmount.toLocaleString()),
        });
        setTimeout(() => setShowSuccess(false), 2000);
        await refreshData();
      } else {
        toast({
          title: t('exchange.failed'),
          description: result.error || contractError || t('exchange.checkAuth'),
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Exchange failed:', err);
      toast({
        title: t('exchange.failed'),
        description: contractError || t('exchange.checkAuth'),
        variant: "destructive",
      });
    }
    
    setIsExchanging(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-muted/40 to-muted/20 border border-border/50 p-4 backdrop-blur-sm">
      <h3 className="text-base font-display text-neon-orange mb-3 flex items-center gap-2">
        <Flame className="w-4 h-4" />
        {t('exchange.title')}
      </h3>

      {/* 说明 */}
      <div className="text-xs text-muted-foreground mb-4 p-2 rounded-lg bg-muted/20 border border-border/30">
        <p className="flex items-start gap-2">
          <AlertCircle className="w-3 h-3 mt-0.5 text-neon-yellow flex-shrink-0" />
          <span>{t('exchange.notice')}</span>
        </p>
      </div>

      {/* 当前余额 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-neon-purple/10 to-transparent border border-neon-purple/20 text-center">
          <div className="text-xs text-muted-foreground mb-1">{t('exchange.tokenBalance')}</div>
          <div className="text-neon-purple font-display">
            {formatNumber(tokenBalanceNum)}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-neon-cyan/10 to-transparent border border-neon-cyan/20 text-center">
          <div className="text-xs text-muted-foreground mb-1">{t('exchange.gameCredits')}</div>
          <div className="text-neon-cyan font-display flex items-center justify-center gap-1">
            <Ticket className="w-3 h-3" />
            {formatNumber(gameCreditsNum)}
          </div>
        </div>
      </div>

      {/* 兑换金额选择 */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {EXCHANGE_AMOUNTS.map((amount) => (
          <motion.button
            key={amount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedAmount(amount)}
            disabled={tokenBalanceNum < amount}
            className={`
              py-2 px-1 rounded-lg text-xs font-display transition-all
              ${selectedAmount === amount
                ? 'bg-neon-orange/20 text-neon-orange border-2 border-neon-orange/50'
                : tokenBalanceNum >= amount
                ? 'bg-muted/30 text-foreground/80 border border-border/30 hover:bg-muted/50'
                : 'bg-muted/10 text-muted-foreground/50 border border-border/20 cursor-not-allowed'
              }
            `}
          >
            {formatNumber(amount)}
          </motion.button>
        ))}
      </div>

      {/* 兑换预览 */}
      <div className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl bg-muted/20 border border-border/30">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">{t('exchange.burn')}</div>
          <div className="text-neon-red font-display text-lg">
            -{formatNumber(selectedAmount)}
          </div>
          <div className="text-xs text-muted-foreground">{t('exchange.token')}</div>
        </div>
        
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <ArrowRight className="w-6 h-6 text-neon-yellow" />
        </motion.div>
        
        <div className="text-center">
          <div className="text-xs text-muted-foreground">{t('exchange.get')}</div>
          <div className="text-neon-green font-display text-lg flex items-center gap-1">
            <Ticket className="w-4 h-4" />
            +{formatNumber(selectedAmount)}
          </div>
          <div className="text-xs text-muted-foreground">{t('exchange.credit')}</div>
        </div>
      </div>

      {/* 兑换按钮 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExchange}
        disabled={isExchanging || tokenBalanceNum < selectedAmount || !isConnected}
        className={`
          w-full py-3 rounded-xl font-display text-sm transition-all relative overflow-hidden
          ${isExchanging || tokenBalanceNum < selectedAmount || !isConnected
            ? 'bg-muted/30 text-muted-foreground cursor-not-allowed'
            : 'bg-gradient-to-r from-neon-orange/20 to-neon-red/20 text-neon-orange border border-neon-orange/50 hover:shadow-[0_0_20px_hsl(25_100%_55%/0.3)]'
          }
        `}
      >
        <AnimatePresence mode="wait">
          {isExchanging ? (
            <motion.span
              key="exchanging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Flame className="w-4 h-4" />
              </motion.span>
              {t('exchange.burning')}
            </motion.span>
          ) : showSuccess ? (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-neon-green"
            >
              <CheckCircle className="w-4 h-4" />
              {t('exchange.success')}
            </motion.span>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4" />
              {t('exchange.button')}
              <Sparkles className="w-4 h-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
