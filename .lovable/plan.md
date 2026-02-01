
# 修复"安全连胜"计算配置不同步问题

## 问题原因

`src/hooks/useCyberHiLo.ts` 中的 `calculateSafeStreak` 函数内部硬编码了旧的 maxStreaks 配置数组 `[5, 8, 12, 16, 20]`，而合约和 `hilo.ts` 配置文件已更新为单一门槛（500K，maxStreak = 12）。

这导致：
- 计算安全连胜时使用错误的上限（5 而非 12）
- 弹窗错误显示"安全连胜仅 5 级"

## 修复方案

### 步骤 1：更新 `calculateSafeStreak` 函数

**文件**: `src/hooks/useCyberHiLo.ts`

将硬编码的 `maxStreaks = [5, 8, 12, 16, 20]` 更新为新配置 `[12, 13, 14, 15, 16]`，与合约参数保持一致。

### 步骤 2：同步更新 `contracts.ts` 配置

**文件**: `src/config/contracts.ts`

检查并更新 `HILO_BET_LEVELS` 配置，确保与合约同步。

---

## 技术细节

**修改位置 1** - `src/hooks/useCyberHiLo.ts` 第 473-475 行：

```typescript
// 修改前
const maxStreaks = [5, 8, 12, 16, 20];
const maxStreak = maxStreaks[tierIndex] || 5;

// 修改后
const maxStreaks = [12, 13, 14, 15, 16];  // 与合约 setMaxStreaks 同步
const maxStreak = maxStreaks[tierIndex] || 12;
```

**修改位置 2** - `src/config/contracts.ts`（如需要）：

确保 `HILO_BET_LEVELS` 配置正确。

---

## 预期效果

修复后：
- 安全连胜计算将基于正确的 maxStreak = 12
- 弹窗仅在安全连胜数 < 6（12 的一半）时才触发
- 奖池余额 3.5499 BNB 足够支撑更高连胜时，不再错误弹出预警
