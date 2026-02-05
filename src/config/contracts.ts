export const CYBER_SLOTS_ADDRESS = {
  mainnet: '0x0817E30b64a085022963B23c762001718D57B3f0',
  testnet: '0x0000000000000000000000000000000000000000',
};

// CyberPlinko 合约地址（部署后更新）
export const CYBER_PLINKO_ADDRESS = {
  mainnet: '0x0000000000000000000000000000000000000000', // 待部署
  testnet: '0x0000000000000000000000000000000000000000',
};

// CyberHiLo 合约地址
export const CYBER_HILO_ADDRESS = {
  mainnet: '0x5a17b1eAb23eEb1aa24bD774E9753B725F6B2F73',
  testnet: '0x0000000000000000000000000000000000000000',
};

 // CyberChainGame 击鼓传花合约地址（部署后更新）
 export const CYBER_CHAIN_GAME_ADDRESS = {
   mainnet: '0x0000000000000000000000000000000000000000', // 待部署
   testnet: '0x0000000000000000000000000000000000000000',
 };
 
// CYBER 代币合约地址（待部署后更新）
export const CYBER_TOKEN_ADDRESS = {
  mainnet: '0x23064e69e049eb1ee040c7068ce0b5fc4b107777',
  testnet: '0x0000000000000000000000000000000000000000',
};

export const CYBER_SLOTS_ABI = [
  // 游戏凭证函数
  "function depositCredits(uint256 amount) external",
  "function getCredits(address player) external view returns (uint256)",
  "function gameCredits(address player) external view returns (uint256)",
  // 游戏核心函数
  "function spin(uint256 betAmount) external returns (uint256 requestId)",
  "function claimPrize() external",
  "function cancelStuckRequest() external",
  // 查询函数
  "function getPrizePool() external view returns (uint256)",
  "function getAvailablePool() external view returns (uint256)",
  "function getPlayerStats(address player) external view returns (tuple(uint256 totalSpins, uint256 totalWins, uint256 totalWinnings, uint256 totalBet))",
  "function pendingRequest(address player) external view returns (uint256)",
  "function unclaimedPrizes(address player) external view returns (uint256)",
  "function totalSpins() external view returns (uint256)",
  "function totalPaidOut() external view returns (uint256)",
  "function totalOperationFees() external view returns (uint256)",
  "function totalCreditsDeposited() external view returns (uint256)",
  "function isValidBetAmount(uint256 amount) external pure returns (bool)",
  "function getBetMultiplier(uint256 betAmount) external pure returns (uint256)",
  // 常量
  "function BET_LEVEL_1() external pure returns (uint256)",
  "function BET_LEVEL_2() external pure returns (uint256)",
  "function BET_LEVEL_3() external pure returns (uint256)",
  "function BET_LEVEL_4() external pure returns (uint256)",
  "function BET_LEVEL_5() external pure returns (uint256)",
  "function BURN_ADDRESS() external pure returns (address)",
  "function REQUEST_TIMEOUT() external pure returns (uint256)",
  // 事件
  "event SpinRequested(address indexed player, uint256 indexed requestId, uint256 betAmount)",
  "event SpinResult(address indexed player, uint256 indexed requestId, uint8[5] symbols, uint256 winAmount, string prizeType)",
  "event PrizeClaimed(address indexed player, uint256 amount)",
  "event PrizeTransferFailed(address indexed player, uint256 amount)",
  "event OperationFeeSent(uint256 amount)",
  "event PrizePoolFunded(address indexed funder, uint256 amount)",
  "event ConfigUpdated(string configName)",
  "event TokensBurned(address indexed player, uint256 amount)",
  "event SpinCancelled(address indexed player, uint256 indexed requestId, uint256 refundAmount)",
  "event CreditsDeposited(address indexed player, uint256 amount)",
  "event CreditsUsed(address indexed player, uint256 amount)",
] as const;

export const CYBER_HILO_ABI = [
  // 凭证系统
  "function depositCredits(uint256 amount) external",
  "function getCredits(address player) external view returns (uint256)",
  "function gameCredits(address player) external view returns (uint256)",
  // 游戏核心函数
  "function startGame(uint256 betAmount) external returns (uint8 firstCard)",
  "function guess(uint8 guessType) external returns (uint256 requestId)",
  "function cashOut() external",
  "function claimPrize() external",
  "function cancelStuckRequest() external",
  // 查询函数
  "function getPrizePool() external view returns (uint256)",
  "function getAvailablePool() external view returns (uint256)",
  "function getPlayerStats(address player) external view returns (tuple(uint256 totalGames, uint256 totalWins, uint256 totalWinnings, uint256 totalBet, uint256 maxStreak))",
  "function getGameSession(address player) external view returns (tuple(address player, uint256 betAmount, uint8 betTierIndex, uint8 currentCard, uint8 currentStreak, uint256 prizePoolSnapshot, uint256 timestamp, bool active))",
  "function pendingRequest(address player) external view returns (uint256)",
  "function unclaimedPrizes(address player) external view returns (uint256)",
  "function totalGames() external view returns (uint256)",
  "function totalPaidOut() external view returns (uint256)",
  "function totalCreditsDeposited() external view returns (uint256)",
  "function isValidBetAmount(uint256 amount) external view returns (bool)",
  "function getBetTierIndex(uint256 betAmount) external view returns (uint8)",
  "function getMaxStreakForTier(uint8 tierIndex) external view returns (uint8)",
  "function calculateReward(uint8 streak, uint256 poolSnapshot) external view returns (uint256)",
  "function getBetLevels() external view returns (uint256[5])",
  "function getMaxStreaks() external view returns (uint8[5])",
  "function getRewardPercentages() external view returns (uint16[20])",
  // 事件
  "event GameStarted(address indexed player, uint256 betAmount, uint8 betTierIndex, uint8 firstCard, uint256 prizePoolSnapshot)",
  "event GuessRequested(address indexed player, uint256 indexed requestId, uint8 guessType)",
  "event GuessResult(address indexed player, uint256 indexed requestId, uint8 oldCard, uint8 newCard, bool won, uint8 streak, uint256 potentialReward)",
  "event GameCashedOut(address indexed player, uint256 grossPrize, uint256 playerPrize, uint8 finalStreak)",
  "event GameLost(address indexed player, uint8 lostAtStreak)",
  "event PrizeClaimed(address indexed player, uint256 amount)",
  "event PrizeTransferFailed(address indexed player, uint256 amount)",
  "event CreditsDeposited(address indexed player, uint256 amount)",
  "event CreditsUsed(address indexed player, uint256 amount)",
  "event PoolInsufficientForceSettled(address indexed player, uint8 streak, uint256 available, uint256 needed)",
] as const;

export const CYBER_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
] as const;

 // CyberChainGame 击鼓传花 ABI（优化版 - 支持大规模应用）
 export const CYBER_CHAIN_GAME_ABI = [
   // 核心游戏函数
   "function placeBid(uint256 tokenAmount) external",
   "function settleRound() external",
   "function claimRewards() external",
   // 查询函数
   "function getCurrentRound() external view returns (uint256 roundId, uint256 startTime, uint256 endTime, uint256 prizePool, uint256 currentBid, address currentHolder, uint256 participantCount, bool settled)",
   "function getTimeRemaining() external view returns (uint256)",
   "function getMinBid() external view returns (uint256)",
   "function getPlayerStats(address player) external view returns (uint256 wins, uint256 earnings, uint256 burned, uint256 pending)",
   "function getCurrentWinnerRate() external view returns (uint8)",
   "function pendingRewards(address player) external view returns (uint256)",
   "function totalRounds() external view returns (uint256)",
   "function totalBurned() external view returns (uint256)",
   "function totalPaidOut() external view returns (uint256)",
   // 优化版新增查询函数
   "function getRecentBids() external view returns (tuple(address bidder, uint128 amount, uint64 timestamp)[20])",
   "function hasPlayerParticipated(address player) external view returns (bool)",
   "function getRoundResult(uint256 roundId) external view returns (tuple(address winner, uint128 prize, uint128 prizePool, uint32 participantCount, uint64 endTime, uint8 winnerRate))",
   "function hasParticipated(uint256 roundId, address player) external view returns (bool)",
   "function settlementBonus() external view returns (uint256)",
   // 常量
   "function ROUND_DURATION() external pure returns (uint256)",
   "function BID_INCREMENT() external pure returns (uint256)",
   "function PLATFORM_RATE() external pure returns (uint256)",
   "function MIN_FIRST_BID() external pure returns (uint256)",
   "function MAX_RECENT_BIDS() external pure returns (uint8)",
   // 动态比例
   "function dynamicTiers(uint256 index) external view returns (uint16 minPlayers, uint16 maxPlayers, uint8 winnerRate)",
   // 事件（优化版）
   "event RoundStarted(uint256 indexed roundId, uint64 startTime, uint64 endTime)",
   "event BidPlaced(uint256 indexed roundId, address indexed player, uint256 tokensBurned, uint256 newBid, uint32 participantCount)",
   "event RoundSettled(uint256 indexed roundId, address indexed winner, uint256 prize, uint256 platformFee, uint32 participants, uint8 winnerRate)",
   "event PrizeSent(address indexed winner, uint256 amount)",
   "event PrizeSendFailed(address indexed winner, uint256 amount)",
   "event PlatformFeeSent(address indexed platform, uint256 amount)",
   "event FallbackRewardClaimed(address indexed player, uint256 amount)",
   "event PrizePoolFunded(address indexed funder, uint256 amount)",
   "event EmergencyWithdraw(address indexed to, uint256 amount)",
   "event SettlementBonusPaid(address indexed settler, uint256 amount)",
 ] as const;
 
export const SYMBOL_MAP: Record<number, string> = {
  0: '7️⃣',
  1: '💎',
  2: '👑',
  3: '🔔',
  4: '⭐',
  5: '🍒',
  6: '🍋',
  7: '🍊',
  8: '🍇',
  9: '🍀',
};

export const PRIZE_TYPE_MAP: Record<string, { name: string; emoji: string }> = {
  super_jackpot: { name: '超级头奖', emoji: '🎰' },
  jackpot: { name: '头奖', emoji: '💎' },
  first: { name: '一等奖', emoji: '👑' },
  second: { name: '二等奖', emoji: '🔔' },
  third: { name: '三等奖', emoji: '⭐' },
  small: { name: '小奖', emoji: '🍀' },
  consolation: { name: '安慰奖', emoji: '🎁' },
  none: { name: '未中奖', emoji: '' },
};

export const BET_LEVELS = [
  { value: 10000, label: '10K', multiplier: '1x' },
  { value: 25000, label: '25K', multiplier: '2.5x' },
  { value: 50000, label: '50K', multiplier: '5x' },
  { value: 100000, label: '100K', multiplier: '10x' },
  { value: 250000, label: '250K', multiplier: '20x' },
];

// HiLo 投注等级（单一门槛500K）
export const HILO_BET_LEVELS = [
  { value: 500000, label: '500K', tier: 'standard', maxStreak: 12 },
];

// HiLo 奖励百分比表（万分比，12级）
// 0.2%, 0.4%, 0.8%, 1.5%, 3%, 5%, 10%, 18%, 30%, 50%, 70%, 100%
export const HILO_REWARD_PERCENTAGES = [
  20, 40, 80, 150, 300, 500,     // 1-6连胜
  1000, 1800, 3000, 5000, 7000, 10000, // 7-12连胜
];
 
 // Chain Game 动态比例配置
 export const CHAIN_GAME_DYNAMIC_TIERS = [
   { minPlayers: 1, maxPlayers: 10, winnerRate: 35, label: '🥶 冷启动' },
   { minPlayers: 11, maxPlayers: 20, winnerRate: 42, label: '🌱 萌芽期' },
   { minPlayers: 21, maxPlayers: 30, winnerRate: 48, label: '🔥 活跃期' },
   { minPlayers: 31, maxPlayers: 40, winnerRate: 54, label: '🚀 热门期' },
   { minPlayers: 41, maxPlayers: Infinity, winnerRate: 60, label: '💎 爆发期' },
 ];
