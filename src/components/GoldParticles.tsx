import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  angle: number;
  distance: number;
}

export function GoldParticles() {
  const location = useLocation();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // 页面切换时触发粒子效果
    triggerParticles();
  }, [location.pathname]);

  const triggerParticles = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // 生成粒子
    const newParticles: Particle[] = [];
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: 64, // 导航栏高度
        size: Math.random() * 8 + 4,
        duration: Math.random() * 1.5 + 1,
        delay: Math.random() * 0.3,
        angle: Math.random() * 360,
        distance: Math.random() * 150 + 50,
      });
    }
    
    setParticles(newParticles);
    
    // 清理粒子
    setTimeout(() => {
      setParticles([]);
      setIsAnimating(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => {
          const radians = (particle.angle * Math.PI) / 180;
          const endX = Math.cos(radians) * particle.distance;
          const endY = Math.sin(radians) * particle.distance + 100; // 向下偏移
          
          return (
            <motion.div
              key={particle.id}
              initial={{ 
                x: particle.x, 
                y: particle.y,
                scale: 0,
                opacity: 1,
              }}
              animate={{ 
                x: particle.x + endX,
                y: particle.y + endY,
                scale: [0, 1.5, 1, 0.5, 0],
                opacity: [1, 1, 0.8, 0.4, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeOut",
              }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                borderRadius: '50%',
                background: `radial-gradient(circle, #FFD700 0%, #C9A347 50%, transparent 100%)`,
                boxShadow: `0 0 ${particle.size * 2}px rgba(255, 215, 0, 0.8), 0 0 ${particle.size * 4}px rgba(201, 163, 71, 0.4)`,
              }}
            />
          );
        })}
      </AnimatePresence>
      
      {/* 闪光条效果 */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-16 left-0 right-0 h-[2px] origin-left"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #FFD700 20%, #FFA500 50%, #FFD700 80%, transparent 100%)',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.4)',
            }}
          />
        )}
      </AnimatePresence>
      
      {/* 星光闪烁 */}
      <AnimatePresence>
        {particles.slice(0, 8).map((particle, i) => (
          <motion.div
            key={`star-${particle.id}`}
            initial={{ 
              x: particle.x, 
              y: particle.y,
              scale: 0,
              rotate: 0,
              opacity: 0,
            }}
            animate={{ 
              scale: [0, 1, 0],
              rotate: [0, 180],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.8,
              delay: particle.delay + 0.1,
              ease: "easeOut",
            }}
            style={{
              position: 'absolute',
              width: 20,
              height: 20,
            }}
          >
            {/* 四角星形状 */}
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path 
                d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" 
                fill="url(#starGradient)"
                filter="url(#glow)"
              />
              <defs>
                <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
