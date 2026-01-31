import { motion } from 'framer-motion';
import { THEME_PRESETS } from './types';

interface PointerProps {
  isSpinning: boolean;
  theme: keyof typeof THEME_PRESETS;
}

export function Pointer({ isSpinning, theme }: PointerProps) {
  const colors = THEME_PRESETS[theme];

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30" style={{ marginTop: -8 }}>
      {/* Light trail when spinning */}
      {isSpinning && (
        <motion.div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-1 h-24"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scaleY: [0.7, 1, 0.7],
          }}
          transition={{ duration: 0.12, repeat: Infinity }}
          style={{
            background: `linear-gradient(to bottom, ${colors.accent}, transparent)`,
            filter: 'blur(3px)',
          }}
        />
      )}

      {/* Glow container */}
      <motion.div
        animate={{
          filter: isSpinning 
            ? ['drop-shadow(0 0 15px ' + colors.glow + ')', 'drop-shadow(0 0 25px ' + colors.glow + ')', 'drop-shadow(0 0 15px ' + colors.glow + ')']
            : ['drop-shadow(0 0 10px ' + colors.glow + '80)', 'drop-shadow(0 0 20px ' + colors.glow + '60)', 'drop-shadow(0 0 10px ' + colors.glow + '80)'],
        }}
        transition={{ duration: isSpinning ? 0.2 : 1.5, repeat: Infinity }}
      >
        <svg width="56" height="72" viewBox="0 0 56 72">
          <defs>
            {/* Crystal gradient */}
            <linearGradient id={`pointer-crystal-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
              <stop offset="25%" stopColor={colors.accent} stopOpacity="0.85" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="75%" stopColor={colors.primary} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
            
            {/* Inner refraction */}
            <linearGradient id={`pointer-inner-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Glow filter */}
            <filter id={`pointer-glow-${theme}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer glow ellipse */}
          <ellipse
            cx="28" cy="22"
            rx="18" ry="7"
            fill={colors.glow}
            opacity="0.35"
            filter={`url(#pointer-glow-${theme})`}
          />

          {/* Main crystal body */}
          <g filter={`url(#pointer-glow-${theme})`}>
            {/* Left facet */}
            <polygon
              points="28,65 13,22 28,4"
              fill={`url(#pointer-crystal-${theme})`}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="0.5"
            />
            {/* Right facet */}
            <polygon
              points="28,65 43,22 28,4"
              fill={`url(#pointer-crystal-${theme})`}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="0.5"
              opacity="0.88"
            />
            {/* Center highlight */}
            <polygon
              points="28,60 20,28 28,8 36,28"
              fill={`url(#pointer-inner-${theme})`}
              opacity="0.55"
            />
            {/* Top facet */}
            <polygon
              points="20,22 28,4 36,22 28,18"
              fill="rgba(255,255,255,0.55)"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="0.3"
            />
          </g>

          {/* Animated refraction spots */}
          <motion.ellipse
            cx="23" cy="32"
            rx="2.5" ry="5"
            fill="rgba(255,255,255,0.75)"
            animate={{
              opacity: [0.35, 0.75, 0.35],
              cx: [23, 25, 23],
            }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <motion.ellipse
            cx="33" cy="42"
            rx="1.8" ry="3.5"
            fill="rgba(255,255,255,0.6)"
            animate={{
              opacity: [0.25, 0.55, 0.25],
              cy: [42, 40, 42],
            }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
          />
        </svg>
      </motion.div>

      {/* Bottom reflection point */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
        style={{ background: colors.accent }}
        animate={{
          boxShadow: [
            `0 0 8px ${colors.accent}, 0 0 16px ${colors.glow}`,
            `0 0 12px ${colors.accent}, 0 0 24px ${colors.glow}`,
            `0 0 8px ${colors.accent}, 0 0 16px ${colors.glow}`,
          ],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </div>
  );
}
