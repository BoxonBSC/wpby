import { SYMBOLS, PRIZE_TIERS, POOL_PROTECTION } from '@/hooks/useAdvancedSlotMachine';
import { Trophy, Medal, Award, Star, Gem, Crown, Info, Shield, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useIsMobile } from '@/hooks/use-mobile';
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

export function CompactRewardTiers() {
  const isMobile = useIsMobile();
  const { t, language } = useLanguage();
  // 移动端默认折叠，桌面端默认展开
  const [showSymbols, setShowSymbols] = useState(false);
  const [showConditions, setShowConditions] = useState(false);

  useEffect(() => {
    // 只在桌面端默认展开
    if (!isMobile) {
      setShowSymbols(true);
      setShowConditions(true);
    }
  }, [isMobile]);

  const rarityInfo = {
    legendary: { 
      label: t('rarity.legendary'), 
      color: 'text-neon-yellow', 
      bg: 'bg-neon-yellow/5',
      border: 'border-neon-yellow/30',
      icon: Crown,
    },
    epic: { 
      label: t('rarity.epic'), 
      color: 'text-neon-purple', 
      bg: 'bg-neon-purple/5',
      border: 'border-neon-purple/30',
      icon: Gem,
    },
    rare: { 
      label: t('rarity.rare'), 
      color: 'text-neon-cyan', 
      bg: 'bg-neon-cyan/5',
      border: 'border-neon-cyan/30',
      icon: Star,
    },
    common: { 
      label: t('rarity.common'), 
      color: 'text-muted-foreground', 
      bg: 'bg-muted/5',
      border: 'border-border/30',
      icon: Star,
    },
  };

  // 奖励等级翻译
  const prizeNames: Record<string, string> = {
    'super_jackpot': t('reward.superJackpot'),
    'jackpot': t('reward.jackpot'),
    'first': t('reward.first'),
    'second': t('reward.second'),
    'third': t('reward.third'),
    'small': t('reward.small'),
    'consolation': t('reward.consolation'),
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-gradient-to-b from-muted/40 to-muted/20 border border-border/50 p-3 lg:p-4 backdrop-blur-sm">
      {/* 标题 */}
      <h3 className="text-base lg:text-lg font-display text-neon-cyan mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4 lg:w-5 lg:h-5" />
        {t('reward.title')}
      </h3>
      
      {/* 资金分配说明 */}
      <div className="rounded-xl p-2.5 lg:p-3 bg-gradient-to-r from-neon-green/10 to-neon-cyan/5 border border-neon-green/20 mb-2 lg:mb-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Shield className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-neon-green flex-shrink-0" />
          <span className="text-neon-green font-display text-xs lg:text-sm">{t('reward.deflation')}</span>
          <span className="text-neon-yellow text-xs px-1.5 py-0.5 rounded bg-neon-yellow/10">{t('reward.noFee')}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-1.5">
          {t('reward.tokenBurn')}
        </p>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="text-neon-green">●</span> {t('reward.playerGet')}
            </span>
            <span className="text-neon-green font-display">95%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="text-neon-cyan">●</span> {t('reward.vrfFee')}
            </span>
            <span className="text-neon-cyan font-display">5%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          💡 {t('reward.vrfNote')}
        </p>
      </div>

      {/* 单次派奖上限 */}
      <div className="rounded-xl p-2.5 lg:p-3 bg-gradient-to-b from-neon-pink/10 to-transparent border border-neon-pink/20 text-center mb-2 lg:mb-3">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">{t('reward.maxPayout')}:</span>
          <span className="text-neon-yellow font-display text-sm lg:text-base">
            {t('reward.poolPercent')} {(POOL_PROTECTION.maxSinglePayout * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* 6级奖励表 - 移动端精简显示前3个 */}
      <div className="rounded-xl p-2.5 lg:p-3 bg-gradient-to-b from-neon-purple/10 to-transparent border border-neon-purple/20 mb-2 lg:mb-3">
        <h4 className="text-xs font-display text-neon-purple mb-2 flex items-center gap-1.5">
          <Award className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          {t('reward.levels')}
        </h4>
        <div className="space-y-1 lg:space-y-1.5">
          {PRIZE_TIERS.slice(0, isMobile ? 3 : 6).map((prize, index) => (
            <div
              key={prize.type}
              className={`
                flex items-center gap-1.5 lg:gap-2 p-1.5 lg:p-2 rounded-lg text-xs transition-colors
                ${index === 0 
                  ? 'bg-gradient-to-r from-neon-yellow/15 to-neon-orange/10 border border-neon-yellow/25' 
                  : index === 1 
                  ? 'bg-gradient-to-r from-neon-purple/15 to-neon-pink/10 border border-neon-purple/25' 
                  : 'bg-muted/20 border border-border/30'}
              `}
            >
              <span className="text-sm">{prize.emoji}</span>
              <span className={`flex-1 font-medium ${
                index === 0 ? 'text-neon-yellow' : 
                index === 1 ? 'text-neon-purple' : 
                'text-foreground/80'
              }`}>
                {prizeNames[prize.type] || prize.name}
              </span>
              <span className={`font-display ${
                index === 0 ? 'text-neon-yellow' :
                index === 1 ? 'text-neon-purple' :
                'text-neon-green'
              }`}>
                {(prize.poolPercent * 100).toFixed(0)}%
              </span>
            </div>
          ))}
          {isMobile && (
            <div className="text-xs text-center text-muted-foreground pt-1">
              {t('reward.moreLevel')}
            </div>
          )}
        </div>
      </div>

      {/* 投注概率加成 - 移动端精简为2列网格 */}
      <div className="rounded-xl p-2.5 lg:p-3 bg-gradient-to-b from-neon-cyan/10 to-transparent border border-neon-cyan/20 mb-2 lg:mb-3">
        <h4 className="text-xs font-display text-neon-cyan mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          {t('reward.betBoost')}
        </h4>
        
        {/* 移动端: 2列网格显示 */}
        <div className="grid grid-cols-2 gap-1.5 lg:hidden">
          {BET_AMOUNTS.map((bet) => {
            const multiplier = BET_MULTIPLIERS[bet] || 1;
            const isHighTier = multiplier >= 10;
            const isMidTier = multiplier >= 5 && multiplier < 10;
            
            return (
              <div
                key={bet}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-lg text-xs
                  ${isHighTier 
                    ? 'bg-gradient-to-b from-neon-yellow/20 to-neon-orange/10 border border-neon-yellow/40' 
                    : isMidTier 
                    ? 'bg-gradient-to-b from-neon-purple/20 to-neon-pink/10 border border-neon-purple/40' 
                    : multiplier > 1
                    ? 'bg-gradient-to-b from-neon-cyan/15 to-transparent border border-neon-cyan/30'
                    : 'bg-muted/30 border border-border/40'}
                `}
              >
                <span className={`font-display text-base ${
                  isHighTier ? 'text-neon-yellow' : 
                  isMidTier ? 'text-neon-purple' : 
                  multiplier > 1 ? 'text-neon-cyan' :
                  'text-foreground'
                }`}>
                  {multiplier}x
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {(bet / 1000).toFixed(0)}K
                </span>
                {multiplier > 1 && (
                  <span className="text-neon-green text-[10px] mt-0.5">
                    ↑{((multiplier - 1) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 桌面端: 列表显示 */}
        <div className="hidden lg:block space-y-1">
          {BET_AMOUNTS.map((bet) => {
            const multiplier = BET_MULTIPLIERS[bet] || 1;
            const isHighTier = multiplier >= 10;
            const isMidTier = multiplier >= 5 && multiplier < 10;
            
            return (
              <div
                key={bet}
                className={`
                  flex items-center gap-2 p-2 rounded-lg text-xs transition-colors
                  ${isHighTier 
                    ? 'bg-gradient-to-r from-neon-yellow/15 to-neon-orange/10 border border-neon-yellow/25' 
                    : isMidTier 
                    ? 'bg-gradient-to-r from-neon-purple/15 to-neon-pink/10 border border-neon-purple/25' 
                    : multiplier > 1
                    ? 'bg-gradient-to-r from-neon-cyan/10 to-transparent border border-neon-cyan/20'
                    : 'bg-muted/20 border border-border/30'}
                `}
              >
                <span className="text-muted-foreground w-20">
                  {bet.toLocaleString()}
                </span>
                <span className={`flex-1 font-display ${
                  isHighTier ? 'text-neon-yellow' : 
                  isMidTier ? 'text-neon-purple' : 
                  multiplier > 1 ? 'text-neon-cyan' :
                  'text-foreground/80'
                }`}>
                  {multiplier}x
                </span>
                {multiplier > 1 && (
                  <span className="text-neon-green text-xs">
                    ↑{((multiplier - 1) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-center hidden lg:block">
          {t('reward.higherBet')}
        </p>
      </div>

      {/* 可折叠：符号概率 */}
      <Collapsible open={showSymbols} onOpenChange={setShowSymbols} className="mb-2">
        <CollapsibleTrigger className="w-full flex items-center justify-between p-2 lg:p-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/30 transition-all">
          <span className="text-xs font-display text-neon-purple flex items-center gap-1.5">
            <Gem className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
            {t('reward.symbolOdds')}
          </span>
          {showSymbols ? (
            <ChevronUp className="w-4 h-4 text-neon-purple/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="grid grid-cols-2 gap-1 lg:gap-1.5 p-2 rounded-xl bg-muted/10 border border-border/20">
            {SYMBOLS.map((symbol) => {
              const rarity = rarityInfo[symbol.rarity];
              const probability = symbol.rarity === 'legendary' ? '2-3%' : 
                                 symbol.rarity === 'epic' ? '5-10%' : 
                                 symbol.rarity === 'rare' ? '15%' : '12-15%';
              
              return (
                <div
                  key={symbol.id}
                  className={`
                    flex items-center gap-1 lg:gap-1.5 p-1 lg:p-1.5 rounded-lg
                    ${rarity.bg} border ${rarity.border}
                    hover:bg-muted/20 transition-colors
                  `}
                >
                  <span className="text-sm lg:text-base">{symbol.emoji}</span>
                  <span className={`text-xs ${rarity.color} hidden lg:inline`}>{rarity.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{probability}</span>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 可折叠：中奖条件 */}
      <Collapsible open={showConditions} onOpenChange={setShowConditions} className="mb-2 lg:mb-3">
        <CollapsibleTrigger className="w-full flex items-center justify-between p-2 lg:p-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/30 transition-all">
          <span className="text-xs font-display text-neon-cyan flex items-center gap-1.5">
            <Info className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
            {t('reward.winConditions')}
          </span>
          {showConditions ? (
            <ChevronUp className="w-4 h-4 text-neon-cyan/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="text-xs space-y-0.5 lg:space-y-1 p-2 lg:p-3 bg-muted/10 rounded-xl border border-border/20">
            <p className="flex items-center gap-2">
              <span className="text-neon-yellow">🎰</span>
              <span className="text-muted-foreground">{t('reward.superJackpot')}:</span>
              <span className="text-foreground/80 ml-auto">{t('condition.superJackpot')}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neon-purple">💎</span>
              <span className="text-muted-foreground">{t('reward.jackpot')}:</span>
              <span className="text-foreground/80 ml-auto">{t('condition.jackpot')}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neon-orange">👑</span>
              <span className="text-muted-foreground">{t('reward.first')}:</span>
              <span className="text-foreground/80 ml-auto">{t('condition.first')}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neon-pink">🔔</span>
              <span className="text-muted-foreground">{t('reward.second')}:</span>
              <span className="text-foreground/80 ml-auto">{t('condition.second')}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neon-cyan">⭐</span>
              <span className="text-muted-foreground">{t('reward.third')}:</span>
              <span className="text-foreground/80 ml-auto">{t('condition.third')}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neon-green">🍀</span>
              <span className="text-muted-foreground">{t('reward.small')}:</span>
              <span className="text-foreground/80 ml-auto">{t('condition.small')}</span>
            </p>
            <p className="text-muted-foreground/70 text-center pt-1 border-t border-border/20 mt-1">
              {t('reward.middleOnly')}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>


      {/* 底部信息 */}
      <div className="mt-auto space-y-1.5 lg:space-y-2">
        <div className="flex items-center justify-between text-xs p-2 lg:p-2.5 rounded-xl bg-muted/15 border border-border/20">
          <span className="flex items-center gap-1.5 text-neon-purple">
            <Medal className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
            {t('reward.payline')}
          </span>
          <span className="text-foreground font-display">{t('reward.middleRow')}</span>
        </div>
        
        <div className="p-2 lg:p-2.5 rounded-xl bg-gradient-to-r from-neon-green/10 to-neon-cyan/5 border border-neon-green/20">
          <div className="flex items-center gap-1.5 text-xs text-neon-green font-display">
            🔗 {t('reward.chainlinkVRF')}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 lg:mt-1 hidden lg:block">
            {t('reward.vrfDesc')}
          </p>
        </div>

      </div>
    </div>
  );
}
