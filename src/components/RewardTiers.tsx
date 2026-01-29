import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';

const tiers = [
  {
    icon: Trophy,
    name: '头奖',
    condition: '三个 7️⃣',
    reward: '奖池 20%',
    color: 'neon-yellow',
    borderClass: 'border-neon-yellow',
    glowClass: 'shadow-[0_0_20px_hsl(50_100%_50%/0.5)]',
  },
  {
    icon: Medal,
    name: '二等奖',
    condition: '三个相同图案',
    reward: '奖池 5%',
    color: 'neon-purple',
    borderClass: 'border-neon-purple',
    glowClass: 'shadow-[0_0_20px_hsl(280_100%_60%/0.5)]',
  },
  {
    icon: Award,
    name: '小奖',
    condition: '两个相同图案',
    reward: '奖池 1%',
    color: 'neon-cyan',
    borderClass: 'border-neon-cyan',
    glowClass: 'shadow-[0_0_20px_hsl(180_100%_50%/0.5)]',
  },
];

export function RewardTiers() {
  return (
    <div className="cyber-card">
      <h3 className="text-xl font-display neon-text-purple mb-4">奖励等级</h3>
      
      <div className="space-y-3">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center gap-4 p-3 rounded-lg
              border ${tier.borderClass} ${tier.glowClass}
              bg-muted/30 hover:bg-muted/50 transition-colors
            `}
          >
            <div className={`p-2 rounded-lg bg-${tier.color}/20`}>
              <tier.icon className={`w-6 h-6 text-${tier.color}`} />
            </div>
            <div className="flex-1">
              <div className={`font-display text-${tier.color}`}>{tier.name}</div>
              <div className="text-sm text-muted-foreground">{tier.condition}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-foreground">{tier.reward}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Probability info */}
      <div className="mt-4 p-3 neon-border rounded-lg bg-muted/20">
        <h4 className="text-sm font-display text-neon-green mb-2">累积概率机制</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• 基础中奖概率: 5%</li>
          <li>• 每次未中奖增加: +2%</li>
          <li>• 最高概率上限: 50%</li>
          <li>• 中奖后概率重置</li>
        </ul>
      </div>
    </div>
  );
}
