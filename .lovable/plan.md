
# CyberHiLo 合约升级计划：添加"猜相同"功能

## 目标
允许玩家在猜大、猜小之外，选择"猜相同"。如果猜相同且新牌确实相同，算玩家赢；其他情况相同牌仍算输。

---

## 一、智能合约修改 (`contracts/CyberHiLo.sol`)

### 1.1 修改 VRFRequest 结构体
```solidity
// 当前
struct VRFRequest {
    address player;
    uint8 guessHigh;        // 0=Low, 1=High
    uint256 timestamp;
    bool fulfilled;
}

// 修改为
struct VRFRequest {
    address player;
    uint8 guessType;        // 0=Low, 1=High, 2=Same
    uint256 timestamp;
    bool fulfilled;
}
```

### 1.2 修改 guess 函数
```solidity
// 当前
function guess(bool guessHigh) external returns (uint256 requestId)

// 修改为
function guess(uint8 guessType) external returns (uint256 requestId)
// guessType: 0=猜小, 1=猜大, 2=猜相同
// 添加验证: require(guessType <= 2, "Invalid guess type")
```

### 1.3 修改 fulfillRandomWords 胜负判断逻辑
```solidity
// 当前逻辑
bool won;
if (request.guessHigh == 1) {
    won = newCard > oldCard;
} else {
    won = newCard < oldCard;
}
if (newCard == oldCard) {
    won = false;  // 相同一律算输
}

// 修改为
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
```

### 1.4 更新事件
```solidity
// 修改事件参数名
event GuessRequested(address indexed player, uint256 indexed requestId, uint8 guessType);
```

---

## 二、前端修改

### 2.1 更新合约 ABI (`src/config/contracts.ts`)
```typescript
// 修改 guess 函数签名
"function guess(uint8 guessType) external returns (uint256 requestId)",

// 修改事件签名
"event GuessRequested(address indexed player, uint256 indexed requestId, uint8 guessType)",
```

### 2.2 更新 useCyberHiLo Hook (`src/hooks/useCyberHiLo.ts`)
```typescript
// 修改 guess 函数参数
const guess = async (guessType: 'higher' | 'lower' | 'same') => {
  const typeValue = guessType === 'higher' ? 1 : guessType === 'lower' ? 0 : 2;
  const tx = await contract.guess(typeValue);
  // ...
};
```

### 2.3 更新 HiLoGame 组件 (`src/components/hilo/HiLoGame.tsx`)
- 移除 `CONTRACT_DEPLOYED` 时隐藏 "Same" 按钮的逻辑
- 确保三个按钮都连接到合约的 guess 函数

---

## 三、概率说明

| 猜测类型 | 胜利条件 | 最佳概率 | 最差概率 |
|---------|---------|---------|---------|
| 猜大 | 新牌 > 当前牌 | ~92% (当前A) | ~8% (当前K) |
| 猜小 | 新牌 < 当前牌 | ~92% (当前K) | ~8% (当前A) |
| 猜相同 | 新牌 = 当前牌 | 7.7% (4/52) | 7.7% (固定) |

猜相同是高风险高回报的选择，胜率约 7.7%，但可以避免"相同算输"的惩罚。

---

## 四、文件修改清单

| 文件 | 修改内容 |
|-----|---------|
| `contracts/CyberHiLo.sol` | VRFRequest结构体、guess函数、fulfillRandomWords逻辑、事件 |
| `src/config/contracts.ts` | 更新 CYBER_HILO_ABI |
| `src/hooks/useCyberHiLo.ts` | guess 函数支持三种类型 |
| `src/components/hilo/HiLoGame.tsx` | 启用 "Same" 按钮的合约调用 |

---

## 五、注意事项

1. **合约需重新部署** - 修改后是新合约
2. **向后兼容** - 新合约与旧前端不兼容，需同步更新
3. **奖励不变** - 猜相同成功后的奖励计算逻辑不变，仍按连胜数获得奖池百分比
