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
  const particles: Particle[] = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    speedY: Math.random() * 0.3 + 0.1,
    speedX: (Math.random() - 0.5) * 0.2,
    opacity: Math.random() * 0.5 + 0.2,
    delay: Math.random() * 10,
    duration: Math.random() * 20 + 15,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 深色渐变背景 - 更深邃 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 100%, hsl(30, 20%, 5%) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 0%, hsl(220, 20%, 8%) 0%, transparent 50%),
            linear-gradient(180deg, hsl(0, 0%, 2%) 0%, hsl(20, 10%, 4%) 50%, hsl(0, 0%, 2%) 100%)
          `,
        }}
      />

      {/* 金属纹理叠加 */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.01) 2px,
              rgba(255,255,255,0.01) 4px
            )
          `,
        }}
      />
      
      {/* 中央聚光灯效果 */}
      <motion.div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 1000,
          height: 1000,
          background: 'radial-gradient(circle, hsl(45 100% 50% / 0.06) 0%, hsl(45 100% 50% / 0.02) 30%, transparent 60%)',
        }}
        animate={{
          opacity: [0.8, 1, 0.8],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* 底部金色反射 */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-96"
        style={{
          background: 'linear-gradient(to top, hsl(45 100% 50% / 0.04), transparent)',
        }}
      />

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
            boxShadow: `0 0 ${particle.size * 4}px hsl(45 100% 50% / ${particle.opacity})`,
          }}
          initial={{ 
            y: '-5%',
            opacity: 0,
          }}
          animate={{ 
            y: '105vh',
            opacity: [0, particle.opacity, particle.opacity, 0],
            x: [0, particle.speedX * 150, particle.speedX * -150, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* 闪烁的星星 - 更密集 */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 2 + Math.random() * 2,
            height: 2 + Math.random() * 2,
          }}
          animate={{
            opacity: [0.05, 0.6, 0.05],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: 2 + Math.random() * 4,
            delay: Math.random() * 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'hsl(45 100% 70%)',
              boxShadow: '0 0 8px hsl(45 100% 50% / 0.8)',
            }}
          />
        </motion.div>
      ))}

      {/* 光束扫描效果 */}
      <motion.div
        className="absolute top-0 left-0 w-2 h-full"
        style={{
          background: 'linear-gradient(to right, transparent, hsl(45 100% 50% / 0.1), transparent)',
          filter: 'blur(20px)',
        }}
        animate={{
          x: ['-100vw', '200vw'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatDelay: 8,
          ease: 'linear',
        }}
      />

      {/* 第二道光束 */}
      <motion.div
        className="absolute top-0 left-0 w-1 h-full"
        style={{
          background: 'linear-gradient(to right, transparent, hsl(200 100% 60% / 0.08), transparent)',
          filter: 'blur(15px)',
        }}
        animate={{
          x: ['-100vw', '200vw'],
        }}
        transition={{
          duration: 10,
          delay: 5,
          repeat: Infinity,
          repeatDelay: 10,
          ease: 'linear',
        }}
      />

      {/* 暗角效果 - 更强 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at center, transparent 0%, transparent 30%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)
          `,
        }}
      />

      {/* 顶部渐隐 */}
      <div 
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
        }}
      />
    </div>
  );
}
