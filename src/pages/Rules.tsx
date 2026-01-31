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
  Crown
} from 'lucide-react';
import { BET_TIERS, REWARD_TIERS } from '@/config/hilo';

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
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{
              fontFamily: '"Ma Shan Zheng", "Noto Serif SC", cursive',
              background: 'linear-gradient(135deg, #FFD700 0%, #C9A347 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🃏 游戏规则
          </h1>
          <p className="text-[#C9A347]/60">了解王牌博弈的玩法与奖励</p>
        </motion.div>

        {/* 游戏简介 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
            border: '1px solid rgba(201, 163, 71, 0.25)',
          }}
        >
          <h2 className="text-xl font-bold text-[#FFD700] flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5" />
            什么是王牌博弈？
          </h2>
          <div className="space-y-3 text-[#C9A347]/80">
            <p className="text-[#C9A347] text-lg">
              王牌博弈是一款链上高低扑克游戏。猜下一张牌比当前牌更高还是更低，连续猜对越多，奖励越丰厚！
            </p>
            <div 
              className="rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
              }}
            >
              <p className="text-[#FFD700] font-bold mb-2">💰 核心亮点</p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>代币燃烧入场</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#FFD700]" />
                  <span>BNB奖池奖励</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#00D4FF]" />
                  <span>20连胜清空奖池</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 游戏流程 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.25)',
            }}
          >
            <h2 className="text-xl font-bold text-[#FFD700] flex items-center gap-2 mb-4">
              <Gamepad2 className="w-5 h-5" />
              如何游玩
            </h2>

            <div className="space-y-4">
              {/* 步骤1 */}
              <div className="flex gap-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201, 163, 71, 0.2)', border: '1px solid rgba(201, 163, 71, 0.3)' }}
                >
                  <Wallet className="w-5 h-5 text-[#C9A347]" />
                </div>
                <div>
                  <div className="font-bold text-[#C9A347] mb-1">1. 连接钱包</div>
                  <p className="text-sm text-[#C9A347]/60">支持 MetaMask、OKX Wallet 等主流钱包</p>
                </div>
              </div>

              {/* 步骤2 */}
              <div className="flex gap-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255, 215, 0, 0.2)', border: '1px solid rgba(255, 215, 0, 0.3)' }}
                >
                  <Target className="w-5 h-5 text-[#FFD700]" />
                </div>
                <div>
                  <div className="font-bold text-[#C9A347] mb-1">2. 选择门槛等级</div>
                  <p className="text-sm text-[#C9A347]/60">门槛越高，可达到的连胜上限越高，奖励越丰厚</p>
                </div>
              </div>

              {/* 步骤3 */}
              <div className="flex gap-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0, 212, 255, 0.2)', border: '1px solid rgba(0, 212, 255, 0.3)' }}
                >
                  <div className="flex">
                    <ChevronUp className="w-3 h-3 text-green-400" />
                    <ChevronDown className="w-3 h-3 text-red-400" />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-[#C9A347] mb-1">3. 猜高或猜低</div>
                  <p className="text-sm text-[#C9A347]/60">猜下一张牌比当前牌更高还是更低</p>
                </div>
              </div>

              {/* 步骤4 */}
              <div className="flex gap-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                >
                  <Trophy className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="font-bold text-[#C9A347] mb-1">4. 收手或继续</div>
                  <p className="text-sm text-[#C9A347]/60">猜对后可随时收手兑现，或继续挑战更高连胜</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 门槛等级 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
              border: '1px solid rgba(201, 163, 71, 0.25)',
            }}
          >
            <h2 className="text-xl font-bold text-[#FFD700] flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5" />
              门槛等级
            </h2>

            <div className="space-y-2">
              {BET_TIERS.map((tier) => {
                const maxReward = REWARD_TIERS.find(r => r.streak === tier.maxStreak);
                return (
                  <div 
                    key={tier.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: `${tier.color}10`,
                      border: `1px solid ${tier.color}30`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ background: tier.color, color: '#000' }}
                      >
                        {tier.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: tier.color }}>{tier.name}</div>
                        <div className="text-xs text-[#C9A347]/60">
                          {tier.betAmount >= 1000000 ? `${tier.betAmount / 1000000}M` : `${tier.betAmount / 1000}K`} 凭证
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#FFD700]">{tier.maxStreak} 连胜</div>
                      <div className="text-xs text-[#C9A347]/60">最高 {maxReward?.percentage}% 奖池</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* 奖励规则 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 rounded-2xl p-6"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
            border: '1px solid rgba(201, 163, 71, 0.25)',
          }}
        >
          <h2 className="text-xl font-bold text-[#FFD700] flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5" />
            奖励规则
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 奖励机制说明 */}
            <div className="space-y-3">
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                }}
              >
                <h3 className="font-bold text-[#FFD700] mb-2">奖池百分比奖励</h3>
                <ul className="text-sm text-[#C9A347]/80 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>连胜越多，获得的奖池百分比越高</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>奖励 = 奖池金额 × 对应百分比</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>20连胜可清空整个奖池（100%）</span>
                  </li>
                </ul>
              </div>

              <div 
                className="p-4 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 100, 50, 0.1) 0%, rgba(201, 163, 71, 0.05) 100%)',
                  border: '1px solid rgba(255, 100, 50, 0.2)',
                }}
              >
                <h3 className="font-bold text-orange-500 mb-2">代币燃烧机制</h3>
                <ul className="text-sm text-[#C9A347]/80 space-y-2">
                  <li className="flex items-start gap-2">
                    <Flame className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>入场需燃烧对应门槛的代币凭证</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Flame className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>燃烧的代币永久销毁，减少流通量</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Flame className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>通缩机制支撑代币价值</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 关键连胜奖励 */}
            <div 
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(201, 163, 71, 0.2)',
              }}
            >
              <h3 className="font-bold text-[#C9A347] mb-3">关键节点奖励</h3>
              <div className="space-y-2">
                {REWARD_TIERS.filter(t => t.milestone).map((tier) => (
                  <div 
                    key={tier.streak}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{
                      background: 'rgba(255, 215, 0, 0.05)',
                      border: '1px solid rgba(255, 215, 0, 0.1)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tier.milestone?.emoji}</span>
                      <span className="text-[#C9A347]">{tier.milestone?.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#FFD700]">{tier.streak}连胜</span>
                      <span className="text-[#C9A347]/60 ml-2">= {tier.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 公平性保障 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 rounded-2xl p-6"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 22, 18, 0.95) 0%, rgba(15, 12, 8, 0.98) 100%)',
            border: '1px solid rgba(201, 163, 71, 0.25)',
          }}
        >
          <h2 className="text-xl font-bold text-[#FFD700] flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            公平性保障
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-[#C9A347]/5 border border-[#C9A347]/20">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#C9A347]/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#C9A347]" />
              </div>
              <h3 className="font-bold text-[#C9A347] mb-1">Chainlink VRF</h3>
              <p className="text-sm text-[#C9A347]/60">使用去中心化随机数，无法预测或操控</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-[#C9A347]/5 border border-[#C9A347]/20">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#C9A347]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#C9A347]" />
              </div>
              <h3 className="font-bold text-[#C9A347] mb-1">链上透明</h3>
              <p className="text-sm text-[#C9A347]/60">所有记录上链，可随时查验</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-[#C9A347]/5 border border-[#C9A347]/20">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#C9A347]/20 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-[#C9A347]" />
              </div>
              <h3 className="font-bold text-[#C9A347] mb-1">智能合约</h3>
              <p className="text-sm text-[#C9A347]/60">代码开源，逻辑自动执行</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Rules;
