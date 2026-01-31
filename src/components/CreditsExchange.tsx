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
      {/* 标题栏 */}
      <div 
        className="px-4 py-3 flex items-center gap-2"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 107, 53, 0.15) 0%, rgba(201, 163, 71, 0.1) 100%)',
          borderBottom: '1px solid rgba(201, 163, 71, 0.15)',
        }}
      >
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.3) 0%, rgba(255, 69, 0, 0.2) 100%)',
            border: '1px solid rgba(255, 107, 53, 0.4)',
          }}
        >
          <Flame className="w-4 h-4" style={{ color: '#FF6B35' }} />
        </div>
        <div>
          <h3 
            className="text-sm font-bold"
            style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}
          >
            {t('exchange.title')}
          </h3>
          <p className="text-[10px]" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>
            1:1 兑换 · 永久有效
          </p>
        </div>
      </div>

      {/* 说明区域 */}
      <div 
        className="px-4 py-3"
        style={{
          background: 'rgba(201, 163, 71, 0.03)',
          borderBottom: '1px solid rgba(201, 163, 71, 0.1)',
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <span style={{ color: '#FFD700' }}>•</span>
            <span className="text-[11px]" style={{ color: 'rgba(201, 163, 71, 0.8)' }}>
              <strong style={{ color: '#FFD700' }}>1代币 = 1凭证</strong>，销毁代币永久获得游戏凭证
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span style={{ color: '#FFD700' }}>•</span>
            <span className="text-[11px]" style={{ color: 'rgba(201, 163, 71, 0.8)' }}>
              凭证<strong style={{ color: '#FF6B35' }}>不可转让、不可买卖</strong>，绑定当前钱包
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span style={{ color: '#FFD700' }}>•</span>
            <span className="text-[11px]" style={{ color: 'rgba(201, 163, 71, 0.8)' }}>
              凭证<strong style={{ color: '#00FFC8' }}>专用于王牌博弈游戏</strong>，中奖直发BNB到钱包
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 余额卡片 */}
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="p-3 rounded-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 163, 71, 0.08) 0%, rgba(201, 163, 71, 0.02) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.2)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Coins className="w-3 h-3" style={{ color: '#C9A347' }} />
              <span className="text-[10px]" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>
                {t('exchange.tokenBalance')}
              </span>
            </div>
            <div 
              className="text-lg font-bold"
              style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}
            >
              {formatNumber(tokenBalanceNum)}
            </div>
          </div>
          
          <div 
            className="p-3 rounded-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 200, 0.08) 0%, rgba(0, 200, 150, 0.02) 100%)',
              border: '1px solid rgba(0, 255, 200, 0.2)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Ticket className="w-3 h-3" style={{ color: '#00FFC8' }} />
              <span className="text-[10px]" style={{ color: 'rgba(0, 255, 200, 0.7)' }}>
                {t('exchange.gameCredits')}
              </span>
            </div>
            <div 
              className="text-lg font-bold"
              style={{ fontFamily: '"Cinzel", serif', color: '#00FFC8' }}
            >
              {formatNumber(gameCreditsNum)}
            </div>
          </div>
        </div>

        {/* 金额选择 */}
        <div>
          <div className="text-[10px] mb-2" style={{ color: 'rgba(201, 163, 71, 0.5)' }}>
            选择兑换数量
          </div>
          <div className="grid grid-cols-4 gap-1.5">
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
                  className="py-2 px-1 rounded-lg text-xs transition-all"
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
                    boxShadow: isSelected ? '0 0 12px rgba(255, 107, 53, 0.2)' : 'none',
                  }}
                >
                  {formatNumber(amount)}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 兑换预览 - 简化版 */}
        <div 
          className="flex items-center justify-between p-3 rounded-xl"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(201, 163, 71, 0.1)',
          }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239, 68, 68, 0.2)' }}
            >
              <Coins className="w-3 h-3" style={{ color: '#EF4444' }} />
            </div>
            <div>
              <div className="text-xs" style={{ color: '#EF4444' }}>
                -{formatNumber(selectedAmount)}
              </div>
              <div className="text-[10px]" style={{ color: 'rgba(201, 163, 71, 0.5)' }}>
                代币
              </div>
            </div>
          </div>
          
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-4 h-4" style={{ color: 'rgba(201, 163, 71, 0.4)' }} />
          </motion.div>
          
          <div className="flex items-center gap-2">
            <div>
              <div className="text-xs text-right" style={{ color: '#00FFC8' }}>
                +{formatNumber(selectedAmount)}
              </div>
              <div className="text-[10px] text-right" style={{ color: 'rgba(0, 255, 200, 0.5)' }}>
                凭证
              </div>
            </div>
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0, 255, 200, 0.2)' }}
            >
              <Ticket className="w-3 h-3" style={{ color: '#00FFC8' }} />
            </div>
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
              : '0 4px 20px rgba(255, 107, 53, 0.4)',
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
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        
        {/* 提示 */}
        {!isConnected && (
          <p className="text-center text-[10px]" style={{ color: 'rgba(255, 200, 100, 0.6)' }}>
            请先连接钱包
          </p>
        )}
      </div>
    </div>
  );
}
