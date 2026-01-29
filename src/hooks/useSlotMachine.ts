import { useState, useCallback } from 'react';

export type SlotSymbol = '7' | '🍒' | '🍋' | '🔔' | '💎' | '⭐' | '🍀';

export interface SpinResult {
  reels: [SlotSymbol, SlotSymbol, SlotSymbol];
  isWin: boolean;
  winType: 'jackpot' | 'second' | 'small' | null;
  winAmount: number;
  newProbability: number;
}

export interface GameState {
  isSpinning: boolean;
  currentReels: [SlotSymbol, SlotSymbol, SlotSymbol];
  winProbability: number;
  totalSpins: number;
  totalWins: number;
  lastResult: SpinResult | null;
}

const SYMBOLS: SlotSymbol[] = ['7', '🍒', '🍋', '🔔', '💎', '⭐', '🍀'];
const TOKENS_PER_SPIN = 20000;
const BASE_PROBABILITY = 5;
const PROBABILITY_INCREMENT = 2;
const MAX_PROBABILITY = 50;

// Mock prize pool for demo
let mockPrizePool = 10.5; // BNB

export function useSlotMachine() {
  const [gameState, setGameState] = useState<GameState>({
    isSpinning: false,
    currentReels: ['🍒', '🍋', '🔔'],
    winProbability: BASE_PROBABILITY,
    totalSpins: 0,
    totalWins: 0,
    lastResult: null,
  });

  const [prizePool] = useState(mockPrizePool);

  const getRandomSymbol = (): SlotSymbol => {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  };

  const calculateWin = (reels: [SlotSymbol, SlotSymbol, SlotSymbol], probability: number): SpinResult => {
    const [r1, r2, r3] = reels;
    
    // Check for jackpot (three 7s)
    if (r1 === '7' && r2 === '7' && r3 === '7') {
      return {
        reels,
        isWin: true,
        winType: 'jackpot',
        winAmount: prizePool * 0.2,
        newProbability: BASE_PROBABILITY,
      };
    }

    // Check for three of a kind (second prize)
    if (r1 === r2 && r2 === r3) {
      return {
        reels,
        isWin: true,
        winType: 'second',
        winAmount: prizePool * 0.05,
        newProbability: BASE_PROBABILITY,
      };
    }

    // Check for two of a kind (small prize)
    if (r1 === r2 || r2 === r3 || r1 === r3) {
      // Use probability to determine if this counts as a win
      const rollWin = Math.random() * 100 < probability;
      if (rollWin) {
        return {
          reels,
          isWin: true,
          winType: 'small',
          winAmount: prizePool * 0.01,
          newProbability: BASE_PROBABILITY,
        };
      }
    }

    // No win - increase probability
    const newProbability = Math.min(probability + PROBABILITY_INCREMENT, MAX_PROBABILITY);
    return {
      reels,
      isWin: false,
      winType: null,
      winAmount: 0,
      newProbability,
    };
  };

  const spin = useCallback(async (): Promise<SpinResult> => {
    return new Promise((resolve) => {
      setGameState(prev => ({ ...prev, isSpinning: true }));

      // Simulate spinning animation with random symbols
      const spinInterval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          currentReels: [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        }));
      }, 100);

      // Stop after 2 seconds
      setTimeout(() => {
        clearInterval(spinInterval);
        
        setGameState(prev => {
          const finalReels: [SlotSymbol, SlotSymbol, SlotSymbol] = [
            getRandomSymbol(),
            getRandomSymbol(),
            getRandomSymbol(),
          ];
          
          const result = calculateWin(finalReels, prev.winProbability);
          
          setTimeout(() => {
            setGameState(current => ({
              ...current,
              isSpinning: false,
              currentReels: finalReels,
              winProbability: result.newProbability,
              totalSpins: current.totalSpins + 1,
              totalWins: result.isWin ? current.totalWins + 1 : current.totalWins,
              lastResult: result,
            }));
          }, 0);

          resolve(result);
          
          return {
            ...prev,
            currentReels: finalReels,
          };
        });
      }, 2000);
    });
  }, [prizePool]);

  const resetProbability = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      winProbability: BASE_PROBABILITY,
    }));
  }, []);

  return {
    gameState,
    prizePool,
    tokensPerSpin: TOKENS_PER_SPIN,
    spin,
    resetProbability,
  };
}
