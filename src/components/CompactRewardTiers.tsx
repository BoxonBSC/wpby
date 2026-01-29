import { SYMBOLS, PAYLINES, PRIZE_TIERS, POOL_PROTECTION } from '@/hooks/useAdvancedSlotMachine';
import { Trophy, Medal, Award, Star, Gem, Crown, Info, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProbabilityCalculator } from './ProbabilityCalculator';

const rarityInfo = {
  legendary: { 
    label: '传说', 
    color: 'text-neon-yellow', 
    bg: 'bg-neon-yellow/5',
    border: 'border-neon-yellow/30',
    icon: Crown,
  },
  epic: { 
    label: '史诗', 
    color: 'text-neon-purple', 
    bg: 'bg-neon-purple/5',
    border: 'border-neon-purple/30',
    icon: Gem,
  },
  rare: { 
    label: '稀有', 
    color: 'text-neon-cyan', 
    bg: 'bg-neon-cyan/5',
    border: 'border-neon-cyan/30',
    icon: Star,
  },
  common: { 
    label: '普通', 
    color: 'text-muted-foreground', 
    bg: 'bg-muted/5',
    border: 'border-border/30',
    icon: Star,
  },
};

export function CompactRewardTiers() {
  const [showSymbols, setShowSymbols] = useState(true);
  const [showConditions, setShowConditions] = useState(true);

  return (
    <div className="h-full flex flex-col rounded-2xl bg-gradient-to-b from-muted/40 to-muted/20 border border-border/50 p-4 backdrop-blur-sm">
      {/* 标题 */}
      <h3 className="text-lg font-display text-neon-cyan mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        奖励与赔付
      </h3>
      
      {/* 100% 返还说明 */}
      <div className="rounded-xl p-3 bg-gradient-to-r from-neon-green/10 to-neon-cyan/5 border border-neon-green/20 mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-neon-green flex-shrink-0" />
          <span className="text-neon-green font-display text-sm">100% 返还</span>
          <span className="text-neon-yellow text-xs px-1.5 py-0.5 rounded bg-neon-yellow/10">零抽成</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          所有投注 100% 进入奖池，无平台抽成
        </p>
      </div>

      {/* 奖池保护 */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 rounded-xl p-2.5 bg-gradient-to-b from-neon-pink/10 to-transparent border border-neon-pink/20 text-center">
          <div className="text-neon-yellow font-display text-base">
            {(POOL_PROTECTION.maxSinglePayout * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">单次最大</div>
        </div>
        <div className="flex-1 rounded-xl p-2.5 bg-gradient-to-b from-neon-green/10 to-transparent border border-neon-green/20 text-center">
          <div className="text-neon-green font-display text-base">
            {(POOL_PROTECTION.reservePercent * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">储备金</div>
        </div>
      </div>

      {/* 6级奖励表 */}
      <div className="rounded-xl p-3 bg-gradient-to-b from-neon-purple/10 to-transparent border border-neon-purple/20 mb-3">
        <h4 className="text-xs font-display text-neon-purple mb-2.5 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          奖励等级
        </h4>
        <div className="space-y-1.5">
          {PRIZE_TIERS.map((prize, index) => (
            <div
              key={prize.type}
              className={`
                flex items-center gap-2 p-2 rounded-lg text-xs transition-colors
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
                {prize.name}
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
        </div>
      </div>

      {/* 可折叠：符号概率 */}
      <Collapsible open={showSymbols} onOpenChange={setShowSymbols} className="mb-2">
        <CollapsibleTrigger className="w-full flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/30 transition-all">
          <span className="text-xs font-display text-neon-purple flex items-center gap-1.5">
            <Gem className="w-3.5 h-3.5" />
            符号概率 (VRF)
          </span>
          {showSymbols ? (
            <ChevronUp className="w-4 h-4 text-neon-purple/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-muted/10 border border-border/20">
            {SYMBOLS.map((symbol) => {
              const rarity = rarityInfo[symbol.rarity];
              const probability = symbol.rarity === 'legendary' ? '2-3%' : 
                                 symbol.rarity === 'epic' ? '5-10%' : 
                                 symbol.rarity === 'rare' ? '15%' : '12-15%';
              
              return (
                <div
                  key={symbol.id}
                  className={`
                    flex items-center gap-1.5 p-1.5 rounded-lg
                    ${rarity.bg} border ${rarity.border}
                    hover:bg-muted/20 transition-colors
                  `}
                >
                  <span className="text-base">{symbol.emoji}</span>
                  <span className={`text-xs ${rarity.color}`}>{rarity.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{probability}</span>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 可折叠：中奖条件 */}
      <Collapsible open={showConditions} onOpenChange={setShowConditions} className="mb-3">
        <CollapsibleTrigger className="w-full flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 border border-border/30 transition-all">
          <span className="text-xs font-display text-neon-cyan flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            中奖条件
          </span>
          {showConditions ? (
            <ChevronUp className="w-4 h-4 text-neon-cyan/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="text-xs space-y-1 p-3 bg-muted/10 rounded-xl border border-border/20">
            <p className="flex items-center gap-2">
              <span className="text-neon-yellow">🎰</span>
              <span className="text-muted-foreground">超级头奖:</span>
              <span className="text-foreground/80 ml-auto">5个7连线</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neon-purple">💎</span>
              <span className="text-muted-foreground">头奖:</span>
              <span className="text-foreground/80 ml-auto">5×💎 或 4×7</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neon-orange">👑</span>
              <span className="text-muted-foreground">一等奖:</span>
              <span className="text-foreground/80 ml-auto">任意5连线</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neon-pink">🔔</span>
              <span className="text-muted-foreground">二等奖:</span>
              <span className="text-foreground/80 ml-auto">4×传奇/史诗</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neon-cyan">⭐</span>
              <span className="text-muted-foreground">三等奖:</span>
              <span className="text-foreground/80 ml-auto">4连普通符号</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-neon-green">🍀</span>
              <span className="text-muted-foreground">小奖:</span>
              <span className="text-foreground/80 ml-auto">任意3连线</span>
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 概率计算器 */}
      <div className="mb-3">
        <ProbabilityCalculator />
      </div>

      {/* 底部信息 */}
      <div className="mt-auto space-y-2">
        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-muted/15 border border-border/20">
          <span className="flex items-center gap-1.5 text-neon-purple">
            <Medal className="w-3.5 h-3.5" />
            赔付线
          </span>
          <span className="text-foreground font-display">{PAYLINES.length}条</span>
        </div>
        
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-neon-green/10 to-neon-cyan/5 border border-neon-green/20">
          <div className="flex items-center gap-1.5 text-xs text-neon-green font-display">
            🔗 Chainlink VRF
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            真随机数，公平不可预测
          </p>
        </div>
      </div>
    </div>
  );
}
