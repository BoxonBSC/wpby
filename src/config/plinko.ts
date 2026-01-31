// Plinko 游戏配置 - 低中奖率可持续版本
// 设计目标：19个槽位，~3%中奖率
// 18行钉子 = 19个槽位（边缘概率极低）

export const PLINKO_CONFIG = {
  // 物理引擎参数
  physics: {
    gravity: { x: 0, y: 1.6 },
    restitution: 0.45,
    friction: 0.15,
    frictionAir: 0.025,
    density: 0.001,
  },
  
  // 游戏参数 - 18行 = 19个槽位
  game: {
    rows: 18,                       // 18行钉子（增加难度）
    pegRadius: 4,                   // 钉子稍小
    ballRadius: 6,                  // 球稍小
    pegSpacing: 26,                 // 间距紧凑
    dropZoneWidth: 15,              // 投球区域缩小
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
// 混合模式奖励系统 - 3%中奖率可持续版
// ========================================
// 
// 【核心设计】
// - 18行钉子 = 19个槽位，边缘概率极低
// - 小奖：固定BNB金额（不按比例）
// - 大奖：按奖池比例，设置BNB上限
// - 总中奖率：~3%（高度可持续）
//
// 【18行二项分布概率】
// 槽位0/18: 0.0004%  → 超级大奖
// 槽位2/16: 0.006%   → 大奖
// 槽位4/14: 0.05%    → 中奖
// 槽位6/12: 0.3%     → 小奖
// 槽位8/10: 1.2%     → 小奖
// 中间槽位: ~97%     → 未中奖
//
// 【经济模型】
// 总中奖率: ~3%
// 每1000次消耗: ~5%奖池
// 日均1000次可撑: ~20天

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
  label: string;
  fullLabel: string;
  poolPercent?: number;
  fixedBNB?: number;
  maxBNB?: number;
  color: number;
}

// 颜色配置
const COLORS = {
  super_jackpot: 0xFF0000,
  jackpot: 0xFF6600,
  medium: 0xFFCC00,
  small: 0x00FF88,
  no_win: 0x333333,
};

// 19个槽位的奖励配置（18行钉子）- 无小奖版
// [超级][  ][大奖][  ][中奖][  ][  ][  ][  ][  ][  ][  ][  ][  ][中奖][  ][大奖][  ][超级]
// 总中奖率：~2.5%（超级0.0008% + 大奖0.12% + 中奖2.34%）
export const SLOT_REWARDS: SlotReward[] = [
  // 槽位 0 - 最左边缘：超级大奖 (概率 0.0004%)
  { type: 'super_jackpot', label: '30%', fullLabel: '🏆 超级大奖 30%', poolPercent: 0.30, maxBNB: 5, color: COLORS.super_jackpot },
  // 槽位 1
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 2 - 大奖 (概率 0.06%)
  { type: 'jackpot', label: '15%', fullLabel: '🎉 大奖 15%', poolPercent: 0.15, maxBNB: 2, color: COLORS.jackpot },
  // 槽位 3
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 4 - 中奖 (概率 1.17%)
  { type: 'medium', label: '5%', fullLabel: '🎊 中奖 5%', poolPercent: 0.05, maxBNB: 0.5, color: COLORS.medium },
  // 槽位 5
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 6 - 未中奖
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 7
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 8 - 未中奖 (原小奖，已移除)
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 9 - 中间
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 10 - 未中奖 (原小奖，已移除)
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 11
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 12 - 未中奖
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 13
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 14 - 中奖 (概率 1.17%)
  { type: 'medium', label: '5%', fullLabel: '🎊 中奖 5%', poolPercent: 0.05, maxBNB: 0.5, color: COLORS.medium },
  // 槽位 15
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 16 - 大奖 (概率 0.06%)
  { type: 'jackpot', label: '15%', fullLabel: '🎉 大奖 15%', poolPercent: 0.15, maxBNB: 2, color: COLORS.jackpot },
  // 槽位 17
  { type: 'no_win', label: '', fullLabel: '未中奖', color: COLORS.no_win },
  // 槽位 18 - 最右边缘：超级大奖 (概率 0.0004%)
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
    case 'small': return { fixed: 0.002 };
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
// 无小奖经济模型分析（18行）
// ========================================
// 
// 【核心设计】
// - 18行钉子 = 19槽位，边缘概率极低
// - 无小奖，只有中奖/大奖/超级大奖
// - 总中奖率 ~2.5%，极高可持续性
//
// 【18行Plinko槽位概率】（二项分布 C(18,k)/2^18）
// 槽位0/18: 0.0004% → 超级大奖（30%上限5BNB）
// 槽位2/16: 0.06%  → 大奖（15%上限2BNB）
// 槽位4/14: 1.17%  → 中奖（5%上限0.5BNB）
// 其他槽位: ~97.5% → 未中奖
//
// 【关键指标】
// 总中奖率: ~2.5%（每40人约1人中奖）
// 
// 【每1000次游戏的奖池消耗】（假设奖池10 BNB）
// - 中奖: 1000×2.34%×0.5 = 1.17 BNB（上限）
// - 大奖: 1000×0.12%×1.5 = 0.18 BNB
// - 超级大奖: 1000×0.0008%×3 = 0.0024 BNB
// 总计: ~1.35 BNB/1000次 = 13.5%奖池/1000次
//
// 【返点率分析】（假设20K代币 ≈ 0.02 BNB）
// 每次期望奖励: 0.00135 BNB
// 每次下注价值: 0.02 BNB
// RTP = 0.00135 / 0.02 = 6.75% → 项目利润率 93.25%
//
// 【可持续性分析】
// 日均1000次：消耗13.5%奖池 → 可撑 ~7.4天
// 日均500次：消耗6.75%奖池 → 可撑 ~15天
// 日均2000次：消耗27%奖池 → 可撑 ~3.7天
// 
// 【特点】
// ✅ 极低中奖率 = 高度可持续
// ✅ 中大奖有造富效应
// ✅ 简单明了的奖励结构
