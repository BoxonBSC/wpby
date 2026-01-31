import { ThemeType, THEME_COLORS, WheelSector } from './types';

interface WheelSectorsProps {
  sectors: WheelSector[];
  theme: ThemeType;
  size: number;
  winningSector: string | null;
}

// 拉斯维加斯豪华赌场配色
const SECTOR_COLORS = [
  '#C9A347', // Gold
  '#4A0E1E', // Wine Red
  '#B8860B', // Dark Gold
  '#2D1810', // Deep Brown
  '#8B7355', // Bronze
  '#3D1C28', // Dark Wine
  '#A67B5B', // Light Bronze
  '#1A0D12', // Near Black
];

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
          const baseColor = SECTOR_COLORS[index % SECTOR_COLORS.length];
          return (
            <linearGradient 
              key={`grad-${index}`} 
              id={`sector-grad-${index}`} 
              x1="0%" y1="0%" x2="100%" y2="100%"
            >
              <stop offset="0%" stopColor={baseColor} stopOpacity="1" />
              <stop offset="50%" stopColor={baseColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={baseColor} stopOpacity="0.7" />
            </linearGradient>
          );
        })}
        
        {/* 文字阴影滤镜 */}
        <filter id="text-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.9"/>
        </filter>
      </defs>

      {/* 扇区 */}
      {sectors.map((sector, index) => {
        const startAngle = index * sectorAngle;
        const endAngle = (index + 1) * sectorAngle;
        const textPos = getTextPosition(startAngle, endAngle);
        const isWinning = winningSector === sector.id;
        const sectorColor = SECTOR_COLORS[index % SECTOR_COLORS.length];

        return (
          <g key={sector.id}>
            {/* 扇区背景 */}
            <path
              d={createSectorPath(startAngle, endAngle)}
              fill={`url(#sector-grad-${index})`}
              stroke={colors.accent}
              strokeWidth="1"
              strokeOpacity="0.3"
            />
            
            {/* 扇区高亮边 */}
            <path
              d={createSectorPath(startAngle, endAngle)}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />

            {/* 中奖高亮 */}
            {isWinning && (
              <path
                d={createSectorPath(startAngle, endAngle)}
                fill="none"
                stroke={colors.accent}
                strokeWidth="3"
                opacity="0.8"
              />
            )}

            {/* Emoji */}
            <text
              x={textPos.x}
              y={textPos.y - 16}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y - 16})`}
              fontSize="18"
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
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="700"
              fontFamily="'Cinzel', serif"
              letterSpacing="0.05em"
              filter="url(#text-shadow)"
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
              fill={sector.poolPercent > 0 ? '#FFD700' : '#888888'}
              fontSize={sector.poolPercent >= 0.1 ? '11' : '9'}
              fontWeight="800"
              fontFamily="'Cinzel', serif"
              filter="url(#text-shadow)"
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
        fill="rgba(255,255,255,0.25)"
      />
      
      {/* 中心文字 */}
      <text
        x={centerX}
        y={centerY - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.9)"
        fontSize="11"
        fontWeight="700"
        fontFamily="'Cinzel', serif"
        letterSpacing="0.1em"
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
