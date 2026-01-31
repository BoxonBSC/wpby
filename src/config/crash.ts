// Crash 崩盘游戏配置
// 适配代币燃烧 + BNB奖池机制

// ========================================
// 核心机制说明
// ========================================
// 1. 玩家下注（消耗凭证）
// 2. 倍数从1.00x开始指数上涨
// 3. 玩家随时可"兑现"锁定当前倍数
// 4. 曲线随时可能"崩盘"
// 5. 崩盘前兑现 = 赢得 下注额 × 倍数 × 奖池比例
// 6. 崩盘时未兑现 = 全部输掉

// 崩盘点生成算法
// 使用指数分布，庄家优势约3-5%
export function generateCrashPoint(): number {
  // 模拟 - 实际应由合约VRF决定
  const houseEdge = 0.04; // 4%庄家优势
  const random = Math.random();
  
  // 指数分布：大部分在低倍数崩盘，偶尔高倍数
  if (random < houseEdge) {
    return 1.00; // 4%概率立即崩盘
  }
  
  // 指数分布公式
  const crashPoint = 0.99 / (1 - random);
  return Math.max(1.00, Math.floor(crashPoint * 100) / 100);
}

// 倍数对应的概率（到达该倍数不崩盘的概率）
export function survivalProbability(multiplier: number): number {
  if (multiplier <= 1) return 1;
  return 0.99 / multiplier;
}

// 游戏状态
export type GameState = 'waiting' | 'running' | 'crashed' | 'cashed_out';

// 游戏配置
export const CRASH_CONFIG = {
  // 时间参数（毫秒）
  timing: {
    waitingTime: 5000,      // 等待下注时间
    startDelay: 1000,       // 开始前倒计时
    tickInterval: 50,       // 刷新间隔
    multiplierSpeed: 0.00006, // 倍数增长速度
  },
  
  // 倍数参数
  multiplier: {
    min: 1.00,
    max: 1000,              // 最大倍数上限
    precision: 2,           // 小数位数
  },
  
  // 下注参数（凭证）
  bet: {
    min: 10000,
    max: 1000000,
    default: 20000,
    presets: [10000, 20000, 50000, 100000, 200000, 500000],
  },
  
  // 自动兑现
  autoCashout: {
    min: 1.01,
    max: 100,
    presets: [1.5, 2, 3, 5, 10, 20],
  },
  
  // 奖池参数
  pool: {
    maxPayout: 10,          // 单次最大派奖10 BNB
    basePayout: 0.001,      // 基础派奖比例（每1凭证 = 0.001 BNB基础）
  },
};

// 计算实际BNB奖励
export function calculatePayout(
  betAmount: number,
  multiplier: number,
  prizePoolBNB: number
): number {
  // 基础奖励 = 下注额 × 倍数 × 基础比例
  const baseReward = betAmount * multiplier * CRASH_CONFIG.pool.basePayout;
  
  // 限制最大派奖
  const maxFromPool = prizePoolBNB * 0.1; // 单次最多拿走10%奖池
  const maxPayout = Math.min(CRASH_CONFIG.pool.maxPayout, maxFromPool);
  
  return Math.min(baseReward, maxPayout);
}

// 获取倍数颜色
export function getMultiplierColor(multiplier: number): string {
  if (multiplier < 1.5) return '#888888';
  if (multiplier < 2) return '#00FF88';
  if (multiplier < 3) return '#00CCFF';
  if (multiplier < 5) return '#FFCC00';
  if (multiplier < 10) return '#FF8800';
  if (multiplier < 20) return '#FF4444';
  return '#FF00FF';
}

// 游戏历史记录
export interface CrashResult {
  id: string;
  crashPoint: number;
  betAmount: number;
  cashoutMultiplier: number | null; // null = 未兑现（崩盘）
  bnbWon: number;
  timestamp: number;
}

// 历史崩盘点记录
export interface CrashHistory {
  crashPoint: number;
  timestamp: number;
}
