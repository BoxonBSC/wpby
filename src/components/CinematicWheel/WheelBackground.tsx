import { motion } from 'framer-motion';
import { ThemeType, THEME_COLORS } from './types';

interface WheelBackgroundProps {
  theme: ThemeType;
  isSpinning: boolean;
}

export function WheelBackground({ theme, isSpinning }: WheelBackgroundProps) {
  const colors = THEME_COLORS[theme];

  const hsla = (hsl: string, alpha: number) => {
    if (hsl.startsWith('hsla(')) return hsl;
    if (!hsl.startsWith('hsl(')) return hsl;
    return hsl.replace(/^hsl\(/, 'hsla(').replace(/\)$/, `, ${alpha})`);
  };

  return (
    <div 
      className="absolute inset-0 rounded-full overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* 基础深色背景 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)`,
        }}
      />

      {/* 外圈金属环 - 不覆盖扇区 */}
      <div 
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: `
            inset 0 0 20px rgba(0,0,0,0.8),
            0 0 30px ${hsla(colors.glow, 0.18)}
          `,
        }}
      />

      {/* 旋转时的能量效果 */}
      {isSpinning && (
        <motion.div
          className="absolute inset-4 rounded-full pointer-events-none"
          style={{
            border: `1px solid ${colors.accent}`,
            boxShadow: `0 0 20px ${hsla(colors.glow, 0.35)}`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
          }}
        />
      )}
    </div>
  );
}
