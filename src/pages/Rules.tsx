import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { AdvancedRewardTiers } from '@/components/AdvancedRewardTiers';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
  
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
            🎰 {t('rules.title')}
          </h1>
          <p className="text-muted-foreground">{t('rules.subtitle')}</p>
        </motion.div>

        {/* 游戏简介 - 通俗易懂版 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card mb-6"
        >
          <h2 className="text-xl font-display neon-text-yellow flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5" />
            {t('rules.whatIsThis')}
          </h2>
          <div className="text-muted-foreground space-y-3">
            <p className="text-foreground text-lg">
              {t('rules.simpleExplain')}
            </p>
            <div className="neon-border-green rounded-lg p-4 bg-neon-green/5">
              <p className="text-neon-green font-display mb-2">💰 {t('rules.highlight')}</p>
              <div className="text-sm space-y-2">
                <p>{t('rules.tokenBurnDesc')}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 rounded bg-neon-green/10 border border-neon-green/30 text-center">
                    <div className="text-neon-green font-display text-lg">95%</div>
                    <div className="text-xs text-muted-foreground">{t('rules.playerGet')}</div>
                    <div className="text-xs text-neon-green">{t('rules.directToWallet')}</div>
                  </div>
                  <div className="p-2 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-center">
                    <div className="text-neon-cyan font-display text-lg">5%</div>
                    <div className="text-xs text-muted-foreground">{t('rules.operationFee')}</div>
                    <div className="text-xs text-neon-cyan">{t('rules.vrfGas')}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 {t('rules.vrfNote')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 通缩机制的好处 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="cyber-card mb-6"
        >
          <h2 className="text-xl font-display neon-text-green flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            {t('deflation.title')}
          </h2>
          
          <div className="space-y-4">
            {/* 核心机制解释 */}
            <div className="neon-border-yellow rounded-lg p-4 bg-neon-yellow/5">
              <h3 className="font-display text-neon-yellow mb-3">{t('deflation.howItWorks')}</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">1️⃣</span>
                  </div>
                  <div>
                    <p className="text-foreground font-display">{t('deflation.step1Title')}</p>
                    <p>{t('deflation.step1Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">2️⃣</span>
                  </div>
                  <div>
                    <p className="text-foreground font-display">{t('deflation.step2Title')}</p>
                    <p>{t('deflation.step2Desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">3️⃣</span>
                  </div>
                  <div>
                    <p className="text-foreground font-display">{t('deflation.step3Title')}</p>
                    <p>{t('deflation.step3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 好处列表 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="neon-border-green rounded-lg p-4 bg-neon-green/5">
                <h3 className="font-display text-neon-green mb-2">{t('benefits.holdersTitle')}</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span><span className="text-neon-yellow">{t('benefits.deflation')}</span>：{t('benefits.deflationDesc')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span><span className="text-neon-yellow">{t('benefits.value')}</span>：{t('benefits.valueDesc')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span><span className="text-neon-yellow">{t('benefits.utility')}</span>：{t('benefits.utilityDesc')}</span>
                  </li>
                </ul>
              </div>
              
              <div className="neon-border-cyan rounded-lg p-4 bg-neon-cyan/5">
                <h3 className="font-display text-neon-cyan mb-2">{t('benefits.playersTitle')}</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                    <span><span className="text-neon-green">{t('benefits.bnbReward')}</span>：{t('benefits.bnbRewardDesc')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                    <span><span className="text-neon-green">{t('benefits.fair')}</span>：{t('benefits.fairDesc')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                    <span><span className="text-neon-green">{t('benefits.highOdds')}</span>：{t('benefits.highOddsDesc')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 通俗总结 */}
            <div className="neon-border-pink rounded-lg p-4 bg-neon-pink/5">
              <h3 className="font-display text-neon-pink mb-2">{t('summary.title')}</h3>
              <p className="text-foreground">
                {t('summary.flow')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('summary.note')}
              </p>
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
              {t('howToPlay.title')}
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
                    {t('howToPlay.step1Title')}
                    <span className="text-xs px-2 py-0.5 rounded bg-neon-blue/20 text-neon-blue">{t('howToPlay.required')}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>{t('howToPlay.step1Desc')}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#E2761B]/10 border border-[#E2761B]/30 text-xs">
                        🦊 MetaMask
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 border border-white/30 text-xs">
                        ⬛ OKX Wallet
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F3BA2F]/10 border border-[#F3BA2F]/30 text-xs">
                        🟡 {t('howToPlay.binanceWallet') || 'Binance Wallet'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#2980FE]/10 border border-[#2980FE]/30 text-xs">
                        🔵 TokenPocket
                      </span>
                    </div>
                    <p className="text-neon-cyan text-xs">
                      {t('howToPlay.walletTip')}
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
                    {t('howToPlay.step2Title')}
                    <span className="text-xs px-2 py-0.5 rounded bg-neon-purple/20 text-neon-purple">{t('howToPlay.important')}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{t('howToPlay.step2Desc')}</p>
                    <p className="text-neon-cyan">{t('howToPlay.step2Example')}</p>
                    <p className="text-xs">{t('howToPlay.step2Note')}</p>
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
                  <div className="font-display text-foreground mb-1">{t('howToPlay.step3Title')}</div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>{t('howToPlay.step3Desc')}</p>
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      <div className="p-2 rounded bg-muted/30 text-center">
                        <div className="text-foreground">10K</div>
                        <div className="text-muted-foreground">1x</div>
                      </div>
                      <div className="p-2 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-center">
                        <div className="text-neon-cyan">25K</div>
                        <div className="text-neon-green">2.5x</div>
                      </div>
                      <div className="p-2 rounded bg-neon-purple/10 border border-neon-purple/30 text-center">
                        <div className="text-neon-purple">50K</div>
                        <div className="text-neon-green">5x</div>
                      </div>
                      <div className="p-2 rounded bg-neon-yellow/10 border border-neon-yellow/30 text-center">
                        <div className="text-neon-yellow">100K</div>
                        <div className="text-neon-green">10x</div>
                      </div>
                      <div className="p-2 rounded bg-neon-yellow/20 border border-neon-yellow/50 text-center">
                        <div className="text-neon-yellow">250K</div>
                        <div className="text-neon-green">20x</div>
                      </div>
                    </div>
                    <p className="text-neon-green">{t('howToPlay.step3Tip')}</p>
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
                  <div className="font-display text-foreground mb-1">{t('howToPlay.step4Title')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('howToPlay.step4Desc')}
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
              {t('winRules.title')}
            </h2>

            <div className="space-y-4">
              {/* 基本规则 */}
              <div className="neon-border rounded-lg p-4 bg-muted/20">
                <h3 className="font-display text-neon-cyan mb-2">{t('winRules.basic')}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span>{t('winRules.rule1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span>{t('winRules.rule2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span>{t('winRules.rule3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                    <span>{t('winRules.rule4')}</span>
                  </li>
                </ul>
              </div>

              {/* 奖励等级简化版 */}
              <div className="neon-border-yellow rounded-lg p-4 bg-neon-yellow/5">
                <h3 className="font-display text-neon-yellow mb-3">{t('winExample.title')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-2 rounded bg-neon-yellow/10">
                    <span>🎰</span>
                    <span className="text-neon-yellow font-display flex-1">{t('reward.superJackpot')}</span>
                    <span className="text-foreground">{t('prizeDesc.superJackpot') || '5×7️⃣'}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">{t('prizePool.superJackpot') || '50%'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-neon-purple/10">
                    <span>💎</span>
                    <span className="text-neon-purple font-display flex-1">{t('reward.jackpot')}</span>
                    <span className="text-foreground">{t('prizeDesc.jackpot') || '5×💎 / 4×7️⃣'}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">{t('prizePool.jackpot') || '25%'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                    <span>👑</span>
                    <span className="text-foreground font-display flex-1">{t('reward.first')}</span>
                    <span className="text-muted-foreground">{t('prizeDesc.first') || '5 same'}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">{t('prizePool.first') || '13%'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                    <span>🔔</span>
                    <span className="text-foreground font-display flex-1">{t('reward.second')}</span>
                    <span className="text-muted-foreground">{t('prizeDesc.second') || '4× rare'}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">{t('prizePool.second') || '5%'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                    <span>⭐</span>
                    <span className="text-foreground font-display flex-1">{t('reward.third')}</span>
                    <span className="text-muted-foreground">{t('prizeDesc.third') || '4× common'}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">{t('prizePool.third') || '1.7%'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/20">
                    <span>🍀</span>
                    <span className="text-foreground font-display flex-1">{t('reward.small')}</span>
                    <span className="text-muted-foreground">{t('prizeDesc.small') || '3 same'}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">{t('prizePool.small') || '0.5%'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-neon-cyan/10">
                    <span>🎁</span>
                    <span className="text-neon-cyan font-display flex-1">{t('reward.consolation')}</span>
                    <span className="text-muted-foreground">{t('prizeDesc.consolation') || '2 same'}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-neon-green font-display">{t('prizePool.consolation') || '0.1%'}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * {t('prizeNote.maxPayout') || 'Max payout per spin: 50% of pool'}
                </p>
              </div>

              {/* 举例说明 */}
              <div className="neon-border-green rounded-lg p-4 bg-neon-green/5">
                <h3 className="font-display text-neon-green mb-2">{t('example.title') || '📖 Example'}</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>{t('example.desc1') || 'If pool has 10 BNB and you spin [7️⃣ 💎 7️⃣ 7️⃣ 7️⃣], you got 4×7️⃣ - Jackpot!'}</p>
                  <p>{t('example.desc2') || 'Prize: 10 × 25% = 2.5 BNB (minus 5% fee = ~2.375 BNB)'}</p>
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
            {t('symbols.title') || 'Symbol Guide'}
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="neon-border-yellow rounded-lg p-4 bg-neon-yellow/5 text-center">
              <div className="text-3xl mb-2">7️⃣ 💎</div>
              <div className="font-display text-neon-yellow">{t('rarity.legendary')}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('symbols.legendaryDesc') || 'Base odds ~1-2%'}</div>
            </div>
            <div className="neon-border-purple rounded-lg p-4 bg-neon-purple/5 text-center">
              <div className="text-3xl mb-2">👑 🔔 ⭐</div>
              <div className="font-display text-neon-purple">{t('rarity.epic')}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('symbols.epicDesc') || 'Base odds ~3-5%'}</div>
            </div>
            <div className="neon-border-cyan rounded-lg p-4 bg-neon-cyan/5 text-center">
              <div className="text-3xl mb-2">🍒 🍋 🍊</div>
              <div className="font-display text-neon-cyan">{t('rarity.rare')}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('symbols.rareDesc') || 'Base odds ~17%'}</div>
            </div>
            <div className="neon-border rounded-lg p-4 bg-muted/20 text-center">
              <div className="text-3xl mb-2">🍇 🍀</div>
              <div className="font-display text-foreground">{t('rarity.common')}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('symbols.commonDesc') || 'Base odds ~17%'}</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            💡 {t('symbols.betTip') || 'Higher bets increase rare symbol odds. 500K bet = 20x boost!'}
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
            {t('security.fairTitle') || 'Why Is It Fair?'}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="neon-border rounded-lg p-4 bg-muted/20">
              <h3 className="font-display text-neon-cyan mb-2">{t('security.vrfTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('security.vrfDesc')}
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• {t('security.vrfPoint1') || 'No one can predict or manipulate results'}</li>
                <li>• {t('security.vrfPoint2') || 'Every random number is verifiable on-chain'}</li>
                <li>• {t('security.vrfPoint3') || 'Fully transparent, anyone can audit'}</li>
              </ul>
              <div className="mt-3 p-2 rounded bg-neon-cyan/10 border border-neon-cyan/30">
                <p className="text-xs text-neon-cyan">
                  💡 {t('security.vrfGasNote') || '5% of pool auto-funds VRF gas fees'}
                </p>
              </div>
            </div>
            <div className="neon-border-purple rounded-lg p-4 bg-muted/20">
              <h3 className="font-display text-neon-purple mb-2">{t('security.contractTitle') || '📜 Smart Contract Auto-Execution'}</h3>
              <p className="text-sm text-muted-foreground">
                {t('security.contractDesc') || 'All game logic runs in smart contracts:'}
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• {t('security.contractPoint1') || 'Open source, anyone can audit'}</li>
                <li>• {t('security.contractPoint2') || 'Credits and rewards fully automated'}</li>
                <li>• {t('security.contractPoint3') || 'No one can modify rules or cheat'}</li>
                <li>• {t('security.contractPoint4') || 'Pool funds locked in contract'}</li>
              </ul>
              <a 
                href="#" 
                className="inline-flex items-center gap-1 text-sm text-neon-purple hover:underline mt-2"
              >
                {t('security.viewContract') || 'View Smart Contract'} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* 管理员权限说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 cyber-card"
        >
          <h2 className="text-xl font-display neon-text-yellow flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            {t('admin.title') || '🔒 Admin Design: Only Reduce, Never Increase'}
          </h2>

          <div className="space-y-4">
            {/* 核心设计理念 */}
            <div className="neon-border-yellow rounded-lg p-4 bg-neon-yellow/5">
              <h3 className="font-display text-neon-yellow mb-3">{t('admin.coreDesign') || '⚡ Core: Bet threshold can only be lowered'}</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="text-foreground">
                  {t('admin.coreDesc') || 'Smart contract has one-way adjustment: admin can only lower thresholds, never raise them.'}
                </p>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded bg-neon-green/10 border border-neon-green/30">
                    <div className="text-neon-green font-display mb-1">{t('admin.allowed') || '✅ Allowed'}</div>
                    <p className="text-xs">{t('admin.allowedDesc') || 'Lower threshold: 10K → 5K → 2K'}</p>
                    <p className="text-xs">{t('admin.allowedNote') || 'More players can participate'}</p>
                  </div>
                  <div className="p-3 rounded bg-neon-pink/10 border border-neon-pink/30">
                    <div className="text-neon-pink font-display mb-1">{t('admin.forbidden') || '❌ Forbidden'}</div>
                    <p className="text-xs">{t('admin.forbiddenDesc') || 'Raise threshold: 10K → 20K → 50K'}</p>
                    <p className="text-xs">{t('admin.forbiddenNote') || 'Blocked at code level'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 为什么这样设计 */}
            <div className="neon-border-cyan rounded-lg p-4 bg-neon-cyan/5">
              <h3 className="font-display text-neon-cyan mb-3">{t('admin.whyTitle') || '💡 Why This Design?'}</h3>
              <div className="text-sm text-muted-foreground space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-yellow/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-neon-yellow" />
                  </div>
                  <div>
                    <p className="text-foreground font-display">{t('admin.priceRise') || 'Adapt to price increase'}</p>
                    <p>{t('admin.priceRiseDesc') || 'If token price rises 10x, admin can lower threshold so players can still afford to play.'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-neon-green" />
                  </div>
                  <div>
                    <p className="text-foreground font-display">{t('admin.protection') || 'Protect players'}</p>
                    <p>{t('admin.protectionDesc') || 'Prevents admin from raising thresholds to squeeze players after they deposit credits.'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 对玩家的保障 */}
            <div className="neon-border-green rounded-lg p-4 bg-neon-green/5">
              <h3 className="font-display text-neon-green mb-2">{t('admin.guarantee') || '🛡️ What This Means'}</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                  <span>{t('admin.point1') || 'Your credits always work: thresholds only go down'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                  <span>{t('admin.point2') || 'Win odds unchanged: only bet amount requirements change'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                  <span>{t('admin.point3') || 'Code-level guarantee: hardcoded rule, no workaround'}</span>
                </li>
              </ul>
            </div>

            {/* 技术说明 */}
            <div className="neon-border rounded-lg p-4 bg-muted/20">
              <h3 className="font-display text-muted-foreground mb-2">{t('admin.techTitle') || '📝 Technical Implementation'}</h3>
              <p className="text-xs text-muted-foreground font-mono bg-muted/30 p-2 rounded">
                require(_level1 &lt;= betLevel1, "Can only lower level 1");<br/>
                // {t('admin.techNote') || 'Contract enforces: new threshold ≤ old threshold'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('admin.techDesc') || 'This code is in the smart contract, immutable after deployment. Any attempt to raise threshold is auto-rejected.'}
              </p>
            </div>

            {/* 合约开源与资金安全 */}
            <div className="neon-border-pink rounded-lg p-4 bg-neon-pink/5">
              <h3 className="font-display text-neon-pink mb-3">{t('admin.fundsTitle') || '🔐 Open Source + Non-Withdrawable Funds'}</h3>
              <div className="text-sm text-muted-foreground space-y-3">
                <p className="text-foreground">
                  {t('admin.fundsDesc') || 'Our smart contract is fully decentralized. Code is open source, anyone can audit.'}
                </p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded bg-neon-green/10 border border-neon-green/30">
                    <div className="text-neon-green font-display mb-1">{t('admin.openSource') || '📖 Open Source'}</div>
                    <p className="text-xs">{t('admin.openSourceDesc1') || 'Contract code public on BSCScan'}</p>
                    <p className="text-xs">{t('admin.openSourceDesc2') || 'Anyone can view and audit'}</p>
                    <p className="text-xs text-neon-cyan mt-1">{t('admin.openSourceNote') || 'No hidden backdoors'}</p>
                  </div>
                  <div className="p-3 rounded bg-neon-purple/10 border border-neon-purple/30">
                    <div className="text-neon-purple font-display mb-1">{t('admin.noWithdraw') || '🚫 No Withdraw Function'}</div>
                    <p className="text-xs">{t('admin.noWithdrawDesc1') || 'Admin cannot withdraw pool funds'}</p>
                    <p className="text-xs">{t('admin.noWithdrawDesc2') || 'BNB only distributed via wins'}</p>
                    <p className="text-xs text-neon-yellow mt-1">{t('admin.noWithdrawNote') || 'Funds out only (for admin)'}</p>
                  </div>
                </div>

                <div className="p-3 rounded bg-neon-yellow/10 border border-neon-yellow/30">
                  <p className="text-neon-yellow font-display text-sm mb-1">{t('admin.meaning') || '💰 What This Means'}</p>
                  <ul className="text-xs space-y-1">
                    <li>• {t('admin.meaningPoint1') || 'Pool can only be won by players, admin gets nothing'}</li>
                    <li>• {t('admin.meaningPoint2') || 'No "rug pull" risk - no code entry for it'}</li>
                    <li>• {t('admin.meaningPoint3') || 'Even if team disappears, contract runs, pool remains winnable'}</li>
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 {t('admin.conclusion') || 'This is true decentralized gaming: rules by code, not people. Check the contract yourself on block explorer.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 cyber-card"
        >
          <h2 className="text-xl font-display neon-text-pink flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5" />
            {t('faq.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="neon-border-pink rounded-lg p-4 bg-neon-pink/5">
              <h3 className="font-display text-foreground mb-2">{t('faq.q1')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('faq.a1')}
              </p>
            </div>
            <div className="neon-border-pink rounded-lg p-4 bg-neon-pink/5">
              <h3 className="font-display text-neon-yellow mb-2">{t('faq.poolSource') || '💰 Where does pool money come from?'}</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="text-foreground">
                  {t('faq.poolSourceAnswer1') || 'Prize pool funded by 3% of trading tax!'}
                </p>
                <p>
                  {t('faq.poolSourceAnswer2') || 'Every token trade (buy/sell) generates tax, 3% goes to game pool for winners.'}
                </p>
                <div className="neon-border-pink rounded p-2 bg-neon-pink/10 mt-2">
                  <p className="text-xs">
                    {t('faq.poolSourceNote') || 'How it works: Tax → Auto-swap to BNB → Inject to pool contract'}
                  </p>
                </div>
                <p className="text-neon-green text-xs">
                  ✨ {t('faq.poolSourceTip') || 'More trading = bigger pool = bigger prizes!'}
                </p>
              </div>
            </div>
            <div className="neon-border-pink rounded-lg p-4 bg-neon-pink/5">
              <h3 className="font-display text-foreground mb-2">{t('faq.whyCredits') || 'Why use credits instead of tokens directly?'}</h3>
              <p className="text-sm text-muted-foreground">
                {t('faq.whyCreditsAnswer') || 'Credit system reduces on-chain transactions, saving gas. Exchange once, play many times, smoother experience.'}
              </p>
            </div>
            <div className="neon-border-pink rounded-lg p-4 bg-neon-pink/5">
              <h3 className="font-display text-foreground mb-2">{t('faq.higherBet') || 'Higher bet really means higher odds?'}</h3>
              <p className="text-sm text-muted-foreground">
                {t('faq.higherBetAnswer') || 'Yes! Higher bets increase rare symbol (7️⃣💎) appearance. 500K bet has 20x odds boost vs 20K, but bet responsibly.'}
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
            {t('payoutTable.title') || 'Full Payout Table'}
          </h2>
          <AdvancedRewardTiers />
        </motion.div>
      </main>
    </div>
  );
};

export default Rules;
