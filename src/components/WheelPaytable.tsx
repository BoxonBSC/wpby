import { motion } from 'framer-motion';
import { WHEEL_SECTORS, WHEEL_STATS } from '@/config/wheelConfig';
import { Percent, Coins, Target } from 'lucide-react';

interface WheelPaytableProps {
  prizePool: number;
}

export function WheelPaytable({ prizePool }: WheelPaytableProps) {
  const winSectors = WHEEL_SECTORS.filter(s => s.type !== 'none');

  return (
    <div className="luxury-card p-4">
      <h3 className="text-center font-display text-lg text-shimmer mb-4 flex items-center justify-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        赔付表
      </h3>

      {/* 总中奖率 */}
      <div className="flex items-center justify-center gap-4 mb-4 pb-4 border-b border-border">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">总中奖率</div>
          <div className="text-xl font-display text-primary">
            {(WHEEL_STATS.totalWinRate * 100).toFixed(2)}%
          </div>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">当前奖池</div>
          <div className="text-xl font-display text-primary">
            {prizePool.toFixed(2)} BNB
          </div>
        </div>
      </div>

      {/* 奖励列表 */}
      <div className="space-y-2">
        {winSectors.map((sector, index) => (
          <motion.div
            key={sector.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{sector.emoji}</span>
              <div>
                <div className="font-display text-sm text-foreground">{sector.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  概率: {(sector.probability * 100).toFixed(sector.probability < 0.01 ? 3 : 2)}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-sm text-primary">
                {(sector.poolPercent * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-muted-foreground">
                ≈ {(prizePool * sector.poolPercent).toFixed(4)} BNB
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 未中奖 */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>🔄</span>
            <span>再来一次</span>
          </div>
          <span>{(WHEEL_SECTORS.find(s => s.type === 'none')?.probability ?? 0) * 100}%</span>
        </div>
      </div>
    </div>
  );
}
