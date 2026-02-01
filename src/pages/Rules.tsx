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
  AlertCircle,
  ArrowRight,
  Gift,
  Sparkles,
  Equal,
  HandCoins,
  CircleDollarSign,
  Percent,
  Info
} from 'lucide-react';
import { BET_TIERS, REWARD_TIERS } from '@/config/hilo';
import { useLanguage } from '@/contexts/LanguageContext';

const Rules = () => {
  const { t, language } = useLanguage();

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
            {t('rules.pageTitle')}
          </h1>
          <p className="text-[#C9A347]/70 text-lg max-w-2xl mx-auto">
            {t('rules.pageSubtitle')}
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
              {t('rules.coreTitle')}
            </p>
            <p className="text-[#C9A347]/80">
              {t('rules.coreSubtitle')}
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
            {t('rules.flowTitle')}
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
                  {t('rules.step1Title')}
                </h3>
                <div className="bg-black/30 rounded-xl p-4 space-y-3">
                  <p className="text-[#C9A347]/90">
                    <strong className="text-[#FFD700]">{t('rules.step1What')}</strong> {t('rules.step1Desc')}
                  </p>
                  <div className="flex items-center gap-2 text-[#C9A347]/80 text-sm">
                    <ArrowRight className="w-4 h-4 text-[#FFD700]" />
                    <span>{t('rules.step1Action')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#C9A347]/80 text-sm">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span dangerouslySetInnerHTML={{ __html: t('rules.step1Burn') }} />
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
                  {t('rules.step2Title')}
                </h3>
                <div className="bg-black/30 rounded-xl p-4 space-y-3">
                  <p className="text-[#C9A347]/90">
                    <strong className="text-[#FFD700]">{t('rules.step2What')}</strong> {t('rules.step2Desc')}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                    {BET_TIERS.map((tier) => (
                      <div 
                        key={tier.id}
                        className="p-2 rounded-lg text-center text-sm"
                        style={{ background: `${tier.color}20`, border: `1px solid ${tier.color}40` }}
                      >
                        <div className="font-bold" style={{ color: tier.color }}>{tier.name}</div>
                        <div className="text-[#C9A347]/60 text-xs">
                          {tier.betAmount >= 1000000 ? `${tier.betAmount / 1000000}M` : `${tier.betAmount / 1000}K`} {t('rules.step2Credits')}
                        </div>
                        <div className="text-[#FFD700] text-xs">
                          {t('rules.step2MaxStreak').replace('{n}', tier.maxStreak.toString())}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 text-[#C9A347]/70 text-sm mt-2 bg-[#FFD700]/5 p-3 rounded-lg">
                    <Info className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: t('rules.step2Tip') }} />
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
                  {t('rules.step3Title')}
                </h3>
                <div className="bg-black/30 rounded-xl p-4 space-y-4">
                  <p className="text-[#C9A347]/90">
                    {t('rules.step3Desc')}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <ChevronUp className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-green-400">{t('rules.guessHigher')}</span>
                      </div>
                      <p className="text-sm text-[#C9A347]/70" dangerouslySetInnerHTML={{ __html: t('rules.guessHigherDesc') }} />
                    </div>
                    
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <ChevronDown className="w-5 h-5 text-red-400" />
                        <span className="font-bold text-red-400">{t('rules.guessLower')}</span>
                      </div>
                      <p className="text-sm text-[#C9A347]/70" dangerouslySetInnerHTML={{ __html: t('rules.guessLowerDesc') }} />
                    </div>
                  </div>
                  
                  {/* 平局说明 */}
                  <div className="flex items-start gap-2 text-orange-400/90 text-sm bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{t('rules.tieWarning')}</span>
                  </div>

                  <div className="bg-[#C9A347]/10 p-3 rounded-lg">
                    <p className="text-sm text-[#C9A347]/80">
                      <strong className="text-[#FFD700]">{t('rules.cardOrder')}</strong>
                      {' '}{t('rules.cardOrderValue')}
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
                  {t('rules.step4Title')}
                </h3>
                <div className="bg-black/30 rounded-xl p-4 space-y-3">
                  <p className="text-[#C9A347]/90">
                    <strong className="text-[#FFD700]">{t('rules.step4What')}</strong> {t('rules.step4Desc')}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-green-400">{t('rules.cashoutNow')}</span>
                      </div>
                      <p className="text-sm text-[#C9A347]/70">
                        {t('rules.cashoutDesc')}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-[#FFD700]" />
                        <span className="font-bold text-[#FFD700]">{t('rules.continueChallenge')}</span>
                      </div>
                      <p className="text-sm text-[#C9A347]/70">
                        {t('rules.continueDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-red-400/90 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: t('rules.wrongGuess') }} />
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
            {t('rules.rewardTitle')}
          </h2>

          {/* 奖励计算公式 */}
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-[#FFD700]/10 to-[#C9A347]/5 border border-[#FFD700]/30">
            <h3 className="text-lg font-bold text-[#FFD700] mb-3 flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5" />
              {t('rules.rewardFormula')}
            </h3>
            <div className="text-center py-4">
              <div className="inline-block bg-black/40 rounded-xl px-6 py-3">
                <span className="text-2xl font-bold text-[#FFD700]">{t('rules.yourReward')}</span>
                <span className="text-2xl text-[#C9A347] mx-3">=</span>
                <span className="text-2xl font-bold text-green-400">{t('rules.currentPool')}</span>
                <span className="text-2xl text-[#C9A347] mx-3">×</span>
                <span className="text-2xl font-bold text-[#00D4FF]">{t('rules.streakPercent')}</span>
              </div>
            </div>
            <p className="text-center text-[#C9A347]/70 text-sm mt-2">
              {t('rules.rewardExample')}
            </p>
          </div>

          {/* 连胜奖励表 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#C9A347] mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5" />
              {t('rules.fullRewardTable')}
            </h3>
            
            <div className="space-y-4">
              {/* 常见区 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400 font-bold">{t('rules.entryZone')}</span>
                  <span className="text-xs text-gray-500">{t('rules.entryNote')}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {REWARD_TIERS.slice(0, 5).map((tier) => (
                    <div 
                      key={tier.streak}
                      className={`p-2 rounded-lg text-center ${tier.milestone ? 'ring-2 ring-[#CD7F32]' : ''}`}
                      style={{ background: 'rgba(107, 114, 128, 0.2)', border: '1px solid rgba(107, 114, 128, 0.3)' }}
                    >
                      <div className="text-white font-bold">{t('rules.streakN').replace('{n}', tier.streak.toString())}</div>
                      <div className="text-[#FFD700] text-lg font-bold">{tier.percentage}%</div>
                      {tier.milestone && <div className="text-xs text-[#CD7F32]">🥉 {tier.milestone.label}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 进阶区 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-300 font-bold">{t('rules.advancedZone')}</span>
                  <span className="text-xs text-gray-500">{t('rules.advancedNote')}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {REWARD_TIERS.slice(5, 10).map((tier) => (
                    <div 
                      key={tier.streak}
                      className={`p-2 rounded-lg text-center ${tier.milestone ? 'ring-2 ring-[#C0C0C0]' : ''}`}
                      style={{ background: 'rgba(192, 192, 192, 0.15)', border: '1px solid rgba(192, 192, 192, 0.3)' }}
                    >
                      <div className="text-white font-bold">{t('rules.streakN').replace('{n}', tier.streak.toString())}</div>
                      <div className="text-[#FFD700] text-lg font-bold">{tier.percentage}%</div>
                      {tier.milestone && <div className="text-xs text-[#C0C0C0]">🥈 {tier.milestone.label}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 精英区 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#FFD700] font-bold">{t('rules.eliteZone')}</span>
                  <span className="text-xs text-[#FFD700]/60">{t('rules.eliteNote')}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {REWARD_TIERS.slice(10, 15).map((tier) => (
                    <div 
                      key={tier.streak}
                      className={`p-2 rounded-lg text-center ${tier.milestone ? 'ring-2 ring-[#FFD700]' : ''}`}
                      style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)' }}
                    >
                      <div className="text-white font-bold">{t('rules.streakN').replace('{n}', tier.streak.toString())}</div>
                      <div className="text-[#FFD700] text-lg font-bold">{tier.percentage}%</div>
                      {tier.milestone && <div className="text-xs text-[#FFD700]">🥇 {tier.milestone.label}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 传奇区 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold" style={{ background: 'linear-gradient(90deg, #FF0080, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('rules.legendZone')}</span>
                  <span className="text-xs text-[#00D4FF]/60">{t('rules.legendNote')}</span>
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
                      <div className="text-white font-bold">{t('rules.streakN').replace('{n}', tier.streak.toString())}</div>
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
                {t('rules.aboutBurn')}
              </h4>
              <ul className="text-sm text-[#C9A347]/80 space-y-2">
                <li dangerouslySetInnerHTML={{ __html: `• ${t('rules.burnPoint1')}` }} />
                <li>• {t('rules.burnPoint2')}</li>
                <li dangerouslySetInnerHTML={{ __html: `• ${t('rules.burnPoint3')}` }} />
                <li>• {t('rules.burnPoint4')}</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                <Coins className="w-5 h-5" />
                {t('rules.aboutPool')}
              </h4>
              <ul className="text-sm text-[#C9A347]/80 space-y-2">
                <li dangerouslySetInnerHTML={{ __html: `• ${t('rules.poolPoint1')}` }} />
                <li>• {t('rules.poolPoint2')}</li>
                <li dangerouslySetInnerHTML={{ __html: `• ${t('rules.poolPoint3')}` }} />
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
            {t('rules.strategyTitle')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <h4 className="font-bold text-green-400 mb-2">{t('rules.recommended')}</h4>
                <ul className="text-sm text-[#C9A347]/80 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t('rules.recommend1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t('rules.recommend2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t('rules.recommend3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t('rules.recommend4')}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <h4 className="font-bold text-red-400 mb-2">{t('rules.avoid')}</h4>
                <ul className="text-sm text-[#C9A347]/80 space-y-2">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{t('rules.avoid1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{t('rules.avoid2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{t('rules.avoid3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{t('rules.avoid4')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 胜率参考 */}
          <div className="mt-6 p-4 rounded-xl bg-[#C9A347]/10 border border-[#C9A347]/20">
            <h4 className="font-bold text-[#C9A347] mb-3">{t('rules.oddsReference')}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-2 bg-black/30 rounded-lg text-center">
                <div className="text-[#FFD700]">A (1)</div>
                <div className="text-green-400">{t('rules.guessLarger')} 92%</div>
              </div>
              <div className="p-2 bg-black/30 rounded-lg text-center">
                <div className="text-[#FFD700]">2-3</div>
                <div className="text-green-400">{t('rules.guessLarger')} 78-85%</div>
              </div>
              <div className="p-2 bg-black/30 rounded-lg text-center">
                <div className="text-[#FFD700]">6-8</div>
                <div className="text-yellow-400">{t('rules.riskZone')}</div>
              </div>
              <div className="p-2 bg-black/30 rounded-lg text-center">
                <div className="text-[#FFD700]">Q-K</div>
                <div className="text-green-400">{t('rules.guessSmaller')} 85-92%</div>
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
            {t('rules.fairnessTitle')}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-5 rounded-xl bg-[#C9A347]/5 border border-[#C9A347]/20">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#C9A347]/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-[#C9A347]" />
              </div>
              <h3 className="font-bold text-[#C9A347] mb-2">{t('rules.chainlinkVRF')}</h3>
              <p className="text-sm text-[#C9A347]/60">
                {t('rules.chainlinkDesc')}
              </p>
            </div>
            
            <div className="text-center p-5 rounded-xl bg-[#C9A347]/5 border border-[#C9A347]/20">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#C9A347]/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#C9A347]" />
              </div>
              <h3 className="font-bold text-[#C9A347] mb-2">{t('rules.onchainTransparent')}</h3>
              <p className="text-sm text-[#C9A347]/60">
                {t('rules.onchainDesc')}
              </p>
            </div>
            
            <div className="text-center p-5 rounded-xl bg-[#C9A347]/5 border border-[#C9A347]/20">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#C9A347]/20 flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-[#C9A347]" />
              </div>
              <h3 className="font-bold text-[#C9A347] mb-2">{t('rules.smartContract')}</h3>
              <p className="text-sm text-[#C9A347]/60">
                {t('rules.contractDesc')}
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
            {t('rules.faqTitle')}
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/30 border border-[#C9A347]/20">
              <h4 className="font-bold text-[#FFD700] mb-2">{t('rules.faq1Q')}</h4>
              <p className="text-[#C9A347]/80 text-sm">
                {t('rules.faq1A')}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-black/30 border border-[#C9A347]/20">
              <h4 className="font-bold text-[#FFD700] mb-2">{t('rules.faq2Q')}</h4>
              <p className="text-[#C9A347]/80 text-sm" dangerouslySetInnerHTML={{ __html: t('rules.faq2A') }} />
            </div>
            
            <div className="p-4 rounded-xl bg-black/30 border border-[#C9A347]/20">
              <h4 className="font-bold text-[#FFD700] mb-2">{t('rules.faq3Q')}</h4>
              <p className="text-[#C9A347]/80 text-sm">
                {t('rules.faq3A')}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-black/30 border border-[#C9A347]/20">
              <h4 className="font-bold text-[#FFD700] mb-2">{t('rules.faq4Q')}</h4>
              <p className="text-[#C9A347]/80 text-sm">
                {t('rules.faq4A')}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-black/30 border border-[#C9A347]/20">
              <h4 className="font-bold text-[#FFD700] mb-2">{t('rules.faq5Q')}</h4>
              <p className="text-[#C9A347]/80 text-sm">
                {t('rules.faq5A')}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <h4 className="font-bold text-orange-400 mb-2">{t('rules.faq6Q')}</h4>
              <p className="text-[#C9A347]/80 text-sm" dangerouslySetInnerHTML={{ __html: t('rules.faq6A') }} />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Rules;
