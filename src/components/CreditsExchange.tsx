import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { useCyberSlots } from '@/hooks/useCyberSlots';
import { Flame, ArrowRight, Ticket, CheckCircle, Coins } from 'lucide-react';
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
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(30, 24, 18, 0.98) 0%, rgba(15, 12, 8, 0.98) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.25)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 215, 0, 0.1)',
      }}
    >
      {/* 标题栏 - 紧凑型 */}
      <div 
        className="px-3 py-2 flex items-center justify-between"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 107, 53, 0.15) 0%, rgba(201, 163, 71, 0.1) 100%)',
          borderBottom: '1px solid rgba(201, 163, 71, 0.15)',
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.3) 0%, rgba(255, 69, 0, 0.2) 100%)',
              border: '1px solid rgba(255, 107, 53, 0.4)',
            }}
          >
            <Flame className="w-3 h-3" style={{ color: '#FF6B35' }} />
          </div>
          <h3 
            className="text-xs font-bold"
            style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}
          >
            {t('exchange.title')}
          </h3>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ 
          background: 'rgba(201, 163, 71, 0.1)', 
          color: 'rgba(201, 163, 71, 0.6)',
          border: '1px solid rgba(201, 163, 71, 0.15)'
        }}>
          1:1 兑换
        </span>
      </div>

      {/* 说明区域 - 单行紧凑 */}
      <div 
        className="px-3 py-1.5 flex flex-wrap gap-x-3 gap-y-1"
        style={{
          background: 'rgba(201, 163, 71, 0.03)',
          borderBottom: '1px solid rgba(201, 163, 71, 0.1)',
        }}
      >
        <span className="text-[10px]" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>
          <strong style={{ color: '#FFD700' }}>销毁代币</strong>=永久凭证
        </span>
        <span className="text-[10px]" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>
          <strong style={{ color: '#FF6B35' }}>不可转让</strong>
        </span>
        <span className="text-[10px]" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>
          中奖<strong style={{ color: '#00FFC8' }}>手动领取</strong>BNB
        </span>
      </div>

      <div className="p-3 space-y-3">
        {/* 余额卡片 - 更紧凑 */}
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="p-2 rounded-lg relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 163, 71, 0.08) 0%, rgba(201, 163, 71, 0.02) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.2)',
            }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Coins className="w-2.5 h-2.5" style={{ color: '#C9A347' }} />
              <span className="text-[9px]" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>
                {t('exchange.tokenBalance')}
              </span>
            </div>
            <div 
              className="text-base font-bold"
              style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}
            >
              {formatNumber(tokenBalanceNum)}
            </div>
          </div>
          
          <div 
            className="p-2 rounded-lg relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 200, 0.08) 0%, rgba(0, 200, 150, 0.02) 100%)',
              border: '1px solid rgba(0, 255, 200, 0.2)',
            }}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Ticket className="w-2.5 h-2.5" style={{ color: '#00FFC8' }} />
              <span className="text-[9px]" style={{ color: 'rgba(0, 255, 200, 0.7)' }}>
                {t('exchange.gameCredits')}
              </span>
            </div>
            <div 
              className="text-base font-bold"
              style={{ fontFamily: '"Cinzel", serif', color: '#00FFC8' }}
            >
              {formatNumber(gameCreditsNum)}
            </div>
          </div>
        </div>

        {/* 金额选择 - 更紧凑 */}
        <div className="grid grid-cols-4 gap-1">
          {EXCHANGE_AMOUNTS.map((amount) => {
            const canAfford = tokenBalanceNum >= amount;
            const isSelected = selectedAmount === amount;
            
            return (
              <motion.button
                key={amount}
                whileHover={{ scale: canAfford ? 1.05 : 1 }}
                whileTap={{ scale: canAfford ? 0.95 : 1 }}
                onClick={() => canAfford && setSelectedAmount(amount)}
                disabled={!canAfford}
                className="py-1.5 px-1 rounded-md text-[11px] transition-all"
                style={{
                  fontFamily: '"Cinzel", serif',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.25) 0%, rgba(255, 69, 0, 0.15) 100%)'
                    : canAfford
                    ? 'rgba(201, 163, 71, 0.08)'
                    : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected
                    ? '#FF6B35'
                    : canAfford
                    ? '#C9A347'
                    : 'rgba(201, 163, 71, 0.3)',
                  border: isSelected
                    ? '1px solid rgba(255, 107, 53, 0.6)'
                    : '1px solid rgba(201, 163, 71, 0.15)',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  boxShadow: isSelected ? '0 0 8px rgba(255, 107, 53, 0.2)' : 'none',
                }}
              >
                {formatNumber(amount)}
              </motion.button>
            );
          })}
        </div>

        {/* 兑换预览 - 极简版 */}
        <div 
          className="flex items-center justify-center gap-3 py-2 px-3 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(201, 163, 71, 0.1)',
          }}
        >
          <span className="text-xs" style={{ color: '#EF4444' }}>
            -{formatNumber(selectedAmount)} 代币
          </span>
          <motion.div
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-3.5 h-3.5" style={{ color: 'rgba(201, 163, 71, 0.4)' }} />
          </motion.div>
          <span className="text-xs" style={{ color: '#00FFC8' }}>
            +{formatNumber(selectedAmount)} 凭证
          </span>
        </div>

        {/* 兑换按钮 - 更紧凑 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExchange}
          disabled={isExchanging || tokenBalanceNum < selectedAmount || !isConnected}
          className="w-full py-2.5 rounded-lg text-xs transition-all relative overflow-hidden"
          style={{
            fontFamily: '"Cinzel", serif',
            background: isExchanging || tokenBalanceNum < selectedAmount || !isConnected
              ? 'rgba(201, 163, 71, 0.1)'
              : 'linear-gradient(135deg, rgba(255, 107, 53, 0.9) 0%, rgba(255, 69, 0, 0.8) 100%)',
            color: isExchanging || tokenBalanceNum < selectedAmount || !isConnected
              ? 'rgba(201, 163, 71, 0.4)'
              : '#FFF',
            border: isExchanging || tokenBalanceNum < selectedAmount || !isConnected
              ? '1px solid rgba(201, 163, 71, 0.2)'
              : '1px solid rgba(255, 107, 53, 0.8)',
            cursor: isExchanging || tokenBalanceNum < selectedAmount || !isConnected
              ? 'not-allowed'
              : 'pointer',
            boxShadow: isExchanging || tokenBalanceNum < selectedAmount || !isConnected
              ? 'none'
              : '0 4px 16px rgba(255, 107, 53, 0.3)',
          }}
        >
          <AnimatePresence mode="wait">
            {isExchanging ? (
              <motion.span
                key="exchanging"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-1.5"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Flame className="w-3.5 h-3.5" />
                </motion.span>
                {t('exchange.burning')}
              </motion.span>
            ) : showSuccess ? (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-1.5"
                style={{ color: '#00FFC8' }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {t('exchange.success')}
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                {t('exchange.button')}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        
        {/* 提示 */}
        {!isConnected && (
          <p className="text-center text-[9px]" style={{ color: 'rgba(255, 200, 100, 0.6)' }}>
            请先连接钱包
          </p>
        )}
      </div>
    </div>
  );
}
