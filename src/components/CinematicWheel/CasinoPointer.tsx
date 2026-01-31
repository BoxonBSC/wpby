import { motion } from 'framer-motion';
import { ThemeType, THEME_COLORS } from './types';
import { withAlpha } from './color';

interface CasinoPointerProps {
  isSpinning: boolean;
  theme: ThemeType;
}

/**
 * Classic casino "flapper" pointer (fixed, wheel spins underneath).
 * Pure UI: no game logic.
 */
export function CasinoPointer({ isSpinning, theme }: CasinoPointerProps) {
  const colors = THEME_COLORS[theme];

  // NOTE: Avoid CSS variables in SVG gradients for compatibility.
  const metal1 = 'hsl(0, 0%, 96%)';
  const metal2 = 'hsl(0, 0%, 70%)';
  const metal3 = 'hsl(0, 0%, 88%)';

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40" style={{ marginTop: -18 }}>
      {/* Subtle shake when spinning */}
      <motion.div
        animate={
          isSpinning
            ? {
                rotate: [0, -1.2, 1.2, -0.8, 0.8, 0],
              }
            : { rotate: 0 }
        }
        transition={isSpinning ? { duration: 0.22, repeat: Infinity } : { duration: 0.2 }}
        style={{ filter: `drop-shadow(0 0 18px ${withAlpha(colors.glow, 0.35)})` }}
      >
        <svg width="78" height="92" viewBox="0 0 78 92" aria-hidden="true">
          <defs>
            <linearGradient id={`pointer-metal-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={metal1} stopOpacity="0.95" />
              <stop offset="50%" stopColor={metal2} stopOpacity="0.55" />
              <stop offset="100%" stopColor={metal3} stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id={`pointer-flapper-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.accent} />
              <stop offset="60%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
          </defs>

          {/* Top metal mount */}
          <path
            d="M18 10 C24 2, 54 2, 60 10 L68 24 C70 28, 68 34, 62 34 H16 C10 34, 8 28, 10 24 Z"
            fill={`url(#pointer-metal-${theme})`}
            stroke={withAlpha(colors.accent, 0.35)}
            strokeWidth="1"
          />

          {/* Rivets */}
          {[24, 39, 54].map((x) => (
            <circle
              key={x}
              cx={x}
              cy={22}
              r="2.6"
              fill="hsl(var(--background))"
              opacity="0.6"
            />
          ))}

          {/* Flapper triangle */}
          <path
            d="M39 30 L57 38 L39 82 L21 38 Z"
            fill={`url(#pointer-flapper-${theme})`}
            stroke={withAlpha(colors.accent, 0.45)}
            strokeWidth="1"
          />

          {/* Flapper highlight */}
          <path
            d="M39 34 L50 40 L39 76 L28 40 Z"
            fill={withAlpha('hsl(var(--foreground))', 0.16)}
          />

          {/* Tip gem */}
          <circle cx="39" cy="82" r="4" fill={colors.glow} opacity="0.9" />
        </svg>
      </motion.div>
    </div>
  );
}
