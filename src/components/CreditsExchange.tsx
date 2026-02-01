import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { useCyberHiLo } from '@/hooks/useCyberHiLo';
import { Flame, ArrowDown, Ticket, CheckCircle, Coins, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

// 最小兑换金额
const MIN_AMOUNT = 100000; // 10万起

export function CreditsExchange() {
  const { isConnected } = useWallet();
  const { tokenBalance, gameCredits, depositCredits, error: contractError, refreshData } = useCyberHiLo();
  
  const { t } = useLanguage();
  const [amount, setAmount] = useState(MIN_AMOUNT);
  const [isExchanging, setIsExchanging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const tokenBalanceNum = Number(tokenBalance);
  const gameCreditsNum = Number(gameCredits);
  
  // 滑块的最大值 = 用户余额（上不封顶）
  const maxAmount = useMemo(() => {
    return Math.max(tokenBalanceNum, MIN_AMOUNT);
  }, [tokenBalanceNum]);

  // 滑块百分比（基于最小-最大区间）
  const sliderPercent = useMemo(() => {
    if (maxAmount <= MIN_AMOUNT) return 0;
    return Math.min(((amount - MIN_AMOUNT) / (maxAmount - MIN_AMOUNT)) * 100, 100);
  }, [amount, maxAmount]);

  const canExchange = isConnected && amount >= MIN_AMOUNT && amount <= tokenBalanceNum;

  const handleExchange = async () => {
    if (!canExchange) {
      if (!isConnected) {
        toast({ title: t('wallet.pleaseConnect'), variant: "destructive" });
      } else if (amount > tokenBalanceNum) {
        toast({ title: t('exchange.insufficientTokens'), variant: "destructive" });
      }
      return;
    }

    setIsExchanging(true);
    
    try {
      const result = await depositCredits(amount);
      
      if (result.ok) {
        setShowSuccess(true);
        toast({
          title: `${t('exchange.success')} 🎉`,
          description: t('exchange.successDesc').replace('{amount}', amount.toLocaleString()),
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

  const formatFullNumber = (num: number) => {
    return num.toLocaleString();
  };

  // 快捷选择 - 预设金额 + 百分比
  const quickSelects = useMemo(() => {
    const presets = [
      { label: '100K', value: 100000 },
      { label: '500K', value: 500000 },
      { label: '1M', value: 1000000 },
      { label: '5M', value: 5000000 },
      { label: '10M', value: 10000000 },
      { label: 'MAX', value: Math.floor(tokenBalanceNum) },
    ];
    // 过滤掉超过余额的预设（除了MAX）
    return presets.filter(p => p.label === 'MAX' || p.value <= tokenBalanceNum);
  }, [tokenBalanceNum]);

  return (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(20, 18, 15, 0.98) 0%, rgba(12, 10, 8, 0.99) 100%)',
        border: '1px solid rgba(201, 163, 71, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* 顶部装饰条 */}
      <div 
        className="h-1"
        style={{
          background: 'linear-gradient(90deg, #C9A347 0%, #FFD700 50%, #C9A347 100%)',
        }}
      />

      <div className="p-4 space-y-4">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.3) 0%, rgba(201, 163, 71, 0.2) 100%)',
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
              <p className="text-[10px]" style={{ color: 'rgba(201, 163, 71, 0.5)' }}>
                销毁代币 → 永久凭证
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#FFD700' }} />
          </motion.div>
        </div>

        {/* 代币卡片 → 凭证卡片 垂直布局 */}
        <div className="relative">
          {/* 代币余额卡片 */}
          <motion.div 
            className="relative z-10 p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 163, 71, 0.12) 0%, rgba(201, 163, 71, 0.04) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.25)',
            }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4" style={{ color: '#C9A347' }} />
                <span className="text-[11px]" style={{ color: 'rgba(201, 163, 71, 0.7)' }}>
                  {t('exchange.tokenBalance')}
                </span>
              </div>
              <div 
                className="text-lg font-bold"
                style={{ fontFamily: '"Cinzel", serif', color: '#FFD700' }}
              >
                {formatFullNumber(tokenBalanceNum)}
              </div>
            </div>
          </motion.div>

          {/* 转换箭头 */}
          <div className="flex justify-center -my-2 relative z-20">
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #1a1612 0%, #0f0c08 100%)',
                border: '2px solid rgba(255, 107, 53, 0.5)',
                boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)',
              }}
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowDown className="w-5 h-5" style={{ color: '#FF6B35' }} />
            </motion.div>
          </div>

          {/* 凭证余额卡片 */}
          <motion.div 
            className="relative z-10 p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 200, 0.12) 0%, rgba(0, 200, 150, 0.04) 100%)',
              border: '1px solid rgba(0, 255, 200, 0.25)',
            }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" style={{ color: '#00FFC8' }} />
                <span className="text-[11px]" style={{ color: 'rgba(0, 255, 200, 0.7)' }}>
                  {t('exchange.gameCredits')}
                </span>
              </div>
              <div 
                className="text-lg font-bold"
                style={{ fontFamily: '"Cinzel", serif', color: '#00FFC8' }}
              >
                {formatFullNumber(gameCreditsNum)}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 兑换金额选择 - 滑块式 */}
        <div 
          className="p-3 rounded-xl space-y-3"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(201, 163, 71, 0.15)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: 'rgba(201, 163, 71, 0.6)' }}>
              兑换数量 <span style={{ color: 'rgba(201, 163, 71, 0.4)' }}>(最低10万)</span>
            </span>
            <div 
              className="text-base font-bold px-3 py-1 rounded-lg"
              style={{ 
                fontFamily: '"Cinzel", serif', 
                color: '#FFD700',
                background: 'rgba(201, 163, 71, 0.1)',
                border: '1px solid rgba(201, 163, 71, 0.2)',
              }}
            >
              {formatFullNumber(amount)}
            </div>
          </div>

          {/* 自定义滑块 */}
          <div className="relative h-8 flex items-center">
            <div 
              className="absolute inset-x-0 h-2 rounded-full"
              style={{
                background: 'rgba(201, 163, 71, 0.1)',
                border: '1px solid rgba(201, 163, 71, 0.15)',
              }}
            />
            <motion.div 
              className="absolute left-0 h-2 rounded-full"
              style={{
                width: `${sliderPercent}%`,
                background: 'linear-gradient(90deg, #C9A347 0%, #FFD700 100%)',
                boxShadow: '0 0 10px rgba(201, 163, 71, 0.4)',
              }}
            />
            <input
              type="range"
              min={MIN_AMOUNT}
              max={maxAmount}
              step={10000}
              value={amount}
              onChange={(e) => setAmount(Math.max(MIN_AMOUNT, Number(e.target.value)))}
              className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer"
            />
            {/* 滑块手柄 */}
            <motion.div
              className="absolute w-5 h-5 rounded-full pointer-events-none"
              style={{
                left: `calc(${sliderPercent}% - 10px)`,
                background: 'linear-gradient(135deg, #FFD700 0%, #C9A347 100%)',
                border: '2px solid #1a1612',
                boxShadow: '0 0 15px rgba(201, 163, 71, 0.5), 0 2px 8px rgba(0,0,0,0.4)',
              }}
              whileHover={{ scale: 1.2 }}
            />
          </div>

          {/* 快捷按钮 */}
          <div className="flex flex-wrap gap-2">
            {quickSelects.map((q) => (
              <motion.button
                key={q.label}
                onClick={() => q.value >= MIN_AMOUNT && setAmount(q.value)}
                disabled={q.value < MIN_AMOUNT}
                whileHover={{ scale: q.value >= MIN_AMOUNT ? 1.05 : 1 }}
                whileTap={{ scale: q.value >= MIN_AMOUNT ? 0.95 : 1 }}
                className="flex-1 min-w-[50px] py-1.5 rounded-md text-[10px] font-medium transition-all"
                style={{
                  background: amount === q.value 
                    ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.3) 0%, rgba(201, 163, 71, 0.2) 100%)'
                    : 'rgba(201, 163, 71, 0.08)',
                  color: amount === q.value ? '#FF6B35' : q.value >= MIN_AMOUNT ? '#C9A347' : 'rgba(201, 163, 71, 0.3)',
                  border: amount === q.value 
                    ? '1px solid rgba(255, 107, 53, 0.5)'
                    : '1px solid rgba(201, 163, 71, 0.15)',
                  cursor: q.value >= MIN_AMOUNT ? 'pointer' : 'not-allowed',
                }}
              >
                {q.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 兑换按钮 */}
        <motion.button
          whileHover={{ scale: canExchange ? 1.02 : 1 }}
          whileTap={{ scale: canExchange ? 0.98 : 1 }}
          onClick={handleExchange}
          disabled={isExchanging || !canExchange}
          className="w-full py-3 rounded-xl text-sm font-bold relative overflow-hidden"
          style={{
            fontFamily: '"Cinzel", serif',
            background: !canExchange
              ? 'rgba(201, 163, 71, 0.08)'
              : 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)',
            color: !canExchange ? 'rgba(201, 163, 71, 0.4)' : '#FFF',
            border: !canExchange
              ? '1px solid rgba(201, 163, 71, 0.15)'
              : '1px solid rgba(255, 107, 53, 0.8)',
            cursor: !canExchange ? 'not-allowed' : 'pointer',
            boxShadow: canExchange ? '0 4px 20px rgba(255, 107, 53, 0.4)' : 'none',
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
                {!isConnected ? '请先连接钱包' : amount > tokenBalanceNum ? '余额不足' : t('exchange.button')}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* 提示信息 */}
        <div 
          className="flex items-center justify-center gap-4 py-2"
          style={{ borderTop: '1px solid rgba(201, 163, 71, 0.1)' }}
        >
          <span className="text-[9px]" style={{ color: 'rgba(201, 163, 71, 0.5)' }}>
            🔥 销毁不可逆
          </span>
          <span className="text-[9px]" style={{ color: 'rgba(201, 163, 71, 0.5)' }}>
            🎟️ 1:1 兑换
          </span>
          <span className="text-[9px]" style={{ color: 'rgba(201, 163, 71, 0.5)' }}>
            💰 中奖领BNB
          </span>
        </div>
      </div>
    </div>
  );
}
