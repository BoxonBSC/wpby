// Plinko 游戏配置 - 多等级造富效应模型

export const PLINKO_CONFIG = {
  // 物理引擎参数
  physics: {
    gravity: { x: 0, y: 1.8 },
    restitution: 0.5,
    friction: 0.1,
    frictionAir: 0.02,
    density: 0.001,
  },
  
  // 游戏参数 - 增加行数获得更多槽位
  game: {
    rows: 16,                    // 16行 = 17个槽位
    pegRadius: 5,                // 稍小的钉子
    ballRadius: 8,               // 稍小的球
    pegSpacing: 32,              // 更紧凑的间距
    dropZoneWidth: 25,
  },
  
  // 视觉参数
  visuals: {
    backgroundColor: 0x0a0908,
    pegColor: 0xC9A347,
    pegGlowColor: 0xFFD700,
    ballColor: 0xE0E0E0,
    ballGlowColor: 0xFFFFFF,
  },
  
  // 动画参数
  animation: {
    trailLength: 12,
    trailOpacity: 0.3,
    collisionParticles: 6,
    winCelebrationDuration: 2000,
  },
};

// ========================================
// 多等级BNB奖励系统
// ========================================
// 
// 奖励等级：30%, 35%, 40%, 45%, 50%, 55%, 60%, 65%, 70%
// 17个槽位分布（对称，边缘高倍率）：
// 
// 中奖槽位分散，大部分是未中奖，增加难度

// 奖励类型
export type RewardType = 
  | 'tier_70'    // 70% BNB
  | 'tier_65'    // 65% BNB
  | 'tier_60'    // 60% BNB
  | 'tier_55'    // 55% BNB
  | 'tier_50'    // 50% BNB
  | 'tier_45'    // 45% BNB
  | 'tier_40'    // 40% BNB
  | 'tier_35'    // 35% BNB
  | 'tier_30'    // 30% BNB
  | 'no_win';    // 未中奖

// 槽位奖励配置
export interface SlotReward {
  type: RewardType;
  label: string;           // 画布显示标签
  fullLabel: string;       // 结果显示标签
  poolPercent?: number;    // BNB奖池百分比
  color: number;           // 显示颜色
}

// 颜色渐变：红(高) -> 橙 -> 黄 -> 绿(低) -> 灰(无)
const COLORS = {
  tier_70: 0xFF0000,   // 深红
  tier_65: 0xFF2200,   // 红
  tier_60: 0xFF4400,   // 红橙
  tier_55: 0xFF6600,   // 橙
  tier_50: 0xFF8800,   // 橙黄
  tier_45: 0xFFAA00,   // 黄橙
  tier_40: 0xFFCC00,   // 黄
  tier_35: 0xDDDD00,   // 黄绿
  tier_30: 0xAADD00,   // 绿黄
  no_win: 0x333333,    // 深灰
};

// 17个槽位的奖励配置（对称分布）
// 布局：70-×-60-×-50-×-40-×-30-×-40-×-50-×-60-×-70
// 边缘最高，中间最低，分散中奖槽位
export const SLOT_REWARDS: SlotReward[] = [
  // 槽位 0 - 最左（最难命中）
  { type: 'tier_70', label: '70%', fullLabel: '70% BNB', poolPercent: 0.70, color: COLORS.tier_70 },
  // 槽位 1
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 2
  { type: 'tier_60', label: '60%', fullLabel: '60% BNB', poolPercent: 0.60, color: COLORS.tier_60 },
  // 槽位 3
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 4
  { type: 'tier_50', label: '50%', fullLabel: '50% BNB', poolPercent: 0.50, color: COLORS.tier_50 },
  // 槽位 5
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 6
  { type: 'tier_40', label: '40%', fullLabel: '40% BNB', poolPercent: 0.40, color: COLORS.tier_40 },
  // 槽位 7
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 8 - 中间（最容易命中）
  { type: 'tier_30', label: '30%', fullLabel: '30% BNB', poolPercent: 0.30, color: COLORS.tier_30 },
  // 槽位 9
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 10
  { type: 'tier_40', label: '40%', fullLabel: '40% BNB', poolPercent: 0.40, color: COLORS.tier_40 },
  // 槽位 11
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 12
  { type: 'tier_50', label: '50%', fullLabel: '50% BNB', poolPercent: 0.50, color: COLORS.tier_50 },
  // 槽位 13
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 14
  { type: 'tier_60', label: '60%', fullLabel: '60% BNB', poolPercent: 0.60, color: COLORS.tier_60 },
  // 槽位 15
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 16 - 最右（最难命中）
  { type: 'tier_70', label: '70%', fullLabel: '70% BNB', poolPercent: 0.70, color: COLORS.tier_70 },
];

// 旧版倍率表（兼容）
export const MULTIPLIER_TABLE: number[] = SLOT_REWARDS.map(reward => {
  if (reward.poolPercent) return reward.poolPercent * 100;
  return 0;
});

// 获取槽位颜色
export function getSlotColor(slotIndex: number): number {
  return SLOT_REWARDS[slotIndex]?.color || COLORS.no_win;
}

// 计算实际奖励金额（BNB奖池）
export function calculateReward(
  slotIndex: number,
  betAmount: number,
  prizePoolBNB: number
): { amount: number; type: RewardType; label: string; bnbAmount: number } {
  const reward = SLOT_REWARDS[slotIndex];
  
  if (!reward || reward.type === 'no_win') {
    return { amount: 0, type: 'no_win', label: '未中奖', bnbAmount: 0 };
  }
  
  const bnbAmount = prizePoolBNB * (reward.poolPercent || 0);
  
  return {
    amount: 0,
    type: reward.type,
    label: reward.fullLabel,
    bnbAmount,
  };
}

// 判断奖励等级
export function isJackpot(type: RewardType): boolean {
  return type === 'tier_70' || type === 'tier_65';
}

export function isBigWin(type: RewardType): boolean {
  return type === 'tier_70' || type === 'tier_65' || type === 'tier_60' || type === 'tier_55' || type === 'tier_50';
}

export function isWin(type: RewardType): boolean {
  return type !== 'no_win';
}

// 获取奖励等级数值
export function getRewardPercent(type: RewardType): number {
  const match = type.match(/tier_(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// 下注等级（用游戏凭证）
export const PLINKO_BET_LEVELS = [
  { value: 10000, label: '10K', display: '10,000' },
  { value: 25000, label: '25K', display: '25,000' },
  { value: 50000, label: '50K', display: '50,000' },
  { value: 100000, label: '100K', display: '100,000' },
  { value: 250000, label: '250K', display: '250,000' },
];

// 自动投球次数选项
export const AUTO_DROP_OPTIONS = [
  { value: 0, label: '手动' },
  { value: 5, label: '5次' },
  { value: 10, label: '10次' },
  { value: 25, label: '25次' },
  { value: 50, label: '50次' },
  { value: 100, label: '100次' },
];

export type PlinkoResult = {
  id: string;
  betAmount: number;
  winAmount: number;
  bnbWinAmount: number;
  rewardType: RewardType;
  rewardLabel: string;
  slotIndex: number;
  timestamp: number;
};

// ========================================
// 经济模型说明
// ========================================
// 
// 槽位分布（17个，对称）：
// [70%][×][60%][×][50%][×][40%][×][30%][×][40%][×][50%][×][60%][×][70%]
// 
// 命中概率估算（基于物理模拟，16行钉子）：
// - 边缘 70%: ~0.01% (极难)
// - 60%: ~0.5%
// - 50%: ~3%
// - 40%: ~8%
// - 30% (中间): ~15%
// - 未中奖: ~50%+ (大部分)
// 
// 整体中奖率约 ~50%，但大部分是低等级(30-40%)
// 高等级(60-70%)极难命中，创造造富效应
