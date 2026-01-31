import { ThemeType, THEME_COLORS, WheelSector } from './types';
import { withAlpha } from './color';

interface WheelLabelsOverlayProps {
  sectors: WheelSector[];
  theme: ThemeType;
  size: number;
}

const formatPoolPercent = (poolPercent: number) => {
  if (poolPercent <= 0) return '—';
  const pct = poolPercent * 100;
  if (pct >= 1) return `${pct.toFixed(0)}%`;
  if (pct >= 0.1) return `${pct.toFixed(1)}%`;
  return `${pct.toFixed(2)}%`;
};

/**
 * Fallback layer to guarantee text visibility across browsers.
 * Renders sector labels as regular HTML, positioned over the wheel.
 */
export function WheelLabelsOverlay({ sectors, theme, size }: WheelLabelsOverlayProps) {
  // Use the selected theme for layout, but force a high-contrast gold text color for readability.
  // This is HTML (not SVG), so CSS variables are safe and consistent across browsers.
  const colors = THEME_COLORS[theme];
  const goldText = withAlpha('hsl(var(--gold))', 0.98);
  const outline = withAlpha('hsl(var(--background))', 0.92);
  const shadow = withAlpha('hsl(0, 0%, 0%)', 0.92);

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 15;
  const innerRadius = 55;
  const sectorAngle = (Math.PI * 2) / sectors.length;

  // Place labels slightly outward to avoid the hub.
  const labelRadius = (outerRadius + innerRadius) / 2 + 14;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 19 }} aria-hidden="true">
      {sectors.map((sector, index) => {
        const mid = index * sectorAngle + sectorAngle / 2 - Math.PI / 2;
        const x = cx + labelRadius * Math.cos(mid);
        const y = cy + labelRadius * Math.sin(mid);
        const rot = (mid * 180) / Math.PI + 90;

        return (
          <div
            key={sector.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) rotate(${rot}deg)`,
              width: 130,
              textAlign: 'center',
              fontFamily: 'Cinzel, serif',
              color: 'white',
              textShadow: `0 2px 10px ${shadow}`,
            }}
          >
            <div style={{ fontSize: 20, lineHeight: '20px', marginBottom: 2 }}>{sector.emoji}</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: goldText,
                WebkitTextStroke: `2px ${outline}`,
              }}
            >
              {sector.label}
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 13,
                fontWeight: 900,
                color:
                  sector.poolPercent > 0
                    ? goldText
                    : withAlpha('hsl(0, 0%, 70%)', 0.95),
                WebkitTextStroke: `2px ${outline}`,
              }}
            >
              {formatPoolPercent(sector.poolPercent)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
