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
] as const;

export const CYBER_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
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

// HiLo 投注等级（匹配合约）
export const HILO_BET_LEVELS = [
  { value: 50000, label: '50K', tier: 'bronze', maxStreak: 5 },
  { value: 100000, label: '100K', tier: 'silver', maxStreak: 8 },
  { value: 200000, label: '200K', tier: 'gold', maxStreak: 12 },
  { value: 500000, label: '500K', tier: 'platinum', maxStreak: 16 },
  { value: 1000000, label: '1M', tier: 'diamond', maxStreak: 20 },
];

// HiLo 奖励百分比表（万分比，匹配合约）
export const HILO_REWARD_PERCENTAGES = [
  2, 5, 10, 15, 25,      // 1-5连胜
  40, 60, 100, 150, 250, // 6-10连胜
  400, 600, 900, 1300, 1800, // 11-15连胜
  2500, 3500, 5000, 7000, 10000, // 16-20连胜
];
