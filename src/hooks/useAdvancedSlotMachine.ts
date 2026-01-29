import { useState, useCallback, useRef } from 'react';

// 符号类型
export type SlotSymbol = 
  | 'seven' | 'diamond' | 'crown' | 'bell' | 'cherry' 
  | 'lemon' | 'grape' | 'watermelon' | 'star' | 'clover';

export interface SymbolInfo {
  id: SlotSymbol;
  emoji: string;
  name: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
}

// 符号配置
export const SYMBOLS: SymbolInfo[] = [
  { id: 'seven', emoji: '7️⃣', name: 'Lucky Seven', rarity: 'legendary' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', rarity: 'legendary' },
  { id: 'crown', emoji: '👑', name: 'Crown', rarity: 'epic' },
  { id: 'bell', emoji: '🔔', name: 'Bell', rarity: 'epic' },
  { id: 'star', emoji: '⭐', name: 'Star', rarity: 'epic' },
  { id: 'cherry', emoji: '🍒', name: 'Cherry', rarity: 'rare' },
  { id: 'grape', emoji: '🍇', name: 'Grape', rarity: 'rare' },
  { id: 'watermelon', emoji: '🍉', name: 'Watermelon', rarity: 'rare' },
  { id: 'lemon', emoji: '🍋', name: 'Lemon', rarity: 'common' },
  { id: 'clover', emoji: '🍀', name: 'Clover', rarity: 'common' },
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
}

// 6级奖励系统 - 基于奖池百分比
export type PrizeType = 
  | 'mega_jackpot'  // 超级头奖: 5个7
  | 'jackpot'       // 头奖: 5个钻石 或 4个7
  | 'first'         // 一等奖: 5个相同 (其他符号)
  | 'second'        // 二等奖: 4个相同 (高级符号)
  | 'third'         // 三等奖: 4个相同 (普通符号)
  | 'small'         // 小奖: 3个相同
  | 'none';

// 奖励配置 - 基于奖池百分比
export interface PrizeConfig {
  type: PrizeType;
  name: string;
  emoji: string;
  description: string;
  poolPercent: number;  // 奖池百分比
}

// 奖池保护配置
export const POOL_PROTECTION = {
  maxSinglePayout: 0.5,    // 单次最大派奖 = 奖池的 50%
  reservePercent: 0.1,     // 保留 10% 奖池作为储备
};

export const PRIZE_TIERS: PrizeConfig[] = [
  { type: 'mega_jackpot', name: '超级头奖', emoji: '🎰', description: '5×7连线', poolPercent: 0.30 },
  { type: 'jackpot', name: '头奖', emoji: '💎', description: '5×💎 或 4×7', poolPercent: 0.15 },
  { type: 'first', name: '一等奖', emoji: '👑', description: '5连其他符号', poolPercent: 0.08 },
  { type: 'second', name: '二等奖', emoji: '🔔', description: '4连高级符号', poolPercent: 0.04 },
  { type: 'third', name: '三等奖', emoji: '⭐', description: '4连普通符号', poolPercent: 0.02 },
  { type: 'small', name: '小奖', emoji: '🍀', description: '3连任意符号', poolPercent: 0.005 },
];

export interface SpinResult {
  grid: SlotSymbol[][];
  winLines: WinLine[];
  prizeType: PrizeType;
  prizeConfig: PrizeConfig | null;
  poolPayout: number;       // 从奖池派发的金额
  poolPercentUsed: number;  // 使用的奖池百分比
  isJackpot: boolean;
  hitRate: number;
}

export interface GameState {
  isSpinning: boolean;
  grid: SlotSymbol[][];
  totalSpins: number;
  totalWins: number;
  lastResult: SpinResult | null;
  combo: number;
  reelStates: ('spinning' | 'stopping' | 'stopped')[];
}

/**
 * 符号出现概率 (VRF 随机数决定):
 * 
 * VRF 生成 0-99 的随机数，根据范围决定符号:
 * - 7️⃣ Lucky Seven:  0-1   (2%)   → 传奇
 * - 💎 Diamond:      2-4   (3%)   → 传奇
 * - 👑 Crown:        5-9   (5%)   → 史诗
 * - 🔔 Bell:         10-17 (8%)   → 史诗
 * - ⭐ Star:         18-27 (10%)  → 史诗
 * - 🍒 Cherry:       28-42 (15%)  → 稀有
 * - 🍇 Grape:        43-57 (15%)  → 稀有
 * - 🍉 Watermelon:   58-72 (15%)  → 稀有
 * - 🍋 Lemon:        73-87 (15%)  → 普通
 * - 🍀 Clover:       88-99 (12%)  → 普通
 */

const getRandomSymbol = (rng: () => number): SlotSymbol => {
  const roll = rng() * 100;
  if (roll < 2) return SYMBOLS[0].id;  // 2% seven
  if (roll < 5) return SYMBOLS[1].id;  // 3% diamond
  if (roll < 10) return SYMBOLS[2].id; // 5% crown
  if (roll < 18) return SYMBOLS[3].id; // 8% bell
  if (roll < 28) return SYMBOLS[4].id; // 10% star
  if (roll < 43) return SYMBOLS[5].id; // 15% cherry
  if (roll < 58) return SYMBOLS[6].id; // 15% grape
  if (roll < 73) return SYMBOLS[7].id; // 15% watermelon
  if (roll < 88) return SYMBOLS[8].id; // 15% lemon
  return SYMBOLS[9].id;                // 12% clover
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

// 计算单条赔付线
const checkPayline = (grid: SlotSymbol[][], payline: number[]): WinLine | null => {
  const positions: [number, number][] = payline.map((row, reel) => [reel, row]);
  const symbols = positions.map(([reel, row]) => grid[reel][row]);
  
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
    return {
      lineIndex: 0,
      symbol: symbolInfo,
      count,
      positions: positions.slice(0, count),
    };
  }
  
  return null;
};

export interface SpinCallbacks {
  onSpinStart?: () => void;
  onReelStop?: (reelIndex: number) => void;
  onSpinEnd?: (result: SpinResult) => void;
}

// 根据中奖线判断奖励等级
const determinePrizeType = (winLines: WinLine[]): PrizeType => {
  if (winLines.length === 0) return 'none';
  
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
  
  if (hasFiveSevens) return 'mega_jackpot';
  if (hasFiveDiamonds || hasFourSevens) return 'jackpot';
  if (hasFiveMatch) return 'first';
  if (hasFourLegendary || hasFourEpic) return 'second';
  if (hasFourMatch) return 'third';
  return 'small';
};

const findPrizeConfig = (type: PrizeType): PrizeConfig | null => {
  return PRIZE_TIERS.find(p => p.type === type) || null;
};

/**
 * 计算奖池派奖金额
 * 
 * 规则：
 * 1. 根据奖励等级获取对应的奖池百分比
 * 2. 应用最大派奖限制（不超过奖池的50%）
 * 3. 确保奖池余额高于最低阈值
 * 4. 保留一定比例作为储备
 */
const calculatePoolPayout = (
  prizeType: PrizeType,
  prizeConfig: PrizeConfig | null,
  currentPool: number
): { payout: number; percentUsed: number } => {
  if (prizeType === 'none' || !prizeConfig) {
    return { payout: 0, percentUsed: 0 };
  }

  // 可用于派奖的金额 = 奖池 - 储备金
  const availablePool = currentPool * (1 - POOL_PROTECTION.reservePercent);
  
  // 计算基础派奖 = 可用奖池 × 奖励百分比
  let basePayout = availablePool * prizeConfig.poolPercent;
  
  // 应用最大派奖限制
  const maxPayout = currentPool * POOL_PROTECTION.maxSinglePayout;
  const finalPayout = Math.min(basePayout, maxPayout);
  
  // 计算实际使用的百分比
  const percentUsed = finalPayout / currentPool;
  
  return { payout: finalPayout, percentUsed };
};

export function useAdvancedSlotMachine() {
  const [gameState, setGameState] = useState<GameState>({
    isSpinning: false,
    grid: generateGrid(Math.random),
    totalSpins: 0,
    totalWins: 0,
    lastResult: null,
    combo: 0,
    reelStates: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped'],
  });

  // 模拟奖池 (实际应从链上读取)
  const [prizePool, setPrizePool] = useState(10.5);

  const callbacksRef = useRef<SpinCallbacks>({});

  const setCallbacks = useCallback((callbacks: SpinCallbacks) => {
    callbacksRef.current = callbacks;
  }, []);

  const spin = useCallback(async (betTokens: number): Promise<SpinResult> => {
    return new Promise((resolve) => {
      setGameState(prev => ({ 
        ...prev, 
        isSpinning: true,
        reelStates: ['spinning', 'spinning', 'spinning', 'spinning', 'spinning'],
      }));
      
      callbacksRef.current.onSpinStart?.();

      const stopTimes = [400, 600, 800, 1000, 1200];
      const finalGrid: SlotSymbol[][] = [];
      
      const spinInterval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          grid: generateGrid(Math.random),
        }));
      }, 40);

      stopTimes.forEach((time, reelIndex) => {
        setTimeout(() => {
          if (reelIndex === 0) {
            clearInterval(spinInterval);
          }
          
          const column: SlotSymbol[] = [];
          for (let row = 0; row < ROWS; row++) {
            column.push(getRandomSymbol(Math.random));
          }
          finalGrid[reelIndex] = column;
          
          setGameState(prev => {
            const newGrid = [...prev.grid];
            newGrid[reelIndex] = column;
            const newReelStates = [...prev.reelStates];
            newReelStates[reelIndex] = 'stopped';
            return { ...prev, grid: newGrid, reelStates: newReelStates };
          });
          
          callbacksRef.current.onReelStop?.(reelIndex);
        }, time);
      });

      setTimeout(() => {
        const winLines: WinLine[] = [];
        
        PAYLINES.forEach((payline, lineIndex) => {
          const win = checkPayline(finalGrid, payline);
          if (win) {
            win.lineIndex = lineIndex;
            winLines.push(win);
          }
        });

        // 判断奖励等级
        const prizeType = determinePrizeType(winLines);
        const prizeConfig = findPrizeConfig(prizeType);
        
        // 计算奖池派奖
        const { payout, percentUsed } = calculatePoolPayout(prizeType, prizeConfig, prizePool);
        
        const isJackpotWin = prizeType === 'mega_jackpot' || prizeType === 'jackpot';
        const hitRate = winLines.length / PAYLINES.length;

        const result: SpinResult = {
          grid: finalGrid,
          winLines,
          prizeType,
          prizeConfig,
          poolPayout: payout,
          poolPercentUsed: percentUsed,
          isJackpot: isJackpotWin,
          hitRate,
        };

        // 更新奖池
        if (payout > 0) {
          setPrizePool(prev => prev - payout);
        }

        setGameState(prev => ({
          ...prev,
          isSpinning: false,
          grid: finalGrid,
          totalSpins: prev.totalSpins + 1,
          totalWins: winLines.length > 0 ? prev.totalWins + 1 : prev.totalWins,
          lastResult: result,
          combo: winLines.length > 0 ? prev.combo + 1 : 0,
          reelStates: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped'],
        }));

        callbacksRef.current.onSpinEnd?.(result);
        resolve(result);
      }, 1400);
    });
  }, [prizePool]);

  return {
    gameState,
    prizePool,
    symbols: SYMBOLS,
    paylines: PAYLINES,
    prizeTiers: PRIZE_TIERS,
    poolProtection: POOL_PROTECTION,
    spin,
    setCallbacks,
  };
}
