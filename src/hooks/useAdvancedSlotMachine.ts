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

export type PrizeType = 'jackpot' | 'second' | 'small' | 'none';

export interface SpinResult {
  grid: SlotSymbol[][];
  winLines: WinLine[];
  totalWin: number;        // 总分数
  bnbWin: number;          // 实际 BNB 奖励
  prizeType: PrizeType;    // 奖励类型
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

// 奖金比例 (基于奖池) - 与智能合约一致
const JACKPOT_REWARD_RATE = 0.20;    // 头奖: 奖池的 20%
const SECOND_PRIZE_RATE = 0.05;      // 二等奖: 奖池的 5%
const SMALL_PRIZE_RATE = 0.01;       // 小奖: 奖池的 1%
const MIN_POOL_THRESHOLD = 0.5;      // 最低奖池阈值 (BNB)

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

// 计算奖励类型和 BNB 数量
const calculatePrize = (
  winLines: WinLine[], 
  prizePool: number, 
  betMultiplier: number
): { prizeType: PrizeType; bnbWin: number } => {
  if (winLines.length === 0) {
    return { prizeType: 'none', bnbWin: 0 };
  }

  // 检查奖池是否足够
  if (prizePool < MIN_POOL_THRESHOLD) {
    return { prizeType: 'none', bnbWin: 0 };
  }

  // 检查头奖: 5个7连线
  const hasJackpot = winLines.some(line => 
    line.symbol.id === 'seven' && line.count === 5
  );
  
  if (hasJackpot) {
    // 头奖: 奖池的 20%
    const bnbWin = prizePool * JACKPOT_REWARD_RATE * betMultiplier;
    return { prizeType: 'jackpot', bnbWin };
  }

  // 检查二等奖: 5个相同 (非7) 或 多条5连线
  const hasFiveMatch = winLines.some(line => line.count === 5);
  const multipleWinLines = winLines.length >= 3;
  
  if (hasFiveMatch || multipleWinLines) {
    // 二等奖: 奖池的 5%
    const bnbWin = prizePool * SECOND_PRIZE_RATE * betMultiplier;
    return { prizeType: 'second', bnbWin };
  }

  // 小奖: 任意中奖线
  const bnbWin = prizePool * SMALL_PRIZE_RATE * betMultiplier;
  return { prizeType: 'small', bnbWin };
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
        
        // 检查是否头奖
        const isJackpot = winLines.some(line => 
          line.symbol.id === 'seven' && line.count === 5
        );

        // 计算连线倍数
        let multiplier = 1;
        if (winLines.length >= 3) multiplier = 2;
        if (winLines.length >= 5) multiplier = 3;
        if (isJackpot) multiplier = 10;

        // 基于奖池计算实际 BNB 奖励
        const { prizeType, bnbWin } = calculatePrize(
          winLines, 
          prizePool, 
          betMultiplier * multiplier
        );

        // 更新奖池 (扣除派奖)
        const newPrizePool = prizePool - bnbWin;

        const result: SpinResult = {
          grid: finalGrid,
          winLines,
          totalWin: baseScore * multiplier,
          bnbWin,
          prizeType,
          isJackpot,
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
