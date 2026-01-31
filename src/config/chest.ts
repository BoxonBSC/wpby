// 宝箱开箱游戏配置
// 复用7档奖励系统 + BNB奖池机制

// 奖励类型 - 复用7档
export type RewardType = 
  | 'legendary'      // 传奇：奖池50%，上限10 BNB
  | 'super_jackpot'  // 超级大奖：奖池35%，上限5 BNB
  | 'jackpot'        // 大奖：奖池20%，上限3 BNB
  | 'big_win'        // 中大奖：奖池10%，上限1.5 BNB
  | 'medium'         // 中奖：奖池5%，上限0.8 BNB
  | 'small_win'      // 小中奖：奖池3%，上限0.3 BNB
  | 'no_win';        // 未中奖

// 奖励配置
export interface RewardConfig {
  type: RewardType;
  label: string;
  emoji: string;
  poolPercent: number;
  maxBNB: number;
  color: string;
  glowColor: string;
}

// 7档奖励配置
export const REWARDS: Record<RewardType, RewardConfig> = {
  legendary: {
    type: 'legendary',
    label: '传奇',
    emoji: '👑',
    poolPercent: 0.50,
    maxBNB: 10,
    color: '#FF00FF',
    glowColor: '#FF66FF',
  },
  super_jackpot: {
    type: 'super_jackpot',
    label: '超级大奖',
    emoji: '🏆',
    poolPercent: 0.35,
    maxBNB: 5,
    color: '#FF0000',
    glowColor: '#FF6666',
  },
  jackpot: {
    type: 'jackpot',
    label: '大奖',
    emoji: '🎉',
    poolPercent: 0.20,
    maxBNB: 3,
    color: '#FF6600',
    glowColor: '#FF9944',
  },
  big_win: {
    type: 'big_win',
    label: '中大奖',
    emoji: '🎊',
    poolPercent: 0.10,
    maxBNB: 1.5,
    color: '#FFCC00',
    glowColor: '#FFE066',
  },
  medium: {
    type: 'medium',
    label: '中奖',
    emoji: '✨',
    poolPercent: 0.05,
    maxBNB: 0.8,
    color: '#00FF88',
    glowColor: '#66FFAA',
  },
  small_win: {
    type: 'small_win',
    label: '小中奖',
    emoji: '🌟',
    poolPercent: 0.03,
    maxBNB: 0.3,
    color: '#00CCFF',
    glowColor: '#66DDFF',
  },
  no_win: {
    type: 'no_win',
    label: '未中奖',
    emoji: '💨',
    poolPercent: 0,
    maxBNB: 0,
    color: '#666666',
    glowColor: '#888888',
  },
};

// 宝箱等级配置
export interface ChestTier {
  id: string;
  name: string;
  description: string;
  cost: number; // 凭证消耗
  color: string;
  metalColor: string;
  gemColor: string;
  // 每档奖励的中奖概率 (总和 <= 100%)
  rewards: { type: RewardType; probability: number }[];
}

// 4档宝箱配置
export const CHEST_TIERS: ChestTier[] = [
  {
    id: 'bronze',
    name: '青铜宝箱',
    description: '基础宝箱，小概率中奖',
    cost: 20000,
    color: '#CD7F32',
    metalColor: '#8B4513',
    gemColor: '#A0522D',
    rewards: [
      { type: 'medium', probability: 2 },      // 2% 中奖
      { type: 'small_win', probability: 3 },   // 3% 小中奖
      { type: 'no_win', probability: 95 },     // 95% 未中奖
    ],
  },
  {
    id: 'silver',
    name: '白银宝箱',
    description: '中级宝箱，更高中奖率',
    cost: 50000,
    color: '#C0C0C0',
    metalColor: '#A8A8A8',
    gemColor: '#E8E8E8',
    rewards: [
      { type: 'big_win', probability: 1 },     // 1% 中大奖
      { type: 'medium', probability: 3 },      // 3% 中奖
      { type: 'small_win', probability: 5 },   // 5% 小中奖
      { type: 'no_win', probability: 91 },     // 91% 未中奖
    ],
  },
  {
    id: 'gold',
    name: '黄金宝箱',
    description: '高级宝箱，可出大奖',
    cost: 100000,
    color: '#FFD700',
    metalColor: '#DAA520',
    gemColor: '#FFF8DC',
    rewards: [
      { type: 'jackpot', probability: 0.5 },     // 0.5% 大奖
      { type: 'big_win', probability: 2 },       // 2% 中大奖
      { type: 'medium', probability: 5 },        // 5% 中奖
      { type: 'small_win', probability: 7 },     // 7% 小中奖
      { type: 'no_win', probability: 85.5 },     // 85.5% 未中奖
    ],
  },
  {
    id: 'diamond',
    name: '钻石宝箱',
    description: '传奇宝箱，最高奖励',
    cost: 500000,
    color: '#B9F2FF',
    metalColor: '#87CEEB',
    gemColor: '#E0FFFF',
    rewards: [
      { type: 'legendary', probability: 0.1 },     // 0.1% 传奇
      { type: 'super_jackpot', probability: 0.5 }, // 0.5% 超级大奖
      { type: 'jackpot', probability: 1.5 },       // 1.5% 大奖
      { type: 'big_win', probability: 3 },         // 3% 中大奖
      { type: 'medium', probability: 8 },          // 8% 中奖
      { type: 'small_win', probability: 10 },      // 10% 小中奖
      { type: 'no_win', probability: 76.9 },       // 76.9% 未中奖
    ],
  },
];

// 根据概率随机选择奖励
export function rollReward(tier: ChestTier): RewardType {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const reward of tier.rewards) {
    cumulative += reward.probability;
    if (random < cumulative) {
      return reward.type;
    }
  }
  
  return 'no_win';
}

// 计算BNB奖励金额
export function calculateBNBReward(
  rewardType: RewardType,
  prizePoolBNB: number
): number {
  const config = REWARDS[rewardType];
  if (!config || config.poolPercent === 0) return 0;
  
  const calculated = prizePoolBNB * config.poolPercent;
  return Math.min(calculated, config.maxBNB);
}

// 判断是否为大奖
export function isBigWin(type: RewardType): boolean {
  return ['legendary', 'super_jackpot', 'jackpot', 'big_win'].includes(type);
}

export function isJackpot(type: RewardType): boolean {
  return ['legendary', 'super_jackpot'].includes(type);
}

export function isWin(type: RewardType): boolean {
  return type !== 'no_win';
}

// 游戏结果类型
export interface ChestResult {
  id: string;
  chestTier: string;
  cost: number;
  rewardType: RewardType;
  bnbWinAmount: number;
  timestamp: number;
}

// 下注等级选项
export const BET_MULTIPLIERS = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 5, label: '5x' },
  { value: 10, label: '10x' },
];
