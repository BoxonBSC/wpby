import { motion } from 'framer-motion';
import { ThemeType, THEME_COLORS } from './CinematicWheel/types';

interface ThemeSelectorProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const themes: { id: ThemeType; label: string; labelCn: string }[] = [
  { id: 'gold', label: 'Gold', labelCn: '黄金' },
  { id: 'roseGold', label: 'Rose Gold', labelCn: '玫瑰金' },
  { id: 'platinum', label: 'Platinum', labelCn: '铂金' },
];

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {themes.map((theme) => {
        const colors = THEME_COLORS[theme.id];
        const isActive = currentTheme === theme.id;
        
        return (
          <motion.button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative px-4 py-2 rounded-xl font-display text-xs tracking-wider
              transition-all duration-300
              ${isActive 
                ? 'text-black' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
            style={{
              background: isActive 
                ? `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})`
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isActive ? colors.primary : 'rgba(255,255,255,0.1)'}`,
              boxShadow: isActive ? `0 0 20px ${colors.glow}40` : 'none',
            }}
          >
            {/* 光泽效果 */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl overflow-hidden"
                initial={false}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  }}
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </motion.div>
            )}
            
            <span className="relative z-10">{theme.labelCn}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
