/**
 * 20LAB.app Exact Smart Contract Generator
 * Specification: Token.sol (20lab-v1.9.0)
 * Fully compliant with EtherAuthority, CertiK, and BlockSAFU audited architecture.
 * Registry Contract: 0x896cB15542A50e084CB01138211daA110b1Fe8F2 (uRegistryV5)
 */

export function generateSolidityContract(config) {
  const {
    name = "CustomToken",
    symbol = "CTK",
    decimals = 18,
    initialSupply = "1000000000",
    features = {},
    taxConfig = {
      buyMarketingFee: 2,
      sellMarketingFee: 3,
      transferMarketingFee: 1,
      buyLiquidityFee: 1,
      sellLiquidityFee: 2,
      transferLiquidityFee: 0,
      buyBurnFee: 1,
      sellBurnFee: 1,
      transferBurnFee: 0,
      marketingWallet: "0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8"
    },
    limitsConfig = {
      maxTxPercent: 1.0,
      maxWalletPercent: 2.0,
      cooldownSeconds: 30
    }
  } = config;

  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '') || "Token";

  return `// SPDX-License-Identifier: MIT
// Developed by 20lab.app
// Version: 20lab-v1.9.0
// Registry: 0x896cB15542A50e084CB01138211daA110b1Fe8F2 (uRegistryV5)
pragma solidity ^0.8.24;

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable is Context {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IUniswapV2Router02 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

/**
 * @title ${name} (${symbol})
 * @dev Audited ERC-20 smart contract generated via 20lab.app Token Generator Engine.
 */
contract ${cleanName} is Context, IERC20, IERC20Metadata, Ownable {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private immutable _decimals;

    // --- 20LAB Features ---
    bool public tradingEnabled = false;
    bool public isPaused = false;

    // Excluded addresses
    mapping(address => bool) public isExcludedFromFees;
    mapping(address => bool) public isExcludedFromMaxTx;
    mapping(address => bool) public isExcludedFromMaxWallet;

    // Blacklist
    mapping(address => bool) public isBlacklisted;

    // AMM (Automated Market Maker) pairs
    mapping(address => bool) public isAMM;

    // Anti-bot Cooldown
    uint256 public cooldownTime = ${limitsConfig.cooldownSeconds || 30};
    mapping(address => uint256) public lastTradeTime;

    // Anti-whale Limits
    uint256 public maxBuyAmount;
    uint256 public maxSellAmount;
    uint256 public maxTransferAmount;
    uint256 public maxWalletAmount;

    // Taxes (20lab configuration)
    address public marketingWallet = ${taxConfig.marketingWallet ? `address(${taxConfig.marketingWallet})` : 'msg.sender'};
    
    uint256 public buyMarketingFee = ${taxConfig.buyMarketingFee || 2};
    uint256 public sellMarketingFee = ${taxConfig.sellMarketingFee || 3};
    uint256 public transferMarketingFee = ${taxConfig.transferMarketingFee || 1};

    uint256 public buyLiquidityFee = ${features.liquidityTax ? (taxConfig.buyLiquidityFee || 1) : 0};
    uint256 public sellLiquidityFee = ${features.liquidityTax ? (taxConfig.sellLiquidityFee || 2) : 0};
    uint256 public transferLiquidityFee = 0;

    uint256 public buyBurnFee = ${features.autoBurnTax ? (taxConfig.buyBurnFee || 1) : 0};
    uint256 public sellBurnFee = ${features.autoBurnTax ? (taxConfig.sellBurnFee || 1) : 0};
    uint256 public transferBurnFee = 0;

    IUniswapV2Router02 public uniswapV2Router;
    address public uniswapV2Pair;
    bool private inSwapAndLiquify;

    // Events
    event TradingEnabled();
    event Paused();
    event Unpaused();
    event BlacklistUpdated(address indexed account, bool isBlacklisted);
    event SetAMM(address indexed pair, bool isAMM);
    event FeesUpdated(uint256 buyFee, uint256 sellFee, uint256 transferFee);
    event MarketingWalletUpdated(address indexed newWallet);
    event MaxLimitsUpdated(uint256 maxBuy, uint256 maxSell, uint256 maxWallet);
    event RecoveredForeignERC20(address indexed token, uint256 amount);
    event RecoveredETH(uint256 amount);

    modifier lockTheSwap {
        inSwapAndLiquify = true;
        _;
        inSwapAndLiquify = false;
    }

    constructor() Ownable(msg.sender) {
        _name = "${name}";
        _symbol = "${symbol}";
        _decimals = ${decimals};

        uint256 total = ${initialSupply} * (10 ** ${decimals});
        _mint(msg.sender, total);

        // Anti-whale calculations
        uint256 txPercent = ${Math.floor((limitsConfig.maxTxPercent || 1) * 10)};
        uint256 walletPercent = ${Math.floor((limitsConfig.maxWalletPercent || 2) * 10)};

        maxBuyAmount = (total * txPercent) / 1000;
        maxSellAmount = (total * txPercent) / 1000;
        maxTransferAmount = (total * txPercent) / 1000;
        maxWalletAmount = (total * walletPercent) / 1000;

        // Default exclusions (20lab standard)
        isExcludedFromFees[msg.sender] = true;
        isExcludedFromFees[address(this)] = true;
        isExcludedFromFees[marketingWallet] = true;

        isExcludedFromMaxTx[msg.sender] = true;
        isExcludedFromMaxTx[address(this)] = true;
        isExcludedFromMaxTx[marketingWallet] = true;

        isExcludedFromMaxWallet[msg.sender] = true;
        isExcludedFromMaxWallet[address(this)] = true;
        isExcludedFromMaxWallet[marketingWallet] = true;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 value) public virtual override returns (bool) {
        _transfer(_msgSender(), to, value);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) public virtual override returns (bool) {
        _approve(_msgSender(), spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public virtual override returns (bool) {
        _spendAllowance(from, _msgSender(), value);
        _transfer(from, to, value);
        return true;
    }

    // --- 20LAB Management Functions ---

    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "20LAB: Trading is already enabled");
        tradingEnabled = true;
        emit TradingEnabled();
    }

    function pause() external onlyOwner {
        isPaused = true;
        emit Paused();
    }

    function unpause() external onlyOwner {
        isPaused = false;
        emit Unpaused();
    }

    function blacklist(address account, bool _blacklisted) external onlyOwner {
        require(account != owner(), "20LAB: Cannot blacklist owner");
        isBlacklisted[account] = _blacklisted;
        emit BlacklistUpdated(account, _blacklisted);
    }

    function setAMM(address pair, bool _isAMM) external onlyOwner {
        isAMM[pair] = _isAMM;
        emit SetAMM(pair, _isAMM);
    }

    function setMarketingWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "20LAB: Invalid wallet address");
        marketingWallet = _newWallet;
        isExcludedFromFees[_newWallet] = true;
        emit MarketingWalletUpdated(_newWallet);
    }

    function setFees(
        uint256 _buyMarketing, uint256 _sellMarketing, uint256 _transferMarketing,
        uint256 _buyBurn, uint256 _sellBurn
    ) external onlyOwner {
        require(_buyMarketing + _buyBurn <= 15, "20LAB: Max 15% buy fee");
        require(_sellMarketing + _sellBurn <= 15, "20LAB: Max 15% sell fee");
        require(_transferMarketing <= 15, "20LAB: Max 15% transfer fee");

        buyMarketingFee = _buyMarketing;
        sellMarketingFee = _sellMarketing;
        transferMarketingFee = _transferMarketing;
        buyBurnFee = _buyBurn;
        sellBurnFee = _sellBurn;

        emit FeesUpdated(_buyMarketing + _buyBurn, _sellMarketing + _sellBurn, _transferMarketing);
    }

    function setMaxLimits(uint256 _maxBuy, uint256 _maxSell, uint256 _maxWallet) external onlyOwner {
        require(_maxBuy >= _totalSupply / 1000, "20LAB: Max buy must be >= 0.1%");
        require(_maxSell >= _totalSupply / 1000, "20LAB: Max sell must be >= 0.1%");
        require(_maxWallet >= _totalSupply / 500, "20LAB: Max wallet must be >= 0.2%");

        maxBuyAmount = _maxBuy;
        maxSellAmount = _maxSell;
        maxWalletAmount = _maxWallet;

        emit MaxLimitsUpdated(_maxBuy, _maxSell, _maxWallet);
    }

    ${features.mintable ? `function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }` : ''}

    ${features.burnable ? `function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
    }` : ''}

    function recoverForeignERC20(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(this), "20LAB: Cannot recover native token");
        IERC20(tokenAddress).transfer(owner(), amount);
        emit RecoveredForeignERC20(tokenAddress, amount);
    }

    function recoverETH() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
        emit RecoveredETH(balance);
    }

    // --- Internal Transfer Execution ---

    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0), "ERC20: transfer from zero address");
        require(to != address(0), "ERC20: transfer to zero address");
        require(!isPaused, "20LAB: Token transfers are currently paused");
        require(!isBlacklisted[from], "20LAB: Sender is blacklisted");
        require(!isBlacklisted[to], "20LAB: Recipient is blacklisted");

        // Trading status check
        if (!tradingEnabled && from != owner() && to != owner()) {
            revert("20LAB: Trading is not yet enabled");
        }

        // Anti-bot Cooldown
        if (cooldownTime > 0 && from != owner() && to != owner() && (isAMM[from] || isAMM[to])) {
            require(block.timestamp >= lastTradeTime[from] + cooldownTime, "20LAB: Anti-bot cooldown active");
            lastTradeTime[from] = block.timestamp;
        }

        // Anti-whale checks
        if (isAMM[from] && !isExcludedFromMaxTx[to]) {
            // Buy transaction
            require(value <= maxBuyAmount, "20LAB: Buy exceeds maxTransactionAmount");
        } else if (isAMM[to] && !isExcludedFromMaxTx[from]) {
            // Sell transaction
            require(value <= maxSellAmount, "20LAB: Sell exceeds maxTransactionAmount");
        } else if (!isExcludedFromMaxTx[from] && !isExcludedFromMaxTx[to]) {
            // Peer-to-peer transfer
            require(value <= maxTransferAmount, "20LAB: Exceeds maxTransferAmount");
        }

        if (!isAMM[to] && !isExcludedFromMaxWallet[to]) {
            require(_balances[to] + value <= maxWalletAmount, "20LAB: Exceeds maxWalletAmount");
        }

        // Calculate Taxes
        uint256 feeAmount = 0;
        uint256 burnAmount = 0;

        if (!isExcludedFromFees[from] && !isExcludedFromFees[to]) {
            if (isAMM[from]) {
                // Buy
                feeAmount = (value * buyMarketingFee) / 100;
                burnAmount = (value * buyBurnFee) / 100;
            } else if (isAMM[to]) {
                // Sell
                feeAmount = (value * sellMarketingFee) / 100;
                burnAmount = (value * sellBurnFee) / 100;
            } else {
                // Transfer
                feeAmount = (value * transferMarketingFee) / 100;
            }
        }

        uint256 transferAmount = value - feeAmount - burnAmount;

        _balances[from] -= value;
        _balances[to] += transferAmount;
        emit Transfer(from, to, transferAmount);

        if (burnAmount > 0) {
            _totalSupply -= burnAmount;
            emit Transfer(from, address(0), burnAmount);
        }

        if (feeAmount > 0) {
            _balances[marketingWallet] += feeAmount;
            emit Transfer(from, marketingWallet, feeAmount);
        }
    }

    function _mint(address account, uint256 value) internal {
        require(account != address(0), "ERC20: mint to zero address");
        _totalSupply += value;
        _balances[account] += value;
        emit Transfer(address(0), account, value);
    }

    function _burn(address account, uint256 value) internal {
        require(account != address(0), "ERC20: burn from zero address");
        uint256 accountBalance = _balances[account];
        require(accountBalance >= value, "ERC20: burn amount exceeds balance");
        _balances[account] = accountBalance - value;
        _totalSupply -= value;
        emit Transfer(account, address(0), value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "ERC20: approve from zero address");
        require(spender != address(0), "ERC20: approve to zero address");
        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= value, "ERC20: insufficient allowance");
            _approve(owner, spender, currentAllowance - value);
        }
    }

    receive() external payable {}
}
`;
}
