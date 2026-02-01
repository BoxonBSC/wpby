import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SuccessAnimationProps {
  amount: number;
  onComplete?: () => void;
}

export function SuccessAnimation({ amount, onComplete }: SuccessAnimationProps) {
  const { t } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(true);
  const [displayAmount, setDisplayAmount] = useState(0);

  // 数字跳动动画
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = amount / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= amount) {
        setDisplayAmount(amount);
        clearInterval(timer);
      } else {
        setDisplayAmount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [amount]);

  // 3秒后关闭彩带
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      {/* 金光爆发背景 */}
      <motion.div
        className="absolute inset-0 -m-8 rounded-2xl overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* 放射状光线 */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(255, 215, 0, 0.3), transparent, rgba(255, 215, 0, 0.3), transparent)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* 中心光晕 */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.4) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* 飞入的金币粒子 */}
      <AnimatePresence>
        {showConfetti && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{
                  x: (Math.random() - 0.5) * 400,
                  y: -100 - Math.random() * 100,
                  opacity: 0,
                  scale: 0,
                  rotate: Math.random() * 360,
                }}
                animate={{
                  x: 0,
                  y: 0,
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.5, 1, 0],
                  rotate: Math.random() * 720,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                💰
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* 主内容 */}
      <motion.div
        className="relative z-10 p-6 rounded-2xl overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 200, 0.15) 0%, rgba(0, 200, 150, 0.1) 100%)',
          border: '2px solid rgba(0, 255, 200, 0.6)',
          boxShadow: '0 0 40px rgba(0, 255, 200, 0.4), inset 0 0 30px rgba(0, 255, 200, 0.1)',
        }}
      >
        {/* 扫光效果 */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(90deg, transparent 0%, rgba(0, 255, 200, 0.3) 50%, transparent 100%)',
              'linear-gradient(90deg, transparent 0%, rgba(0, 255, 200, 0.3) 50%, transparent 100%)',
            ],
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'easeInOut',
          }}
        />

        {/* 成功图标 */}
        <motion.div
          className="flex justify-center mb-3"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, delay: 0.2 }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(0, 255, 200, 0.3)' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00FFC8 0%, #00D4A8 100%)',
                boxShadow: '0 0 30px rgba(0, 255, 200, 0.6)',
              }}
            >
              <CheckCircle className="w-10 h-10 text-black" />
            </div>
          </div>
        </motion.div>

        {/* 标题 */}
        <motion.div
          className="text-center mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00FFC8]" />
            <span 
              className="text-xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #00FFC8 0%, #00FF88 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('success.arrived')}
            </span>
            <Sparkles className="w-5 h-5 text-[#00FFC8]" />
          </div>
        </motion.div>

        {/* 金额显示 - 数字跳动 */}
        <motion.div
          className="text-center mb-3"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.4 }}
        >
          <motion.div 
            className="text-4xl font-bold"
            style={{
              color: '#00FFC8',
              textShadow: '0 0 20px rgba(0, 255, 200, 0.8), 0 0 40px rgba(0, 255, 200, 0.4)',
            }}
            animate={{
              textShadow: [
                '0 0 20px rgba(0, 255, 200, 0.8), 0 0 40px rgba(0, 255, 200, 0.4)',
                '0 0 30px rgba(0, 255, 200, 1), 0 0 60px rgba(0, 255, 200, 0.6)',
                '0 0 20px rgba(0, 255, 200, 0.8), 0 0 40px rgba(0, 255, 200, 0.4)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            +{displayAmount.toFixed(4)} BNB
          </motion.div>
          <motion.p
            className="text-[#C9A347]/80 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {t('success.afterFee')}
          </motion.p>
        </motion.div>

        {/* 提示信息 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-[#00FFC8]/70 text-xs px-4 py-2 rounded-lg bg-[#00FFC8]/10">
            {t('success.autoTransfer')}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
