import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { 
  Gamepad2, 
  Wallet, 
  TrendingUp, 
  Shield, 
  HelpCircle,
  Trophy,
  Zap,
  Target,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Coins,
  Flame,
  Crown,
  AlertCircle,
  ArrowRight,
  Gift,
  Clock,
  Sparkles,
  Equal,
  HandCoins,
  CircleDollarSign,
  Percent,
  Info
} from 'lucide-react';
import { BET_TIERS, REWARD_TIERS } from '@/config/hilo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Rules = () => {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(180deg, #0f0c07 0%, #0a0908 100%)',
      }}
    >
      {/* 背景装饰 */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(201, 163, 71, 0.1) 0%, transparent 50%)',
        }}
      />
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-12">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              fontFamily: '"Cinzel", "Noto Serif SC", serif',
              letterSpacing: '0.1em',
              background: 'linear-gradient(135deg, #FFD700 0%, #C9A347 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            游戏完整指南
          </h1>
          <p className="text-[#C9A347]/70 text-lg max-w-2xl mx-auto">
            三分钟看懂王牌博弈，轻松上手赢取 BNB 奖励
          </p>
        </motion.div>

        {/* 一句话介绍 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div 
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(201, 163, 71, 0.1) 100%)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
            }}
          >
            <p className="text-xl md:text-2xl text-[#FFD700] font-bold mb-2">
              🎯 游戏核心：猜下一张牌比当前牌「更大」还是「更小」
            </p>
            <p className="text-[#C9A347]/80">
              猜对连胜越多 → 奖励越高 → 最高可赢取整个奖池！
            </p>
          </div>
        </motion.div>

        {/* 游戏流程详解 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-8"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
            border: '1px solid rgba(201, 163, 71, 0.25)',
          }}
        >
          <h2 
            className="text-2xl font-bold text-[#FFD700] flex items-center gap-3 mb-6"
            style={{ fontFamily: '"Cinzel", "Noto Serif SC", serif' }}
          >
            <Gamepad2 className="w-6 h-6" />
            游戏流程详解
          </h2>

          <div className="space-y-6">
            {/* 步骤1 */}
            <div className="flex gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold"
                style={{ background: 'linear-gradient(135deg, #C9A347 0%, #8B7355 100%)', color: '#000' }}
              >
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#FFD700] mb-2 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  准备凭证
                </h3>
                <div className="bg-black/30 rounded-xl p-4 space-y-3">
                  <p className="text-[#C9A347]/90">
                    <strong className="text-[#FFD700]">什么是凭证？</strong> 凭证是游戏内的虚拟货币，用王牌博弈代币兑换获得。
                  </p>
                  <div className="flex items-center gap-2 text-[#C9A347]/80 text-sm">
                    <ArrowRight className="w-4 h-4 text-[#FFD700]" />
                    <span>点击顶部「兑换凭证」按钮，用代币兑换凭证</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#C9A347]/80 text-sm">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>兑换后代币会被<strong className="text-orange-400">永久燃烧</strong>，凭证只能用于游戏</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 步骤2 */}
            <div className="flex gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold"
                style={{ background: 'linear-gradient(135deg, #C9A347 0%, #8B7355 100%)', color: '#000' }}
              >
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#FFD700] mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  选择门槛等级
                </h3>
                <div className="bg-black/30 rounded-xl p-4 space-y-3">
                  <p className="text-[#C9A347]/90">
                    <strong className="text-[#FFD700]">门槛等级决定你能走多远！</strong> 不同门槛对应不同的最高连胜上限。
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                    {BET_TIERS.map((tier) => (
                      <div 
                        key={tier.id}
                        className="p-2 rounded-lg text-center text-sm"
                        style={{ background: `${tier.color}20`, border: `1px solid ${tier.color}40` }}
                      >
                        <div className="font-bold" style={{ color: tier.color }}>{tier.name}</div>
                        <div className="text-[#C9A347]/60 text-xs">{tier.betAmount >= 1000000 ? `${tier.betAmount / 1000000}M` : `${tier.betAmount / 1000}K`} 凭证</div>
                        <div className="text-[#FFD700] text-xs">最高{tier.maxStreak}连胜</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 text-[#C9A347]/70 text-sm mt-2 bg-[#FFD700]/5 p-3 rounded-lg">
                    <Info className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-[#FFD700]">新手建议：</strong>先从青铜开始熟悉玩法，等熟练后再挑战更高门槛
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 步骤3 */}
            <div className="flex gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold"
                style={{ background: 'linear-gradient(135deg, #C9A347 0%, #8B7355 100%)', color: '#000' }}
              >
                3
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#FFD700] mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  开始游戏
                </h3>
                <div className="bg-black/30 rounded-xl p-4 space-y-4">
                  <p className="text-[#C9A347]/90">
                    系统自动发一张牌，你需要猜下一张牌和当前牌的大小关系：
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <ChevronUp className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-green-400">猜更大</span>
                      </div>
                      <p className="text-sm text-[#C9A347]/70">
                        你认为下一张牌的点数比当前牌<strong className="text-green-400">更大</strong>
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <ChevronDown className="w-5 h-5 text-red-400" />
                        <span className="font-bold text-red-400">猜更小</span>
                      </div>
                      <p className="text-sm text-[#C9A347]/70">
                        你认为下一张牌的点数比当前牌<strong className="text-red-400">更小</strong>
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Equal className="w-5 h-5 text-[#00D4FF]" />
                        <span className="font-bold text-[#00D4FF]">猜相同</span>
                      </div>
                      <p className="text-sm text-[#C9A347]/70">
                        你认为下一张牌点数<strong className="text-[#00D4FF]">一样大</strong>（高风险高回报）
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#C9A347]/10 p-3 rounded-lg">
                    <p className="text-sm text-[#C9A347]/80">
                      <strong className="text-[#FFD700]">🃏 牌面大小：</strong>
                      A(最小) &lt; 2 &lt; 3 &lt; 4 &lt; 5 &lt; 6 &lt; 7 &lt; 8 &lt; 9 &lt; 10 &lt; J &lt; Q &lt; K(最大)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 步骤4 */}
            <div className="flex gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold"
                style={{ background: 'linear-gradient(135deg, #C9A347 0%, #8B7355 100%)', color: '#000' }}
              >
                4
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#FFD700] mb-2 flex items-center gap-2">
                  <HandCoins className="w-5 h-5" />
                  收手或继续
                </h3>
                <div className="bg-black/30 rounded-xl p-4 space-y-3">
                  <p className="text-[#C9A347]/90">
                    <strong className="text-[#FFD700]">猜对了？</strong> 恭喜！你有两个选择：
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-green-400">立即收手</span>
                      </div>
                      <p className="text-sm text-[#C9A347]/70">
                        点击「收手」按钮，锁定当前连胜对应的 BNB 奖励，落袋为安！
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-[#FFD700]" />
                        <span className="font-bold text-[#FFD700]">继续挑战</span>
                      </div>
                      <p className="text-sm text-[#C9A347]/70">
                        继续猜下一张，连胜越高奖励越多，但猜错就全没了！
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-red-400/90 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>猜错了？</strong> 游戏结束，本局投入的凭证全部损失，不获得任何奖励。记得见好就收！
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 奖励机制详解 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-8"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
            border: '1px solid rgba(201, 163, 71, 0.25)',
          }}
        >
          <h2 
            className="text-2xl font-bold text-[#FFD700] flex items-center gap-3 mb-6"
            style={{ fontFamily: '"Cinzel", "Noto Serif SC", serif' }}
          >
            <Trophy className="w-6 h-6" />
            奖励机制详解
          </h2>

          {/* 奖励计算公式 */}
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-[#FFD700]/10 to-[#C9A347]/5 border border-[#FFD700]/30">
            <h3 className="text-lg font-bold text-[#FFD700] mb-3 flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5" />
              奖励计算公式
            </h3>
            <div className="text-center py-4">
              <div className="inline-block bg-black/40 rounded-xl px-6 py-3">
                <span className="text-2xl font-bold text-[#FFD700]">你的奖励</span>
                <span className="text-2xl text-[#C9A347] mx-3">=</span>
                <span className="text-2xl font-bold text-green-400">当前奖池</span>
                <span className="text-2xl text-[#C9A347] mx-3">×</span>
                <span className="text-2xl font-bold text-[#00D4FF]">连胜对应百分比</span>
              </div>
            </div>
            <p className="text-center text-[#C9A347]/70 text-sm mt-2">
              例如：奖池 10 BNB，你达成 5 连胜（0.25%），奖励 = 10 × 0.25% = 0.025 BNB
            </p>
          </div>

          {/* 连胜奖励表 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#C9A347] mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5" />
              完整连胜奖励表（20级）
            </h3>
            
            <div className="space-y-4">
              {/* 常见区 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400 font-bold">🌱 入门区（1-5连胜）</span>
                  <span className="text-xs text-gray-500">- 青铜玩家可达</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {REWARD_TIERS.slice(0, 5).map((tier) => (
                    <div 
                      key={tier.streak}
                      className={`p-2 rounded-lg text-center ${tier.milestone ? 'ring-2 ring-[#CD7F32]' : ''}`}
                      style={{ background: 'rgba(107, 114, 128, 0.2)', border: '1px solid rgba(107, 114, 128, 0.3)' }}
                    >
                      <div className="text-white font-bold">{tier.streak}连胜</div>
                      <div className="text-[#FFD700] text-lg font-bold">{tier.percentage}%</div>
                      {tier.milestone && <div className="text-xs text-[#CD7F32]">🥉 {tier.milestone.label}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 进阶区 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-300 font-bold">⚡ 进阶区（6-10连胜）</span>
                  <span className="text-xs text-gray-500">- 白银玩家可达8连胜</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {REWARD_TIERS.slice(5, 10).map((tier) => (
                    <div 
                      key={tier.streak}
                      className={`p-2 rounded-lg text-center ${tier.milestone ? 'ring-2 ring-[#C0C0C0]' : ''}`}
                      style={{ background: 'rgba(192, 192, 192, 0.15)', border: '1px solid rgba(192, 192, 192, 0.3)' }}
                    >
                      <div className="text-white font-bold">{tier.streak}连胜</div>
                      <div className="text-[#FFD700] text-lg font-bold">{tier.percentage}%</div>
                      {tier.milestone && <div className="text-xs text-[#C0C0C0]">🥈 {tier.milestone.label}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 精英区 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#FFD700] font-bold">🔥 精英区（11-15连胜）</span>
                  <span className="text-xs text-[#FFD700]/60">- 黄金玩家可达12连胜</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {REWARD_TIERS.slice(10, 15).map((tier) => (
                    <div 
                      key={tier.streak}
                      className={`p-2 rounded-lg text-center ${tier.milestone ? 'ring-2 ring-[#FFD700]' : ''}`}
                      style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)' }}
                    >
                      <div className="text-white font-bold">{tier.streak}连胜</div>
                      <div className="text-[#FFD700] text-lg font-bold">{tier.percentage}%</div>
                      {tier.milestone && <div className="text-xs text-[#FFD700]">🥇 {tier.milestone.label}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 传奇区 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold" style={{ background: 'linear-gradient(90deg, #FF0080, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>👑 传奇区（16-20连胜）</span>
                  <span className="text-xs text-[#00D4FF]/60">- 铂金16连胜，钻石清空奖池</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {REWARD_TIERS.slice(15, 20).map((tier) => (
                    <div 
                      key={tier.streak}
                      className={`p-2 rounded-lg text-center ${tier.milestone ? 'ring-2' : ''}`}
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(255, 0, 128, 0.15) 0%, rgba(0, 212, 255, 0.15) 100%)', 
                        border: '1px solid rgba(0, 212, 255, 0.4)',
                        ...(tier.milestone && { ringColor: tier.streak === 20 ? '#00D4FF' : '#E5E4E2' })
                      }}
                    >
                      <div className="text-white font-bold">{tier.streak}连胜</div>
                      <div className="text-[#FFD700] text-lg font-bold">{tier.percentage}%</div>
                      {tier.milestone && (
                        <div className="text-xs" style={{ color: tier.streak === 20 ? '#00D4FF' : '#E5E4E2' }}>
                          {tier.milestone.emoji} {tier.milestone.label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 重要提示 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <h4 className="font-bold text-orange-400 mb-2 flex items-center gap-2">
                <Flame className="w-5 h-5" />
                关于代币燃烧与凭证
              </h4>
              <ul className="text-sm text-[#C9A347]/80 space-y-2">
                <li>• 兑换凭证时，代币会被<strong className="text-orange-400">永久销毁</strong></li>
                <li>• 燃烧地址：0x000...dead（黑洞地址）</li>
                <li>• <strong className="text-[#00D4FF]">游戏凭证不可转账</strong>，仅限游戏使用（合约层面限制）</li>
                <li>• 这是通缩机制，让代币越来越稀缺</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                <Coins className="w-5 h-5" />
                关于 BNB 奖池
              </h4>
              <ul className="text-sm text-[#C9A347]/80 space-y-2">
                <li>• 奖励全部以 <strong className="text-green-400">BNB</strong> 发放</li>
                <li>• 奖池越大，你能赢的 BNB 越多</li>
                <li>• 领取奖励时会扣除 5% 用于 <strong className="text-[#00D4FF]">Chainlink VRF 预言机服务费</strong>（非项目方收取）</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* 策略建议 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-6 mb-8"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
            border: '1px solid rgba(201, 163, 71, 0.25)',
          }}
        >
          <h2 
            className="text-2xl font-bold text-[#FFD700] flex items-center gap-3 mb-6"
            style={{ fontFamily: '"Cinzel", "Noto Serif SC", serif' }}
          >
            <Zap className="w-6 h-6" />
            策略建议
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <h4 className="font-bold text-green-400 mb-2">✅ 推荐做法</h4>
                <ul className="text-sm text-[#C9A347]/80 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>当前牌是 2 或 3 → 大胆猜「更大」（胜率高）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>当前牌是 Q 或 K → 果断猜「更小」（胜率高）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>连胜 3 次以上 → 考虑收手，小赚即安</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>奖池很大时 → 适合冲高连胜</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <h4 className="font-bold text-red-400 mb-2">❌ 避免做法</h4>
                <ul className="text-sm text-[#C9A347]/80 space-y-2">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>当前牌是 7 时 → 无论猜大猜小胜率都是 50%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>贪心不收手 → 高连胜很难维持</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>盲目选高门槛 → 新手容易亏损</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>频繁猜「相同」 → 胜率只有约 6%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 胜率参考 */}
          <div className="mt-6 p-4 rounded-xl bg-[#C9A347]/10 border border-[#C9A347]/20">
            <h4 className="font-bold text-[#C9A347] mb-3">📊 各点数胜率参考</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-2 bg-black/30 rounded-lg text-center">
                <div className="text-[#FFD700]">A (1)</div>
                <div className="text-green-400">猜大 92%</div>
              </div>
              <div className="p-2 bg-black/30 rounded-lg text-center">
                <div className="text-[#FFD700]">2-3</div>
                <div className="text-green-400">猜大 78-85%</div>
              </div>
              <div className="p-2 bg-black/30 rounded-lg text-center">
                <div className="text-[#FFD700]">6-8</div>
                <div className="text-yellow-400">约 50% 风险区</div>
              </div>
              <div className="p-2 bg-black/30 rounded-lg text-center">
                <div className="text-[#FFD700]">Q-K</div>
                <div className="text-green-400">猜小 85-92%</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 公平性保障 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 mb-8"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
            border: '1px solid rgba(201, 163, 71, 0.25)',
          }}
        >
          <h2 
            className="text-2xl font-bold text-[#FFD700] flex items-center gap-3 mb-6"
            style={{ fontFamily: '"Cinzel", "Noto Serif SC", serif' }}
          >
            <Shield className="w-6 h-6" />
            公平性保障
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-5 rounded-xl bg-[#C9A347]/5 border border-[#C9A347]/20">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#C9A347]/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-[#C9A347]" />
              </div>
              <h3 className="font-bold text-[#C9A347] mb-2">Chainlink VRF</h3>
              <p className="text-sm text-[#C9A347]/60">
                使用业界最权威的去中心化随机数服务，牌面完全随机，无法预测或操控
              </p>
            </div>
            
            <div className="text-center p-5 rounded-xl bg-[#C9A347]/5 border border-[#C9A347]/20">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#C9A347]/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#C9A347]" />
              </div>
              <h3 className="font-bold text-[#C9A347] mb-2">链上透明</h3>
              <p className="text-sm text-[#C9A347]/60">
                所有游戏记录、奖励发放都在 BSC 链上公开可查，任何人都可以验证
              </p>
            </div>
            
            <div className="text-center p-5 rounded-xl bg-[#C9A347]/5 border border-[#C9A347]/20">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#C9A347]/20 flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-[#C9A347]" />
              </div>
              <h3 className="font-bold text-[#C9A347] mb-2">智能合约</h3>
              <p className="text-sm text-[#C9A347]/60">
                游戏逻辑由智能合约自动执行，代码开源，无人工干预
              </p>
            </div>
          </div>
        </motion.div>

        {/* 常见问题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
            border: '1px solid rgba(201, 163, 71, 0.25)',
          }}
        >
          <h2 
            className="text-2xl font-bold text-[#FFD700] flex items-center gap-3 mb-6"
            style={{ fontFamily: '"Cinzel", "Noto Serif SC", serif' }}
          >
            <HelpCircle className="w-6 h-6" />
            常见问题
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/30 border border-[#C9A347]/20">
              <h4 className="font-bold text-[#FFD700] mb-2">Q: 门槛等级有什么区别？</h4>
              <p className="text-[#C9A347]/80 text-sm">
                门槛等级决定了你最高能达到的连胜数。比如青铜门槛最高只能到 5 连胜，而钻石门槛可以挑战 20 连胜清空奖池。门槛越高，需要燃烧的凭证越多，但潜在奖励也越大。
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-black/30 border border-[#C9A347]/20">
              <h4 className="font-bold text-[#FFD700] mb-2">Q: 猜「相同」有什么特别？</h4>
              <p className="text-[#C9A347]/80 text-sm">
                猜「相同」的胜率只有约 6%（51 张牌中有 3 张相同点数），风险很高。但如果猜对，会获得<strong className="text-[#00D4FF]">额外 +2 连胜加成</strong>，直接跳 2 级奖励！适合在关键时刻博一把。
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-black/30 border border-[#C9A347]/20">
              <h4 className="font-bold text-[#FFD700] mb-2">Q: 奖励怎么领取？</h4>
              <p className="text-[#C9A347]/80 text-sm">
                收手成功后，奖励会存入你的「待领取」账户。点击顶部导航栏的金色「待领取」按钮即可提取 BNB 到钱包。领取时会扣除 5% 用于 Chainlink VRF 预言机服务费（保障随机数服务持续运行，非项目方收取）。
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-black/30 border border-[#C9A347]/20">
              <h4 className="font-bold text-[#FFD700] mb-2">Q: 为什么要等待 VRF？</h4>
              <p className="text-[#C9A347]/80 text-sm">
                每次猜测后，需要等待 Chainlink VRF 返回随机数来决定下一张牌。这个过程通常需要 5-15 秒。这是确保公平性的必要环节，随机数由去中心化网络生成，无法被任何人操控。
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-black/30 border border-[#C9A347]/20">
              <h4 className="font-bold text-[#FFD700] mb-2">Q: 凭证可以退回吗？</h4>
              <p className="text-[#C9A347]/80 text-sm">
                不可以。兑换凭证时代币会被永久燃烧，凭证只能用于游戏。游戏开始后，无论输赢，本局投入的凭证都会被消耗。请根据自己的承受能力合理游戏。
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Rules;
