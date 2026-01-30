import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译文件
const translations: Record<Language, Record<string, string>> = {
  zh: {
    // 导航
    'nav.game': '游戏',
    'nav.history': '记录',
    'nav.rules': '规则',
    
    // 首页标签
    'home.tag.symbols': '5符号匹配',
    'home.tag.payline': '中间行赔付',
    'home.tag.symbolCount': '10种符号',
    'home.tag.return': '100% 返还',
    
    // 合约地址
    'contract.game': '游戏合约',
    'contract.token': '代币合约',
    'contract.copy': '复制地址',
    'contract.view': '在BSCScan查看',
    'contract.copied': '地址已复制',
    'contract.pending': '待部署...',
    
    // 奖池播报
    'jackpot.pool': '奖池',
    'jackpot.waiting': '等待第一位赢家...',
    
    // 老虎机
    'slot.title': 'BURN SLOTS',
    'slot.subtitle': '5轮符号匹配',
    'slot.return': '100%返还',
    'slot.onchain': '链上模式',
    'slot.pool': '奖池',
    'slot.credits': '凭证',
    'slot.winRate': '胜率',
    'slot.spin': '开始游戏',
    'slot.spinning': '等待结果...',
    'slot.connectWallet': '连接钱包开始',
    'slot.submitted': '游戏已提交',
    'slot.waitingVRF': '等待VRF回调结果...',
    'slot.noWin': '未中奖',
    'slot.tryAgain': '再接再厉！下次好运！',
    'slot.pendingRequest': '检测到挂起旋转请求',
    'slot.waitingVRFCallback': '等待 VRF 回调；如超过 1 小时可尝试解除。',
    'slot.cancel': '解除',
    'slot.unclaimedPrize': '待领取奖金',
    'slot.claim': '领取',
    'slot.claimed': '奖金已领取！',
    'slot.claimFailed': '领取失败',
    'slot.cancelAttempt': '已尝试解除卡住请求',
    'slot.cancelSuccess': '如确实已超时，将会重置你的挂起状态。',
    'slot.cancelFailed': '解除失败',
    'slot.spinFailed': '开始游戏失败',
    'slot.revealing': '开奖中...',
    'slot.waitingRandom': '等待随机数...',
    
    // 投注选择
    'bet.probability': '中奖概率',
    'bet.boost': '提升',
    'bet.perSpin': '凭证/次',
    'bet.credits': '投注凭证',
    'bet.moreCredits': '凭证越多，中奖概率越高',
    
    // 统计
    'stats.totalSpins': '总游戏',
    'stats.totalWins': '总中奖',
    
    // 自动旋转
    'auto.title': '自动旋转',
    'auto.stop': '停止',
    'auto.remaining': '剩余',
    'auto.stopped': '自动旋转已停止',
    'auto.completed': '自动旋转完成',
    'auto.completedDesc': '已完成所有自动旋转',
    'auto.stoppedReason': '由于凭证不足或其他原因',
    
    // 凭证兑换
    'exchange.title': '销毁代币换凭证',
    'exchange.notice': '销毁代币获得游戏凭证（1:1兑换）。凭证永久有效、不可转让，只能用于本钱包玩老虎机。',
    'exchange.tokenBalance': '代币余额',
    'exchange.gameCredits': '游戏凭证',
    'exchange.burn': '销毁',
    'exchange.get': '获得',
    'exchange.token': '代币',
    'exchange.credit': '凭证',
    'exchange.button': '销毁代币换凭证',
    'exchange.burning': '销毁中...',
    'exchange.success': '兑换成功！',
    'exchange.successDesc': '销毁 {amount} 代币，获得 {amount} 游戏凭证',
    'exchange.failed': '兑换失败',
    'exchange.checkAuth': '请检查授权和余额',
    'exchange.insufficientTokens': '代币不足',
    'exchange.needTokens': '需要 {amount} 代币',
    
    // 钱包
    'wallet.connect': '连接钱包',
    'wallet.connecting': '连接中...',
    'wallet.connected': '已连接',
    'wallet.disconnect': '断开连接',
    'wallet.pleaseConnect': '请先连接钱包',
    'wallet.needConnect': '需要连接钱包才能开始游戏',
    'wallet.insufficientCredits': '凭证不足',
    'wallet.needCredits': '需要 {amount} 游戏凭证。请先销毁代币兑换凭证。',
    
    // 奖励等级
    'reward.title': '奖励与赔付',
    'reward.deflation': '100% 通缩销毁',
    'reward.noFee': '零抽成',
    'reward.tokenBurn': '代币 100% 销毁，中奖奖金分配：',
    'reward.playerGet': '玩家获得（直发钱包）',
    'reward.vrfFee': 'VRF 运营费用',
    'reward.vrfNote': '5%用于 Chainlink VRF 预言机 Gas 费',
    'reward.maxPayout': '单次最大派奖',
    'reward.poolPercent': '奖池的',
    'reward.levels': '奖励等级',
    'reward.betBoost': '投注概率加成',
    'reward.higherBet': '投注越高，稀有符号出现概率越大',
    'reward.symbolOdds': '符号概率 (VRF)',
    'reward.winConditions': '中奖条件',
    'reward.superJackpot': '超级头奖',
    'reward.jackpot': '头奖',
    'reward.first': '一等奖',
    'reward.second': '二等奖',
    'reward.third': '三等奖',
    'reward.small': '小奖',
    'reward.consolation': '安慰奖',
    'reward.middleOnly': '仅中间行有效',
    'reward.payline': '有效赔付',
    'reward.middleRow': '中间行',
    'reward.chainlinkVRF': 'Chainlink VRF 2.5',
    'reward.vrfDesc': '真随机数，5%资金自动充值Gas',
    'reward.moreLevel': '+3个更多奖励等级...',
    
    // 符号稀有度
    'rarity.legendary': '传说',
    'rarity.epic': '史诗',
    'rarity.rare': '稀有',
    'rarity.common': '普通',
    
    // 中奖条件描述
    'condition.superJackpot': '5×7️⃣',
    'condition.jackpot': '5×💎 或 4×7️⃣',
    'condition.first': '5个相同符号',
    'condition.second': '4×稀有符号',
    'condition.third': '4个普通符号',
    'condition.small': '3个相同符号',
    
    // 历史记录
    'history.title': '游戏记录',
    'history.subtitle': '查看最近的游戏记录和排行榜',
    'history.leaderboard': '中奖排行榜',
    'history.realtime': '实时',
    'history.wins': '次中奖',
    'history.noLeaderboard': '暂无排行榜数据',
    'history.recentWins': '最近中奖记录',
    'history.noWins': '暂无中奖记录',
    'history.totalSpins': '总游戏次数',
    'history.totalPaidOut': '总派奖金额',
    'history.onchain': '🔗',
    'history.justNow': '刚刚',
    'history.minutesAgo': '{n}分钟前',
    'history.hoursAgo': '{n}小时前',
    'history.daysAgo': '{n}天前',
    
    // 规则页面
    'rules.title': '游戏规则说明',
    'rules.subtitle': '一分钟看懂 Burn Slots 怎么玩',
    'rules.whatIsThis': '这是什么游戏？',
    'rules.simpleExplain': '简单来说：用代币换凭证 → 用凭证玩老虎机 → 中奖赢 BNB',
    'rules.highlight': '核心亮点：100% 通缩销毁，零平台抽成！',
    'rules.tokenBurnDesc': '你投入的代币会被 100% 销毁到黑洞地址，中奖奖金分配如下：',
    'rules.playerGet': '玩家获得',
    'rules.directToWallet': '直发钱包',
    'rules.operationFee': '运营费用',
    'rules.vrfGas': 'VRF Gas费',
    'rules.vrfNote': '5% 用于 Chainlink VRF 预言机 Gas 费，保障随机数公平生成',
    
    // 通缩机制
    'deflation.title': '🔥 通缩机制：玩游戏 = 销毁代币',
    'deflation.howItWorks': '💡 这是怎么运作的？',
    'deflation.step1Title': '代币换凭证 = 代币销毁',
    'deflation.step1Desc': '当你用代币兑换游戏凭证时，代币会被发送到黑洞地址永久销毁，不是转给平台！',
    'deflation.step2Title': '凭证用于游戏',
    'deflation.step2Desc': '你获得的凭证只能用于老虎机游戏，1:1比例，永久有效，无需每次授权',
    'deflation.step3Title': '中奖直接发 BNB',
    'deflation.step3Desc': '奖池是真实的 BNB，中奖后直接打到你钱包，不是代币！',
    
    // 对持币者/玩家的好处
    'benefits.holdersTitle': '✅ 对持币者的好处',
    'benefits.deflation': '持续通缩',
    'benefits.deflationDesc': '每次游戏都在销毁代币，流通量持续减少',
    'benefits.value': '价值支撑',
    'benefits.valueDesc': '销毁减少供应，理论上有助于代币升值',
    'benefits.utility': '真实用途',
    'benefits.utilityDesc': '代币有了实际应用场景，不只是炒作',
    'benefits.playersTitle': '🎮 对玩家的好处',
    'benefits.bnbReward': 'BNB奖励',
    'benefits.bnbRewardDesc': '中奖得到的是真金白银（BNB），不是空气币',
    'benefits.fair': '公平透明',
    'benefits.fairDesc': 'Chainlink VRF 保证随机，没人能作弊',
    'benefits.highOdds': '高概率中奖',
    'benefits.highOddsDesc': '约60%概率至少匹配2个符号拿安慰奖',
    
    // 一句话总结
    'summary.title': '🎯 一句话总结',
    'summary.flow': '玩家玩游戏 → 代币被销毁 → 流通量减少 → 币价有支撑 → 同时还有机会赢BNB',
    'summary.note': '这不是"消费"，而是一种有机会获得回报的通缩行为。你每玩一次，就为所有持币者做了贡献！',
    
    // 怎么玩
    'howToPlay.title': '怎么玩？（4步走）',
    'howToPlay.step1Title': '1. 连接钱包',
    'howToPlay.required': '必须',
    'howToPlay.step1Desc': '选择你常用的钱包连接到 BNB Smart Chain 网络：',
    'howToPlay.walletTip': '💡 没有钱包？推荐下载 MetaMask 或 TokenPocket',
    'howToPlay.step2Title': '2. 兑换游戏凭证',
    'howToPlay.important': '重要',
    'howToPlay.step2Desc': '用你的代币兑换游戏凭证，1:1 兑换，比如：',
    'howToPlay.step2Example': '100,000 代币 → 100,000 凭证',
    'howToPlay.step2Note': '⚠️ 凭证只能用于游戏，不能转让或提现',
    'howToPlay.step3Title': '3. 选择投注金额',
    'howToPlay.step3Desc': '最低 10,000 凭证 起投，可选择更高金额：',
    'howToPlay.step3Tip': '💡 投注越高，中奖概率越大！250K投注有20倍概率加成！',
    'howToPlay.step4Title': '4. 开始游戏！',
    'howToPlay.step4Desc': '点击"开始"按钮，5个转轮会开始转动。每个轮子停止后显示一个符号，根据5个符号中相同符号的数量判定中奖！',
    
    // 怎么算中奖
    'winRules.title': '怎么算中奖？',
    'winRules.basic': '🎯 基本规则',
    'winRules.rule1': '游戏有 5个转轮，每轮产生 1个符号',
    'winRules.rule2': '根据 5个符号中相同符号的数量 判定中奖',
    'winRules.rule3': '3个以上相同符号 就算中奖',
    'winRules.rule4': '界面显示3行，但只有 中间行（高亮行） 是实际结果',
    
    // 中奖等级示例
    'winExample.title': '🎰 中奖等级示例',
    
    // 安全说明
    'security.title': '🔒 这个游戏安全吗？',
    'security.deflationTitle': '通缩销毁 = 不可逆',
    'security.deflationDesc': '代币发送到黑洞地址 (0x000...dead)，任何人都无法取回，包括项目方',
    'security.adminTitle': '管理员权限有限',
    'security.adminDesc': '管理员只能设置代币汇率和维护暂停状态，不能提取奖池或修改中奖规则',
    'security.vrfTitle': 'VRF公平随机',
    'security.vrfDesc': '使用 Chainlink VRF 2.5 生成随机数，任何人都无法预测或操控结果',
    'security.fundsTitle': '资金不可挪用',
    'security.fundsDesc': '合约代码已部署上链，奖池资金只能用于派奖，无法被提走',
    
    // FAQ
    'faq.title': '❓ 常见问题',
    'faq.q1': '我的代币去哪了？',
    'faq.a1': '代币被销毁到黑洞地址，永久减少流通供应，不是被任何人拿走了',
    'faq.q2': '中奖后钱多久到账？',
    'faq.a2': 'VRF 回调确认后约 2-3 个区块（约 10 秒）自动到账',
    'faq.q3': '为什么显示"等待VRF回调"？',
    'faq.a3': 'Chainlink VRF 需要 2-3 个区块确认随机数，请耐心等待。如超过 1 小时未返回，可尝试解除卡住请求',
    'faq.q4': '凭证可以退回代币吗？',
    'faq.a4': '不可以。凭证只能用于游戏，代币已被销毁，这是不可逆的',
    
    // 页脚
    'footer.onchain': '链上版本 | 智能合约已连接',
    'footer.poweredBy': 'Powered by BNB Chain & Chainlink VRF',
    
    // 中奖弹窗
    'win.prize': '获得奖金',
    'win.clickToClose': '点击任意位置关闭',
    
    // 音频控制
    'audio.mute': '静音',
    'audio.unmute': '取消静音',
    'audio.bgMusicOn': '开启背景音乐',
    'audio.bgMusicOff': '关闭背景音乐',
  },
  en: {
    // Navigation
    'nav.game': 'Game',
    'nav.history': 'History',
    'nav.rules': 'Rules',
    
    // Home tags
    'home.tag.symbols': '5-Symbol Match',
    'home.tag.payline': 'Middle Row Pays',
    'home.tag.symbolCount': '10 Symbols',
    'home.tag.return': '100% Return',
    
    // Contract addresses
    'contract.game': 'Game Contract',
    'contract.token': 'Token Contract',
    'contract.copy': 'Copy Address',
    'contract.view': 'View on BSCScan',
    'contract.copied': 'Address Copied',
    'contract.pending': 'Pending...',
    
    // Jackpot ticker
    'jackpot.pool': 'Prize Pool',
    'jackpot.waiting': 'Waiting for first winner...',
    
    // Slot machine
    'slot.title': 'BURN SLOTS',
    'slot.subtitle': '5-Reel Symbol Match',
    'slot.return': '100% Return',
    'slot.onchain': 'On-Chain',
    'slot.pool': 'Pool',
    'slot.credits': 'Credits',
    'slot.winRate': 'Win Rate',
    'slot.spin': 'SPIN',
    'slot.spinning': 'Waiting...',
    'slot.connectWallet': 'Connect to Play',
    'slot.submitted': '🎰 Game Submitted',
    'slot.waitingVRF': 'Waiting for VRF callback...',
    'slot.noWin': 'No Win',
    'slot.tryAgain': 'Better luck next time!',
    'slot.pendingRequest': 'Pending spin request detected',
    'slot.waitingVRFCallback': 'Waiting for VRF callback; try to cancel if stuck for over 1 hour.',
    'slot.cancel': 'Cancel',
    'slot.unclaimedPrize': 'Unclaimed Prize',
    'slot.claim': 'Claim',
    'slot.claimed': 'Prize Claimed!',
    'slot.claimFailed': 'Claim Failed',
    'slot.cancelAttempt': 'Attempting to cancel stuck request',
    'slot.cancelSuccess': 'If timed out, your pending status will be reset.',
    'slot.cancelFailed': 'Cancel Failed',
    'slot.spinFailed': 'Spin Failed',
    'slot.revealing': 'Revealing...',
    'slot.waitingRandom': 'Waiting for randomness...',
    
    // Bet selector
    'bet.probability': 'Win Probability',
    'bet.boost': 'Boost',
    'bet.perSpin': 'Credits/Spin',
    'bet.credits': 'Bet Credits',
    'bet.moreCredits': 'More credits = higher odds',
    
    // Stats
    'stats.totalSpins': 'Total Spins',
    'stats.totalWins': 'Total Wins',
    
    // Auto spin
    'auto.title': 'Auto Spin',
    'auto.stop': 'Stop',
    'auto.remaining': 'Left',
    'auto.stopped': 'Auto Spin Stopped',
    'auto.completed': 'Auto Spin Complete',
    'auto.completedDesc': 'All auto spins completed',
    'auto.stoppedReason': 'Due to insufficient credits or other reasons',
    
    // Credits exchange
    'exchange.title': 'Burn Tokens for Credits',
    'exchange.notice': 'Burn tokens to get game credits (1:1 exchange). Credits are permanent, non-transferable, and can only be used in this wallet.',
    'exchange.tokenBalance': 'Token Balance',
    'exchange.gameCredits': 'Game Credits',
    'exchange.burn': 'Burn',
    'exchange.get': 'Get',
    'exchange.token': 'Tokens',
    'exchange.credit': 'Credits',
    'exchange.button': 'Burn Tokens for Credits',
    'exchange.burning': 'Burning...',
    'exchange.success': 'Exchange Success!',
    'exchange.successDesc': 'Burned {amount} tokens, got {amount} credits',
    'exchange.failed': 'Exchange Failed',
    'exchange.checkAuth': 'Please check authorization and balance',
    'exchange.insufficientTokens': 'Insufficient Tokens',
    'exchange.needTokens': 'Need {amount} tokens',
    
    // Wallet
    'wallet.connect': 'Connect Wallet',
    'wallet.connecting': 'Connecting...',
    'wallet.connected': 'Connected',
    'wallet.disconnect': 'Disconnect',
    'wallet.pleaseConnect': 'Please Connect Wallet',
    'wallet.needConnect': 'Connect wallet to start playing',
    'wallet.insufficientCredits': 'Insufficient Credits',
    'wallet.needCredits': 'Need {amount} credits. Please burn tokens first.',
    
    // Reward tiers
    'reward.title': 'Rewards & Payouts',
    'reward.deflation': '100% Deflationary Burn',
    'reward.noFee': 'Zero Fees',
    'reward.tokenBurn': 'Tokens 100% burned, prize distribution:',
    'reward.playerGet': 'Player Gets (Direct to Wallet)',
    'reward.vrfFee': 'VRF Operation Fee',
    'reward.vrfNote': '5% for Chainlink VRF Oracle Gas',
    'reward.maxPayout': 'Max Single Payout',
    'reward.poolPercent': 'of Pool',
    'reward.levels': 'Prize Levels',
    'reward.betBoost': 'Bet Probability Boost',
    'reward.higherBet': 'Higher bet = higher rare symbol chance',
    'reward.symbolOdds': 'Symbol Odds (VRF)',
    'reward.winConditions': 'Win Conditions',
    'reward.superJackpot': 'Super Jackpot',
    'reward.jackpot': 'Jackpot',
    'reward.first': '1st Prize',
    'reward.second': '2nd Prize',
    'reward.third': '3rd Prize',
    'reward.small': 'Small Win',
    'reward.consolation': 'Consolation',
    'reward.middleOnly': 'Middle row only',
    'reward.payline': 'Valid Payline',
    'reward.middleRow': 'Middle Row',
    'reward.chainlinkVRF': 'Chainlink VRF 2.5',
    'reward.vrfDesc': 'True randomness, 5% auto-funds Gas',
    'reward.moreLevel': '+3 more prize levels...',
    
    // Symbol rarity
    'rarity.legendary': 'Legendary',
    'rarity.epic': 'Epic',
    'rarity.rare': 'Rare',
    'rarity.common': 'Common',
    
    // Win conditions
    'condition.superJackpot': '5×7️⃣',
    'condition.jackpot': '5×💎 or 4×7️⃣',
    'condition.first': '5 of a kind',
    'condition.second': '4× Rare',
    'condition.third': '4× Common',
    'condition.small': '3 of a kind',
    
    // History
    'history.title': 'Game History',
    'history.subtitle': 'View recent games and leaderboard',
    'history.leaderboard': 'Win Leaderboard',
    'history.realtime': 'Live',
    'history.wins': 'wins',
    'history.noLeaderboard': 'No leaderboard data yet',
    'history.recentWins': 'Recent Wins',
    'history.noWins': 'No wins yet',
    'history.totalSpins': 'Total Spins',
    'history.totalPaidOut': 'Total Paid Out',
    'history.onchain': '🔗',
    'history.justNow': 'Just now',
    'history.minutesAgo': '{n}m ago',
    'history.hoursAgo': '{n}h ago',
    'history.daysAgo': '{n}d ago',
    
    // Rules page
    'rules.title': 'Game Rules',
    'rules.subtitle': 'Learn how to play Burn Slots in 1 minute',
    'rules.whatIsThis': 'What is this game?',
    'rules.simpleExplain': 'Simply: Burn tokens → Get credits → Play slots → Win BNB',
    'rules.highlight': 'Core highlight: 100% deflationary burn, zero platform fees!',
    'rules.tokenBurnDesc': 'Tokens you deposit are 100% burned to a dead address. Prize distribution:',
    'rules.playerGet': 'Player Gets',
    'rules.directToWallet': 'Direct to Wallet',
    'rules.operationFee': 'Operation Fee',
    'rules.vrfGas': 'VRF Gas',
    'rules.vrfNote': '5% for Chainlink VRF Oracle Gas to ensure fair randomness',
    
    // Deflation mechanism
    'deflation.title': '🔥 Deflation: Playing = Burning Tokens',
    'deflation.howItWorks': '💡 How does it work?',
    'deflation.step1Title': 'Tokens to Credits = Token Burn',
    'deflation.step1Desc': 'When you exchange tokens for credits, tokens are sent to a dead address and permanently burned, not transferred to the platform!',
    'deflation.step2Title': 'Credits for Gaming',
    'deflation.step2Desc': 'Credits can only be used for slots, 1:1 ratio, permanent, no repeated authorization needed',
    'deflation.step3Title': 'Wins Paid in BNB',
    'deflation.step3Desc': 'Prize pool is real BNB, wins go directly to your wallet, not tokens!',
    
    // Benefits
    'benefits.holdersTitle': '✅ Benefits for Holders',
    'benefits.deflation': 'Continuous Deflation',
    'benefits.deflationDesc': 'Every game burns tokens, reducing circulating supply',
    'benefits.value': 'Value Support',
    'benefits.valueDesc': 'Reduced supply theoretically helps token appreciation',
    'benefits.utility': 'Real Utility',
    'benefits.utilityDesc': 'Token has actual use case, not just speculation',
    'benefits.playersTitle': '🎮 Benefits for Players',
    'benefits.bnbReward': 'BNB Rewards',
    'benefits.bnbRewardDesc': 'Win real value (BNB), not worthless tokens',
    'benefits.fair': 'Fair & Transparent',
    'benefits.fairDesc': 'Chainlink VRF ensures randomness, no one can cheat',
    'benefits.highOdds': 'High Win Chance',
    'benefits.highOddsDesc': '~60% chance to match at least 2 symbols for consolation',
    
    // Summary
    'summary.title': '🎯 One-Line Summary',
    'summary.flow': 'Play game → Tokens burned → Supply decreases → Price supported → Plus chance to win BNB',
    'summary.note': 'This is not "spending" but deflationary action with potential returns. Every spin contributes to all holders!',
    
    // How to play
    'howToPlay.title': 'How to Play (4 Steps)',
    'howToPlay.step1Title': '1. Connect Wallet',
    'howToPlay.required': 'Required',
    'howToPlay.step1Desc': 'Connect your wallet to BNB Smart Chain network:',
    'howToPlay.walletTip': '💡 No wallet? Download MetaMask or TokenPocket',
    'howToPlay.step2Title': '2. Exchange for Credits',
    'howToPlay.important': 'Important',
    'howToPlay.step2Desc': 'Exchange tokens for game credits at 1:1, e.g.:',
    'howToPlay.step2Example': '100,000 Tokens → 100,000 Credits',
    'howToPlay.step2Note': '⚠️ Credits can only be used for gaming, non-transferable',
    'howToPlay.step3Title': '3. Choose Bet Amount',
    'howToPlay.step3Desc': 'Minimum 10,000 credits, higher bets available:',
    'howToPlay.step3Tip': '💡 Higher bet = higher win chance! 250K bet has 20x boost!',
    'howToPlay.step4Title': '4. Start Playing!',
    'howToPlay.step4Desc': 'Click "SPIN", 5 reels spin. After stopping, wins are based on matching symbols!',
    
    // Win rules
    'winRules.title': 'How to Win?',
    'winRules.basic': '🎯 Basic Rules',
    'winRules.rule1': 'Game has 5 reels, each produces 1 symbol',
    'winRules.rule2': 'Win based on number of matching symbols',
    'winRules.rule3': '3+ matching symbols = Win',
    'winRules.rule4': 'Display shows 3 rows, only middle row (highlighted) counts',
    
    // Win examples
    'winExample.title': '🎰 Win Level Examples',
    
    // Security
    'security.title': '🔒 Is This Game Safe?',
    'security.deflationTitle': 'Burn = Irreversible',
    'security.deflationDesc': 'Tokens sent to dead address (0x000...dead), no one can retrieve them, including the team',
    'security.adminTitle': 'Limited Admin Rights',
    'security.adminDesc': 'Admin can only set token rate and pause state, cannot withdraw pool or change win rules',
    'security.vrfTitle': 'VRF Fair Randomness',
    'security.vrfDesc': 'Chainlink VRF 2.5 generates random numbers, no one can predict or manipulate results',
    'security.fundsTitle': 'Funds Cannot Be Moved',
    'security.fundsDesc': 'Contract code is on-chain, pool funds can only be used for prizes, cannot be withdrawn',
    
    // FAQ
    'faq.title': '❓ FAQ',
    'faq.q1': 'Where did my tokens go?',
    'faq.a1': 'Tokens are burned to dead address, permanently reducing supply, not taken by anyone',
    'faq.q2': 'How long until prizes arrive?',
    'faq.a2': 'About 2-3 blocks (~10 seconds) after VRF confirmation, auto-delivered',
    'faq.q3': 'Why does it show "Waiting for VRF"?',
    'faq.a3': 'Chainlink VRF needs 2-3 blocks to confirm. Please wait. If over 1 hour, try canceling stuck request',
    'faq.q4': 'Can I get tokens back from credits?',
    'faq.a4': 'No. Credits can only be used for gaming, tokens are burned and irreversible',
    
    // Footer
    'footer.onchain': 'On-Chain Mode | Smart Contract Connected',
    'footer.poweredBy': 'Powered by BNB Chain & Chainlink VRF',
    
    // Win overlay
    'win.prize': 'Prize Won',
    'win.clickToClose': 'Click anywhere to close',
    
    // Audio controls
    'audio.mute': 'Mute',
    'audio.unmute': 'Unmute',
    'audio.bgMusicOn': 'Turn on background music',
    'audio.bgMusicOff': 'Turn off background music',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // 尝试从 localStorage 读取
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved === 'zh' || saved === 'en') {
        return saved;
      }
    }
    return 'zh'; // 默认中文
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
