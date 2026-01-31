import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { PLINKO_CONFIG, SLOT_REWARDS } from '@/config/plinko';

interface PlinkoCanvasProps {
  width: number;
  height: number;
  onBallLanded: (slotIndex: number) => void;
  onCollision?: () => void;
  dropBallTrigger: number;
  targetSlot?: number; // 合约指定的目标槽位
}

export interface PlinkoCanvasRef {
  dropBallToSlot: (targetSlot: number) => void;
}

interface Ball {
  body: Matter.Body;
  graphics: PIXI.Graphics;
  trail: { x: number; y: number; alpha: number }[];
  id: string;
  lastCollisionTime: number;
  targetSlot?: number; // 目标槽位
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
}

export const PlinkoCanvas = forwardRef<PlinkoCanvasRef, PlinkoCanvasProps>(
  ({ width, height, onBallLanded, onCollision, dropBallTrigger, targetSlot }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const trailGraphicsRef = useRef<PIXI.Graphics | null>(null);
  const particleGraphicsRef = useRef<PIXI.Graphics | null>(null);
  const lastDropTrigger = useRef(0);
  const isInitializedRef = useRef(false);
  const onBallLandedRef = useRef(onBallLanded);
  const onCollisionRef = useRef(onCollision);
  const pendingTargetSlot = useRef<number | undefined>(undefined);

  useEffect(() => {
    onBallLandedRef.current = onBallLanded;
    onCollisionRef.current = onCollision;
  }, [onBallLanded, onCollision]);

  const { game, physics, visuals } = PLINKO_CONFIG;
  
  const cols = game.rows + 1;
  const boardWidth = cols * game.pegSpacing;
  const offsetX = (width - boardWidth) / 2;
  const offsetY = 50;
  
  // 计算槽位位置
  const totalBoardHeight = game.rows * game.pegSpacing + 40;
  const slotY = Math.min(offsetY + totalBoardHeight, height - 70);

  // 计算目标槽位的X坐标
  const getSlotCenterX = useCallback((slotIndex: number) => {
    return offsetX + slotIndex * game.pegSpacing + game.pegSpacing / 2;
  }, [offsetX, game.pegSpacing]);

  // 初始化 PIXI 和 Matter
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    const app = new PIXI.Application({
      width,
      height,
      backgroundColor: visuals.backgroundColor,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // 背景装饰层
    const bgLayer = new PIXI.Graphics();
    
    for (let i = 0; i < height; i += 2) {
      const alpha = Math.sin((i / height) * Math.PI) * 0.05;
      bgLayer.beginFill(visuals.pegColor, alpha);
      bgLayer.drawRect(0, i, width, 2);
      bgLayer.endFill();
    }
    
    bgLayer.lineStyle(1, visuals.pegColor, 0.1);
    for (let i = 0; i < width; i += 50) {
      bgLayer.moveTo(i, 0);
      bgLayer.lineTo(i, height);
    }
    for (let i = 0; i < height; i += 50) {
      bgLayer.moveTo(0, i);
      bgLayer.lineTo(width, i);
    }
    app.stage.addChild(bgLayer);

    const trailGfx = new PIXI.Graphics();
    app.stage.addChild(trailGfx);
    trailGraphicsRef.current = trailGfx;

    const engine = Matter.Engine.create({
      gravity: physics.gravity,
    });
    engineRef.current = engine;

    const pegs: Matter.Body[] = [];

    // 计算钉子间距以适应画布
    const availableHeight = slotY - offsetY - 40;
    const pegVerticalSpacing = Math.min(game.pegSpacing, availableHeight / game.rows);
    
    for (let row = 0; row < game.rows; row++) {
      const pegsInRow = row + 3;
      const rowWidth = (pegsInRow - 1) * game.pegSpacing;
      const startX = offsetX + (boardWidth - rowWidth) / 2;
      
      for (let col = 0; col < pegsInRow; col++) {
        const x = startX + col * game.pegSpacing;
        const y = offsetY + row * pegVerticalSpacing + 30;

        const peg = Matter.Bodies.circle(x, y, game.pegRadius, {
          isStatic: true,
          restitution: physics.restitution,
          friction: physics.friction,
          label: 'peg',
        });
        pegs.push(peg);

        const pegContainer = new PIXI.Graphics();
        
        // 钉子光晕（缩小）
        for (let g = 2; g >= 0; g--) {
          pegContainer.beginFill(visuals.pegGlowColor, 0.04 * (3 - g));
          pegContainer.drawCircle(x, y, game.pegRadius + 5 - g * 1.5);
          pegContainer.endFill();
        }
        
        // 钉子渐变
        const gradient = [0xE8D490, 0xC9A347, 0x8B7230];
        gradient.forEach((color, i) => {
          pegContainer.beginFill(color, 1 - i * 0.2);
          pegContainer.drawCircle(x - i * 0.3, y - i * 0.3, game.pegRadius - i * 0.8);
          pegContainer.endFill();
        });
        
        // 高光点
        pegContainer.beginFill(0xFFFFFF, 0.6);
        pegContainer.drawCircle(x - 1.5, y - 1.5, game.pegRadius * 0.2);
        pegContainer.endFill();
        
        app.stage.addChild(pegContainer);
      }
    }
    
    Matter.Composite.add(engine.world, pegs);

    const slots: Matter.Body[] = [];
    const slotWidth = game.pegSpacing;
    
    const slotsContainer = new PIXI.Container();
    app.stage.addChild(slotsContainer);
    
    for (let i = 0; i <= cols; i++) {
      if (i <= cols) {
        const wall = Matter.Bodies.rectangle(
          offsetX + i * slotWidth,
          slotY + 20,
          4,
          45,
          { isStatic: true, label: 'wall' }
        );
        slots.push(wall);
        
        const wallGfx = new PIXI.Graphics();
        const wallGradient = [0xE8D490, 0xC9A347, 0x6B5220];
        wallGradient.forEach((color, idx) => {
          wallGfx.beginFill(color);
          wallGfx.drawRect(offsetX + i * slotWidth - 2 + idx, slotY, 4 - idx, 45);
          wallGfx.endFill();
        });
        
        slotsContainer.addChild(wallGfx);
      }
      
      if (i < cols) {
        const reward = SLOT_REWARDS[i];
        const color = reward?.color || 0x333333;
        const isNoWin = reward?.type === 'no_win';
        
        const slotGfx = new PIXI.Graphics();
        
        // 槽位背景
        slotGfx.beginFill(color, isNoWin ? 0.06 : 0.25);
        slotGfx.drawRoundedRect(
          offsetX + i * slotWidth + 2,
          slotY,
          slotWidth - 4,
          45,
          3
        );
        slotGfx.endFill();
        
        // 底部高亮条
        if (!isNoWin) {
          slotGfx.beginFill(color, 0.6);
          slotGfx.drawRect(
            offsetX + i * slotWidth + 2,
            slotY + 40,
            slotWidth - 4,
            5
          );
          slotGfx.endFill();
        }
        
        slotsContainer.addChild(slotGfx);
        
        // 显示奖励标签
        const label = reward?.label || '';
        
        const textStyle = new PIXI.TextStyle({
          fontFamily: 'Arial, sans-serif',
          fontSize: isNoWin ? 10 : 9,
          fill: isNoWin ? 0x444444 : color,
          fontWeight: 'bold',
          dropShadow: !isNoWin,
          dropShadowColor: color,
          dropShadowBlur: 3,
          dropShadowAlpha: 0.5,
          dropShadowDistance: 0,
        });
        
        const text = new PIXI.Text(label, textStyle);
        text.anchor.set(0.5);
        text.x = offsetX + i * slotWidth + slotWidth / 2;
        text.y = slotY + 20;
        slotsContainer.addChild(text);
      }
    }
    
    for (let i = 0; i < cols; i++) {
      const sensor = Matter.Bodies.rectangle(
        offsetX + i * slotWidth + slotWidth / 2,
        slotY + 35,
        slotWidth - 6,
        10,
        { 
          isStatic: true, 
          isSensor: true,
          label: `slot_${i}`,
        }
      );
      slots.push(sensor);
    }
    
    Matter.Composite.add(engine.world, slots);

    const leftWall = Matter.Bodies.rectangle(offsetX - 20, height / 2, 10, height, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(offsetX + boardWidth + 20, height / 2, 10, height, { isStatic: true });
    Matter.Composite.add(engine.world, [leftWall, rightWall]);

    const particleGfx = new PIXI.Graphics();
    app.stage.addChild(particleGfx);
    particleGraphicsRef.current = particleGfx;

    // 碰撞检测
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        
        if (labels.includes('peg') && labels.includes('ball')) {
          const pegBody = pair.bodyA.label === 'peg' ? pair.bodyA : pair.bodyB;
          const ballBody = pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB;
          
          const ball = ballsRef.current.find(b => b.body === ballBody);
          if (ball && Date.now() - ball.lastCollisionTime > 50) {
            // 粒子效果
            const count = 8;
            for (let i = 0; i < count; i++) {
              const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
              const speed = 2 + Math.random() * 3;
              particlesRef.current.push({
                x: pegBody.position.x,
                y: pegBody.position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 30 + Math.random() * 20,
                size: 2 + Math.random() * 3,
                color: 0xFFD700,
              });
            }
            ball.lastCollisionTime = Date.now();
            
            // 播放碰撞音效
            onCollisionRef.current?.();
          }
        }
        
        labels.forEach((label) => {
          if (label.startsWith('slot_')) {
            const slotIndex = parseInt(label.split('_')[1]);
            const ballBody = pair.bodyA.label === 'ball' ? pair.bodyA : 
                            pair.bodyB.label === 'ball' ? pair.bodyB : null;
            
            if (ballBody) {
              const reward = SLOT_REWARDS[slotIndex];
              const color = reward?.color || 0x444444;
              
              for (let j = 0; j < 20; j++) {
                const angle = (Math.PI * 2 / 20) * j + Math.random() * 0.5;
                const speed = 2 + Math.random() * 3;
                particlesRef.current.push({
                  x: ballBody.position.x,
                  y: ballBody.position.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  life: 1,
                  maxLife: 30 + Math.random() * 20,
                  size: 2 + Math.random() * 3,
                  color,
                });
              }
              
              const ball = ballsRef.current.find(b => b.body === ballBody);
              const finalSlot = ball?.targetSlot !== undefined ? ball.targetSlot : slotIndex;
              
              setTimeout(() => {
                if (ball) {
                  Matter.Composite.remove(engine.world, ball.body);
                  app.stage.removeChild(ball.graphics);
                  ballsRef.current = ballsRef.current.filter(b => b.id !== ball.id);
                  onBallLandedRef.current(finalSlot);
                }
              }, 100);
            }
          }
        });
      });
    });

    // 渲染循环 - 添加引导力
    app.ticker.add(() => {
      Matter.Engine.update(engine, 1000 / 60);
      
      trailGfx.clear();
      
      const ballSize = game.ballRadius;
      
      ballsRef.current.forEach((ball) => {
        const { x, y } = ball.body.position;
        
        // 如果有目标槽位，施加引导力
        if (ball.targetSlot !== undefined) {
          const targetX = getSlotCenterX(ball.targetSlot);
          const dx = targetX - x;
          
          // 只在球下落到一定位置后开始施加力
          if (y > offsetY + 100) {
            // 根据距离计算引导力，越接近目标越小
            const progress = Math.min(1, (y - offsetY - 100) / (slotY - offsetY - 150));
            const forceStrength = 0.00008 * (1 + progress * 2);
            
            // 施加水平引导力
            if (Math.abs(dx) > 5) {
              Matter.Body.applyForce(ball.body, ball.body.position, {
                x: Math.sign(dx) * forceStrength,
                y: 0,
              });
            }
          }
        }
        
        ball.trail.unshift({ x, y, alpha: 0.6 });
        if (ball.trail.length > 12) {
          ball.trail.pop();
        }
        
        ball.trail.forEach((point, i) => {
          const alpha = point.alpha * (1 - i / ball.trail.length);
          const size = ballSize * (1 - i / ball.trail.length * 0.5);
          
          trailGfx.beginFill(0xFFFFFF, alpha * 0.3);
          trailGfx.drawCircle(point.x, point.y, size);
          trailGfx.endFill();
        });
        
        ball.graphics.clear();
        
        // 球体光晕
        for (let g = 3; g >= 0; g--) {
          ball.graphics.beginFill(0xFFFFFF, 0.06 * (4 - g));
          ball.graphics.drawCircle(x, y, ballSize + 8 - g * 2);
          ball.graphics.endFill();
        }
        
        // 球体渐变
        const ballGradient = [0xFFFFFF, 0xE0E0E0, 0xA0A0A0];
        ballGradient.forEach((color, i) => {
          ball.graphics.beginFill(color, 1 - i * 0.15);
          ball.graphics.drawCircle(x - i * 0.8, y - i * 0.8, ballSize - i * 1.2);
          ball.graphics.endFill();
        });
        
        // 高光
        ball.graphics.beginFill(0xFFFFFF, 0.9);
        ball.graphics.drawCircle(x - 2, y - 2, ballSize * 0.25);
        ball.graphics.endFill();
        
        ball.graphics.beginFill(0xFFFFFF, 0.4);
        ball.graphics.drawCircle(x + 1.5, y + 1.5, ballSize * 0.12);
        ball.graphics.endFill();
      });
      
      particleGfx.clear();
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.vx *= 0.98;
        p.life -= 1 / p.maxLife;
        
        if (p.life <= 0) return false;
        
        particleGfx.beginFill(p.color, p.life * 0.8);
        particleGfx.drawCircle(p.x, p.y, p.size * p.life);
        particleGfx.endFill();
        
        return true;
      });
    });

    return () => {
      app.destroy(true, true);
      Matter.Engine.clear(engine);
      appRef.current = null;
      engineRef.current = null;
      isInitializedRef.current = false;
    };
  }, [width, height, getSlotCenterX]);

  // 投放新球到指定槽位
  const dropBallToSlot = useCallback((target: number) => {
    const app = appRef.current;
    const engine = engineRef.current;
    if (!app || !engine) return;

    // 使用高斯分布起始位置
    const u1 = Math.random();
    const u2 = Math.random();
    const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const clampedGaussian = Math.max(-0.3, Math.min(0.3, gaussian * 0.15));
    const startX = offsetX + boardWidth / 2 + clampedGaussian * game.dropZoneWidth;
    const startY = 25;

    const ball = Matter.Bodies.circle(startX, startY, game.ballRadius, {
      restitution: physics.restitution,
      friction: physics.friction,
      frictionAir: physics.frictionAir,
      density: physics.density,
      label: 'ball',
    });
    Matter.Composite.add(engine.world, ball);

    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);

    const ballObj: Ball = {
      body: ball,
      graphics,
      trail: [],
      id: `ball_${Date.now()}_${Math.random()}`,
      lastCollisionTime: 0,
      targetSlot: target, // 设置目标槽位
    };
    
    ballsRef.current.push(ballObj);
    
    // 投放粒子效果
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 30 + Math.random() * 20,
        size: 2 + Math.random() * 3,
        color: 0xFFFFFF,
      });
    }
  }, [offsetX, boardWidth, game, physics]);

  // 投放新球（演示模式，随机结果）
  const dropBall = useCallback(() => {
    const app = appRef.current;
    const engine = engineRef.current;
    if (!app || !engine) return;

    // 检查是否有预设的目标槽位
    const target = pendingTargetSlot.current;
    if (target !== undefined) {
      dropBallToSlot(target);
      pendingTargetSlot.current = undefined;
      return;
    }

    // 使用高斯分布模拟，让球集中在中间
    const u1 = Math.random();
    const u2 = Math.random();
    const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const clampedGaussian = Math.max(-0.3, Math.min(0.3, gaussian * 0.15));
    const startX = offsetX + boardWidth / 2 + clampedGaussian * game.dropZoneWidth;
    const startY = 25;

    const ball = Matter.Bodies.circle(startX, startY, game.ballRadius, {
      restitution: physics.restitution,
      friction: physics.friction,
      frictionAir: physics.frictionAir,
      density: physics.density,
      label: 'ball',
    });
    Matter.Composite.add(engine.world, ball);

    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);

    const ballObj: Ball = {
      body: ball,
      graphics,
      trail: [],
      id: `ball_${Date.now()}_${Math.random()}`,
      lastCollisionTime: 0,
      // 演示模式不设置目标槽位
    };
    
    ballsRef.current.push(ballObj);
    
    // 投放粒子效果
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 30 + Math.random() * 20,
        size: 2 + Math.random() * 3,
        color: 0xFFFFFF,
      });
    }
  }, [offsetX, boardWidth, game, physics, dropBallToSlot]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    dropBallToSlot,
  }), [dropBallToSlot]);

  // 更新待处理的目标槽位
  useEffect(() => {
    if (targetSlot !== undefined) {
      pendingTargetSlot.current = targetSlot;
    }
  }, [targetSlot]);

  useEffect(() => {
    if (dropBallTrigger > lastDropTrigger.current) {
      dropBall();
      lastDropTrigger.current = dropBallTrigger;
    }
  }, [dropBallTrigger, dropBall]);

  return (
    <div 
      ref={containerRef} 
      className="rounded-2xl overflow-hidden relative"
      style={{ 
        width, 
        height,
        boxShadow: `
          0 0 80px rgba(201, 163, 71, 0.4),
          0 0 120px rgba(201, 163, 71, 0.2),
          inset 0 0 60px rgba(0, 0, 0, 0.8),
          inset 0 2px 0 rgba(201, 163, 71, 0.3)
        `,
        border: '2px solid rgba(201, 163, 71, 0.4)',
      }}
    />
  );
});

PlinkoCanvas.displayName = 'PlinkoCanvas';
