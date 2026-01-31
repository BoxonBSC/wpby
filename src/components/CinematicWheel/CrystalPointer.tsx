import { motion } from 'framer-motion';
import { ThemeType, THEME_COLORS } from './types';

interface CrystalPointerProps {
  isSpinning: boolean;
  theme: ThemeType;
}

export function CrystalPointer({ isSpinning, theme }: CrystalPointerProps) {
  const colors = THEME_COLORS[theme];

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30" style={{ marginTop: -10 }}>
      {/* 光迹拖尾效果 */}
      {isSpinning && (
        <motion.div
          className="absolute top-8 left-1/2 -translate-x-1/2 w-1 h-32 opacity-50"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scaleY: [0.8, 1, 0.8],
          }}
          transition={{ duration: 0.15, repeat: Infinity }}
          style={{
            background: `linear-gradient(to bottom, ${colors.accent}, transparent)`,
            filter: `blur(4px)`,
          }}
        />
      )}

      {/* 悬浮光环 */}
      <motion.div
        animate={{
          boxShadow: isSpinning 
            ? [
                `0 0 20px ${colors.glow}80, 0 0 40px ${colors.glow}40`,
                `0 0 30px ${colors.glow}a0, 0 0 60px ${colors.glow}60`,
                `0 0 20px ${colors.glow}80, 0 0 40px ${colors.glow}40`,
              ]
            : [
                `0 0 15px ${colors.glow}40, 0 0 30px ${colors.glow}20`,
                `0 0 25px ${colors.glow}60, 0 0 50px ${colors.glow}30`,
                `0 0 15px ${colors.glow}40, 0 0 30px ${colors.glow}20`,
              ],
        }}
        transition={{ duration: isSpinning ? 0.3 : 2, repeat: Infinity }}
        className="relative"
      >
        <svg width="60" height="80" viewBox="0 0 60 80">
          <defs>
            {/* 水晶折射渐变 */}
            <linearGradient id={`crystal-main-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="30%" stopColor={colors.accent} stopOpacity="0.8" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="70%" stopColor={colors.primary} stopOpacity="0.7" />
              <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.9" />
            </linearGradient>

            {/* 内部折射 */}
            <linearGradient id={`crystal-inner-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* 发光滤镜 */}
            <filter id={`crystal-glow-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 折射棱镜效果 */}
            <filter id="prism">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>
          </defs>

          {/* 外层光晕 */}
          <ellipse
            cx="30" cy="25"
            rx="20" ry="8"
            fill={colors.glow}
            opacity="0.3"
            filter={`url(#crystal-glow-${theme})`}
          />

          {/* 主水晶体 - 多面体 */}
          <g filter={`url(#crystal-glow-${theme})`}>
            {/* 左面 */}
            <polygon
              points="30,70 15,25 30,5"
              fill={`url(#crystal-main-${theme})`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
            />
            {/* 右面 */}
            <polygon
              points="30,70 45,25 30,5"
              fill={`url(#crystal-main-${theme})`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
              opacity="0.85"
            />
            {/* 中心高光 */}
            <polygon
              points="30,65 22,30 30,10 38,30"
              fill={`url(#crystal-inner-${theme})`}
              opacity="0.6"
            />
            {/* 顶部切面 */}
            <polygon
              points="22,25 30,5 38,25 30,20"
              fill="rgba(255,255,255,0.5)"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.3"
            />
          </g>

          {/* 折射光斑 */}
          <motion.ellipse
            cx="25" cy="35"
            rx="3" ry="6"
            fill="rgba(255,255,255,0.7)"
            animate={{
              opacity: [0.4, 0.8, 0.4],
              cx: [25, 27, 25],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.ellipse
            cx="35" cy="45"
            rx="2" ry="4"
            fill="rgba(255,255,255,0.5)"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              cy: [45, 43, 45],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </svg>
      </motion.div>

      {/* 底部反射光点 */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
        style={{ background: colors.accent }}
        animate={{
          boxShadow: [
            `0 0 10px ${colors.accent}, 0 0 20px ${colors.glow}`,
            `0 0 15px ${colors.accent}, 0 0 30px ${colors.glow}`,
            `0 0 10px ${colors.accent}, 0 0 20px ${colors.glow}`,
          ],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </div>
  );
}
