import { motion } from 'framer-motion';
import { Wrench, Clock, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function MaintenanceMode() {
  const { language } = useLanguage();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(180deg, #0f0c07 0%, #1a1611 50%, #0f0c07 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center"
      >
        {/* 维护图标 */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(201, 163, 71, 0.2) 0%, rgba(201, 163, 71, 0.05) 100%)',
            border: '2px solid rgba(201, 163, 71, 0.4)',
          }}
        >
          <Wrench className="w-12 h-12 text-[#C9A347]" />
        </motion.div>

        {/* 标题 */}
        <h1 
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ 
            fontFamily: 'Cinzel, serif',
            color: '#C9A347',
          }}
        >
          {language === 'zh' ? '系统维护中' : 'Under Maintenance'}
        </h1>

        {/* 副标题 */}
        <p className="text-lg text-[#C9A347]/70 mb-8">
          {language === 'zh' 
            ? '王牌博弈正在进行系统升级，敬请期待' 
            : 'Ace Gaming is undergoing system upgrades, please stay tuned'}
        </p>

        {/* 维护信息卡片 */}
        <div 
          className="rounded-2xl p-6 mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
            border: '1px solid rgba(201, 163, 71, 0.25)',
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-[#C9A347]" />
            <span className="text-[#C9A347]/80">
              {language === 'zh' ? '预计恢复时间' : 'Estimated Recovery'}
            </span>
          </div>
          <p className="text-2xl font-bold text-[#FFD700]">
            {language === 'zh' ? '即将恢复' : 'Coming Soon'}
          </p>
        </div>

        {/* 安全提示 */}
        <div className="flex items-center justify-center gap-2 text-[#C9A347]/50 text-sm">
          <Shield className="w-4 h-4" />
          <span>
            {language === 'zh' 
              ? '您的资产安全无忧，感谢您的耐心等待' 
              : 'Your assets are safe, thank you for your patience'}
          </span>
        </div>

        {/* 装饰性光效 */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: -1 }}
        >
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl"
            style={{ background: 'rgba(201, 163, 71, 0.05)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl"
            style={{ background: 'rgba(255, 215, 0, 0.03)' }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}
