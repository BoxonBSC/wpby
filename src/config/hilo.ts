// HiLo 高低游戏配置
// 适配代币燃烧 + BNB百分比奖池机制
// 门槛制 + 超低风险奖励

// ========================================
// 核心机制说明
// ========================================
// 1. 下注金额 = 门槛等级（决定可获得的最高奖励）
// 2. 连胜次数决定奖励百分比
// 3. 随时可收手兑现
// 4. 超低风险设计保护奖池

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

// ========================================
// 门槛等级配置
// ========================================
export interface BetTier {
  id: string;
  name: string;
  betAmount: number;      // 下注金额（凭证）
  maxStreak: number;      // 最高可达连胜数
  color: string;
}

export const BET_TIERS: BetTier[] = [
  { id: 'bronze', name: '青铜', betAmount: 10000, maxStreak: 3, color: '#CD7F32' },
  { id: 'silver', name: '白银', betAmount: 50000, maxStreak: 5, color: '#C0C0C0' },
  { id: 'gold', name: '黄金', betAmount: 200000, maxStreak: 7, color: '#FFD700' },
];

// 获取下注等级
export function getBetTier(betAmount: number): BetTier {
  // 找到匹配的等级（从高到低）
  for (let i = BET_TIERS.length - 1; i >= 0; i--) {
    if (betAmount >= BET_TIERS[i].betAmount) {
      return BET_TIERS[i];
    }
  }
  return BET_TIERS[0]; // 默认青铜
}

// ========================================
// 超低风险奖励配置
// ========================================
export interface RewardTier {
  streak: number;
  percentage: number;     // 奖池百分比
  maxBNB: number;         // 绝对上限
  label: string;
}

export const REWARD_TIERS: RewardTier[] = [
  { streak: 1, percentage: 0.01, maxBNB: 0.001, label: '入门' },
  { streak: 2, percentage: 0.02, maxBNB: 0.002, label: '初级' },
  { streak: 3, percentage: 0.05, maxBNB: 0.005, label: '中级' },      // 青铜上限
  { streak: 4, percentage: 0.1, maxBNB: 0.01, label: '高级' },
  { streak: 5, percentage: 0.2, maxBNB: 0.02, label: '精英' },        // 白银上限
  { streak: 6, percentage: 0.3, maxBNB: 0.03, label: '大师' },
  { streak: 7, percentage: 0.5, maxBNB: 0.05, label: '传奇' },        // 黄金上限
];

// 获取当前奖励等级（受门槛限制）
export function getCurrentRewardTier(streak: number, maxStreak: number): RewardTier | null {
  if (streak <= 0) return null;
  
  // 限制在门槛允许的最大连胜
  const effectiveStreak = Math.min(streak, maxStreak);
  const tier = REWARD_TIERS.find(t => t.streak === effectiveStreak);
  return tier || null;
}

// 计算实际BNB奖励
export function calculateHiLoReward(
  streak: number,
  maxStreak: number,
  prizePoolBNB: number
): number {
  const tier = getCurrentRewardTier(streak, maxStreak);
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
    const higherCards = (13 - currentValue) * 4;
    return higherCards / 51;
  }
  
  const lowerCards = (currentValue - 1) * 4;
  return lowerCards / 51;
}

// 游戏配置
export const HILO_CONFIG = {
  animation: {
    flipDuration: 600,
    revealDelay: 300,
  },
};

// 游戏历史记录
export interface HiLoResult {
  id: string;
  betAmount: number;
  betTier: string;
  streak: number;
  bnbWon: number;
  cashedOut: boolean;
  timestamp: number;
}
