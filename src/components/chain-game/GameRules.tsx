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
    { icon: '🔥', title: '代币销毁', text: '出价代币直接转入黑洞地址（0x...dEaD），永久销毁，不可逆' },
    { icon: '📈', title: '递增出价', text: '最低10,000代币起，每次必须严格高于当前最高出价' },
    { icon: '⏰', title: '30分钟一轮', text: 'Chainlink Automation 自动结算，零人工干预' },
    { icon: '🏆', title: '最高出价者赢', text: '倒计时归零时最高出价者赢得奖池BNB，自动到账' },
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

              {/* 出价规则 */}
              <div className="p-4 rounded-xl bg-blue-500/[0.04] border border-blue-500/10">
                <div className="text-sm font-medium text-blue-400 mb-2">📜 出价规则</div>
                <div className="text-xs text-neutral-500 leading-relaxed space-y-1.5">
                  <p>• 最低出价：<span className="text-white font-semibold">10,000 代币</span>起</p>
                  <p>• 每次出价必须<span className="text-white font-semibold">严格高于</span>当前最高出价</p>
                  <p>• 同一玩家可多次出价，不断抬高门槛</p>
                  <p>• 所有出价代币直接转入黑洞地址（0x...dEaD），<span className="text-red-400 font-semibold">永久销毁，不可逆</span></p>
                  <p>• 倒计时归零时，最后的最高出价者即为本轮赢家</p>
                </div>
              </div>

              {/* Dynamic tiers */}
              <div className="p-4 rounded-xl bg-violet-500/[0.04] border border-violet-500/10">
                <div className="flex items-center gap-2 text-sm font-medium text-violet-400 mb-3">
                  <Zap className="w-4 h-4" />
                  动态奖金分成（核心机制）
                </div>
                <div className="text-xs text-neutral-500 mb-3">
                  赢家并非拿走全部奖池！奖金比例根据本轮参与人数<span className="text-violet-400 font-semibold">动态递增</span>：
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {CHAIN_GAME_DYNAMIC_TIERS.map((tier, index) => {
                    const isActive = tier.winnerRate === currentTier.winnerRate;
                    const tierGross = prizePoolBNB * tier.winnerRate / 100;
                    const tierNet = (tierGross - tierGross * platformFee / 100).toFixed(4);
                    const rollover = (100 - tier.winnerRate);
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
                          赢家 {tier.winnerRate}%
                        </div>
                        <div className="text-[10px] text-neutral-600">滚入下轮 {rollover}%</div>
                        <div className="text-[10px] text-emerald-500 mt-0.5">≈ {tierNet} BNB</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[11px] text-neutral-600 mt-3 leading-relaxed">
                  * 5% 平台手续费从赢家奖金中扣除，非从奖池扣除
                </div>
              </div>

              {/* 奖金计算示例 */}
              <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/10">
                <div className="text-sm font-medium text-amber-400 mb-2">🧮 奖金计算示例</div>
                <div className="text-xs text-neutral-500 leading-relaxed space-y-1.5">
                  <p>假设奖池有 <span className="text-amber-400 font-bold">1 BNB</span>，本轮有 <span className="text-amber-400 font-bold">25人</span> 参与：</p>
                  <p>• 赢家比例 = 48%（21-30人档位）</p>
                  <p>• 赢家毛奖金 = 1 × 48% = <span className="text-white font-semibold">0.48 BNB</span></p>
                  <p>• 平台手续费 = 0.48 × 5% = <span className="text-neutral-400">0.024 BNB</span></p>
                  <p>• 赢家实际到手 = 0.48 - 0.024 = <span className="text-emerald-400 font-bold">0.456 BNB ✅</span></p>
                  <p>• 剩余 0.52 BNB 自动滚入下一轮奖池 🔄</p>
                </div>
                <div className="text-[11px] text-neutral-600 mt-2">
                  人越多赢得越多！每轮至少保留 40% 确保奖池永不枯竭
                </div>
              </div>

              {/* Settlement mechanism */}
              <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10">
                <div className="text-sm font-medium text-emerald-400 mb-2">💰 结算与发放机制</div>
                <div className="text-xs text-neutral-500 leading-relaxed space-y-1.5">
                  <p>• Chainlink Automation 自动触发结算，<span className="text-white font-semibold">零人工干预</span></p>
                  <p>• 奖金自动转入赢家钱包，无需手动操作</p>
                  <p>• 若自动转账失败（极少数情况），赢家可通过合约<span className="text-emerald-400 font-semibold">手动领取（claimRewards）</span></p>
                  <p>• 平台手续费（5%）结算时同步发放</p>
                  <p>• 结算完成后，新一轮<span className="text-white font-semibold">立即自动开启</span></p>
                </div>
              </div>

              {/* 通缩价值 */}
              <div className="p-4 rounded-xl bg-red-500/[0.04] border border-red-500/10">
                <div className="text-sm font-medium text-red-400 mb-2">🔥 通缩价值</div>
                <div className="text-xs text-neutral-500 leading-relaxed space-y-1.5">
                  <p>• 每一次出价都在<span className="text-red-400 font-semibold">永久销毁</span>代币，供应量持续减少</p>
                  <p>• 出价越高越安全，但成本也越高，需权衡时机</p>
                  <p>• 滚动奖池机制：未被领走的奖金自动累积，奖池越来越大</p>
                </div>
              </div>

              {/* 安全保障 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-sm font-medium text-neutral-300 mb-2">🔒 安全保障</div>
                <div className="text-xs text-neutral-500 leading-relaxed space-y-1.5">
                  <p>• 合约基于 OpenZeppelin 安全库（防重入 + 可暂停）</p>
                  <p>• Chainlink Automation 去中心化自动结算</p>
                  <p>• 代币销毁地址硬编码，无法被修改</p>
                  <p>• 智能合约开源，所有数据链上可查，无法篡改</p>
                  <p>• 紧急情况下可暂停合约保护资金安全</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
