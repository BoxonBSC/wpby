import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { NORMAL_ROUND_CONFIG, LUCKY_ROUND_CONFIG, ANTI_SYBIL_CONFIG, TAX_DISTRIBUTION } from '@/config/contracts';
import cnyBackground from '@/assets/cny-background.jpg';
import { FallingElements } from '@/components/hongbao/FallingElements';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function RulesPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${cnyBackground})` }} />
      <div className="fixed inset-0 z-0 bg-background/80" />
      <FallingElements />

      {/* Header */}
      <header className="relative z-10 border-b border-cny-gold/15 bg-background/50 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <motion.div {...fadeUp} className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl gold-shimmer font-display tracking-wider">🐴 马年红包 · 规则说明</h1>
          <p className="text-sm text-muted-foreground">燃烧代币，赢取 BNB 红包 — 一看就懂的完整玩法</p>
        </motion.div>

        {/* 一句话概述 */}
        <motion.section {...fadeUp} transition={{ delay: 0.1 }} className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">💡 一句话说明</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            马年红包是一个部署在 <span className="text-foreground font-semibold">BNB Chain</span> 上的链上红包游戏。
            你花费（销毁）一定数量的代币参与抽奖，赢家会获得 <span className="text-cny-gold font-bold">BNB 奖励</span>。
            销毁的代币会永久消失，让代币越来越稀缺、越来越值钱。
          </p>
        </motion.section>

        {/* 两种模式总览 */}
        <motion.section {...fadeUp} transition={{ delay: 0.15 }} className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">🎮 两种玩法</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="text-2xl">🧧</div>
              <div className="text-sm font-bold text-primary">普通红包（拼手气）</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                固定花费代币参与，凑够人数就开奖，<span className="text-foreground font-bold">1个人独吞大奖</span>。适合喜欢「搏一搏」的玩家。
              </p>
            </div>
            <div className="p-4 rounded-xl bg-cny-gold/5 border border-cny-gold/20 space-y-2">
              <div className="text-2xl">💰</div>
              <div className="text-sm font-bold text-cny-gold">金马红包（定时开奖）</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                每小时开一轮，买多少张券都行，<span className="text-foreground font-bold">3个赢家瓜分奖池</span>。券越多中奖几率越大。
              </p>
            </div>
          </div>
        </motion.section>

        {/* 普通红包详细规则 */}
        <motion.section {...fadeUp} transition={{ delay: 0.2 }} className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">🧧 普通红包 — 详细规则</h2>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
              <h3 className="text-foreground font-bold">📌 怎么参与？</h3>
              <p>
                每次参与需要销毁 <span className="text-cny-gold font-bold">{NORMAL_ROUND_CONFIG.fixedBurnAmount.toLocaleString()} 个代币</span>。
                点击「燃烧参与」按钮，代币会被发送到黑洞地址，永久消失 — 这就是「通缩」的来源。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
              <h3 className="text-foreground font-bold">🎯 什么时候开奖？</h3>
              <p>
                不是按时间，而是按人数！当参与人数达到阈值时自动开奖。
                为了防止有人恶意卡位操纵，每轮的开奖人数是 <span className="text-foreground font-bold">随机的</span>，
                在 <span className="text-cny-gold font-bold">{ANTI_SYBIL_CONFIG.participantsRange[0]}~{ANTI_SYBIL_CONFIG.participantsRange[1]} 人</span>之间浮动，
                由 Chainlink VRF（链上可验证随机数）决定，没人能提前知道。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
              <h3 className="text-foreground font-bold">🏆 奖金怎么分？</h3>
              <p>
                开奖时，当轮奖池的 <span className="text-cny-gold font-bold">{NORMAL_ROUND_CONFIG.poolDistributePercent}%</span> 会被拿出来发放：
              </p>
              <ul className="list-none space-y-1 ml-2">
                <li>• 其中 <span className="text-foreground font-bold">{NORMAL_ROUND_CONFIG.adminFeePercent}%</span> 作为管理手续费（用于支付 VRF 随机数等链上成本）</li>
                <li>• 剩余全部 BNB <span className="text-cny-gold font-bold">独奖给 1 位幸运赢家</span>，自动转到你的钱包</li>
              </ul>
              <p>
                另外 <span className="text-foreground font-bold">{100 - NORMAL_ROUND_CONFIG.poolDistributePercent}%</span> 的奖池会滚入下一轮继续累积，
                所以越晚开的轮次奖池越大！
              </p>
            </div>
          </div>
        </motion.section>

        {/* 金马红包详细规则 */}
        <motion.section {...fadeUp} transition={{ delay: 0.25 }} className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-lg font-bold text-cny-gold flex items-center gap-2">💰 金马红包 — 详细规则</h2>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
              <h3 className="text-foreground font-bold">📌 怎么参与？</h3>
              <p>
                每 <span className="text-cny-gold font-bold">{LUCKY_ROUND_CONFIG.tokensPerTicket.toLocaleString()} 个代币</span> = 1 张抽奖券。
                你可以一次买 1 张，也可以一次买很多张。
                买的券越多，中奖概率就越大 — 简单粗暴。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
              <h3 className="text-foreground font-bold">⏰ 什么时候开奖？</h3>
              <p>
                每 <span className="text-foreground font-bold">{LUCKY_ROUND_CONFIG.intervalMinutes} 分钟</span>（即每小时）自动开一轮。
                不管有多少人参与，到时间就开。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
              <h3 className="text-foreground font-bold">🏆 奖金怎么分？</h3>
              <p>
                Chainlink VRF 从所有抽奖券中随机抽出 <span className="text-cny-gold font-bold">{LUCKY_ROUND_CONFIG.winnersCount} 位赢家</span>，
                扣除 <span className="text-foreground font-bold">{LUCKY_ROUND_CONFIG.adminFeePercent}%</span> 管理手续费后，按以下比例分配：
              </p>
              <div className="flex gap-3 mt-2">
                <div className="flex-1 p-3 rounded-lg bg-cny-gold/10 border border-cny-gold/20 text-center">
                  <div className="text-lg">🥇</div>
                  <div className="text-xs text-muted-foreground">第1名</div>
                  <div className="text-base font-bold text-cny-gold">{LUCKY_ROUND_CONFIG.prizeDistribution[0]}%</div>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-cny-gold/10 border border-cny-gold/20 text-center">
                  <div className="text-lg">🥈</div>
                  <div className="text-xs text-muted-foreground">第2名</div>
                  <div className="text-base font-bold text-cny-gold">{LUCKY_ROUND_CONFIG.prizeDistribution[1]}%</div>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-cny-gold/10 border border-cny-gold/20 text-center">
                  <div className="text-lg">🥉</div>
                  <div className="text-xs text-muted-foreground">第3名</div>
                  <div className="text-base font-bold text-cny-gold">{LUCKY_ROUND_CONFIG.prizeDistribution[2]}%</div>
                </div>
              </div>
              <p className="mt-2">
                没中奖的玩家不会获得 BNB 奖励，但你销毁的代币已经为整个生态做了通缩贡献 💪
              </p>
            </div>
          </div>
        </motion.section>

        {/* 奖池来源 */}
        <motion.section {...fadeUp} transition={{ delay: 0.3 }} className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">💎 奖池里的 BNB 哪来的？</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              代币每一笔交易（买入/卖出）都会收取一定的交易税。这些税费自动转换为 BNB，然后按比例注入两个奖池：
            </p>
            <div className="flex gap-4 mt-3">
              <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <div className="text-2xl">🧧</div>
                <div className="text-xs text-muted-foreground mt-1">普通红包池</div>
                <div className="text-lg font-bold text-primary">{TAX_DISTRIBUTION.normalPoolPercent}%</div>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-cny-gold/5 border border-cny-gold/20 text-center">
                <div className="text-2xl">💰</div>
                <div className="text-xs text-muted-foreground mt-1">金马红包池</div>
                <div className="text-lg font-bold text-cny-gold">{TAX_DISTRIBUTION.luckyPoolPercent}%</div>
              </div>
            </div>
            <p className="mt-2">
              也就是说：<span className="text-foreground font-semibold">交易越多 → 税收越多 → 奖池越大 → 更多人参与 → 代币销毁更多 → 代币更稀缺</span>。
              这是一个正向飞轮 🔄
            </p>
          </div>
        </motion.section>

        {/* 防女巫 */}
        <motion.section {...fadeUp} transition={{ delay: 0.35 }} className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">🛡️ 公平性保障（防作弊机制）</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>我们知道你担心有人「开挂」或者「多钱包刷奖」，所以有以下保障：</p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <div className="text-foreground font-bold text-xs mb-1">🔒 每钱包限参与 1 次</div>
                <p className="text-xs">每一轮，每个钱包地址只能参与 1 次，合约层面强制执行，没有例外。</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <div className="text-foreground font-bold text-xs mb-1">⏳ 持币时间门槛</div>
                <p className="text-xs">
                  你必须持有代币至少 <span className="text-foreground font-bold">{ANTI_SYBIL_CONFIG.minHoldMinutes} 分钟</span> 才能参与。
                  这意味着不能临时从别的钱包转币进来「插队」。
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <div className="text-foreground font-bold text-xs mb-1">🎲 随机开奖人数</div>
                <p className="text-xs">
                  普通红包的开奖人数不是固定的 100 人，而是 {ANTI_SYBIL_CONFIG.participantsRange[0]}~{ANTI_SYBIL_CONFIG.participantsRange[1]} 人随机浮动。
                  你没法精确控制「第几个人进来就开奖」，防止有人卡位。
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <div className="text-foreground font-bold text-xs mb-1">💸 作弊成本极高</div>
                <p className="text-xs">
                  攻击者需要准备大量钱包，每个钱包都要持币 {ANTI_SYBIL_CONFIG.minHoldMinutes} 分钟以上，还要付大量代币（全部销毁）。
                  而且通缩机制让代币越来越贵，作弊成本只会越来越高。
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 安全保障 */}
        <motion.section {...fadeUp} transition={{ delay: 0.4 }} className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">🔐 技术安全</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <div className="text-foreground font-bold text-xs mb-1">✅ Chainlink VRF</div>
                <p className="text-xs">随机数由预言机在链上生成，开发者也无法篡改结果。</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <div className="text-foreground font-bold text-xs mb-1">✅ 合约开源</div>
                <p className="text-xs">智能合约代码完全公开，任何人都可以审查验证。</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <div className="text-foreground font-bold text-xs mb-1">✅ 黑洞地址销毁</div>
                <p className="text-xs">代币销毁地址硬编码在合约中，不可修改，确保真正通缩。</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <div className="text-foreground font-bold text-xs mb-1">✅ OpenZeppelin 安全库</div>
                <p className="text-xs">合约基于业界最权威的安全库构建，久经考验。</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section {...fadeUp} transition={{ delay: 0.45 }} className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">❓ 常见问题</h2>
          <div className="space-y-3 text-sm">
            {[
              { q: '参与后代币能退回来吗？', a: '不能。代币一旦销毁就永久消失，这正是通缩机制的核心。请根据自己的承受能力参与。' },
              { q: '中奖后 BNB 需要手动领取吗？', a: '不需要！中奖后 BNB 会自动发送到你的钱包地址，无需任何操作。' },
              { q: '我可以用多个钱包参与同一轮吗？', a: '技术上可以，但每个钱包都需要独立持币满 10 分钟，而且每次参与的代币都会被销毁。成本很高，不划算。' },
              { q: '奖池会不会被掏空？', a: '普通红包每轮只发放奖池的 50%，另外 50% 永远留着滚入下轮。所以奖池只会越来越大。' },
              { q: '手续费是做什么用的？', a: `每种红包各收取 ${NORMAL_ROUND_CONFIG.adminFeePercent}% 的手续费，主要用于支付 Chainlink VRF 等链上运营成本，确保游戏持续运行。` },
            ].map((faq, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/20 border border-border">
                <div className="text-foreground font-bold text-xs mb-1">Q: {faq.q}</div>
                <p className="text-xs text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.5 }} className="text-center py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 cny-button text-foreground text-sm"
          >
            🧧 回去抢红包
          </Link>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-cny-gold/10 mt-8 py-6 text-center text-xs text-cny-cream/40">
        <p>🐴 马年红包 · 部署在 BNB Chain · 合约开源可查</p>
      </footer>
    </div>
  );
}
