import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { NORMAL_ROUND_CONFIG, LUCKY_ROUND_CONFIG, ANTI_SYBIL_CONFIG } from '@/config/contracts';

export function GameRules() {
  const [isExpanded, setIsExpanded] = useState(false);

  const coreRules = [
    { icon: '🧧', title: '普通红包', text: `燃烧${NORMAL_ROUND_CONFIG.fixedBurnAmount.toLocaleString()}代币参与，${ANTI_SYBIL_CONFIG.participantsRange[0]}~${ANTI_SYBIL_CONFIG.participantsRange[1]}人随机开奖，奖池50%独奖1人` },
    { icon: '💰', title: '金马红包', text: `每小时一轮，${LUCKY_ROUND_CONFIG.tokensPerTicket.toLocaleString()}代币=1张券，VRF抽${LUCKY_ROUND_CONFIG.winnersCount}位赢家` },
    { icon: '💎', title: '代币通缩', text: '所有燃烧代币直接进入黑洞地址，永久销毁，供应持续减少' },
    { icon: '🛡️', title: '防女巫', text: `每轮每钱包限1次 · 持币≥${ANTI_SYBIL_CONFIG.minHoldMinutes}分钟 · 开奖人数随机` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl bg-card border border-border overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-cny-gold">📜 游戏规则</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">· 燃烧代币 抢BNB红包</span>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {coreRules.map((rule, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-lg">{rule.icon}</span>
              <div className="text-xs font-bold text-foreground mt-1">{rule.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{rule.text}</div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 space-y-3">
              {/* 普通红包详情 */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="text-sm font-bold text-primary mb-2">🧧 普通红包规则</div>
                <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <p>• 固定燃烧 <span className="text-foreground font-bold">10,000 代币</span>参与</p>
                  <p>• 满 <span className="text-foreground font-bold">{NORMAL_ROUND_CONFIG.requiredParticipants} 人</span>自动开奖</p>
                  <p>• 奖池 <span className="text-cny-gold font-bold">{NORMAL_ROUND_CONFIG.poolDistributePercent}%</span> 全部奖给 <span className="text-cny-gold font-bold">1位幸运儿</span></p>
                  <p>• 剩余 {100 - NORMAL_ROUND_CONFIG.poolDistributePercent}% 奖池<span className="text-foreground font-bold">滚入下一轮</span>累积</p>
                  <p>• 代币直接转入黑洞地址<span className="text-primary font-bold">永久销毁</span></p>
                  <p>• Chainlink VRF 随机抽取唯一赢家</p>
                  <p>• BNB 自动到账，无需手动领取</p>
                </div>
              </div>

              {/* 金马红包详情 */}
              <div className="p-4 rounded-xl bg-cny-gold/5 border border-cny-gold/20">
                <div className="text-sm font-bold text-cny-gold mb-2">💰 金马红包规则</div>
                <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <p>• 每<span className="text-foreground font-bold">1小时</span>自动开一轮</p>
                  <p>• 每 <span className="text-foreground font-bold">{LUCKY_ROUND_CONFIG.tokensPerTicket.toLocaleString()} 代币</span> = <span className="text-cny-gold font-bold">1张抽奖券</span></p>
                  <p>• 买多少张都行，按比例计算中奖概率</p>
                  <p>• VRF 从所有券中随机抽出 <span className="text-cny-gold font-bold">{LUCKY_ROUND_CONFIG.winnersCount} 个赢家</span></p>
                  <p>• 赢家<span className="text-cny-gold font-bold">平分奖池BNB</span></p>
                  <p>• 未中奖者：代币已销毁（通缩贡献），无BNB奖励</p>
                </div>
              </div>

              {/* 防女巫机制 */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="text-sm font-bold text-emerald-400 mb-2">🛡️ 防女巫机制</div>
                <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <p>• 每轮每钱包<span className="text-foreground font-bold">限参与1次</span>，合约层面强制执行</p>
                  <p>• 持币时间 ≥ <span className="text-foreground font-bold">{ANTI_SYBIL_CONFIG.minHoldMinutes} 分钟</span>才可参与，防止临时转入</p>
                  <p>• 开奖人数<span className="text-foreground font-bold">随机浮动</span>（{ANTI_SYBIL_CONFIG.participantsRange[0]}~{ANTI_SYBIL_CONFIG.participantsRange[1]}人），无法精确霸榜</p>
                  <p>• 攻击者需大量资金分散到多钱包，<span className="text-emerald-400 font-bold">经济成本极高</span></p>
                  <p>• 通缩机制让攻击成本持续上升，越攻击代币越稀缺</p>
                </div>
              </div>

              {/* 安全保障 */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="text-sm font-bold text-foreground mb-2">🔒 安全保障</div>
                <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <p>• 合约基于 OpenZeppelin 安全库</p>
                  <p>• Chainlink VRF 保证随机性不可篡改</p>
                  <p>• 代币销毁地址硬编码，无法被修改</p>
                  <p>• 智能合约开源，所有数据链上可查</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
