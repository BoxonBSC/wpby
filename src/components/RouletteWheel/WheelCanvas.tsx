import { useRef, useEffect, useCallback } from 'react';
import { RouletteItem, THEME_PRESETS } from './types';

interface WheelCanvasProps {
  items: RouletteItem[];
  size: number;
  rotation: number;
  theme: keyof typeof THEME_PRESETS;
  highlightIndex: number | null;
}

export function WheelCanvas({ items, size, rotation, theme, highlightIndex }: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeColors = THEME_PRESETS[theme];

  const drawWheel = useCallback((ctx: CanvasRenderingContext2D) => {
    const center = size / 2;
    const outerRadius = size / 2 - 15;
    const innerRadius = 55;
    const sectorAngle = (2 * Math.PI) / items.length;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw sectors with gem-cut facet effect
    items.forEach((item, index) => {
      const startAngle = index * sectorAngle - Math.PI / 2;
      const endAngle = startAngle + sectorAngle;
      const midAngle = startAngle + sectorAngle / 2;
      const isHighlighted = highlightIndex === index;

      // Parse HSL color
      const baseColor = item.color || `hsl(${(index * 360) / items.length}, 70%, 50%)`;
      
      // Create multi-facet gradient for gem effect
      const gradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius);
      
      // Extract HSL values and create variations
      const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (hslMatch) {
        const [, h, s, l] = hslMatch.map(Number);
        gradient.addColorStop(0, `hsl(${h}, ${s}%, ${Math.min(l + 25, 90)}%)`);
        gradient.addColorStop(0.3, `hsl(${h}, ${s}%, ${l + 10}%)`);
        gradient.addColorStop(0.5, baseColor);
        gradient.addColorStop(0.7, `hsl(${h}, ${s}%, ${Math.max(l - 10, 10)}%)`);
        gradient.addColorStop(1, `hsl(${h}, ${Math.max(s - 20, 20)}%, ${Math.max(l - 20, 5)}%)`);
      } else {
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, baseColor);
      }

      // Draw main sector
      ctx.beginPath();
      ctx.moveTo(
        innerRadius * Math.cos(startAngle),
        innerRadius * Math.sin(startAngle)
      );
      ctx.arc(0, 0, outerRadius, startAngle, endAngle);
      ctx.arc(0, 0, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add facet highlight (gem cut effect)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(
        innerRadius * Math.cos(startAngle),
        innerRadius * Math.sin(startAngle)
      );
      ctx.lineTo(
        outerRadius * Math.cos(startAngle + sectorAngle * 0.3),
        outerRadius * Math.sin(startAngle + sectorAngle * 0.3)
      );
      ctx.lineTo(
        (innerRadius + outerRadius) / 2 * Math.cos(midAngle),
        (innerRadius + outerRadius) / 2 * Math.sin(midAngle)
      );
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();
      ctx.restore();

      // Add secondary facet
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(
        outerRadius * Math.cos(endAngle - sectorAngle * 0.2),
        outerRadius * Math.sin(endAngle - sectorAngle * 0.2)
      );
      ctx.lineTo(
        innerRadius * Math.cos(endAngle),
        innerRadius * Math.sin(endAngle)
      );
      ctx.lineTo(
        (innerRadius + outerRadius) / 2 * Math.cos(midAngle),
        (innerRadius + outerRadius) / 2 * Math.sin(midAngle)
      );
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fill();
      ctx.restore();

      // Sector divider lines (engraved gold)
      ctx.beginPath();
      ctx.moveTo(
        innerRadius * Math.cos(startAngle),
        innerRadius * Math.sin(startAngle)
      );
      ctx.lineTo(
        outerRadius * Math.cos(startAngle),
        outerRadius * Math.sin(startAngle)
      );
      ctx.strokeStyle = themeColors.accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner glow line
      ctx.beginPath();
      ctx.moveTo(
        (innerRadius + 2) * Math.cos(startAngle + 0.01),
        (innerRadius + 2) * Math.sin(startAngle + 0.01)
      );
      ctx.lineTo(
        (outerRadius - 2) * Math.cos(startAngle + 0.01),
        (outerRadius - 2) * Math.sin(startAngle + 0.01)
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Draw icon/emoji
      if (item.icon) {
        const iconRadius = (innerRadius + outerRadius) / 2 + 15;
        const iconX = iconRadius * Math.cos(midAngle);
        const iconY = iconRadius * Math.sin(midAngle);
        
        ctx.save();
        ctx.translate(iconX, iconY);
        ctx.rotate(midAngle + Math.PI / 2);
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, 0, -8);
        ctx.restore();
      }

      // Draw label
      const labelRadius = (innerRadius + outerRadius) / 2 - 5;
      const labelX = labelRadius * Math.cos(midAngle);
      const labelY = labelRadius * Math.sin(midAngle);
      
      ctx.save();
      ctx.translate(labelX, labelY);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.font = 'bold 11px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(item.label.toUpperCase(), 0, 12);
      ctx.restore();

      // Highlight winning sector
      if (isHighlighted) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, startAngle, endAngle);
        ctx.arc(0, 0, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.strokeStyle = themeColors.glow;
        ctx.lineWidth = 4;
        ctx.shadowColor = themeColors.glow;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw inner circle (hub)
    const hubGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, innerRadius);
    hubGradient.addColorStop(0, themeColors.rim[0]);
    hubGradient.addColorStop(0.5, themeColors.rim[1]);
    hubGradient.addColorStop(1, themeColors.rim[2]);
    
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius - 5, 0, Math.PI * 2);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    
    // Hub highlight
    ctx.beginPath();
    ctx.ellipse(-15, -15, 20, 12, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();

    // Center logo
    ctx.font = 'bold 14px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('FORTUNE', 0, -8);
    ctx.font = '20px sans-serif';
    ctx.fillText('👑', 0, 14);

    ctx.restore();
  }, [items, size, rotation, theme, themeColors, highlightIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    drawWheel(ctx);
  }, [size, drawWheel]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="absolute inset-0"
    />
  );
}
