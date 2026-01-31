// Plinko 游戏配置

export const PLINKO_CONFIG = {
  // 物理引擎参数
  physics: {
    gravity: { x: 0, y: 1.5 },
    restitution: 0.5,           // 弹性系数
    friction: 0.1,
    frictionAir: 0.02,
    density: 0.001,
  },
  
  // 游戏参数
  game: {
    rows: 12,                    // 钉子行数
    pegRadius: 6,                // 钉子半径
    ballRadius: 10,              // 球半径
    pegSpacing: 40,              // 钉子间距
    dropZoneWidth: 30,           // 投放区域宽度
  },
  
  // 视觉参数
  visuals: {
    backgroundColor: 0x0a0908,
    pegColor: 0xC9A347,          // 金色钉子
    pegGlowColor: 0xFFD700,
    ballColor: 0xE0E0E0,         // 银色球
    ballGlowColor: 0xFFFFFF,
    slotColors: {
      high: 0xFF4444,            // 高赔率红色
      medium: 0xFFAA00,          // 中等橙色
      low: 0x44FF44,             // 低赔率绿色
    },
  },
  
  // 动画参数
  animation: {
    trailLength: 15,             // 拖尾长度
    trailOpacity: 0.3,
    collisionParticles: 8,       // 碰撞粒子数
    winCelebrationDuration: 2000,
  },
};

// 赔率表 (12行，13个槽位，对称分布)
export const MULTIPLIER_TABLE: number[] = [
  110,    // 槽位 0 (最左)
  41,     // 槽位 1
  10,     // 槽位 2
  5,      // 槽位 3
  3,      // 槽位 4
  1.5,    // 槽位 5
  1,      // 槽位 6 (中间)
  1.5,    // 槽位 7
  3,      // 槽位 8
  5,      // 槽位 9
  10,     // 槽位 10
  41,     // 槽位 11
  110,    // 槽位 12 (最右)
];

// 槽位颜色映射
export function getSlotColor(multiplier: number): number {
  if (multiplier >= 41) return 0xFF4444;      // 红色 - 超高倍
  if (multiplier >= 10) return 0xFF6B00;      // 橙色 - 高倍
  if (multiplier >= 5) return 0xFFAA00;       // 金色 - 中高倍
  if (multiplier >= 3) return 0xFFDD00;       // 黄色 - 中倍
  if (multiplier >= 1.5) return 0xAAFF00;     // 黄绿 - 低倍
  return 0x44FF44;                             // 绿色 - 最低倍
}

// 下注等级
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
  multiplier: number;
  winAmount: number;
  slotIndex: number;
  timestamp: number;
};
