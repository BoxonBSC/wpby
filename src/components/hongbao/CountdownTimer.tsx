import { motion } from 'framer-motion';

interface CountdownTimerProps {
  timeLeft: number; // seconds
  isEnded: boolean;
  mode: 'normal' | 'lucky';
}

export function CountdownTimer({ timeLeft, isEnded, mode }: CountdownTimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const isUrgent = timeLeft <= 60 && timeLeft > 0;

  return (
    <div className="text-center">
      <div className="text-sm text-cny-gold/70 mb-2 font-serif">
        🎁 金马红包 · 倒计时
      </div>
      <div className="flex items-center justify-center gap-2">
        {[pad(minutes)[0], pad(minutes)[1], ':', pad(seconds)[0], pad(seconds)[1]].map((char, i) => (
          char === ':' ? (
            <motion.span
              key={`sep-${i}`}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-3xl sm:text-4xl font-bold text-cny-gold"
            >
              :
            </motion.span>
          ) : (
            <motion.div
              key={`digit-${i}`}
              className={`w-12 h-16 sm:w-16 sm:h-20 rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-bold ${
                isUrgent
                  ? 'bg-primary/20 border-2 border-primary text-primary-foreground red-pulse'
                  : isEnded
                    ? 'bg-cny-gold/10 border-2 border-cny-gold/30 text-cny-gold'
                    : 'bg-card border-2 border-cny-gold/20 text-foreground'
              }`}
            >
              {char}
            </motion.div>
          )
        ))}
      </div>
      {isEnded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-cny-gold font-serif text-lg"
        >
          🎉 开奖中...
        </motion.div>
      )}
      {!isEnded && timeLeft > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          每小时自动开奖 · 3位幸运赢家 · 按券比例抽取
        </div>
      )}
    </div>
  );
}
