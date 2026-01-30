# Burn Slots 智能合约部署指南

## 📁 合约文件

- `CyberToken.sol` - BEP-20代币合约
- `CyberSlots.sol` - 老虎机游戏合约

## 🚀 Remix IDE 部署步骤

### 准备工作

1. 打开 [Remix IDE](https://remix.ethereum.org/)
2. 准备 MetaMask 钱包，切换到 **BSC Testnet**
3. 获取测试 BNB: https://testnet.bnbchain.org/faucet-smart
4. 获取测试 LINK: https://faucets.chain.link/bsc-testnet

### 步骤 1: 部署 CyberToken

1. 在 Remix 中创建新文件 `CyberToken.sol`
2. 粘贴 CyberToken.sol 的代码
3. 编译器版本选择 `0.8.19`
4. 切换到 Deploy 标签，Environment 选择 `Injected Provider - MetaMask`
5. 填入部署参数:
   - `name`: `Burn Slots Token`
   - `symbol`: `CST`
   - `initialSupply`: `1000000000`
6. 点击 Deploy，在 MetaMask 中确认交易
7. **记录代币合约地址**

### 步骤 2: 创建 Chainlink VRF Subscription

1. 访问 [Chainlink VRF](https://vrf.chain.link/)
2. 连接钱包，选择 **BNB Chain Testnet**
3. 点击 "Create Subscription"
4. 创建后，向 Subscription 充入 **5-10 LINK**
5. **记录 Subscription ID**

### 步骤 3: 部署 CyberSlots

1. 在 Remix 中创建新文件 `CyberSlots.sol`
2. 粘贴 CyberSlots.sol 的代码
3. 编译（版本 0.8.19）
4. 填入部署参数:

**BSC Testnet 参数:**
```
_vrfCoordinator: 0x6A2AAd07396B36Fe02a22b33cf443582f682c82f
_token: [你部署的CyberToken地址]
_keyHash: 0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314
_subscriptionId: [你的Subscription ID]
```

**BSC Mainnet 参数:**
```
_vrfCoordinator: 0xc587d9053cd1118f25F645F9E08BB98c9712A4EE
_token: [你部署的CyberToken地址]
_keyHash: 0x114f3da0a805b6a67d6e9cd2ec746f7028f1b7376365af575cfea3550dd1aa04
_subscriptionId: [你的Subscription ID]
```

5. 点击 Deploy，确认交易
6. **记录游戏合约地址**

### 步骤 4: 配置合约

1. **添加 VRF Consumer**
   - 回到 Chainlink VRF 页面
   - 点击你的 Subscription
   - 点击 "Add Consumer"
   - 输入 CyberSlots 合约地址

2. **设置游戏合约地址**
   - 在 Remix 中找到已部署的 CyberToken
   - 调用 `setGameContract` 函数
   - 输入 CyberSlots 合约地址

3. **配置交易税（可选）**
   ```solidity
   // 在 CyberToken 合约中调用
   configureTax(
     true,           // 启用
     300,            // 买入税 3%
     300,            // 卖出税 3%
     [CyberSlots地址] // 税收接收地址
   )
   ```

4. **注入奖池资金**
   - 在 CyberSlots 合约中
   - 找到 `fundPrizePool` 函数
   - 在 Value 字段输入 BNB 数量（如 0.1）
   - 点击调用

### 步骤 5: 测试游戏

1. **准备代币**
   - 确保账户有足够的 CST 代币
   - 至少需要 20,000 CST 进行一次游戏

2. **授权代币**（如果使用 transferFrom）
   ```solidity
   // 在 CyberToken 中调用
   approve([CyberSlots地址], [足够大的数量])
   ```

3. **开始游戏**
   ```solidity
   // 在 CyberSlots 中调用
   spin(20000000000000000000000) // 20,000 * 10^18
   ```

4. **等待结果**
   - VRF 回调通常需要 2-3 个区块（约 10-15 秒）
   - 查看事件日志获取游戏结果

## 📊 投注等级

| 等级 | 投注金额 | 概率加成 |
|------|----------|----------|
| 1 | 20,000 CST | 1x |
| 2 | 50,000 CST | 2.5x |
| 3 | 100,000 CST | 5x |
| 4 | 200,000 CST | 10x |
| 5 | 500,000 CST | 20x |

## 🏆 奖励等级

| 奖项 | 条件 | 奖池比例 |
|------|------|----------|
| 超级头奖 | 5个7️⃣ | 50% |
| 头奖 | 5个💎 或 4个7️⃣ | 25% |
| 一等奖 | 任意5个相同 | 10% |
| 二等奖 | 4个稀有符号 | 5% |
| 三等奖 | 4个普通符号 | 2% |
| 小奖 | 3个相同 | 0.5% |

## ⚠️ 安全注意事项

1. **主网部署前** 强烈建议进行专业安全审计
2. **合约验证** 在 BSCScan 上验证合约源码
3. **多签钱包** 考虑使用 Gnosis Safe 作为 Owner
4. **渐进发布** 先小额测试，确认无误后再增加奖池

## 🔗 有用链接

- [Remix IDE](https://remix.ethereum.org/)
- [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [Chainlink VRF](https://vrf.chain.link/)
- [BSCScan Testnet](https://testnet.bscscan.com/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
