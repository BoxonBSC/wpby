// 幸运转盘配置 - 9.375% 总中奖率，超低消耗方案

export type WheelPrizeType = 
  | 'super_jackpot'  // 超级大奖
  | 'jackpot'        // 头奖
  | 'first'          // 一等奖
  | 'second'         // 二等奖
  | 'third'          // 三等奖
  | 'small'          // 小奖
  | 'consolation'    // 安慰奖
  | 'none';          // 未中奖

export interface WheelSector {
  type: WheelPrizeType;
  name: string;
  nameEn: string;
  emoji: string;
  poolPercent: number;    // 奖池百分比
  probability: number;    // 中奖概率 (0-1)
  color: string;          // 扇区颜色
  glowColor: string;      // 发光颜色
}

// 转盘扇区配置 - 基于科学计算的低消耗方案
export const WHEEL_SECTORS: WheelSector[] = [
  {
    type: 'super_jackpot',
    name: '超级大奖',
    nameEn: 'SUPER JACKPOT',
    emoji: '🎰',
    poolPercent: 0.30,      // 30% 奖池
    probability: 0.00005,   // 0.005%
    color: 'hsl(50, 100%, 50%)',
    glowColor: 'hsl(50, 100%, 70%)',
  },
  {
    type: 'jackpot',
    name: '头奖',
    nameEn: 'JACKPOT',
    emoji: '💎',
    poolPercent: 0.15,      // 15% 奖池
    probability: 0.0002,    // 0.02%
    color: 'hsl(280, 100%, 60%)',
    glowColor: 'hsl(280, 100%, 80%)',
  },
  {
    type: 'first',
    name: '一等奖',
    nameEn: '1ST PRIZE',
    emoji: '👑',
    poolPercent: 0.08,      // 8% 奖池
    probability: 0.0005,    // 0.05%
    color: 'hsl(30, 100%, 50%)',
    glowColor: 'hsl(30, 100%, 70%)',
  },
  {
    type: 'second',
    name: '二等奖',
    nameEn: '2ND PRIZE',
    emoji: '🔔',
    poolPercent: 0.03,      // 3% 奖池
    probability: 0.003,     // 0.3%
    color: 'hsl(330, 100%, 60%)',
    glowColor: 'hsl(330, 100%, 80%)',
  },
  {
    type: 'third',
    name: '三等奖',
    nameEn: '3RD PRIZE',
    emoji: '⭐',
    poolPercent: 0.01,      // 1% 奖池
    probability: 0.01,      // 1%
    color: 'hsl(195, 100%, 50%)',
    glowColor: 'hsl(195, 100%, 70%)',
  },
  {
    type: 'small',
    name: '小奖',
    nameEn: 'SMALL WIN',
    emoji: '🍀',
    poolPercent: 0.003,     // 0.3% 奖池
    probability: 0.03,      // 3%
    color: 'hsl(150, 100%, 40%)',
    glowColor: 'hsl(150, 100%, 60%)',
  },
  {
    type: 'consolation',
    name: '安慰奖',
    nameEn: 'CONSOLATION',
    emoji: '🎁',
    poolPercent: 0.0005,    // 0.05% 奖池
    probability: 0.05,      // 5%
    color: 'hsl(200, 50%, 50%)',
    glowColor: 'hsl(200, 50%, 70%)',
  },
  {
    type: 'none',
    name: '再来一次',
    nameEn: 'TRY AGAIN',
    emoji: '🔄',
    poolPercent: 0,
    probability: 0.90625,   // 90.625%
    color: 'hsl(220, 30%, 25%)',
    glowColor: 'hsl(220, 30%, 40%)',
  },
];

// 计算扇区角度（基于概率）
export const calculateSectorAngles = (): { start: number; end: number; sector: WheelSector }[] => {
  const result: { start: number; end: number; sector: WheelSector }[] = [];
  let currentAngle = 0;
  
  // 为了视觉效果，我们把扇区分布得更均匀一些，而不是完全按概率
  // 但保持概率计算准确
  const visualAngles: Record<WheelPrizeType, number> = {
    super_jackpot: 8,    // 小扇区，稀有感
    jackpot: 12,
    first: 18,
    second: 28,
    third: 40,
    small: 55,
    consolation: 65,
    none: 134,           // 剩余角度
  };
  
  WHEEL_SECTORS.forEach(sector => {
    const angle = visualAngles[sector.type];
    result.push({
      start: currentAngle,
      end: currentAngle + angle,
      sector,
    });
    currentAngle += angle;
  });
  
  return result;
};

// 根据随机数确定中奖结果（使用真实概率）
export const determineWheelResult = (randomValue: number): WheelSector => {
  let cumulative = 0;
  
  for (const sector of WHEEL_SECTORS) {
    cumulative += sector.probability;
    if (randomValue < cumulative) {
      return sector;
    }
  }
  
  return WHEEL_SECTORS[WHEEL_SECTORS.length - 1]; // 默认未中奖
};

// 计算派奖金额
export const calculateWheelPayout = (
  sector: WheelSector,
  prizePool: number
): number => {
  if (sector.type === 'none') return 0;
  return prizePool * sector.poolPercent;
};

// 获取结果对应的旋转角度
export const getResultRotation = (result: WheelSector): number => {
  const angles = calculateSectorAngles();
  const sectorData = angles.find(a => a.sector.type === result.type);
  
  if (!sectorData) return 0;
  
  // 指向扇区中心
  const centerAngle = (sectorData.start + sectorData.end) / 2;
  
  // 转盘顺时针旋转，指针在顶部（0度）
  // 需要旋转 (360 - centerAngle) 度让该扇区对准指针
  // 再加上多圈旋转增加观赏性
  const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7圈
  return extraSpins * 360 + (360 - centerAngle);
};

// 统计信息
export const WHEEL_STATS = {
  totalWinRate: 0.09375,           // 9.375%
  expectedConsumption: 0.00039,    // 每次期望消耗奖池 0.039%
  sectors: WHEEL_SECTORS.length,
};
