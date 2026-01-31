import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export type GameType = 'slots' | 'wheel';

interface GameSwitcherProps {
  currentGame: GameType;
  onGameChange: (game: GameType) => void;
}

export function GameSwitcher({ currentGame, onGameChange }: GameSwitcherProps) {
  const { t } = useLanguage();

  const games: { type: GameType; emoji: string; name: string }[] = [
    { type: 'slots', emoji: '🎰', name: t('game.slots') || '老虎机' },
    { type: 'wheel', emoji: '🎡', name: t('game.wheel') || '幸运转盘' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/50">
      {games.map((game) => (
        <motion.button
          key={game.type}
          onClick={() => onGameChange(game.type)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            px-4 py-2 rounded-lg font-display text-sm flex items-center gap-2 transition-all
            ${currentGame === game.type
              ? 'bg-neon-purple/30 border border-neon-purple text-neon-purple shadow-[0_0_15px_hsl(280_100%_50%/0.3)]'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }
          `}
        >
          <span className="text-lg">{game.emoji}</span>
          <span>{game.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
