// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CyberHiLo is VRFConsumerBaseV2Plus, ReentrancyGuard, Pausable {
    
    uint256 public betLevel1 = 50000 * 10**18;
    uint256 public betLevel2 = 100000 * 10**18;
    uint256 public betLevel3 = 200000 * 10**18;
    uint256 public betLevel4 = 500000 * 10**18;
    uint256 public betLevel5 = 1000000 * 10**18;
    
    uint8 public maxStreak1 = 5;
    uint8 public maxStreak2 = 8;
    uint8 public maxStreak3 = 12;
    uint8 public maxStreak4 = 16;
    uint8 public maxStreak5 = 20;
    
    uint16[20] public rewardPercentages = [
        2, 5, 10, 15, 25,
        40, 60, 100, 150, 250,
        400, 600, 900, 1300, 1800,
        2500, 3500, 5000, 7000, 10000
    ];
    
    uint256 public constant OPERATION_FEE_PERCENT = 500;
    uint256 public constant PLAYER_PRIZE_PERCENT = 9500;
    
    bytes32 public keyHash;
    uint256 public subscriptionId;
    uint32 public callbackGasLimit = 500000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    bool public useNativePayment = true;
    
    IERC20 public token;
    address public operationWallet;
    uint256 public minPrizePool = 0.01 ether;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant REQUEST_TIMEOUT = 30 minutes;
    uint256 public constant GAME_TIMEOUT = 10 minutes;
    
    uint256 public totalLockedRewards;
    mapping(address => uint256) public playerLockedReward;
    
    uint256 public totalGames;
    uint256 public totalPaidOut;
    uint256 public totalOperationFees;
    uint256 public totalCreditsDeposited;
    
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
        uint8 betTierIndex;
        uint8 currentCard;
        uint8 currentStreak;
        uint256 prizePoolSnapshot;
        uint256 timestamp;
        bool active;
    }
    
    struct VRFRequest {
        address player;
        uint8 guessType;
        uint256 timestamp;
        bool fulfilled;
    }
    
    mapping(address => PlayerStats) public playerStats;
    mapping(address => GameSession) public gameSessions;
    mapping(uint256 => VRFRequest) public vrfRequests;
    mapping(address => uint256) public pendingRequest;
    mapping(address => uint256) public unclaimedPrizes;
    
    event GameStarted(address indexed player, uint256 betAmount, uint8 betTierIndex, uint8 firstCard, uint256 prizePoolSnapshot);
    event GuessRequested(address indexed player, uint256 indexed requestId, uint8 guessType);
    event GuessResult(address indexed player, uint256 indexed requestId, uint8 oldCard, uint8 newCard, bool won, uint8 streak, uint256 potentialReward);
    event GameCashedOut(address indexed player, uint256 grossPrize, uint256 playerPrize, uint8 finalStreak);
    event GameLost(address indexed player, uint8 lostAtStreak);
    event PrizeClaimed(address indexed player, uint256 amount);
    event PrizeTransferFailed(address indexed player, uint256 amount);
    event OperationFeeSent(uint256 amount);
    event OperationFeeTransferFailed(uint256 amount);
    event PrizePoolFunded(address indexed funder, uint256 amount);
    event ConfigUpdated(string configName);
    event TokensBurned(address indexed player, uint256 amount);
    event CreditsDeposited(address indexed player, uint256 amount);
    event CreditsUsed(address indexed player, uint256 amount);
    event EmergencyPrizeRescued(address indexed player, address indexed recipient, uint256 amount);
    event GameTimedOut(address indexed player, address indexed caller, uint8 streak, uint256 releasedLock);
    event PoolInsufficientForceSettled(address indexed player, uint8 streak, uint256 available, uint256 needed);
    
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        address _token,
        address _operationWallet
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        token = IERC20(_token);
        operationWallet = _operationWallet;
    }
    
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
    
    function getBetTierIndex(uint256 betAmount) public view returns (uint8) {
        if (betAmount >= betLevel5) return 4;
        if (betAmount >= betLevel4) return 3;
        if (betAmount >= betLevel3) return 2;
        if (betAmount >= betLevel2) return 1;
        if (betAmount >= betLevel1) return 0;
        revert("Invalid bet amount");
    }
    
    function getMaxStreakForTier(uint8 tierIndex) public view returns (uint8) {
        if (tierIndex == 0) return maxStreak1;
        if (tierIndex == 1) return maxStreak2;
        if (tierIndex == 2) return maxStreak3;
        if (tierIndex == 3) return maxStreak4;
        return maxStreak5;
    }
    
    function startGame(uint256 betAmount) external nonReentrant whenNotPaused returns (uint8 firstCard) {
        require(msg.sender == tx.origin, "Only EOA allowed");
        require(isValidBetAmount(betAmount), "Invalid bet amount");
        require(!gameSessions[msg.sender].active, "Game already active");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
        require(gameCredits[msg.sender] >= betAmount, "Insufficient game credits");
        
        uint8 tierIndex = getBetTierIndex(betAmount);
        uint256 currentPool = getAvailablePool();
        require(currentPool >= minPrizePool, "Prize pool too low");
        
        uint256 initialLock = calculateReward(1, currentPool);
        require(currentPool >= initialLock, "Pool too low");
        
        playerLockedReward[msg.sender] = initialLock;
        totalLockedRewards += initialLock;
        
        gameCredits[msg.sender] -= betAmount;
        emit CreditsUsed(msg.sender, betAmount);
        
        firstCard = _generateFirstCard();
        
        gameSessions[msg.sender] = GameSession({
            player: msg.sender,
            betAmount: betAmount,
            betTierIndex: tierIndex,
            currentCard: firstCard,
            currentStreak: 0,
            prizePoolSnapshot: currentPool,
            timestamp: block.timestamp,
            active: true
        });
        
        totalGames++;
        playerStats[msg.sender].totalGames++;
        playerStats[msg.sender].totalBet += betAmount;
        
        emit GameStarted(msg.sender, betAmount, tierIndex, firstCard, currentPool);
        return firstCard;
    }
    
    function _generateFirstCard() private view returns (uint8) {
        return uint8((uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            totalGames,
            blockhash(block.number - 1),
            gasleft()
        ))) % 13) + 1);
    }
    
    function guess(uint8 guessType) external nonReentrant whenNotPaused returns (uint256 requestId) {
        require(msg.sender == tx.origin, "Only EOA allowed");
        require(guessType <= 2, "Invalid guess type");
        
        GameSession storage session = gameSessions[msg.sender];
        require(session.active, "No active game");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
        
        uint8 maxStreak = getMaxStreakForTier(session.betTierIndex);
        require(session.currentStreak < maxStreak, "Max streak reached, cash out");
        
        _checkPoolForNextLevel(session, guessType, maxStreak);
        
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
            guessType: guessType,
            timestamp: block.timestamp,
            fulfilled: false
        });
        
        pendingRequest[msg.sender] = requestId;
        
        emit GuessRequested(msg.sender, requestId, guessType);
        return requestId;
    }
    
    function _checkPoolForNextLevel(GameSession storage session, uint8 guessType, uint8 maxStreak) private view {
        uint8 potentialNewStreak = session.currentStreak + (guessType == 2 ? 2 : 1);
        if (potentialNewStreak > maxStreak) {
            potentialNewStreak = maxStreak;
        }
        uint256 potentialNewLock = calculateReward(potentialNewStreak, session.prizePoolSnapshot);
        uint256 currentLock = playerLockedReward[msg.sender];
        
        if (potentialNewLock > currentLock) {
            uint256 additionalLockNeeded = potentialNewLock - currentLock;
            require(getAvailablePool() >= additionalLockNeeded, "Pool insufficient for next level, please cash out");
        }
    }
    
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        VRFRequest storage request = vrfRequests[requestId];
        require(request.player != address(0), "Invalid request");
        require(!request.fulfilled, "Already fulfilled");
        
        request.fulfilled = true;
        pendingRequest[request.player] = 0;
        
        GameSession storage session = gameSessions[request.player];
        require(session.active, "No active game");
        
        uint8 newCard = uint8((randomWords[0] % 13) + 1);
        uint8 oldCard = session.currentCard;
        bool won = _checkWin(request.guessType, oldCard, newCard);
        
        if (won) {
            _handleWin(request.player, requestId, session, request.guessType, oldCard, newCard);
        } else {
            _handleLoss(request.player, requestId, session, oldCard, newCard);
        }
    }
    
    function _checkWin(uint8 guessType, uint8 oldCard, uint8 newCard) private pure returns (bool) {
        if (guessType == 2) return newCard == oldCard;
        if (guessType == 1) return newCard > oldCard;
        return newCard < oldCard;
    }
    
    function _handleWin(
        address player,
        uint256 requestId,
        GameSession storage session,
        uint8 guessType,
        uint8 oldCard,
        uint8 newCard
    ) private {
        uint8 streakIncrease = (guessType == 2) ? 2 : 1;
        uint8 maxStreak = getMaxStreakForTier(session.betTierIndex);
        uint8 newStreak = session.currentStreak + streakIncrease;
        if (newStreak > maxStreak) newStreak = maxStreak;
        
        session.currentStreak = newStreak;
        session.currentCard = newCard;
        
        bool poolSufficient = _updateLockAmount(player, newStreak, session.prizePoolSnapshot);
        
        if (!poolSufficient) {
            _updateMaxStreak(player, newStreak);
            emit GuessResult(player, requestId, oldCard, newCard, true, newStreak, 0);
            uint256 available = _getAvailableForLock();
            uint256 needed = calculateReward(newStreak, session.prizePoolSnapshot) - playerLockedReward[player];
            emit PoolInsufficientForceSettled(player, newStreak, available, needed);
            _cashOut(player);
            return;
        }
        
        _updateMaxStreak(player, newStreak);
        uint256 potentialReward = calculateReward(newStreak, session.prizePoolSnapshot);
        emit GuessResult(player, requestId, oldCard, newCard, true, newStreak, potentialReward);
        
        if (newStreak >= maxStreak) {
            _cashOut(player);
        }
    }
    
    function _handleLoss(
        address player,
        uint256 requestId,
        GameSession storage session,
        uint8 oldCard,
        uint8 newCard
    ) private {
        uint8 lostStreak = session.currentStreak;
        session.active = false;
        
        _releaseLock(player);
        
        emit GuessResult(player, requestId, oldCard, newCard, false, 0, 0);
        emit GameLost(player, lostStreak);
    }
    
    function _updateLockAmount(address player, uint8 newStreak, uint256 poolSnapshot) private returns (bool) {
        uint256 newLockAmount = calculateReward(newStreak, poolSnapshot);
        uint256 oldLockAmount = playerLockedReward[player];
        
        if (newLockAmount > oldLockAmount) {
            uint256 additionalLock = newLockAmount - oldLockAmount;
            uint256 availableForLock = _getAvailableForLock();
            
            if (availableForLock < additionalLock) {
                return false;
            }
            
            playerLockedReward[player] = newLockAmount;
            totalLockedRewards += additionalLock;
        }
        return true;
    }
    
    function _getAvailableForLock() private view returns (uint256) {
        if (address(this).balance > totalLockedRewards) {
            return address(this).balance - totalLockedRewards;
        }
        return 0;
    }
    
    function _updateMaxStreak(address player, uint8 streak) private {
        if (streak > playerStats[player].maxStreak) {
            playerStats[player].maxStreak = streak;
        }
    }
    
    function _releaseLock(address player) private {
        uint256 lockedAmount = playerLockedReward[player];
        if (lockedAmount > 0) {
            totalLockedRewards -= lockedAmount;
            playerLockedReward[player] = 0;
        }
    }
    
    function calculateReward(uint8 streak, uint256 poolSnapshot) public view returns (uint256) {
        if (streak == 0 || streak > 20) return 0;
        uint16 percentBps = rewardPercentages[streak - 1];
        return (poolSnapshot * percentBps) / 10000;
    }
    
    function cashOut() external nonReentrant {
        require(gameSessions[msg.sender].active, "No active game");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
        require(gameSessions[msg.sender].currentStreak > 0, "Must win at least once");
        _cashOut(msg.sender);
    }
    
    function _cashOut(address player) internal {
        GameSession storage session = gameSessions[player];
        
        _releaseLock(player);
        
        uint256 grossPrize = calculateReward(session.currentStreak, session.prizePoolSnapshot);
        uint8 finalStreak = session.currentStreak;
        session.active = false;
        
        if (grossPrize > 0) {
            _processPayout(player, grossPrize, finalStreak);
        } else {
            emit GameCashedOut(player, 0, 0, finalStreak);
        }
    }
    
    function _processPayout(address player, uint256 grossPrize, uint8 finalStreak) private {
        uint256 currentPool = _getAvailableForLock();
        if (grossPrize > currentPool) {
            grossPrize = currentPool;
        }
        
        uint256 playerPrize = (grossPrize * PLAYER_PRIZE_PERCENT) / 10000;
        uint256 operationFee = grossPrize - playerPrize;
        
        playerStats[player].totalWins++;
        playerStats[player].totalWinnings += playerPrize;
        totalPaidOut += playerPrize;
        
        playerPrize = _sendOperationFee(operationFee, playerPrize);
        _sendPlayerPrize(player, playerPrize);
        
        emit GameCashedOut(player, grossPrize, playerPrize, finalStreak);
    }
    
    function _sendOperationFee(uint256 operationFee, uint256 playerPrize) private returns (uint256) {
        if (operationFee > 0 && operationWallet != address(0)) {
            (bool feeSuccess, ) = operationWallet.call{value: operationFee}("");
            if (feeSuccess) {
                totalOperationFees += operationFee;
                emit OperationFeeSent(operationFee);
            } else {
                playerPrize += operationFee;
                emit OperationFeeTransferFailed(operationFee);
            }
        }
        return playerPrize;
    }
    
    function _sendPlayerPrize(address player, uint256 playerPrize) private {
        (bool prizeSuccess, ) = player.call{value: playerPrize}("");
        if (!prizeSuccess) {
            unclaimedPrizes[player] += playerPrize;
            emit PrizeTransferFailed(player, playerPrize);
        }
    }
    
    function claimPrize() external nonReentrant whenNotPaused {
        uint256 amount = unclaimedPrizes[msg.sender];
        require(amount > 0, "No unclaimed prizes");
        
        unclaimedPrizes[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit PrizeClaimed(msg.sender, amount);
    }
    
    function cancelStuckRequest() external nonReentrant {
        uint256 reqId = pendingRequest[msg.sender];
        require(reqId != 0, "No pending request");
        
        VRFRequest storage req = vrfRequests[reqId];
        require(!req.fulfilled, "Already fulfilled");
        require(block.timestamp > req.timestamp + REQUEST_TIMEOUT, "Not timed out yet");
        
        pendingRequest[msg.sender] = 0;
        req.fulfilled = true;
        
        _releaseLock(msg.sender);
        
        GameSession storage session = gameSessions[msg.sender];
        if (session.active) {
            session.active = false;
            emit GameLost(msg.sender, session.currentStreak);
        }
    }
    
    function forceEndTimedOutGame(address player) external nonReentrant {
        GameSession storage session = gameSessions[player];
        require(session.active, "No active game");
        require(block.timestamp > session.timestamp + GAME_TIMEOUT, "Game not timed out");
        
        uint256 reqId = pendingRequest[player];
        if (reqId != 0) {
            vrfRequests[reqId].fulfilled = true;
            pendingRequest[player] = 0;
        }
        
        uint256 lockedAmount = playerLockedReward[player];
        _releaseLock(player);
        
        uint8 streak = session.currentStreak;
        session.active = false;
        
        emit GameTimedOut(player, msg.sender, streak, lockedAmount);
    }
    
    function isValidBetAmount(uint256 amount) public view returns (bool) {
        return amount == betLevel1 ||
               amount == betLevel2 ||
               amount == betLevel3 ||
               amount == betLevel4 ||
               amount == betLevel5;
    }
    
    function getAvailablePool() public view returns (uint256) {
        uint256 balance = address(this).balance;
        if (balance <= totalLockedRewards) return 0;
        return balance - totalLockedRewards;
    }
    
    function getPrizePool() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getTotalLockedRewards() external view returns (uint256) {
        return totalLockedRewards;
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
    
    function getMaxStreaks() external view returns (uint8[5] memory) {
        return [maxStreak1, maxStreak2, maxStreak3, maxStreak4, maxStreak5];
    }
    
    function getRewardPercentages() external view returns (uint16[20] memory) {
        return rewardPercentages;
    }
    
    function setBetLevels(
        uint256 _level1,
        uint256 _level2,
        uint256 _level3,
        uint256 _level4,
        uint256 _level5
    ) external onlyOwner {
        require(_level1 < _level2 && _level2 < _level3 && _level3 < _level4 && _level4 < _level5, "Levels must be ascending");
        require(_level1 >= 1000 * 10**18, "Min level is 1000 tokens");
        
        betLevel1 = _level1;
        betLevel2 = _level2;
        betLevel3 = _level3;
        betLevel4 = _level4;
        betLevel5 = _level5;
        
        emit ConfigUpdated("betLevels");
    }
    
    function setMaxStreaks(
        uint8 _max1,
        uint8 _max2,
        uint8 _max3,
        uint8 _max4,
        uint8 _max5
    ) external onlyOwner {
        require(_max1 >= 1 && _max1 < _max2 && _max2 < _max3 && _max3 < _max4 && _max4 < _max5, "Must be ascending and >= 1");
        require(_max5 <= 20, "Max streak cannot exceed 20");
        
        maxStreak1 = _max1;
        maxStreak2 = _max2;
        maxStreak3 = _max3;
        maxStreak4 = _max4;
        maxStreak5 = _max5;
        
        emit ConfigUpdated("maxStreaks");
    }
    
    function setRewardPercentages(uint16[20] calldata _percentages) external onlyOwner {
        for (uint8 i = 1; i < 20; i++) {
            require(_percentages[i] > _percentages[i-1], "Must be ascending");
        }
        require(_percentages[0] > 0, "Min reward must be > 0");
        require(_percentages[19] <= 10000, "Max 100%");
        
        rewardPercentages = _percentages;
        emit ConfigUpdated("rewardPercentages");
    }
    
    function setOperationWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        operationWallet = _wallet;
        emit ConfigUpdated("operationWallet");
    }
    
    function setToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid address");
        token = IERC20(_token);
        emit ConfigUpdated("token");
    }
    
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
    
    function fundPrizePool() external payable {
        require(msg.value > 0, "Must send BNB");
        emit PrizePoolFunded(msg.sender, msg.value);
    }
    
    receive() external payable {
        emit PrizePoolFunded(msg.sender, msg.value);
    }
    
    function emergencyRescuePrize(address player, address recipient) external onlyOwner nonReentrant {
        uint256 amount = unclaimedPrizes[player];
        require(amount > 0, "No unclaimed prizes for this player");
        require(recipient != address(0), "Invalid recipient address");
        require(recipient != address(this), "Cannot rescue to contract itself");
        
        unclaimedPrizes[player] = 0;
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Rescue transfer failed");
        
        emit EmergencyPrizeRescued(player, recipient, amount);
    }
    
    function ownerCancelStuckRequest(address player) external onlyOwner nonReentrant {
        uint256 reqId = pendingRequest[player];
        require(reqId != 0, "No pending request for this player");
        
        VRFRequest storage req = vrfRequests[reqId];
        require(!req.fulfilled, "Request already fulfilled");
        require(block.timestamp > req.timestamp + REQUEST_TIMEOUT * 2, "Request not stuck long enough");
        
        pendingRequest[player] = 0;
        req.fulfilled = true;
        
        _releaseLock(player);
        
        GameSession storage session = gameSessions[player];
        if (session.active) {
            session.active = false;
            emit GameLost(player, session.currentStreak);
        }
    }
}
