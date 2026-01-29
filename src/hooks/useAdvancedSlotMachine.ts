import { useState, useCallback, useRef } from 'react';

// 更多符号种类
export type SlotSymbol = 
  | 'seven' | 'diamond' | 'crown' | 'bell' | 'cherry' 
  | 'lemon' | 'grape' | 'watermelon' | 'star' | 'clover';

export interface SymbolInfo {
  id: SlotSymbol;
  emoji: string;
  name: string;
  multiplier: number;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
}

export const SYMBOLS: SymbolInfo[] = [
  { id: 'seven', emoji: '7️⃣', name: 'Lucky Seven', multiplier: 100, rarity: 'legendary' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', multiplier: 50, rarity: 'legendary' },
  { id: 'crown', emoji: '👑', name: 'Crown', multiplier: 30, rarity: 'epic' },
  { id: 'bell', emoji: '🔔', name: 'Bell', multiplier: 20, rarity: 'epic' },
  { id: 'star', emoji: '⭐', name: 'Star', multiplier: 15, rarity: 'epic' },
  { id: 'cherry', emoji: '🍒', name: 'Cherry', multiplier: 10, rarity: 'rare' },
  { id: 'grape', emoji: '🍇', name: 'Grape', multiplier: 8, rarity: 'rare' },
  { id: 'watermelon', emoji: '🍉', name: 'Watermelon', multiplier: 6, rarity: 'rare' },
  { id: 'lemon', emoji: '🍋', name: 'Lemon', multiplier: 4, rarity: 'common' },
  { id: 'clover', emoji: '🍀', name: 'Clover', multiplier: 2, rarity: 'common' },
];

// 5轮，每轮3行
export const REELS = 5;
export const ROWS = 3;

// 赔付线定义 (15条线)
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // 中间横线
  [0, 0, 0, 0, 0], // 顶部横线
  [2, 2, 2, 2, 2], // 底部横线
  [0, 1, 2, 1, 0], // V形
  [2, 1, 0, 1, 2], // 倒V形
  [0, 0, 1, 2, 2], // 下斜
  [2, 2, 1, 0, 0], // 上斜
  [1, 0, 0, 0, 1], // 顶部凹
  [1, 2, 2, 2, 1], // 底部凸
  [0, 1, 1, 1, 0], // 轻微V
  [2, 1, 1, 1, 2], // 轻微倒V
  [1, 0, 1, 2, 1], // 锯齿1
  [1, 2, 1, 0, 1], // 锯齿2
  [0, 1, 0, 1, 0], // 波浪顶
  [2, 1, 2, 1, 2], // 波浪底
];

export interface WinLine {
  lineIndex: number;
  symbol: SymbolInfo;
  count: number;
  positions: [number, number][]; // [reel, row]
  payout: number; // 基础分数
}

// 6级奖励系统
export type PrizeType = 
  | 'mega_jackpot'  // 超级头奖: 5个7
  | 'jackpot'       // 头奖: 5个钻石 或 4个7
  | 'first'         // 一等奖: 5个相同 (其他符号)
  | 'second'        // 二等奖: 4个相同 (高级符号)
  | 'third'         // 三等奖: 4个相同 (普通符号) 或 3+条中奖线
  | 'small'         // 小奖: 3个相同
  | 'none';

// 奖励配置 - 与智能合约保持一致
export interface PrizeConfig {
  type: PrizeType;
  name: string;
  emoji: string;
  poolRate: number;      // 奖池比例
  estimatedOdds: string; // 估计中奖概率 (用于显示)
}

export const PRIZE_TIERS: PrizeConfig[] = [
  { type: 'mega_jackpot', name: '超级头奖', emoji: '🎰', poolRate: 0.30, estimatedOdds: '1/500,000' },
  { type: 'jackpot', name: '头奖', emoji: '💎', poolRate: 0.15, estimatedOdds: '1/50,000' },
  { type: 'first', name: '一等奖', emoji: '👑', poolRate: 0.08, estimatedOdds: '1/10,000' },
  { type: 'second', name: '二等奖', emoji: '🔔', poolRate: 0.04, estimatedOdds: '1/2,000' },
  { type: 'third', name: '三等奖', emoji: '⭐', poolRate: 0.02, estimatedOdds: '1/500' },
  { type: 'small', name: '小奖', emoji: '🍀', poolRate: 0.005, estimatedOdds: '1/50' },
];

export interface SpinResult {
  grid: SlotSymbol[][];
  winLines: WinLine[];
  totalWin: number;        // 总分数
  bnbWin: number;          // 实际 BNB 奖励
  prizeType: PrizeType;    // 奖励类型
  prizeConfig: PrizeConfig | null; // 奖励配置
  isJackpot: boolean;
  newProbability: number;
  multiplier: number;
  prizePoolAfter: number;  // 派奖后奖池
}

export interface GameState {
  isSpinning: boolean;
  grid: SlotSymbol[][];
  winProbability: number;
  totalSpins: number;
  totalWins: number;
  lastResult: SpinResult | null;
  currentMultiplier: number;
  combo: number;
  freeSpins: number;
  wildPositions: [number, number][];
  reelStates: ('spinning' | 'stopping' | 'stopped')[];
}

const BASE_TOKENS_PER_SPIN = 20000;
const BASE_PROBABILITY = 5;
const PROBABILITY_INCREMENT = 2;
const MAX_PROBABILITY = 50;
const MIN_POOL_THRESHOLD = 0.5;      // 最低奖池阈值 (BNB)

/**
 * 符号出现概率说明 (VRF 随机数决定):
 * 
 * VRF 生成 0-99 的随机数，根据范围决定符号:
 * - 7️⃣ Lucky Seven:  0-1   (2%)   → 超级稀有
 * - 💎 Diamond:      2-4   (3%)   → 非常稀有
 * - 👑 Crown:        5-9   (5%)   → 稀有
 * - 🔔 Bell:         10-17 (8%)   → 较稀有
 * - ⭐ Star:         18-27 (10%)  → 中等
 * - 🍒 Cherry:       28-42 (15%)  → 常见
 * - 🍇 Grape:        43-57 (15%)  → 常见
 * - 🍉 Watermelon:   58-72 (15%)  → 常见
 * - 🍋 Lemon:        73-87 (15%)  → 常见
 * - 🍀 Clover:       88-99 (12%)  → 常见
 * 
 * 中奖概率计算 (5轮3行，15条赔付线):
 * - 5个7连线: (0.02)^5 ≈ 1/3,125,000 (实际更低因为需要特定赔付线)
 * - 5个相同:  各符号概率^5 × 赔付线数
 * - 3个相同:  概率较高，约 1/20 - 1/50
 */

const getRandomSymbol = (rng: () => number): SlotSymbol => {
  const roll = rng() * 100;
  // 稀有度控制
  if (roll < 2) return SYMBOLS[0].id; // 2% legendary
  if (roll < 5) return SYMBOLS[1].id; // 3% legendary
  if (roll < 10) return SYMBOLS[2].id; // 5% epic
  if (roll < 18) return SYMBOLS[3].id; // 8% epic
  if (roll < 28) return SYMBOLS[4].id; // 10% epic
  if (roll < 43) return SYMBOLS[5].id; // 15% rare
  if (roll < 58) return SYMBOLS[6].id; // 15% rare
  if (roll < 73) return SYMBOLS[7].id; // 15% rare
  if (roll < 88) return SYMBOLS[8].id; // 15% common
  return SYMBOLS[9].id; // 12% common
};

const generateGrid = (rng: () => number): SlotSymbol[][] => {
  const grid: SlotSymbol[][] = [];
  for (let reel = 0; reel < REELS; reel++) {
    const column: SlotSymbol[] = [];
    for (let row = 0; row < ROWS; row++) {
      column.push(getRandomSymbol(rng));
    }
    grid.push(column);
  }
  return grid;
};

const findSymbolInfo = (id: SlotSymbol): SymbolInfo => {
  return SYMBOLS.find(s => s.id === id) || SYMBOLS[0];
};

// 计算赔付线奖励 - 返回奖励类型和倍数
const checkPayline = (grid: SlotSymbol[][], payline: number[]): WinLine | null => {
  const positions: [number, number][] = payline.map((row, reel) => [reel, row]);
  const symbols = positions.map(([reel, row]) => grid[reel][row]);
  
  // 检查连续相同符号
  const firstSymbol = symbols[0];
  let count = 1;
  
  for (let i = 1; i < symbols.length; i++) {
    if (symbols[i] === firstSymbol) {
      count++;
    } else {
      break;
    }
  }
  
  if (count >= 3) {
    const symbolInfo = findSymbolInfo(firstSymbol);
    // 基础分数 (用于计算相对权重，不是实际BNB奖励)
    const baseScore = symbolInfo.multiplier * (count - 2);
    return {
      lineIndex: 0,
      symbol: symbolInfo,
      count,
      positions: positions.slice(0, count),
      payout: baseScore,
    };
  }
  
  return null;
};

export interface SpinCallbacks {
  onSpinStart?: () => void;
  onReelStop?: (reelIndex: number) => void;
  onSpinEnd?: (result: SpinResult) => void;
}

// 查找奖励配置
const findPrizeConfig = (type: PrizeType): PrizeConfig | null => {
  return PRIZE_TIERS.find(p => p.type === type) || null;
};

/**
 * 计算奖励类型和 BNB 数量
 * 基于中奖线和符号类型判断奖励等级
 */
const calculatePrize = (
  winLines: WinLine[], 
  prizePool: number, 
  betMultiplier: number
): { prizeType: PrizeType; bnbWin: number; prizeConfig: PrizeConfig | null } => {
  if (winLines.length === 0) {
    return { prizeType: 'none', bnbWin: 0, prizeConfig: null };
  }

  // 检查奖池是否足够
  if (prizePool < MIN_POOL_THRESHOLD) {
    return { prizeType: 'none', bnbWin: 0, prizeConfig: null };
  }

  // 分析中奖线
  const hasFiveSevens = winLines.some(line => line.symbol.id === 'seven' && line.count === 5);
  const hasFiveDiamonds = winLines.some(line => line.symbol.id === 'diamond' && line.count === 5);
  const hasFourSevens = winLines.some(line => line.symbol.id === 'seven' && line.count === 4);
  const hasFiveMatch = winLines.some(line => line.count === 5);
  const hasFourLegendary = winLines.some(line => 
    (line.symbol.id === 'seven' || line.symbol.id === 'diamond') && line.count === 4
  );
  const hasFourEpic = winLines.some(line => 
    line.symbol.rarity === 'epic' && line.count === 4
  );
  const hasFourMatch = winLines.some(line => line.count === 4);
  const multipleWinLines = winLines.length >= 3;

  let prizeType: PrizeType = 'none';

  // 超级头奖: 5个7
  if (hasFiveSevens) {
    prizeType = 'mega_jackpot';
  }
  // 头奖: 5个钻石 或 4个7
  else if (hasFiveDiamonds || hasFourSevens) {
    prizeType = 'jackpot';
  }
  // 一等奖: 5个相同 (其他符号)
  else if (hasFiveMatch) {
    prizeType = 'first';
  }
  // 二等奖: 4个传奇/史诗符号
  else if (hasFourLegendary || hasFourEpic) {
    prizeType = 'second';
  }
  // 三等奖: 4个相同 或 3+条中奖线
  else if (hasFourMatch || multipleWinLines) {
    prizeType = 'third';
  }
  // 小奖: 任意3连
  else {
    prizeType = 'small';
  }

  const prizeConfig = findPrizeConfig(prizeType);
  if (!prizeConfig) {
    return { prizeType: 'none', bnbWin: 0, prizeConfig: null };
  }

  // 计算 BNB 奖励 = 奖池 × 奖励比例 × 投注倍数
  const bnbWin = prizePool * prizeConfig.poolRate * betMultiplier;
  
  return { prizeType, bnbWin, prizeConfig };
};

export function useAdvancedSlotMachine() {
  const [gameState, setGameState] = useState<GameState>({
    isSpinning: false,
    grid: generateGrid(Math.random),
    winProbability: BASE_PROBABILITY,
    totalSpins: 0,
    totalWins: 0,
    lastResult: null,
    currentMultiplier: 1,
    combo: 0,
    freeSpins: 0,
    wildPositions: [],
    reelStates: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped'],
  });

  // 模拟奖池 (实际应从链上读取)
  const [prizePool, setPrizePool] = useState(10.5);
  const callbacksRef = useRef<SpinCallbacks>({});

  const setCallbacks = useCallback((callbacks: SpinCallbacks) => {
    callbacksRef.current = callbacks;
  }, []);

  const spin = useCallback(async (betMultiplier: number = 1): Promise<SpinResult> => {
    return new Promise((resolve) => {
      setGameState(prev => ({ 
        ...prev, 
        isSpinning: true,
        reelStates: ['spinning', 'spinning', 'spinning', 'spinning', 'spinning'],
      }));
      
      callbacksRef.current.onSpinStart?.();

      // 加快停止时间 - 每个轮子间隔更短
      const stopTimes = [400, 600, 800, 1000, 1200];
      const finalGrid: SlotSymbol[][] = [];
      
      // 更快的滚动动画
      const spinInterval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          grid: generateGrid(Math.random),
        }));
      }, 40);

      // 依次停止每个轮子
      stopTimes.forEach((time, reelIndex) => {
        setTimeout(() => {
          if (reelIndex === 0) {
            clearInterval(spinInterval);
          }
          
          // 生成最终结果
          const column: SlotSymbol[] = [];
          for (let row = 0; row < ROWS; row++) {
            column.push(getRandomSymbol(Math.random));
          }
          finalGrid[reelIndex] = column;
          
          // 更新状态
          setGameState(prev => {
            const newGrid = [...prev.grid];
            newGrid[reelIndex] = column;
            const newReelStates = [...prev.reelStates];
            newReelStates[reelIndex] = 'stopped';
            return { ...prev, grid: newGrid, reelStates: newReelStates };
          });
          
          // 触发轮子停止回调
          callbacksRef.current.onReelStop?.(reelIndex);
        }, time);
      });

      // 计算结果 - 在最后一个轮子停止后
      setTimeout(() => {
        const winLines: WinLine[] = [];
        
        PAYLINES.forEach((payline, lineIndex) => {
          const win = checkPayline(finalGrid, payline);
          if (win) {
            win.lineIndex = lineIndex;
            winLines.push(win);
          }
        });

        // 计算基础分数
        const baseScore = winLines.reduce((sum, line) => sum + line.payout, 0);

        // 计算连线倍数
        let multiplier = 1;
        if (winLines.length >= 3) multiplier = 1.5;
        if (winLines.length >= 5) multiplier = 2;
        if (winLines.length >= 7) multiplier = 3;

        // 基于奖池计算实际 BNB 奖励
        const { prizeType, bnbWin, prizeConfig } = calculatePrize(
          winLines, 
          prizePool, 
          betMultiplier * multiplier
        );

        // 判断是否头奖类型
        const isJackpotWin = prizeType === 'mega_jackpot' || prizeType === 'jackpot';

        // 更新奖池 (扣除派奖)
        const newPrizePool = prizePool - bnbWin;

        const result: SpinResult = {
          grid: finalGrid,
          winLines,
          totalWin: baseScore * multiplier,
          bnbWin,
          prizeType,
          prizeConfig,
          isJackpot: isJackpotWin,
          newProbability: winLines.length > 0 ? BASE_PROBABILITY : 
            Math.min(gameState.winProbability + PROBABILITY_INCREMENT, MAX_PROBABILITY),
          multiplier,
          prizePoolAfter: newPrizePool,
        };

        // 更新奖池
        if (bnbWin > 0) {
          setPrizePool(newPrizePool);
        }

        setGameState(prev => ({
          ...prev,
          isSpinning: false,
          grid: finalGrid,
          winProbability: result.newProbability,
          totalSpins: prev.totalSpins + 1,
          totalWins: winLines.length > 0 ? prev.totalWins + 1 : prev.totalWins,
          lastResult: result,
          currentMultiplier: multiplier,
          combo: winLines.length > 0 ? prev.combo + 1 : 0,
          reelStates: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped'],
        }));

        callbacksRef.current.onSpinEnd?.(result);
        resolve(result);
      }, 1400); // 比最后轮子停止时间稍晚
    });
  }, [gameState.winProbability, prizePool]);

  return {
    gameState,
    prizePool,
    symbols: SYMBOLS,
    paylines: PAYLINES,
    spin,
    setCallbacks,
  };
}
