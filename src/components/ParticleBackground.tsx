import { motion } from 'framer-motion';

// Vegas Color Palette
const VEGAS = {
  black: '#0f0c07',
  gold: '#C9A347',
  goldLight: '#E8D5A3',
  goldDark: '#8B7432',
  wine: '#4A0E1E',
};

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
    size: Math.random() * 3 + 1,
    speedY: Math.random() * 0.3 + 0.1,
    speedX: (Math.random() - 0.5) * 0.2,
    opacity: Math.random() * 0.4 + 0.2,
    delay: Math.random() * 10,
    duration: Math.random() * 20 + 15,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep Vegas black gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 100%, #1a1510 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 0%, #15120d 0%, transparent 50%),
            linear-gradient(180deg, #0a0806 0%, ${VEGAS.black} 50%, #080604 100%)
          `,
        }}
      />

      {/* Brushed metal texture overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              rgba(201, 163, 71, 0.01) 1px,
              rgba(201, 163, 71, 0.01) 2px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.1) 2px,
              rgba(0, 0, 0, 0.1) 4px
            )
          `,
        }}
      />
      
      {/* Central spotlight effect - warm gold */}
      <motion.div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 1000,
          height: 1000,
          background: `radial-gradient(circle, ${VEGAS.gold}10 0%, ${VEGAS.gold}05 30%, transparent 60%)`,
        }}
        animate={{
          opacity: [0.7, 1, 0.7],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Bottom gold reflection */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-80"
        style={{
          background: `linear-gradient(to top, ${VEGAS.gold}08, transparent)`,
        }}
      />

      {/* Wine red accent glow - left */}
      <div 
        className="absolute top-1/2 left-0 w-64 h-96 -translate-y-1/2"
        style={{
          background: `radial-gradient(ellipse at left, ${VEGAS.wine}20, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* Wine red accent glow - right */}
      <div 
        className="absolute top-1/2 right-0 w-64 h-96 -translate-y-1/2"
        style={{
          background: `radial-gradient(ellipse at right, ${VEGAS.wine}20, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* Falling gold particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, ${VEGAS.goldLight} 0%, ${VEGAS.gold} 50%, transparent 100%)`,
            boxShadow: `0 0 ${particle.size * 3}px ${VEGAS.gold}${Math.round(particle.opacity * 255).toString(16).padStart(2, '0')}`,
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

      {/* Twinkling stars */}
      {Array.from({ length: 40 }).map((_, i) => (
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
            opacity: [0.05, 0.5, 0.05],
            scale: [0.8, 1.2, 0.8],
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
              background: VEGAS.goldLight,
              boxShadow: `0 0 6px ${VEGAS.gold}`,
            }}
          />
        </motion.div>
      ))}

      {/* Light beam sweep - gold */}
      <motion.div
        className="absolute top-0 left-0 w-2 h-full"
        style={{
          background: `linear-gradient(to right, transparent, ${VEGAS.gold}15, transparent)`,
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

      {/* Second light beam - platinum */}
      <motion.div
        className="absolute top-0 left-0 w-1 h-full"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(224, 224, 224, 0.1), transparent)',
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

      {/* Strong vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at center, transparent 0%, transparent 30%, rgba(15, 12, 7, 0.5) 70%, rgba(15, 12, 7, 0.9) 100%)
          `,
        }}
      />

      {/* Top fade */}
      <div 
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: `linear-gradient(to bottom, ${VEGAS.black}, transparent)`,
        }}
      />
    </div>
  );
}
