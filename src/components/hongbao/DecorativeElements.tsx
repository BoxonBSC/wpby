import { motion } from 'framer-motion';

/** 灯笼装饰 */
export function Lanterns() {
  return (
    <div className="fixed top-0 left-0 right-0 z-0 pointer-events-none flex justify-between px-4 sm:px-12">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="animate-lantern-swing"
          style={{ animationDelay: `${i * 0.5}s` }}
        >
          <div className="text-3xl sm:text-5xl opacity-40 select-none">🏮</div>
        </motion.div>
      ))}
    </div>
  );
}

/** 祥云背景 */
export function Clouds() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute animate-cloud-drift text-4xl sm:text-6xl opacity-10 select-none"
          style={{
            top: `${20 + i * 30}%`,
            animationDelay: `${i * 7}s`,
            animationDuration: `${18 + i * 4}s`,
          }}
        >
          ☁️
        </div>
      ))}
    </div>
  );
}

/** 红包卡片内装饰纹路 */
export function CardOrnaments() {
  return (
    <>
      {/* 角花 */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-cny-gold/30 rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-cny-gold/30 rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-cny-gold/30 rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-cny-gold/30 rounded-br-lg" />

      {/* 中心线 */}
      <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-cny-gold/15 to-transparent -translate-x-1/2" />

      {/* 顶部横纹 */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cny-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cny-gold/20 to-transparent" />
    </>
  );
}

/** 烟花粒子 */
export function Fireworks() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[
        { left: '10%', top: '15%', delay: '0s', color: 'hsl(var(--cny-gold))' },
        { left: '85%', top: '10%', delay: '1.2s', color: 'hsl(var(--cny-red-light))' },
        { left: '50%', top: '5%', delay: '2.5s', color: 'hsl(var(--cny-gold-light))' },
        { left: '25%', top: '20%', delay: '3.8s', color: 'hsl(var(--cny-red))' },
        { left: '75%', top: '18%', delay: '4.5s', color: 'hsl(var(--cny-gold))' },
      ].map((spark, i) => (
        <div
          key={i}
          className="absolute animate-firework rounded-full"
          style={{
            left: spark.left,
            top: spark.top,
            width: 6,
            height: 6,
            backgroundColor: spark.color,
            animationDelay: spark.delay,
            boxShadow: `0 0 12px ${spark.color}, 0 0 24px ${spark.color}`,
          }}
        />
      ))}
    </div>
  );
}
