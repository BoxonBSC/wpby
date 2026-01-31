// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CyberHiLo
 * @notice HiLo猜大小游戏合约 - Owner无资金提取权限
 * @dev 使用Chainlink VRF 2.5进行可验证随机数生成
 * 
 * 安全特性：
 * - Owner无法提取或转移奖池资金
 * - 仅可通过fundPrizePool注入资金
 * - 玩家奖励直接发放，无中间托管
 * 
 * 游戏机制（匹配前端）：
 * - 5门槛等级，每个等级有不同的最大连胜限制
 * - 20级固定奖励百分比表
 * - 猜大小，相同视为输
 */
contract CyberHiLo is VRFConsumerBaseV2Plus, Ownable, ReentrancyGuard, Pausable {
    
    // ============ 5门槛等级配置（匹配前端） ============
    // 青铜50K, 白银100K, 黄金200K, 铂金500K, 钻石1M
    uint256 public betLevel1 = 50000 * 10**18;    // 青铜 - maxStreak=5
    uint256 public betLevel2 = 100000 * 10**18;   // 白银 - maxStreak=8
    uint256 public betLevel3 = 200000 * 10**18;   // 黄金 - maxStreak=12
    uint256 public betLevel4 = 500000 * 10**18;   // 铂金 - maxStreak=16
    uint256 public betLevel5 = 1000000 * 10**18;  // 钻石 - maxStreak=20
    
    // 每个门槛的最大连胜限制
    uint8 public maxStreak1 = 5;   // 青铜
    uint8 public maxStreak2 = 8;   // 白银
    uint8 public maxStreak3 = 12;  // 黄金
    uint8 public maxStreak4 = 16;  // 铂金
    uint8 public maxStreak5 = 20;  // 钻石
    
    // ============ 20级固定奖励百分比（万分比，匹配前端） ============
    // 例如: 2 = 0.02%, 10 = 0.1%, 100 = 1%, 10000 = 100%
    uint16[20] public rewardPercentages = [
        2,      // 1连胜: 0.02%
        5,      // 2连胜: 0.05%
        10,     // 3连胜: 0.1%
        15,     // 4连胜: 0.15%
        25,     // 5连胜: 0.25% (青铜上限)
        40,     // 6连胜: 0.4%
        60,     // 7连胜: 0.6%
        100,    // 8连胜: 1% (白银上限)
        150,    // 9连胜: 1.5%
        250,    // 10连胜: 2.5%
        400,    // 11连胜: 4%
        600,    // 12连胜: 6% (黄金上限)
        900,    // 13连胜: 9%
        1300,   // 14连胜: 13%
        1800,   // 15连胜: 18%
        2500,   // 16连胜: 25% (铂金上限)
        3500,   // 17连胜: 35%
        5000,   // 18连胜: 50%
        7000,   // 19连胜: 70%
        10000   // 20连胜: 100% (钻石上限 - 清空奖池)
    ];
    
    // ============ 费用配置 ============
    uint256 public constant OPERATION_FEE_PERCENT = 500;  // 5% 运营费
    uint256 public constant PLAYER_PRIZE_PERCENT = 9500;  // 95% 给玩家
    
    // ============ VRF配置 ============
    bytes32 public keyHash;
    uint256 public subscriptionId;
    uint32 public callbackGasLimit = 300000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    bool public useNativePayment = true;
    
    // ============ 合约状态 ============
    IERC20 public token;
    address public operationWallet;
    uint256 public minPrizePool = 0.01 ether;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant REQUEST_TIMEOUT = 1 hours;
    
    // ============ 统计数据 ============
    uint256 public totalGames;
    uint256 public totalPaidOut;
    uint256 public totalOperationFees;
    uint256 public totalCreditsDeposited;
    
    // ============ 玩家数据 ============
    mapping(address => uint256) public gameCredits;
    
    struct PlayerStats {
        uint256 totalGames;
        uint256 totalWins;
        uint256 totalWinnings;
        uint256 totalBet;
        uint256 maxStreak;
    }
    
    struct GameSession {
        address player;
        uint256 betAmount;
        uint8 betTierIndex;     // 0-4 对应5个门槛
        uint8 currentCard;      // 当前牌 (1-13, A=1, J=11, Q=12, K=13)
        uint8 currentStreak;    // 当前连胜
        uint256 prizePoolSnapshot; // 开始时锁定的奖池快照
        uint256 timestamp;
        bool active;
    }
    
    struct VRFRequest {
        address player;
        uint8 guessType;        // 0=Low, 1=High, 2=Same
        uint256 timestamp;
        bool fulfilled;
    }
    
    mapping(address => PlayerStats) public playerStats;
    mapping(address => GameSession) public gameSessions;
    mapping(uint256 => VRFRequest) public vrfRequests;
    mapping(address => uint256) public pendingRequest;
    mapping(address => uint256) public unclaimedPrizes;
    
    // ============ 事件 ============
    event GameStarted(address indexed player, uint256 betAmount, uint8 betTierIndex, uint8 firstCard, uint256 prizePoolSnapshot);
    event GuessRequested(address indexed player, uint256 indexed requestId, uint8 guessType);
    event GuessResult(address indexed player, uint256 indexed requestId, uint8 oldCard, uint8 newCard, bool won, uint8 streak, uint256 potentialReward);
    event GameCashedOut(address indexed player, uint256 grossPrize, uint256 playerPrize, uint8 finalStreak);
    event GameLost(address indexed player, uint8 lostAtStreak);
    event PrizeClaimed(address indexed player, uint256 amount);
    event PrizeTransferFailed(address indexed player, uint256 amount);
    event OperationFeeSent(uint256 amount);
    event PrizePoolFunded(address indexed funder, uint256 amount);
    event ConfigUpdated(string configName);
    event TokensBurned(address indexed player, uint256 amount);
    event CreditsDeposited(address indexed player, uint256 amount);
    event CreditsUsed(address indexed player, uint256 amount);
    
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        address _token,
        address _operationWallet
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) Ownable(msg.sender) {
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        token = IERC20(_token);
        operationWallet = _operationWallet;
    }
    
    // ============ 凭证系统 ============
    
    function depositCredits(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        bool success = token.transferFrom(msg.sender, BURN_ADDRESS, amount);
        require(success, "Token transfer failed");
        
        gameCredits[msg.sender] += amount;
        totalCreditsDeposited += amount;
        
        emit TokensBurned(msg.sender, amount);
        emit CreditsDeposited(msg.sender, amount);
    }
    
    function getCredits(address player) external view returns (uint256) {
        return gameCredits[player];
    }
    
    // ============ 游戏核心 ============
    
    /**
     * @notice 获取门槛等级索引 (0-4)
     */
    function getBetTierIndex(uint256 betAmount) public view returns (uint8) {
        if (betAmount >= betLevel5) return 4;
        if (betAmount >= betLevel4) return 3;
        if (betAmount >= betLevel3) return 2;
        if (betAmount >= betLevel2) return 1;
        if (betAmount >= betLevel1) return 0;
        revert("Invalid bet amount");
    }
    
    /**
     * @notice 获取门槛的最大连胜限制
     */
    function getMaxStreakForTier(uint8 tierIndex) public view returns (uint8) {
        if (tierIndex == 0) return maxStreak1;
        if (tierIndex == 1) return maxStreak2;
        if (tierIndex == 2) return maxStreak3;
        if (tierIndex == 3) return maxStreak4;
        return maxStreak5;
    }
    
    /**
     * @notice 开始新游戏
     */
    function startGame(uint256 betAmount) external nonReentrant whenNotPaused returns (uint8 firstCard) {
        require(isValidBetAmount(betAmount), "Invalid bet amount");
        require(!gameSessions[msg.sender].active, "Game already active");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
        require(gameCredits[msg.sender] >= betAmount, "Insufficient game credits");
        
        uint256 currentPool = getAvailablePool();
        require(currentPool >= minPrizePool, "Prize pool too low");
        
        // 扣除凭证
        gameCredits[msg.sender] -= betAmount;
        emit CreditsUsed(msg.sender, betAmount);
        
        // 获取门槛等级
        uint8 tierIndex = getBetTierIndex(betAmount);
        
        // 生成首张牌（使用区块数据，因为首张牌不影响胜负）
        firstCard = uint8((uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            totalGames
        ))) % 13) + 1);
        
        // 创建游戏会话，锁定奖池快照
        gameSessions[msg.sender] = GameSession({
            player: msg.sender,
            betAmount: betAmount,
            betTierIndex: tierIndex,
            currentCard: firstCard,
            currentStreak: 0,
            prizePoolSnapshot: currentPool,
            timestamp: block.timestamp,
            active: true
        });
        
        totalGames++;
        playerStats[msg.sender].totalGames++;
        playerStats[msg.sender].totalBet += betAmount;
        
        emit GameStarted(msg.sender, betAmount, tierIndex, firstCard, currentPool);
        return firstCard;
    }
    
    /**
     * @notice 猜测下一张牌
     * @param guessType 0=猜小, 1=猜大, 2=猜相同
     */
    function guess(uint8 guessType) external nonReentrant whenNotPaused returns (uint256 requestId) {
        require(guessType <= 2, "Invalid guess type");
        
        GameSession storage session = gameSessions[msg.sender];
        require(session.active, "No active game");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
        
        uint8 maxStreak = getMaxStreakForTier(session.betTierIndex);
        require(session.currentStreak < maxStreak, "Max streak reached, cash out");
        
        // 请求VRF随机数
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: useNativePayment})
                )
            })
        );
        
        vrfRequests[requestId] = VRFRequest({
            player: msg.sender,
            guessType: guessType,
            timestamp: block.timestamp,
            fulfilled: false
        });
        
        pendingRequest[msg.sender] = requestId;
        
        emit GuessRequested(msg.sender, requestId, guessType);
        return requestId;
    }
    
    /**
     * @notice VRF回调
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        VRFRequest storage request = vrfRequests[requestId];
        require(request.player != address(0), "Invalid request");
        require(!request.fulfilled, "Already fulfilled");
        
        request.fulfilled = true;
        pendingRequest[request.player] = 0;
        
        GameSession storage session = gameSessions[request.player];
        require(session.active, "No active game");
        
        // 生成新牌 (1-13)
        uint8 newCard = uint8((randomWords[0] % 13) + 1);
        uint8 oldCard = session.currentCard;
        
        // 判断胜负
        bool won;
        if (request.guessType == 2) {
            // 猜相同：只有相同才赢
            won = (newCard == oldCard);
        } else if (request.guessType == 1) {
            // 猜大：新牌 > 旧牌，相同算输
            won = (newCard > oldCard);
        } else {
            // 猜小：新牌 < 旧牌，相同算输
            won = (newCard < oldCard);
        }
        
        if (won) {
            // 赢了，更新连胜
            session.currentStreak++;
            session.currentCard = newCard;
            
            // 更新最大连胜记录
            if (session.currentStreak > playerStats[request.player].maxStreak) {
                playerStats[request.player].maxStreak = session.currentStreak;
            }
            
            // 计算当前可获得的奖励
            uint256 potentialReward = calculateReward(session.currentStreak, session.prizePoolSnapshot);
            
            emit GuessResult(request.player, requestId, oldCard, newCard, true, session.currentStreak, potentialReward);
            
            // 达到最大连胜，自动结算
            uint8 maxStreak = getMaxStreakForTier(session.betTierIndex);
            if (session.currentStreak >= maxStreak) {
                _cashOut(request.player);
            }
        } else {
            // 输了，游戏结束，清空累积
            uint8 lostStreak = session.currentStreak;
            session.active = false;
            
            emit GuessResult(request.player, requestId, oldCard, newCard, false, 0, 0);
            emit GameLost(request.player, lostStreak);
        }
    }
    
    /**
     * @notice 计算奖励（基于锁定的奖池快照）
     */
    function calculateReward(uint8 streak, uint256 poolSnapshot) public view returns (uint256) {
        if (streak == 0 || streak > 20) return 0;
        
        // 从固定百分比表获取（万分比）
        uint16 percentBps = rewardPercentages[streak - 1];
        
        // 计算奖励 = 奖池快照 * 百分比 / 10000
        return (poolSnapshot * percentBps) / 10000;
    }
    
    /**
     * @notice 主动提现（锁定当前收益）
     */
    function cashOut() external nonReentrant {
        require(gameSessions[msg.sender].active, "No active game");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
        require(gameSessions[msg.sender].currentStreak > 0, "Must win at least once");
        
        _cashOut(msg.sender);
    }
    
    function _cashOut(address player) internal {
        GameSession storage session = gameSessions[player];
        
        // 计算奖励（基于开始时锁定的奖池快照）
        uint256 grossPrize = calculateReward(session.currentStreak, session.prizePoolSnapshot);
        uint8 finalStreak = session.currentStreak;
        
        // 结束游戏
        session.active = false;
        
        if (grossPrize > 0) {
            // 确保不超过当前实际奖池
            uint256 currentPool = getAvailablePool();
            if (grossPrize > currentPool) {
                grossPrize = currentPool;
            }
            
            // 计算费用分配
            uint256 playerPrize = (grossPrize * PLAYER_PRIZE_PERCENT) / 10000;
            uint256 operationFee = grossPrize - playerPrize;
            
            // 更新统计
            playerStats[player].totalWins++;
            playerStats[player].totalWinnings += playerPrize;
            totalPaidOut += playerPrize;
            
            // 发送运营费
            if (operationFee > 0 && operationWallet != address(0)) {
                (bool feeSuccess, ) = operationWallet.call{value: operationFee}("");
                if (feeSuccess) {
                    totalOperationFees += operationFee;
                    emit OperationFeeSent(operationFee);
                } else {
                    playerPrize += operationFee;
                }
            }
            
            // 发送玩家奖励
            (bool prizeSuccess, ) = player.call{value: playerPrize}("");
            if (!prizeSuccess) {
                unclaimedPrizes[player] += playerPrize;
                emit PrizeTransferFailed(player, playerPrize);
            }
            
            emit GameCashedOut(player, grossPrize, playerPrize, finalStreak);
        } else {
            emit GameCashedOut(player, 0, 0, finalStreak);
        }
    }
    
    /**
     * @notice 领取未发放的奖励
     */
    function claimPrize() external nonReentrant {
        uint256 amount = unclaimedPrizes[msg.sender];
        require(amount > 0, "No unclaimed prizes");
        
        unclaimedPrizes[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit PrizeClaimed(msg.sender, amount);
    }
    
    /**
     * @notice 取消超时的请求
     */
    function cancelStuckRequest() external nonReentrant {
        uint256 reqId = pendingRequest[msg.sender];
        require(reqId != 0, "No pending request");
        
        VRFRequest storage req = vrfRequests[reqId];
        require(!req.fulfilled, "Already fulfilled");
        require(block.timestamp > req.timestamp + REQUEST_TIMEOUT, "Not timed out yet");
        
        pendingRequest[msg.sender] = 0;
        req.fulfilled = true;
        
        // 游戏保持当前状态，玩家可以继续或提现
    }
    
    // ============ 查询函数 ============
    
    function isValidBetAmount(uint256 amount) public view returns (bool) {
        return amount == betLevel1 ||
               amount == betLevel2 ||
               amount == betLevel3 ||
               amount == betLevel4 ||
               amount == betLevel5;
    }
    
    function getAvailablePool() public view returns (uint256) {
        return address(this).balance;
    }
    
    function getPrizePool() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    function getGameSession(address player) external view returns (GameSession memory) {
        return gameSessions[player];
    }
    
    function getBetLevels() external view returns (uint256[5] memory) {
        return [betLevel1, betLevel2, betLevel3, betLevel4, betLevel5];
    }
    
    function getMaxStreaks() external view returns (uint8[5] memory) {
        return [maxStreak1, maxStreak2, maxStreak3, maxStreak4, maxStreak5];
    }
    
    function getRewardPercentages() external view returns (uint16[20] memory) {
        return rewardPercentages;
    }
    
    // ============ 管理函数（无资金提取权限） ============
    
    /**
     * @notice 调整投注档位（只能降低，保护玩家）
     */
    function setBetLevels(
        uint256 _level1,
        uint256 _level2,
        uint256 _level3,
        uint256 _level4,
        uint256 _level5
    ) external onlyOwner {
        require(_level1 <= betLevel1, "Can only lower level 1");
        require(_level2 <= betLevel2, "Can only lower level 2");
        require(_level3 <= betLevel3, "Can only lower level 3");
        require(_level4 <= betLevel4, "Can only lower level 4");
        require(_level5 <= betLevel5, "Can only lower level 5");
        require(_level1 < _level2 && _level2 < _level3 && _level3 < _level4 && _level4 < _level5, "Levels must be ascending");
        require(_level1 >= 10000 * 10**18, "Min level is 10000 tokens");
        
        betLevel1 = _level1;
        betLevel2 = _level2;
        betLevel3 = _level3;
        betLevel4 = _level4;
        betLevel5 = _level5;
        
        emit ConfigUpdated("betLevels");
    }
    
    /**
     * @notice 调整最大连胜限制（只能提高，利于玩家）
     */
    function setMaxStreaks(
        uint8 _max1,
        uint8 _max2,
        uint8 _max3,
        uint8 _max4,
        uint8 _max5
    ) external onlyOwner {
        require(_max1 >= maxStreak1, "Can only increase max streak 1");
        require(_max2 >= maxStreak2, "Can only increase max streak 2");
        require(_max3 >= maxStreak3, "Can only increase max streak 3");
        require(_max4 >= maxStreak4, "Can only increase max streak 4");
        require(_max5 >= maxStreak5, "Can only increase max streak 5");
        require(_max1 < _max2 && _max2 < _max3 && _max3 < _max4 && _max4 < _max5, "Must be ascending");
        require(_max5 <= 20, "Max streak cannot exceed 20");
        
        maxStreak1 = _max1;
        maxStreak2 = _max2;
        maxStreak3 = _max3;
        maxStreak4 = _max4;
        maxStreak5 = _max5;
        
        emit ConfigUpdated("maxStreaks");
    }
    
    /**
     * @notice 调整奖励百分比（只能提高，利于玩家）
     */
    function setRewardPercentages(uint16[20] calldata _percentages) external onlyOwner {
        // 验证每个值只能提高
        for (uint8 i = 0; i < 20; i++) {
            require(_percentages[i] >= rewardPercentages[i], "Can only increase rewards");
        }
        // 验证递增
        for (uint8 i = 1; i < 20; i++) {
            require(_percentages[i] > _percentages[i-1], "Must be ascending");
        }
        // 验证最大不超过100%
        require(_percentages[19] <= 10000, "Max 100%");
        
        rewardPercentages = _percentages;
        
        emit ConfigUpdated("rewardPercentages");
    }
    
    /**
     * @notice 设置运营钱包
     */
    function setOperationWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        operationWallet = _wallet;
        emit ConfigUpdated("operationWallet");
    }
    
    /**
     * @notice 设置代币合约
     */
    function setToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid address");
        token = IERC20(_token);
        emit ConfigUpdated("token");
    }
    
    /**
     * @notice 更新VRF配置
     */
    function updateVRFConfig(
        bytes32 _keyHash,
        uint256 _subscriptionId,
        uint32 _callbackGasLimit,
        bool _useNativePayment
    ) external onlyOwner {
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
        useNativePayment = _useNativePayment;
        emit ConfigUpdated("vrfConfig");
    }
    
    /**
     * @notice 设置最小奖池
     */
    function setMinPrizePool(uint256 _minPrizePool) external onlyOwner {
        minPrizePool = _minPrizePool;
        emit ConfigUpdated("minPrizePool");
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ 资金注入（仅注入，无提取） ============
    
    /**
     * @notice 注入奖池资金
     * @dev Owner和任何人都可以注入，但没有提取函数
     */
    function fundPrizePool() external payable {
        require(msg.value > 0, "Must send BNB");
        emit PrizePoolFunded(msg.sender, msg.value);
    }
    
    receive() external payable {
        emit PrizePoolFunded(msg.sender, msg.value);
    }
    
    // ============ 无withdraw函数 - Owner无法提取资金 ============
}
