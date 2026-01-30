// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CyberToken
 * @dev BEP-20代币合约，用于Burn Slots老虎机游戏
 * 
 * 部署步骤（Remix IDE）：
 * 1. 打开 https://remix.ethereum.org/
 * 2. 创建新文件，粘贴此代码
 * 3. 编译器版本选择 0.8.19+
 * 4. 部署时填入参数：
 *    - name: "Burn Slots Token"
 *    - symbol: "CST" 
 *    - initialSupply: 1000000000 (10亿)
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CyberToken is ERC20, ERC20Burnable, Ownable, Pausable {
    
    // ============ 状态变量 ============
    
    /// @notice 游戏合约地址，有权限调用 burnForGame
    address public gameContract;
    
    /// @notice 是否启用交易税
    bool public taxEnabled;
    
    /// @notice 买入税率 (基点, 100 = 1%)
    uint256 public buyTaxRate;
    
    /// @notice 卖出税率 (基点, 100 = 1%)
    uint256 public sellTaxRate;
    
    /// @notice 税收接收地址（奖池合约）
    address public taxReceiver;
    
    /// @notice DEX 交易对地址（用于判断买卖）
    mapping(address => bool) public isDexPair;
    
    /// @notice 免税地址
    mapping(address => bool) public isExemptFromTax;
    
    /// @notice 黑名单
    mapping(address => bool) public isBlacklisted;
    
    // ============ 事件 ============
    
    event GameContractUpdated(address indexed oldContract, address indexed newContract);
    event TaxConfigured(bool enabled, uint256 buyRate, uint256 sellRate, address receiver);
    event TaxExemptUpdated(address indexed account, bool exempt);
    event DexPairUpdated(address indexed pair, bool isPair);
    event BlacklistUpdated(address indexed account, bool blacklisted);
    event TokensBurnedForGame(address indexed player, uint256 amount);
    
    // ============ 构造函数 ============
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        // 铸造初始供应量给部署者
        _mint(msg.sender, initialSupply * 10**decimals());
        
        // 部署者默认免税
        isExemptFromTax[msg.sender] = true;
    }
    
    // ============ 游戏相关函数 ============
    
    /**
     * @notice 设置游戏合约地址
     * @param _gameContract 新的游戏合约地址
     */
    function setGameContract(address _gameContract) external onlyOwner {
        require(_gameContract != address(0), "Invalid address");
        address oldContract = gameContract;
        gameContract = _gameContract;
        
        // 游戏合约免税
        isExemptFromTax[_gameContract] = true;
        
        emit GameContractUpdated(oldContract, _gameContract);
    }
    
    /**
     * @notice 游戏合约调用的销毁函数
     * @param from 要销毁代币的地址
     * @param amount 销毁数量
     */
    function burnForGame(address from, uint256 amount) external {
        require(msg.sender == gameContract, "Only game contract can call");
        require(!isBlacklisted[from], "Address is blacklisted");
        _burn(from, amount);
        emit TokensBurnedForGame(from, amount);
    }
    
    // ============ 交易税相关函数 ============
    
    /**
     * @notice 配置交易税
     * @param _enabled 是否启用
     * @param _buyRate 买入税率（基点，300 = 3%）
     * @param _sellRate 卖出税率（基点，300 = 3%）
     * @param _receiver 税收接收地址
     */
    function configureTax(
        bool _enabled,
        uint256 _buyRate,
        uint256 _sellRate,
        address _receiver
    ) external onlyOwner {
        require(_buyRate <= 1000, "Buy tax too high"); // 最高10%
        require(_sellRate <= 1000, "Sell tax too high"); // 最高10%
        require(_receiver != address(0), "Invalid receiver");
        
        taxEnabled = _enabled;
        buyTaxRate = _buyRate;
        sellTaxRate = _sellRate;
        taxReceiver = _receiver;
        
        // 税收接收地址免税
        isExemptFromTax[_receiver] = true;
        
        emit TaxConfigured(_enabled, _buyRate, _sellRate, _receiver);
    }
    
    /**
     * @notice 设置DEX交易对地址
     * @param pair 交易对地址
     * @param isPair 是否是交易对
     */
    function setDexPair(address pair, bool isPair) external onlyOwner {
        isDexPair[pair] = isPair;
        emit DexPairUpdated(pair, isPair);
    }
    
    /**
     * @notice 设置免税地址
     * @param account 地址
     * @param exempt 是否免税
     */
    function setTaxExempt(address account, bool exempt) external onlyOwner {
        isExemptFromTax[account] = exempt;
        emit TaxExemptUpdated(account, exempt);
    }
    
    /**
     * @notice 设置黑名单
     * @param account 地址
     * @param blacklisted 是否加入黑名单
     */
    function setBlacklist(address account, bool blacklisted) external onlyOwner {
        isBlacklisted[account] = blacklisted;
        emit BlacklistUpdated(account, blacklisted);
    }
    
    // ============ 暂停功能 ============
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ 内部函数 ============
    
    /**
     * @dev 重写transfer函数以实现交易税
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        require(!isBlacklisted[from] && !isBlacklisted[to], "Blacklisted address");
        
        // 计算税费
        uint256 taxAmount = 0;
        
        if (taxEnabled && taxReceiver != address(0)) {
            // 检查是否是买入（从DEX买入）
            if (isDexPair[from] && !isExemptFromTax[to]) {
                taxAmount = (amount * buyTaxRate) / 10000;
            }
            // 检查是否是卖出（卖到DEX）
            else if (isDexPair[to] && !isExemptFromTax[from]) {
                taxAmount = (amount * sellTaxRate) / 10000;
            }
        }
        
        if (taxAmount > 0) {
            // 先转税费到接收地址
            super._update(from, taxReceiver, taxAmount);
            // 再转剩余金额到目标地址
            super._update(from, to, amount - taxAmount);
        } else {
            super._update(from, to, amount);
        }
    }
    
    // ============ 查询函数 ============
    
    /**
     * @notice 获取交易税配置
     */
    function getTaxConfig() external view returns (
        bool enabled,
        uint256 buyRate,
        uint256 sellRate,
        address receiver
    ) {
        return (taxEnabled, buyTaxRate, sellTaxRate, taxReceiver);
    }
}
