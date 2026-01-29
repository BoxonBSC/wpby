import { useState, useCallback, useRef } from 'react';

// 更多符号种类
export type SlotSymbol = 
  | 'seven' | 'diamond' | 'crown' | 'bell' | 'cherry' 
  | 'lemon' | 'grape' | 'watermelon' | 'star' | 'clover';

export interface SymbolInfo {
  id: SlotSymbol;
  emoji: string;
  name: string;
  baseMultiplier: number;  // 3连倍数
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
}

// 符号配置 - 基础倍数为3连时的倍数
export const SYMBOLS: SymbolInfo[] = [
  { id: 'seven', emoji: '7️⃣', name: 'Lucky Seven', baseMultiplier: 50, rarity: 'legendary' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', baseMultiplier: 30, rarity: 'legendary' },
  { id: 'crown', emoji: '👑', name: 'Crown', baseMultiplier: 15, rarity: 'epic' },
  { id: 'bell', emoji: '🔔', name: 'Bell', baseMultiplier: 10, rarity: 'epic' },
  { id: 'star', emoji: '⭐', name: 'Star', baseMultiplier: 8, rarity: 'epic' },
  { id: 'cherry', emoji: '🍒', name: 'Cherry', baseMultiplier: 5, rarity: 'rare' },
  { id: 'grape', emoji: '🍇', name: 'Grape', baseMultiplier: 4, rarity: 'rare' },
  { id: 'watermelon', emoji: '🍉', name: 'Watermelon', baseMultiplier: 3, rarity: 'rare' },
  { id: 'lemon', emoji: '🍋', name: 'Lemon', baseMultiplier: 2, rarity: 'common' },
  { id: 'clover', emoji: '🍀', name: 'Clover', baseMultiplier: 1, rarity: 'common' },
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
  multiplier: number; // 该线的倍数
}

// 6级奖励系统 - 基于倍数而非奖池比例
export type PrizeType = 
  | 'mega_jackpot'  // 超级头奖: 5个7
  | 'jackpot'       // 头奖: 5个钻石 或 4个7
  | 'first'         // 一等奖: 5个相同 (其他符号)
  | 'second'        // 二等奖: 4个相同 (高级符号)
  | 'third'         // 三等奖: 4个相同 (普通符号)
  | 'small'         // 小奖: 3个相同
  | 'none';

// RTP设计说明:
// 目标 RTP: 92% (庄家优势 8%)
// 
// 符号出现概率 (VRF随机):
// - 7️⃣: 2%  (传奇)
// - 💎: 3%  (传奇)
// - 👑: 5%  (史诗)
// - 🔔: 8%  (史诗)
// - ⭐: 10% (史诗)
// - 🍒: 15% (稀有)
// - 🍇: 15% (稀有)
// - 🍉: 15% (稀有)
// - 🍋: 15% (普通)
// - 🍀: 12% (普通)
//
// 倍数计算: 基础倍数 × 连线数量奖励
// 3连 = baseMultiplier × 1
// 4连 = baseMultiplier × 5
// 5连 = baseMultiplier × 20

// 连线数量的倍数加成
export const COUNT_MULTIPLIERS: Record<number, number> = {
  3: 1,    // 3连: 基础倍数
  4: 5,    // 4连: 5倍基础
  5: 20,   // 5连: 20倍基础
};

// 奖励配置
export interface PrizeConfig {
  type: PrizeType;
  name: string;
  emoji: string;
  description: string;
  minMultiplier: number;  // 最低触发倍数
}

export const PRIZE_TIERS: PrizeConfig[] = [
  { type: 'mega_jackpot', name: '超级头奖', emoji: '🎰', description: '5×7连线', minMultiplier: 1000 },
  { type: 'jackpot', name: '头奖', emoji: '💎', description: '5×💎 或 4×7', minMultiplier: 250 },
  { type: 'first', name: '一等奖', emoji: '👑', description: '5连其他符号', minMultiplier: 100 },
  { type: 'second', name: '二等奖', emoji: '🔔', description: '4连高级符号', minMultiplier: 40 },
  { type: 'third', name: '三等奖', emoji: '⭐', description: '4连普通符号', minMultiplier: 10 },
  { type: 'small', name: '小奖', emoji: '🍀', description: '3连任意符号', minMultiplier: 1 },
];

// RTP 赔付表 (供UI显示)
export interface PayoutInfo {
  symbol: SymbolInfo;
  three: number;  // 3连倍数
  four: number;   // 4连倍数
  five: number;   // 5连倍数
}

export const PAYOUT_TABLE: PayoutInfo[] = SYMBOLS.map(symbol => ({
  symbol,
  three: symbol.baseMultiplier * COUNT_MULTIPLIERS[3],
  four: symbol.baseMultiplier * COUNT_MULTIPLIERS[4],
  five: symbol.baseMultiplier * COUNT_MULTIPLIERS[5],
}));

export interface SpinResult {
  grid: SlotSymbol[][];
  winLines: WinLine[];
  totalMultiplier: number;  // 总倍数
  totalWin: number;         // 总赢取 (投注 × 倍数)
  prizeType: PrizeType;
  prizeConfig: PrizeConfig | null;
  isJackpot: boolean;
  hitRate: number;          // 本次中奖率 (中奖线数/总线数)
}

export interface GameState {
  isSpinning: boolean;
  grid: SlotSymbol[][];
  totalSpins: number;
  totalWins: number;
  totalBet: number;         // 累计投注
  totalReturn: number;      // 累计返还
  currentRTP: number;       // 当前RTP
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

// 计算单条赔付线奖励
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
    const countMultiplier = COUNT_MULTIPLIERS[count] || 1;
    const lineMultiplier = symbolInfo.baseMultiplier * countMultiplier;
    
    return {
      lineIndex: 0,
      symbol: symbolInfo,
      count,
      positions: positions.slice(0, count),
      multiplier: lineMultiplier,
    };
  }
  
  return null;
};

export interface SpinCallbacks {
  onSpinStart?: () => void;
  onReelStop?: (reelIndex: number) => void;
  onSpinEnd?: (result: SpinResult) => void;
}

// 根据总倍数判断奖励等级
const determinePrizeType = (totalMultiplier: number, winLines: WinLine[]): PrizeType => {
  if (totalMultiplier <= 0) return 'none';
  
  // 检查特殊组合
  const hasFiveSevens = winLines.some(line => line.symbol.id === 'seven' && line.count === 5);
  const hasFiveDiamonds = winLines.some(line => line.symbol.id === 'diamond' && line.count === 5);
  const hasFourSevens = winLines.some(line => line.symbol.id === 'seven' && line.count === 4);
  
  if (hasFiveSevens) return 'mega_jackpot';
  if (hasFiveDiamonds || hasFourSevens) return 'jackpot';
  
  // 按倍数判断
  if (totalMultiplier >= 100) return 'first';
  if (totalMultiplier >= 40) return 'second';
  if (totalMultiplier >= 10) return 'third';
  return 'small';
};

const findPrizeConfig = (type: PrizeType): PrizeConfig | null => {
  return PRIZE_TIERS.find(p => p.type === type) || null;
};

export function useAdvancedSlotMachine() {
  const [gameState, setGameState] = useState<GameState>({
    isSpinning: false,
    grid: generateGrid(Math.random),
    totalSpins: 0,
    totalWins: 0,
    totalBet: 0,
    totalReturn: 0,
    currentRTP: 0,
    lastResult: null,
    combo: 0,
    reelStates: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped'],
  });

  const callbacksRef = useRef<SpinCallbacks>({});

  const setCallbacks = useCallback((callbacks: SpinCallbacks) => {
    callbacksRef.current = callbacks;
  }, []);

  const spin = useCallback(async (betAmount: number = 0.01): Promise<SpinResult> => {
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

        // 计算总倍数 (所有中奖线倍数之和)
        const totalMultiplier = winLines.reduce((sum, line) => sum + line.multiplier, 0);
        
        // 计算实际赢取金额
        const totalWin = betAmount * totalMultiplier;
        
        // 判断奖励等级
        const prizeType = determinePrizeType(totalMultiplier, winLines);
        const prizeConfig = findPrizeConfig(prizeType);
        
        const isJackpotWin = prizeType === 'mega_jackpot' || prizeType === 'jackpot';
        const hitRate = winLines.length / PAYLINES.length;

        const result: SpinResult = {
          grid: finalGrid,
          winLines,
          totalMultiplier,
          totalWin,
          prizeType,
          prizeConfig,
          isJackpot: isJackpotWin,
          hitRate,
        };

        setGameState(prev => {
          const newTotalBet = prev.totalBet + betAmount;
          const newTotalReturn = prev.totalReturn + totalWin;
          const newRTP = newTotalBet > 0 ? (newTotalReturn / newTotalBet) * 100 : 0;
          
          return {
            ...prev,
            isSpinning: false,
            grid: finalGrid,
            totalSpins: prev.totalSpins + 1,
            totalWins: winLines.length > 0 ? prev.totalWins + 1 : prev.totalWins,
            totalBet: newTotalBet,
            totalReturn: newTotalReturn,
            currentRTP: newRTP,
            lastResult: result,
            combo: winLines.length > 0 ? prev.combo + 1 : 0,
            reelStates: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped'],
          };
        });

        callbacksRef.current.onSpinEnd?.(result);
        resolve(result);
      }, 1400);
    });
  }, []);

  // 重置统计
  const resetStats = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      totalSpins: 0,
      totalWins: 0,
      totalBet: 0,
      totalReturn: 0,
      currentRTP: 0,
      combo: 0,
    }));
  }, []);

  return {
    gameState,
    symbols: SYMBOLS,
    paylines: PAYLINES,
    payoutTable: PAYOUT_TABLE,
    prizeTiers: PRIZE_TIERS,
    spin,
    setCallbacks,
    resetStats,
  };
}
