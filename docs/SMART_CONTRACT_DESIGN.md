# 智能合约设计文档

本文档详细描述了 Cyber Slots 链上老虎机项目的智能合约设计。这些合约需要由专业的 Solidity 开发者进行实现和安全审计。

---

## 📋 合约架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Cyber Slots 合约架构                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌──────────────┐  │
│  │   Token     │     │ SlotMachine │     │ Chainlink    │  │
│  │  (BEP-20)   │────▶│   Contract  │────▶│    VRF       │  │
│  └─────────────┘     └─────────────┘     └──────────────┘  │
│        │                    │                              │
│        │ burn()             │ BNB 奖励                      │
│        ▼                    ▼                              │
│  ┌─────────────┐     ┌─────────────┐                       │
│  │   销毁地址   │     │   玩家钱包   │                       │
│  │  (0x000...)  │     │             │                       │
│  └─────────────┘     └─────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. 代币合约 (CyberToken.sol)

### 1.1 合约概述

标准 BEP-20 代币，内置销毁功能和管理员权限。

### 1.2 接口定义

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CyberToken is ERC20, ERC20Burnable, Ownable {
    // 游戏合约地址，有权限调用 burnFrom
    address public gameContract;
    
    // 是否启用交易税（可选功能）
    bool public taxEnabled;
    uint256 public buyTaxRate; // 买入税率 (基点, 100 = 1%)
    uint256 public sellTaxRate; // 卖出税率
    address public taxReceiver; // 税收接收地址
    
    // 免税地址
    mapping(address => bool) public isExemptFromTax;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }
    
    // 设置游戏合约地址
    function setGameContract(address _gameContract) external onlyOwner {
        gameContract = _gameContract;
    }
    
    // 游戏合约调用的销毁函数
    function burnForGame(address from, uint256 amount) external {
        require(msg.sender == gameContract, "Only game contract");
        _burn(from, amount);
    }
    
    // 配置交易税（可选）
    function configureTax(
        bool _enabled,
        uint256 _buyRate,
        uint256 _sellRate,
        address _receiver
    ) external onlyOwner {
        taxEnabled = _enabled;
        buyTaxRate = _buyRate;
        sellTaxRate = _sellRate;
        taxReceiver = _receiver;
    }
    
    // 设置免税地址
    function setTaxExempt(address account, bool exempt) external onlyOwner {
        isExemptFromTax[account] = exempt;
    }
}
```

### 1.3 关键功能说明

| 功能 | 说明 |
|------|------|
| `burnForGame()` | 仅游戏合约可调用，用于销毁玩家代币 |
| `setGameContract()` | 设置授权的游戏合约地址 |
| `configureTax()` | 配置交易税参数（可选功能） |

---

## 2. 老虎机合约 (CyberSlots.sol)

### 2.1 合约概述

核心游戏逻辑合约，集成 Chainlink VRF 生成随机数。

### 2.2 接口定义

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ICyberToken {
    function burnForGame(address from, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract CyberSlots is VRFConsumerBaseV2, Ownable, ReentrancyGuard {
    
    // ============ 常量 ============
    uint256 public constant TOKENS_PER_SPIN = 20000 * 10**18;
    uint256 public constant BASE_PROBABILITY = 500; // 5% (基点)
    uint256 public constant PROBABILITY_INCREMENT = 200; // 2%
    uint256 public constant MAX_PROBABILITY = 5000; // 50%
    
    // 奖励比例 (基点)
    uint256 public constant JACKPOT_REWARD = 2000; // 20%
    uint256 public constant SECOND_PRIZE_REWARD = 500; // 5%
    uint256 public constant SMALL_PRIZE_REWARD = 100; // 1%
    
    // ============ Chainlink VRF ============
    VRFCoordinatorV2Interface public vrfCoordinator;
    bytes32 public keyHash;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit = 200000;
    uint16 public requestConfirmations = 3;
    
    // ============ 状态变量 ============
    ICyberToken public token;
    
    // 玩家累积概率
    mapping(address => uint256) public playerProbability;
    
    // 玩家统计
    mapping(address => uint256) public playerSpins;
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public playerTotalWinnings;
    
    // VRF 请求映射
    mapping(uint256 => address) public requestToPlayer;
    mapping(uint256 => bool) public requestFulfilled;
    
    // ============ 事件 ============
    event SpinRequested(address indexed player, uint256 requestId);
    event SpinResult(
        address indexed player,
        uint256 indexed requestId,
        uint8[3] symbols,
        uint256 winAmount,
        string prizeType
    );
    event PrizePoolFunded(address indexed funder, uint256 amount);
    event PrizeWithdrawn(address indexed winner, uint256 amount);
    
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
    
    // ============ 游戏函数 ============
    
    /// @notice 开始游戏
    function spin() external nonReentrant returns (uint256 requestId) {
        require(token.balanceOf(msg.sender) >= TOKENS_PER_SPIN, "Insufficient tokens");
        
        // 销毁代币
        token.burnForGame(msg.sender, TOKENS_PER_SPIN);
        
        // 请求随机数
        requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            1 // 请求1个随机数
        );
        
        requestToPlayer[requestId] = msg.sender;
        playerSpins[msg.sender]++;
        
        emit SpinRequested(msg.sender, requestId);
        return requestId;
    }
    
    /// @notice Chainlink VRF 回调
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address player = requestToPlayer[requestId];
        require(player != address(0), "Invalid request");
        require(!requestFulfilled[requestId], "Already fulfilled");
        
        requestFulfilled[requestId] = true;
        
        // 生成3个转轮符号 (0-6)
        uint256 randomness = randomWords[0];
        uint8[3] memory symbols;
        symbols[0] = uint8(randomness % 7);
        symbols[1] = uint8((randomness >> 8) % 7);
        symbols[2] = uint8((randomness >> 16) % 7);
        
        // 计算结果
        (uint256 winAmount, string memory prizeType) = calculateWin(player, symbols, randomness);
        
        // 发放奖励
        if (winAmount > 0 && address(this).balance >= winAmount) {
            playerWins[player]++;
            playerTotalWinnings[player] += winAmount;
            playerProbability[player] = BASE_PROBABILITY; // 重置概率
            
            (bool success, ) = player.call{value: winAmount}("");
            require(success, "Transfer failed");
            
            emit PrizeWithdrawn(player, winAmount);
        } else if (winAmount == 0) {
            // 增加概率
            playerProbability[player] = min(
                playerProbability[player] + PROBABILITY_INCREMENT,
                MAX_PROBABILITY
            );
        }
        
        emit SpinResult(player, requestId, symbols, winAmount, prizeType);
    }
    
    /// @notice 计算中奖结果
    function calculateWin(
        address player,
        uint8[3] memory symbols,
        uint256 randomness
    ) internal view returns (uint256 winAmount, string memory prizeType) {
        uint256 prizePool = address(this).balance;
        
        // 检查头奖: 三个7 (符号0代表7)
        if (symbols[0] == 0 && symbols[1] == 0 && symbols[2] == 0) {
            return (prizePool * JACKPOT_REWARD / 10000, "jackpot");
        }
        
        // 检查二等奖: 三个相同
        if (symbols[0] == symbols[1] && symbols[1] == symbols[2]) {
            return (prizePool * SECOND_PRIZE_REWARD / 10000, "second");
        }
        
        // 检查小奖: 两个相同 + 概率判定
        if (symbols[0] == symbols[1] || symbols[1] == symbols[2] || symbols[0] == symbols[2]) {
            uint256 probability = playerProbability[player];
            if (probability == 0) probability = BASE_PROBABILITY;
            
            // 使用随机数判定是否中奖
            uint256 roll = (randomness >> 24) % 10000;
            if (roll < probability) {
                return (prizePool * SMALL_PRIZE_REWARD / 10000, "small");
            }
        }
        
        return (0, "none");
    }
    
    // ============ 管理函数 ============
    
    /// @notice 注入奖池资金
    function fundPrizePool() external payable {
        emit PrizePoolFunded(msg.sender, msg.value);
    }
    
    /// @notice 获取奖池余额
    function getPrizePool() external view returns (uint256) {
        return address(this).balance;
    }
    
    /// @notice 获取玩家当前概率
    function getPlayerProbability(address player) external view returns (uint256) {
        uint256 prob = playerProbability[player];
        return prob == 0 ? BASE_PROBABILITY : prob;
    }
    
    /// @notice 更新 VRF 参数
    function updateVRFConfig(
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit
    ) external onlyOwner {
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
    }
    
    /// @notice 紧急提取（仅限管理员）
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
    
    // ============ 辅助函数 ============
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    receive() external payable {
        emit PrizePoolFunded(msg.sender, msg.value);
    }
}
```

### 2.3 游戏流程图

```
玩家调用 spin()
       │
       ▼
检查代币余额 >= 20,000
       │
       ▼
调用 token.burnForGame() 销毁代币
       │
       ▼
请求 Chainlink VRF 随机数
       │
       ▼
等待 VRF 回调 (约 2-3 个区块)
       │
       ▼
fulfillRandomWords() 被调用
       │
       ▼
生成 3 个符号 (0-6)
       │
       ▼
计算中奖结果
       │
       ├── 头奖 (三个7) ──▶ 发放 20% 奖池
       │
       ├── 二等奖 (三相同) ──▶ 发放 5% 奖池
       │
       ├── 小奖 (两相同+概率) ──▶ 发放 1% 奖池
       │
       └── 未中奖 ──▶ 概率 +2%
```

---

## 3. Chainlink VRF 集成指南

### 3.1 BNB Chain 配置

| 网络 | VRF Coordinator | Key Hash |
|------|-----------------|----------|
| BSC Mainnet | `0xc587d9053cd1118f25F645F9E08BB98c9712A4EE` | 见下方 |
| BSC Testnet | `0x6A2AAd07396B36Fe02a22b33cf443582f682c82f` | 见下方 |

### 3.2 Key Hash 选择

**BSC Mainnet:**
- 200 gwei: `0x114f3da0a805b6a67d6e9cd2ec746f7028f1b7376365af575cfea3550dd1aa04`
- 500 gwei: `0xba6e730de88d94a5510ae6613898bfb0c3de5d16e609c5b7da808747125506f7`

**BSC Testnet:**
- 50 gwei: `0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314`

### 3.3 订阅设置步骤

1. 访问 [Chainlink VRF Subscription Manager](https://vrf.chain.link/)
2. 连接钱包并选择 BNB Chain
3. 创建新的 Subscription
4. 向 Subscription 充入 LINK 代币
5. 添加 Consumer（你的游戏合约地址）

### 3.4 费用估算

每次 VRF 请求大约消耗 0.005 - 0.01 LINK。建议：
- 测试阶段：充入 10 LINK
- 生产环境：根据预期调用次数充入

---

## 4. 部署指南

### 4.1 部署顺序

1. **部署代币合约**
   ```bash
   # 参数: 名称, 符号, 初始供应量
   CyberToken("Cyber Slots Token", "CST", 1000000000)
   ```

2. **部署游戏合约**
   ```bash
   # 参数: VRF Coordinator, 代币地址, keyHash, subscriptionId
   CyberSlots(vrfCoordinator, tokenAddress, keyHash, subId)
   ```

3. **配置合约**
   ```bash
   # 在代币合约中设置游戏合约地址
   token.setGameContract(gameContractAddress)
   
   # 在 VRF Subscription 中添加游戏合约为 Consumer
   ```

4. **注入奖池**
   ```bash
   # 向游戏合约发送 BNB
   gameContract.fundPrizePool{value: 10 ether}()
   ```

### 4.2 测试网部署清单

- [ ] 部署代币合约
- [ ] 验证代币合约代码
- [ ] 部署游戏合约
- [ ] 验证游戏合约代码
- [ ] 创建 VRF Subscription
- [ ] 充值 LINK 到 Subscription
- [ ] 添加游戏合约为 Consumer
- [ ] 设置游戏合约地址到代币合约
- [ ] 注入测试 BNB 到奖池
- [ ] 进行完整游戏测试

### 4.3 主网部署注意事项

1. **安全审计** - 强烈建议在主网部署前进行专业审计
2. **合约验证** - 在 BSCScan 上验证并开源合约代码
3. **多签控制** - 考虑使用多签钱包作为 Owner
4. **渐进式发布** - 先小额测试，确认无误后再增加奖池

---

## 5. 安全考虑

### 5.1 已实现的安全措施

- ✅ ReentrancyGuard 防重入
- ✅ Ownable 访问控制
- ✅ 使用 Chainlink VRF 确保随机性
- ✅ 代币销毁不可逆

### 5.2 建议的额外措施

- 🔲 添加 Pausable 功能（紧急暂停）
- 🔲 实现时间锁（重要操作延迟执行）
- 🔲 设置每日/每用户限额
- 🔲 添加黑名单功能

### 5.3 已知风险

| 风险 | 说明 | 缓解措施 |
|------|------|----------|
| 奖池耗尽 | 连续中奖可能耗尽奖池 | 设置最低奖池阈值 |
| VRF 故障 | Chainlink 网络问题 | 实现超时退款机制 |
| 价格波动 | BNB 价格波动影响奖励价值 | 可考虑稳定币奖池 |

---

## 6. 升级路径

### 6.1 可升级合约设计

建议使用 OpenZeppelin 的 UUPS 代理模式，便于后续功能升级：

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
```

### 6.2 未来功能扩展

- 多种游戏模式（不同投注额）
- NFT 会员系统
- 锦标赛活动
- 跨链支持

---

## 📝 总结

本文档提供了 Cyber Slots 项目的完整智能合约设计，包括：

1. **代币合约** - BEP-20 标准 + 销毁功能
2. **游戏合约** - 老虎机逻辑 + Chainlink VRF
3. **部署指南** - 详细的部署步骤和配置
4. **安全建议** - 最佳实践和风险缓解

请将此文档交给专业的 Solidity 开发者进行实现，并在上线前完成安全审计。
