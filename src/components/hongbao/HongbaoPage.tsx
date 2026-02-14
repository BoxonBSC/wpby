import { useState } from 'react';
import { motion } from 'framer-motion';
import cnyBackground from '@/assets/cny-background.jpg';
import { FallingElements } from './FallingElements';
import { CountdownTimer } from './CountdownTimer';
import { PrizePool } from './PrizePool';
import { BurnEntry } from './BurnEntry';
import { GameRules } from './GameRules';
import { RecentWinners } from './RecentWinners';
import { Lanterns, Clouds, Fireworks, CardOrnaments } from './DecorativeElements';
import type { RoundMode } from '@/config/contracts';

export function HongbaoPage() {
  const [mode, setMode] = useState<RoundMode>('normal');
  const [isLoading, setIsLoading] = useState(false);

  // Demo state - will be replaced with contract reads
  const participantsNeeded = 100;
  const currentParticipants = 37;
  const timeLeft = 2345; // lucky mode countdown
  const isEnded = false;
  const isConnected = false;

  const handleBurn = (amount: number) => {
    console.log('Burn', amount, 'tokens in mode', mode);
    // TODO: connect to contract
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* CNY Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cnyBackground})` }}
      />
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 z-0 bg-background/70" />

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/8 blur-[120px] animate-ambient-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cny-gold/5 blur-[100px] animate-ambient-glow" style={{ animationDelay: '2s' }} />
      </div>

      <FallingElements />
      <Lanterns />
      <Clouds />
      <Fireworks />

      {/* Header */}
      <header className="relative z-10 border-b border-cny-gold/15 bg-background/50 backdrop-blur-xl overflow-hidden">
        {/* Header decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-primary/10 to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-cny-gold/8 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cny-gold/30 to-transparent" />
          {/* Small decorative clouds */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cny-gold/10 text-xl select-none">☁</div>
          <div className="absolute right-28 top-1/2 -translate-y-1/2 text-cny-gold/8 text-lg select-none">☁</div>
          {/* Corner ornaments */}
          <div className="absolute left-0 top-0 w-6 h-6 border-t border-l border-cny-gold/20 rounded-tl" />
          <div className="absolute right-0 top-0 w-6 h-6 border-t border-r border-cny-gold/20 rounded-tr" />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl sm:text-4xl"
              animate={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🧧
            </motion.span>
            <div>
              <h1 className="text-xl sm:text-2xl gold-shimmer font-display leading-none">
                马年红包
              </h1>
              <p className="text-xs text-cny-cream/50 mt-0.5">燃烧代币 · 抢BNB红包</p>
            </div>
          </div>

          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/40 text-sm font-medium text-foreground hover:from-primary/30 hover:to-primary/20 transition-all hover:shadow-[0_0_20px_hsl(0_85%_50%/0.3)]">
            🔗 连接钱包
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Mode Switcher */}
        <div className="flex gap-1 p-1.5 rounded-2xl bg-card/80 backdrop-blur border border-border/50 w-fit mx-auto shadow-lg">
          {(['normal', 'lucky'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === m
                  ? m === 'normal'
                    ? 'bg-gradient-to-r from-primary to-cny-red-light text-primary-foreground shadow-[0_0_20px_hsl(0_85%_50%/0.4)]'
                    : 'bg-gradient-to-r from-cny-gold-dark to-cny-gold text-secondary-foreground shadow-[0_0_20px_hsl(43_96%_56%/0.4)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {m === 'normal' ? '🧧 普通红包' : '🔥 幸运红包'}
            </button>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Main Game Area */}
          <div className="lg:col-span-3 space-y-5">
            {/* Hongbao Card */}
            <motion.div
              key={mode}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="hongbao-card p-6 sm:p-8"
            >
              <CardOrnaments />

              {/* Animated ring pulse */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border-2 border-cny-gold/15 animate-ring-pulse pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-cny-gold/8 animate-ring-pulse pointer-events-none" style={{ animationDelay: '0.6s' }} />

              <div className="text-center mb-8">
                <motion.div
                  className="text-6xl sm:text-7xl mb-4 inline-block"
                  animate={{
                    y: [0, -8, 0],
                    rotate: mode === 'normal' ? [0, -3, 3, 0] : [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {mode === 'normal' ? '🧧' : '🐴'}
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-display gold-shimmer drop-shadow-lg tracking-wider">
                  {mode === 'normal' ? '拼手气红包' : '幸运大红包'}
                </h2>
              </div>

              {mode === 'normal' ? (
                <div className="text-center space-y-4">
                  {/* Highlight badge */}
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cny-gold/15 border border-cny-gold/30"
                  >
                    <span className="text-base">🏆</span>
                    <span className="text-sm font-bold text-cny-gold-light tracking-wide">
                      满100人开奖 · 独奖1人
                    </span>
                  </motion.div>

                  {/* Progress number */}
                  <div>
                    <div className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">
                      {currentParticipants}
                      <span className="text-2xl sm:text-3xl text-cny-cream/40 font-normal ml-1">/ {participantsNeeded}</span>
                    </div>
                    <div className="text-xs text-cny-cream/50 mt-1">当前参与人数</div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-4 rounded-full bg-background/40 border border-cny-gold/15 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary via-cny-red-light to-cny-gold relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentParticipants / participantsNeeded) * 100}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[gold-shimmer_2s_linear_infinite] bg-[length:200%_auto]" />
                    </motion.div>
                  </div>

                  {/* Status text */}
                  <p className="text-sm text-cny-cream/70">
                    还差 <span className="text-cny-gold font-bold text-base">{participantsNeeded - currentParticipants}</span> 人开奖
                    <span className="mx-2 text-cny-cream/30">|</span>
                    奖池 <span className="text-cny-gold font-bold">50%</span> 全归1位幸运儿
                  </p>
                </div>
              ) : (
                <CountdownTimer timeLeft={timeLeft} isEnded={isEnded} mode={mode} />
              )}
            </motion.div>

            {/* Burn Entry */}
            <BurnEntry
              mode={mode}
              isConnected={isConnected}
              onBurn={handleBurn}
              isLoading={isLoading}
            />

            {/* Prize Pool */}
            <PrizePool
              normalPool={0.856}
              luckyPool={1.234}
              totalBurned="2,450,000"
              participantCount={23}
            />
          </div>

          {/* Right: Winners & Rules */}
          <div className="lg:col-span-2 space-y-5">
            <RecentWinners />
            <GameRules />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cny-gold/10 mt-12 py-6 text-center text-xs text-cny-cream/40">
        <p>🐴 马年红包 · 部署在 BNB Chain · 合约开源可查</p>
      </footer>
    </div>
  );
}
