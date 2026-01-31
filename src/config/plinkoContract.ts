// CyberPlinko 合约 ABI
export const CYBER_PLINKO_ABI = [
  // 游戏凭证函数
  "function depositCredits(uint256 amount) external",
  "function getCredits(address player) external view returns (uint256)",
  "function gameCredits(address player) external view returns (uint256)",
  
  // 游戏核心函数
  "function drop(uint256 betAmount) external returns (uint256 requestId)",
  "function claimPrize() external",
  "function cancelStuckRequest() external",
  
  // 查询函数
  "function getPrizePool() external view returns (uint256)",
  "function getAvailablePool() external view returns (uint256)",
  "function getPlayerStats(address player) external view returns (tuple(uint256 totalDrops, uint256 totalWins, uint256 totalWinnings, uint256 totalBet))",
  "function pendingRequest(address player) external view returns (uint256)",
  "function unclaimedPrizes(address player) external view returns (uint256)",
  "function totalDrops() external view returns (uint256)",
  "function totalPaidOut() external view returns (uint256)",
  "function totalOperationFees() external view returns (uint256)",
  "function totalCreditsDeposited() external view returns (uint256)",
  "function isValidBetAmount(uint256 amount) external view returns (bool)",
  "function getBetLevels() external view returns (uint256[5])",
  "function getSlotReward(uint256 slotIndex) external view returns (tuple(uint8 rewardType, uint256 poolPercent, uint256 maxBNB, uint256 fixedBNB))",
  
  // 常量
  "function BURN_ADDRESS() external pure returns (address)",
  "function REQUEST_TIMEOUT() external pure returns (uint256)",
  "function betLevel1() external view returns (uint256)",
  "function betLevel2() external view returns (uint256)",
  "function betLevel3() external view returns (uint256)",
  "function betLevel4() external view returns (uint256)",
  "function betLevel5() external view returns (uint256)",
  
  // 事件
  "event DropRequested(address indexed player, uint256 indexed requestId, uint256 betAmount)",
  "event DropResult(address indexed player, uint256 indexed requestId, uint256 slotIndex, uint256 winAmount, uint8 rewardType)",
  "event PrizeClaimed(address indexed player, uint256 amount)",
  "event PrizeTransferFailed(address indexed player, uint256 amount)",
  "event OperationFeeSent(uint256 amount)",
  "event PrizePoolFunded(address indexed funder, uint256 amount)",
  "event ConfigUpdated(string configName)",
  "event TokensBurned(address indexed player, uint256 amount)",
  "event DropCancelled(address indexed player, uint256 indexed requestId)",
  "event CreditsDeposited(address indexed player, uint256 amount)",
  "event CreditsUsed(address indexed player, uint256 amount)",
] as const;

// 奖励类型映射
export const PLINKO_REWARD_TYPE_MAP: Record<number, { name: string; emoji: string }> = {
  0: { name: '未中奖', emoji: '' },
  1: { name: '小奖', emoji: '✨' },
  2: { name: '中奖', emoji: '🎊' },
  3: { name: '大奖', emoji: '🎉' },
  4: { name: '超级大奖', emoji: '🏆' },
};

// 获取奖励类型名称
export function getRewardTypeName(type: number): string {
  return PLINKO_REWARD_TYPE_MAP[type]?.name || '未知';
}

// 获取奖励类型emoji
export function getRewardTypeEmoji(type: number): string {
  return PLINKO_REWARD_TYPE_MAP[type]?.emoji || '';
}
