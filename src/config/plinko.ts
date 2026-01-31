// Plinko 游戏配置 - 可持续造富效应模型
// 设计目标：日均2000-10000次游戏，奖池来源于代币交易税

export const PLINKO_CONFIG = {
  // 物理引擎参数
  physics: {
    gravity: { x: 0, y: 1.8 },
    restitution: 0.5,
    friction: 0.1,
    frictionAir: 0.02,
    density: 0.001,
  },
  
  // 游戏参数 - 16行 = 17个槽位
  game: {
    rows: 16,
    pegRadius: 5,
    ballRadius: 8,
    pegSpacing: 32,
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
// 可持续BNB奖励系统 - 造富效应模型
// ========================================
// 
// 设计原则：
// 1. 大奖稀有但存在 → 造富效应
// 2. 小奖相对容易 → 参与感
// 3. 期望支出 < 1.1%/次 → 奖池可持续
// 4. 交易税持续补充 → 长期运营
//
// 17槽位分布（对称）：
// [50%][×][40%][×][25%][×][10%][×][3%][×][10%][×][25%][×][40%][×][50%]
//
// 预估命中概率（基于16行二项分布）：
// - 边缘 50%: ~0.003% (极难)
// - 40%: ~0.05%
// - 25%: ~0.4%
// - 10%: ~2.2%
// - 3% (中间): ~12.5%
// - 未中奖: ~84.8%
//
// 期望支出计算：
// 0.003%*50%*2 + 0.05%*40%*2 + 0.4%*25%*2 + 2.2%*10%*2 + 12.5%*3%
// ≈ 0.003% + 0.04% + 0.2% + 0.44% + 0.375% ≈ 1.06%/次

// 奖励类型
export type RewardType = 
  | 'jackpot_50'    // 50% BNB - 超级大奖
  | 'tier_40'       // 40% BNB - 大奖
  | 'tier_25'       // 25% BNB - 中奖
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
  tier_40: 0xFF4400,     // 红橙 - 大奖
  tier_25: 0xFF8800,     // 橙黄 - 中奖
  tier_10: 0xFFCC00,     // 黄 - 小奖
  tier_3: 0xAADD00,      // 绿黄 - 安慰奖
  no_win: 0x333333,      // 深灰 - 未中奖
};

// 17个槽位的奖励配置（对称分布）
// [50%][×][40%][×][25%][×][10%][×][3%][×][10%][×][25%][×][40%][×][50%]
export const SLOT_REWARDS: SlotReward[] = [
  // 槽位 0 - 最左边缘（极难命中 ~0.003%）
  { type: 'jackpot_50', label: '50%', fullLabel: '🏆 超级大奖 50%', poolPercent: 0.50, color: COLORS.jackpot_50 },
  // 槽位 1 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 2 - 大奖 (~0.05%)
  { type: 'tier_40', label: '40%', fullLabel: '🎉 大奖 40%', poolPercent: 0.40, color: COLORS.tier_40 },
  // 槽位 3 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 4 - 中奖 (~0.4%)
  { type: 'tier_25', label: '25%', fullLabel: '🎊 中奖 25%', poolPercent: 0.25, color: COLORS.tier_25 },
  // 槽位 5 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 6 - 小奖 (~2.2%)
  { type: 'tier_10', label: '10%', fullLabel: '✨ 小奖 10%', poolPercent: 0.10, color: COLORS.tier_10 },
  // 槽位 7 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 8 - 中间安慰奖 (~12.5%)
  { type: 'tier_3', label: '3%', fullLabel: '💫 安慰奖 3%', poolPercent: 0.03, color: COLORS.tier_3 },
  // 槽位 9 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 10 - 小奖 (~2.2%)
  { type: 'tier_10', label: '10%', fullLabel: '✨ 小奖 10%', poolPercent: 0.10, color: COLORS.tier_10 },
  // 槽位 11 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 12 - 中奖 (~0.4%)
  { type: 'tier_25', label: '25%', fullLabel: '🎊 中奖 25%', poolPercent: 0.25, color: COLORS.tier_25 },
  // 槽位 13 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 14 - 大奖 (~0.05%)
  { type: 'tier_40', label: '40%', fullLabel: '🎉 大奖 40%', poolPercent: 0.40, color: COLORS.tier_40 },
  // 槽位 15 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 16 - 最右边缘（极难命中 ~0.003%）
  { type: 'jackpot_50', label: '50%', fullLabel: '🏆 超级大奖 50%', poolPercent: 0.50, color: COLORS.jackpot_50 },
];

// Chainlink VRF 用的槽位索引映射（用于合约）
// 合约返回 0-16 的随机数，直接对应槽位
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
  return type === 'jackpot_50' || type === 'tier_40' || type === 'tier_25';
}

export function isWin(type: RewardType): boolean {
  return type !== 'no_win';
}

// 获取奖励百分比
export function getRewardPercent(type: RewardType): number {
  switch (type) {
    case 'jackpot_50': return 50;
    case 'tier_40': return 40;
    case 'tier_25': return 25;
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
// 经济模型详细说明（供合约开发参考）
// ========================================
// 
// 【槽位物理概率】（16行二项分布）
// 槽位0/16: C(16,0)/2^16 = 0.00153% (每边)
// 槽位1/15: C(16,1)/2^16 = 0.0244%
// 槽位2/14: C(16,2)/2^16 = 0.183%
// 槽位3/13: C(16,3)/2^16 = 0.854%
// 槽位4/12: C(16,4)/2^16 = 2.78%
// 槽位5/11: C(16,5)/2^16 = 6.67%
// 槽位6/10: C(16,6)/2^16 = 12.22%
// 槽位7/9:  C(16,7)/2^16 = 17.46%
// 槽位8:    C(16,8)/2^16 = 19.64%
//
// 【奖励分布】
// 50% BNB: 槽位0,16 → 总概率 0.003%
// 40% BNB: 槽位2,14 → 总概率 0.37%
// 25% BNB: 槽位4,12 → 总概率 5.56%
// 10% BNB: 槽位6,10 → 总概率 24.44%
// 3% BNB:  槽位8    → 总概率 19.64%
// 未中奖:  其他槽位  → 总概率 50.0%
//
// 【期望支出计算】
// E = 0.003%×50% + 0.37%×40% + 5.56%×25% + 24.44%×10% + 19.64%×3%
// E = 0.0015% + 0.148% + 1.39% + 2.444% + 0.589%
// E ≈ 4.57% 奖池/次
//
// 【可持续性分析】
// - 假设日均5000次游戏
// - 日均奖池消耗: 5000 × 4.57% = 228.5%
// - 需要交易税补充 > 228.5% 奖池/天 才能维持
//
// 【Chainlink VRF 集成】
// - VRF返回随机数 → 模拟物理落球 → 确定槽位
// - 合约存储: slotIndex => poolPercent 映射
// - 前端展示: 使用 SLOT_REWARDS 配置渲染
//
// 【调优建议】
// 如果奖池消耗过快：
// 1. 降低高等级奖励比例 (50%→30%)
// 2. 增加未中奖槽位数量
// 3. 降低3%安慰奖比例
