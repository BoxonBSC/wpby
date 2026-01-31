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
// 超低中奖率可持续BNB奖励系统 - 造富效应模型
// ========================================
// 
// 设计目标：
// - 总中奖率：~10%（大部分人不中奖，保护奖池）
// - 期望消耗：~0.8%/次（奖池可持续运营）
// - 造富效应：边缘极低概率但超高回报
//
// 20行二项分布概率（每边）：
// 槽位0/20: 0.0001%  → 50% BNB 超级大奖
// 槽位1/19: 0.0019%  → 未中奖
// 槽位2/18: 0.018%   → 30% BNB 大奖
// 槽位3/17: 0.109%   → 未中奖
// 槽位4/16: 0.46%    → 15% BNB 中奖
// 槽位5/15: 1.48%    → 未中奖
// 槽位6/14: 3.70%    → 5% BNB 小奖
// 槽位7/13: 7.39%    → 未中奖
// 槽位8/12: 12.01%   → 未中奖
// 槽位9/11: 16.02%   → 未中奖
// 槽位10:   17.62%   → 未中奖
//
// 总中奖率计算：
// (0.0001% + 0.018% + 0.46% + 3.70%) × 2 = ~8.4%
//
// 期望消耗计算：
// 0.0002%×50% + 0.036%×30% + 0.92%×15% + 7.4%×5%
// = 0.0001% + 0.011% + 0.14% + 0.37% ≈ 0.52%/次

// 奖励类型
export type RewardType = 
  | 'jackpot_50'    // 50% BNB - 超级大奖（百万分之一）
  | 'tier_30'       // 30% BNB - 大奖（万分之一）
  | 'tier_15'       // 15% BNB - 中奖（千分之五）
  | 'tier_5'        // 5% BNB - 小奖（百分之七）
  | 'no_win';       // 未中奖（百分之九十）

// 槽位奖励配置
export interface SlotReward {
  type: RewardType;
  label: string;           // 画布显示标签
  fullLabel: string;       // 结果显示标签
  poolPercent?: number;    // BNB奖池百分比
  color: number;           // 显示颜色
}

// 颜色：红(高) → 橙 → 黄 → 灰(无)
const COLORS = {
  jackpot_50: 0xFF0000,  // 深红 - 超级大奖
  tier_30: 0xFF6600,     // 橙 - 大奖
  tier_15: 0xFFCC00,     // 黄 - 中奖
  tier_5: 0x00FF88,      // 绿 - 小奖
  no_win: 0x333333,      // 深灰 - 未中奖
};

// 21个槽位的奖励配置（超低中奖率版本）
// 只有最边缘的槽位有奖励，中间全部是未中奖
// [50%][×][30%][×][15%][×][5%][×][×][×][×][×][×][×][5%][×][15%][×][30%][×][50%]
export const SLOT_REWARDS: SlotReward[] = [
  // 槽位 0 - 最左边缘（概率 0.0001%）
  { type: 'jackpot_50', label: '50%', fullLabel: '🏆 超级大奖 50%', poolPercent: 0.50, color: COLORS.jackpot_50 },
  // 槽位 1 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 2 - 大奖（概率 0.018%）
  { type: 'tier_30', label: '30%', fullLabel: '🎉 大奖 30%', poolPercent: 0.30, color: COLORS.tier_30 },
  // 槽位 3 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 4 - 中奖（概率 0.46%）
  { type: 'tier_15', label: '15%', fullLabel: '🎊 中奖 15%', poolPercent: 0.15, color: COLORS.tier_15 },
  // 槽位 5 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 6 - 小奖（概率 3.7%）
  { type: 'tier_5', label: '5%', fullLabel: '✨ 小奖 5%', poolPercent: 0.05, color: COLORS.tier_5 },
  // 槽位 7 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 8 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 9 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 10 - 中间（概率最高17.6%，但未中奖）
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 11 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 12 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 13 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 14 - 小奖（概率 3.7%）
  { type: 'tier_5', label: '5%', fullLabel: '✨ 小奖 5%', poolPercent: 0.05, color: COLORS.tier_5 },
  // 槽位 15 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 16 - 中奖（概率 0.46%）
  { type: 'tier_15', label: '15%', fullLabel: '🎊 中奖 15%', poolPercent: 0.15, color: COLORS.tier_15 },
  // 槽位 17 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 18 - 大奖（概率 0.018%）
  { type: 'tier_30', label: '30%', fullLabel: '🎉 大奖 30%', poolPercent: 0.30, color: COLORS.tier_30 },
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
  return type === 'jackpot_50' || type === 'tier_30';
}

export function isWin(type: RewardType): boolean {
  return type !== 'no_win';
}

// 获取奖励百分比
export function getRewardPercent(type: RewardType): number {
  switch (type) {
    case 'jackpot_50': return 50;
    case 'tier_30': return 30;
    case 'tier_15': return 15;
    case 'tier_5': return 5;
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
// 超低中奖率经济模型（造富效应版）
// ========================================
// 
// 【设计理念】
// - 大部分人不中奖（保护奖池）
// - 少数人赢大奖（造富效应吸引玩家）
// - 奖池可持续运营（期望消耗低于补充速度）
//
// 【槽位物理概率】（20行二项分布）
// 槽位0/20: 0.0001%  → 50% 超级大奖
// 槽位2/18: 0.018%   → 30% 大奖
// 槽位4/16: 0.46%    → 15% 中奖
// 槽位6/14: 3.70%    → 5% 小奖
// 其他槽位: ~92%     → 未中奖
//
// 【关键指标】
// 总中奖率: ~8.4%（每12人约1人中奖）
// 期望消耗: ~0.52%/次
//
// 【可持续性分析】（假设日均5000次游戏）
// 日均奖池消耗: 5000 × 0.52% = 26% 奖池
// 奖池可支撑: 约4天（不含补充）
// 若交易税日均补充 10%+ 奖池，系统可持续运营
//
// 【造富效应】
// - 50% 大奖：约100万次中1次，但一旦中奖就是半个奖池
// - 30% 大奖：约5500次中1次
// - 15% 中奖：约220次中1次
// - 5% 小奖：约14次中1次
//
// 【与老方案对比】
// 老方案：50%中奖率，4.7%消耗/次，1天抽干奖池
// 新方案：8.4%中奖率，0.52%消耗/次，可持续运营
