import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Clock, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface VRFWaitingOverlayProps {
  isVisible: boolean;
  requestId: bigint;
  startTime: number;
  onCancel: () => Promise<boolean>;
}

export function VRFWaitingOverlay({
  isVisible,
  requestId,
  startTime,
  onCancel,
}: VRFWaitingOverlayProps) {
  const { t } = useLanguage();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // 计算等待时间
  useEffect(() => {
    if (!isVisible || startTime === 0) {
      setElapsedTime(0);
      return;
    }
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isVisible, startTime]);
  
  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 
      ? t('vrf.formatMin').replace('{min}', mins.toString()).replace('{sec}', secs.toString())
      : t('vrf.formatSec').replace('{sec}', secs.toString());
  };
  
  // 处理取消
  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      setIsCancelling(false);
    }
  };
  
  // 状态级别
  const getStatusLevel = () => {
    if (elapsedTime < 30) return 'normal';
    if (elapsedTime < 45) return 'warning';
    return 'timeout';
  };
  
  const statusLevel = getStatusLevel();
  const statusColors = {
    normal: { bg: 'rgba(255, 215, 0, 0.1)', border: '#FFD700', text: '#FFD700' },
    warning: { bg: 'rgba(255, 165, 0, 0.1)', border: '#FFA500', text: '#FFA500' },
    timeout: { bg: 'rgba(255, 100, 100, 0.1)', border: '#FF6464', text: '#FF6464' },
  };
  
  const colors = statusColors[statusLevel];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center z-20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="text-center p-6 rounded-2xl max-w-sm mx-4"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.98) 0%, rgba(15, 12, 8, 0.98) 100%)',
              border: `1px solid ${colors.border}40`,
            }}
          >
            {/* 动画图标 */}
            <div className="relative mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${colors.border}40, transparent)`,
                }}
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: colors.bg, border: `2px solid ${colors.border}60` }}
                >
                  {statusLevel === 'timeout' ? (
                    <AlertTriangle className="w-8 h-8" style={{ color: colors.text }} />
                  ) : (
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.text }} />
                  )}
                </div>
              </div>
            </div>
            
            {/* 标题 */}
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: colors.text }}
            >
              {statusLevel === 'timeout' ? t('vrf.timeout') : t('vrf.waiting')}
            </h3>
            
            {/* 描述 */}
            <p className="text-[#C9A347]/70 text-sm mb-4">
              {statusLevel === 'timeout' 
                ? t('vrf.maybeStuck')
                : t('vrf.generating')
              }
            </p>
            
            {/* 等待时间 */}
            <div 
              className="rounded-xl p-4 mb-4"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-5 h-5" style={{ color: colors.text }} />
                <span 
                  className="font-mono font-bold text-2xl"
                  style={{ color: colors.text }}
                >
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="mb-4">
              <div 
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(201, 163, 71, 0.1)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: colors.border }}
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: statusLevel === 'timeout' ? '100%' : `${Math.min((elapsedTime / 60) * 100, 95)}%` 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[10px] text-[#C9A347]/40 mt-1">
                {t('vrf.usually')}
              </p>
            </div>
            
            {/* 仅在超时时显示取消按钮 */}
            {statusLevel === 'timeout' && requestId > 0n && (
              <Button
                onClick={handleCancel}
                disabled={isCancelling}
                variant="outline"
                size="sm"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    {t('vrf.cancel')}
                  </>
                )}
              </Button>
            )}
            
            {/* 提示 */}
            {statusLevel !== 'timeout' && (
              <p className="text-[10px] text-[#C9A347]/30 mt-3">
                {t('vrf.doNotClose')}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
