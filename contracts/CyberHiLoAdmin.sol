// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CyberHiLoAdmin
 * @notice 代理管理合约 - 用于限制 CyberHiLo 主合约的 owner 权限
 * @dev 将主合约的 owner 转移给此合约后，只能通过此合约调用白名单内的管理函数
 *      emergencyRescuePrize 函数没有在此合约中暴露，因此永久无法调用
 * 
 * 部署流程：
 * 1. 部署此合约，传入 CyberHiLo 主合约地址
 * 2. 在主合约上调用 transferOwnership(此合约地址)
 * 3. 之后只能通过此合约管理主合约
 * 
 * ⚠️ 警告：一旦转移，emergencyRescuePrize 将永久无法调用！
 */
contract CyberHiLoAdmin is Ownable {
    
    /// @notice CyberHiLo 主合约地址
    address public immutable hiloContract;
    
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
        // 注意：emergencyRescuePrize 故意不包含在此接口中
    }
    
    event BetLevelsUpdated(uint256[5] newLevels);
    event MaxStreaksUpdated(uint8[5] newMaxStreaks);
    event RewardPercentagesUpdated(uint16[20] newPercentages);
    event OperationWalletUpdated(address newWallet);
    event OperationFeeRateUpdated(uint16 newRate);
    event VRFConfigUpdated(uint16 requestConfirmations, uint32 callbackGasLimit);
    event ContractPaused();
    event ContractUnpaused();
    
    constructor(address _hiloContract) Ownable(msg.sender) {
        require(_hiloContract != address(0), "Invalid contract address");
        hiloContract = _hiloContract;
    }
    
    /**
     * @notice 设置投注等级
     * @param newLevels 新的投注等级数组（必须严格递增）
     */
    function setBetLevels(uint256[5] calldata newLevels) external onlyOwner {
        ICyberHiLo(hiloContract).setBetLevels(newLevels);
        emit BetLevelsUpdated(newLevels);
    }
    
    /**
     * @notice 设置各等级最大连胜数
     * @param newMaxStreaks 新的最大连胜数数组（必须严格递增）
     */
    function setMaxStreaks(uint8[5] calldata newMaxStreaks) external onlyOwner {
        ICyberHiLo(hiloContract).setMaxStreaks(newMaxStreaks);
        emit MaxStreaksUpdated(newMaxStreaks);
    }
    
    /**
     * @notice 设置奖励百分比
     * @param newPercentages 新的奖励百分比数组（20个槽位，万分比，必须严格递增）
     */
    function setRewardPercentages(uint16[20] calldata newPercentages) external onlyOwner {
        ICyberHiLo(hiloContract).setRewardPercentages(newPercentages);
        emit RewardPercentagesUpdated(newPercentages);
    }
    
    /**
     * @notice 设置运营钱包地址
     * @param newWallet 新的运营钱包地址
     */
    function setOperationWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        ICyberHiLo(hiloContract).setOperationWallet(newWallet);
        emit OperationWalletUpdated(newWallet);
    }
    
    /**
     * @notice 设置运营费率
     * @param newRate 新的费率（万分比）
     */
    function setOperationFeeRate(uint16 newRate) external onlyOwner {
        ICyberHiLo(hiloContract).setOperationFeeRate(newRate);
        emit OperationFeeRateUpdated(newRate);
    }
    
    /**
     * @notice 设置 VRF 配置
     * @param requestConfirmations 确认区块数
     * @param callbackGasLimit 回调 Gas 限制
     */
    function setVRFConfig(uint16 requestConfirmations, uint32 callbackGasLimit) external onlyOwner {
        ICyberHiLo(hiloContract).setVRFConfig(requestConfirmations, callbackGasLimit);
        emit VRFConfigUpdated(requestConfirmations, callbackGasLimit);
    }
    
    /**
     * @notice 暂停主合约
     */
    function pause() external onlyOwner {
        ICyberHiLo(hiloContract).pause();
        emit ContractPaused();
    }
    
    /**
     * @notice 恢复主合约
     */
    function unpause() external onlyOwner {
        ICyberHiLo(hiloContract).unpause();
        emit ContractUnpaused();
    }
    
    /**
     * @notice 查看主合约地址
     */
    function getHiLoContract() external view returns (address) {
        return hiloContract;
    }
}
