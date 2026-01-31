import { motion } from 'framer-motion';
import { ThemeType, THEME_COLORS } from './types';

interface CasinoPointerProps {
  isSpinning: boolean;
  theme: ThemeType;
}

const hsla = (hsl: string, alpha: number) => {
  // Convert `hsl(h, s%, l%)` -> `hsla(h, s%, l%, a)`
  if (hsl.startsWith('hsla(')) return hsl;
  if (!hsl.startsWith('hsl(')) return hsl;
  return hsl.replace(/^hsl\(/, 'hsla(').replace(/\)$/, `, ${alpha})`);
};

/**
 * Classic casino "flapper" pointer (fixed, wheel spins underneath).
 * Pure UI: no game logic.
 */
export function CasinoPointer({ isSpinning, theme }: CasinoPointerProps) {
  const colors = THEME_COLORS[theme];

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
        style={{ filter: `drop-shadow(0 0 18px ${hsla(colors.glow, 0.35)})` }}
      >
        <svg width="78" height="92" viewBox="0 0 78 92" aria-hidden="true">
          <defs>
            <linearGradient id={`pointer-metal-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--diamond))" stopOpacity="0.95" />
              <stop offset="50%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(var(--diamond))" stopOpacity="0.9" />
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
            stroke={hsla(colors.accent, 0.35)}
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
            stroke={hsla(colors.accent, 0.45)}
            strokeWidth="1"
          />

          {/* Flapper highlight */}
          <path
            d="M39 34 L50 40 L39 76 L28 40 Z"
            fill={hsla('hsl(var(--foreground))', 0.16)}
          />

          {/* Tip gem */}
          <circle cx="39" cy="82" r="4" fill={colors.glow} opacity="0.9" />
        </svg>
      </motion.div>
    </div>
  );
}
