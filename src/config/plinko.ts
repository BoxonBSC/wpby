// Plinko 游戏配置 - 交替布局版本
// 设计目标：15个槽位，中奖/不中奖交替分布
// 14行钉子 = 15个槽位

export const PLINKO_CONFIG = {
  // 物理引擎参数
  physics: {
    gravity: { x: 0, y: 1.6 },
    restitution: 0.45,
    friction: 0.15,
    frictionAir: 0.025,
    density: 0.001,
  },
  
  // 游戏参数 - 14行 = 15个槽位
  game: {
    rows: 14,                       // 14行钉子
    pegRadius: 5,                   // 钉子大小
    ballRadius: 7,                  // 球大小
    pegSpacing: 32,                 // 间距
    dropZoneWidth: 20,              // 投球区域
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
// 混合模式奖励系统 - 奖池保护版
// ========================================
// 
// 【核心设计】
// - 小奖：固定BNB金额（不按比例，保护奖池）
// - 大奖：按奖池比例，但设置BNB上限
// - 总中奖率：~3.5%（低频高价值）
//
// 【奖励结构】
// 超级大奖(0.01%): 奖池30%，上限5 BNB
// 大奖(0.05%): 奖池15%，上限2 BNB
// 中奖(0.5%): 奖池5%，上限0.5 BNB
// 小奖(3%): 固定0.01 BNB（不消耗比例）
//
// 【经济模型分析】
// 假设奖池 10 BNB，每天1000次游戏：
// - 小奖: 1000 × 3% × 0.01 = 0.3 BNB/天
// - 中奖: 1000 × 0.5% × min(0.5, 0.5) = 2.5 BNB/天  
// - 大奖: 1000 × 0.05% × min(1.5, 2) = 0.75 BNB/天
// - 超级大奖: 1000 × 0.01% × min(3, 5) = 0.3 BNB/天
// 总计: ~3.85 BNB/天 = 38.5%奖池/天
//
// 【防大户机制】
// - 小奖固定金额：玩1000次只赢0.3 BNB（不划算）
// - 大奖有上限：即使中了也不会掏空奖池
// - 低中奖率：需要大量游戏才能触发大奖

// 奖励类型
export type RewardType = 
  | 'super_jackpot' // 超级大奖：奖池30%，上限5 BNB
  | 'jackpot'       // 大奖：奖池15%，上限2 BNB
  | 'medium'        // 中奖：奖池5%，上限0.5 BNB
  | 'small'         // 小奖：固定0.01 BNB
  | 'no_win';       // 未中奖

// 槽位奖励配置
export interface SlotReward {
  type: RewardType;
  label: string;           // 画布显示标签
  fullLabel: string;       // 结果显示标签
  poolPercent?: number;    // BNB奖池百分比（仅大奖使用）
  fixedBNB?: number;       // 固定BNB金额（仅小奖使用）
  maxBNB?: number;         // BNB上限
  color: number;           // 显示颜色
}

// 颜色配置
const COLORS = {
  super_jackpot: 0xFF0000, // 红色 - 超级大奖
  jackpot: 0xFF6600,       // 橙色 - 大奖
  medium: 0xFFCC00,        // 黄色 - 中奖
  small: 0x00FF88,         // 绿色 - 小奖
  no_win: 0x333333,        // 深灰 - 未中奖
};

// 15个槽位的奖励配置（混合模式）
// [超级大奖][  ][大奖][  ][中奖][  ][小奖][  ][小奖][  ][中奖][  ][大奖][  ][超级大奖]
export const SLOT_REWARDS: SlotReward[] = [
  // 槽位 0 - 最左边缘：超级大奖 30%，上限5 BNB
  { type: 'super_jackpot', label: '30%', fullLabel: '🏆 超级大奖 30%', poolPercent: 0.30, maxBNB: 5, color: COLORS.super_jackpot },
  // 槽位 1 - 不中奖
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 2 - 大奖 15%，上限2 BNB
  { type: 'jackpot', label: '15%', fullLabel: '🎉 大奖 15%', poolPercent: 0.15, maxBNB: 2, color: COLORS.jackpot },
  // 槽位 3 - 不中奖
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 4 - 中奖 5%，上限0.5 BNB
  { type: 'medium', label: '5%', fullLabel: '🎊 中奖 5%', poolPercent: 0.05, maxBNB: 0.5, color: COLORS.medium },
  // 槽位 5 - 不中奖
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 6 - 小奖：固定0.01 BNB
  { type: 'small', label: '小奖', fullLabel: '✨ 小奖 0.01 BNB', fixedBNB: 0.01, color: COLORS.small },
  // 槽位 7 - 中间不中奖
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 8 - 小奖：固定0.01 BNB
  { type: 'small', label: '小奖', fullLabel: '✨ 小奖 0.01 BNB', fixedBNB: 0.01, color: COLORS.small },
  // 槽位 9 - 不中奖
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 10 - 中奖 5%，上限0.5 BNB
  { type: 'medium', label: '5%', fullLabel: '🎊 中奖 5%', poolPercent: 0.05, maxBNB: 0.5, color: COLORS.medium },
  // 槽位 11 - 不中奖
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 12 - 大奖 15%，上限2 BNB
  { type: 'jackpot', label: '15%', fullLabel: '🎉 大奖 15%', poolPercent: 0.15, maxBNB: 2, color: COLORS.jackpot },
  // 槽位 13 - 不中奖
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 14 - 最右边缘：超级大奖 30%，上限5 BNB
  { type: 'super_jackpot', label: '30%', fullLabel: '🏆 超级大奖 30%', poolPercent: 0.30, maxBNB: 5, color: COLORS.super_jackpot },
];

// Chainlink VRF 用的槽位索引映射（用于合约）
export const CHAINLINK_SLOT_MAPPING = SLOT_REWARDS.map((reward, index) => ({
  slotIndex: index,
  rewardType: reward.type,
  poolPercent: reward.poolPercent || 0,
  fixedBNB: reward.fixedBNB || 0,
  maxBNB: reward.maxBNB || 0,
  isWinning: reward.type !== 'no_win',
}));

// 获取槽位颜色
export function getSlotColor(slotIndex: number): number {
  return SLOT_REWARDS[slotIndex]?.color || COLORS.no_win;
}

// 计算实际奖励金额（混合模式：小奖固定，大奖按比例有上限）
export function calculateReward(
  slotIndex: number,
  betAmount: number,
  prizePoolBNB: number
): { amount: number; type: RewardType; label: string; bnbAmount: number } {
  const reward = SLOT_REWARDS[slotIndex];
  
  if (!reward || reward.type === 'no_win') {
    return { amount: 0, type: 'no_win', label: '未中奖', bnbAmount: 0 };
  }
  
  let bnbAmount = 0;
  
  // 小奖：固定金额
  if (reward.fixedBNB) {
    bnbAmount = reward.fixedBNB;
  }
  // 大奖：按比例计算，但有上限
  else if (reward.poolPercent) {
    bnbAmount = prizePoolBNB * reward.poolPercent;
    // 应用上限
    if (reward.maxBNB && bnbAmount > reward.maxBNB) {
      bnbAmount = reward.maxBNB;
    }
  }
  
  return {
    amount: 0,
    type: reward.type,
    label: reward.fullLabel,
    bnbAmount,
  };
}

// 判断奖励等级
export function isJackpot(type: RewardType): boolean {
  return type === 'super_jackpot';
}

export function isBigWin(type: RewardType): boolean {
  return type === 'super_jackpot' || type === 'jackpot';
}

export function isWin(type: RewardType): boolean {
  return type !== 'no_win';
}

// 获取奖励信息
export function getRewardInfo(type: RewardType): { percent?: number; fixed?: number; max?: number } {
  switch (type) {
    case 'super_jackpot': return { percent: 30, max: 5 };
    case 'jackpot': return { percent: 15, max: 2 };
    case 'medium': return { percent: 5, max: 0.5 };
    case 'small': return { fixed: 0.01 };
    default: return {};
  }
}

// 下注等级（用游戏凭证）- 基础2万代币起
export const PLINKO_BET_LEVELS = [
  { value: 20000, label: '20K', display: '20,000' },
  { value: 50000, label: '50K', display: '50,000' },
  { value: 100000, label: '100K', display: '100,000' },
  { value: 200000, label: '200K', display: '200,000' },
  { value: 500000, label: '500K', display: '500,000' },
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
// 混合模式经济模型分析
// ========================================
// 
// 【核心设计】
// - 小奖固定金额：防止大户通过概率刷奖池
// - 大奖按比例但有上限：保留造富效应同时保护奖池
// - 低中奖率：大部分人不中奖
//
// 【14行Plinko槽位概率】（二项分布）
// 槽位0/14: 0.006%  → 超级大奖（30%上限5BNB）
// 槽位2/12: 0.09%   → 大奖（15%上限2BNB）
// 槽位4/10: 0.55%   → 中奖（5%上限0.5BNB）
// 槽位6/8:  3.1%    → 小奖（固定0.01BNB）
// 其他槽位: ~93%    → 未中奖
//
// 【关键指标】
// 总中奖率: ~7.5%（每13人约1人中奖）
// 
// 【每1000次游戏的奖池消耗】（假设奖池10 BNB）
// - 小奖: 1000×6.2%×0.01 = 0.62 BNB（固定，不随奖池变化）
// - 中奖: 1000×1.1%×min(0.5,0.5) = 0.55 BNB
// - 大奖: 1000×0.18%×min(1.5,2) = 0.27 BNB
// - 超级大奖: 1000×0.012%×min(3,5) = 0.04 BNB
// 总计: ~1.48 BNB/1000次 = 14.8%奖池/1000次
//
// 【可持续性】
// 日均1000次游戏：消耗14.8%奖池
// 日均5000次游戏：消耗74%奖池
// 需要交易税每日补充15-75%奖池才能持续
//
// 【防大户机制】
// 1. 小奖固定：玩1000次只赢0.62 BNB（成本20M代币）
// 2. 大奖有上限：即使中超级大奖也最多5 BNB
// 3. 低概率：需要大量游戏才能触发大奖
