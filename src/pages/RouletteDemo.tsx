import { useState } from 'react';
import { RouletteWheel, RouletteItem, THEME_PRESETS, VEGAS_COLORS } from '@/components/RouletteWheel';
import { ParticleBackground } from '@/components/ParticleBackground';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const DEMO_ITEMS: RouletteItem[] = [
  { id: 'jackpot', label: 'JACKPOT', color: VEGAS_COLORS.gold, icon: '💎', probability: 0.02 },
  { id: 'prize1', label: '1000 coins', color: VEGAS_COLORS.wine, icon: '👑', probability: 0.05 },
  { id: 'prize2', label: '500 coins', color: '#8B7432', icon: '🔔', probability: 0.08 },
  { id: 'prize3', label: '200 coins', color: VEGAS_COLORS.goldDark, icon: '⭐', probability: 0.12 },
  { id: 'prize4', label: '100 coins', color: VEGAS_COLORS.wineLight, icon: '🍀', probability: 0.18 },
  { id: 'prize5', label: '50 coins', color: '#5a3a2a', icon: '🎁', probability: 0.20 },
  { id: 'retry', label: 'Try Again', color: '#1a1814', icon: '🔄', probability: 0.35 },
];

type ThemeKey = keyof typeof THEME_PRESETS;

const RouletteDemo = () => {
  const [theme, setTheme] = useState<ThemeKey>('gold');
  const [lastWin, setLastWin] = useState<RouletteItem | null>(null);
  
  const themes: { key: ThemeKey; label: string; emoji: string }[] = [
    { key: 'gold', label: 'Gold', emoji: '🥇' },
    { key: 'platinum', label: 'Platinum', emoji: '🔷' },
    { key: 'rose', label: 'Wine', emoji: '🍷' },
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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: VEGAS_COLORS.black }}>
      <ParticleBackground />
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12 px-4">
        {/* Title with embossed gold effect */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display text-center mb-2 title-embossed"
        >
          FORTUNE WHEEL
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8 max-w-lg font-display text-sm tracking-widest"
          style={{ color: VEGAS_COLORS.goldDark }}
        >
          CLASSIC LAS VEGAS LUXURY CASINO
        </motion.p>

        {/* Ornamental divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.2 }}
          className="w-64 h-px mb-8"
          style={{
            background: `linear-gradient(90deg, transparent, ${VEGAS_COLORS.gold}, transparent)`,
          }}
        />

        {/* Theme selector with leather-style buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 mb-10"
        >
          {themes.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`
                px-5 py-2.5 rounded-lg font-display text-sm tracking-wider transition-all
                ${theme === key 
                  ? 'border-2 shadow-lg' 
                  : 'border hover:border-opacity-70'}
              `}
              style={{
                background: theme === key 
                  ? `linear-gradient(135deg, #2a1f1a 0%, #1a1210 50%, #2a1f1a 100%)`
                  : 'transparent',
                borderColor: theme === key ? VEGAS_COLORS.gold : `${VEGAS_COLORS.gold}40`,
                color: theme === key ? VEGAS_COLORS.goldLight : VEGAS_COLORS.goldDark,
                boxShadow: theme === key 
                  ? `0 0 20px ${VEGAS_COLORS.gold}30, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : 'none',
              }}
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
            <p className="text-sm mb-1 font-display tracking-wider" style={{ color: VEGAS_COLORS.goldDark }}>
              LAST RESULT
            </p>
            <p className="text-2xl font-display" style={{ color: VEGAS_COLORS.goldLight }}>
              {lastWin.icon} {lastWin.label}
            </p>
          </motion.div>
        )}

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs"
          style={{ color: VEGAS_COLORS.goldDark }}
        >
          {[
            { icon: '🎨', text: 'Canvas Rendering' },
            { icon: '💎', text: 'Gem-Cut Facets' },
            { icon: '✨', text: 'God Rays Effect' },
            { icon: '🎯', text: 'Probability System' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-2 font-display tracking-wider">
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </motion.div>

        {/* Bottom ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex items-center gap-4"
        >
          <div 
            className="w-16 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${VEGAS_COLORS.gold}50)` }}
          />
          <span style={{ color: VEGAS_COLORS.gold }}>♠</span>
          <span style={{ color: VEGAS_COLORS.wine }}>♥</span>
          <span style={{ color: VEGAS_COLORS.gold }}>♦</span>
          <span style={{ color: VEGAS_COLORS.platinum }}>♣</span>
          <div 
            className="w-16 h-px"
            style={{ background: `linear-gradient(90deg, ${VEGAS_COLORS.gold}50, transparent)` }}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default RouletteDemo;
