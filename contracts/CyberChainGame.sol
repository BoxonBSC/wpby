 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.19;
 
 import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
 import "@openzeppelin/contracts/access/Ownable.sol";
 import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
 
 /**
  * @title CyberChainGame
  * @dev 击鼓传花游戏合约
  * 
  * 经济模型：
  * - 玩家燃烧代币参与竞价
  * - 奖池BNB来自代币交易税（自动打入合约）
  * - 每轮1小时，整点结算
  * - 每次加价10%
  * - 动态奖励比例（35%-60%按人数）
  * - 100%奖池给最终赢家，剩余滚存下一轮
  */
 contract CyberChainGame is Ownable, ReentrancyGuard {
     using SafeERC20 for IERC20;
 
     // ============ 常量 ============
     uint256 public constant ROUND_DURATION = 1 hours;
     uint256 public constant BID_INCREMENT = 10; // 10% 加价
     uint256 public constant MIN_FIRST_BID = 10000 * 1e18; // 首次最低出价 10000 代币
 
     // 动态奖励比例（按参与人数）
     struct DynamicTier {
         uint16 minPlayers;
         uint16 maxPlayers;
         uint8 winnerRate; // 赢家获得奖池的百分比
     }
 
     DynamicTier[5] public dynamicTiers;
 
     // ============ 状态变量 ============
     IERC20 public immutable token;
     address public platformWallet;
 
     // 当前轮次信息
     struct Round {
         uint256 roundId;
         uint256 startTime;
         uint256 endTime;
         uint256 prizePool;
         uint256 currentBid;
         address currentHolder;
         address[] participants;
         bool settled;
     }
 
     Round public currentRound;
     uint256 public totalRounds;
     uint256 public totalBurned;
     uint256 public totalPaidOut;
 
     // 玩家统计
     mapping(address => uint256) public playerWins;
     mapping(address => uint256) public playerEarnings;
     mapping(address => uint256) public playerBurned;
 
     // 历史记录
     mapping(uint256 => Round) public roundHistory;
 
     // 待领取奖励
     mapping(address => uint256) public pendingRewards;
 
     // ============ 事件 ============
     event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 endTime);
     event BidPlaced(
         uint256 indexed roundId,
         address indexed player,
         uint256 tokensBurned,
         uint256 newBid
     );
     event RoundSettled(
         uint256 indexed roundId,
         address indexed winner,
         uint256 prize,
         uint256 participants,
         uint8 winnerRate
     );
     event RewardClaimed(address indexed player, uint256 amount);
     event PrizePoolFunded(address indexed funder, uint256 amount);
     event EmergencyWithdraw(address indexed to, uint256 amount);
 
     // ============ 构造函数 ============
     constructor(address _token, address _platformWallet) {
         require(_token != address(0), "Invalid token");
         require(_platformWallet != address(0), "Invalid platform wallet");
         
         token = IERC20(_token);
         platformWallet = _platformWallet;
 
         // 初始化动态比例
         dynamicTiers[0] = DynamicTier(1, 10, 35);   // 1-10人: 35%
         dynamicTiers[1] = DynamicTier(11, 20, 42);  // 11-20人: 42%
         dynamicTiers[2] = DynamicTier(21, 30, 48);  // 21-30人: 48%
         dynamicTiers[3] = DynamicTier(31, 40, 54);  // 31-40人: 54%
         dynamicTiers[4] = DynamicTier(41, 65535, 60); // 41+人: 60%
 
         // 启动第一轮
         _startNewRound();
     }
 
     // ============ 接收BNB（交易税自动打入）============
     receive() external payable {
         currentRound.prizePool += msg.value;
         emit PrizePoolFunded(msg.sender, msg.value);
     }
 
     // ============ 核心游戏函数 ============
 
     /**
      * @dev 出价竞拍
      * @param tokenAmount 燃烧的代币数量
      */
     function placeBid(uint256 tokenAmount) external nonReentrant {
         // 检查并结算过期轮次
         if (block.timestamp >= currentRound.endTime && !currentRound.settled) {
             _settleRound();
             _startNewRound();
         }
 
         require(block.timestamp < currentRound.endTime, "Round ended");
         require(tokenAmount > 0, "Amount must be > 0");
 
         // 计算最低出价要求
         uint256 minBid;
         if (currentRound.currentBid == 0) {
             minBid = MIN_FIRST_BID;
         } else {
             minBid = currentRound.currentBid * (100 + BID_INCREMENT) / 100;
         }
         require(tokenAmount >= minBid, "Bid too low");
 
         // 转移并燃烧代币
         token.safeTransferFrom(msg.sender, address(0xdead), tokenAmount);
         totalBurned += tokenAmount;
         playerBurned[msg.sender] += tokenAmount;
 
         // 更新当前持有人
         currentRound.currentHolder = msg.sender;
         currentRound.currentBid = tokenAmount;
 
         // 记录参与者（去重）
         bool isNewParticipant = true;
         for (uint i = 0; i < currentRound.participants.length; i++) {
             if (currentRound.participants[i] == msg.sender) {
                 isNewParticipant = false;
                 break;
             }
         }
         if (isNewParticipant) {
             currentRound.participants.push(msg.sender);
         }
 
         emit BidPlaced(
             currentRound.roundId,
             msg.sender,
             tokenAmount,
             currentRound.currentBid
         );
     }
 
     /**
      * @dev 结算当前轮次（任何人可调用）
      */
     function settleRound() external nonReentrant {
         require(block.timestamp >= currentRound.endTime, "Round not ended");
         require(!currentRound.settled, "Already settled");
         
         _settleRound();
         _startNewRound();
     }
 
     /**
      * @dev 领取奖励
      */
     function claimRewards() external nonReentrant {
         uint256 amount = pendingRewards[msg.sender];
         require(amount > 0, "No rewards");
         
         pendingRewards[msg.sender] = 0;
         
         (bool success, ) = payable(msg.sender).call{value: amount}("");
         require(success, "Transfer failed");
         
         playerEarnings[msg.sender] += amount;
         totalPaidOut += amount;
         
         emit RewardClaimed(msg.sender, amount);
     }
 
     // ============ 内部函数 ============
 
     function _startNewRound() internal {
         totalRounds++;
         
         // 计算下一个整点
         uint256 currentHour = block.timestamp / ROUND_DURATION;
         uint256 startTime = currentHour * ROUND_DURATION;
         uint256 endTime = startTime + ROUND_DURATION;
         
         // 如果当前时间已经过了这个整点，使用下一个整点
         if (block.timestamp >= endTime) {
             startTime = endTime;
             endTime = startTime + ROUND_DURATION;
         }
 
         // 继承上一轮滚存的奖池
         uint256 inheritedPool = currentRound.prizePool;
 
         currentRound = Round({
             roundId: totalRounds,
             startTime: startTime,
             endTime: endTime,
             prizePool: inheritedPool,
             currentBid: 0,
             currentHolder: address(0),
             participants: new address[](0),
             settled: false
         });
 
         emit RoundStarted(totalRounds, startTime, endTime);
     }
 
     function _settleRound() internal {
         currentRound.settled = true;
 
         // 保存历史记录
         roundHistory[currentRound.roundId] = currentRound;
 
         // 如果有赢家
         if (currentRound.currentHolder != address(0) && currentRound.prizePool > 0) {
             // 计算动态奖励比例
             uint8 winnerRate = _getWinnerRate(uint16(currentRound.participants.length));
             
             // 计算赢家奖励
             uint256 winnerPrize = currentRound.prizePool * winnerRate / 100;
             uint256 rollover = currentRound.prizePool - winnerPrize;
 
             // 发放赢家奖励
             pendingRewards[currentRound.currentHolder] += winnerPrize;
             playerWins[currentRound.currentHolder]++;
 
             // 滚存到下一轮
             currentRound.prizePool = rollover;
 
             emit RoundSettled(
                 currentRound.roundId,
                 currentRound.currentHolder,
                 winnerPrize,
                 currentRound.participants.length,
                 winnerRate
             );
         } else {
             // 无人参与，奖池全部滚存
             emit RoundSettled(currentRound.roundId, address(0), 0, 0, 0);
         }
     }
 
     function _getWinnerRate(uint16 playerCount) internal view returns (uint8) {
         for (uint i = 0; i < 5; i++) {
             if (playerCount >= dynamicTiers[i].minPlayers && 
                 playerCount <= dynamicTiers[i].maxPlayers) {
                 return dynamicTiers[i].winnerRate;
             }
         }
         return 35; // 默认最低比例
     }
 
     // ============ 查询函数 ============
 
     function getCurrentRound() external view returns (
         uint256 roundId,
         uint256 startTime,
         uint256 endTime,
         uint256 prizePool,
         uint256 currentBid,
         address currentHolder,
         uint256 participantCount,
         bool settled
     ) {
         return (
             currentRound.roundId,
             currentRound.startTime,
             currentRound.endTime,
             currentRound.prizePool,
             currentRound.currentBid,
             currentRound.currentHolder,
             currentRound.participants.length,
             currentRound.settled
         );
     }
 
     function getParticipants() external view returns (address[] memory) {
         return currentRound.participants;
     }
 
     function getTimeRemaining() external view returns (uint256) {
         if (block.timestamp >= currentRound.endTime) return 0;
         return currentRound.endTime - block.timestamp;
     }
 
     function getMinBid() external view returns (uint256) {
         if (currentRound.currentBid == 0) {
             return MIN_FIRST_BID;
         }
         return currentRound.currentBid * (100 + BID_INCREMENT) / 100;
     }
 
     function getPlayerStats(address player) external view returns (
         uint256 wins,
         uint256 earnings,
         uint256 burned,
         uint256 pending
     ) {
         return (
             playerWins[player],
             playerEarnings[player],
             playerBurned[player],
             pendingRewards[player]
         );
     }
 
     function getCurrentWinnerRate() external view returns (uint8) {
         return _getWinnerRate(uint16(currentRound.participants.length));
     }
 
     // ============ 管理函数 ============
 
     function setPlatformWallet(address _wallet) external onlyOwner {
         require(_wallet != address(0), "Invalid address");
         platformWallet = _wallet;
     }
 
     function updateDynamicTier(
         uint8 index,
         uint16 minPlayers,
         uint16 maxPlayers,
         uint8 winnerRate
     ) external onlyOwner {
         require(index < 5, "Invalid index");
         require(winnerRate <= 60, "Rate too high"); // 最高60%
         dynamicTiers[index] = DynamicTier(minPlayers, maxPlayers, winnerRate);
     }
 
     // 紧急提取（仅限紧急情况）
     function emergencyWithdraw() external onlyOwner {
         uint256 balance = address(this).balance;
         require(balance > 0, "No balance");
         
         (bool success, ) = payable(owner()).call{value: balance}("");
         require(success, "Transfer failed");
         
         emit EmergencyWithdraw(owner(), balance);
     }
 }