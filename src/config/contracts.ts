// CyberChainGame 巅峰竞拍合约地址
export const CYBER_CHAIN_GAME_ADDRESS = {
  mainnet: '0x32b84fe3Fc970cd25B485829143f348ef281d612',
  testnet: '0x0000000000000000000000000000000000000000',
};

// CYBER 代币合约地址
export const CYBER_TOKEN_ADDRESS = {
  mainnet: '0x20bccb81aee31e57749f599dc648467a267b7777',
  testnet: '0x0000000000000000000000000000000000000000',
};

export const CYBER_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
] as const;

// CyberChainGame 巅峰竞拍 ABI（优化版 - 支持大规模应用）
export const CYBER_CHAIN_GAME_ABI = [
  // 核心游戏函数
  "function placeBid(uint256 tokenAmount) external",
  "function settleRound() external",
  "function claimRewards() external",
  "function setToken(address _token) external",
  // 查询函数
  "function getCurrentRound() external view returns (uint256 roundId, uint256 startTime, uint256 endTime, uint256 prizePool, uint256 currentBid, address currentHolder, uint256 participantCount, bool settled)",
  "function getTimeRemaining() external view returns (uint256)",
  "function getMinBid() external view returns (uint256)",  // 动态返回: max(MIN_FIRST_BID, currentBid + 1)
  "function getPlayerStats(address player) external view returns (uint256 wins, uint256 earnings, uint256 burned, uint256 pending)",
  "function getCurrentWinnerRate() external view returns (uint8)",
  "function pendingRewards(address player) external view returns (uint256)",
  "function totalRounds() external view returns (uint256)",
  "function totalBurned() external view returns (uint256)",
  "function totalPaidOut() external view returns (uint256)",
  "function tokenSet() external view returns (bool)",
  "function getRecentBids() external view returns (tuple(address bidder, uint128 amount, uint64 timestamp)[20])",
  "function hasPlayerParticipated(address player) external view returns (bool)",
  "function getRoundResult(uint256 roundId) external view returns (tuple(address winner, uint128 prize, uint128 prizePool, uint32 participantCount, uint64 endTime, uint8 winnerRate))",
  "function hasParticipated(uint256 roundId, address player) external view returns (bool)",
  "function settlementBonus() external view returns (uint256)",
  "function settlementBonusPool() external view returns (uint256)",
  "function BURN_ADDRESS() external pure returns (address)",
  "function getBurnAddress() external pure returns (address)",
  "function roundDuration() external view returns (uint256)",
  // 常量
  "function PLATFORM_RATE() external pure returns (uint256)",
  "function MIN_FIRST_BID() external pure returns (uint256)",
  "function MAX_RECENT_BIDS() external pure returns (uint8)",
  // 动态比例
  "function dynamicTiers(uint256 index) external view returns (uint16 minPlayers, uint16 maxPlayers, uint8 winnerRate)",
  // 事件
  "event RoundStarted(uint256 indexed roundId, uint64 startTime, uint64 endTime)",
  "event BidPlaced(uint256 indexed roundId, address indexed player, uint256 tokensBurned, uint256 newBid, uint32 participantCount)",
  "event RoundSettled(uint256 indexed roundId, address indexed winner, uint256 prize, uint256 platformFee, uint32 participants, uint8 winnerRate)",
  "event PrizeSent(address indexed winner, uint256 amount)",
  "event PrizeSendFailed(address indexed winner, uint256 amount)",
  "event PlatformFeeSent(address indexed platform, uint256 amount)",
  "event FallbackRewardClaimed(address indexed player, uint256 amount)",
  "event PrizePoolFunded(address indexed funder, uint256 amount)",
  "event SettlementBonusPaid(address indexed settler, uint256 amount)",
  "event PlatformWalletChanged(address indexed oldWallet, address indexed newWallet)",
  "event SettlementBonusPoolFunded(uint256 amount)",
  "event TokenBurned(address indexed burner, uint256 amount)",
  "event RoundDurationChanged(uint256 oldDuration, uint256 newDuration)",
  "event TokenSet(address indexed tokenAddress)",
] as const;

// Chain Game 动态比例配置
export const CHAIN_GAME_DYNAMIC_TIERS = [
  { minPlayers: 1, maxPlayers: 10, winnerRate: 35, label: '🥶 冷启动' },
  { minPlayers: 11, maxPlayers: 20, winnerRate: 42, label: '🌱 萌芽期' },
  { minPlayers: 21, maxPlayers: 30, winnerRate: 48, label: '🔥 活跃期' },
  { minPlayers: 31, maxPlayers: 40, winnerRate: 54, label: '🚀 热门期' },
  { minPlayers: 41, maxPlayers: Infinity, winnerRate: 60, label: '💎 爆发期' },
];
