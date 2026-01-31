import { ThemeType, THEME_COLORS, WheelSector } from './types';

interface WheelSectorsProps {
  sectors: WheelSector[];
  theme: ThemeType;
  size: number;
  winningSector: string | null;
}

export function WheelSectors({ sectors, theme, size, winningSector }: WheelSectorsProps) {
  const colors = THEME_COLORS[theme];
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20;
  const innerRadius = 50;
  
  const sectorAngle = 360 / sectors.length;

  const getSectorColors = (index: number) => {
    // 拉斯维加斯豪华赌场配色
    const vegasColors = [
      { main: '#C9A347', light: '#E8D5A3', dark: '#8B7432' }, // 金色
      { main: '#4A0E1E', light: '#7A2E3E', dark: '#2A0010' }, // 酒红
      { main: '#C9A347', light: '#E8D5A3', dark: '#8B7432' }, // 金色
      { main: '#1a1814', light: '#3a3834', dark: '#0a0804' }, // 深黑
      { main: '#8B7432', light: '#C9A347', dark: '#5A4A22' }, // 暗金
      { main: '#6a1e2e', light: '#9A4E5E', dark: '#4A0E1E' }, // 浅酒红
      { main: '#C9A347', light: '#E8D5A3', dark: '#8B7432' }, // 金色
      { main: '#2a1f1a', light: '#4a3f3a', dark: '#1a0f0a' }, // 深棕
    ];
    
    return vegasColors[index % vegasColors.length];
  };

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
    const textRadius = (radius + innerRadius) / 2 + 10;
    return {
      x: centerX + textRadius * Math.cos(midAngle),
      y: centerY + textRadius * Math.sin(midAngle),
      rotation: (startAngle + endAngle) / 2,
    };
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        {/* 扇区镜面反射渐变 */}
        {sectors.map((_, index) => {
          const sectorColors = getSectorColors(index);
          return (
            <linearGradient 
              key={`sector-grad-${index}`} 
              id={`sector-gradient-${index}`} 
              x1="0%" y1="0%" x2="100%" y2="100%"
            >
              <stop offset="0%" stopColor={sectorColors.light} />
              <stop offset="35%" stopColor={sectorColors.main} />
              <stop offset="65%" stopColor={sectorColors.dark} />
              <stop offset="100%" stopColor={sectorColors.main} />
            </linearGradient>
          );
        })}

        {/* 内凹雕刻效果滤镜 */}
        <filter id="inset-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feComponentTransfer in="SourceAlpha">
            <feFuncA type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feGaussianBlur stdDeviation="2" />
          <feOffset dx="1" dy="2" result="offsetblur" />
          <feFlood floodColor="rgba(0,0,0,0.7)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 发光描边效果 */}
        <filter id="glow-line" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
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
            {/* 扇区主体 */}
            <path
              d={createSectorPath(startAngle, endAngle)}
              fill={`url(#sector-gradient-${index})`}
              filter="url(#inset-shadow)"
              style={{
                transition: 'all 0.3s ease',
                transform: isWinning ? 'scale(1.02)' : 'scale(1)',
                transformOrigin: `${centerX}px ${centerY}px`,
              }}
            />
            
            {/* 扇区分割线 - 内凹发光 */}
            <line
              x1={centerX + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180)}
              y1={centerY + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180)}
              x2={centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)}
              y2={centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)}
              stroke={colors.accent}
              strokeWidth="1"
              opacity="0.4"
              filter="url(#glow-line)"
            />

            {/* 文字 */}
            <text
              x={textPos.x}
              y={textPos.y - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
              style={{
                fill: 'rgba(255,255,255,0.9)',
                fontSize: '22px',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {sector.emoji}
            </text>
            <text
              x={textPos.x}
              y={textPos.y + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
              className="font-display"
              style={{
                fill: 'rgba(255,255,255,0.85)',
                fontSize: '10px',
                fontWeight: '600',
                letterSpacing: '0.05em',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              }}
            >
              {sector.label}
            </text>
          </g>
        );
      })}

      {/* 中心装饰 */}
      <defs>
        <radialGradient id="center-gradient">
          <stop offset="0%" stopColor={colors.gradient[0]} />
          <stop offset="50%" stopColor={colors.gradient[1]} />
          <stop offset="100%" stopColor={colors.gradient[2]} />
        </radialGradient>
        <filter id="center-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.5" />
        </filter>
      </defs>
      
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius - 5}
        fill="url(#center-gradient)"
        filter="url(#center-shadow)"
        style={{
          boxShadow: `0 0 30px ${colors.glow}`,
        }}
      />
      
      {/* 中心高光 */}
      <ellipse
        cx={centerX - 10}
        cy={centerY - 10}
        rx={15}
        ry={10}
        fill="rgba(255,255,255,0.3)"
      />
      
      {/* 中心Logo */}
      <text
        x={centerX}
        y={centerY - 5}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-display"
        style={{
          fill: 'rgba(255,255,255,0.9)',
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.15em',
        }}
      >
        FORTUNE
      </text>
      <text
        x={centerX}
        y={centerY + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fill: 'rgba(255,255,255,0.9)',
          fontSize: '16px',
        }}
      >
        👑
      </text>
    </svg>
  );
}
