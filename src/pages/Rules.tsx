import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { RewardTiers } from '@/components/RewardTiers';
import { 
  Gamepad2, 
  Wallet, 
  Zap, 
  TrendingUp, 
  Shield, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const steps = [
  {
    icon: Wallet,
    title: '连接钱包',
    description: '使用 MetaMask 连接到 BNB Smart Chain 网络',
  },
  {
    icon: Zap,
    title: '消耗代币',
    description: '每次游戏消耗 20,000 代币，代币将被永久销毁',
  },
  {
    icon: Gamepad2,
    title: '开始游戏',
    description: '点击开始，等待转轮停止，查看结果',
  },
  {
    icon: TrendingUp,
    title: '累积概率',
    description: '未中奖时概率提升，中奖后概率重置',
  },
];

const faqs = [
  {
    question: '游戏公平吗？',
    answer: '是的！我们使用 Chainlink VRF（可验证随机函数）生成随机数，所有结果都可以在链上验证，确保完全透明和公平。',
  },
  {
    question: '代币会被销毁吗？',
    answer: '是的，每次游戏消耗的代币会被永久销毁（burn），这是一种通缩机制，随着游戏进行，代币总量会持续减少。',
  },
  {
    question: '奖池的 BNB 从哪来？',
    answer: '奖池由项目方注入，未来也可能接入代币交易税转换机制，将交易税的一部分自动转换为奖池。',
  },
  {
    question: '如何提高中奖概率？',
    answer: '每次未中奖，你的中奖概率会增加 2%（基础 5%，最高 50%）。中奖后概率会重置为基础值。',
  },
];

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
            游戏规则
          </h1>
          <p className="text-muted-foreground">了解如何参与 Cyber Slots</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* How to Play */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="cyber-card"
          >
            <h2 className="text-xl font-display neon-text-blue flex items-center gap-2 mb-4">
              <Gamepad2 className="w-5 h-5" />
              如何游戏
            </h2>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg neon-border flex items-center justify-center bg-muted/30">
                      <step.icon className="w-5 h-5 text-neon-blue" />
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-foreground mb-1">
                      {index + 1}. {step.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Reward Tiers */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <RewardTiers />
          </motion.div>
        </div>

        {/* Security & Fairness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 cyber-card"
        >
          <h2 className="text-xl font-display neon-text-green flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            安全与公平性
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="neon-border rounded-lg p-4 bg-muted/20">
              <h3 className="font-display text-neon-cyan mb-2">Chainlink VRF</h3>
              <p className="text-sm text-muted-foreground">
                使用 Chainlink 的可验证随机函数生成随机数，确保结果无法被预测或操纵。
                每个随机数都可以在链上验证其来源和正确性。
              </p>
              <a 
                href="https://chain.link/vrf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-neon-blue hover:underline mt-2"
              >
                了解更多 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="neon-border-purple rounded-lg p-4 bg-muted/20">
              <h3 className="font-display text-neon-purple mb-2">智能合约</h3>
              <p className="text-sm text-muted-foreground">
                所有游戏逻辑都在智能合约中执行，代码开源可审计。
                代币销毁、奖励发放都是自动执行，无需信任第三方。
              </p>
              <a 
                href="#" 
                className="inline-flex items-center gap-1 text-sm text-neon-purple hover:underline mt-2"
              >
                查看合约 <ExternalLink className="w-3 h-3" />
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

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="neon-border rounded-lg p-4 bg-muted/20"
              >
                <h3 className="font-display text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Rules;
