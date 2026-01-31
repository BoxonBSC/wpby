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
      toast({ title: t('wallet.pleaseConnect'), variant: "destructive" });
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
    <div 
      className="rounded-2xl p-4 backdrop-blur-sm"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.95) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.3)',
        boxShadow: '0 0 20px rgba(201, 163, 71, 0.1)',
      }}
    >
      <h3 
        className="text-base mb-3 flex items-center gap-2"
        style={{ fontFamily: '"Cinzel", serif', color: '#FF6B35' }}
      >
        <Flame className="w-4 h-4" />
        {t('exchange.title')}
      </h3>

      {/* 说明 */}
      <div 
        className="text-xs mb-4 p-2 rounded-lg"
        style={{
          background: 'rgba(201, 163, 71, 0.05)',
          border: '1px solid rgba(201, 163, 71, 0.2)',
          color: 'rgba(201, 163, 71, 0.7)',
        }}
      >
        <p className="flex items-start gap-2">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#FFD700' }} />
          <span>{t('exchange.notice')}</span>
        </p>
      </div>

      {/* 当前余额 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div 
          className="p-2.5 rounded-xl text-center"
          style={{
            background: 'linear-gradient(180deg, rgba(201, 163, 71, 0.1) 0%, transparent 100%)',
            border: '1px solid rgba(201, 163, 71, 0.2)',
          }}
        >
          <div className="text-xs mb-1" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>{t('exchange.tokenBalance')}</div>
          <div style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}>
            {formatNumber(tokenBalanceNum)}
          </div>
        </div>
        <div 
          className="p-2.5 rounded-xl text-center"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 255, 200, 0.1) 0%, transparent 100%)',
            border: '1px solid rgba(0, 255, 200, 0.2)',
          }}
        >
          <div className="text-xs mb-1" style={{ color: 'rgba(0, 255, 200, 0.6)' }}>{t('exchange.gameCredits')}</div>
          <div className="flex items-center justify-center gap-1" style={{ fontFamily: '"Cinzel", serif', color: '#00FFC8' }}>
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
            className="py-2 px-1 rounded-lg text-xs transition-all"
            style={{
              fontFamily: '"Cinzel", serif',
              background: selectedAmount === amount
                ? 'rgba(255, 107, 53, 0.2)'
                : tokenBalanceNum >= amount
                ? 'rgba(201, 163, 71, 0.1)'
                : 'rgba(255, 255, 255, 0.02)',
              color: selectedAmount === amount
                ? '#FF6B35'
                : tokenBalanceNum >= amount
                ? '#C9A347'
                : 'rgba(201, 163, 71, 0.3)',
              border: selectedAmount === amount
                ? '2px solid rgba(255, 107, 53, 0.5)'
                : '1px solid rgba(201, 163, 71, 0.2)',
              cursor: tokenBalanceNum >= amount ? 'pointer' : 'not-allowed',
              opacity: tokenBalanceNum >= amount ? 1 : 0.5,
            }}
          >
            {formatNumber(amount)}
          </motion.button>
        ))}
      </div>

      {/* 兑换预览 */}
      <div 
        className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl"
        style={{
          background: 'rgba(201, 163, 71, 0.05)',
          border: '1px solid rgba(201, 163, 71, 0.2)',
        }}
      >
        <div className="text-center">
          <div className="text-xs" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>{t('exchange.burn')}</div>
          <div className="text-lg" style={{ fontFamily: '"Cinzel", serif', color: '#EF4444' }}>
            -{formatNumber(selectedAmount)}
          </div>
          <div className="text-xs" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>{t('exchange.token')}</div>
        </div>
        
        <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
          <ArrowRight className="w-6 h-6" style={{ color: '#FFD700' }} />
        </motion.div>
        
        <div className="text-center">
          <div className="text-xs" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>{t('exchange.get')}</div>
          <div className="text-lg flex items-center gap-1" style={{ fontFamily: '"Cinzel", serif', color: '#00FFC8' }}>
            <Ticket className="w-4 h-4" />
            +{formatNumber(selectedAmount)}
          </div>
          <div className="text-xs" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>{t('exchange.credit')}</div>
        </div>
      </div>

      {/* 兑换按钮 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExchange}
        disabled={isExchanging || tokenBalanceNum < selectedAmount || !isConnected}
        className="w-full py-3 rounded-xl text-sm transition-all relative overflow-hidden"
        style={{
          fontFamily: '"Cinzel", serif',
          background: isExchanging || tokenBalanceNum < selectedAmount || !isConnected
            ? 'rgba(201, 163, 71, 0.1)'
            : 'linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
          color: isExchanging || tokenBalanceNum < selectedAmount || !isConnected
            ? 'rgba(201, 163, 71, 0.4)'
            : '#FF6B35',
          border: isExchanging || tokenBalanceNum < selectedAmount || !isConnected
            ? '1px solid rgba(201, 163, 71, 0.2)'
            : '1px solid rgba(255, 107, 53, 0.5)',
          cursor: isExchanging || tokenBalanceNum < selectedAmount || !isConnected
            ? 'not-allowed'
            : 'pointer',
          boxShadow: isExchanging || tokenBalanceNum < selectedAmount || !isConnected
            ? 'none'
            : '0 0 20px rgba(255, 107, 53, 0.2)',
        }}
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
              className="flex items-center justify-center gap-2"
              style={{ color: '#00FFC8' }}
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
