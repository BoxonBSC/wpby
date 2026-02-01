// HiLo 高低游戏配置
// 适配代币燃烧 + BNB百分比奖池机制
// 单一门槛500K + 12连胜奖励阶梯

// ========================================
// 核心机制说明
// ========================================
// 1. 统一下注金额：500K 凭证
// 2. 连胜次数决定奖励百分比（最高12连胜）
// 3. 随时可收手兑现
// 4. 平局算输（约7.7%概率）

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
// 单一门槛配置（500K）
// ========================================
export interface BetTier {
  id: string;
  name: string;
  betAmount: number;      // 下注金额（凭证）
  maxStreak: number;      // 最高可达连胜数
  color: string;
  description: string;    // 等级描述
}

// 单一门槛：500K，最高12连胜
export const BET_TIERS: BetTier[] = [
  { id: 'standard', name: '标准', betAmount: 500000, maxStreak: 12, color: '#FFD700', description: '500K凭证' },
];

// 获取下注等级（单一门槛直接返回）
export function getBetTier(betAmount: number): BetTier {
  return BET_TIERS[0];
}

// ========================================
// 奖励区域定义
// ========================================
export type RewardZone = 'common' | 'advanced' | 'elite' | 'legendary';

export const ZONE_COLORS: Record<RewardZone, { bg: string; border: string; text: string }> = {
  common: { bg: 'rgba(107, 114, 128, 0.2)', border: '#6B7280', text: '#9CA3AF' },
  advanced: { bg: 'rgba(192, 192, 192, 0.2)', border: '#C0C0C0', text: '#D1D5DB' },
  elite: { bg: 'rgba(255, 215, 0, 0.2)', border: '#FFD700', text: '#FDE68A' },
  legendary: { bg: 'linear-gradient(135deg, rgba(255, 0, 128, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%)', border: '#FF0080', text: '#00D4FF' },
};

export const ZONE_LABELS: Record<RewardZone, string> = {
  common: '入门区',
  advanced: '进阶区',
  elite: '精英区',
  legendary: '传奇区',
};

// ========================================
// 12连胜奖励配置（基础0.2%，最高100%）
// ========================================
// 设计理念：
// - 基础奖励0.2%，让低连胜也有感
// - 逐步递增，中连胜有爆发
// - 12连胜清空奖池（约1.4%概率）

export interface RewardTier {
  streak: number;
  percentage: number;     // 奖池百分比
  zone: RewardZone;       // 所属区域
  milestone?: {           // 关键节点
    tier: string;
    emoji: string;
    label: string;
  };
}

// 12级奖励阶梯
export const REWARD_TIERS: RewardTier[] = [
  // 入门区（1-3连胜）~36%玩家能到
  { streak: 1, percentage: 0.2, zone: 'common' },
  { streak: 2, percentage: 0.4, zone: 'common' },
  { streak: 3, percentage: 0.8, zone: 'common', milestone: { tier: 'standard', emoji: '🎯', label: '36%玩家' } },
  
  // 进阶区（4-6连胜）~13%玩家能到
  { streak: 4, percentage: 1.5, zone: 'advanced' },
  { streak: 5, percentage: 3, zone: 'advanced', milestone: { tier: 'standard', emoji: '⭐', label: '18%玩家' } },
  { streak: 6, percentage: 5, zone: 'advanced' },
  
  // 精英区（7-9连胜）~4%玩家能到
  { streak: 7, percentage: 10, zone: 'elite', milestone: { tier: 'standard', emoji: '🔥', label: '9%玩家' } },
  { streak: 8, percentage: 18, zone: 'elite' },
  { streak: 9, percentage: 30, zone: 'elite' },
  
  // 传奇区（10-12连胜）~1.4%玩家能到
  { streak: 10, percentage: 50, zone: 'legendary', milestone: { tier: 'standard', emoji: '💎', label: '3%玩家' } },
  { streak: 11, percentage: 70, zone: 'legendary' },
  { streak: 12, percentage: 100, zone: 'legendary', milestone: { tier: 'standard', emoji: '👑', label: '清空奖池' } },
];

// 获取当前奖励等级
export function getCurrentRewardTier(streak: number, maxStreak: number): RewardTier | null {
  if (streak <= 0) return null;
  
  const effectiveStreak = Math.min(streak, maxStreak);
  const tier = REWARD_TIERS.find(t => t.streak === effectiveStreak);
  return tier || null;
}

// 计算实际BNB奖励（纯百分比）
export function calculateHiLoReward(
  streak: number,
  maxStreak: number,
  prizePoolBNB: number
): number {
  const tier = getCurrentRewardTier(streak, maxStreak);
  if (!tier) return 0;
  
  return prizePoolBNB * (tier.percentage / 100);
}

// 计算猜对概率（简化版，不含Same）
export function calculateWinProbability(currentValue: number, guess: Guess): number {
  if (guess === 'same') {
    return 1 / 13; // 约7.7%
  }
  
  if (guess === 'higher') {
    return (13 - currentValue) / 13;
  }
  
  return (currentValue - 1) / 13;
}

// 获取门槛对应的最高奖励等级
export function getTierMaxReward(tier: BetTier, prizePoolBNB: number): RewardTier | null {
  const maxRewardTier = REWARD_TIERS.find(r => r.streak === tier.maxStreak);
  return maxRewardTier || null;
}

// 游戏配置
export const HILO_CONFIG = {
  animation: {
    flipDuration: 600,
    revealDelay: 300,
  },
  // Same已禁用
  sameGuessStreakBonus: 2,
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
