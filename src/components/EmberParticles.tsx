import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface EmberParticlesProps {
  count?: number;
}

export function EmberParticles({ count = 30 }: EmberParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 4,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 5,
      opacity: 0.3 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 100,
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            bottom: '-10px',
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, hsl(25 100% 60%) 0%, hsl(15 90% 50%) 50%, hsl(5 75% 40%) 100%)`,
            boxShadow: `0 0 ${particle.size * 2}px hsl(25 100% 55% / 0.6), 0 0 ${particle.size * 4}px hsl(15 90% 50% / 0.3)`,
          }}
          initial={{ 
            y: 0, 
            x: 0,
            opacity: particle.opacity,
            scale: 1,
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, particle.drift],
            opacity: [particle.opacity, particle.opacity * 0.8, 0],
            scale: [1, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
