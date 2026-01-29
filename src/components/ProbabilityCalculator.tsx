import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronDown, ChevronUp, Info, Sparkles } from 'lucide-react';
import { SYMBOLS, PAYLINES, PRIZE_TIERS, REELS } from '@/hooks/useAdvancedSlotMachine';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 符号概率配置 (与 useAdvancedSlotMachine 保持一致)
const SYMBOL_PROBABILITIES: Record<string, number> = {
  'seven': 0.02,      // 2%
  'diamond': 0.03,    // 3%
  'crown': 0.05,      // 5%
  'bell': 0.08,       // 8%
  'star': 0.10,       // 10%
  'cherry': 0.15,     // 15%
  'grape': 0.15,      // 15%
  'watermelon': 0.15, // 15%
  'lemon': 0.15,      // 15%
  'clover': 0.12,     // 12%
};

// 按稀有度分组的概率
const RARITY_PROBABILITIES = {
  legendary: 0.02 + 0.03,  // 5% (seven + diamond)
  epic: 0.05 + 0.08 + 0.10, // 23% (crown + bell + star)
  rare: 0.15 * 3,           // 45% (cherry + grape + watermelon)
  common: 0.15 + 0.12,      // 27% (lemon + clover)
};

// 计算连线概率
const calculateLineProbability = (symbolId: string, count: number): number => {
  const p = SYMBOL_PROBABILITIES[symbolId];
  if (!p) return 0;
  
  // 连续count个相同符号的概率
  // P = p^count (前count个相同)
  // 如果count < 5，后面的符号可以是任意的
  return Math.pow(p, count);
};

// 计算特定奖励类型的概率
const calculatePrizeProbability = (prizeType: string): { probability: number; odds: string; description: string } => {
  switch (prizeType) {
    case 'mega_jackpot': {
      // 5个7连线 - 任意一条赔付线
      const p = Math.pow(SYMBOL_PROBABILITIES['seven'], 5);
      const pAnyLine = 1 - Math.pow(1 - p, PAYLINES.length);
      return {
        probability: pAnyLine,
        odds: `1 : ${Math.round(1 / pAnyLine).toLocaleString()}`,
        description: '5个7️⃣连线',
      };
    }
    case 'jackpot': {
      // 5个钻石 或 4个7
      const p5Diamond = Math.pow(SYMBOL_PROBABILITIES['diamond'], 5);
      const p4Seven = Math.pow(SYMBOL_PROBABILITIES['seven'], 4) * (1 - SYMBOL_PROBABILITIES['seven']);
      const pAnyLine = 1 - Math.pow(1 - (p5Diamond + p4Seven), PAYLINES.length);
      return {
        probability: pAnyLine,
        odds: `1 : ${Math.round(1 / pAnyLine).toLocaleString()}`,
        description: '5×💎 或 4×7️⃣',
      };
    }
    case 'first': {
      // 任意5连线 (非7非钻石)
      let p5Match = 0;
      SYMBOLS.filter(s => s.id !== 'seven' && s.id !== 'diamond').forEach(symbol => {
        p5Match += Math.pow(SYMBOL_PROBABILITIES[symbol.id], 5);
      });
      const pAnyLine = 1 - Math.pow(1 - p5Match, PAYLINES.length);
      return {
        probability: pAnyLine,
        odds: `1 : ${Math.round(1 / pAnyLine).toLocaleString()}`,
        description: '5连其他符号',
      };
    }
    case 'second': {
      // 4连高级符号 (传奇/史诗)
      let p4HighMatch = 0;
      SYMBOLS.filter(s => s.rarity === 'legendary' || s.rarity === 'epic').forEach(symbol => {
        // 4个相同，第5个不同
        const p4 = Math.pow(SYMBOL_PROBABILITIES[symbol.id], 4);
        const pNot5 = 1 - SYMBOL_PROBABILITIES[symbol.id];
        p4HighMatch += p4 * pNot5;
      });
      const pAnyLine = 1 - Math.pow(1 - p4HighMatch, PAYLINES.length);
      return {
        probability: pAnyLine,
        odds: `1 : ${Math.round(1 / pAnyLine).toLocaleString()}`,
        description: '4连传奇/史诗',
      };
    }
    case 'third': {
      // 4连普通符号
      let p4CommonMatch = 0;
      SYMBOLS.filter(s => s.rarity === 'rare' || s.rarity === 'common').forEach(symbol => {
        const p4 = Math.pow(SYMBOL_PROBABILITIES[symbol.id], 4);
        const pNot5 = 1 - SYMBOL_PROBABILITIES[symbol.id];
        p4CommonMatch += p4 * pNot5;
      });
      const pAnyLine = 1 - Math.pow(1 - p4CommonMatch, PAYLINES.length);
      return {
        probability: pAnyLine,
        odds: `1 : ${Math.round(1 / pAnyLine).toLocaleString()}`,
        description: '4连普通符号',
      };
    }
    case 'small': {
      // 任意3连线
      let p3Match = 0;
      SYMBOLS.forEach(symbol => {
        // 3个相同，第4个不同
        const p3 = Math.pow(SYMBOL_PROBABILITIES[symbol.id], 3);
        const pNot4 = 1 - SYMBOL_PROBABILITIES[symbol.id];
        p3Match += p3 * pNot4;
      });
      const pAnyLine = 1 - Math.pow(1 - p3Match, PAYLINES.length);
      return {
        probability: pAnyLine,
        odds: `1 : ${Math.round(1 / pAnyLine).toLocaleString()}`,
        description: '任意3连线',
      };
    }
    default:
      return { probability: 0, odds: '-', description: '' };
  }
};

// 计算任意中奖的概率
const calculateAnyWinProbability = (): number => {
  // 任意3连及以上的概率
  let p3OrMore = 0;
  SYMBOLS.forEach(symbol => {
    const p = SYMBOL_PROBABILITIES[symbol.id];
    // 3连、4连、5连都算中奖
    p3OrMore += Math.pow(p, 3); // 至少3连
  });
  return 1 - Math.pow(1 - p3OrMore, PAYLINES.length);
};

export function ProbabilityCalculator() {
  const [showDetails, setShowDetails] = useState(false);
  
  const anyWinProb = calculateAnyWinProbability();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 hover:border-neon-purple/50 transition-all"
        >
          <Calculator className="w-4 h-4 text-neon-purple" />
          <span className="text-sm font-display text-neon-purple">概率计算器</span>
          <Sparkles className="w-3 h-3 text-neon-cyan" />
        </motion.button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg bg-background/95 backdrop-blur-xl border-neon-purple/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-display neon-text-purple flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            理论概率计算器
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* 总体中奖概率 */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 border border-neon-green/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">任意中奖概率</span>
              <span className="text-2xl font-display text-neon-green">
                {(anyWinProb * 100).toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              每次旋转至少获得一个3连及以上的概率
            </p>
          </div>
          
          {/* 各奖励等级概率 */}
          <div className="space-y-2">
            <h4 className="text-sm font-display text-neon-cyan flex items-center gap-2">
              <Info className="w-4 h-4" />
              各奖励等级概率
            </h4>
            
            <div className="space-y-1.5">
              {PRIZE_TIERS.map((prize, index) => {
                const { probability, odds, description } = calculatePrizeProbability(prize.type);
                
                return (
                  <motion.div
                    key={prize.type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      flex items-center gap-3 p-2.5 rounded-lg text-sm
                      ${index === 0 
                        ? 'bg-gradient-to-r from-neon-yellow/15 to-neon-orange/10 border border-neon-yellow/30' 
                        : index === 1 
                        ? 'bg-gradient-to-r from-neon-purple/15 to-neon-pink/10 border border-neon-purple/30' 
                        : 'bg-muted/20 border border-border/30'}
                    `}
                  >
                    <span className="text-lg">{prize.emoji}</span>
                    <div className="flex-1">
                      <div className={`font-display ${
                        index === 0 ? 'text-neon-yellow' : 
                        index === 1 ? 'text-neon-purple' : 
                        'text-foreground'
                      }`}>
                        {prize.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-neon-cyan">
                        {(probability * 100).toFixed(6)}%
                      </div>
                      <div className="text-xs text-muted-foreground">{odds}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* 符号概率详情 */}
          <div className="border-t border-border/30 pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm font-display text-neon-purple">符号出现概率详情</span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {SYMBOLS.map((symbol) => (
                      <div
                        key={symbol.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/20"
                      >
                        <span className="text-lg">{symbol.emoji}</span>
                        <span className="text-xs text-muted-foreground flex-1">{symbol.name}</span>
                        <span className="text-xs font-mono text-neon-cyan">
                          {(SYMBOL_PROBABILITIES[symbol.id] * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* 连线概率计算示例 */}
                  <div className="mt-3 p-3 rounded-lg bg-muted/10 border border-border/20">
                    <h5 className="text-xs font-display text-neon-yellow mb-2">连线概率计算公式</h5>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• <span className="text-neon-cyan">单线N连</span> = P^N (P为符号概率)</p>
                      <p>• <span className="text-neon-cyan">任意线中奖</span> = 1 - (1-P)^{PAYLINES.length}</p>
                      <p className="mt-2 text-neon-green">例: 5个7️⃣ = 0.02^5 = 0.000000032%</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* 免责声明 */}
          <div className="text-xs text-muted-foreground text-center p-2 rounded-lg bg-muted/10">
            ⚠️ 以上为理论概率，实际结果由 Chainlink VRF 随机决定
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
