import { motion } from 'framer-motion';
import { SYMBOLS, PAYLINES, PRIZE_TIERS, POOL_PROTECTION } from '@/hooks/useAdvancedSlotMachine';
import { Trophy, Medal, Award, Star, Gem, Crown, Info, Shield, TrendingUp } from 'lucide-react';
import { BET_AMOUNTS } from './BetSelector';

// 投注对应的概率加成倍数
const BET_MULTIPLIERS: Record<number, number> = {
  20000: 1,
  50000: 2.5,
  100000: 5,
  200000: 10,
  500000: 20,
};

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
      
      {/* 100% 返还说明 */}
      <div className="neon-border-green rounded-lg p-3 bg-neon-green/5 mb-4">
        <h4 className="text-sm font-display text-neon-green mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          🎯 100% 资金返还 | 零抽成
        </h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-neon-yellow">
            ✨ 庄家零抽成 - 所有投注资金 100% 进入奖池
          </p>
          <p>• 玩家投入的每一分钱都用于奖励派发</p>
          <p>• 无隐藏费用，无平台抽成</p>
          <p>• 智能合约透明可验证</p>
        </div>
      </div>

      {/* 奖池保护机制 */}
      <div className="neon-border-pink rounded-lg p-3 bg-neon-pink/5 mb-4">
        <h4 className="text-sm font-display text-neon-pink mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          奖池保护机制
        </h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• 单次最大派奖: 奖池的 <span className="text-neon-yellow">{(POOL_PROTECTION.maxSinglePayout * 100).toFixed(0)}%</span></p>
          <p>• 储备金保留: <span className="text-neon-green">{(POOL_PROTECTION.reservePercent * 100).toFixed(0)}%</span> 用于持续运营</p>
        </div>
      </div>

      {/* 6级奖励表 - 基于奖池百分比 */}
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
          * 实际派奖 = 奖池 × 百分比 (不超过最大派奖限制)
        </p>
      </div>

      {/* 投注概率加成表 */}
      <div className="neon-border-cyan rounded-lg p-3 bg-neon-cyan/5 mb-4">
        <h4 className="text-sm font-display text-neon-cyan mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          投注概率加成
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
                    {multiplier}x 中奖概率
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
          投注越高，稀有符号出现概率越大
        </p>
      </div>

      {/* 符号出现概率 */}
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
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 中奖条件 */}
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
          <p><span className="text-neon-cyan">⭐ 三等奖:</span> 4连普通符号</p>
          <p><span className="text-neon-green">🍀 小奖:</span> 任意3连线</p>
        </div>
      </div>

      {/* 赔付线信息 */}
      <div className="neon-border rounded-lg p-3 bg-muted/20 mb-4">
        <h4 className="text-sm font-display text-neon-purple mb-2 flex items-center gap-2">
          <Medal className="w-4 h-4" />
          赔付线 ({PAYLINES.length}条)
        </h4>
        <div className="text-xs text-muted-foreground">
          <p>15条赔付线同时检测，取最高奖励等级派奖</p>
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
