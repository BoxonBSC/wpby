import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  delay: number;
  duration: number;
}

export function ParticleBackground() {
  const particles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    speedY: Math.random() * 0.3 + 0.1,
    speedX: (Math.random() - 0.5) * 0.2,
    opacity: Math.random() * 0.5 + 0.2,
    delay: Math.random() * 8,
    duration: Math.random() * 15 + 10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 深色渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0805] to-[#0d0a06]" />
      
      {/* 中央聚光灯 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/8 via-primary/3 to-transparent blur-3xl" />
      
      {/* 底部金色光晕 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-t from-primary/5 via-transparent to-transparent" />

      {/* 飘落的金色粒子 */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, hsl(45 100% 70%) 0%, hsl(45 100% 50%) 50%, transparent 100%)`,
            boxShadow: `0 0 ${particle.size * 3}px hsl(45 100% 50% / ${particle.opacity})`,
          }}
          initial={{ 
            y: '-5%',
            opacity: 0,
          }}
          animate={{ 
            y: '105vh',
            opacity: [0, particle.opacity, particle.opacity, 0],
            x: [0, particle.speedX * 100, particle.speedX * -100, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* 闪烁的星星 */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 2,
            height: 2,
          }}
          animate={{
            opacity: [0.1, 0.8, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div 
            className="w-full h-full rounded-full bg-primary"
            style={{
              boxShadow: '0 0 6px hsl(45 100% 50% / 0.8)',
            }}
          />
        </motion.div>
      ))}

      {/* 光束效果 */}
      <motion.div
        className="absolute top-0 left-1/4 w-1 h-full opacity-10"
        style={{
          background: 'linear-gradient(to bottom, transparent, hsl(45 100% 50%), transparent)',
        }}
        animate={{
          x: ['0vw', '50vw'],
          opacity: [0, 0.15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatDelay: 5,
        }}
      />

      {/* 暗角效果 */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  );
}
