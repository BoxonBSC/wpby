import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RouletteWheelProps, RouletteItem, THEME_PRESETS, SoundEffects } from './types';
import { WheelCanvas } from './WheelCanvas';
import { Pointer } from './Pointer';
import { GodRays } from './GodRays';
import { WinCelebration } from './WinCelebration';

export function RouletteWheel({
  items,
  onWin,
  onSpinStart,
  onSpinEnd,
  spinning: controlledSpinning,
  disabled = false,
  size = 400,
  theme = 'gold',
}: RouletteWheelProps) {
  const [internalSpinning, setInternalSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGodRays, setShowGodRays] = useState(false);
  
  const wheelControls = useAnimation();
  const soundEffectsRef = useRef<SoundEffects>({});
  const lastTickRef = useRef(0);
  
  const isSpinning = controlledSpinning ?? internalSpinning;
  const colors = THEME_PRESETS[theme];

  // Select winner based on probability
  const selectWinner = useCallback((): { item: RouletteItem; index: number } => {
    const totalProbability = items.reduce((sum, item) => sum + (item.probability || 1), 0);
    const random = Math.random() * totalProbability;
    
    let cumulative = 0;
    for (let i = 0; i < items.length; i++) {
      cumulative += items[i].probability || 1;
      if (random <= cumulative) {
        return { item: items[i], index: i };
      }
    }
    
    return { item: items[items.length - 1], index: items.length - 1 };
  }, [items]);

  // Calculate target rotation angle
  const calculateTargetRotation = useCallback((winnerIndex: number): number => {
    const sectorAngle = 360 / items.length;
    const targetSectorCenter = winnerIndex * sectorAngle + sectorAngle / 2;
    // Spin 6-10 full rotations plus the target position
    const spins = 6 + Math.random() * 4;
    return spins * 360 + (360 - targetSectorCenter);
  }, [items.length]);

  // Trigger tick sound based on rotation
  useEffect(() => {
    if (!isSpinning) return;
    
    const sectorAngle = 360 / items.length;
    const currentSector = Math.floor((rotation % 360) / sectorAngle);
    
    if (currentSector !== lastTickRef.current) {
      lastTickRef.current = currentSector;
      soundEffectsRef.current.tick?.();
    }
  }, [rotation, isSpinning, items.length]);

  // Main spin function
  const spin = async () => {
    if (isSpinning || disabled) return;
    
    setInternalSpinning(true);
    setWinnerIndex(null);
    setShowCelebration(false);
    setShowGodRays(true);
    onSpinStart?.();
    soundEffectsRef.current.spinStart?.();

    const winner = selectWinner();
    const targetRotation = calculateTargetRotation(winner.index);

    // Phase 1: Wind-up (slight backward rotation)
    await wheelControls.start({
      rotate: rotation - 20,
      transition: {
        duration: 0.35,
        ease: [0.36, 0, 0.66, -0.56],
      },
    });

    // Phase 2: Main spin with custom easing
    const newRotation = rotation + targetRotation;
    await wheelControls.start({
      rotate: newRotation,
      transition: {
        duration: 5.5,
        ease: [0.12, 0.85, 0.15, 1], // Fast start, elegant deceleration
      },
    });

    // Phase 3: Settling micro-jitter
    await wheelControls.start({
      rotate: [newRotation, newRotation + 1.5, newRotation - 0.8, newRotation],
      transition: {
        duration: 0.45,
        times: [0, 0.35, 0.7, 1],
        ease: 'easeOut',
      },
    });

    setRotation(newRotation);
    setWinnerIndex(winner.index);
    setShowGodRays(false);
    
    // Trigger celebration
    setShowCelebration(true);
    soundEffectsRef.current.spinEnd?.();
    soundEffectsRef.current.win?.();
    
    onWin?.(winner.item, winner.index);

    // Reset after celebration
    setTimeout(() => {
      setInternalSpinning(false);
      setShowCelebration(false);
      onSpinEnd?.();
    }, 2500);
  };

  // Allow external sound effect injection
  const setSoundEffects = (effects: SoundEffects) => {
    soundEffectsRef.current = effects;
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Ambient glow background */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: size + 180,
          height: size + 180,
          top: -90,
          left: -90,
          background: `radial-gradient(circle, ${colors.glow}18 0%, transparent 65%)`,
        }}
        animate={{
          opacity: isSpinning ? [0.6, 1, 0.6] : [0.4, 0.7, 0.4],
          scale: isSpinning ? [1, 1.08, 1] : [1, 1.03, 1],
        }}
        transition={{
          duration: isSpinning ? 0.8 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Wheel container with 3D perspective */}
      <div 
        className="relative"
        style={{ 
          width: size + 30, 
          height: size + 30,
          perspective: '1200px',
        }}
      >
        {/* 3D tilt wrapper */}
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(6deg)',
          }}
          animate={isSpinning ? { rotateX: [6, 4, 6] } : {}}
          transition={{ duration: 0.4, repeat: isSpinning ? Infinity : 0 }}
        >
          {/* Shadow */}
          <div 
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: 15,
              top: 25,
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 65%)',
              filter: 'blur(18px)',
              transform: 'rotateX(-6deg) translateZ(-40px)',
            }}
          />

          {/* Outer decorative ring */}
          <div 
            className="absolute rounded-full"
            style={{
              width: size + 24,
              height: size + 24,
              left: 3,
              top: 3,
              background: `conic-gradient(from 0deg, ${colors.rim[0]}50, ${colors.rim[1]}30, ${colors.rim[0]}50, ${colors.rim[1]}30, ${colors.rim[0]}50)`,
              filter: 'blur(1px)',
            }}
          />

          {/* Base ring */}
          <div 
            className="absolute rounded-full"
            style={{
              width: size + 16,
              height: size + 16,
              left: 7,
              top: 7,
              background: `linear-gradient(135deg, ${colors.rim[2]} 0%, #0a0a0a 50%, ${colors.rim[2]} 100%)`,
              boxShadow: `
                inset 0 2px 15px rgba(255,255,255,0.12),
                inset 0 -2px 15px rgba(0,0,0,0.7),
                0 8px 35px rgba(0,0,0,0.45)
              `,
            }}
          />

          {/* Main wheel */}
          <motion.div
            className="absolute rounded-full overflow-hidden"
            style={{
              width: size,
              height: size,
              left: 15,
              top: 15,
              background: '#0f0f0f',
            }}
            animate={wheelControls}
            initial={{ rotate: 0 }}
            onUpdate={(latest) => {
              if (typeof latest.rotate === 'number') {
                setRotation(latest.rotate);
              }
            }}
          >
            {/* Brushed metal background */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  repeating-linear-gradient(
                    90deg,
                    rgba(255,255,255,0.02) 0px,
                    rgba(0,0,0,0.04) 1px,
                    rgba(255,255,255,0.01) 2px
                  ),
                  radial-gradient(ellipse at 25% 20%, rgba(255,255,255,0.08) 0%, transparent 45%),
                  radial-gradient(circle, hsl(0, 0%, 10%) 0%, hsl(0, 0%, 4%) 100%)
                `,
              }}
            />

            {/* Canvas wheel */}
            <WheelCanvas 
              items={items}
              size={size}
              rotation={rotation}
              theme={theme}
              highlightIndex={winnerIndex}
            />

            {/* Motion blur overlay when spinning */}
            {isSpinning && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, transparent 25%, ${colors.glow}08 100%)`,
                  filter: 'blur(2px)',
                }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 0.08, repeat: Infinity }}
              />
            )}

            {/* God rays effect */}
            <GodRays isActive={showGodRays} theme={theme} size={size} />
          </motion.div>
        </motion.div>

        {/* Crystal pointer */}
        <Pointer isSpinning={isSpinning} theme={theme} />

        {/* Win celebration */}
        <WinCelebration isActive={showCelebration} theme={theme} size={size} />
      </div>

      {/* Spin button */}
      <motion.button
        onClick={spin}
        disabled={isSpinning || disabled}
        className="mt-8 relative overflow-hidden group disabled:cursor-not-allowed"
        whileHover={{ scale: isSpinning || disabled ? 1 : 1.04 }}
        whileTap={{ scale: isSpinning || disabled ? 1 : 0.96 }}
      >
        {/* Button gradient background */}
        <div 
          className="absolute inset-0 rounded-xl transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${colors.rim[0]}, ${colors.rim[1]}, ${colors.rim[2]})`,
            opacity: isSpinning || disabled ? 0.5 : 1,
          }}
        />
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
        />

        {/* Button content */}
        <div 
          className="relative px-10 py-3.5 font-display text-lg tracking-wider"
          style={{ color: '#000' }}
        >
          {isSpinning ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              >
                ✨
              </motion.span>
              Spinning...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              🎰 SPIN
            </span>
          )}
        </div>
      </motion.button>
    </div>
  );
}

// Re-export types
export type { RouletteItem, RouletteWheelProps, SoundEffects } from './types';
export { THEME_PRESETS } from './types';
