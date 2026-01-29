// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CyberSlots
 * @dev 链上老虎机游戏合约，集成Chainlink VRF
 * 
 * 部署步骤（Remix IDE）：
 * 1. 先部署 CyberToken.sol
 * 2. 在 Chainlink VRF 创建 Subscription: https://vrf.chain.link/
 * 3. 记录 Subscription ID
 * 4. 部署此合约时填入参数（BSC Testnet示例）：
 *    - _vrfCoordinator: 0x6A2AAd07396B36Fe02a22b33cf443582f682c82f
 *    - _token: 你部署的CyberToken地址
 *    - _keyHash: 0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314
 *    - _subscriptionId: 你的Subscription ID
 * 5. 在VRF Subscription中添加此合约地址为Consumer
 * 6. 在CyberToken中调用 setGameContract(此合约地址)
 * 7. 向此合约发送BNB作为奖池
 */

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface ICyberToken {
    function burnForGame(address from, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract CyberSlots is VRFConsumerBaseV2, Ownable, ReentrancyGuard, Pausable {
    
    // ============ 符号定义 ============
    // 0: 7️⃣ (最稀有)
    // 1: 💎 (稀有)
    // 2: 👑 (史诗)
    // 3: 🔔 (史诗)
    // 4: ⭐ (稀有)
    // 5: 🍒 (普通)
    // 6: 🍋 (普通)
    // 7: 🍊 (普通)
    // 8: 🍇 (普通)
    // 9: 🍀 (普通)
    
    // ============ 投注等级常量 ============
    uint256 public constant BET_LEVEL_1 = 20000 * 10**18;   // 20K - 基础
    uint256 public constant BET_LEVEL_2 = 50000 * 10**18;   // 50K - 2.5x概率
    uint256 public constant BET_LEVEL_3 = 100000 * 10**18;  // 100K - 5x概率
    uint256 public constant BET_LEVEL_4 = 200000 * 10**18;  // 200K - 10x概率
    uint256 public constant BET_LEVEL_5 = 500000 * 10**18;  // 500K - 20x概率
    
    // ============ 奖励比例常量 (基点，10000 = 100%) ============
    uint256 public constant SUPER_JACKPOT_REWARD = 5000;  // 50% - 超级头奖（5个7）
    uint256 public constant JACKPOT_REWARD = 2500;        // 25% - 头奖（5💎或4个7）
    uint256 public constant FIRST_PRIZE_REWARD = 1000;    // 10% - 一等奖（任意5连线）
    uint256 public constant SECOND_PRIZE_REWARD = 500;    // 5% - 二等奖（4个稀有）
    uint256 public constant THIRD_PRIZE_REWARD = 200;     // 2% - 三等奖（4个普通）
    uint256 public constant SMALL_PRIZE_REWARD = 50;      // 0.5% - 小奖（3连线）
    
    // ============ Chainlink VRF 配置 ============
    VRFCoordinatorV2Interface public vrfCoordinator;
    bytes32 public keyHash;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit = 300000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    
    // ============ 状态变量 ============
    ICyberToken public token;
    
    /// @notice 最低奖池阈值（低于此值暂停游戏）
    uint256 public minPrizePool = 0.1 ether;
    
    /// @notice 单次最大奖励上限
    uint256 public maxSinglePrize = 100 ether;
    
    // ============ 玩家数据 ============
    
    struct PlayerStats {
        uint256 totalSpins;      // 总游戏次数
        uint256 totalWins;       // 总中奖次数
        uint256 totalWinnings;   // 总获奖金额
        uint256 totalBet;        // 总投注金额
        uint256 lastSpinTime;    // 上次游戏时间
    }
    
    struct SpinRequest {
        address player;
        uint256 betAmount;
        uint256 timestamp;
        bool fulfilled;
    }
    
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => SpinRequest) public spinRequests;
    
    // ============ 游戏历史记录 ============
    
    struct GameResult {
        address player;
        uint256 timestamp;
        uint256 betAmount;
        uint8[5] symbols;        // 5个转轮的符号
        uint256 winAmount;
        string prizeType;
    }
    
    GameResult[] public gameHistory;
    uint256 public constant MAX_HISTORY = 100;
    
    // ============ 事件 ============
    
    event SpinRequested(
        address indexed player, 
        uint256 indexed requestId, 
        uint256 betAmount
    );
    
    event SpinResult(
        address indexed player,
        uint256 indexed requestId,
        uint8[5] symbols,
        uint256 winAmount,
        string prizeType
    );
    
    event PrizePoolFunded(address indexed funder, uint256 amount);
    event PrizeWithdrawn(address indexed winner, uint256 amount);
    event ConfigUpdated(string configName, uint256 value);
    
    // ============ 构造函数 ============
    
    constructor(
        address _vrfCoordinator,
        address _token,
        bytes32 _keyHash,
        uint64 _subscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(msg.sender) {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        token = ICyberToken(_token);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
    }
    
    // ============ 游戏核心函数 ============
    
    /**
     * @notice 开始游戏
     * @param betAmount 投注金额（必须是有效的投注等级）
     * @return requestId VRF请求ID
     */
    function spin(uint256 betAmount) external nonReentrant whenNotPaused returns (uint256 requestId) {
        // 验证投注金额
        require(isValidBetAmount(betAmount), "Invalid bet amount");
        
        // 检查代币余额
        require(token.balanceOf(msg.sender) >= betAmount, "Insufficient token balance");
        
        // 检查奖池
        require(address(this).balance >= minPrizePool, "Prize pool too low");
        
        // 销毁代币
        token.burnForGame(msg.sender, betAmount);
        
        // 请求VRF随机数
        requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        
        // 记录请求
        spinRequests[requestId] = SpinRequest({
            player: msg.sender,
            betAmount: betAmount,
            timestamp: block.timestamp,
            fulfilled: false
        });
        
        // 更新玩家统计
        playerStats[msg.sender].totalSpins++;
        playerStats[msg.sender].totalBet += betAmount;
        playerStats[msg.sender].lastSpinTime = block.timestamp;
        
        emit SpinRequested(msg.sender, requestId, betAmount);
        return requestId;
    }
    
    /**
     * @notice Chainlink VRF 回调函数
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        SpinRequest storage request = spinRequests[requestId];
        require(request.player != address(0), "Invalid request");
        require(!request.fulfilled, "Already fulfilled");
        
        request.fulfilled = true;
        
        // 生成5个转轮符号
        uint256 randomness = randomWords[0];
        uint8[5] memory symbols = generateSymbols(randomness, request.betAmount);
        
        // 计算中奖结果
        (uint256 winAmount, string memory prizeType) = calculateWin(symbols, request.betAmount);
        
        // 限制最大奖励
        if (winAmount > maxSinglePrize) {
            winAmount = maxSinglePrize;
        }
        
        // 确保奖池足够
        if (winAmount > address(this).balance) {
            winAmount = address(this).balance / 2; // 最多发放一半奖池
        }
        
        // 记录游戏历史
        _addGameHistory(request.player, request.betAmount, symbols, winAmount, prizeType);
        
        // 发放奖励
        if (winAmount > 0) {
            playerStats[request.player].totalWins++;
            playerStats[request.player].totalWinnings += winAmount;
            
            (bool success, ) = request.player.call{value: winAmount}("");
            require(success, "Prize transfer failed");
            
            emit PrizeWithdrawn(request.player, winAmount);
        }
        
        emit SpinResult(request.player, requestId, symbols, winAmount, prizeType);
    }
    
    /**
     * @notice 根据随机数和投注额生成符号
     * @dev 投注额越高，稀有符号概率越大
     */
    function generateSymbols(uint256 randomness, uint256 betAmount) internal pure returns (uint8[5] memory symbols) {
        uint256 probabilityBoost = getBetMultiplier(betAmount);
        
        for (uint256 i = 0; i < 5; i++) {
            // 每个转轮使用不同的随机数片段
            uint256 rand = uint256(keccak256(abi.encode(randomness, i))) % 10000;
            
            // 根据概率分布生成符号
            // 基础概率（乘以投注倍数）：
            // 7️⃣: 2% * boost
            // 💎: 3% * boost
            // 👑🔔⭐: 各5% * boost
            // 🍒🍋: 各15%
            // 🍊🍇🍀: 各12-15%
            
            uint256 threshold7 = 200 * probabilityBoost / 100;
            uint256 thresholdDiamond = threshold7 + (300 * probabilityBoost / 100);
            uint256 thresholdCrown = thresholdDiamond + (500 * probabilityBoost / 100);
            uint256 thresholdBell = thresholdCrown + (500 * probabilityBoost / 100);
            uint256 thresholdStar = thresholdBell + (500 * probabilityBoost / 100);
            
            if (rand < threshold7) {
                symbols[i] = 0; // 7️⃣
            } else if (rand < thresholdDiamond) {
                symbols[i] = 1; // 💎
            } else if (rand < thresholdCrown) {
                symbols[i] = 2; // 👑
            } else if (rand < thresholdBell) {
                symbols[i] = 3; // 🔔
            } else if (rand < thresholdStar) {
                symbols[i] = 4; // ⭐
            } else if (rand < thresholdStar + 1500) {
                symbols[i] = 5; // 🍒
            } else if (rand < thresholdStar + 3000) {
                symbols[i] = 6; // 🍋
            } else if (rand < thresholdStar + 4500) {
                symbols[i] = 7; // 🍊
            } else if (rand < thresholdStar + 6000) {
                symbols[i] = 8; // 🍇
            } else {
                symbols[i] = 9; // 🍀
            }
        }
        
        return symbols;
    }
    
    /**
     * @notice 计算中奖结果
     */
    function calculateWin(uint8[5] memory symbols, uint256 betAmount) 
        internal 
        view 
        returns (uint256 winAmount, string memory prizeType) 
    {
        uint256 prizePool = address(this).balance;
        
        // 统计每个符号的数量
        uint8[10] memory counts;
        for (uint256 i = 0; i < 5; i++) {
            counts[symbols[i]]++;
        }
        
        // 超级头奖：5个7
        if (counts[0] == 5) {
            return (prizePool * SUPER_JACKPOT_REWARD / 10000, "super_jackpot");
        }
        
        // 头奖：5个💎 或 4个7
        if (counts[1] == 5 || counts[0] == 4) {
            return (prizePool * JACKPOT_REWARD / 10000, "jackpot");
        }
        
        // 一等奖：任意5个相同符号
        for (uint256 i = 0; i < 10; i++) {
            if (counts[i] == 5) {
                return (prizePool * FIRST_PRIZE_REWARD / 10000, "first");
            }
        }
        
        // 二等奖：4个稀有符号（7💎👑🔔⭐）
        for (uint256 i = 0; i < 5; i++) {
            if (counts[i] == 4) {
                return (prizePool * SECOND_PRIZE_REWARD / 10000, "second");
            }
        }
        
        // 三等奖：4个普通符号
        for (uint256 i = 5; i < 10; i++) {
            if (counts[i] == 4) {
                return (prizePool * THIRD_PRIZE_REWARD / 10000, "third");
            }
        }
        
        // 小奖：3个相同符号
        for (uint256 i = 0; i < 10; i++) {
            if (counts[i] >= 3) {
                return (prizePool * SMALL_PRIZE_REWARD / 10000, "small");
            }
        }
        
        return (0, "none");
    }
    
    // ============ 辅助函数 ============
    
    function isValidBetAmount(uint256 amount) public pure returns (bool) {
        return amount == BET_LEVEL_1 ||
               amount == BET_LEVEL_2 ||
               amount == BET_LEVEL_3 ||
               amount == BET_LEVEL_4 ||
               amount == BET_LEVEL_5;
    }
    
    function getBetMultiplier(uint256 betAmount) public pure returns (uint256) {
        if (betAmount >= BET_LEVEL_5) return 2000; // 20x
        if (betAmount >= BET_LEVEL_4) return 1000; // 10x
        if (betAmount >= BET_LEVEL_3) return 500;  // 5x
        if (betAmount >= BET_LEVEL_2) return 250;  // 2.5x
        return 100; // 1x
    }
    
    function _addGameHistory(
        address player,
        uint256 betAmount,
        uint8[5] memory symbols,
        uint256 winAmount,
        string memory prizeType
    ) internal {
        if (gameHistory.length >= MAX_HISTORY) {
            // 移除最旧的记录
            for (uint256 i = 0; i < gameHistory.length - 1; i++) {
                gameHistory[i] = gameHistory[i + 1];
            }
            gameHistory.pop();
        }
        
        gameHistory.push(GameResult({
            player: player,
            timestamp: block.timestamp,
            betAmount: betAmount,
            symbols: symbols,
            winAmount: winAmount,
            prizeType: prizeType
        }));
    }
    
    // ============ 查询函数 ============
    
    function getPrizePool() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    function getGameHistoryLength() external view returns (uint256) {
        return gameHistory.length;
    }
    
    function getRecentGames(uint256 count) external view returns (GameResult[] memory) {
        uint256 length = gameHistory.length;
        uint256 resultCount = count > length ? length : count;
        
        GameResult[] memory results = new GameResult[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            results[i] = gameHistory[length - resultCount + i];
        }
        
        return results;
    }
    
    // ============ 管理函数 ============
    
    function fundPrizePool() external payable {
        emit PrizePoolFunded(msg.sender, msg.value);
    }
    
    function updateVRFConfig(
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit
    ) external onlyOwner {
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
    }
    
    function setMinPrizePool(uint256 _minPrizePool) external onlyOwner {
        minPrizePool = _minPrizePool;
        emit ConfigUpdated("minPrizePool", _minPrizePool);
    }
    
    function setMaxSinglePrize(uint256 _maxSinglePrize) external onlyOwner {
        maxSinglePrize = _maxSinglePrize;
        emit ConfigUpdated("maxSinglePrize", _maxSinglePrize);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
    
    // ============ 接收BNB ============
    
    receive() external payable {
        emit PrizePoolFunded(msg.sender, msg.value);
    }
}
