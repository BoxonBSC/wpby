import { useState } from 'react';
import { RouletteWheel, RouletteItem, THEME_PRESETS } from '@/components/RouletteWheel';
import { ParticleBackground } from '@/components/ParticleBackground';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const DEMO_ITEMS: RouletteItem[] = [
  { id: 'jackpot', label: 'JACKPOT', color: 'hsl(50, 100%, 50%)', icon: '💎', probability: 0.02 },
  { id: 'prize1', label: '1000 coins', color: 'hsl(280, 80%, 55%)', icon: '👑', probability: 0.05 },
  { id: 'prize2', label: '500 coins', color: 'hsl(340, 85%, 55%)', icon: '🔔', probability: 0.08 },
  { id: 'prize3', label: '200 coins', color: 'hsl(200, 90%, 50%)', icon: '⭐', probability: 0.12 },
  { id: 'prize4', label: '100 coins', color: 'hsl(150, 80%, 45%)', icon: '🍀', probability: 0.18 },
  { id: 'prize5', label: '50 coins', color: 'hsl(30, 90%, 50%)', icon: '🎁', probability: 0.20 },
  { id: 'retry', label: 'Try Again', color: 'hsl(220, 40%, 35%)', icon: '🔄', probability: 0.35 },
];

type ThemeKey = keyof typeof THEME_PRESETS;

const RouletteDemo = () => {
  const [theme, setTheme] = useState<ThemeKey>('gold');
  const [lastWin, setLastWin] = useState<RouletteItem | null>(null);
  
  const themes: { key: ThemeKey; label: string; emoji: string }[] = [
    { key: 'gold', label: 'Gold', emoji: '🥇' },
    { key: 'platinum', label: 'Platinum', emoji: '🔷' },
    { key: 'rose', label: 'Rose', emoji: '🌹' },
    { key: 'emerald', label: 'Emerald', emoji: '💚' },
  ];

  const handleWin = (item: RouletteItem, index: number) => {
    setLastWin(item);
    toast({
      title: `🎉 ${item.icon} ${item.label}!`,
      description: item.id === 'retry' ? 'Better luck next time!' : `Congratulations! You won ${item.label}!`,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <ParticleBackground />
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12 px-4">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display text-center mb-4"
          style={{ 
            background: `linear-gradient(135deg, ${THEME_PRESETS[theme].rim[0]}, ${THEME_PRESETS[theme].accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          RouletteWheel Component
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-center mb-8 max-w-lg"
        >
          A standalone, ultra-premium roulette wheel with cinematic animations, 
          volumetric lighting, and customizable themes.
        </motion.p>

        {/* Theme selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-10"
        >
          {themes.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`
                px-4 py-2 rounded-lg font-display text-sm tracking-wide transition-all
                ${theme === key 
                  ? 'bg-white/20 border-white/40 text-white shadow-lg' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'}
                border
              `}
            >
              {emoji} {label}
            </button>
          ))}
        </motion.div>

        {/* Wheel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
        >
          <RouletteWheel
            items={DEMO_ITEMS}
            theme={theme}
            size={380}
            onWin={handleWin}
            onSpinStart={() => setLastWin(null)}
          />
        </motion.div>

        {/* Last win display */}
        {lastWin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground text-sm mb-1">Last Result:</p>
            <p className="text-2xl font-display" style={{ color: THEME_PRESETS[theme].accent }}>
              {lastWin.icon} {lastWin.label}
            </p>
          </motion.div>
        )}

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-muted-foreground"
        >
          {[
            { icon: '🎨', text: 'Canvas Rendering' },
            { icon: '✨', text: 'Gem-Cut Facets' },
            { icon: '🌟', text: 'God Rays Effect' },
            { icon: '🎯', text: 'Probability System' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-2">
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default RouletteDemo;
