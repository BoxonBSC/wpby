import { motion } from 'framer-motion';
import { SYMBOLS, PAYLINES, PRIZE_TIERS } from '@/hooks/useAdvancedSlotMachine';
import { Trophy, Medal, Award, Star, Gem, Crown, Info } from 'lucide-react';

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

export function AdvancedRewardTiers() {
  return (
    <div className="cyber-card">
      <h3 className="text-xl font-display neon-text-purple mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        奖励与赔付表
      </h3>
      
      {/* 6级奖励表 */}
      <div className="neon-border-purple rounded-lg p-3 bg-muted/20 mb-4">
        <h4 className="text-sm font-display text-neon-yellow mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          奖励等级 (基于奖池)
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
                {prize.name}
              </span>
              <span className="text-neon-green font-display">
                {(prize.poolRate * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {prize.estimatedOdds}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 中奖条件说明 */}
      <div className="neon-border rounded-lg p-3 bg-muted/20 mb-4">
        <h4 className="text-sm font-display text-neon-cyan mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          中奖条件
        </h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="text-neon-yellow">🎰 超级头奖:</span> 5个7连线</p>
          <p><span className="text-neon-purple">💎 头奖:</span> 5个💎 或 4个7</p>
          <p><span className="text-neon-orange">👑 一等奖:</span> 任意5连线</p>
          <p><span className="text-neon-pink">🔔 二等奖:</span> 4个传奇/史诗符号</p>
          <p><span className="text-neon-cyan">⭐ 三等奖:</span> 4连 或 3+条线中奖</p>
          <p><span className="text-neon-green">🍀 小奖:</span> 任意3连线</p>
        </div>
      </div>

      {/* 符号表 */}
      <div className="mb-4">
        <h4 className="text-sm font-display text-neon-purple mb-2">符号稀有度</h4>
        <div className="space-y-1.5">
          {SYMBOLS.map((symbol, index) => {
            const rarity = rarityInfo[symbol.rarity];
            const Icon = rarity.icon;
            
            return (
              <motion.div
                key={symbol.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`
                  flex items-center gap-2 p-1.5 rounded-lg
                  border ${rarity.border} ${rarity.bg}
                  hover:bg-muted/30 transition-colors
                `}
              >
                <span className="text-xl w-8 text-center">{symbol.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs flex items-center gap-1 ${rarity.color}`}>
                    <Icon className="w-3 h-3" />
                    {rarity.label}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {symbol.rarity === 'legendary' ? '2-3%' : 
                   symbol.rarity === 'epic' ? '5-10%' : 
                   symbol.rarity === 'rare' ? '15%' : '12-15%'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 赔付线信息 */}
      <div className="neon-border rounded-lg p-3 bg-muted/20 mb-4">
        <h4 className="text-sm font-display text-neon-purple mb-2 flex items-center gap-2">
          <Medal className="w-4 h-4" />
          赔付线 ({PAYLINES.length}条)
        </h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>多条线同时中奖时，倍数叠加：</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-neon-cyan">3线+: 1.5x</span>
            <span className="text-neon-yellow">5线+: 2x</span>
            <span className="text-neon-pink">7线+: 3x</span>
          </div>
        </div>
      </div>

      {/* VRF 随机数说明 */}
      <div className="p-3 neon-border rounded-lg bg-muted/20">
        <h4 className="text-sm font-display text-neon-green mb-2">🔗 Chainlink VRF</h4>
        <p className="text-xs text-muted-foreground">
          使用 Chainlink VRF 生成真随机数，确保结果公平不可预测。
          每次转动消耗 VRF 请求，约 2-3 区块后返回结果。
        </p>
      </div>
    </div>
  );
}
