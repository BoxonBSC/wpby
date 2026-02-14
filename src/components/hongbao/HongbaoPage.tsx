import { useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-background cny-pattern relative">
      <FallingElements />
      <Lanterns />
      <Clouds />
      <Fireworks />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧧</span>
            <div>
              <h1 className="text-xl sm:text-2xl text-cny-gold font-display leading-none">
                马年红包
              </h1>
              <p className="text-[10px] text-muted-foreground">燃烧代币 · 抢BNB红包</p>
            </div>
          </div>

          <button className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-sm text-foreground hover:bg-primary/20 transition-colors">
            🔗 连接钱包
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Mode Switcher */}
        <div className="flex gap-2 p-1 rounded-xl bg-muted/50 border border-border w-fit mx-auto">
          {(['normal', 'lucky'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? m === 'normal'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-cny-gold text-secondary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="hongbao-card p-6 sm:p-8"
            >
              <CardOrnaments />

              {/* Pulsing ring behind emoji */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-cny-gold/20 animate-ring-pulse pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-cny-gold/10 animate-ring-pulse pointer-events-none" style={{ animationDelay: '0.5s' }} />

              <div className="text-center mb-6">
                <motion.div
                  className="text-5xl sm:text-6xl mb-3 animate-gentle-float"
                >
                  {mode === 'normal' ? '🧧' : '🐴'}
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-display gold-shimmer drop-shadow-lg">
                  {mode === 'normal' ? '拼手气红包' : '幸运大红包'}
                </h2>
                <p className="text-xs text-cny-cream/60 mt-1">
                  {mode === 'normal' ? '满100人开奖 · 人人有份' : '每小时开奖 · 3位幸运儿'}
                </p>
              </div>

              {mode === 'normal' ? (
                <div className="text-center">
                  <div className="text-sm text-cny-gold/70 mb-2 font-serif">🧧 参与进度</div>
                  <div className="text-4xl sm:text-5xl font-bold text-cny-gold-light">
                    {currentParticipants} <span className="text-xl text-cny-cream/50">/ {participantsNeeded}</span>
                  </div>
                  <div className="mt-3 w-full h-3 rounded-full bg-card border border-cny-gold/20 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-cny-gold"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentParticipants / participantsNeeded) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    还差 <span className="text-cny-gold font-bold">{participantsNeeded - currentParticipants}</span> 人即可开奖
                  </div>
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
      <footer className="relative z-10 border-t border-border/30 mt-12 py-6 text-center text-xs text-muted-foreground">
        <p>🐴 马年红包 · 部署在 BNB Chain · 合约开源可查</p>
      </footer>
    </div>
  );
}
