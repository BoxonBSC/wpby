import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  emoji?: string;
  delay: number;
  duration: number;
}

const COLORS = [
  'rgb(34, 211, 238)',   // cyan
  'rgb(168, 85, 247)',   // purple
  'rgb(250, 204, 21)',   // yellow
  'rgb(251, 146, 60)',   // orange
  'rgb(236, 72, 153)',   // pink
  'rgb(74, 222, 128)',   // green
];

const EMOJIS = ['🔥', '⚡', '💎', '🚀', '✨', '💰', '🎯', '👑'];

function createParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const isEmoji = i < 8;
    particles.push({
      id: i,
      x: 0,
      y: 0,
      angle,
      speed: 80 + Math.random() * 180,
      size: isEmoji ? 20 + Math.random() * 12 : 4 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      emoji: isEmoji ? EMOJIS[i % EMOJIS.length] : undefined,
      delay: Math.random() * 0.15,
      duration: 0.8 + Math.random() * 0.6,
    });
  }
  return particles;
}

interface BidSuccessParticlesProps {
  trigger: number; // increment to trigger
}

export function BidSuccessParticles({ trigger }: BidSuccessParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showRing, setShowRing] = useState(false);

  const burst = useCallback(() => {
    setParticles(createParticles(40));
    setShowRing(true);
    setTimeout(() => {
      setParticles([]);
      setShowRing(false);
    }, 1800);
  }, []);

  useEffect(() => {
    if (trigger > 0) burst();
  }, [trigger, burst]);

  if (particles.length === 0 && !showRing) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Shockwave ring */}
      <AnimatePresence>
        {showRing && (
          <motion.div
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute w-32 h-32 rounded-full border-2 border-cyan-400/60"
            style={{ boxShadow: '0 0 40px rgba(34,211,238,0.3), inset 0 0 40px rgba(34,211,238,0.1)' }}
          />
        )}
      </AnimatePresence>

      {/* Center flash */}
      <AnimatePresence>
        {showRing && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400/40 to-purple-500/40 blur-xl"
          />
        )}
      </AnimatePresence>

      {/* Particles */}
      {particles.map((p) => {
        const tx = Math.cos(p.angle) * p.speed;
        const ty = Math.sin(p.angle) * p.speed - 30; // slight upward bias
        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: tx,
              y: ty,
              scale: [1, 1.2, 0],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
            }}
            className="absolute"
            style={{ fontSize: p.emoji ? p.size : undefined }}
          >
            {p.emoji ? (
              <span>{p.emoji}</span>
            ) : (
              <div
                className="rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Success text */}
      <AnimatePresence>
        {showRing && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="absolute text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-400 to-pink-400 drop-shadow-lg"
            style={{ textShadow: '0 0 30px rgba(34,211,238,0.5)' }}
          >
            出价成功！🔥
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
