import { motion } from 'framer-motion';
import { SYMBOLS, PRIZE_TIERS, POOL_PROTECTION } from '@/hooks/useAdvancedSlotMachine';
import { Trophy, Medal, Award, Star, Gem, Crown, Info, Shield, TrendingUp } from 'lucide-react';
import { BET_AMOUNTS } from './BetSelector';
import { useLanguage } from '@/contexts/LanguageContext';

// 投注对应的概率加成倍数
const BET_MULTIPLIERS: Record<number, number> = {
  10000: 1,
  25000: 2.5,
  50000: 5,
  100000: 10,
  250000: 20,
};

export function AdvancedRewardTiers() {
  const { t, language } = useLanguage();
  
  const rarityInfo = {
    legendary: { 
      label: t('rarity.legendary'), 
      color: 'text-neon-yellow', 
      bg: 'bg-neon-yellow/10',
      border: 'border-neon-yellow/60',
      glow: 'shadow-[0_0_8px_hsl(50_100%_50%/0.3)]',
      icon: Crown,
    },
    epic: { 
      label: t('rarity.epic'), 
      color: 'text-neon-purple', 
      bg: 'bg-neon-purple/10',
      border: 'border-neon-purple/60',
      glow: 'shadow-[0_0_8px_hsl(280_100%_60%/0.3)]',
      icon: Gem,
    },
    rare: { 
      label: t('rarity.rare'), 
      color: 'text-neon-cyan', 
      bg: 'bg-neon-cyan/10',
      border: 'border-neon-cyan/60',
      glow: 'shadow-[0_0_8px_hsl(180_100%_50%/0.3)]',
      icon: Star,
    },
    common: { 
      label: t('rarity.common'), 
      color: 'text-neon-green', 
      bg: 'bg-neon-green/10',
      border: 'border-neon-green/60',
      glow: 'shadow-[0_0_8px_hsl(120_100%_40%/0.2)]',
      icon: Star,
    },
  };

  // 奖励名称翻译映射
  const prizeNames: Record<string, string> = {
    super_jackpot: t('reward.superJackpot'),
    jackpot: t('reward.jackpot'),
    first: t('reward.first'),
    second: t('reward.second'),
    third: t('reward.third'),
    small: t('reward.small'),
    consolation: t('reward.consolation'),
  };

  return (
    <div className="cyber-card">
      <h3 className="text-xl font-display neon-text-purple mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        {t('rewardTiers.title')}
      </h3>
      
      {/* 100% 通缩说明 */}
      <div className="neon-border-green rounded-lg p-3 bg-neon-green/5 mb-4">
        <h4 className="text-sm font-display text-neon-green mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {t('rewardTiers.deflationTitle')}
        </h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-neon-yellow">
            {t('rewardTiers.deflationHighlight')}
          </p>
          <p>• {t('rewardTiers.deflationPoint1')}</p>
          <p>• {t('rewardTiers.deflationPoint2')}</p>
          <p>• {t('rewardTiers.deflationPoint3')}</p>
        </div>
      </div>

      {/* 奖池保护机制 */}
      <div className="neon-border-pink rounded-lg p-3 bg-neon-pink/5 mb-4">
        <h4 className="text-sm font-display text-neon-pink mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {t('rewardTiers.poolProtection')}
        </h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• {t('rewardTiers.maxPayout')}: <span className="text-neon-yellow">{(POOL_PROTECTION.maxSinglePayout * 100).toFixed(0)}%</span></p>
          <p>• {t('rewardTiers.zeroReserve')}</p>
        </div>
      </div>

      {/* 6级奖励表 - 基于奖池百分比 */}
      <div className="neon-border-purple rounded-lg p-3 bg-muted/20 mb-4">
        <h4 className="text-sm font-display text-neon-yellow mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          {t('rewardTiers.levels')}
        </h4>
        <div className="space-y-1.5">
          {PRIZE_TIERS.map((prize, index) => (
            <motion.div
              key={prize.type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center gap-2 p-2 rounded-lg text-sm
                ${index === 0 ? 'bg-neon-yellow/10 border border-neon-yellow/30' : 
                  index === 1 ? 'bg-neon-purple/10 border border-neon-purple/30' :
                  'bg-muted/30 border border-border/50'}
              `}
            >
              <span className="text-lg">{prize.emoji}</span>
              <span className={`font-display flex-1 ${
                index === 0 ? 'text-neon-yellow' : 
                index === 1 ? 'text-neon-purple' : 
                'text-foreground'
              }`}>
                {prizeNames[prize.type] || prize.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {prize.description}
              </span>
              <span className="text-neon-green font-display">
                {(prize.poolPercent * 100).toFixed(1)}%
              </span>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          * {t('rewardTiers.payoutNote')}
        </p>
      </div>

      {/* 投注概率加成表 */}
      <div className="neon-border-cyan rounded-lg p-3 bg-neon-cyan/5 mb-4">
        <h4 className="text-sm font-display text-neon-cyan mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {t('rewardTiers.betBonus')}
        </h4>
        <div className="space-y-1.5">
          {BET_AMOUNTS.map((bet, index) => {
            const multiplier = BET_MULTIPLIERS[bet] || 1;
            const isHighTier = multiplier >= 10;
            const isMidTier = multiplier >= 5 && multiplier < 10;
            
            return (
              <motion.div
                key={bet}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center gap-2 p-2 rounded-lg text-sm
                  ${isHighTier ? 'bg-neon-yellow/10 border border-neon-yellow/30' : 
                    isMidTier ? 'bg-neon-purple/10 border border-neon-purple/30' :
                    multiplier > 1 ? 'bg-neon-cyan/10 border border-neon-cyan/30' :
                    'bg-muted/30 border border-border/50'}
                `}
              >
                <span className="text-xs text-muted-foreground w-20">
                  {bet.toLocaleString()}
                </span>
                <div className="flex-1">
                  <div className={`font-display ${
                    isHighTier ? 'text-neon-yellow' : 
                    isMidTier ? 'text-neon-purple' : 
                    multiplier > 1 ? 'text-neon-cyan' :
                    'text-foreground'
                  }`}>
                    {multiplier}x {t('rewardTiers.winOdds')}
                  </div>
                </div>
                {multiplier > 1 && (
                  <span className="text-xs text-neon-green">
                    ↑{((multiplier - 1) * 100).toFixed(0)}%
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {t('rewardTiers.betTip')}
        </p>
      </div>

      {/* 符号出现概率 */}
      <div className="mb-4">
        <h4 className="text-sm font-display text-neon-purple mb-2">{t('rewardTiers.symbolRarity')}</h4>
        <div className="grid grid-cols-2 gap-2">
          {SYMBOLS.map((symbol, index) => {
            const rarity = rarityInfo[symbol.rarity];
            const Icon = rarity.icon;
            
            return (
              <motion.div
                key={symbol.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`
                  flex items-center gap-2 p-2 rounded-lg
                  border ${rarity.border} ${rarity.bg} ${rarity.glow}
                  hover:scale-105 transition-transform duration-200
                `}
              >
                <span className="text-2xl">{symbol.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-display flex items-center gap-1 ${rarity.color}`}>
                    <Icon className="w-3 h-3" />
                    {rarity.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 中奖条件 - 与合约逻辑完全一致 */}
      <div className="neon-border rounded-lg p-3 bg-muted/20 mb-4">
        <h4 className="text-sm font-display text-neon-cyan mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          {t('rewardTiers.winConditions')}
        </h4>
        <div className="text-xs text-muted-foreground space-y-1.5">
          <p className="text-neon-yellow/90 bg-neon-yellow/5 p-1.5 rounded">
            ℹ️ {t('rewardTiers.winConditionsNote')}
          </p>
          <p><span className="text-neon-yellow">🎰 {t('reward.superJackpot')}:</span> {t('rewardTiers.condition.superJackpot')}</p>
          <p><span className="text-neon-purple">💎 {t('reward.jackpot')}:</span> {t('rewardTiers.condition.jackpot')}</p>
          <p><span className="text-neon-orange">👑 {t('reward.first')}:</span> {t('rewardTiers.condition.first')}</p>
          <p><span className="text-neon-pink">🔔 {t('reward.second')}:</span> {t('rewardTiers.condition.second')}</p>
          <p><span className="text-neon-cyan">⭐ {t('reward.third')}:</span> {t('rewardTiers.condition.third')}</p>
          <p><span className="text-neon-green">🍀 {t('reward.small')}:</span> {t('rewardTiers.condition.small')}</p>
          <p><span className="text-muted-foreground">🎁 {t('reward.consolation')}:</span> {t('rewardTiers.condition.consolation')}</p>
        </div>
      </div>

      {/* 中间行说明 */}
      <div className="neon-border-cyan rounded-lg p-3 bg-neon-cyan/5 mb-4">
        <h4 className="text-sm font-display text-neon-cyan mb-2 flex items-center gap-2">
          <Medal className="w-4 h-4" />
          {t('rewardTiers.displayNote')}
        </h4>
        <div className="text-xs text-muted-foreground">
          <p>{t('rewardTiers.displayDesc1')}</p>
          <p className="mt-1">{t('rewardTiers.displayDesc2')}</p>
        </div>
      </div>

      {/* VRF 随机数说明 */}
      <div className="p-3 neon-border rounded-lg bg-muted/20">
        <h4 className="text-sm font-display text-neon-green mb-2">🔗 Chainlink VRF</h4>
        <p className="text-xs text-muted-foreground">
          {t('rewardTiers.vrfDesc')}
        </p>
      </div>
    </div>
  );
}
