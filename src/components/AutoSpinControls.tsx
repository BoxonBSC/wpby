import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Settings, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AutoSpinControlsProps {
  isAutoSpinning: boolean;
  remainingSpins: number;
  onStartAutoSpin: (count: number) => void;
  onStopAutoSpin: () => void;
  disabled: boolean;
  playClickSound: () => void;
}

const SPIN_OPTIONS = [10, 25, 50, 100];

export function AutoSpinControls({
  isAutoSpinning,
  remainingSpins,
  onStartAutoSpin,
  onStopAutoSpin,
  disabled,
  playClickSound,
}: AutoSpinControlsProps) {
  const { t } = useLanguage();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedCount, setSelectedCount] = useState(10);

  const handleToggleOptions = () => {
    playClickSound();
    setShowOptions(!showOptions);
  };

  const handleSelectCount = (count: number) => {
    playClickSound();
    setSelectedCount(count);
  };

  const handleStartAutoSpin = () => {
    playClickSound();
    onStartAutoSpin(selectedCount);
    setShowOptions(false);
  };

  const handleStopAutoSpin = () => {
    playClickSound();
    onStopAutoSpin();
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isAutoSpinning ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3"
          >
            {/* 自动旋转状态显示 */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-orange/20 neon-border-pink">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RotateCcw className="w-4 h-4 text-neon-orange" />
              </motion.div>
              <span className="text-sm font-display text-neon-orange">
                {t('autoSpin.remaining')}: {remainingSpins}
              </span>
            </div>
            
            {/* 停止按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStopAutoSpin}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors border border-destructive/50"
            >
              <Square className="w-4 h-4" />
              <span className="text-sm font-display">{t('autoSpin.stop')}</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative"
          >
            {/* 自动旋转按钮 */}
            <motion.button
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              onClick={handleToggleOptions}
              disabled={disabled}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${disabled 
                  ? 'bg-muted/30 text-muted-foreground cursor-not-allowed' 
                  : showOptions
                    ? 'bg-neon-purple/20 text-neon-purple neon-border-purple'
                    : 'bg-muted/50 text-muted-foreground hover:text-neon-purple hover:bg-muted'}
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-display">{t('autoSpin.title')}</span>
            </motion.button>

            {/* 选项面板 */}
            <AnimatePresence>
              {showOptions && !disabled && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 p-4 rounded-xl bg-background/95 backdrop-blur-lg border border-border neon-border-purple z-50 min-w-[200px]"
                >
                  <div className="text-xs text-muted-foreground mb-3 font-display">
                    {t('autoSpin.selectCount')}
                  </div>
                  
                  {/* 次数选项 */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {SPIN_OPTIONS.map((count) => (
                      <motion.button
                        key={count}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectCount(count)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-display transition-all
                          ${selectedCount === count 
                            ? 'bg-neon-purple text-background shadow-[0_0_15px_hsl(280_100%_60%/0.5)]' 
                            : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'}
                        `}
                      >
                        {count}{t('autoSpin.times')}
                      </motion.button>
                    ))}
                  </div>

                  {/* 开始按钮 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartAutoSpin}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-neon-purple to-neon-pink text-background font-display shadow-[0_0_20px_hsl(280_100%_60%/0.3)] hover:shadow-[0_0_30px_hsl(280_100%_60%/0.5)] transition-shadow"
                  >
                    <Play className="w-4 h-4" />
                    {t('autoSpin.start')} ({selectedCount}{t('autoSpin.times')})
                  </motion.button>

                  {/* 提示 */}
                  <div className="mt-3 text-xs text-muted-foreground text-center">
                    {t('autoSpin.hint')}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
