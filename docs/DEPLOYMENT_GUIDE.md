# 🚀 Burn Slots 智能合约部署完整指南（新手版）

本指南将一步步教你如何部署 Burn Slots 老虎机游戏的智能合约到 BNB Chain。

---

## 📋 目录

1. [准备工作](#1-准备工作)
2. [部署代币合约 (CyberToken)](#2-部署代币合约-cybertoken)
3. [创建 Chainlink VRF 订阅](#3-创建-chainlink-vrf-订阅)
4. [部署游戏合约 (CyberSlots)](#4-部署游戏合约-cyberslots)
5. [配置合约关联](#5-配置合约关联)
6. [注入奖池资金](#6-注入奖池资金)
7. [测试游戏](#7-测试游戏)
8. [更新前端配置](#8-更新前端配置)
9. [常见问题](#9-常见问题)

---

## 1. 准备工作

### 1.1 安装 MetaMask 钱包

1. 访问 [MetaMask 官网](https://metamask.io/)
2. 下载并安装浏览器扩展
3. 创建新钱包或导入已有钱包
4. **⚠️ 务必安全保管你的助记词！**

### 1.2 添加 BNB Chain 网络

**测试网 (BSC Testnet)** - 先用这个练习：
| 设置项 | 值 |
|--------|-----|
| 网络名称 | BNB Smart Chain Testnet |
| RPC URL | https://data-seed-prebsc-1-s1.binance.org:8545/ |
| Chain ID | 97 |
| 货币符号 | tBNB |
| 区块浏览器 | https://testnet.bscscan.com |

**主网 (BSC Mainnet)** - 正式部署用：
| 设置项 | 值 |
|--------|-----|
| 网络名称 | BNB Smart Chain |
| RPC URL | https://bsc-dataseed.binance.org/ |
| Chain ID | 56 |
| 货币符号 | BNB |
| 区块浏览器 | https://bscscan.com |

### 1.3 获取测试代币

**测试网需要的代币：**

1. **测试 BNB** - 用于支付 Gas 费
   - 访问 [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
   - 输入你的钱包地址
   - 领取测试 BNB

2. **测试 LINK** - 用于 Chainlink VRF
   - 访问 [Chainlink Faucet](https://faucets.chain.link/bsc-testnet)
   - 连接钱包
   - 领取测试 LINK

---

## 2. 部署代币合约 (CyberToken)

### 2.1 打开 Remix IDE

1. 访问 [Remix IDE](https://remix.ethereum.org/)
2. 这是一个在线 Solidity 编辑器，无需安装

### 2.2 创建合约文件

1. 在左侧 **File Explorer** 中
2. 点击 📄 **New File** 图标
3. 输入文件名：`CyberToken.sol`
4. 将 `contracts/CyberToken.sol` 的完整代码粘贴进去

### 2.3 编译合约

1. 点击左侧 **Solidity Compiler** 图标（第二个图标）
2. 设置编译器版本：`0.8.19`
3. 点击 **Compile CyberToken.sol**
4. ✅ 看到绿色勾号表示编译成功

### 2.4 部署合约

1. 点击左侧 **Deploy & Run** 图标（第三个图标）
2. **ENVIRONMENT** 选择：`Injected Provider - MetaMask`
3. MetaMask 会弹出连接请求，点击 **连接**
4. 在 **CONTRACT** 下拉框选择：`CyberToken`
5. 在 **Deploy** 旁边填入参数：

```
name: "Burn Slots Token"
symbol: "CST"
initialSupply: 1000000000
```

6. 点击 **Deploy**
7. MetaMask 弹出，确认交易
8. 等待交易确认...

### 2.5 记录代币地址

1. 部署成功后，在 **Deployed Contracts** 区域
2. 复制合约地址（类似 `0x1234...abcd`）
3. **📝 记录下来，后面要用！**

```
我的代币合约地址: ____________________________________
```

---

## 3. 创建 Chainlink VRF 订阅

VRF (Verifiable Random Function) 提供可验证的随机数，确保游戏公平。

### 3.1 访问 Chainlink VRF 管理页面

1. 访问 [Chainlink VRF](https://vrf.chain.link/)
2. 点击右上角 **Connect Wallet**
3. 选择 **BNB Chain** 或 **BNB Chain Testnet**

### 3.2 创建订阅

1. 点击 **Create Subscription**
2. 确认 MetaMask 交易
3. 创建成功后会显示 **Subscription ID**

### 3.3 充值 LINK

1. 在订阅详情页，点击 **Add Funds**
2. 输入 LINK 数量：
   - 测试网：`5 LINK`
   - 主网：建议 `10+ LINK`
3. 确认交易

### 3.4 记录订阅 ID

```
我的 VRF Subscription ID: ____________________________________
```

---

## 4. 部署游戏合约 (CyberSlots)

### 4.1 创建合约文件

1. 在 Remix 中创建新文件：`CyberSlots.sol`
2. 粘贴 `contracts/CyberSlots.sol` 的完整代码

### 4.2 编译合约

1. 编译器版本：`0.8.19`
2. 点击 **Compile CyberSlots.sol**

### 4.3 准备部署参数

**BSC 测试网参数：**
```
_vrfCoordinator: 0x6A2AAd07396B36Fe02a22b33cf443582f682c82f
_token: [你的代币合约地址]
_keyHash: 0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314
_subscriptionId: [你的 Subscription ID]
```

**BSC 主网参数：**
```
_vrfCoordinator: 0xc587d9053cd1118f25F645F9E08BB98c9712A4EE
_token: [你的代币合约地址]
_keyHash: 0x114f3da0a805b6a67d6e9cd2ec746f7028f1b7376365af575cfea3550dd1aa04
_subscriptionId: [你的 Subscription ID]
```

### 4.4 部署合约

1. 在 Deploy 区域，选择 `CyberSlots` 合约
2. 填入上述参数
3. 点击 **Deploy**
4. 确认 MetaMask 交易

### 4.5 记录游戏合约地址

```
我的游戏合约地址: ____________________________________
```

---

## 5. 配置合约关联

### 5.1 添加 VRF Consumer

1. 回到 [Chainlink VRF](https://vrf.chain.link/)
2. 点击你的 Subscription
3. 点击 **Add Consumer**
4. 输入游戏合约地址
5. 确认交易

### 5.2 设置游戏合约地址

1. 在 Remix 中找到已部署的 **CyberToken** 合约
2. 展开合约函数列表
3. 找到 `setGameContract` 函数
4. 输入游戏合约地址
5. 点击 **transact**
6. 确认交易

### 5.3 配置交易税（可选）

如果你想启用交易税（买卖代币时自动收取费用进奖池）：

1. 在 CyberToken 合约中找到 `configureTax` 函数
2. 填入参数：
```
_enabled: true
_buyRate: 300      // 3% 买入税
_sellRate: 300     // 3% 卖出税
_receiver: [游戏合约地址]
```
3. 确认交易

---

## 6. 注入奖池资金

游戏需要初始奖池才能运行。

### 6.1 注入 BNB 到奖池

1. 在 Remix 中找到已部署的 **CyberSlots** 合约
2. 在合约上方的 **Value** 字段输入 BNB 数量
   - 例如输入 `0.1` 表示 0.1 BNB
   - 单位选择 `Ether`（这里代表 BNB）
3. 找到 `fundPrizePool` 函数
4. 点击执行
5. 确认交易

---

## 7. 测试游戏

### 7.1 获取测试代币

确保你的钱包有足够的 CST 代币（至少 20,000 CST）。

### 7.2 授权代币使用

1. 在 CyberToken 合约中找到 `approve` 函数
2. 填入参数：
```
spender: [游戏合约地址]
amount: 115792089237316195423570985008687907853269984665640564039457584007913129639935
```
（这是最大 uint256 值，表示无限授权）

3. 确认交易

### 7.3 进行第一次游戏

1. 在 CyberSlots 合约中找到 `spin` 函数
2. 输入投注金额（注意要加上 18 位小数）：
   - 20,000 CST = `20000000000000000000000`
3. 点击执行
4. 确认交易

### 7.4 查看结果

1. 等待 2-3 个区块（约 10-15 秒）
2. VRF 会自动回调，生成游戏结果
3. 查看事件日志获取结果

---

## 8. 更新前端配置

部署完成后，需要更新前端代码中的合约地址。

### 8.1 编辑配置文件

打开 `src/config/contracts.ts`，更新地址：

```typescript
export const CYBER_SLOTS_ADDRESS = {
  mainnet: '你的游戏合约主网地址',
  testnet: '你的游戏合约测试网地址',
};

export const CYBER_TOKEN_ADDRESS = {
  mainnet: '你的代币合约主网地址',
  testnet: '你的代币合约测试网地址',
};
```

---

## 9. 常见问题

### Q: 部署时 Gas 不足怎么办？
A: 确保钱包有足够的 BNB（测试网用 tBNB），可以去水龙头领取。

### Q: VRF 回调失败怎么办？
A: 检查 Subscription 是否有足够的 LINK，以及是否已添加 Consumer。

### Q: 如何验证合约源码？
A: 在 BSCScan 上找到合约地址，点击 "Verify and Publish"，上传源码。

### Q: 如何在主网部署？
A: 流程完全相同，只需：
1. MetaMask 切换到 BSC Mainnet
2. 使用主网参数（VRF Coordinator、keyHash）
3. 准备真实的 BNB 和 LINK

### Q: 如何提高安全性？
A: 
1. 主网部署前进行专业安全审计
2. 考虑使用多签钱包（如 Gnosis Safe）作为 Owner
3. 先小额测试，确认无误后再增加奖池

---

## 📝 部署检查清单

- [ ] MetaMask 安装并配置 BSC 网络
- [ ] 获取测试 BNB 和 LINK
- [ ] 部署 CyberToken 合约
- [ ] 记录代币合约地址
- [ ] 创建 Chainlink VRF Subscription
- [ ] 充值 LINK 到 Subscription
- [ ] 记录 Subscription ID
- [ ] 部署 CyberSlots 合约
- [ ] 记录游戏合约地址
- [ ] 在 VRF 中添加 Consumer
- [ ] 在 CyberToken 中设置游戏合约
- [ ] 向奖池注入初始资金
- [ ] 测试游戏功能
- [ ] 更新前端配置

---

## 🔗 有用链接

| 资源 | 链接 |
|------|------|
| Remix IDE | https://remix.ethereum.org/ |
| BSC Testnet Faucet | https://testnet.bnbchain.org/faucet-smart |
| Chainlink VRF | https://vrf.chain.link/ |
| Chainlink Faucet | https://faucets.chain.link/ |
| BSCScan (主网) | https://bscscan.com/ |
| BSCScan (测试网) | https://testnet.bscscan.com/ |

---

**🎉 恭喜！如果你完成了以上所有步骤，你的 Burn Slots 游戏就已经成功部署了！**

如有问题，请在项目仓库提交 Issue。
