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
    'security.fairTitle': '为什么公平？',
    'security.vrfPoint1': '没有人能预测或操控结果',
    'security.vrfPoint2': '每个随机数都可以在链上验证',
    'security.vrfPoint3': '完全透明，任何人都能审计',
    'security.vrfGasNote': '奖池的 5% 会自动用于 VRF 预言机 Gas 费充值，确保服务持续运行',
    'security.contractTitle': '📜 智能合约自动执行',
    'security.contractDesc': '所有游戏逻辑都在智能合约中运行：',
    'security.contractPoint1': '代码开源，任何人可审计',
    'security.contractPoint2': '凭证消耗、奖励发放全自动',
    'security.contractPoint3': '没有人能修改规则或作弊',
    'security.contractPoint4': '奖池资金锁定在合约中',
    'security.viewContract': '查看智能合约',
    
    // 符号说明
    'symbols.title': '符号说明',
    'symbols.legendaryDesc': '最稀有，基础概率约1-2%',
    'symbols.epicDesc': '较稀有，基础概率约3-5%',
    'symbols.rareDesc': '基础概率约17%',
    'symbols.commonDesc': '基础概率约17%',
    'symbols.betTip': '投注越高，稀有符号出现概率越大！500K投注时稀有符号概率提升20倍',
    
    // 奖励描述
    'prizeDesc.superJackpot': '5个全是7️⃣',
    'prizeDesc.jackpot': '5个💎 或 4个7️⃣',
    'prizeDesc.first': '任意5个相同',
    'prizeDesc.second': '4个稀有符号相同',
    'prizeDesc.third': '4个普通符号相同',
    'prizeDesc.small': '任意3个相同',
    'prizeDesc.consolation': '任意2个相同',
    'prizePool.superJackpot': '奖池50%',
    'prizePool.jackpot': '奖池25%',
    'prizePool.first': '奖池13%',
    'prizePool.second': '奖池5%',
    'prizePool.third': '奖池1.7%',
    'prizePool.small': '奖池0.5%',
    'prizePool.consolation': '奖池0.1%',
    'prizeNote.maxPayout': '单次最大派奖不超过奖池的50%',
    
    // 示例
    'example.title': '📖 举个例子',
    'example.desc1': '假设当前奖池有 10 BNB，你投注后开出 [7️⃣ 💎 7️⃣ 7️⃣ 7️⃣]，其中有4个7️⃣，中了头奖！',
    'example.desc2': '奖金计算：10 × 25% = 2.5 BNB（扣除5%运营费后实得约 2.375 BNB）',
    
    // 管理员权限
    'admin.title': '🔒 管理员权限设计：只降不升',
    'admin.coreDesign': '⚡ 核心设计：投注门槛只能降低，不能提高',
    'admin.coreDesc': '智能合约内置了单向调整机制：管理员只有降低投注门槛的权限，永远无法提高门槛。',
    'admin.allowed': '✅ 允许的操作',
    'admin.allowedDesc': '降低门槛：例如 10K → 5K → 2K',
    'admin.allowedNote': '让更多玩家能参与游戏',
    'admin.forbidden': '❌ 禁止的操作',
    'admin.forbiddenDesc': '提高门槛：例如 10K → 20K → 50K',
    'admin.forbiddenNote': '合约代码层面完全禁止',
    'admin.whyTitle': '💡 为什么这样设计？',
    'admin.priceRise': '应对币价上涨',
    'admin.priceRiseDesc': '如果代币价格上涨10倍，原来 10K 代币可能价值就变得很高。管理员可以降低门槛到 1K，让普通玩家依然能玩得起。',
    'admin.protection': '保护玩家利益',
    'admin.protectionDesc': '防止管理员通过提高门槛来变相压榨玩家。如果能提高门槛，管理员可能在玩家充值凭证后突然提高投注要求。',
    'admin.guarantee': '🛡️ 这意味着什么？',
    'admin.point1': '你的凭证永远够用：门槛只会降低，你的凭证只会越来越"值钱"',
    'admin.point2': '中奖概率不变：调整门槛不会改变游戏概率，只影响每次投注的数量要求',
    'admin.point3': '代码层面保障：这不是承诺，是智能合约硬编码的规则，任何人都无法绕过',
    'admin.techTitle': '📝 技术实现',
    'admin.techNote': '合约代码强制要求：新门槛 ≤ 旧门槛',
    'admin.techDesc': '这段代码写在智能合约里，部署后永远无法修改。任何尝试提高门槛的交易都会被自动拒绝。',
    'admin.fundsTitle': '🔐 合约开源 + 资金不可提取',
    'admin.fundsDesc': '我们的智能合约采用完全去中心化设计，代码完全开源，任何人都可以审计验证。',
    'admin.openSource': '📖 代码开源',
    'admin.openSourceDesc1': '合约代码在 BSCScan 上完全公开',
    'admin.openSourceDesc2': '任何人都可以查看、审计代码逻辑',
    'admin.openSourceNote': '没有任何隐藏后门',
    'admin.noWithdraw': '🚫 无提款权限',
    'admin.noWithdrawDesc1': '管理员没有任何函数可以提取奖池资金',
    'admin.noWithdrawDesc2': '合约内的 BNB 只能通过中奖发放',
    'admin.noWithdrawNote': '资金只出不进（对管理员）',
    'admin.meaning': '💰 这意味着什么？',
    'admin.meaningPoint1': '奖池里的钱只能被玩家赢走，管理员拿不到一分',
    'admin.meaningPoint2': '不存在"跑路"风险 —— 因为根本没有跑路的代码入口',
    'admin.meaningPoint3': '即使项目方消失，合约依然正常运行，奖池依然可以被赢取',
    'admin.conclusion': '这是真正的去中心化游戏：规则由代码执行，不由人控制。你可以在区块浏览器上亲自查看合约代码，验证我们说的每一句话。',
    
    // FAQ扩展
    'faq.title': '❓ 常见问题',
    'faq.q1': '我的代币去哪了？',
    'faq.a1': '代币被销毁到黑洞地址，永久减少流通供应，不是被任何人拿走了',
    'faq.q2': '中奖后钱多久到账？',
    'faq.a2': 'VRF 回调确认后约 2-3 个区块（约 10 秒）自动到账',
    'faq.q3': '为什么显示"等待VRF回调"？',
    'faq.a3': 'Chainlink VRF 需要 2-3 个区块确认随机数，请耐心等待。如超过 1 小时未返回，可尝试解除卡住请求',
    'faq.q4': '凭证可以退回代币吗？',
    'faq.a4': '不可以。凭证只能用于游戏，代币已被销毁，这是不可逆的',
    'faq.poolSource': '💰 奖池的钱从哪来？',
    'faq.poolSourceAnswer1': '奖池资金来源于交易税的 3%！',
    'faq.poolSourceAnswer2': '每一笔代币交易（买入/卖出）都会产生交易税，其中 3% 会自动进入游戏奖池，用于奖励中奖玩家。',
    'faq.poolSourceNote': '工作原理：交易税 → 自动兑换为 BNB → 注入奖池合约',
    'faq.poolSourceTip': '交易越活跃，奖池越大，中奖奖励越多！',
    'faq.whyCredits': '为什么要用凭证而不是直接用代币？',
    'faq.whyCreditsAnswer': '凭证系统可以减少链上交易次数，节省 Gas 费。你可以一次兑换大量凭证，然后多次游戏，体验更流畅。',
    'faq.higherBet': '投注越高真的概率越大吗？',
    'faq.higherBetAnswer': '是的！高投注会增加稀有符号（如7️⃣💎）的出现概率。500K投注相比20K有20倍的概率加成，但请量力而行。',
    
    // 赔付表
    'payoutTable.title': '完整赔付表',
    
    // 页脚
    'footer.onchain': '链上版本 | 智能合约已连接',
    'footer.poweredBy': 'Powered by BNB Chain & Chainlink VRF',
    
    // 中奖弹窗
    'win.prize': '获得奖金',
    'win.clickToClose': '点击任意位置关闭',
    
    // 钱包提示
    'howToPlay.binanceWallet': '币安钱包',
    
    // 音频控制
    'audio.mute': '静音',
    'audio.unmute': '取消静音',
    'audio.bgMusicOn': '开启背景音乐',
    'audio.bgMusicOff': '关闭背景音乐',
    
    // 自动旋转
    'autoSpin.title': '自动旋转',
    'autoSpin.remaining': '自动',
    'autoSpin.stop': '停止',
    'autoSpin.selectCount': '选择自动旋转次数',
    'autoSpin.times': '次',
    'autoSpin.start': '开始自动',
    'autoSpin.hint': '中途可随时点击停止',
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
    'security.vrfTitle': '🔗 Chainlink VRF 2.5 Randomness',
    'security.vrfDesc': 'Chainlink VRF 2.5 generates random numbers, no one can predict or manipulate results',
    'security.fundsTitle': 'Funds Cannot Be Moved',
    'security.fundsDesc': 'Contract code is on-chain, pool funds can only be used for prizes, cannot be withdrawn',
    'security.fairTitle': 'Why Is It Fair?',
    'security.vrfPoint1': 'No one can predict or manipulate results',
    'security.vrfPoint2': 'Every random number is verifiable on-chain',
    'security.vrfPoint3': 'Fully transparent, anyone can audit',
    'security.vrfGasNote': '5% of pool auto-funds VRF oracle gas to ensure continuous service',
    'security.contractTitle': '📜 Smart Contract Auto-Execution',
    'security.contractDesc': 'All game logic runs in smart contracts:',
    'security.contractPoint1': 'Open source, anyone can audit',
    'security.contractPoint2': 'Credit consumption, reward distribution fully automated',
    'security.contractPoint3': 'No one can modify rules or cheat',
    'security.contractPoint4': 'Pool funds locked in contract',
    'security.viewContract': 'View Smart Contract',
    
    // Symbols
    'symbols.title': 'Symbol Guide',
    'symbols.legendaryDesc': 'Rarest, base odds ~1-2%',
    'symbols.epicDesc': 'Quite rare, base odds ~3-5%',
    'symbols.rareDesc': 'Base odds ~17%',
    'symbols.commonDesc': 'Base odds ~17%',
    'symbols.betTip': 'Higher bets increase rare symbol odds. 500K bet = 20x boost!',
    
    // Prize descriptions
    'prizeDesc.superJackpot': '5×7️⃣',
    'prizeDesc.jackpot': '5×💎 or 4×7️⃣',
    'prizeDesc.first': 'Any 5 same',
    'prizeDesc.second': '4× rare same',
    'prizeDesc.third': '4× common same',
    'prizeDesc.small': 'Any 3 same',
    'prizeDesc.consolation': 'Any 2 same',
    'prizePool.superJackpot': '50% Pool',
    'prizePool.jackpot': '25% Pool',
    'prizePool.first': '13% Pool',
    'prizePool.second': '5% Pool',
    'prizePool.third': '1.7% Pool',
    'prizePool.small': '0.5% Pool',
    'prizePool.consolation': '0.1% Pool',
    'prizeNote.maxPayout': 'Max payout per spin: 50% of pool',
    
    // Example
    'example.title': '📖 Example',
    'example.desc1': 'If pool has 10 BNB and you spin [7️⃣ 💎 7️⃣ 7️⃣ 7️⃣], you got 4×7️⃣ - Jackpot!',
    'example.desc2': 'Prize: 10 × 25% = 2.5 BNB (minus 5% fee ≈ 2.375 BNB)',
    
    // Admin rights
    'admin.title': '🔒 Admin Design: Only Reduce, Never Increase',
    'admin.coreDesign': '⚡ Core: Bet threshold can only be lowered',
    'admin.coreDesc': 'Smart contract has one-way adjustment: admin can only lower thresholds, never raise them.',
    'admin.allowed': '✅ Allowed',
    'admin.allowedDesc': 'Lower threshold: 10K → 5K → 2K',
    'admin.allowedNote': 'More players can participate',
    'admin.forbidden': '❌ Forbidden',
    'admin.forbiddenDesc': 'Raise threshold: 10K → 20K → 50K',
    'admin.forbiddenNote': 'Blocked at code level',
    'admin.whyTitle': '💡 Why This Design?',
    'admin.priceRise': 'Adapt to price increase',
    'admin.priceRiseDesc': 'If token price rises 10x, 10K tokens become very valuable. Admin can lower threshold to 1K so players can still afford to play.',
    'admin.protection': 'Protect players',
    'admin.protectionDesc': 'Prevents admin from raising thresholds to squeeze players after they deposit credits.',
    'admin.guarantee': '🛡️ What This Means',
    'admin.point1': 'Your credits always work: thresholds only go down, your credits become more "valuable"',
    'admin.point2': 'Win odds unchanged: threshold changes only affect bet amount requirements',
    'admin.point3': 'Code-level guarantee: hardcoded rule, no workaround possible',
    'admin.techTitle': '📝 Technical Implementation',
    'admin.techNote': 'Contract enforces: new threshold ≤ old threshold',
    'admin.techDesc': 'This code is in the smart contract, immutable after deployment. Any attempt to raise threshold is auto-rejected.',
    'admin.fundsTitle': '🔐 Open Source + Non-Withdrawable Funds',
    'admin.fundsDesc': 'Our smart contract is fully decentralized. Code is open source, anyone can audit.',
    'admin.openSource': '📖 Open Source',
    'admin.openSourceDesc1': 'Contract code public on BSCScan',
    'admin.openSourceDesc2': 'Anyone can view and audit code logic',
    'admin.openSourceNote': 'No hidden backdoors',
    'admin.noWithdraw': '🚫 No Withdraw Function',
    'admin.noWithdrawDesc1': 'Admin has no function to withdraw pool funds',
    'admin.noWithdrawDesc2': 'BNB only distributed via wins',
    'admin.noWithdrawNote': 'Funds out only (for admin)',
    'admin.meaning': '💰 What This Means',
    'admin.meaningPoint1': 'Pool can only be won by players, admin gets nothing',
    'admin.meaningPoint2': 'No "rug pull" risk - no code entry for it',
    'admin.meaningPoint3': 'Even if team disappears, contract runs, pool remains winnable',
    'admin.conclusion': 'This is true decentralized gaming: rules by code, not people. Check the contract yourself on block explorer.',
    
    // FAQ extended
    'faq.title': '❓ FAQ',
    'faq.q1': 'Where did my tokens go?',
    'faq.a1': 'Tokens are burned to dead address, permanently reducing supply, not taken by anyone',
    'faq.q2': 'How long until prizes arrive?',
    'faq.a2': 'About 2-3 blocks (~10 seconds) after VRF confirmation, auto-delivered',
    'faq.q3': 'Why does it show "Waiting for VRF"?',
    'faq.a3': 'Chainlink VRF needs 2-3 blocks to confirm. Please wait. If over 1 hour, try canceling stuck request',
    'faq.q4': 'Can I get tokens back from credits?',
    'faq.a4': 'No. Credits can only be used for gaming, tokens are burned and irreversible',
    'faq.poolSource': '💰 Where does pool money come from?',
    'faq.poolSourceAnswer1': 'Prize pool funded by 3% of trading tax!',
    'faq.poolSourceAnswer2': 'Every token trade (buy/sell) generates tax, 3% goes to game pool for winners.',
    'faq.poolSourceNote': 'How it works: Tax → Auto-swap to BNB → Inject to pool contract',
    'faq.poolSourceTip': 'More trading = bigger pool = bigger prizes!',
    'faq.whyCredits': 'Why use credits instead of tokens directly?',
    'faq.whyCreditsAnswer': 'Credit system reduces on-chain transactions, saving gas. Exchange once, play many times, smoother experience.',
    'faq.higherBet': 'Higher bet really means higher odds?',
    'faq.higherBetAnswer': 'Yes! Higher bets increase rare symbol (7️⃣💎) appearance. 500K bet has 20x odds boost vs 20K, but bet responsibly.',
    
    // Payout table
    'payoutTable.title': 'Full Payout Table',
    
    // Footer
    'footer.onchain': 'On-Chain Mode | Smart Contract Connected',
    'footer.poweredBy': 'Powered by BNB Chain & Chainlink VRF',
    
    // Win overlay
    'win.prize': 'Prize Won',
    'win.clickToClose': 'Click anywhere to close',
    
    // Wallet
    'howToPlay.binanceWallet': 'Binance Wallet',
    
    // Audio controls
    'audio.mute': 'Mute',
    'audio.unmute': 'Unmute',
    'audio.bgMusicOn': 'Turn on background music',
    'audio.bgMusicOff': 'Turn off background music',
    
    // Auto spin
    'autoSpin.title': 'Auto Spin',
    'autoSpin.remaining': 'Auto',
    'autoSpin.stop': 'Stop',
    'autoSpin.selectCount': 'Select auto spin count',
    'autoSpin.times': 'x',
    'autoSpin.start': 'Start Auto',
    'autoSpin.hint': 'Click stop anytime',
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
