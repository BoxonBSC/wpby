// Plinko 游戏配置 - 造富效应经济模型

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
// 造富效应奖励系统设计
// ========================================
// 
// 设计原则：
// 1. 低中奖率（约30%总中奖率）
// 2. 奖励基于奖池比例（30%-70%）
// 3. 大部分是"未中奖"，保持奖池增长
// 4. 少数大奖创造造富效应
//
// 槽位分布（13个槽位，对称）：
// - 边缘2个：超级大奖（奖池70%）- 极难命中
// - 次边缘2个：大奖（奖池50%）
// - 中外2个：中奖（奖池35%）
// - 中间区域7个：未中奖或小额返还
//
// 实际概率分布（基于物理模拟）：
// - 边缘槽位命中率约 0.1-0.5%
// - 次边缘约 2-3%
// - 中间区域约 60-70%

// 奖励类型
export type RewardType = 
  | 'super_jackpot'  // 超级大奖 - 奖池70%
  | 'jackpot'        // 大奖 - 奖池50%
  | 'big_win'        // 中奖 - 奖池35%
  | 'small_win'      // 小奖 - 返还50%投注
  | 'tiny_win'       // 微奖 - 返还20%投注
  | 'no_win';        // 未中奖

// 槽位奖励配置
export interface SlotReward {
  type: RewardType;
  label: string;           // 显示标签
  poolPercent?: number;    // 奖池百分比（大奖用）
  betReturn?: number;      // 投注返还比例（小奖用）
  color: number;           // 显示颜色
}

// 13个槽位的奖励配置（对称分布）
export const SLOT_REWARDS: SlotReward[] = [
  // 槽位 0 - 最左边（超级大奖）
  { type: 'super_jackpot', label: '70%奖池', poolPercent: 0.70, color: 0xFF0000 },
  // 槽位 1 - 大奖
  { type: 'jackpot', label: '50%奖池', poolPercent: 0.50, color: 0xFF4444 },
  // 槽位 2 - 中奖
  { type: 'big_win', label: '35%奖池', poolPercent: 0.35, color: 0xFF8800 },
  // 槽位 3 - 小奖
  { type: 'small_win', label: '0.5x', betReturn: 0.50, color: 0xFFAA00 },
  // 槽位 4 - 未中奖
  { type: 'no_win', label: '未中奖', color: 0x444444 },
  // 槽位 5 - 微奖
  { type: 'tiny_win', label: '0.2x', betReturn: 0.20, color: 0x666666 },
  // 槽位 6 - 中间（未中奖）
  { type: 'no_win', label: '未中奖', color: 0x333333 },
  // 槽位 7 - 微奖
  { type: 'tiny_win', label: '0.2x', betReturn: 0.20, color: 0x666666 },
  // 槽位 8 - 未中奖
  { type: 'no_win', label: '未中奖', color: 0x444444 },
  // 槽位 9 - 小奖
  { type: 'small_win', label: '0.5x', betReturn: 0.50, color: 0xFFAA00 },
  // 槽位 10 - 中奖
  { type: 'big_win', label: '35%奖池', poolPercent: 0.35, color: 0xFF8800 },
  // 槽位 11 - 大奖
  { type: 'jackpot', label: '50%奖池', poolPercent: 0.50, color: 0xFF4444 },
  // 槽位 12 - 最右边（超级大奖）
  { type: 'super_jackpot', label: '70%奖池', poolPercent: 0.70, color: 0xFF0000 },
];

// 旧版倍率表（保留兼容性，但不再使用）
export const MULTIPLIER_TABLE: number[] = SLOT_REWARDS.map(reward => {
  if (reward.poolPercent) return reward.poolPercent * 100; // 显示用
  if (reward.betReturn) return reward.betReturn;
  return 0;
});

// 获取槽位颜色
export function getSlotColor(slotIndex: number): number {
  return SLOT_REWARDS[slotIndex]?.color || 0x444444;
}

// 计算实际奖励金额
export function calculateReward(
  slotIndex: number,
  betAmount: number,
  prizePool: number
): { amount: number; type: RewardType; label: string } {
  const reward = SLOT_REWARDS[slotIndex];
  
  if (!reward) {
    return { amount: 0, type: 'no_win', label: '未中奖' };
  }
  
  let amount = 0;
  
  if (reward.poolPercent) {
    // 大奖：基于奖池比例
    // 在实际范围内随机（例如 70% ± 5%）
    const variance = 0.05;
    const actualPercent = reward.poolPercent + (Math.random() - 0.5) * variance * 2;
    amount = Math.floor(prizePool * Math.max(0.30, Math.min(0.70, actualPercent)));
  } else if (reward.betReturn) {
    // 小奖：返还部分投注
    amount = Math.floor(betAmount * reward.betReturn);
  }
  
  return {
    amount,
    type: reward.type,
    label: reward.label,
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
  winAmount: number;
  rewardType: RewardType;
  rewardLabel: string;
  slotIndex: number;
  timestamp: number;
};

// ========================================
// 合约设计参考（供后续开发使用）
// ========================================
// 
// 1. 奖池管理：
//    - prizePool: 当前奖池总额
//    - minPoolBalance: 最低保留额（例如奖池的10%）
//    - 每次投注的一定比例进入奖池（例如80%）
//
// 2. 开奖逻辑：
//    - 使用 Chainlink VRF 生成随机数
//    - 根据随机数确定落点槽位
//    - 根据槽位类型计算奖励
//
// 3. 奖励发放：
//    - super_jackpot: 奖池 * 0.70
//    - jackpot: 奖池 * 0.50
//    - big_win: 奖池 * 0.35
//    - small_win: 投注 * 0.50
//    - tiny_win: 投注 * 0.20
//    - no_win: 0
//
// 4. 安全限制：
//    - 单次最大奖励不超过奖池70%
//    - 奖池低于阈值时暂停大奖
//    - 每日/每周奖励上限
