// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CyberHiLoAdmin
 * @notice 代理管理合约 - 双管理员模式，任一管理员可执行操作
 * @dev 将主合约的 owner 转移给此合约后，只能通过此合约调用白名单内的管理函数
 *      emergencyRescuePrize 函数没有在此合约中暴露，因此永久无法调用
 * 
 * 部署流程：
 * 1. 部署此合约，传入 CyberHiLo 主合约地址和两个管理员地址
 * 2. 在主合约上调用 transferOwnership(此合约地址)
 * 3. 之后只能通过此合约管理主合约（两个管理员任一可操作）
 * 
 * ⚠️ 警告：一旦转移，emergencyRescuePrize 将永久无法调用！
 */
contract CyberHiLoAdmin {
    
    /// @notice CyberHiLo 主合约地址
    address public immutable hiloContract;
    
    /// @notice 管理员地址1
    address public admin1;
    
    /// @notice 管理员地址2
    address public admin2;
    
    /// @notice 主合约接口（仅包含允许调用的函数）
    interface ICyberHiLo {
        function setBetLevels(uint256[5] calldata newLevels) external;
        function setMaxStreaks(uint8[5] calldata newMaxStreaks) external;
        function setRewardPercentages(uint16[20] calldata newPercentages) external;
        function setOperationWallet(address newWallet) external;
        function setOperationFeeRate(uint16 newRate) external;
        function setVRFConfig(uint16 requestConfirmations, uint32 callbackGasLimit) external;
        function pause() external;
        function unpause() external;
        function acceptOwnership() external;
        // 注意：emergencyRescuePrize 故意不包含在此接口中
    }
    
    event OwnershipAccepted(address indexed operator);
    
    event BetLevelsUpdated(uint256[5] newLevels, address indexed operator);
    event MaxStreaksUpdated(uint8[5] newMaxStreaks, address indexed operator);
    event RewardPercentagesUpdated(uint16[20] newPercentages, address indexed operator);
    event OperationWalletUpdated(address newWallet, address indexed operator);
    event OperationFeeRateUpdated(uint16 newRate, address indexed operator);
    event VRFConfigUpdated(uint16 requestConfirmations, uint32 callbackGasLimit, address indexed operator);
    event ContractPaused(address indexed operator);
    event ContractUnpaused(address indexed operator);
    event AdminUpdated(uint8 indexed adminIndex, address oldAdmin, address newAdmin, address indexed operator);
    
    modifier onlyAdmin() {
        require(msg.sender == admin1 || msg.sender == admin2, "Not authorized: caller is not admin");
        _;
    }
    
    constructor(address _hiloContract, address _admin1, address _admin2) {
        require(_hiloContract != address(0), "Invalid contract address");
        require(_admin1 != address(0), "Invalid admin1 address");
        require(_admin2 != address(0), "Invalid admin2 address");
        require(_admin1 != _admin2, "Admin addresses must be different");
        
        hiloContract = _hiloContract;
        admin1 = _admin1;
        admin2 = _admin2;
    }
    
    /**
     * @notice 更换管理员1（仅限当前管理员调用）
     * @param newAdmin 新管理员地址
     */
    function setAdmin1(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        require(newAdmin != admin2, "Cannot be same as admin2");
        address oldAdmin = admin1;
        admin1 = newAdmin;
        emit AdminUpdated(1, oldAdmin, newAdmin, msg.sender);
    }
    
    /**
     * @notice 更换管理员2（仅限当前管理员调用）
     * @param newAdmin 新管理员地址
     */
    function setAdmin2(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        require(newAdmin != admin1, "Cannot be same as admin1");
        address oldAdmin = admin2;
        admin2 = newAdmin;
        emit AdminUpdated(2, oldAdmin, newAdmin, msg.sender);
    }
    
    /**
     * @notice 设置投注等级
     * @param newLevels 新的投注等级数组（必须严格递增）
     */
    function setBetLevels(uint256[5] calldata newLevels) external onlyAdmin {
        ICyberHiLo(hiloContract).setBetLevels(newLevels);
        emit BetLevelsUpdated(newLevels, msg.sender);
    }
    
    /**
     * @notice 设置各等级最大连胜数
     * @param newMaxStreaks 新的最大连胜数数组（必须严格递增）
     */
    function setMaxStreaks(uint8[5] calldata newMaxStreaks) external onlyAdmin {
        ICyberHiLo(hiloContract).setMaxStreaks(newMaxStreaks);
        emit MaxStreaksUpdated(newMaxStreaks, msg.sender);
    }
    
    /**
     * @notice 设置奖励百分比
     * @param newPercentages 新的奖励百分比数组（20个槽位，万分比，必须严格递增）
     */
    function setRewardPercentages(uint16[20] calldata newPercentages) external onlyAdmin {
        ICyberHiLo(hiloContract).setRewardPercentages(newPercentages);
        emit RewardPercentagesUpdated(newPercentages, msg.sender);
    }
    
    /**
     * @notice 设置运营钱包地址
     * @param newWallet 新的运营钱包地址
     */
    function setOperationWallet(address newWallet) external onlyAdmin {
        require(newWallet != address(0), "Invalid wallet address");
        ICyberHiLo(hiloContract).setOperationWallet(newWallet);
        emit OperationWalletUpdated(newWallet, msg.sender);
    }
    
    /**
     * @notice 设置运营费率
     * @param newRate 新的费率（万分比）
     */
    function setOperationFeeRate(uint16 newRate) external onlyAdmin {
        ICyberHiLo(hiloContract).setOperationFeeRate(newRate);
        emit OperationFeeRateUpdated(newRate, msg.sender);
    }
    
    /**
     * @notice 设置 VRF 配置
     * @param requestConfirmations 确认区块数
     * @param callbackGasLimit 回调 Gas 限制
     */
    function setVRFConfig(uint16 requestConfirmations, uint32 callbackGasLimit) external onlyAdmin {
        ICyberHiLo(hiloContract).setVRFConfig(requestConfirmations, callbackGasLimit);
        emit VRFConfigUpdated(requestConfirmations, callbackGasLimit, msg.sender);
    }
    
    /**
     * @notice 暂停主合约
     */
    function pause() external onlyAdmin {
        ICyberHiLo(hiloContract).pause();
        emit ContractPaused(msg.sender);
    }
    
    /**
     * @notice 恢复主合约
     */
    function unpause() external onlyAdmin {
        ICyberHiLo(hiloContract).unpause();
        emit ContractUnpaused(msg.sender);
    }
    
    /**
     * @notice 接受主合约所有权（完成两步式转移的第二步）
     * @dev 在主合约调用 transferOwnership(本合约地址) 后调用此函数
     */
    function acceptOwnership() external onlyAdmin {
        ICyberHiLo(hiloContract).acceptOwnership();
        emit OwnershipAccepted(msg.sender);
    }
    
    /**
     * @notice 查看主合约地址
     */
    function getHiLoContract() external view returns (address) {
        return hiloContract;
    }
    
    /**
     * @notice 检查地址是否为管理员
     */
    function isAdmin(address account) external view returns (bool) {
        return account == admin1 || account == admin2;
    }
}
