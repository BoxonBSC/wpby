// HiLo 高低游戏配置
// 适配代币燃烧 + BNB百分比奖池机制

// ========================================
// 核心机制说明
// ========================================
// 1. 玩家下注（消耗凭证）
// 2. 显示一张牌，猜下一张比它高还是低
// 3. 猜对继续，连对次数决定奖励百分比
// 4. 猜错归零，随时可收手兑现
// 5. A最小(1)，K最大(13)

// 扑克牌定义
export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export const SUIT_COLORS: Record<string, string> = {
  '♠': '#C9A347',
  '♥': '#FF4444',
  '♦': '#FF4444', 
  '♣': '#C9A347',
};

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export const RANK_VALUES: Record<string, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13,
};

export interface Card {
  suit: typeof SUITS[number];
  rank: typeof RANKS[number];
  value: number;
}

// 生成随机牌
export function generateRandomCard(): Card {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  return {
    suit,
    rank,
    value: RANK_VALUES[rank],
  };
}

// 游戏状态
export type HiLoGameState = 'idle' | 'playing' | 'won' | 'lost';

// 猜测类型
export type Guess = 'higher' | 'lower' | 'same';

// 奖励阶梯（连对次数 → 奖池百分比）
export interface RewardTier {
  streak: number;
  percentage: number;
  maxBNB: number;
  label: string;
}

export const REWARD_TIERS: RewardTier[] = [
  { streak: 1, percentage: 0.1, maxBNB: 0.05, label: '初级' },
  { streak: 2, percentage: 0.3, maxBNB: 0.15, label: '进阶' },
  { streak: 3, percentage: 0.5, maxBNB: 0.3, label: '中级' },
  { streak: 4, percentage: 1.0, maxBNB: 0.5, label: '高级' },
  { streak: 5, percentage: 2.0, maxBNB: 1.0, label: '精英' },
  { streak: 6, percentage: 5.0, maxBNB: 2.0, label: '大师' },
  { streak: 7, percentage: 10.0, maxBNB: 5.0, label: '传奇' },
];

// 获取当前奖励等级
export function getCurrentRewardTier(streak: number): RewardTier | null {
  if (streak <= 0) return null;
  const tier = REWARD_TIERS.find(t => t.streak === streak);
  return tier || REWARD_TIERS[REWARD_TIERS.length - 1]; // 超过最大等级使用最高奖励
}

// 计算实际BNB奖励
export function calculateHiLoReward(
  streak: number,
  prizePoolBNB: number
): number {
  const tier = getCurrentRewardTier(streak);
  if (!tier) return 0;
  
  const percentageReward = prizePoolBNB * (tier.percentage / 100);
  return Math.min(percentageReward, tier.maxBNB);
}

// 计算猜对概率
export function calculateWinProbability(currentValue: number, guess: Guess): number {
  if (guess === 'same') {
    return 3 / 51; // 同花色的相同点数
  }
  
  if (guess === 'higher') {
    // 比当前牌大的牌数
    const higherCards = (13 - currentValue) * 4;
    return higherCards / 51;
  }
  
  // lower
  const lowerCards = (currentValue - 1) * 4;
  return lowerCards / 51;
}

// 游戏配置
export const HILO_CONFIG = {
  // 下注参数（凭证）
  bet: {
    min: 10000,
    max: 500000,
    default: 20000,
    presets: [10000, 20000, 50000, 100000, 200000],
  },
  
  // 动画时间
  animation: {
    flipDuration: 600,
    revealDelay: 300,
  },
  
  // 最大连胜
  maxStreak: 10,
};

// 游戏历史记录
export interface HiLoResult {
  id: string;
  betAmount: number;
  streak: number;
  bnbWon: number;
  cashedOut: boolean; // true=主动收手, false=猜错
  timestamp: number;
}
