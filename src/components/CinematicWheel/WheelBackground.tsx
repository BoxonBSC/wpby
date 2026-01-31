import { motion } from 'framer-motion';
import { ThemeType, THEME_COLORS } from './types';

interface WheelBackgroundProps {
  theme: ThemeType;
  isSpinning: boolean;
}

export function WheelBackground({ theme, isSpinning }: WheelBackgroundProps) {
  const colors = THEME_COLORS[theme];

  return (
    <div className="absolute inset-0 overflow-hidden rounded-full">
      {/* 金属拉丝纹理层 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.03) 0px,
              rgba(0,0,0,0.05) 1px,
              rgba(255,255,255,0.02) 2px,
              rgba(0,0,0,0.03) 3px
            ),
            radial-gradient(
              ellipse at 30% 20%,
              rgba(255,255,255,0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at center,
              hsl(0, 0%, 8%) 0%,
              hsl(0, 0%, 3%) 100%
            )
          `,
        }}
      />

      {/* 微粒子流动层 */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 1 + Math.random() * 2,
              height: 1 + Math.random() * 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: colors.glow,
              opacity: 0.2,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* 外圈金属环 */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          border: '12px solid transparent',
          background: `
            linear-gradient(135deg, 
              ${colors.gradient[0]}20 0%, 
              ${colors.gradient[1]}40 50%, 
              ${colors.gradient[2]}20 100%
            ) padding-box,
            linear-gradient(135deg, 
              ${colors.gradient[0]} 0%, 
              ${colors.gradient[1]} 50%, 
              ${colors.gradient[2]} 100%
            ) border-box
          `,
          boxShadow: `
            inset 0 2px 10px rgba(255,255,255,0.2),
            inset 0 -2px 10px rgba(0,0,0,0.5),
            0 0 30px ${colors.glow}30,
            0 0 60px ${colors.glow}15
          `,
        }}
      />

      {/* 内凹边缘效果 */}
      <div 
        className="absolute inset-3 rounded-full"
        style={{
          boxShadow: `
            inset 0 4px 20px rgba(0,0,0,0.8),
            inset 0 -2px 10px rgba(255,255,255,0.05)
          `,
        }}
      />

      {/* 动态光斑 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: [
            `radial-gradient(ellipse 60% 40% at 30% 20%, ${colors.glow}15, transparent)`,
            `radial-gradient(ellipse 60% 40% at 70% 80%, ${colors.glow}15, transparent)`,
            `radial-gradient(ellipse 60% 40% at 30% 20%, ${colors.glow}15, transparent)`,
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 旋转时的能量环 */}
      {isSpinning && (
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            border: `1px solid ${colors.accent}`,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.02, 1],
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
