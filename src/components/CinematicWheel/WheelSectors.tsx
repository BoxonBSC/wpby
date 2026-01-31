import { ThemeType, THEME_COLORS, WheelSector } from './types';
import { withAlpha } from './color';

interface WheelSectorsProps {
  sectors: WheelSector[];
  theme: ThemeType;
  size: number;
  winningSector: string | null;
}

// Classic casino look: bright/dark alternating sectors (theme-aware).
const getSectorBaseColor = (theme: ThemeType, index: number, colors: (typeof THEME_COLORS)[ThemeType]) => {
  const bright = theme === 'gold' ? 'hsl(var(--gold))' : colors.primary;
  const dark = theme === 'gold' ? 'hsl(var(--ruby-dark))' : 'hsl(var(--background))';
  return index % 2 === 0 ? bright : dark;
};

export function WheelSectors({ sectors, theme, size, winningSector }: WheelSectorsProps) {
  const colors = THEME_COLORS[theme];
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 15;
  const innerRadius = 55;
  
  const sectorAngle = 360 / sectors.length;

  const createSectorPath = (startAngle: number, endAngle: number): string => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  const getTextPosition = (startAngle: number, endAngle: number) => {
    const midAngle = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180;
    const textRadius = (radius + innerRadius) / 2 + 8;
    return {
      x: centerX + textRadius * Math.cos(midAngle),
      y: centerY + textRadius * Math.sin(midAngle),
      rotation: (startAngle + endAngle) / 2,
    };
  };

  const formatPoolPercent = (poolPercent: number) => {
    if (poolPercent <= 0) return '—';
    const pct = poolPercent * 100;
    if (pct >= 1) return `${pct.toFixed(0)}%`;
    if (pct >= 0.1) return `${pct.toFixed(1)}%`;
    return `${pct.toFixed(2)}%`;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    >
      <defs>
        {/* 扇区渐变 */}
        {sectors.map((_, index) => {
          const baseColor = getSectorBaseColor(theme, index, colors);
          return (
            <linearGradient 
              key={`grad-${index}`} 
              id={`sector-grad-${index}`} 
              x1="0%" y1="0%" x2="100%" y2="100%"
            >
              <stop offset="0%" style={{ stopColor: withAlpha(baseColor, 0.98) }} />
              <stop offset="45%" style={{ stopColor: withAlpha(baseColor, 0.88) }} />
              <stop offset="100%" style={{ stopColor: withAlpha(baseColor, 0.72) }} />
            </linearGradient>
          );
        })}
        
        {/* 文字阴影滤镜 */}
        <filter id="text-shadow" x="-50%" y="-50%" width="200%" height="200%">
          {/* Avoid CSS variables in SVG filters for compatibility */}
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="black" floodOpacity="0.9"/>
        </filter>
      </defs>

      {/* 扇区 */}
      {sectors.map((sector, index) => {
        const startAngle = index * sectorAngle;
        const endAngle = (index + 1) * sectorAngle;
        const textPos = getTextPosition(startAngle, endAngle);
        const isWinning = winningSector === sector.id;

        return (
          <g key={sector.id}>
            {/* 扇区背景 */}
            <path
              d={createSectorPath(startAngle, endAngle)}
              fill={`url(#sector-grad-${index})`}
              strokeWidth="1.2"
              style={{ stroke: withAlpha(colors.accent, 0.28) }}
            />
            
            {/* 扇区高亮边 */}
            <path
              d={createSectorPath(startAngle, endAngle)}
              fill="none"
              strokeWidth="1"
              style={{ stroke: withAlpha('hsl(var(--foreground))', 0.08) }}
            />

            {/* 中奖高亮 */}
            {isWinning && (
              <path
                d={createSectorPath(startAngle, endAngle)}
                fill="none"
                stroke={colors.glow}
                strokeWidth="3"
                opacity="0.9"
              />
            )}

            {/* Emoji */}
            <text
              x={textPos.x}
              y={textPos.y - 16}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y - 16})`}
              fontSize="22"
              filter="url(#text-shadow)"
            >
              {sector.emoji}
            </text>
            
            {/* 奖励名称 */}
            <text
              x={textPos.x}
              y={textPos.y + 2}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y + 2})`}
              // Fallback attribute (some SVG engines prefer attributes over style)
              fill="#ffffff"
              fontSize="14"
              fontWeight="700"
              fontFamily="'Cinzel', serif"
              letterSpacing="0.05em"
              filter="url(#text-shadow)"
              style={{
                // Avoid CSS variables in SVG styles for cross-browser rendering.
                fill: withAlpha(colors.accent, 0.98),
                stroke: withAlpha('hsl(0, 0%, 0%)', 0.85),
                strokeWidth: 3,
                paintOrder: 'stroke',
              }}
            >
              {sector.label}
            </text>
            
            {/* 奖池比例 */}
            <text
              x={textPos.x}
              y={textPos.y + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y + 16})`}
              fill="#ffd700"
              fontSize={sector.poolPercent >= 0.1 ? '14' : '12'}
              fontWeight="800"
              fontFamily="'Cinzel', serif"
              filter="url(#text-shadow)"
              style={{
                fill: sector.poolPercent > 0 ? withAlpha(colors.glow, 0.98) : withAlpha('hsl(0, 0%, 70%)', 0.95),
                stroke: withAlpha('hsl(0, 0%, 0%)', 0.85),
                strokeWidth: 3,
                paintOrder: 'stroke',
              }}
            >
              {formatPoolPercent(sector.poolPercent)}
            </text>
          </g>
        );
      })}

      {/* 中心圆 */}
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius - 5}
        fill={`url(#center-fill)`}
      />
      
      <defs>
        <radialGradient id="center-fill">
          <stop offset="0%" stopColor={colors.gradient[0]} />
          <stop offset="50%" stopColor={colors.gradient[1]} />
          <stop offset="100%" stopColor={colors.gradient[2]} />
        </radialGradient>
      </defs>

      {/* 中心高光 */}
      <ellipse
        cx={centerX - 8}
        cy={centerY - 8}
        rx={12}
        ry={8}
        style={{ fill: withAlpha(colors.accent, 0.22) }}
      />
      
      {/* 中心文字 */}
      <text
        x={centerX}
        y={centerY - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        fontWeight="700"
        fontFamily="'Cinzel', serif"
        letterSpacing="0.1em"
        style={{
          fill: withAlpha(colors.accent, 0.92),
          stroke: withAlpha('hsl(0, 0%, 0%)', 0.7),
          strokeWidth: 2,
          paintOrder: 'stroke',
        }}
      >
        FORTUNE
      </text>
      <text
        x={centerX}
        y={centerY + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
      >
        👑
      </text>
    </svg>
  );
}
