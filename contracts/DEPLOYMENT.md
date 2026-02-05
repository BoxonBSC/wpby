 # CyberChainGame 智能合约部署指南
 
 ## 📋 目录
 
 1. [合约概述](#合约概述)
 2. [部署前准备](#部署前准备)
 3. [Remix 部署步骤](#remix-部署步骤)
 4. [部署后配置](#部署后配置)
 5. [验证合约](#验证合约)
 6. [管理函数说明](#管理函数说明)
 7. [常见问题](#常见问题)
 
 ---
 
 ## 合约概述
 
 **CyberChainGame** 是一个"击鼓传花"游戏合约，核心机制：
 
 - 🔥 玩家用代币出价"接盘"，代币转入指定钱包（分散到3个地址）
 - ⏰ 每整点（1小时）自动结算，最后接盘者赢得 BNB 奖池
 - 📈 每次出价需比上一次高 **10%**
 - 💰 动态奖励比例：参与人数越多，赢家可提取比例越高（35%-60%）
 
 ### 核心参数（硬编码，不可修改）
 
 | 参数 | 值 | 说明 |
 |------|-----|------|
| `ROUND_DURATION` | 1 小时 | 每轮持续时间（管理员可调整 5分钟-24小时） |
| `PLATFORM_RATE` | 5% | 平台手续费 |
| `MIN_FIRST_BID` | 10,000 代币 | 首次最低出价 |
| 递增出价 | 必须 > 当前出价 | 后一次出价必须严格大于前一次 |
 
 ### 动态奖励比例
 
 | 参与人数 | 赢家提取比例 | 滚入下轮 |
 |----------|-------------|---------|
 | 1-10 人 | 35% | 65% |
 | 11-20 人 | 42% | 58% |
 | 21-30 人 | 48% | 52% |
 | 31-40 人 | 54% | 46% |
 | 41+ 人 | 60% | 40% |
 
 ---
 
 ## 部署前准备
 
 ### 1. 准备钱包和地址
 
 你需要准备以下地址：
 
 | 角色 | 说明 | 示例 |
 |------|------|------|
 | **部署者钱包** | 将成为合约 Owner，可执行管理操作 | 你的主钱包 |
 | **代币合约地址** | CYBER 代币合约 | `0x23064e69e049eb1ee040c7068ce0b5fc4b107777` |
 | **平台费钱包** | 接收 5% 平台手续费 | 你的收款钱包 |
 | **代币接收钱包 1** | 接收玩家出价代币 | 钱包 A |
 | **代币接收钱包 2** | 接收玩家出价代币 | 钱包 B |
 | **代币接收钱包 3** | 接收玩家出价代币 | 钱包 C |
 
 ### 2. 准备 BNB
 
 - **部署 Gas**：约 0.01-0.02 BNB
 - **初始奖池**：建议至少 0.5-1 BNB 作为启动奖池
 - **结算补贴池**：建议 0.1 BNB（用于补偿触发结算的玩家）
 
 ### 3. 记录你的配置
 
 ```
 代币地址:       0x23064e69e049eb1ee040c7068ce0b5fc4b107777
 平台费钱包:     0x________________（填写你的地址）
 代币接收钱包1:  0x________________（填写你的地址）
 代币接收钱包2:  0x________________（填写你的地址）
 代币接收钱包3:  0x________________（填写你的地址）
 ```
 
 ---
 
 ## Remix 部署步骤
 
 ### 步骤 1：打开 Remix
 
 1. 访问 [https://remix.ethereum.org](https://remix.ethereum.org)
 2. 在左侧文件浏览器中，创建新文件 `CyberChainGame.sol`
 3. 复制 `contracts/CyberChainGame.sol` 的完整代码粘贴进去
 
 ### 步骤 2：安装 OpenZeppelin 依赖
 
 在 Remix 中，合约会自动从 npm 拉取 OpenZeppelin 依赖。如果报错，手动创建以下 import 映射：
 
 点击左侧 **Plugin Manager** → 搜索 **"remixd"** 或直接使用 Remix 的在线依赖。
 
 或者，在 `contracts/` 文件夹中创建 `.deps/npm/@openzeppelin/` 目录结构。
 
 > **推荐方式**：直接使用 Remix，它会自动处理 `@openzeppelin/contracts` 的导入。
 
 ### 步骤 3：编译合约
 
 1. 点击左侧 **Solidity Compiler** 图标 (第二个)
 2. 配置：
    - **Compiler Version**: `0.8.19` 或更高
    - **EVM Version**: `paris` 或 `default`
    - **Enable Optimization**: ✅ 勾选，Runs: `200`
 3. 点击 **Compile CyberChainGame.sol**
 4. 确保没有红色错误（黄色警告可忽略）
 
 ### 步骤 4：连接钱包
 
 1. 点击左侧 **Deploy & Run Transactions** 图标 (第三个)
 2. **Environment** 选择：`Injected Provider - MetaMask`
 3. MetaMask 弹出连接请求，确认连接
 4. 确保：
    - 网络是 **BSC Mainnet** (Chain ID: 56)
    - 钱包有足够 BNB 支付 Gas
 
 ### 步骤 5：配置构造函数参数
 
 在 **Deploy** 区域，展开 `CyberChainGame` 合约，填写构造函数参数：
 
 ```
 _token:          0x23064e69e049eb1ee040c7068ce0b5fc4b107777
 _platformWallet: 0x你的平台费钱包地址
 _tokenReceivers: ["0x钱包A地址", "0x钱包B地址", "0x钱包C地址"]
 ```
 
 **⚠️ 重要格式说明**：
 
 `_tokenReceivers` 参数是一个数组，必须用 JSON 格式：
 ```json
 ["0xABC123...", "0xDEF456...", "0xGHI789..."]
 ```
 
 **示例**（假设你的三个接收钱包）：
 ```
 _token:          0x23064e69e049eb1ee040c7068ce0b5fc4b107777
 _platformWallet: 0x1234567890123456789012345678901234567890
 _tokenReceivers: ["0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC"]
 ```
 
 ### 步骤 6：部署合约
 
 1. 点击 **transact** 按钮
 2. MetaMask 弹出交易确认：
    - Gas Limit: 约 3,000,000 - 4,000,000
    - Gas Price: 根据网络情况自动设置
 3. 确认交易
 4. 等待交易确认（约 3-15 秒）
 
 ### 步骤 7：记录合约地址
 
 部署成功后：
 
 1. 在 Remix 底部 **Deployed Contracts** 区域找到新合约
 2. 复制合约地址（点击地址旁边的复制图标）
 3. **保存这个地址！** 这是你的游戏合约地址
 
 ```
 合约地址: 0x________________（保存这个！）
 ```
 
 ---
 
 ## 部署后配置
 
 ### 1. 注入初始奖池 (必须)
 
 向合约地址直接转账 BNB 作为初始奖池：
 
 1. 打开 MetaMask
 2. 点击 **发送**
 3. **收款地址**：填入刚部署的合约地址
 4. **金额**：建议 0.5-1 BNB
 5. 确认发送
 
 > 合约有 `receive()` 函数，直接转账的 BNB 会自动加入奖池。
 
 ### 2. 注入结算补贴池 (推荐)
 
 结算补贴用于奖励触发整点结算的玩家（补偿 Gas 费）。
 
 在 Remix 中调用 `fundSettlementBonusPool()`：
 
 1. 在 **Deployed Contracts** 找到你的合约
 2. 展开合约函数列表
 3. 在 **VALUE** 输入框填入金额（如 `0.1` ether）
 4. 找到 `fundSettlementBonusPool` 函数，点击调用
 5. 确认 MetaMask 交易
 
 ### 3. 更新前端配置
 
 在项目中更新合约地址：
 
 **文件**: `src/config/contracts.ts`
 
 ```typescript
 export const CYBER_CHAIN_GAME_ADDRESS = {
   mainnet: '0x你的合约地址',  // ← 填入新部署的地址
   testnet: '0x0000000000000000000000000000000000000000',
 };
 ```
 
 ---
 
 ## 验证合约
 
 在 BscScan 上验证合约源码，让用户可以查看和信任：
 
 ### 步骤 1：打开 BscScan
 
 1. 访问 `https://bscscan.com/address/你的合约地址`
 2. 点击 **Contract** 标签
 3. 点击 **Verify and Publish**
 
 ### 步骤 2：填写验证信息
 
 | 字段 | 值 |
 |------|-----|
 | Compiler Type | Solidity (Single file) |
 | Compiler Version | v0.8.19+commit.7dd6d404 |
 | Open Source License | MIT License |
 
 ### 步骤 3：Flatten 合约代码
 
 由于合约使用了 OpenZeppelin 依赖，需要将所有代码合并成单文件。
 
 **方法 1：使用 Remix Flattener**
 1. 在 Remix 中，右键点击 `CyberChainGame.sol`
 2. 选择 **Flatten**
 3. 复制生成的完整代码
 
 **方法 2：使用在线工具**
 - [https://flattener.dev/](https://flattener.dev/)
 
 ### 步骤 4：提交验证
 
 1. 粘贴 Flatten 后的完整代码
 2. 填写构造函数参数（ABI 编码格式）
 3. 点击 **Verify and Publish**
 
 #### 构造函数参数 ABI 编码
 
 使用 [https://abi.hashex.org/](https://abi.hashex.org/) 生成：
 
 1. 添加参数：
    - `address _token`: 你的代币地址
    - `address _platformWallet`: 平台费钱包
    - `address[3] _tokenReceivers`: 三个接收钱包数组
 
 2. 复制生成的 ABI 编码字符串
 
 ---
 
 ## 管理函数说明
 
 以下函数只有 **Owner** 可以调用：
 
 ### 核心管理
 
 | 函数 | 参数 | 说明 |
 |------|------|------|
 | `setPlatformWallet` | `address _wallet` | 更改平台费接收钱包 |
 | `setTokenReceiver` | `uint8 index, address _receiver` | 更改指定索引(0/1/2)的代币接收钱包 |
 | `setAllTokenReceivers` | `address[3] _receivers` | 批量更改全部3个接收钱包 |
 | `updateDynamicTier` | `uint8 index, uint16 min, uint16 max, uint8 rate` | 调整动态比例配置 |
 
 ### 资金管理
 
 | 函数 | 参数 | 说明 |
 |------|------|------|
 | `fundSettlementBonusPool` | 带 BNB 调用 | 向结算补贴池注资 |
 | `setSettlementBonus` | `uint256 _bonus` | 设置每次结算补贴金额（最高 0.01 BNB） |
 | `emergencyWithdraw` | 无 | 紧急提取合约全部 BNB（立即生效） |
 
 ### 安全控制
 
 | 函数 | 说明 |
 |------|------|
 | `pause()` | 暂停游戏（禁止出价） |
 | `unpause()` | 恢复游戏 |
 
 ---
 
 ## 常见问题
 
 ### Q1: 部署失败 "Invalid token"
 
 **原因**: 代币地址填写错误或为零地址
 
 **解决**: 确认代币地址正确，格式为 `0x...`（42个字符）
 
 ### Q2: 部署失败 "Invalid receiver"
 
 **原因**: 三个接收钱包地址中有零地址
 
 **解决**: 确保三个钱包地址都是有效地址，不能是 `0x0000...`
 
 ### Q3: Gas 估算失败
 
 **原因**: 可能是参数格式错误
 
 **解决**: 
 - 确保 `_tokenReceivers` 是 JSON 数组格式
 - 所有地址以 `0x` 开头
 
 ### Q4: 玩家无法出价
 
 **可能原因**:
 1. 合约处于暂停状态 → 调用 `unpause()`
 2. 玩家未授权代币 → 玩家需先 approve
 3. 玩家余额不足 → 检查代币余额
 
 ### Q5: 如何查看当前状态
 
 调用只读函数：
 - `getCurrentRound()` - 当前轮次信息
 - `getMinBid()` - 当前最低出价
 - `getTimeRemaining()` - 剩余时间
 - `getAllTokenReceivers()` - 查看三个接收钱包
 
 ### Q6: 奖池没有增加
 
 **原因**: 奖池来源是直接转入合约的 BNB，代币买卖税收需要在代币合约中配置自动转账到游戏合约
 
 **解决**: 
 1. 手动向合约地址转 BNB
 2. 或在代币合约中配置税收自动流入
 
 ---
 
 ## 部署检查清单
 
 部署完成后，请确认：
 
 - [ ] 合约地址已记录
 - [ ] 初始奖池已注入 (≥0.5 BNB)
 - [ ] 结算补贴池已注入 (≥0.1 BNB)
 - [ ] 前端配置已更新 (`src/config/contracts.ts`)
 - [ ] 合约已在 BscScan 验证
 - [ ] 测试出价功能正常
 - [ ] 测试整点结算正常
 
 ---
 
 ## 联系支持
 
 如有问题，请检查：
 1. BSC 网络状态
 2. 钱包 BNB 余额
 3. 合约是否暂停
 4. 代币合约是否正常
 
 ---
 
 **部署成功后，记得更新前端代码中的合约地址！** 🚀