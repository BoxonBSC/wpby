import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { AdvancedRewardTiers } from '@/components/AdvancedRewardTiers';
import { 
  Gamepad2, 
  Wallet, 
  Ticket,
  TrendingUp, 
  Shield, 
  HelpCircle,
  ExternalLink,
  Coins,
  Trophy,
  Zap,
  Target,
  Gift,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const Rules = () => {
  return (
    <div className="min-h-screen bg-background cyber-grid relative">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-50" />
      <div className="fixed inset-0 bg-gradient-to-b from-neon-purple/5 via-transparent to-neon-blue/5 pointer-events-none" />
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display neon-text-cyan mb-2">
            🎰 游戏规则说明
          </h1>
          <p className="text-muted-foreground">一分钟看懂 Cyber Slots 怎么玩</p>
        </motion.div>

        {/* 游戏简介 - 通俗易懂版 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card mb-6"
        >
          <h2 className="text-xl font-display neon-text-yellow flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5" />
            这是什么游戏？
          </h2>
          <div className="text-muted-foreground space-y-3">
            <p className="text-foreground text-lg">
              简单来说：<span className="text-neon-cyan">用代币换凭证</span> → <span className="text-neon-purple">用凭证玩老虎机</span> → <span className="text-neon-green">中奖赢 BNB</span>
            </p>
            <div className="neon-border-green rounded-lg p-4 bg-neon-green/5">
              <p className="text-neon-green font-display mb-2">💰 核心亮点：100% 资金返还玩家，零平台抽成！</p>
              <div className="text-sm space-y-2">
                <p>你投入的代币会通过交易税自动转化为奖池资金，资金分配如下：</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 rounded bg-neon-green/10 border border-neon-green/30 text-center">
                    <div className="text-neon-green font-display text-lg">95%</div>
                    <div className="text-xs text-muted-foreground">进入奖池</div>
                    <div className="text-xs text-neon-green">玩家中奖分配</div>
                  </div>
                  <div className="p-2 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-center">
                    <div className="text-neon-cyan font-display text-lg">5%</div>
                    <div className="text-xs text-muted-foreground">VRF Gas费</div>
                    <div className="text-xs text-neon-cyan">Chainlink预言机</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 5% 用于 Chainlink VRF 2.5 预言机服务，保障每次游戏的随机数生成
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 详细步骤 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cyber-card"
          >
            <h2 className="text-xl font-display neon-text-blue flex items-center gap-2 mb-4">
              <Gamepad2 className="w-5 h-5" />
              怎么玩？（4步走）
            </h2>

            <div className="space-y-4">
              {/* 步骤1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg neon-border flex items-center justify-center bg-muted/30">
                    <Wallet className="w-5 h-5 text-neon-blue" />
                  </div>
                </div>
                <div>
                  <div className="font-display text-foreground mb-1 flex items-center gap-2">
                    1. 连接钱包
                    <span className="text-xs px-2 py-0.5 rounded bg-neon-blue/20 text-neon-blue">必须</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>选择你常用的钱包连接到 BNB Smart Chain 网络：</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#E2761B]/10 border border-[#E2761B]/30 text-xs">
                        🦊 MetaMask
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 border border-white/30 text-xs">
                        ⬛ OKX Wallet
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F3BA2F]/10 border border-[#F3BA2F]/30 text-xs">
                        🟡 币安钱包
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#2980FE]/10 border border-[#2980FE]/30 text-xs">
                        🔵 TokenPocket
                      </span>
                    </div>
                    <p className="text-neon-cyan text-xs">
                      💡 没有钱包？推荐下载 MetaMask 或 TokenPocket
                    </p>
                  </div>
                </div>
              </div>

              {/* 步骤2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg neon-border-purple flex items-center justify-center bg-muted/30">
                    <Ticket className="w-5 h-5 text-neon-purple" />
                  </div>
                </div>
                <div>
                  <div className="font-display text-foreground mb-1 flex items-center gap-2">
                    2. 兑换游戏凭证
                    <span className="text-xs px-2 py-0.5 rounded bg-neon-purple/20 text-neon-purple">重要</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>用你的代币兑换游戏凭证，<span className="text-neon-yellow">1:1 兑换</span>，比如：</p>
                    <p className="text-neon-cyan">100,000 代币 → 100,000 凭证</p>
                    <p className="text-xs">⚠️ 凭证只能用于游戏，不能转让或提现</p>
                  </div>
                </div>
              </div>

              {/* 步骤3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg neon-border-cyan flex items-center justify-center bg-muted/30">
                    <Target className="w-5 h-5 text-neon-cyan" />
                  </div>
                </div>
                <div>
                  <div className="font-display text-foreground mb-1">3. 选择投注金额</div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>最低 <span className="text-neon-yellow font-display">20,000 凭证</span> 起投，可选择更高金额：</p>
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      <div className="p-2 rounded bg-muted/30 text-center">
                        <div className="text-foreground">20K</div>
                        <div className="text-muted-foreground">1x</div>
                      </div>
                      <div className="p-2 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-center">
                        <div className="text-neon-cyan">50K</div>
                        <div className="text-neon-green">2.5x</div>
                      </div>
                      <div className="p-2 rounded bg-neon-purple/10 border border-neon-purple/30 text-center">
                        <div className="text-neon-purple">100K</div>
                        <div className="text-neon-green">5x</div>
                      </div>
                      <div className="p-2 rounded bg-neon-yellow/10 border border-neon-yellow/30 text-center">
                        <div className="text-neon-yellow">200K</div>
                        <div className="text-neon-green">10x</div>
                      </div>
                      <div className="p-2 rounded bg-neon-yellow/20 border border-neon-yellow/50 text-center">
                        <div className="text-neon-yellow">500K</div>
                        <div className="text-neon-green">20x</div>
                      </div>
                    </div>
                    <p className="text-neon-green">💡 投注越高，中奖概率越大！500K投注有20倍概率加成！</p>
                  </div>
                </div>
              </div>

              {/* 步骤4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg neon-border-green flex items-center justify-center bg-muted/30">
                    <Gamepad2 className="w-5 h-5 text-neon-green" />
                  </div>
                </div>
                <div>
                  <div className="font-display text-foreground mb-1">4. 开始游戏！</div>
                  <div className="text-sm text-muted-foreground">
                    点击"开始"按钮，5个转轮会开始转动。每个轮子停止后显示一个符号，
                    <span className="text-neon-yellow">根据5个符号中相同符号的数量判定中奖！</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 中奖规则 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cyber-card"
          >
            <h2 className="text-xl font-display neon-text-purple flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5" />
              怎么算中奖？
            </h2>

            <div className="space-y-4">
              {/* 基本规则 */}
              <div className="neon-border rounded-lg p-4 bg-muted/20">
                <h3 className="font-display text-neon-cyan mb-2">🎯 基本规则</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span>游戏有 <span className="text-neon-cyan">5个转轮</span>，每轮产生 <span className="text-neon-cyan">1个符号</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span>根据 <span className="text-neon-purple">5个符号中相同符号的数量</span> 判定中奖</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span><span className="text-neon-yellow">3个以上相同符号</span> 就算中奖</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span>界面显示3行，但只有 <span className="text-neon-green">中间行（高亮行）</span> 是实际结果</span>
                  </li>
                </ul>
              </div>

              {/* 奖励等级简化版 */}
              <div className="neon-border-yellow rounded-lg p-4 bg-neon-yellow/5">
                <h3 className="font-display text-neon-yellow mb-3">🏆 奖励等级（从高到低）</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-2 rounded bg-neon-yellow/10">
                    <span>🎰</span>
                    <span className="text-neon-yellow font-display flex-1">超级头奖</span>
                    <span className="text-foreground">5个全是7️⃣</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">奖池50%</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-neon-purple/10">
                    <span>💎</span>
                    <span className="text-neon-purple font-display flex-1">头奖</span>
                    <span className="text-foreground">5个💎 或 4个7️⃣</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">奖池25%</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                    <span>👑</span>
                    <span className="text-foreground font-display flex-1">一等奖</span>
                    <span className="text-muted-foreground">任意5个相同</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">奖池13%</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                    <span>🔔</span>
                    <span className="text-foreground font-display flex-1">二等奖</span>
                    <span className="text-muted-foreground">4个稀有符号相同</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">奖池5%</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                    <span>⭐</span>
                    <span className="text-foreground font-display flex-1">三等奖</span>
                    <span className="text-muted-foreground">4个普通符号相同</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">奖池1.7%</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                    <span>🍀</span>
                    <span className="text-foreground font-display flex-1">小奖</span>
                    <span className="text-muted-foreground">任意3个相同</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">奖池0.5%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * 单次最大派奖不超过奖池的50%
                </p>
              </div>

              {/* 举例说明 */}
              <div className="neon-border-green rounded-lg p-4 bg-neon-green/5">
                <h3 className="font-display text-neon-green mb-2">📖 举个例子</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    假设当前奖池有 <span className="text-neon-yellow font-display">10 BNB</span>，你投注后开出 [7️⃣ 💎 7️⃣ 7️⃣ 7️⃣]，
                    其中有4个7️⃣，中了<span className="text-neon-purple">头奖</span>！
                  </p>
                  <p>
                    奖金计算：10 × 25% = <span className="text-neon-green font-display">2.5 BNB</span>（扣除5%运营费后实得约 2.375 BNB）
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 符号说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 cyber-card"
        >
          <h2 className="text-xl font-display neon-text-cyan flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5" />
            符号说明
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="neon-border-yellow rounded-lg p-4 bg-neon-yellow/5 text-center">
              <div className="text-3xl mb-2">7️⃣ 💎</div>
              <div className="font-display text-neon-yellow">传说符号</div>
              <div className="text-xs text-muted-foreground mt-1">最稀有，基础概率约1-2%</div>
            </div>
            <div className="neon-border-purple rounded-lg p-4 bg-neon-purple/5 text-center">
              <div className="text-3xl mb-2">👑 🔔 ⭐</div>
              <div className="font-display text-neon-purple">史诗符号</div>
              <div className="text-xs text-muted-foreground mt-1">较稀有，基础概率约3-5%</div>
            </div>
            <div className="neon-border-cyan rounded-lg p-4 bg-neon-cyan/5 text-center">
              <div className="text-3xl mb-2">🍒 🍋 🍊</div>
              <div className="font-display text-neon-cyan">稀有符号</div>
              <div className="text-xs text-muted-foreground mt-1">基础概率约17%</div>
            </div>
            <div className="neon-border rounded-lg p-4 bg-muted/20 text-center">
              <div className="text-3xl mb-2">🍇 🍀</div>
              <div className="font-display text-foreground">普通符号</div>
              <div className="text-xs text-muted-foreground mt-1">基础概率约17%</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            💡 投注越高，稀有符号出现概率越大！500K投注时稀有符号概率提升20倍
          </p>
        </motion.div>

        {/* 安全与公平性 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 cyber-card"
        >
          <h2 className="text-xl font-display neon-text-green flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            为什么公平？
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="neon-border rounded-lg p-4 bg-muted/20">
              <h3 className="font-display text-neon-cyan mb-2">🔗 Chainlink VRF 2.5 随机数</h3>
              <p className="text-sm text-muted-foreground">
                我们使用最新的 Chainlink VRF 2.5（可验证随机函数）生成每次游戏的随机结果。
                <span className="text-neon-yellow">这意味着：</span>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• 没有人能预测或操控结果</li>
                <li>• 每个随机数都可以在链上验证</li>
                <li>• 完全透明，任何人都能审计</li>
                <li className="text-neon-cyan">• 支持 BNB 原生支付（无需 LINK）</li>
              </ul>
              <div className="mt-3 p-2 rounded bg-neon-cyan/10 border border-neon-cyan/30">
                <p className="text-xs text-neon-cyan">
                  💡 奖池的 5% 会自动用于 VRF 预言机 Gas 费充值，确保服务持续运行
                </p>
              </div>
              <a 
                href="https://chain.link/vrf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-neon-blue hover:underline mt-2"
              >
                了解 Chainlink VRF <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="neon-border-purple rounded-lg p-4 bg-muted/20">
              <h3 className="font-display text-neon-purple mb-2">📜 智能合约自动执行</h3>
              <p className="text-sm text-muted-foreground">
                所有游戏逻辑都在智能合约中运行：
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• 代码开源，任何人可审计</li>
                <li>• 凭证消耗、奖励发放全自动</li>
                <li>• 没有人能修改规则或作弊</li>
                <li>• 奖池资金锁定在合约中</li>
              </ul>
              <a 
                href="#" 
                className="inline-flex items-center gap-1 text-sm text-neon-purple hover:underline mt-2"
              >
                查看智能合约 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 cyber-card"
        >
          <h2 className="text-xl font-display neon-text-pink flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5" />
            常见问题
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="neon-border-pink rounded-lg p-4 bg-neon-pink/5">
              <h3 className="font-display text-foreground mb-2">代币兑换凭证后能退回吗？</h3>
              <p className="text-sm text-muted-foreground">
                不能。凭证是一次性的游戏筹码，兑换后只能用于游戏，不能转让或退回。请根据自己的需求合理兑换。
              </p>
            </div>
            <div className="neon-border-pink rounded-lg p-4 bg-neon-pink/5">
              <h3 className="font-display text-neon-yellow mb-2">💰 奖池的钱从哪来？</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="text-foreground">
                  奖池资金来源于 <span className="text-neon-green font-display">交易税的 3%</span>！
                </p>
                <p>
                  每一笔代币交易（买入/卖出）都会产生交易税，其中 <span className="text-neon-cyan">3%</span> 会自动进入游戏奖池，用于奖励中奖玩家。
                </p>
                <div className="neon-border-pink rounded p-2 bg-neon-pink/10 mt-2">
                  <p className="text-xs">
                    <span className="text-neon-purple">工作原理：</span>交易税 → 自动兑换为 BNB → 注入奖池合约
                  </p>
                </div>
                <p className="text-neon-green text-xs">
                  ✨ 交易越活跃，奖池越大，中奖奖励越多！
                </p>
              </div>
            </div>
            <div className="neon-border-pink rounded-lg p-4 bg-neon-pink/5">
              <h3 className="font-display text-foreground mb-2">为什么要用凭证而不是直接用代币？</h3>
              <p className="text-sm text-muted-foreground">
                凭证系统可以减少链上交易次数，节省 Gas 费。你可以一次兑换大量凭证，然后多次游戏，体验更流畅。
              </p>
            </div>
            <div className="neon-border-pink rounded-lg p-4 bg-neon-pink/5">
              <h3 className="font-display text-foreground mb-2">投注越高真的概率越大吗？</h3>
              <p className="text-sm text-muted-foreground">
                是的！高投注会增加稀有符号（如7️⃣💎）的出现概率。500K投注相比20K有20倍的概率加成，但请量力而行。
              </p>
            </div>
          </div>
        </motion.div>

        {/* 详细赔付表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <h2 className="text-xl font-display neon-text-purple flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5" />
            完整赔付表
          </h2>
          <AdvancedRewardTiers />
        </motion.div>
      </main>
    </div>
  );
};

export default Rules;
