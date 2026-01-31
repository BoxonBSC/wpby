import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, User, Award, Star, Gem, Crown } from 'lucide-react';
import { useCyberSlots, formatSymbols, shortenAddress } from '@/hooks/useCyberSlots';
import { formatEther } from 'ethers';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  address: string;
  result: string;
  symbols: number[];
  winAmount: number;
  timestamp: Date;
  isWin: boolean;
  txHash?: string;
  prizeType: string;
  prizeName: string;
  prizeColor: string;
}

const VISIBLE_COUNT = 8; // 每次显示8条
const ROTATE_INTERVAL = 5000; // 每5秒轮动一次

// 根据符号判断中奖类型
function getPrizeInfo(symbols: number[], language: string): { type: string; name: string; color: string } {
  const counts: Record<number, number> = {};
  symbols.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  
  const maxCount = Math.max(...Object.values(counts));
  const maxSymbol = Number(Object.keys(counts).find(k => counts[Number(k)] === maxCount));
  
  // 超级头奖: 5×7️⃣ (symbol 0)
  if (maxCount === 5 && maxSymbol === 0) {
    return { type: 'super_jackpot', name: language === 'zh' ? '超级头奖' : 'SUPER JACKPOT', color: 'text-neon-yellow' };
  }
  // 头奖: 5×💎 (symbol 1) 或 4×7️⃣
  if ((maxCount === 5 && maxSymbol === 1) || (maxCount === 4 && maxSymbol === 0)) {
    return { type: 'jackpot', name: language === 'zh' ? '头奖' : 'JACKPOT', color: 'text-neon-purple' };
  }
  // 一等奖: 任意5个相同
  if (maxCount === 5) {
    return { type: 'first', name: language === 'zh' ? '一等奖' : '1st Prize', color: 'text-neon-pink' };
  }
  // 二等奖: 4个稀有符号 (0-4)
  if (maxCount === 4 && maxSymbol <= 4) {
    return { type: 'second', name: language === 'zh' ? '二等奖' : '2nd Prize', color: 'text-neon-cyan' };
  }
  // 三等奖: 4个普通符号 (5-9)
  if (maxCount === 4) {
    return { type: 'third', name: language === 'zh' ? '三等奖' : '3rd Prize', color: 'text-neon-blue' };
  }
  // 小奖: 3个相同
  if (maxCount === 3) {
    return { type: 'small', name: language === 'zh' ? '小奖' : 'Small Win', color: 'text-neon-green' };
  }
  // 安慰奖: 2个相同
  return { type: 'consolation', name: language === 'zh' ? '安慰奖' : 'Consolation', color: 'text-muted-foreground' };
}

export function CompactGameHistory() {
  const { recentWins } = useCyberSlots();
  const { t, language } = useLanguage();
  const [startIndex, setStartIndex] = useState(0);

  // 获取最多20条中奖记录
  const allHistory: HistoryItem[] = recentWins
    .filter(win => win.winAmount > 0n)
    .slice(0, 20)
    .map((win, index) => {
      const prizeInfo = getPrizeInfo(win.symbols, language);
      return {
        id: `${win.requestId}-${index}`,
        address: shortenAddress(win.player),
        result: formatSymbols(win.symbols).join(' '),
        symbols: win.symbols,
        winAmount: parseFloat(formatEther(win.winAmount)),
        timestamp: new Date(win.timestamp),
        isWin: true,
        txHash: win.txHash,
        prizeType: prizeInfo.type,
        prizeName: prizeInfo.name,
        prizeColor: prizeInfo.color,
      };
    });

  // 轮动效果：当记录超过5条时自动切换
  useEffect(() => {
    if (allHistory.length <= VISIBLE_COUNT) return;
    
    const interval = setInterval(() => {
      setStartIndex((prev) => {
        const nextIndex = prev + 1;
        // 循环回到开始
        return nextIndex >= allHistory.length ? 0 : nextIndex;
      });
    }, ROTATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [allHistory.length]);

  // 计算当前显示的记录（支持循环）
  const displayHistory = (() => {
    if (allHistory.length === 0) return [];
    if (allHistory.length <= VISIBLE_COUNT) return allHistory;
    
    const result: HistoryItem[] = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      const index = (startIndex + i) % allHistory.length;
      result.push(allHistory[index]);
    }
    return result;
  })();

  const getBscScanUrl = (hash: string) => `https://bscscan.com/tx/${hash}`;

  return (
    <div className="cyber-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-display neon-text-cyan flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {t('compactHistory.title')}
        </h3>
        <div className="flex items-center gap-2">
          {allHistory.length > VISIBLE_COUNT && (
            <span className="text-xs text-muted-foreground">
              {startIndex + 1}-{Math.min(startIndex + VISIBLE_COUNT, allHistory.length)}/{allHistory.length}
            </span>
          )}
          {allHistory.length > 0 && (
            <span className="text-xs text-neon-green">🔗 {t('compactHistory.live')}</span>
          )}
        </div>
      </div>

      <div className="space-y-1.5 flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {displayHistory.map((item, index) => {
            const content = (
              <motion.div
                key={`${item.id}-${startIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
                className={`
                  p-2 rounded-lg text-xs
                  ${item.prizeType === 'super_jackpot' ? 'bg-gradient-to-r from-neon-yellow/20 to-neon-orange/10 border border-neon-yellow/40' :
                    item.prizeType === 'jackpot' ? 'bg-gradient-to-r from-neon-purple/20 to-neon-pink/10 border border-neon-purple/40' :
                    'neon-border bg-neon-green/5'}
                  ${item.txHash ? 'cursor-pointer hover:brightness-110 transition-all' : ''}
                `}
              >
                {/* 第一行：地址 + 奖级 */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                    <span className="text-neon-cyan font-mono text-[11px]">
                      {item.address}
                    </span>
                  </div>
                  <span className={`
                    font-display text-[11px] px-2 py-0.5 rounded-full font-bold
                    ${item.prizeType === 'super_jackpot' ? 'bg-neon-yellow/30 text-neon-yellow border border-neon-yellow/50 animate-pulse' :
                      item.prizeType === 'jackpot' ? 'bg-neon-purple/30 text-neon-purple border border-neon-purple/50' :
                      item.prizeType === 'first' ? 'bg-neon-pink/25 text-neon-pink border border-neon-pink/40' :
                      item.prizeType === 'second' ? 'bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/40' :
                      item.prizeType === 'third' ? 'bg-neon-blue/25 text-neon-blue border border-neon-blue/40' :
                      item.prizeType === 'small' ? 'bg-neon-green/25 text-neon-green border border-neon-green/40' :
                      'bg-muted/30 text-muted-foreground border border-border/50'}
                  `}>
                    {item.prizeName}
                  </span>
                </div>
                {/* 第二行：符号 + 金额 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">{item.result}</span>
                  <div className="flex items-center gap-1 text-neon-yellow">
                    <Trophy className="w-3 h-3" />
                    <span className="font-display text-[11px]">+{item.winAmount.toFixed(4)}</span>
                  </div>
                </div>
              </motion.div>
            );

            return item.txHash ? (
              <a
                key={`${item.id}-${startIndex}-link`}
                href={getBscScanUrl(item.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {content}
              </a>
            ) : (
              content
            );
          })}
        </AnimatePresence>
        
        {allHistory.length === 0 && (
          <div className="text-center text-muted-foreground text-xs py-4">
            {t('compactHistory.noRecords')}
          </div>
        )}
      </div>
      
      <a 
        href="/history" 
        className="mt-3 text-xs text-neon-cyan hover:underline text-center block"
      >
        {t('compactHistory.viewMore')}
      </a>
    </div>
  );
}
