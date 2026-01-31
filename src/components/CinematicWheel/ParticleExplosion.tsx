import { motion } from 'framer-motion';
import { ThemeType, THEME_COLORS } from './types';

interface ParticleExplosionProps {
  isActive: boolean;
  theme: ThemeType;
}

export function ParticleExplosion({ isActive, theme }: ParticleExplosionProps) {
  const colors = THEME_COLORS[theme];
  
  if (!isActive) return null;

  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    angle: (i * 6) + Math.random() * 10,
    distance: 150 + Math.random() * 200,
    size: 3 + Math.random() * 8,
    delay: Math.random() * 0.3,
    duration: 1.5 + Math.random() * 1,
    color: i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.accent : colors.glow,
  }));

  const sparks = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    angle: i * 12,
    length: 50 + Math.random() * 100,
    delay: Math.random() * 0.2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 圆形冲击波 */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
        style={{
          border: `2px solid ${colors.primary}`,
          boxShadow: `0 0 40px ${colors.glow}, inset 0 0 40px ${colors.glow}`,
        }}
      />

      {/* 第二层冲击波 */}
      <motion.div
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.glow}40, transparent)`,
        }}
      />

      {/* 光线喷射 */}
      {sparks.map((spark) => {
        const rad = (spark.angle * Math.PI) / 180;
        return (
          <motion.div
            key={`spark-${spark.id}`}
            initial={{ 
              scaleY: 0, 
              opacity: 1,
              x: '-50%',
              y: '-50%',
            }}
            animate={{ 
              scaleY: [0, 1, 0],
              opacity: [1, 0.8, 0],
            }}
            transition={{ 
              duration: 0.6,
              delay: spark.delay,
              ease: 'easeOut',
            }}
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{
              width: 2,
              height: spark.length,
              background: `linear-gradient(to top, ${colors.accent}, transparent)`,
              transform: `rotate(${spark.angle}deg)`,
              boxShadow: `0 0 8px ${colors.glow}`,
            }}
          />
        );
      })}

      {/* 粒子 */}
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const endX = Math.cos(rad) * p.distance;
        const endY = Math.sin(rad) * p.distance;
        
        return (
          <motion.div
            key={`particle-${p.id}`}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0,
              opacity: 1,
            }}
            animate={{ 
              x: endX,
              y: endY,
              scale: [0, 1.5, 0.5],
              opacity: [1, 1, 0],
            }}
            transition={{ 
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        );
      })}

      {/* 闪光星星 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30;
        const distance = 80 + Math.random() * 60;
        const rad = (angle * Math.PI) / 180;
        
        return (
          <motion.div
            key={`star-${i}`}
            initial={{ 
              scale: 0, 
              opacity: 0,
              x: Math.cos(rad) * distance,
              y: Math.sin(rad) * distance,
            }}
            animate={{ 
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180],
            }}
            transition={{ 
              duration: 0.8,
              delay: 0.2 + i * 0.05,
            }}
            className="absolute top-1/2 left-1/2"
            style={{
              width: 20,
              height: 20,
            }}
          >
            <svg viewBox="0 0 24 24" fill={colors.accent}>
              <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}
