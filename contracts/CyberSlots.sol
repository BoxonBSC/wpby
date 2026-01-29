// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CyberSlots is VRFConsumerBaseV2Plus, Ownable, ReentrancyGuard, Pausable {
    
    uint256 public betLevel1 = 10000 * 10**18;
    uint256 public betLevel2 = 25000 * 10**18;
    uint256 public betLevel3 = 50000 * 10**18;
    uint256 public betLevel4 = 100000 * 10**18;
    uint256 public betLevel5 = 250000 * 10**18;
    
    uint256 public constant SUPER_JACKPOT_PERCENT = 5000;
    uint256 public constant JACKPOT_PERCENT = 2500;
    uint256 public constant FIRST_PRIZE_PERCENT = 1300;
    uint256 public constant SECOND_PRIZE_PERCENT = 500;
    uint256 public constant THIRD_PRIZE_PERCENT = 170;
    uint256 public constant SMALL_PRIZE_PERCENT = 50;
    uint256 public constant CONSOLATION_PRIZE_PERCENT = 10;
    
    uint256 public constant MAX_SINGLE_PAYOUT_PERCENT = 5000;
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
    uint256 public minPrizePool = 0.001 ether;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant REQUEST_TIMEOUT = 1 hours;
    
    uint256 public totalSpins;
    uint256 public totalPaidOut;
    uint256 public totalOperationFees;
    uint256 public totalCreditsDeposited;
    
    mapping(address => uint256) public gameCredits;
    
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
    mapping(address => uint256) public pendingRequest;
    mapping(address => uint256) public unclaimedPrizes;
    
    event SpinRequested(address indexed player, uint256 indexed requestId, uint256 betAmount);
    event SpinResult(address indexed player, uint256 indexed requestId, uint8[5] symbols, uint256 winAmount, string prizeType);
    event PrizeClaimed(address indexed player, uint256 amount);
    event PrizeTransferFailed(address indexed player, uint256 amount);
    event OperationFeeSent(uint256 amount);
    event PrizePoolFunded(address indexed funder, uint256 amount);
    event ConfigUpdated(string configName);
    event TokensBurned(address indexed player, uint256 amount);
    event SpinCancelled(address indexed player, uint256 indexed requestId, uint256 refundAmount);
    event CreditsDeposited(address indexed player, uint256 amount);
    event CreditsUsed(address indexed player, uint256 amount);
    
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
    
    function spin(uint256 betAmount) external nonReentrant whenNotPaused returns (uint256 requestId) {
        require(isValidBetAmount(betAmount), "Invalid bet amount");
        require(pendingRequest[msg.sender] == 0, "Pending request exists");
        require(gameCredits[msg.sender] >= betAmount, "Insufficient game credits");
        
        uint256 availablePool = getAvailablePool();
        require(availablePool >= minPrizePool, "Prize pool too low");
        
        gameCredits[msg.sender] -= betAmount;
        emit CreditsUsed(msg.sender, betAmount);
        
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
        
        spinRequests[requestId] = SpinRequest({
            player: msg.sender,
            betAmount: betAmount,
            timestamp: block.timestamp,
            fulfilled: false
        });
        
        pendingRequest[msg.sender] = requestId;
        
        totalSpins++;
        playerStats[msg.sender].totalSpins++;
        playerStats[msg.sender].totalBet += betAmount;
        
        emit SpinRequested(msg.sender, requestId, betAmount);
        return requestId;
    }
    
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        SpinRequest storage request = spinRequests[requestId];
        require(request.player != address(0), "Invalid request");
        require(!request.fulfilled, "Already fulfilled");
        
        request.fulfilled = true;
        pendingRequest[request.player] = 0;
        
        uint256 randomness = randomWords[0];
        uint8[5] memory symbols = generateSymbols(randomness, request.betAmount);
        
        (uint256 grossPrize, string memory prizeType) = calculateWin(symbols);
        
        uint256 playerPrize = 0;
        uint256 operationFee = 0;
        
        if (grossPrize > 0) {
            playerPrize = (grossPrize * PLAYER_PRIZE_PERCENT) / 10000;
            operationFee = grossPrize - playerPrize;
            
            playerStats[request.player].totalWins++;
            playerStats[request.player].totalWinnings += playerPrize;
            totalPaidOut += playerPrize;
            
            if (operationFee > 0 && operationWallet != address(0)) {
                (bool feeSuccess, ) = operationWallet.call{value: operationFee}("");
                if (feeSuccess) {
                    totalOperationFees += operationFee;
                    emit OperationFeeSent(operationFee);
                } else {
                    playerPrize += operationFee;
                    operationFee = 0;
                }
            }
            
            (bool prizeSuccess, ) = request.player.call{value: playerPrize}("");
            if (!prizeSuccess) {
                unclaimedPrizes[request.player] += playerPrize;
                emit PrizeTransferFailed(request.player, playerPrize);
            }
        }
        
        emit SpinResult(request.player, requestId, symbols, playerPrize, prizeType);
    }
    
    function claimPrize() external nonReentrant {
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
        
        SpinRequest storage req = spinRequests[reqId];
        require(!req.fulfilled, "Already fulfilled");
        require(block.timestamp > req.timestamp + REQUEST_TIMEOUT, "Not timed out yet");
        
        pendingRequest[msg.sender] = 0;
        req.fulfilled = true;
        
        emit SpinCancelled(msg.sender, reqId, 0);
    }
    
    function generateSymbols(uint256 randomness, uint256 betAmount) internal pure returns (uint8[5] memory symbols) {
        uint256 probabilityBoost = getBetMultiplier(betAmount);
        
        for (uint256 i = 0; i < 5; i++) {
            uint256 rand = uint256(keccak256(abi.encode(randomness, i))) % 10000;
            
            uint256 t7 = 400 * probabilityBoost / 100;
            uint256 tDiamond = t7 + (500 * probabilityBoost / 100);
            uint256 tCrown = tDiamond + (600 * probabilityBoost / 100);
            uint256 tBell = tCrown + (700 * probabilityBoost / 100);
            uint256 tStar = tBell + (800 * probabilityBoost / 100);
            
            if (tStar > 7000) tStar = 7000;
            
            uint256 commonProb = (10000 - tStar) / 5;
            
            if (rand < t7) {
                symbols[i] = 0;
            } else if (rand < tDiamond) {
                symbols[i] = 1;
            } else if (rand < tCrown) {
                symbols[i] = 2;
            } else if (rand < tBell) {
                symbols[i] = 3;
            } else if (rand < tStar) {
                symbols[i] = 4;
            } else if (rand < tStar + commonProb) {
                symbols[i] = 5;
            } else if (rand < tStar + commonProb * 2) {
                symbols[i] = 6;
            } else if (rand < tStar + commonProb * 3) {
                symbols[i] = 7;
            } else if (rand < tStar + commonProb * 4) {
                symbols[i] = 8;
            } else {
                symbols[i] = 9;
            }
        }
        
        return symbols;
    }
    
    function calculateWin(uint8[5] memory symbols) internal view returns (uint256 grossPrize, string memory prizeType) {
        uint256 availablePool = getAvailablePool();
        uint256 maxPayout = (availablePool * MAX_SINGLE_PAYOUT_PERCENT) / 10000;
        
        uint8[10] memory counts;
        for (uint256 i = 0; i < 5; i++) {
            counts[symbols[i]]++;
        }
        
        uint256 prize = 0;
        
        if (counts[0] == 5) {
            prize = (availablePool * SUPER_JACKPOT_PERCENT) / 10000;
            prizeType = "super_jackpot";
        }
        else if (counts[1] == 5 || counts[0] == 4) {
            prize = (availablePool * JACKPOT_PERCENT) / 10000;
            prizeType = "jackpot";
        }
        else if (_hasCount(counts, 5)) {
            prize = (availablePool * FIRST_PRIZE_PERCENT) / 10000;
            prizeType = "first";
        }
        else if (_hasRareCount(counts, 4)) {
            prize = (availablePool * SECOND_PRIZE_PERCENT) / 10000;
            prizeType = "second";
        }
        else if (_hasCommonCount(counts, 4)) {
            prize = (availablePool * THIRD_PRIZE_PERCENT) / 10000;
            prizeType = "third";
        }
        else if (_hasCount(counts, 3)) {
            prize = (availablePool * SMALL_PRIZE_PERCENT) / 10000;
            prizeType = "small";
        }
        else if (_hasCount(counts, 2)) {
            prize = (availablePool * CONSOLATION_PRIZE_PERCENT) / 10000;
            prizeType = "consolation";
        }
        else {
            return (0, "none");
        }
        
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
    
    function isValidBetAmount(uint256 amount) public view returns (bool) {
        return amount == betLevel1 ||
               amount == betLevel2 ||
               amount == betLevel3 ||
               amount == betLevel4 ||
               amount == betLevel5;
    }
    
    function getBetMultiplier(uint256 betAmount) public view returns (uint256) {
        if (betAmount >= betLevel5) return 2000;
        if (betAmount >= betLevel4) return 1000;
        if (betAmount >= betLevel3) return 500;
        if (betAmount >= betLevel2) return 250;
        return 100;
    }
    
    function setBetLevels(
        uint256 _level1,
        uint256 _level2,
        uint256 _level3,
        uint256 _level4,
        uint256 _level5
    ) external onlyOwner {
        require(_level1 <= betLevel1, "Can only lower level 1");
        require(_level2 <= betLevel2, "Can only lower level 2");
        require(_level3 <= betLevel3, "Can only lower level 3");
        require(_level4 <= betLevel4, "Can only lower level 4");
        require(_level5 <= betLevel5, "Can only lower level 5");
        require(_level1 < _level2 && _level2 < _level3 && _level3 < _level4 && _level4 < _level5, "Levels must be ascending");
        require(_level1 >= 1000 * 10**18, "Min level 1 is 1000 tokens");
        
        betLevel1 = _level1;
        betLevel2 = _level2;
        betLevel3 = _level3;
        betLevel4 = _level4;
        betLevel5 = _level5;
        
        emit ConfigUpdated("betLevels");
    }
    
    function getBetLevels() external view returns (uint256[5] memory) {
        return [betLevel1, betLevel2, betLevel3, betLevel4, betLevel5];
    }
    
    function getAvailablePool() public view returns (uint256) {
        return address(this).balance;
    }
    
    function getPrizePool() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
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
}
