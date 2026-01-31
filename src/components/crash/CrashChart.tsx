import { useRef, useEffect, useCallback } from 'react';
import { GameState, getMultiplierColor } from '@/config/crash';

interface CrashChartProps {
  multiplier: number;
  gameState: GameState;
  crashPoint?: number;
}

export function CrashChart({ multiplier, gameState, crashPoint }: CrashChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const animationRef = useRef<number>();

  // 将倍数转换为Y坐标（对数缩放）
  const multiplierToY = useCallback((m: number, height: number) => {
    const minM = 1;
    const maxM = Math.max(10, multiplier * 1.5);
    const logMin = Math.log(minM);
    const logMax = Math.log(maxM);
    const logM = Math.log(Math.max(m, minM));
    const normalized = (logM - logMin) / (logMax - logMin);
    return height - (normalized * height * 0.85) - 40;
  }, [multiplier]);

  // 绘制图表
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 背景网格
    ctx.strokeStyle = 'rgba(201, 163, 71, 0.1)';
    ctx.lineWidth = 1;
    
    // 横线
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // 竖线
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Y轴标签
    ctx.fillStyle = 'rgba(201, 163, 71, 0.5)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    
    const maxM = Math.max(10, multiplier * 1.5);
    const labels = [1, 2, 5, 10, 20, 50, 100].filter(m => m <= maxM);
    labels.forEach(m => {
      const y = multiplierToY(m, height);
      if (y > 20 && y < height - 20) {
        ctx.fillText(`${m}x`, 35, y + 4);
      }
    });

    // 添加当前点到轨迹
    if (gameState === 'running' && multiplier > 1) {
      const progress = pointsRef.current.length / 200;
      pointsRef.current.push({
        x: 50 + progress * (width - 70),
        y: multiplierToY(multiplier, height),
      });
      
      // 限制点数
      if (pointsRef.current.length > 500) {
        pointsRef.current = pointsRef.current.slice(-500);
      }
    }

    // 绘制曲线
    if (pointsRef.current.length > 1) {
      const color = getMultiplierColor(multiplier);
      
      // 发光效果
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      
      // 曲线
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
      
      for (let i = 1; i < pointsRef.current.length; i++) {
        ctx.lineTo(pointsRef.current[i].x, pointsRef.current[i].y);
      }
      ctx.stroke();
      
      // 当前点
      const lastPoint = pointsRef.current[pointsRef.current.length - 1];
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // 重置阴影
      ctx.shadowBlur = 0;
    }

    // 崩盘效果
    if (gameState === 'crashed' && crashPoint) {
      // 红色闪烁背景
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // 爆炸效果
      if (pointsRef.current.length > 0) {
        const lastPoint = pointsRef.current[pointsRef.current.length - 1];
        const gradient = ctx.createRadialGradient(
          lastPoint.x, lastPoint.y, 0,
          lastPoint.x, lastPoint.y, 100
        );
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
    }

    // 等待状态
    if (gameState === 'waiting') {
      pointsRef.current = [];
    }

  }, [multiplier, gameState, crashPoint, multiplierToY]);

  // 动画循环
  useEffect(() => {
    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  // 重置曲线
  useEffect(() => {
    if (gameState === 'waiting') {
      pointsRef.current = [];
    }
  }, [gameState]);

  // 响应式画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
      }
    });

    resizeObserver.observe(canvas.parentElement!);
    
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
