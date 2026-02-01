import { motion } from 'framer-motion';
import { Card, SUIT_COLORS } from '@/config/hilo';

interface PlayingCardProps {
  card: Card | null;
  isFlipped?: boolean;
  isNew?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayingCard({ card, isFlipped = false, isNew = false, size = 'lg' }: PlayingCardProps) {
  // 响应式：在移动端使用较小的尺寸
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const effectiveSize = isMobile && size === 'lg' ? 'md' : size;
  
  const sizeClasses = {
    sm: { width: 56, height: 84, fontSize: '1rem' },
    md: { width: 80, height: 120, fontSize: '1.25rem' },
    lg: { width: 120, height: 180, fontSize: '2rem' },
  };

  const suitColor = card ? SUIT_COLORS[card.suit] : '#C9A347';
  const sizeStyle = sizeClasses[effectiveSize];

  return (
    <div 
      style={{ 
        width: sizeStyle.width, 
        height: sizeStyle.height,
        perspective: '1000px',
      }}
    >
      <motion.div
        className="relative w-full h-full"
        initial={isNew ? { rotateY: 180, scale: 0.9 } : { rotateY: isFlipped ? 180 : 0 }}
        animate={{ rotateY: isFlipped ? 180 : 0, scale: 1 }}
        transition={{ 
          duration: isNew ? 1.2 : 0.6, 
          ease: [0.34, 1.56, 0.64, 1], // 带弹性的缓动曲线
          scale: { duration: 0.8, ease: "easeOut" }
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 正面 */}
        <div
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #1a1612 0%, #0f0c08 100%)',
            border: `2px solid ${suitColor}`,
            boxShadow: `0 0 20px ${suitColor}40, inset 0 0 30px rgba(0,0,0,0.5)`,
            backfaceVisibility: 'hidden',
          }}
        >
          {card && (
            <>
              {/* 左上角 */}
              <div 
                className="absolute top-2 left-2 flex flex-col items-center leading-tight"
                style={{ color: suitColor }}
              >
                <span className="font-bold text-base">{card.rank}</span>
                <span className="text-sm -mt-1">{card.suit}</span>
              </div>
              
              {/* 中心 */}
              <div 
                className="flex flex-col items-center"
                style={{ color: suitColor, fontSize: sizeStyle.fontSize }}
              >
                <span className="font-bold">{card.rank}</span>
                <span className="text-5xl leading-none">{card.suit}</span>
              </div>
              
              {/* 右下角（倒置） */}
              <div 
                className="absolute bottom-2 right-2 flex flex-col items-center rotate-180 leading-tight"
                style={{ color: suitColor }}
              >
                <span className="font-bold text-base">{card.rank}</span>
                <span className="text-sm -mt-1">{card.suit}</span>
              </div>
            </>
          )}
        </div>

        {/* 背面 */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={isFlipped ? {
            boxShadow: [
              '0 0 20px rgba(201, 163, 71, 0.3)',
              '0 0 35px rgba(201, 163, 71, 0.5)',
              '0 0 20px rgba(201, 163, 71, 0.3)',
            ],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: 'linear-gradient(145deg, #1a1612 0%, #0f0c08 100%)',
            border: '2px solid #C9A347',
            boxShadow: '0 0 20px rgba(201, 163, 71, 0.3)',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* 背面花纹 */}
          <motion.div 
            className="absolute inset-2 rounded-lg"
            animate={isFlipped ? {
              opacity: [0.8, 1, 0.8],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background: `
                repeating-linear-gradient(
                  45deg,
                  rgba(201, 163, 71, 0.1) 0px,
                  rgba(201, 163, 71, 0.1) 2px,
                  transparent 2px,
                  transparent 8px
                )
              `,
              border: '1px solid rgba(201, 163, 71, 0.3)',
            }}
          />
          <motion.div 
            className="absolute inset-4 rounded flex items-center justify-center"
            animate={isFlipped ? {
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.7, 0.5],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(201, 163, 71, 0.2) 0%, transparent 100%)',
            }}
          >
            <span className="text-[#C9A347] text-3xl font-bold">♠</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
