import { useMemo } from 'react';

const ELEMENTS = ['🧧', '💰', '🐴', '🎊', '✨', '🏮'];

export function FallingElements() {
  const items = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: ELEMENTS[i % ELEMENTS.length],
      left: Math.random() * 100,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 10,
      size: 14 + Math.random() * 16,
    })),
  []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-fall opacity-30"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            '--fall-duration': `${item.duration}s`,
            '--fall-delay': `${item.delay}s`,
          } as React.CSSProperties}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}
