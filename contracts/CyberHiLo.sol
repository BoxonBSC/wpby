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
 */
contract CyberHiLo is VRFConsumerBaseV2Plus, Ownable, ReentrancyGuard, Pausable {
    
    // ============ 投注档位（可调整，只能降低） ============
    uint256 public betLevel1 = 10000 * 10**18;   // 10K tokens
    uint256 public betLevel2 = 25000 * 10**18;   // 25K tokens
    uint256 public betLevel3 = 50000 * 10**18;   // 50K tokens
    uint256 public betLevel4 = 100000 * 10**18;  // 100K tokens
    uint256 public betLevel5 = 250000 * 10**18;  // 250K tokens
    
    // ============ 奖励配置（可调整） ============
    uint256 public baseRewardPercent = 50;       // 基础奖励：奖池的0.5%
    uint256 public streakMultiplier = 150;       // 连胜倍数：每连胜+50%（150 = 1.5x）
    uint256 public maxStreakBonus = 500;         // 最大连胜倍数：5x
    uint256 public maxStreak = 10;               // 最大连胜次数
    
    // ============ 费用配置 ============
    uint256 public constant OPERATION_FEE_PERCENT = 500;  // 5% 运营费
    uint256 public constant PLAYER_PRIZE_PERCENT = 9500;  // 95% 给玩家
    uint256 public constant MAX_SINGLE_PAYOUT_PERCENT = 1000; // 单次最大支付：奖池10%
    
    // ============ 绝对上限（BNB） ============
    uint256 public maxPayoutBNB = 5 ether;       // 单次最大5 BNB
    
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
        uint8 currentCard;      // 当前牌 (1-13, A=1, J=11, Q=12, K=13)
        uint8 currentStreak;    // 当前连胜
        uint256 accumulatedWin; // 累积奖励
        uint256 timestamp;
        bool active;
    }
    
    struct VRFRequest {
        address player;
        uint8 guess;            // 0=Low, 1=High
        uint256 timestamp;
        bool fulfilled;
    }
    
    mapping(address => PlayerStats) public playerStats;
    mapping(address => GameSession) public gameSessions;
    mapping(uint256 => VRFRequest) public vrfRequests;
    mapping(address => uint256) public pendingRequest;
    mapping(address => uint256) public unclaimedPrizes;
    
    // ============ 事件 ============
    event GameStarted(address indexed player, uint256 betAmount, uint8 firstCard);
    event GuessRequested(address indexed player, uint256 indexed requestId, uint8 guess);
    event GuessResult(address indexed player, uint256 indexed requestId, uint8 newCard, bool won, uint8 streak, uint256 potentialWin);
    event GameCashedOut(address indexed player, uint256 totalWin, uint8 finalStreak);
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
     * @notice 开始新游戏（使用链上随机数生成首张牌）
     */
    function startGame(uint256 betAmount) external nonReentrant whenNotPaused returns (uint256 requestId) {
        require(isValidBetAmount(betAmount), "Invalid bet amount");
        require(!gameSessions[msg.sender].active, "Game already active");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
        require(gameCredits[msg.sender] >= betAmount, "Insufficient game credits");
        require(getAvailablePool() >= minPrizePool, "Prize pool too low");
        
        // 扣除凭证
        gameCredits[msg.sender] -= betAmount;
        emit CreditsUsed(msg.sender, betAmount);
        
        // 生成首张牌（使用区块数据，因为首张牌不影响胜负）
        uint8 firstCard = uint8((uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            totalGames
        ))) % 13) + 1);
        
        // 创建游戏会话
        gameSessions[msg.sender] = GameSession({
            player: msg.sender,
            betAmount: betAmount,
            currentCard: firstCard,
            currentStreak: 0,
            accumulatedWin: 0,
            timestamp: block.timestamp,
            active: true
        });
        
        totalGames++;
        playerStats[msg.sender].totalGames++;
        playerStats[msg.sender].totalBet += betAmount;
        
        emit GameStarted(msg.sender, betAmount, firstCard);
        return 0; // 首张牌不需要VRF
    }
    
    /**
     * @notice 猜测下一张牌大小
     * @param guessHigh true=猜大, false=猜小
     */
    function guess(bool guessHigh) external nonReentrant whenNotPaused returns (uint256 requestId) {
        GameSession storage session = gameSessions[msg.sender];
        require(session.active, "No active game");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
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
            guess: guessHigh ? 1 : 0,
            timestamp: block.timestamp,
            fulfilled: false
        });
        
        pendingRequest[msg.sender] = requestId;
        
        emit GuessRequested(msg.sender, requestId, guessHigh ? 1 : 0);
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
        if (request.guess == 1) {
            // 猜大：新牌 > 旧牌
            won = newCard > oldCard;
        } else {
            // 猜小：新牌 < 旧牌
            won = newCard < oldCard;
        }
        
        // 相同牌视为输
        if (newCard == oldCard) {
            won = false;
        }
        
        if (won) {
            // 赢了，更新连胜和累积奖励
            session.currentStreak++;
            session.currentCard = newCard;
            session.accumulatedWin = calculatePotentialWin(session.betAmount, session.currentStreak);
            
            // 更新最大连胜记录
            if (session.currentStreak > playerStats[request.player].maxStreak) {
                playerStats[request.player].maxStreak = session.currentStreak;
            }
            
            emit GuessResult(request.player, requestId, newCard, true, session.currentStreak, session.accumulatedWin);
            
            // 达到最大连胜，自动结算
            if (session.currentStreak >= maxStreak) {
                _cashOut(request.player);
            }
        } else {
            // 输了，游戏结束，清空累积
            uint8 lostStreak = session.currentStreak;
            session.active = false;
            session.accumulatedWin = 0;
            
            emit GuessResult(request.player, requestId, newCard, false, 0, 0);
            emit GameLost(request.player, lostStreak);
        }
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
        
        uint256 grossPrize = session.accumulatedWin;
        uint8 finalStreak = session.currentStreak;
        
        // 结束游戏
        session.active = false;
        session.accumulatedWin = 0;
        
        if (grossPrize > 0) {
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
        }
        
        emit GameCashedOut(player, grossPrize, finalStreak);
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
    
    // ============ 奖励计算 ============
    
    function calculatePotentialWin(uint256 betAmount, uint8 streak) public view returns (uint256) {
        if (streak == 0) return 0;
        
        uint256 availablePool = getAvailablePool();
        
        // 基础奖励 = 奖池 * baseRewardPercent / 10000
        uint256 baseReward = (availablePool * baseRewardPercent) / 10000;
        
        // 连胜倍数 = streakMultiplier ^ (streak-1)，上限maxStreakBonus
        uint256 multiplier = 100; // 100 = 1x
        for (uint8 i = 1; i < streak; i++) {
            multiplier = (multiplier * streakMultiplier) / 100;
            if (multiplier > maxStreakBonus) {
                multiplier = maxStreakBonus;
                break;
            }
        }
        
        // 投注倍数
        uint256 betMultiplier = getBetMultiplier(betAmount);
        
        // 最终奖励
        uint256 reward = (baseReward * multiplier * betMultiplier) / 10000;
        
        // 应用上限
        uint256 maxPoolPayout = (availablePool * MAX_SINGLE_PAYOUT_PERCENT) / 10000;
        if (reward > maxPoolPayout) reward = maxPoolPayout;
        if (reward > maxPayoutBNB) reward = maxPayoutBNB;
        
        return reward;
    }
    
    // ============ 查询函数 ============
    
    function isValidBetAmount(uint256 amount) public view returns (bool) {
        return amount == betLevel1 ||
               amount == betLevel2 ||
               amount == betLevel3 ||
               amount == betLevel4 ||
               amount == betLevel5;
    }
    
    function getBetMultiplier(uint256 betAmount) public view returns (uint256) {
        if (betAmount >= betLevel5) return 200;  // 2x
        if (betAmount >= betLevel4) return 150;  // 1.5x
        if (betAmount >= betLevel3) return 125;  // 1.25x
        if (betAmount >= betLevel2) return 110;  // 1.1x
        return 100; // 1x
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
    
    function getRewardConfig() external view returns (
        uint256 _baseRewardPercent,
        uint256 _streakMultiplier,
        uint256 _maxStreakBonus,
        uint256 _maxStreak,
        uint256 _maxPayoutBNB
    ) {
        return (baseRewardPercent, streakMultiplier, maxStreakBonus, maxStreak, maxPayoutBNB);
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
        require(_level1 >= 1000 * 10**18, "Min level is 1000 tokens");
        
        betLevel1 = _level1;
        betLevel2 = _level2;
        betLevel3 = _level3;
        betLevel4 = _level4;
        betLevel5 = _level5;
        
        emit ConfigUpdated("betLevels");
    }
    
    /**
     * @notice 调整奖励配置
     */
    function setRewardConfig(
        uint256 _baseRewardPercent,
        uint256 _streakMultiplier,
        uint256 _maxStreakBonus,
        uint256 _maxStreak,
        uint256 _maxPayoutBNB
    ) external onlyOwner {
        require(_baseRewardPercent <= 500, "Base reward too high"); // 最高5%
        require(_streakMultiplier >= 100 && _streakMultiplier <= 300, "Invalid multiplier"); // 1x-3x
        require(_maxStreakBonus >= 100 && _maxStreakBonus <= 1000, "Invalid max bonus"); // 1x-10x
        require(_maxStreak >= 3 && _maxStreak <= 20, "Invalid max streak");
        require(_maxPayoutBNB >= 0.1 ether && _maxPayoutBNB <= 50 ether, "Invalid max payout");
        
        baseRewardPercent = _baseRewardPercent;
        streakMultiplier = _streakMultiplier;
        maxStreakBonus = _maxStreakBonus;
        maxStreak = _maxStreak;
        maxPayoutBNB = _maxPayoutBNB;
        
        emit ConfigUpdated("rewardConfig");
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
