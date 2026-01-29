// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CyberSlots
 * @dev 链上老虎机游戏合约
 * 
 * 功能特性：
 * - Chainlink VRF V2.5（支持 BNB 支付 VRF 费用）
 * - 外部 ERC20 代币投注（使用 transferFrom）
 * - 5% 运营费自动发送到指定地址（用于 VRF gas 费）
 * - 95% 奖金发放给玩家
 * - unclaimed prizes 失败安全机制
 * - 每用户只能有一个待处理请求
 * - 奖池保护：单次最大派奖 50%（无储备金，100% 可用）
 * - 完全去中心化：无管理员提款权限
 * 
 * 部署步骤：
 * 1. 在 Chainlink VRF V2.5 创建 Subscription: https://vrf.chain.link/
 * 2. 为 Subscription 充值 BNB（用于 Native Payment）
 * 3. 部署合约时填入参数：
 *    BSC 主网:
 *    - _vrfCoordinator: 0xd691f04bc0C9a24Edb78af9E005Cf85768F694C9
 *    - _keyHash: 0x130dba50ad435d4ecc214aad0d5820474137bd68e7e77724144f27c3c377d3d4
 *    - _subscriptionId: 你的 Subscription ID
 *    - _token: 你的代币地址
 *    - _operationWallet: 运营费接收地址
 *    
 *    BSC 测试网:
 *    - _vrfCoordinator: 0xDA3b641D438362C440Ac5458c57e00a712b66700
 *    - _keyHash: 0x8596b430971ac45bdf6088665b9ad8e8630c9d5049ab54b14dff711bee7c0e26
 * 
 * 4. 在 VRF Subscription 中添加此合约地址为 Consumer
 * 5. 向此合约发送 BNB 作为奖池
 */

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CyberSlots is VRFConsumerBaseV2Plus, Ownable, ReentrancyGuard, Pausable {
    
    // ============ 符号定义 ============
    // 0: 7️⃣ (传说 - 最稀有)
    // 1: 💎 (传说)
    // 2: 👑 (史诗)
    // 3: 🔔 (史诗)
    // 4: ⭐ (稀有)
    // 5: 🍒 (普通)
    // 6: 🍋 (普通)
    // 7: 🍊 (普通)
    // 8: 🍇 (普通)
    // 9: 🍀 (普通)
    
    // ============ 投注等级常量 ============
    uint256 public constant BET_LEVEL_1 = 20000 * 10**18;   // 20K - 1x 概率
    uint256 public constant BET_LEVEL_2 = 50000 * 10**18;   // 50K - 2.5x 概率
    uint256 public constant BET_LEVEL_3 = 100000 * 10**18;  // 100K - 5x 概率
    uint256 public constant BET_LEVEL_4 = 200000 * 10**18;  // 200K - 10x 概率
    uint256 public constant BET_LEVEL_5 = 500000 * 10**18;  // 500K - 20x 概率
    
    // ============ 奖励比例常量 (基点，10000 = 100%) ============
    uint256 public constant SUPER_JACKPOT_PERCENT = 3000;  // 30% - 超级头奖（5个7）
    uint256 public constant JACKPOT_PERCENT = 1500;        // 15% - 头奖（5💎或4个7）
    uint256 public constant FIRST_PRIZE_PERCENT = 800;     // 8% - 一等奖（任意5连线）
    uint256 public constant SECOND_PRIZE_PERCENT = 300;    // 3% - 二等奖（4个传奇/史诗）
    uint256 public constant THIRD_PRIZE_PERCENT = 100;     // 1% - 三等奖（4个普通）
    uint256 public constant SMALL_PRIZE_PERCENT = 30;      // 0.3% - 小奖（3连线）
    
    // ============ 奖池保护常量 ============
    uint256 public constant MAX_SINGLE_PAYOUT_PERCENT = 5000;  // 单次最大派奖：奖池的 50%
    // 已移除 RESERVE_PERCENT：100% 奖池可用于派奖
    uint256 public constant OPERATION_FEE_PERCENT = 500;       // 运营费：5%（从奖金中扣除）
    uint256 public constant PLAYER_PRIZE_PERCENT = 9500;       // 玩家实得：95%
    
    // ============ Chainlink VRF V2.5 配置 ============
    bytes32 public keyHash;
    uint256 public subscriptionId;
    uint32 public callbackGasLimit = 500000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    bool public useNativePayment = true;  // 使用 BNB 支付 VRF 费用
    
    // ============ 合约配置 ============
    IERC20 public token;
    address public operationWallet;
    uint256 public minPrizePool = 0.1 ether;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant REQUEST_TIMEOUT = 1 hours;
    
    // ============ 统计数据 ============
    uint256 public totalSpins;
    uint256 public totalPaidOut;
    uint256 public totalOperationFees;
    uint256 public totalCreditsDeposited;
    
    // ============ 游戏凭证系统 ============
    mapping(address => uint256) public gameCredits;
    
    // ============ 玩家数据 ============
    struct PlayerStats {
        uint256 totalSpins;
        uint256 totalWins;
        uint256 totalWinnings;
        uint256 totalBet;
    }
    
    struct SpinRequest {
        address player;
        uint256 betAmount;
        uint256 timestamp;
        bool fulfilled;
    }
    
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => SpinRequest) public spinRequests;
    mapping(address => uint256) public pendingRequest;    // 用户待处理的请求ID
    mapping(address => uint256) public unclaimedPrizes;   // 失败安全：待领取奖励
    
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
    
    event PrizeClaimed(address indexed player, uint256 amount);
    event PrizeTransferFailed(address indexed player, uint256 amount);
    event OperationFeeSent(uint256 amount);
    event PrizePoolFunded(address indexed funder, uint256 amount);
    event ConfigUpdated(string configName);
    event TokensBurned(address indexed player, uint256 amount);
    event SpinCancelled(address indexed player, uint256 indexed requestId, uint256 refundAmount);
    event CreditsDeposited(address indexed player, uint256 amount);
    event CreditsUsed(address indexed player, uint256 amount);
    
    // ============ 构造函数 ============
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
    
    // ============ 游戏凭证函数 ============
    
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
    
    // ============ 游戏核心函数 ============
    
    function spin(uint256 betAmount) external nonReentrant whenNotPaused returns (uint256 requestId) {
        require(isValidBetAmount(betAmount), "Invalid bet amount");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
        require(gameCredits[msg.sender] >= betAmount, "Insufficient game credits");
        
        uint256 availablePool = getAvailablePool();
        require(availablePool >= minPrizePool, "Prize pool too low");
        
        gameCredits[msg.sender] -= betAmount;
        emit CreditsUsed(msg.sender, betAmount);
        
        // 请求 VRF V2.5 随机数（使用 BNB 支付）
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
        
        // 记录请求
        spinRequests[requestId] = SpinRequest({
            player: msg.sender,
            betAmount: betAmount,
            timestamp: block.timestamp,
            fulfilled: false
        });
        
        // 标记用户有待处理请求
        pendingRequest[msg.sender] = requestId;
        
        // 更新统计
        totalSpins++;
        playerStats[msg.sender].totalSpins++;
        playerStats[msg.sender].totalBet += betAmount;
        
        emit SpinRequested(msg.sender, requestId, betAmount);
        return requestId;
    }
    
    /**
     * @notice Chainlink VRF V2.5 回调函数
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        SpinRequest storage request = spinRequests[requestId];
        require(request.player != address(0), "Invalid request");
        require(!request.fulfilled, "Already fulfilled");
        
        request.fulfilled = true;
        
        // 清除待处理状态
        pendingRequest[request.player] = 0;
        
        // 生成 5 个转轮符号
        uint256 randomness = randomWords[0];
        uint8[5] memory symbols = generateSymbols(randomness, request.betAmount);
        
        // 计算中奖结果
        (uint256 grossPrize, string memory prizeType) = calculateWin(symbols);
        
        uint256 playerPrize = 0;
        uint256 operationFee = 0;
        
        if (grossPrize > 0) {
            // 计算玩家实得（95%）和运营费（5%）
            playerPrize = (grossPrize * PLAYER_PRIZE_PERCENT) / 10000;
            operationFee = grossPrize - playerPrize;
            
            // 更新玩家统计
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
                    // 运营费发送失败，加到玩家奖金
                    playerPrize += operationFee;
                    operationFee = 0;
                }
            }
            
            // 发送玩家奖金
            (bool prizeSuccess, ) = request.player.call{value: playerPrize}("");
            if (!prizeSuccess) {
                // 转账失败，存入待领取
                unclaimedPrizes[request.player] += playerPrize;
                emit PrizeTransferFailed(request.player, playerPrize);
            }
        }
        
        emit SpinResult(request.player, requestId, symbols, playerPrize, prizeType);
    }
    
    /**
     * @notice 领取失败的奖励
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
     * @notice 取消超时的 VRF 请求
     * @dev 如果 VRF 回调超过1小时未到达，玩家可以取消请求
     * 注意：代币已销毁无法退还，但可以解锁玩家继续游戏
     */
    function cancelStuckRequest() external nonReentrant {
        uint256 reqId = pendingRequest[msg.sender];
        require(reqId != 0, "No pending request");
        
        SpinRequest storage req = spinRequests[reqId];
        require(!req.fulfilled, "Already fulfilled");
        require(block.timestamp > req.timestamp + REQUEST_TIMEOUT, "Not timed out yet");
        
        // 清除待处理状态
        pendingRequest[msg.sender] = 0;
        req.fulfilled = true;
        
        emit SpinCancelled(msg.sender, reqId, 0);
    }
    
    // ============ 符号生成 ============
    
    /**
     * @notice 根据随机数和投注额生成符号
     * @dev 投注额越高，稀有符号概率越大
     */
    function generateSymbols(uint256 randomness, uint256 betAmount) internal pure returns (uint8[5] memory symbols) {
        uint256 probabilityBoost = getBetMultiplier(betAmount);
        
        for (uint256 i = 0; i < 5; i++) {
            // 每个转轮使用不同的随机数片段
            uint256 rand = uint256(keccak256(abi.encode(randomness, i))) % 10000;
            
            // 基础概率（乘以投注倍数提升稀有符号概率）：
            // 7️⃣: 1% * boost
            // 💎: 2% * boost
            // 👑: 3% * boost
            // 🔔: 4% * boost
            // ⭐: 5% * boost
            // 🍒🍋🍊🍇🍀: 各 17%（调整后）
            
            uint256 t7 = 100 * probabilityBoost / 100;
            uint256 tDiamond = t7 + (200 * probabilityBoost / 100);
            uint256 tCrown = tDiamond + (300 * probabilityBoost / 100);
            uint256 tBell = tCrown + (400 * probabilityBoost / 100);
            uint256 tStar = tBell + (500 * probabilityBoost / 100);
            
            // 限制稀有符号总概率不超过 50%
            if (tStar > 5000) tStar = 5000;
            
            // 剩余概率平均分配给普通符号
            uint256 commonProb = (10000 - tStar) / 5;
            
            if (rand < t7) {
                symbols[i] = 0; // 7️⃣
            } else if (rand < tDiamond) {
                symbols[i] = 1; // 💎
            } else if (rand < tCrown) {
                symbols[i] = 2; // 👑
            } else if (rand < tBell) {
                symbols[i] = 3; // 🔔
            } else if (rand < tStar) {
                symbols[i] = 4; // ⭐
            } else if (rand < tStar + commonProb) {
                symbols[i] = 5; // 🍒
            } else if (rand < tStar + commonProb * 2) {
                symbols[i] = 6; // 🍋
            } else if (rand < tStar + commonProb * 3) {
                symbols[i] = 7; // 🍊
            } else if (rand < tStar + commonProb * 4) {
                symbols[i] = 8; // 🍇
            } else {
                symbols[i] = 9; // 🍀
            }
        }
        
        return symbols;
    }
    
    // ============ 中奖计算 ============
    
    /**
     * @notice 计算中奖结果
     * @return grossPrize 总奖金（未扣除运营费）
     * @return prizeType 奖项类型
     */
    function calculateWin(uint8[5] memory symbols) 
        internal 
        view 
        returns (uint256 grossPrize, string memory prizeType) 
    {
        uint256 availablePool = getAvailablePool();
        uint256 maxPayout = (availablePool * MAX_SINGLE_PAYOUT_PERCENT) / 10000;
        
        // 统计每个符号的数量
        uint8[10] memory counts;
        for (uint256 i = 0; i < 5; i++) {
            counts[symbols[i]]++;
        }
        
        uint256 prize = 0;
        
        // 超级头奖：5 个 7
        if (counts[0] == 5) {
            prize = (availablePool * SUPER_JACKPOT_PERCENT) / 10000;
            prizeType = "super_jackpot";
        }
        // 头奖：5 个 💎 或 4 个 7
        else if (counts[1] == 5 || counts[0] == 4) {
            prize = (availablePool * JACKPOT_PERCENT) / 10000;
            prizeType = "jackpot";
        }
        // 一等奖：任意 5 个相同符号
        else if (_hasCount(counts, 5)) {
            prize = (availablePool * FIRST_PRIZE_PERCENT) / 10000;
            prizeType = "first";
        }
        // 二等奖：4 个传奇/史诗符号（0-4）
        else if (_hasRareCount(counts, 4)) {
            prize = (availablePool * SECOND_PRIZE_PERCENT) / 10000;
            prizeType = "second";
        }
        // 三等奖：4 个普通符号（5-9）
        else if (_hasCommonCount(counts, 4)) {
            prize = (availablePool * THIRD_PRIZE_PERCENT) / 10000;
            prizeType = "third";
        }
        // 小奖：任意 3 个相同符号
        else if (_hasCount(counts, 3)) {
            prize = (availablePool * SMALL_PRIZE_PERCENT) / 10000;
            prizeType = "small";
        }
        else {
            return (0, "none");
        }
        
        // 限制最大派奖
        grossPrize = prize > maxPayout ? maxPayout : prize;
        return (grossPrize, prizeType);
    }
    
    function _hasCount(uint8[10] memory counts, uint8 target) internal pure returns (bool) {
        for (uint256 i = 0; i < 10; i++) {
            if (counts[i] >= target) return true;
        }
        return false;
    }
    
    function _hasRareCount(uint8[10] memory counts, uint8 target) internal pure returns (bool) {
        for (uint256 i = 0; i < 5; i++) {
            if (counts[i] >= target) return true;
        }
        return false;
    }
    
    function _hasCommonCount(uint8[10] memory counts, uint8 target) internal pure returns (bool) {
        for (uint256 i = 5; i < 10; i++) {
            if (counts[i] >= target) return true;
        }
        return false;
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
    
    /**
     * @notice 获取可用奖池（无储备金，100% 可用）
     */
    function getAvailablePool() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice 获取总奖池
     */
    function getPrizePool() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice 获取玩家统计
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    // ============ 管理函数 ============
    
    /**
     * @notice 设置运营费接收地址
     */
    function setOperationWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        operationWallet = _wallet;
        emit ConfigUpdated("operationWallet");
    }
    
    /**
     * @notice 设置代币地址
     */
    function setToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid address");
        token = IERC20(_token);
        emit ConfigUpdated("token");
    }
    
    /**
     * @notice 更新 VRF 配置
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
     * @notice 设置最低奖池阈值
     */
    function setMinPrizePool(uint256 _minPrizePool) external onlyOwner {
        minPrizePool = _minPrizePool;
        emit ConfigUpdated("minPrizePool");
    }
    
    /**
     * @notice 暂停游戏
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice 恢复游戏
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice 为奖池充值（任何人都可以）
     */
    function fundPrizePool() external payable {
        require(msg.value > 0, "Must send BNB");
        emit PrizePoolFunded(msg.sender, msg.value);
    }
    
    // ============ 接收 BNB ============
    
    receive() external payable {
        emit PrizePoolFunded(msg.sender, msg.value);
    }
    
    // ============ 注意：没有管理员提款函数 ============
    // 资金只能通过玩家中奖或 claimPrize 流出
    // 这确保了完全去中心化和资金安全
}
