

# 合约加入"递增出价"限制 + 前端同步更新

## 改动概述

在 `placeBid` 函数中增加一行校验：当本轮已有出价时，新出价必须严格大于当前最高出价。同时更新 `getMinBid` 为动态返回值，前端和部署文档同步更新。

---

## 合约改动（2处）

### 改动 1：placeBid 函数增加递增校验

在现有的 `require(tokenAmount >= MIN_FIRST_BID)` 之后，增加一行：

```solidity
require(currentRound.currentBid == 0 || tokenAmount > currentRound.currentBid, "Bid must be higher than current bid");
```

逻辑：
- 如果本轮还没人出价（currentBid == 0），只需满足最低 10,000 代币
- 如果已有出价，新出价必须严格大于当前最高出价

### 改动 2：getMinBid 改为动态返回

将 `getMinBid` 从 `pure` 改为 `view`，动态返回实际最低出价：

```solidity
function getMinBid() external view returns (uint256) {
    if (currentRound.currentBid == 0) {
        return MIN_FIRST_BID;
    }
    return uint256(currentRound.currentBid) + 1;
}
```

---

## 前端改动

### 文件：src/config/contracts.ts

更新 ABI 中 `getMinBid` 的签名从 `pure` 改为 `view`（实际 ethers.js 调用不区分，但保持准确）。

### 文件：src/components/chain-game/ChainGame.tsx

- 演示模式下 `minBid` 改为动态计算：`currentBid > 0 ? currentBid + 1 : 10000`
- 规则文案更新为"每次出价必须高于当前最高出价"

### 文件：contracts/DEPLOYMENT.md

- 移除已过时的 `BID_INCREMENT: 10%` 参数说明
- 更新构造函数参数说明（已无 `_token` 参数，token 通过 `setToken` 设置）

---

## 完整合约代码（供复制部署）

以下是改好的完整合约，可直接复制到 Remix 部署：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface AutomationCompatibleInterface {
    function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
    function performUpkeep(bytes calldata performData) external;
}

abstract contract VaultBase {
    error UnsupportedChain(uint256 chainId);

    function _getPortal() internal view returns (address portal) {
        uint256 chainId = block.chainid;
        if (chainId == 56) {
            return 0xe2cE6ab80874Fa9Fa2aAE65D277Dd6B8e65C9De0;
        } else if (chainId == 97) {
            return 0x5bEacaF7ABCbB3aB280e80D007FD31fcE26510e9;
        }
        revert UnsupportedChain(chainId);
    }

    function _getGuardian() internal view returns (address guardian) {
        uint256 chainId = block.chainid;
        if (chainId == 56) {
            return 0x9e27098dcD8844bcc6287a557E0b4D09C86B8a4b;
        } else if (chainId == 97) {
            return 0x76Fa8C526f8Bc27ba6958B76DeEf92a0dbE46950;
        }
        revert UnsupportedChain(chainId);
    }

    function description() public view virtual returns (string memory);
}

contract CyberChainGame is VaultBase, Ownable, ReentrancyGuard, Pausable, AutomationCompatibleInterface {
    using SafeERC20 for IERC20;

    uint256 public roundDuration = 1 hours;
    uint256 public constant PLATFORM_RATE = 5;
    uint256 public constant MIN_FIRST_BID = 10000 * 1e18;

    struct DynamicTier {
        uint16 minPlayers;
        uint16 maxPlayers;
        uint8 winnerRate;
    }

    DynamicTier[5] public dynamicTiers;

    IERC20 public token;
    bool public tokenSet;
    address public platformWallet;

    address[3] public tokenReceivers;
    uint8 public currentReceiverIndex;

    struct Round {
        uint64 roundId;
        uint64 startTime;
        uint64 endTime;
        uint128 prizePool;
        uint128 currentBid;
        address currentHolder;
        uint32 participantCount;
        bool settled;
    }

    struct RoundResult {
        address winner;
        uint128 prize;
        uint128 prizePool;
        uint32 participantCount;
        uint64 endTime;
        uint8 winnerRate;
    }

    Round public currentRound;
    uint256 public totalRounds;
    uint256 public totalBurned;
    uint256 public totalPaidOut;

    mapping(uint256 => mapping(address => bool)) public hasParticipated;

    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public playerEarnings;
    mapping(address => uint256) public playerBurned;

    mapping(uint256 => RoundResult) public roundHistory;

    mapping(address => uint256) public pendingRewards;

    uint8 public constant MAX_RECENT_BIDS = 20;
    struct BidRecord {
        address bidder;
        uint128 amount;
        uint64 timestamp;
    }
    BidRecord[20] public recentBids;
    uint8 public recentBidIndex;

    uint256 public settlementBonus = 0.001 ether;
    uint256 public settlementBonusPool;

    address public automationForwarder;
    bool public automationEnabled = true;

    event RoundStarted(uint256 indexed roundId, uint64 startTime, uint64 endTime);
    event BidPlaced(uint256 indexed roundId, address indexed player, uint256 tokensBurned, uint256 newBid, uint32 participantCount);
    event RoundSettled(uint256 indexed roundId, address indexed winner, uint256 prize, uint256 platformFee, uint32 participants, uint8 winnerRate);
    event PrizeSent(address indexed winner, uint256 amount);
    event PrizeSendFailed(address indexed winner, uint256 amount);
    event PlatformFeeSent(address indexed platform, uint256 amount);
    event FallbackRewardClaimed(address indexed player, uint256 amount);
    event PrizePoolFunded(address indexed funder, uint256 amount);
    event SettlementBonusPaid(address indexed settler, uint256 amount);
    event PlatformWalletChanged(address indexed oldWallet, address indexed newWallet);
    event SettlementBonusPoolFunded(uint256 amount);
    event TokenReceiverChanged(uint8 indexed index, address indexed oldReceiver, address indexed newReceiver);
    event TokenReceived(address indexed receiver, uint256 amount);
    event RoundDurationChanged(uint256 oldDuration, uint256 newDuration);
    event AutomationForwarderSet(address indexed oldForwarder, address indexed newForwarder);
    event AutomationToggled(bool enabled);
    event AutomationSettlement(uint256 indexed roundId, uint64 timestamp);
    event TokenSet(address indexed tokenAddress);

    constructor(
        address _platformWallet,
        address[3] memory _tokenReceivers
    ) Ownable(msg.sender) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_tokenReceivers[0] != address(0), "Invalid receiver 0");
        require(_tokenReceivers[1] != address(0), "Invalid receiver 1");
        require(_tokenReceivers[2] != address(0), "Invalid receiver 2");

        platformWallet = _platformWallet;
        tokenReceivers = _tokenReceivers;
        currentReceiverIndex = 0;

        dynamicTiers[0] = DynamicTier(1, 10, 35);
        dynamicTiers[1] = DynamicTier(11, 20, 42);
        dynamicTiers[2] = DynamicTier(21, 30, 48);
        dynamicTiers[3] = DynamicTier(31, 40, 54);
        dynamicTiers[4] = DynamicTier(41, 65535, 60);

        _startNewRound();
    }

    function setToken(address _token) external onlyOwner {
        require(!tokenSet, "Token already set");
        require(_token != address(0), "Invalid token");
        token = IERC20(_token);
        tokenSet = true;
        emit TokenSet(_token);
    }

    receive() external payable {
        uint256 newPool = uint256(currentRound.prizePool) + msg.value;
        require(newPool <= type(uint128).max, "Pool overflow");
        currentRound.prizePool = uint128(newPool);
        emit PrizePoolFunded(msg.sender, msg.value);
    }

    function placeBid(uint256 tokenAmount) external nonReentrant whenNotPaused {
        require(tokenSet, "Token not set");
        bool didSettle = false;

        if (block.timestamp >= currentRound.endTime && !currentRound.settled) {
            _settleRound();
            _startNewRound();
            didSettle = true;
        }

        require(block.timestamp < currentRound.endTime, "Round ended");
        require(tokenAmount >= MIN_FIRST_BID, "Bid too low, minimum 10000 tokens");
        require(currentRound.currentBid == 0 || tokenAmount > currentRound.currentBid, "Bid must be higher than current bid");
        require(msg.sender != currentRound.currentHolder, "Cannot bid consecutively");

        address receiver = tokenReceivers[currentReceiverIndex];
        currentReceiverIndex = (currentReceiverIndex + 1) % 3;

        token.safeTransferFrom(msg.sender, receiver, tokenAmount);
        emit TokenReceived(receiver, tokenAmount);

        totalBurned += tokenAmount;
        playerBurned[msg.sender] += tokenAmount;

        currentRound.currentHolder = msg.sender;
        currentRound.currentBid = uint128(tokenAmount);

        if (!hasParticipated[currentRound.roundId][msg.sender]) {
            hasParticipated[currentRound.roundId][msg.sender] = true;
            currentRound.participantCount++;
        }

        recentBids[recentBidIndex] = BidRecord({
            bidder: msg.sender,
            amount: uint128(tokenAmount),
            timestamp: uint64(block.timestamp)
        });
        recentBidIndex = (recentBidIndex + 1) % MAX_RECENT_BIDS;

        emit BidPlaced(
            currentRound.roundId,
            msg.sender,
            tokenAmount,
            tokenAmount,
            currentRound.participantCount
        );

        if (didSettle && settlementBonus > 0 && settlementBonusPool >= settlementBonus) {
            settlementBonusPool -= settlementBonus;
            (bool bonusSuccess, ) = payable(msg.sender).call{value: settlementBonus}("");
            if (bonusSuccess) {
                emit SettlementBonusPaid(msg.sender, settlementBonus);
            } else {
                settlementBonusPool += settlementBonus;
            }
        }
    }

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = automationEnabled &&
                       !paused() &&
                       block.timestamp >= currentRound.endTime &&
                       !currentRound.settled;
        performData = abi.encode(currentRound.roundId);
        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override nonReentrant {
        if (automationForwarder != address(0)) {
            require(msg.sender == automationForwarder, "Only automation forwarder");
        }
        uint64 expectedRoundId = abi.decode(performData, (uint64));
        require(expectedRoundId == currentRound.roundId, "Round ID mismatch");
        require(automationEnabled, "Automation disabled");
        require(!paused(), "Contract paused");
        require(block.timestamp >= currentRound.endTime, "Round not ended");
        require(!currentRound.settled, "Already settled");

        _settleRound();
        _startNewRound();

        emit AutomationSettlement(expectedRoundId, uint64(block.timestamp));
    }

    function setAutomationForwarder(address _forwarder) external onlyOwner {
        address oldForwarder = automationForwarder;
        automationForwarder = _forwarder;
        emit AutomationForwarderSet(oldForwarder, _forwarder);
    }

    function setAutomationEnabled(bool _enabled) external onlyOwner {
        automationEnabled = _enabled;
        emit AutomationToggled(_enabled);
    }

    function settleRound() external nonReentrant {
        require(block.timestamp >= currentRound.endTime, "Round not ended");
        require(!currentRound.settled, "Already settled");
        _settleRound();
        _startNewRound();
    }

    function claimRewards() external nonReentrant {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards");
        pendingRewards[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        emit FallbackRewardClaimed(msg.sender, amount);
    }

    function _startNewRound() internal {
        totalRounds++;

        uint64 currentPeriod = uint64(block.timestamp / roundDuration);
        uint64 startTime = currentPeriod * uint64(roundDuration);
        uint64 endTime = startTime + uint64(roundDuration);

        if (block.timestamp >= endTime) {
            startTime = endTime;
            endTime = startTime + uint64(roundDuration);
        }

        uint128 inheritedPool = currentRound.prizePool;

        for (uint8 i = 0; i < MAX_RECENT_BIDS; i++) {
            delete recentBids[i];
        }
        recentBidIndex = 0;

        currentRound = Round({
            roundId: uint64(totalRounds),
            startTime: startTime,
            endTime: endTime,
            prizePool: inheritedPool,
            currentBid: 0,
            currentHolder: address(0),
            participantCount: 0,
            settled: false
        });

        emit RoundStarted(totalRounds, startTime, endTime);
    }

    function _settleRound() internal {
        currentRound.settled = true;

        address winner = currentRound.currentHolder;
        uint32 participants = currentRound.participantCount;
        uint256 prizePool = currentRound.prizePool;

        uint8 winnerRate = 0;
        uint256 winnerPrize = 0;
        uint256 platformFee = 0;

        if (winner != address(0) && prizePool > 0) {
            winnerRate = _getWinnerRate(participants);
            uint256 grossPrize = prizePool * winnerRate / 100;
            platformFee = grossPrize * PLATFORM_RATE / 100;
            winnerPrize = grossPrize - platformFee;
            uint256 rollover = prizePool - grossPrize;

            (bool winnerSuccess, ) = payable(winner).call{value: winnerPrize}("");
            if (winnerSuccess) {
                emit PrizeSent(winner, winnerPrize);
            } else {
                pendingRewards[winner] += winnerPrize;
                emit PrizeSendFailed(winner, winnerPrize);
            }
            playerWins[winner]++;
            playerEarnings[winner] += winnerPrize;
            totalPaidOut += winnerPrize;

            if (platformFee > 0) {
                (bool platformSuccess, ) = payable(platformWallet).call{value: platformFee}("");
                if (platformSuccess) {
                    emit PlatformFeeSent(platformWallet, platformFee);
                } else {
                    pendingRewards[platformWallet] += platformFee;
                }
                totalPaidOut += platformFee;
            }

            currentRound.prizePool = uint128(rollover);
        }

        roundHistory[currentRound.roundId] = RoundResult({
            winner: winner,
            prize: uint128(winnerPrize),
            prizePool: uint128(prizePool),
            participantCount: participants,
            endTime: currentRound.endTime,
            winnerRate: winnerRate
        });

        emit RoundSettled(
            currentRound.roundId,
            winner,
            winnerPrize,
            platformFee,
            participants,
            winnerRate
        );
    }

    function _getWinnerRate(uint32 playerCount) internal view returns (uint8) {
        for (uint i = 0; i < 5; i++) {
            if (playerCount >= dynamicTiers[i].minPlayers &&
                playerCount <= dynamicTiers[i].maxPlayers) {
                return dynamicTiers[i].winnerRate;
            }
        }
        return 35;
    }

    function getCurrentRound() external view returns (
        uint256 roundId, uint256 startTime, uint256 endTime,
        uint256 prizePool, uint256 currentBid, address currentHolder,
        uint256 participantCount, bool settled
    ) {
        return (
            currentRound.roundId, currentRound.startTime, currentRound.endTime,
            currentRound.prizePool, currentRound.currentBid, currentRound.currentHolder,
            currentRound.participantCount, currentRound.settled
        );
    }

    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= currentRound.endTime) return 0;
        return currentRound.endTime - block.timestamp;
    }

    function getMinBid() external view returns (uint256) {
        if (currentRound.currentBid == 0) {
            return MIN_FIRST_BID;
        }
        return uint256(currentRound.currentBid) + 1;
    }

    function getPlayerStats(address player) external view returns (
        uint256 wins, uint256 earnings, uint256 burned, uint256 pending
    ) {
        return (playerWins[player], playerEarnings[player], playerBurned[player], pendingRewards[player]);
    }

    function getCurrentWinnerRate() external view returns (uint8) {
        return _getWinnerRate(currentRound.participantCount);
    }

    function getRecentBids() external view returns (BidRecord[20] memory) {
        return recentBids;
    }

    function hasPlayerParticipated(address player) external view returns (bool) {
        return hasParticipated[currentRound.roundId][player];
    }

    function getRoundResult(uint256 roundId) external view returns (RoundResult memory) {
        return roundHistory[roundId];
    }

    function setPlatformWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        address oldWallet = platformWallet;
        platformWallet = _wallet;
        emit PlatformWalletChanged(oldWallet, platformWallet);
    }

    function setTokenReceiver(uint8 index, address _receiver) external onlyOwner {
        require(index < 3, "Invalid index");
        require(_receiver != address(0), "Invalid address");
        address oldReceiver = tokenReceivers[index];
        tokenReceivers[index] = _receiver;
        emit TokenReceiverChanged(index, oldReceiver, _receiver);
    }

    function setAllTokenReceivers(address[3] memory _receivers) external onlyOwner {
        require(_receivers[0] != address(0), "Invalid receiver 0");
        require(_receivers[1] != address(0), "Invalid receiver 1");
        require(_receivers[2] != address(0), "Invalid receiver 2");
        for (uint8 i = 0; i < 3; i++) {
            address oldReceiver = tokenReceivers[i];
            tokenReceivers[i] = _receivers[i];
            emit TokenReceiverChanged(i, oldReceiver, _receivers[i]);
        }
    }

    function getAllTokenReceivers() external view returns (address[3] memory) {
        return tokenReceivers;
    }

    function updateDynamicTier(uint8 index, uint16 minPlayers, uint16 maxPlayers, uint8 winnerRate) external onlyOwner {
        require(index < 5, "Invalid index");
        require(winnerRate <= 60, "Rate too high");
        dynamicTiers[index] = DynamicTier(minPlayers, maxPlayers, winnerRate);
    }

    function setSettlementBonus(uint256 _bonus) external onlyOwner {
        require(_bonus <= 0.01 ether, "Bonus too high");
        settlementBonus = _bonus;
    }

    function fundSettlementBonusPool() external payable onlyOwner {
        require(msg.value > 0, "No value");
        settlementBonusPool += msg.value;
        emit SettlementBonusPoolFunded(msg.value);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function setRoundDuration(uint256 _duration) external onlyOwner {
        require(_duration >= 5 minutes, "Min 5 minutes");
        require(_duration <= 24 hours, "Max 24 hours");
        uint256 oldDuration = roundDuration;
        roundDuration = _duration;
        emit RoundDurationChanged(oldDuration, _duration);
    }

    function description() public view override returns (string memory) {
        uint256 pool = currentRound.prizePool;
        uint256 bnbWhole = pool / 1e18;
        uint256 bnbDecimals = (pool % 1e18) / 1e14;
        return string(
            abi.encodePacked(
                "CyberChainGame - Hot Potato Game Vault. ",
                "Tax revenue automatically flows into the prize pool. ",
                "Current prize pool: ",
                _toString(bnbWhole), ".", _padZeros(_toString(bnbDecimals), 4),
                " BNB. Total rounds: ", _toString(totalRounds),
                ". Total paid out: ", _toString(totalPaidOut / 1e18), " BNB."
            )
        );
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits -= 1; buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); value /= 10; }
        return string(buffer);
    }

    function _padZeros(string memory str, uint256 targetLength) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length >= targetLength) return str;
        bytes memory padded = new bytes(targetLength);
        uint256 padding = targetLength - strBytes.length;
        for (uint256 i = 0; i < padding; i++) { padded[i] = "0"; }
        for (uint256 i = 0; i < strBytes.length; i++) { padded[padding + i] = strBytes[i]; }
        return string(padded);
    }
}
```

---

## 部署参数

### 构造函数参数（2个）

| 参数 | 类型 | 说明 |
|------|------|------|
| `_platformWallet` | `address` | 平台手续费接收钱包地址 |
| `_tokenReceivers` | `address[3]` | 3个代币接收钱包地址（JSON数组格式） |

### Remix 部署填写格式

```text
_platformWallet: 0x你的平台费钱包地址
_tokenReceivers: ["0x接收钱包A", "0x接收钱包B", "0x接收钱包C"]
```

### 部署后操作

1. 调用 `setToken(0xa3df13160b4b1ff1d70abd45bc2ea2b3c50f7777)` 绑定 CYBER 代币
2. 向合约地址直接转 BNB 作为初始奖池（建议 0.5-1 BNB）
3. 调用 `fundSettlementBonusPool()` 并附带 BNB 注入结算补贴池（建议 0.1 BNB）
4. 部署完成后，把新合约地址告诉我，我会更新前端配置

### 编译设置

| 设置 | 值 |
|------|-----|
| Compiler | 0.8.20 |
| EVM Version | default 或 paris |
| Optimization | 勾选，Runs: 200 |

---

## 与旧版合约的区别（仅 2 处）

1. `placeBid` 第 222 行新增：`require(currentRound.currentBid == 0 || tokenAmount > currentRound.currentBid, "Bid must be higher than current bid");`
2. `getMinBid` 从固定返回 `MIN_FIRST_BID` 改为动态返回 `max(MIN_FIRST_BID, currentBid + 1)`

---

## 前端同步改动

批准后我会同步更新：
- `contracts/CyberChainGame.sol` - 合约源码
- `contracts/DEPLOYMENT.md` - 部署文档
- `src/config/contracts.ts` - ABI（getMinBid 签名更新）
- `src/components/chain-game/ChainGame.tsx` - 演示模式 minBid 动态计算 + 规则文案

