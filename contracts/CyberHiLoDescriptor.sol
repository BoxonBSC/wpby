// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CyberHiLoDescriptor
 * @notice 为已部署的 CyberHiLo 合约提供 description() 接口
 * @dev 独立部署的只读辅助合约，兼容 Flap VaultBase 规范
 * 
 * 主合约地址: 0x5a17b1eAb23eEb1aa24bD774E9753B725F6B2F73
 */
contract CyberHiLoDescriptor {
    
    // CyberHiLo 主合约接口
    interface ICyberHiLo {
        function totalGames() external view returns (uint256);
        function totalPaidOut() external view returns (uint256);
        function totalCreditsDeposited() external view returns (uint256);
        function getAvailablePool() external view returns (uint256);
    }
    
    // 主合约地址（不可更改）
    address public immutable hiloContract;
    
    constructor(address _hiloContract) {
        require(_hiloContract != address(0), "Invalid contract address");
        hiloContract = _hiloContract;
    }
    
    /**
     * @notice 返回 CyberHiLo 合约的动态描述
     * @dev 实现 Flap VaultBase 的 description() 接口
     * @return 描述合约当前状态的字符串
     */
    function description() public view returns (string memory) {
        ICyberHiLo hilo = ICyberHiLo(hiloContract);
        
        uint256 prizePool = hiloContract.balance;
        uint256 availablePool = hilo.getAvailablePool();
        uint256 totalGames = hilo.totalGames();
        uint256 totalPaidOut = hilo.totalPaidOut();
        
        return string(abi.encodePacked(
            "CyberHiLo - Hi-Lo Card Game on BSC. ",
            "Prize Pool: ", _formatBNB(prizePool), " BNB. ",
            "Available: ", _formatBNB(availablePool), " BNB. ",
            "Total Games: ", _toString(totalGames), ". ",
            "Total Paid: ", _formatBNB(totalPaidOut), " BNB. ",
            "Powered by Chainlink VRF 2.5. ",
            "Main Contract: ", _toHexString(hiloContract)
        ));
    }
    
    /**
     * @notice 获取主合约地址
     */
    function getMainContract() external view returns (address) {
        return hiloContract;
    }
    
    /**
     * @notice 获取奖池信息
     */
    function getPoolInfo() external view returns (
        uint256 totalPool,
        uint256 availablePool,
        uint256 lockedPool
    ) {
        ICyberHiLo hilo = ICyberHiLo(hiloContract);
        totalPool = hiloContract.balance;
        availablePool = hilo.getAvailablePool();
        lockedPool = totalPool - availablePool;
    }
    
    /**
     * @notice 获取游戏统计
     */
    function getStats() external view returns (
        uint256 totalGames,
        uint256 totalPaidOut,
        uint256 totalCreditsDeposited
    ) {
        ICyberHiLo hilo = ICyberHiLo(hiloContract);
        totalGames = hilo.totalGames();
        totalPaidOut = hilo.totalPaidOut();
        totalCreditsDeposited = hilo.totalCreditsDeposited();
    }
    
    // ============ 内部辅助函数 ============
    
    /**
     * @notice 格式化 BNB 金额为字符串（4位小数）
     */
    function _formatBNB(uint256 weiAmount) internal pure returns (string memory) {
        uint256 whole = weiAmount / 1e18;
        uint256 decimals = (weiAmount % 1e18) / 1e14; // 4位小数
        
        return string(abi.encodePacked(
            _toString(whole),
            ".",
            _padZeros(_toString(decimals), 4)
        ));
    }
    
    /**
     * @notice 将 uint256 转换为字符串
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    /**
     * @notice 用前导零填充字符串
     */
    function _padZeros(string memory str, uint256 targetLength) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length >= targetLength) return str;
        
        bytes memory padded = new bytes(targetLength);
        uint256 paddingLength = targetLength - strBytes.length;
        
        for (uint256 i = 0; i < paddingLength; i++) {
            padded[i] = "0";
        }
        for (uint256 i = 0; i < strBytes.length; i++) {
            padded[paddingLength + i] = strBytes[i];
        }
        
        return string(padded);
    }
    
    /**
     * @notice 将地址转换为十六进制字符串
     */
    function _toHexString(address addr) internal pure returns (string memory) {
        bytes memory buffer = new bytes(42);
        buffer[0] = "0";
        buffer[1] = "x";
        
        bytes memory hexChars = "0123456789abcdef";
        uint160 value = uint160(addr);
        
        for (uint256 i = 41; i > 1; i--) {
            buffer[i] = hexChars[value & 0xf];
            value >>= 4;
        }
        
        return string(buffer);
    }
}
