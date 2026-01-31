import { motion } from 'framer-motion';
import { Card, SUIT_COLORS } from '@/config/hilo';

interface PlayingCardProps {
  card: Card | null;
  isFlipped?: boolean;
  isNew?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayingCard({ card, isFlipped = false, isNew = false, size = 'lg' }: PlayingCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-24 text-lg',
    md: 'w-24 h-36 text-2xl',
    lg: 'w-32 h-48 text-4xl',
  };

  const suitColor = card ? SUIT_COLORS[card.suit] : '#C9A347';

  return (
    <div className={`${sizeClasses[size]} perspective-1000`}>
      <motion.div
        className="relative w-full h-full"
        initial={isNew ? { rotateY: 180 } : { rotateY: isFlipped ? 180 : 0 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 正面 */}
        <div
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center backface-hidden"
          style={{
            background: 'linear-gradient(145deg, #1a1612 0%, #0f0c08 100%)',
            border: `2px solid ${suitColor}`,
            boxShadow: `0 0 20px ${suitColor}40, inset 0 0 30px rgba(0,0,0,0.5)`,
          }}
        >
          {card && (
            <>
              {/* 左上角 */}
              <div 
                className="absolute top-2 left-2 flex flex-col items-center"
                style={{ color: suitColor }}
              >
                <span className="font-bold text-sm">{card.rank}</span>
                <span className="text-xs">{card.suit}</span>
              </div>
              
              {/* 中心 */}
              <div 
                className="flex flex-col items-center"
                style={{ color: suitColor }}
              >
                <span className="font-bold">{card.rank}</span>
                <span className="text-5xl">{card.suit}</span>
              </div>
              
              {/* 右下角（倒置） */}
              <div 
                className="absolute bottom-2 right-2 flex flex-col items-center rotate-180"
                style={{ color: suitColor }}
              >
                <span className="font-bold text-sm">{card.rank}</span>
                <span className="text-xs">{card.suit}</span>
              </div>
            </>
          )}
        </div>

        {/* 背面 */}
        <div
          className="absolute inset-0 rounded-xl backface-hidden"
          style={{
            background: 'linear-gradient(145deg, #1a1612 0%, #0f0c08 100%)',
            border: '2px solid #C9A347',
            boxShadow: '0 0 20px rgba(201, 163, 71, 0.3)',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* 背面花纹 */}
          <div 
            className="absolute inset-2 rounded-lg"
            style={{
              background: `
                repeating-linear-gradient(
                  45deg,
                  #C9A34710 0px,
                  #C9A34710 2px,
                  transparent 2px,
                  transparent 8px
                )
              `,
              border: '1px solid #C9A34730',
            }}
          />
          <div 
            className="absolute inset-4 rounded flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #C9A34720 0%, transparent 100%)',
            }}
          >
            <span className="text-[#C9A347] text-3xl font-bold opacity-30">♠</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
