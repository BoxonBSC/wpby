import { motion } from 'framer-motion';
import { SYMBOLS, PAYLINES, PRIZE_TIERS, POOL_PROTECTION } from '@/hooks/useAdvancedSlotMachine';
import { Trophy, Medal, Award, Star, Gem, Crown, Info, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const rarityInfo = {
  legendary: { 
    label: '传说', 
    color: 'text-neon-yellow', 
    bg: 'bg-neon-yellow/10',
    border: 'border-neon-yellow/50',
    icon: Crown,
  },
  epic: { 
    label: '史诗', 
    color: 'text-neon-purple', 
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/50',
    icon: Gem,
  },
  rare: { 
    label: '稀有', 
    color: 'text-neon-cyan', 
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/50',
    icon: Star,
  },
  common: { 
    label: '普通', 
    color: 'text-muted-foreground', 
    bg: 'bg-muted/10',
    border: 'border-border',
    icon: Star,
  },
};

export function CompactRewardTiers() {
  const [showSymbols, setShowSymbols] = useState(true);
  const [showConditions, setShowConditions] = useState(true);

  return (
    <div className="cyber-card h-full flex flex-col">
      <h3 className="text-lg font-display neon-text-purple mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        奖励与赔付
      </h3>
      
      {/* 100% 返还说明 - 简洁版 */}
      <div className="neon-border-green rounded-lg p-2.5 bg-neon-green/5 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-neon-green flex-shrink-0" />
          <span className="text-neon-green font-display">🎯 100% 返还</span>
          <span className="text-neon-yellow text-xs">零抽成</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          所有投注 100% 进入奖池，无平台抽成
        </p>
      </div>

      {/* 奖池保护 - 简洁版 */}
      <div className="flex gap-2 mb-3 text-xs">
        <div className="flex-1 neon-border-pink rounded-lg p-2 bg-neon-pink/5 text-center">
          <div className="text-neon-yellow font-display text-sm">
            {(POOL_PROTECTION.maxSinglePayout * 100).toFixed(0)}%
          </div>
          <div className="text-muted-foreground">单次最大</div>
        </div>
        <div className="flex-1 neon-border rounded-lg p-2 bg-muted/20 text-center">
          <div className="text-neon-green font-display text-sm">
            {(POOL_PROTECTION.reservePercent * 100).toFixed(0)}%
          </div>
          <div className="text-muted-foreground">储备金</div>
        </div>
      </div>

      {/* 6级奖励表 - 紧凑版 */}
      <div className="neon-border-purple rounded-lg p-2.5 bg-muted/20 mb-3 flex-shrink-0">
        <h4 className="text-xs font-display text-neon-yellow mb-2 flex items-center gap-1">
          <Award className="w-3 h-3" />
          奖励等级
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {PRIZE_TIERS.map((prize, index) => (
            <div
              key={prize.type}
              className={`
                flex items-center gap-1.5 p-1.5 rounded text-xs
                ${index === 0 ? 'bg-neon-yellow/10 border border-neon-yellow/30 col-span-2' : 
                  index === 1 ? 'bg-neon-purple/10 border border-neon-purple/30 col-span-2' :
                  'bg-muted/30 border border-border/50'}
              `}
            >
              <span>{prize.emoji}</span>
              <span className={`flex-1 ${
                index === 0 ? 'text-neon-yellow' : 
                index === 1 ? 'text-neon-purple' : 
                'text-foreground'
              }`}>
                {prize.name}
              </span>
              <span className="text-neon-green font-display">
                {(prize.poolPercent * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 可折叠：符号概率 */}
      <Collapsible open={showSymbols} onOpenChange={setShowSymbols} className="mb-2">
        <CollapsibleTrigger className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <span className="text-xs font-display text-neon-purple flex items-center gap-1">
            <Star className="w-3 h-3" />
            符号概率 (VRF)
          </span>
          {showSymbols ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="grid grid-cols-2 gap-1">
            {SYMBOLS.map((symbol) => {
              const rarity = rarityInfo[symbol.rarity];
              const probability = symbol.rarity === 'legendary' ? '2-3%' : 
                                 symbol.rarity === 'epic' ? '5-10%' : 
                                 symbol.rarity === 'rare' ? '15%' : '12-15%';
              
              return (
                <div
                  key={symbol.id}
                  className={`
                    flex items-center gap-1.5 p-1 rounded
                    border ${rarity.border} ${rarity.bg}
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
        <CollapsibleTrigger className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <span className="text-xs font-display text-neon-cyan flex items-center gap-1">
            <Info className="w-3 h-3" />
            中奖条件
          </span>
          {showConditions ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 text-xs text-muted-foreground space-y-0.5 p-2 bg-muted/20 rounded-lg">
          <p><span className="text-neon-yellow">🎰 超级头奖:</span> 5个7连线</p>
          <p><span className="text-neon-purple">💎 头奖:</span> 5×💎 或 4×7</p>
          <p><span className="text-neon-orange">👑 一等奖:</span> 任意5连线</p>
          <p><span className="text-neon-pink">🔔 二等奖:</span> 4×传奇/史诗</p>
          <p><span className="text-neon-cyan">⭐ 三等奖:</span> 4连普通符号</p>
          <p><span className="text-neon-green">🍀 小奖:</span> 任意3连线</p>
        </CollapsibleContent>
      </Collapsible>

      {/* 底部信息 */}
      <div className="mt-auto space-y-2">
        <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/20">
          <span className="flex items-center gap-1 text-neon-purple">
            <Medal className="w-3 h-3" />
            赔付线
          </span>
          <span className="text-foreground">{PAYLINES.length}条</span>
        </div>
        
        <div className="p-2 neon-border rounded-lg bg-muted/20">
          <div className="flex items-center gap-1 text-xs text-neon-green">
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
