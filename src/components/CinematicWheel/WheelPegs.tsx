import { ThemeType, THEME_COLORS } from './types';
import { withAlpha } from './color';

interface WheelPegsProps {
  theme: ThemeType;
  size: number;
  count: number;
}

/**
 * Outer peg ring (attached to the wheel, rotates with it).
 */
export function WheelPegs({ theme, size, count }: WheelPegsProps) {
  const colors = THEME_COLORS[theme];
  const cx = size / 2;
  const cy = size / 2;
  const pegRingRadius = size / 2 - 10;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 15 }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`peg-fill-${theme}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={withAlpha('hsl(var(--foreground))', 0.9)} />
          <stop offset="55%" stopColor={withAlpha(colors.accent, 0.6)} />
          <stop offset="100%" stopColor={withAlpha('hsl(var(--background))', 0.9)} />
        </radialGradient>
      </defs>

      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = cx + pegRingRadius * Math.cos(angle);
        const y = cy + pegRingRadius * Math.sin(angle);
        const r = 3.3;
        return (
          <g key={i}>
            {/* Outer glow */}
            <circle cx={x} cy={y} r={r + 1.5} fill={withAlpha(colors.glow, 0.18)} />
            {/* Peg body */}
            <circle cx={x} cy={y} r={r} fill={`url(#peg-fill-${theme})`} />
            {/* Specular dot */}
            <circle cx={x - 0.8} cy={y - 0.8} r={0.9} fill={withAlpha('hsl(var(--foreground))', 0.7)} />
          </g>
        );
      })}
    </svg>
  );
}
