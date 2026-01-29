export const CYBER_SLOTS_ADDRESS = {
  mainnet: '0x0000000000000000000000000000000000000000',
  testnet: '0x0000000000000000000000000000000000000000',
};

export const CYBER_TOKEN_ADDRESS = {
  mainnet: '0x0000000000000000000000000000000000000000',
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
  none: { name: '未中奖', emoji: '' },
};

export const BET_LEVELS = [
  { value: 20000, label: '20K', multiplier: '1x' },
  { value: 50000, label: '50K', multiplier: '2.5x' },
  { value: 100000, label: '100K', multiplier: '5x' },
  { value: 200000, label: '200K', multiplier: '10x' },
  { value: 500000, label: '500K', multiplier: '20x' },
];
