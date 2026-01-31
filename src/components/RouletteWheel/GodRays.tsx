import { motion } from 'framer-motion';
import { THEME_PRESETS } from './types';

interface GodRaysProps {
  isActive: boolean;
  theme: keyof typeof THEME_PRESETS;
  size: number;
}

export function GodRays({ isActive, theme, size }: GodRaysProps) {
  const colors = THEME_PRESETS[theme];
  
  if (!isActive) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      {/* Volumetric light rays */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: 3,
            height: size * 0.6,
            background: `linear-gradient(to bottom, ${colors.glow}40, transparent)`,
            transformOrigin: 'top center',
            transform: `rotate(${i * 30}deg) translateX(-50%)`,
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            scaleY: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Central burst */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.glow}60 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Lens flare spots */}
      {[
        { x: 30, y: 25, size: 8 },
        { x: 70, y: 35, size: 5 },
        { x: 25, y: 65, size: 6 },
        { x: 75, y: 70, size: 4 },
      ].map((flare, i) => (
        <motion.div
          key={`flare-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${flare.x}%`,
            top: `${flare.y}%`,
            width: flare.size,
            height: flare.size,
            background: colors.accent,
            boxShadow: `0 0 ${flare.size * 2}px ${colors.glow}`,
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 1 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
