import { motion, AnimatePresence } from 'framer-motion';
import { THEME_PRESETS } from './types';

interface WinCelebrationProps {
  isActive: boolean;
  theme: keyof typeof THEME_PRESETS;
  size: number;
}

export function WinCelebration({ isActive, theme, size }: WinCelebrationProps) {
  const colors = THEME_PRESETS[theme];

  return (
    <AnimatePresence>
      {isActive && (
        <div 
          className="absolute inset-0 pointer-events-none overflow-visible"
          style={{ width: size, height: size }}
        >
          {/* Shockwave rings */}
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={`ring-${ring}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                border: `2px solid ${colors.accent}`,
                boxShadow: `0 0 20px ${colors.glow}, inset 0 0 20px ${colors.glow}40`,
              }}
              initial={{ width: 50, height: 50, opacity: 0.8 }}
              animate={{
                width: size + 100,
                height: size + 100,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.2,
                delay: ring * 0.25,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Particle explosion */}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * Math.PI * 2;
            const distance = 80 + Math.random() * 120;
            const particleSize = 3 + Math.random() * 6;
            
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute top-1/2 left-1/2 rounded-full"
                style={{
                  width: particleSize,
                  height: particleSize,
                  background: i % 3 === 0 
                    ? colors.accent 
                    : i % 3 === 1 
                      ? colors.primary 
                      : 'white',
                  boxShadow: `0 0 ${particleSize * 2}px ${colors.glow}`,
                }}
                initial={{ 
                  x: -particleSize / 2, 
                  y: -particleSize / 2,
                  scale: 0,
                }}
                animate={{
                  x: Math.cos(angle) * distance - particleSize / 2,
                  y: Math.sin(angle) * distance - particleSize / 2,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1 + Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            );
          })}

          {/* Sparkle stars */}
          {Array.from({ length: 20 }).map((_, i) => {
            const x = Math.random() * size;
            const y = Math.random() * size;
            
            return (
              <motion.div
                key={`star-${i}`}
                className="absolute text-xl"
                style={{ left: x, top: y }}
                initial={{ scale: 0, rotate: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + Math.random() * 0.6,
                }}
              >
                ✨
              </motion.div>
            );
          })}

          {/* Central flash */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: size * 0.5,
              height: size * 0.5,
              background: `radial-gradient(circle, white 0%, ${colors.glow} 30%, transparent 70%)`,
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              scale: [0.2, 2, 0],
              opacity: [0, 0.9, 0],
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
