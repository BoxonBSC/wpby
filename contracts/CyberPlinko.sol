// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CyberPlinko
 * @dev Plinko游戏合约 - 使用Chainlink VRF确保公平性
 * 
 * 经济模型：
 * - 18行钉子 = 19个槽位（二项分布）
 * - 总中奖率 ~3%（高度可持续）
 * - 奖励按奖池比例发放，但有BNB上限（防大户）
 * - 小奖固定金额，不按比例
 * 
 * 槽位分布（对称）：
 * [超级大奖][  ][大奖][  ][中奖][  ][小奖][  ][小奖][中间][小奖][  ][小奖][  ][中奖][  ][大奖][  ][超级大奖]
 *     0      1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18
 */
contract CyberPlinko is VRFConsumerBaseV2Plus, Ownable, ReentrancyGuard, Pausable {
    
    // ========================================
    // 奖励配置
    // ========================================
    
    enum RewardType { NO_WIN, SMALL, MEDIUM, JACKPOT, SUPER_JACKPOT }
    
    struct RewardConfig {
        RewardType rewardType;
        uint256 poolPercent;   // 奖池百分比 (10000 = 100%)
        uint256 maxBNB;        // BNB上限 (wei)
        uint256 fixedBNB;      // 固定BNB金额 (wei)，如果 > 0 则忽略 poolPercent
    }
    
    // 19个槽位的奖励配置（索引0-18）
    mapping(uint256 => RewardConfig) public slotRewards;
    
    // 默认奖励值
    uint256 public constant SUPER_JACKPOT_PERCENT = 3000;  // 30%
    uint256 public constant JACKPOT_PERCENT = 1500;        // 15%
    uint256 public constant MEDIUM_PERCENT = 500;          // 5%
    uint256 public constant SMALL_FIXED_BNB = 0.002 ether;  // 固定0.002 BNB
    
    uint256 public constant SUPER_JACKPOT_MAX = 5 ether;   // 上限5 BNB
    uint256 public constant JACKPOT_MAX = 2 ether;         // 上限2 BNB
    uint256 public constant MEDIUM_MAX = 0.5 ether;        // 上限0.5 BNB
    
    // 运营费比例
    uint256 public constant OPERATION_FEE_PERCENT = 500;   // 5%
    uint256 public constant PLAYER_PRIZE_PERCENT = 9500;   // 95%
    
    // ========================================
    // 下注配置
    // ========================================
    
    uint256 public betLevel1 = 20000 * 10**18;   // 20K
    uint256 public betLevel2 = 50000 * 10**18;   // 50K
    uint256 public betLevel3 = 100000 * 10**18;  // 100K
    uint256 public betLevel4 = 200000 * 10**18;  // 200K
    uint256 public betLevel5 = 500000 * 10**18;  // 500K
    
    // ========================================
    // VRF 配置
    // ========================================
    
    bytes32 public keyHash;
    uint256 public subscriptionId;
    uint32 public callbackGasLimit = 500000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    bool public useNativePayment = true;
    
    // ========================================
    // 合约状态
    // ========================================
    
    IERC20 public token;
    address public operationWallet;
    uint256 public minPrizePool = 0.001 ether;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant REQUEST_TIMEOUT = 1 hours;
    
    // 统计数据
    uint256 public totalDrops;
    uint256 public totalPaidOut;
    uint256 public totalOperationFees;
    uint256 public totalCreditsDeposited;
    
    // 玩家游戏凭证
    mapping(address => uint256) public gameCredits;
    
    // ========================================
    // 数据结构
    // ========================================
    
    struct PlayerStats {
        uint256 totalDrops;
        uint256 totalWins;
        uint256 totalWinnings;
        uint256 totalBet;
    }
    
    struct DropRequest {
        address player;
        uint256 betAmount;
        uint256 timestamp;
        bool fulfilled;
    }
    
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => DropRequest) public dropRequests;
    mapping(address => uint256) public pendingRequest;
    mapping(address => uint256) public unclaimedPrizes;
    
    // ========================================
    // 事件
    // ========================================
    
    event DropRequested(address indexed player, uint256 indexed requestId, uint256 betAmount);
    event DropResult(address indexed player, uint256 indexed requestId, uint256 slotIndex, uint256 winAmount, RewardType rewardType);
    event PrizeClaimed(address indexed player, uint256 amount);
    event PrizeTransferFailed(address indexed player, uint256 amount);
    event OperationFeeSent(uint256 amount);
    event PrizePoolFunded(address indexed funder, uint256 amount);
    event ConfigUpdated(string configName);
    event TokensBurned(address indexed player, uint256 amount);
    event DropCancelled(address indexed player, uint256 indexed requestId);
    event CreditsDeposited(address indexed player, uint256 amount);
    event CreditsUsed(address indexed player, uint256 amount);
    
    // ========================================
    // 构造函数
    // ========================================
    
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
        
        // 初始化槽位奖励配置
        _initializeSlotRewards();
    }
    
    /**
     * @dev 初始化19个槽位的奖励配置（无小奖版）
     * 布局：[超级][  ][大奖][  ][中奖][  ][  ][  ][  ][中间][  ][  ][  ][  ][中奖][  ][大奖][  ][超级]
     * 总中奖率：~2.5%（超级0.0008% + 大奖0.12% + 中奖2.34%）
     */
    function _initializeSlotRewards() internal {
        // 槽位 0 - 超级大奖 (最左边缘，概率 0.0004%)
        slotRewards[0] = RewardConfig(RewardType.SUPER_JACKPOT, SUPER_JACKPOT_PERCENT, SUPER_JACKPOT_MAX, 0);
        // 槽位 1 - 未中奖
        slotRewards[1] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 2 - 大奖 (概率 0.06%)
        slotRewards[2] = RewardConfig(RewardType.JACKPOT, JACKPOT_PERCENT, JACKPOT_MAX, 0);
        // 槽位 3 - 未中奖
        slotRewards[3] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 4 - 中奖 (概率 1.17%)
        slotRewards[4] = RewardConfig(RewardType.MEDIUM, MEDIUM_PERCENT, MEDIUM_MAX, 0);
        // 槽位 5 - 未中奖
        slotRewards[5] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 6 - 未中奖
        slotRewards[6] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 7 - 未中奖
        slotRewards[7] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 8 - 未中奖 (原小奖已移除)
        slotRewards[8] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 9 - 中间（未中奖）
        slotRewards[9] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 10 - 未中奖 (原小奖已移除)
        slotRewards[10] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 11 - 未中奖
        slotRewards[11] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 12 - 未中奖
        slotRewards[12] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 13 - 未中奖
        slotRewards[13] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 14 - 中奖 (概率 1.17%)
        slotRewards[14] = RewardConfig(RewardType.MEDIUM, MEDIUM_PERCENT, MEDIUM_MAX, 0);
        // 槽位 15 - 未中奖
        slotRewards[15] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 16 - 大奖 (概率 0.06%)
        slotRewards[16] = RewardConfig(RewardType.JACKPOT, JACKPOT_PERCENT, JACKPOT_MAX, 0);
        // 槽位 17 - 未中奖
        slotRewards[17] = RewardConfig(RewardType.NO_WIN, 0, 0, 0);
        // 槽位 18 - 超级大奖 (最右边缘，概率 0.0004%)
        slotRewards[18] = RewardConfig(RewardType.SUPER_JACKPOT, SUPER_JACKPOT_PERCENT, SUPER_JACKPOT_MAX, 0);
    }
    
    // ========================================
    // 游戏凭证功能
    // ========================================
    
    /**
     * @dev 存入游戏凭证（燃烧代币换取凭证）
     */
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
    
    // ========================================
    // 核心游戏功能
    // ========================================
    
    /**
     * @dev 投球 - 使用VRF请求随机槽位
     */
    function drop(uint256 betAmount) external nonReentrant whenNotPaused returns (uint256 requestId) {
        require(isValidBetAmount(betAmount), "Invalid bet amount");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
        require(gameCredits[msg.sender] >= betAmount, "Insufficient game credits");
        
        uint256 availablePool = getAvailablePool();
        require(availablePool >= minPrizePool, "Prize pool too low");
        
        // 扣除凭证
        gameCredits[msg.sender] -= betAmount;
        emit CreditsUsed(msg.sender, betAmount);
        
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
        
        dropRequests[requestId] = DropRequest({
            player: msg.sender,
            betAmount: betAmount,
            timestamp: block.timestamp,
            fulfilled: false
        });
        
        pendingRequest[msg.sender] = requestId;
        
        totalDrops++;
        playerStats[msg.sender].totalDrops++;
        playerStats[msg.sender].totalBet += betAmount;
        
        emit DropRequested(msg.sender, requestId, betAmount);
        return requestId;
    }
    
    /**
     * @dev VRF回调 - 使用18行二项分布计算槽位
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        DropRequest storage request = dropRequests[requestId];
        require(request.player != address(0), "Invalid request");
        require(!request.fulfilled, "Already fulfilled");
        
        request.fulfilled = true;
        pendingRequest[request.player] = 0;
        
        // 使用随机数计算槽位（18行二项分布）
        uint256 randomness = randomWords[0];
        uint256 slotIndex = _calculateSlotIndex(randomness);
        
        // 计算奖励
        (uint256 grossPrize, RewardType rewardType) = _calculatePrize(slotIndex);
        
        uint256 playerPrize = 0;
        uint256 operationFee = 0;
        
        if (grossPrize > 0) {
            playerPrize = (grossPrize * PLAYER_PRIZE_PERCENT) / 10000;
            operationFee = grossPrize - playerPrize;
            
            playerStats[request.player].totalWins++;
            playerStats[request.player].totalWinnings += playerPrize;
            totalPaidOut += playerPrize;
            
            // 发送运营费
            if (operationFee > 0 && operationWallet != address(0)) {
                (bool feeSuccess, ) = operationWallet.call{value: operationFee}("");
                if (feeSuccess) {
                    totalOperationFees += operationFee;
                    emit OperationFeeSent(operationFee);
                } else {
                    playerPrize += operationFee;
                    operationFee = 0;
                }
            }
            
            // 发送玩家奖励
            (bool prizeSuccess, ) = request.player.call{value: playerPrize}("");
            if (!prizeSuccess) {
                unclaimedPrizes[request.player] += playerPrize;
                emit PrizeTransferFailed(request.player, playerPrize);
            }
        }
        
        emit DropResult(request.player, requestId, slotIndex, playerPrize, rewardType);
    }
    
    /**
     * @dev 使用18行二项分布计算槽位索引（0-18）
     * 18行钉子 = 19个槽位
     * 每次碰撞有50%概率左移或右移
     */
    function _calculateSlotIndex(uint256 randomness) internal pure returns (uint256) {
        uint256 position = 9; // 从中间开始（槽位9）
        
        // 模拟18次碰撞
        for (uint256 i = 0; i < 18; i++) {
            // 每次碰撞随机决定左(0)或右(1)
            uint256 direction = uint256(keccak256(abi.encode(randomness, i))) % 2;
            
            if (direction == 0 && position > 0) {
                position--;
            } else if (direction == 1 && position < 18) {
                position++;
            }
        }
        
        return position;
    }
    
    /**
     * @dev 根据槽位计算奖励金额
     */
    function _calculatePrize(uint256 slotIndex) internal view returns (uint256 prize, RewardType rewardType) {
        require(slotIndex < 19, "Invalid slot index");
        
        RewardConfig memory config = slotRewards[slotIndex];
        rewardType = config.rewardType;
        
        if (rewardType == RewardType.NO_WIN) {
            return (0, rewardType);
        }
        
        uint256 availablePool = getAvailablePool();
        
        // 小奖：固定金额
        if (config.fixedBNB > 0) {
            // 确保奖池足够支付固定金额
            prize = config.fixedBNB > availablePool ? availablePool : config.fixedBNB;
            return (prize, rewardType);
        }
        
        // 大奖：按比例计算，应用上限
        prize = (availablePool * config.poolPercent) / 10000;
        
        // 应用上限
        if (config.maxBNB > 0 && prize > config.maxBNB) {
            prize = config.maxBNB;
        }
        
        return (prize, rewardType);
    }
    
    // ========================================
    // 领奖功能
    // ========================================
    
    function claimPrize() external nonReentrant {
        uint256 amount = unclaimedPrizes[msg.sender];
        require(amount > 0, "No unclaimed prizes");
        
        unclaimedPrizes[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit PrizeClaimed(msg.sender, amount);
    }
    
    function cancelStuckRequest() external nonReentrant {
        uint256 reqId = pendingRequest[msg.sender];
        require(reqId != 0, "No pending request");
        
        DropRequest storage req = dropRequests[reqId];
        require(!req.fulfilled, "Already fulfilled");
        require(block.timestamp > req.timestamp + REQUEST_TIMEOUT, "Not timed out yet");
        
        pendingRequest[msg.sender] = 0;
        req.fulfilled = true;
        
        emit DropCancelled(msg.sender, reqId);
    }
    
    // ========================================
    // 查询功能
    // ========================================
    
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
    
    function getSlotReward(uint256 slotIndex) external view returns (RewardConfig memory) {
        require(slotIndex < 19, "Invalid slot index");
        return slotRewards[slotIndex];
    }
    
    function getBetLevels() external view returns (uint256[5] memory) {
        return [betLevel1, betLevel2, betLevel3, betLevel4, betLevel5];
    }
    
    // ========================================
    // 管理功能
    // ========================================
    
    function setOperationWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        operationWallet = _wallet;
        emit ConfigUpdated("operationWallet");
    }
    
    function setToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid address");
        token = IERC20(_token);
        emit ConfigUpdated("token");
    }
    
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
    
    function setMinPrizePool(uint256 _minPrizePool) external onlyOwner {
        minPrizePool = _minPrizePool;
        emit ConfigUpdated("minPrizePool");
    }
    
    /**
     * @dev 更新单个槽位的奖励配置（仅限降低奖励）
     */
    function updateSlotReward(
        uint256 slotIndex,
        uint256 newPoolPercent,
        uint256 newMaxBNB,
        uint256 newFixedBNB
    ) external onlyOwner {
        require(slotIndex < 19, "Invalid slot index");
        RewardConfig storage config = slotRewards[slotIndex];
        
        // 只能降低奖励，不能提高（防止作弊）
        if (config.poolPercent > 0) {
            require(newPoolPercent <= config.poolPercent, "Can only lower pool percent");
        }
        if (config.maxBNB > 0) {
            require(newMaxBNB <= config.maxBNB, "Can only lower max BNB");
        }
        if (config.fixedBNB > 0) {
            require(newFixedBNB <= config.fixedBNB, "Can only lower fixed BNB");
        }
        
        config.poolPercent = newPoolPercent;
        config.maxBNB = newMaxBNB;
        config.fixedBNB = newFixedBNB;
        
        emit ConfigUpdated("slotReward");
    }
    
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
        require(_level1 >= 1000 * 10**18, "Min level 1 is 1000 tokens");
        
        betLevel1 = _level1;
        betLevel2 = _level2;
        betLevel3 = _level3;
        betLevel4 = _level4;
        betLevel5 = _level5;
        
        emit ConfigUpdated("betLevels");
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function fundPrizePool() external payable {
        require(msg.value > 0, "Must send BNB");
        emit PrizePoolFunded(msg.sender, msg.value);
    }
    
    receive() external payable {
        emit PrizePoolFunded(msg.sender, msg.value);
    }
}
