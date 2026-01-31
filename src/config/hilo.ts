// HiLo 高低游戏配置
// 适配代币燃烧 + BNB百分比奖池机制
// 5门槛等级 + 20连胜奖励阶梯（按65%胜率科学设计）

// ========================================
// 核心机制说明
// ========================================
// 1. 下注金额 = 门槛等级（决定可获得的最高奖励）
// 2. 连胜次数决定奖励百分比
// 3. 随时可收手兑现
// 4. 按65%实际胜率设计，保护奖池

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
// 5门槛等级配置
// ========================================
export interface BetTier {
  id: string;
  name: string;
  betAmount: number;      // 下注金额（凭证）
  maxStreak: number;      // 最高可达连胜数
  color: string;
  description: string;    // 等级描述
}

export const BET_TIERS: BetTier[] = [
  { id: 'bronze', name: '青铜', betAmount: 50000, maxStreak: 5, color: '#CD7F32', description: '入门级' },
  { id: 'silver', name: '白银', betAmount: 100000, maxStreak: 8, color: '#C0C0C0', description: '进阶级' },
  { id: 'gold', name: '黄金', betAmount: 200000, maxStreak: 12, color: '#FFD700', description: '精英级' },
  { id: 'platinum', name: '铂金', betAmount: 500000, maxStreak: 16, color: '#E5E4E2', description: '大师级' },
  { id: 'diamond', name: '钻石', betAmount: 1000000, maxStreak: 20, color: '#00D4FF', description: '传奇级' },
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
  common: '常见区',
  advanced: '进阶区',
  elite: '精英区',
  legendary: '传奇区',
};

// ========================================
// 20连胜奖励配置（按65%胜率科学设计）
// ========================================
// 设计理念：
// - 65%胜率下的真实概率分布
// - 低连胜常见但奖励极少
// - 高连胜稀有但奖励丰厚
// - 20连胜清空奖池（造梦机制）

export interface RewardTier {
  streak: number;
  percentage: number;     // 奖池百分比
  probability: number;    // 65%胜率下的达成概率（百分比）
  zone: RewardZone;       // 所属区域
  label: string;
  oddsDescription: string; // 概率描述（X人中1人）
}

// 20级奖励阶梯
export const REWARD_TIERS: RewardTier[] = [
  // 常见区（1-5连胜）- 高概率，低奖励
  { streak: 1, percentage: 0.02, probability: 65, zone: 'common', label: '入门', oddsDescription: '2人中1人' },
  { streak: 2, percentage: 0.05, probability: 42, zone: 'common', label: '初级', oddsDescription: '2人中1人' },
  { streak: 3, percentage: 0.1, probability: 27, zone: 'common', label: '中级', oddsDescription: '4人中1人' },
  { streak: 4, percentage: 0.15, probability: 18, zone: 'common', label: '高级', oddsDescription: '5人中1人' },
  { streak: 5, percentage: 0.25, probability: 11.6, zone: 'common', label: '青铜上限', oddsDescription: '10人中1人' },
  
  // 进阶区（6-10连胜）- 中等概率，开始有吸引力
  { streak: 6, percentage: 0.4, probability: 7.5, zone: 'advanced', label: '进阶', oddsDescription: '13人中1人' },
  { streak: 7, percentage: 0.6, probability: 4.9, zone: 'advanced', label: '熟练', oddsDescription: '20人中1人' },
  { streak: 8, percentage: 1, probability: 3.2, zone: 'advanced', label: '白银上限', oddsDescription: '30人中1人' },
  { streak: 9, percentage: 1.5, probability: 2.1, zone: 'advanced', label: '精通', oddsDescription: '50人中1人' },
  { streak: 10, percentage: 2.5, probability: 1.35, zone: 'advanced', label: '大师', oddsDescription: '100人中1人' },
  
  // 精英区（11-15连胜）- 低概率，大奖区域
  { streak: 11, percentage: 4, probability: 0.88, zone: 'elite', label: '精英', oddsDescription: '114人中1人' },
  { streak: 12, percentage: 6, probability: 0.57, zone: 'elite', label: '黄金上限', oddsDescription: '175人中1人' },
  { streak: 13, percentage: 9, probability: 0.37, zone: 'elite', label: '专家', oddsDescription: '270人中1人' },
  { streak: 14, percentage: 13, probability: 0.24, zone: 'elite', label: '宗师', oddsDescription: '417人中1人' },
  { streak: 15, percentage: 18, probability: 0.16, zone: 'elite', label: '王者', oddsDescription: '625人中1人' },
  
  // 传奇区（16-20连胜）- 极低概率，超级大奖
  { streak: 16, percentage: 25, probability: 0.1, zone: 'legendary', label: '铂金上限', oddsDescription: '1000人中1人' },
  { streak: 17, percentage: 35, probability: 0.065, zone: 'legendary', label: '传说', oddsDescription: '1538人中1人' },
  { streak: 18, percentage: 50, probability: 0.042, zone: 'legendary', label: '神话', oddsDescription: '2381人中1人' },
  { streak: 19, percentage: 70, probability: 0.028, zone: 'legendary', label: '至尊', oddsDescription: '3571人中1人' },
  { streak: 20, percentage: 100, probability: 0.018, zone: 'legendary', label: '清空奖池', oddsDescription: '5556人中1人' },
];

// 获取当前奖励等级（受门槛限制）
export function getCurrentRewardTier(streak: number, maxStreak: number): RewardTier | null {
  if (streak <= 0) return null;
  
  // 限制在门槛允许的最大连胜
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
  
  // 纯百分比计算，奖池越大奖励越大
  return prizePoolBNB * (tier.percentage / 100);
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
