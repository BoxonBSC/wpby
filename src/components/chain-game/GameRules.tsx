import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, Info } from 'lucide-react';
import { CHAIN_GAME_DYNAMIC_TIERS } from '@/config/contracts';

interface GameRulesProps {
  currentTier: (typeof CHAIN_GAME_DYNAMIC_TIERS)[number];
  prizePoolBNB: number;
  platformFee: number;
}

export function GameRules({ currentTier, prizePoolBNB, platformFee }: GameRulesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const coreRules = [
    { icon: '🔥', title: '代币销毁', text: '出价代币直接转入黑洞地址，永久销毁' },
    { icon: '📈', title: '递增出价', text: '每次出价需超过最高价，最低10,000代币' },
    { icon: '⏰', title: '自动开奖', text: '每轮30分钟，倒计时归零后自动结算' },
    { icon: '🏆', title: '赢家通吃', text: '最高出价者赢得奖池BNB，自动发放' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.01] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">游戏规则</span>
          <span className="text-xs text-neutral-600">· 销毁代币，赢取BNB</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        </motion.div>
      </button>

      {/* Core rules - always visible */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {coreRules.map((rule, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-violet-500/10 transition-colors"
            >
              <span className="text-xl">{rule.icon}</span>
              <div className="text-xs font-medium text-white mt-1.5">{rule.title}</div>
              <div className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">{rule.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Dynamic tiers */}
              <div className="p-4 rounded-xl bg-violet-500/[0.04] border border-violet-500/10">
                <div className="flex items-center gap-2 text-sm font-medium text-violet-400 mb-3">
                  <Zap className="w-4 h-4" />
                  动态赢家比例
                </div>
                <div className="text-xs text-neutral-500 mb-3">
                  参与人数越多，赢家奖金越高 · 5%平台费从赢家奖励中扣除
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {CHAIN_GAME_DYNAMIC_TIERS.map((tier, index) => {
                    const isActive = tier.winnerRate === currentTier.winnerRate;
                    const tierGross = prizePoolBNB * tier.winnerRate / 100;
                    const tierNet = (tierGross - tierGross * platformFee / 100).toFixed(4);
                    return (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-center transition-all ${
                          isActive
                            ? 'bg-violet-500/10 border border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.08)]'
                            : 'bg-white/[0.02] border border-white/[0.04]'
                        }`}
                      >
                        <div className="text-sm">{tier.label.split(' ')[0]}</div>
                        <div className={`text-[10px] ${isActive ? 'text-violet-400' : 'text-neutral-600'}`}>
                          {tier.minPlayers}-{tier.maxPlayers === Infinity ? '∞' : tier.maxPlayers}人
                        </div>
                        <div className={`font-bold text-sm ${isActive ? 'text-violet-400' : 'text-neutral-500'}`}>
                          {tier.winnerRate}%
                        </div>
                        <div className="text-[10px] text-neutral-600">{tierNet} BNB</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Settlement mechanism */}
              <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10">
                <div className="text-sm font-medium text-emerald-400 mb-2">💰 结算与奖金机制</div>
                <div className="text-xs text-neutral-500 leading-relaxed space-y-1.5">
                  <p>• Chainlink Automation 自动触发结算，无需人工干预</p>
                  <p>• 赢家奖金按动态比例发放，5% 平台手续费从赢家奖金中扣除</p>
                  <p>• 奖金自动转入赢家钱包；若失败可手动领取</p>
                  <p>• 剩余奖池自动滚入下一轮</p>
                </div>
              </div>

              {/* Dynamic ratio explanation */}
              <div className="p-4 rounded-xl bg-violet-500/[0.04] border border-violet-500/10">
                <div className="text-sm font-medium text-violet-400 mb-2">📊 动态比例说明</div>
                <div className="text-xs text-neutral-500 leading-relaxed space-y-1.5">
                  <p>• 赢家比例随参与人数增长，最高 60%</p>
                  <p>• 每轮至少保留 40% 奖池作为下一轮启动资金</p>
                  <p>• 结算时锁定最终比例</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
