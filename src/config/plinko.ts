// Plinko 游戏配置 - 可持续造富效应模型
// 设计目标：日均2000-10000次游戏，奖池来源于代币交易税
// 20行钉子 = 21个槽位，边缘概率极低

export const PLINKO_CONFIG = {
  // 物理引擎参数 - 增加摩擦让球更难到达边缘
  physics: {
    gravity: { x: 0, y: 1.6 },      // 稍微降低重力
    restitution: 0.45,              // 降低弹性
    friction: 0.15,                 // 增加摩擦
    frictionAir: 0.025,             // 增加空气阻力
    density: 0.001,
  },
  
  // 游戏参数 - 20行 = 21个槽位
  game: {
    rows: 20,                       // 20行钉子
    pegRadius: 4,                   // 更小的钉子
    ballRadius: 6,                  // 更小的球
    pegSpacing: 28,                 // 更紧凑的间距
    dropZoneWidth: 15,              // 缩小投球区域（关键！）
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
    trailLength: 10,
    trailOpacity: 0.3,
    collisionParticles: 5,
    winCelebrationDuration: 2000,
  },
};

// ========================================
// 可持续BNB奖励系统 - 20行高难度模型
// ========================================
// 
// 20行二项分布概率（每边）：
// 槽位0/20: C(20,0)/2^20 = 0.000095% (百万分之一！)
// 槽位1/19: C(20,1)/2^20 = 0.0019%
// 槽位2/18: C(20,2)/2^20 = 0.018%
// 槽位3/17: C(20,3)/2^20 = 0.109%
// 槽位4/16: C(20,4)/2^20 = 0.46%
// 槽位5/15: C(20,5)/2^20 = 1.48%
// 槽位6/14: C(20,6)/2^20 = 3.70%
// 槽位7/13: C(20,7)/2^20 = 7.39%
// 槽位8/12: C(20,8)/2^20 = 12.01%
// 槽位9/11: C(20,9)/2^20 = 16.02%
// 槽位10:   C(20,10)/2^20 = 17.62%
//
// 21槽位分布（对称）：
// [50%][×][40%][×][30%][×][20%][×][10%][×][3%][×][10%][×][20%][×][30%][×][40%][×][50%]

// 奖励类型
export type RewardType = 
  | 'jackpot_50'    // 50% BNB - 超级大奖
  | 'tier_40'       // 40% BNB - 大奖
  | 'tier_30'       // 30% BNB - 中大奖
  | 'tier_20'       // 20% BNB - 中奖
  | 'tier_10'       // 10% BNB - 小奖
  | 'tier_3'        // 3% BNB - 安慰奖
  | 'no_win';       // 未中奖

// 槽位奖励配置
export interface SlotReward {
  type: RewardType;
  label: string;           // 画布显示标签
  fullLabel: string;       // 结果显示标签
  poolPercent?: number;    // BNB奖池百分比
  color: number;           // 显示颜色
}

// 颜色：红(高) → 橙 → 黄 → 绿(低) → 灰(无)
const COLORS = {
  jackpot_50: 0xFF0000,  // 深红 - 超级大奖
  tier_40: 0xFF3300,     // 红橙 - 大奖
  tier_30: 0xFF6600,     // 橙 - 中大奖
  tier_20: 0xFF9900,     // 橙黄 - 中奖
  tier_10: 0xFFCC00,     // 黄 - 小奖
  tier_3: 0xAADD00,      // 绿黄 - 安慰奖
  no_win: 0x333333,      // 深灰 - 未中奖
};

// 21个槽位的奖励配置（对称分布，20行）
// [50%][×][40%][×][30%][×][20%][×][10%][×][3%][×][10%][×][20%][×][30%][×][40%][×][50%]
export const SLOT_REWARDS: SlotReward[] = [
  // 槽位 0 - 最左边缘（概率 0.0001%）
  { type: 'jackpot_50', label: '50%', fullLabel: '🏆 超级大奖 50%', poolPercent: 0.50, color: COLORS.jackpot_50 },
  // 槽位 1 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 2 - 大奖（概率 0.018%）
  { type: 'tier_40', label: '40%', fullLabel: '🎉 大奖 40%', poolPercent: 0.40, color: COLORS.tier_40 },
  // 槽位 3 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 4 - 中大奖（概率 0.46%）
  { type: 'tier_30', label: '30%', fullLabel: '🎊 中大奖 30%', poolPercent: 0.30, color: COLORS.tier_30 },
  // 槽位 5 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 6 - 中奖（概率 3.7%）
  { type: 'tier_20', label: '20%', fullLabel: '🎯 中奖 20%', poolPercent: 0.20, color: COLORS.tier_20 },
  // 槽位 7 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 8 - 小奖（概率 12%）
  { type: 'tier_10', label: '10%', fullLabel: '✨ 小奖 10%', poolPercent: 0.10, color: COLORS.tier_10 },
  // 槽位 9 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 10 - 中间安慰奖（概率 17.6%）
  { type: 'tier_3', label: '3%', fullLabel: '💫 安慰奖 3%', poolPercent: 0.03, color: COLORS.tier_3 },
  // 槽位 11 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 12 - 小奖（概率 12%）
  { type: 'tier_10', label: '10%', fullLabel: '✨ 小奖 10%', poolPercent: 0.10, color: COLORS.tier_10 },
  // 槽位 13 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 14 - 中奖（概率 3.7%）
  { type: 'tier_20', label: '20%', fullLabel: '🎯 中奖 20%', poolPercent: 0.20, color: COLORS.tier_20 },
  // 槽位 15 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 16 - 中大奖（概率 0.46%）
  { type: 'tier_30', label: '30%', fullLabel: '🎊 中大奖 30%', poolPercent: 0.30, color: COLORS.tier_30 },
  // 槽位 17 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 18 - 大奖（概率 0.018%）
  { type: 'tier_40', label: '40%', fullLabel: '🎉 大奖 40%', poolPercent: 0.40, color: COLORS.tier_40 },
  // 槽位 19 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 20 - 最右边缘（概率 0.0001%）
  { type: 'jackpot_50', label: '50%', fullLabel: '🏆 超级大奖 50%', poolPercent: 0.50, color: COLORS.jackpot_50 },
];

// Chainlink VRF 用的槽位索引映射（用于合约）
export const CHAINLINK_SLOT_MAPPING = SLOT_REWARDS.map((reward, index) => ({
  slotIndex: index,
  rewardType: reward.type,
  poolPercent: reward.poolPercent || 0,
  isWinning: reward.type !== 'no_win',
}));

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
  return type === 'jackpot_50';
}

export function isBigWin(type: RewardType): boolean {
  return type === 'jackpot_50' || type === 'tier_40' || type === 'tier_30';
}

export function isWin(type: RewardType): boolean {
  return type !== 'no_win';
}

// 获取奖励百分比
export function getRewardPercent(type: RewardType): number {
  switch (type) {
    case 'jackpot_50': return 50;
    case 'tier_40': return 40;
    case 'tier_30': return 30;
    case 'tier_20': return 20;
    case 'tier_10': return 10;
    case 'tier_3': return 3;
    default: return 0;
  }
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
// 经济模型详细说明（20行高难度版）
// ========================================
// 
// 【槽位物理概率】（20行二项分布 - 每边）
// 槽位0/20: C(20,0)/2^20 = 0.000095% 
// 槽位1/19: C(20,1)/2^20 = 0.0019%
// 槽位2/18: C(20,2)/2^20 = 0.018%
// 槽位3/17: C(20,3)/2^20 = 0.109%
// 槽位4/16: C(20,4)/2^20 = 0.46%
// 槽位5/15: C(20,5)/2^20 = 1.48%
// 槽位6/14: C(20,6)/2^20 = 3.70%
// 槽位7/13: C(20,7)/2^20 = 7.39%
// 槽位8/12: C(20,8)/2^20 = 12.01%
// 槽位9/11: C(20,9)/2^20 = 16.02%
// 槽位10:   C(20,10)/2^20 = 17.62%
//
// 【奖励分布】
// 50% BNB: 槽位0,20 → 总概率 0.00019% (约52万次中1次！)
// 40% BNB: 槽位2,18 → 总概率 0.036%
// 30% BNB: 槽位4,16 → 总概率 0.92%
// 20% BNB: 槽位6,14 → 总概率 7.4%
// 10% BNB: 槽位8,12 → 总概率 24%
// 3% BNB:  槽位10   → 总概率 17.6%
// 未中奖:  其他槽位  → 总概率 50%
//
// 【期望支出计算】
// E = 0.00019%×50% + 0.036%×40% + 0.92%×30% + 7.4%×20% + 24%×10% + 17.6%×3%
// E = 0.000095% + 0.014% + 0.276% + 1.48% + 2.4% + 0.528%
// E ≈ 4.7% 奖池/次
//
// 【可持续性分析】
// - 假设日均5000次游戏
// - 日均奖池消耗: 5000 × 4.7% = 235%
// - 但50%大奖几乎不可能中，实际消耗会更低
// - 主要支出来自10%小奖和3%安慰奖
//
// 【关键改进】
// - 20行 vs 16行：边缘概率从 0.003% 降到 0.0001%
// - 投球区域从25px缩小到15px，进一步限制横向扩散
// - 增加物理摩擦，球更难到达边缘
