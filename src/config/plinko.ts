// Plinko 游戏配置 - 造富效应经济模型（BNB奖励版）

export const PLINKO_CONFIG = {
  // 物理引擎参数
  physics: {
    gravity: { x: 0, y: 1.5 },
    restitution: 0.5,
    friction: 0.1,
    frictionAir: 0.02,
    density: 0.001,
  },
  
  // 游戏参数
  game: {
    rows: 12,
    pegRadius: 6,
    ballRadius: 10,
    pegSpacing: 40,
    dropZoneWidth: 30,
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
    trailLength: 15,
    trailOpacity: 0.3,
    collisionParticles: 8,
    winCelebrationDuration: 2000,
  },
};

// ========================================
// 造富效应奖励系统 - 分散式槽位设计
// ========================================
// 
// 设计原则：
// 1. 奖励槽位分散分布，提升游戏体验
// 2. 大奖在边缘（难命中），小奖分散在中间
// 3. 奖励基于合约BNB奖池比例
// 
// 13个槽位分布（对称，分散）：
// 0: 70%奖池 | 1: 未中奖 | 2: 35%奖池 | 3: 未中奖 | 4: 0.5x | 5: 未中奖
// 6: 50%奖池（中间大奖）
// 7: 未中奖 | 8: 0.5x | 9: 未中奖 | 10: 35%奖池 | 11: 未中奖 | 12: 70%奖池

// 奖励类型
export type RewardType = 
  | 'super_jackpot'  // 超级大奖 - 奖池70%
  | 'jackpot'        // 大奖 - 奖池50%
  | 'big_win'        // 中奖 - 奖池35%
  | 'small_win'      // 小奖 - 返还50%投注
  | 'no_win';        // 未中奖

// 槽位奖励配置
export interface SlotReward {
  type: RewardType;
  label: string;           // 简短标签（用于画布显示）
  fullLabel: string;       // 完整标签（用于结果显示）
  poolPercent?: number;    // 奖池百分比（大奖用）
  betReturn?: number;      // 投注返还比例（小奖用）
  color: number;           // 显示颜色
}

// 13个槽位的奖励配置（分散式分布）
export const SLOT_REWARDS: SlotReward[] = [
  // 槽位 0 - 最左边（超级大奖）
  { type: 'super_jackpot', label: '70%', fullLabel: '70% BNB', poolPercent: 0.70, color: 0xFF0000 },
  // 槽位 1 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: 0x333333 },
  // 槽位 2 - 中奖
  { type: 'big_win', label: '35%', fullLabel: '35% BNB', poolPercent: 0.35, color: 0xFF8800 },
  // 槽位 3 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: 0x333333 },
  // 槽位 4 - 小奖
  { type: 'small_win', label: '0.5x', fullLabel: '返还50%', betReturn: 0.50, color: 0xFFAA00 },
  // 槽位 5 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: 0x333333 },
  // 槽位 6 - 中间（大奖！增加刺激感）
  { type: 'jackpot', label: '50%', fullLabel: '50% BNB', poolPercent: 0.50, color: 0xFF4444 },
  // 槽位 7 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: 0x333333 },
  // 槽位 8 - 小奖
  { type: 'small_win', label: '0.5x', fullLabel: '返还50%', betReturn: 0.50, color: 0xFFAA00 },
  // 槽位 9 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: 0x333333 },
  // 槽位 10 - 中奖
  { type: 'big_win', label: '35%', fullLabel: '35% BNB', poolPercent: 0.35, color: 0xFF8800 },
  // 槽位 11 - 未中奖
  { type: 'no_win', label: '×', fullLabel: '未中奖', color: 0x333333 },
  // 槽位 12 - 最右边（超级大奖）
  { type: 'super_jackpot', label: '70%', fullLabel: '70% BNB', poolPercent: 0.70, color: 0xFF0000 },
];

// 旧版倍率表（保留兼容性）
export const MULTIPLIER_TABLE: number[] = SLOT_REWARDS.map(reward => {
  if (reward.poolPercent) return reward.poolPercent * 100;
  if (reward.betReturn) return reward.betReturn;
  return 0;
});

// 获取槽位颜色
export function getSlotColor(slotIndex: number): number {
  return SLOT_REWARDS[slotIndex]?.color || 0x333333;
}

// 计算实际奖励金额（BNB奖池）
export function calculateReward(
  slotIndex: number,
  betAmount: number,
  prizePoolBNB: number  // 合约中的BNB总额
): { amount: number; type: RewardType; label: string; bnbAmount: number } {
  const reward = SLOT_REWARDS[slotIndex];
  
  if (!reward) {
    return { amount: 0, type: 'no_win', label: '未中奖', bnbAmount: 0 };
  }
  
  let bnbAmount = 0;
  let creditsAmount = 0;
  
  if (reward.poolPercent) {
    // 大奖：基于BNB奖池比例
    bnbAmount = prizePoolBNB * reward.poolPercent;
  } else if (reward.betReturn) {
    // 小奖：返还部分投注凭证
    creditsAmount = Math.floor(betAmount * reward.betReturn);
  }
  
  return {
    amount: creditsAmount,
    type: reward.type,
    label: reward.fullLabel,
    bnbAmount,
  };
}

// 判断是否为大奖（用于音效和特效）
export function isJackpot(type: RewardType): boolean {
  return type === 'super_jackpot' || type === 'jackpot';
}

export function isBigWin(type: RewardType): boolean {
  return type === 'super_jackpot' || type === 'jackpot' || type === 'big_win';
}

export function isWin(type: RewardType): boolean {
  return type !== 'no_win';
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
  winAmount: number;      // 凭证奖励
  bnbWinAmount: number;   // BNB奖励
  rewardType: RewardType;
  rewardLabel: string;
  slotIndex: number;
  timestamp: number;
};

// ========================================
// 合约设计参考
// ========================================
// 
// 奖池来源：代币交易税收的BNB自动进入合约
// 
// 开奖逻辑：
// - super_jackpot (70%): 获得合约BNB余额的70%
// - jackpot (50%): 获得合约BNB余额的50%
// - big_win (35%): 获得合约BNB余额的35%
// - small_win (0.5x): 返还投注凭证的50%
// - no_win: 无奖励
// 
// 安全限制：
// - 每次只能获得当前奖池的最大70%
// - 奖池低于阈值时可暂停大奖
