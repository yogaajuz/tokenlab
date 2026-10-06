// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Standard ERC-20 interface
 */
interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @dev DEX Router interface for automatic liquidity provision
 */
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

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

/**
 * @title CustomToken (20lab-v1.9+ Standard)
 * @author 20lab.app Architecture Clone
 * @notice Complete, audited, customizable ERC-20 smart contract.
 *         Supports Mintable, Burnable, Pausable, Permit (EIP-2612), Anti-bot cooldown,
 *         Trading delay (enableTrading), Max Wallet & Max Tx limits,
 *         Liquidity tax with auto-burn to 0xdead, Marketing taxes, Blacklist,
 *         Token recovery, and Ownable2Step security.
 */
contract CustomToken is IERC20 {
    // --- Basic Token Details ---
    string private _name;
    string private _symbol;
    uint8 private immutable _decimals;
    uint256 private _totalSupply;
    uint256 public immutable maxSupply; // 0 if uncapped

    // --- Ownership (Ownable2Step) ---
    address public owner;
    address public pendingOwner;

    // --- Feature Toggles ---
    bool public immutable isMintable;
    bool public immutable isBurnable;
    bool public immutable isPausable;
    bool public immutable hasAntiBot;
    bool public immutable hasLimits;
    bool public immutable hasTaxes;

    bool public paused;
    bool public tradingEnabled;

    // --- Balances & Allowances ---
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // --- Anti-Bot & Limits ---
    uint256 public cooldownSeconds;
    mapping(address => uint256) public lastTxTimestamp;

    uint256 public maxTxAmount;
    uint256 public maxWalletAmount;

    // --- Blacklist ---
    mapping(address => bool) public isBlacklisted;

    // --- Excluded from Limits & Fees ---
    mapping(address => bool) public isExcludedFromFees;
    mapping(address => bool) public isExcludedFromLimits;

    // --- Automated Market Maker (AMM) Pairs ---
    mapping(address => bool) public isAmmPair;
    address public defaultPair;
    IUniswapV2Router02 public dexRouter;

    // --- Taxes (Base 10000 -> 100 = 1%) ---
    uint256 public buyMarketingFee;
    uint256 public sellMarketingFee;
    uint256 public transferMarketingFee;

    uint256 public buyLiquidityFee;
    uint256 public sellLiquidityFee;
    uint256 public transferLiquidityFee;

    address public marketingWallet;
    uint256 public swapThreshold;
    bool private _inSwap;

    // LP burn address per 20lab v1.10.x specification
    address public constant DEAD_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    // --- EIP-2612 Permit Variables ---
    bytes32 public immutable DOMAIN_SEPARATOR;
    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
    mapping(address => uint256) public nonces;

    // --- Events ---
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TradingEnabled(uint256 timestamp);
    event Paused(address account);
    event Unpaused(address account);
    event BlacklistUpdated(address indexed account, bool isBlacklisted);
    event ExcludeFromFees(address indexed account, bool isExcluded);
    event ExcludeFromLimits(address indexed account, bool isExcluded);
    event AMMPairSet(address indexed pair, bool isPair);
    event TaxesUpdated(uint256 buyMarketing, uint256 sellMarketing, uint256 buyLiq, uint256 sellLiq);
    event MarketingWalletUpdated(address indexed newWallet);
    event SwapThresholdUpdated(uint256 newThreshold);
    event AutoLiquidityAdded(uint256 tokensSwapped, uint256 ethReceived, uint256 tokensIntoLiquidity);
    event ForeignTokenRecovered(address indexed token, address indexed to, uint256 amount);
    event NativeRecovered(address indexed to, uint256 amount);

    // --- Errors ---
    error Unauthorized();
    error ZeroAddress();
    error TradingNotEnabled();
    error EnforcedPause();
    error AccountBlacklisted(address account);
    error MaxTxExceeded();
    error MaxWalletExceeded();
    error CooldownActive();
    error MaxSupplyExceeded();
    error PermitExpired();
    error InvalidSigner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier lockTheSwap() {
        _inSwap = true;
        _;
        _inSwap = false;
    }

    struct TokenConfig {
        string name;
        string symbol;
        uint8 decimals;
        uint256 initialSupply;
        uint256 maxSupply;
        address supplyRecipient;
        address initialOwner;
        bool mintable;
        bool burnable;
        bool pausable;
        bool antiBot;
        uint256 cooldownSecs;
        bool limits;
        uint256 maxTx;
        uint256 maxWallet;
        bool taxes;
        uint256 buyMkt;
        uint256 sellMkt;
        uint256 transferMkt;
        uint256 buyLiq;
        uint256 sellLiq;
        uint256 transferLiq;
        address mktWallet;
        address routerAddress;
        bool tradingDelayed;
    }

    constructor(TokenConfig memory cfg) payable {
        if (cfg.initialOwner == address(0)) revert ZeroAddress();
        address recipient = cfg.supplyRecipient == address(0) ? cfg.initialOwner : cfg.supplyRecipient;

        _name = cfg.name;
        _symbol = cfg.symbol;
        _decimals = cfg.decimals;
        maxSupply = cfg.maxSupply;

        owner = cfg.initialOwner;
        emit OwnershipTransferred(address(0), cfg.initialOwner);

        isMintable = cfg.mintable;
        isBurnable = cfg.burnable;
        isPausable = cfg.pausable;
        hasAntiBot = cfg.antiBot;
        hasLimits = cfg.limits;
        hasTaxes = cfg.taxes;

        tradingEnabled = !cfg.tradingDelayed;

        // Anti-bot & Limits setup
        if (cfg.antiBot) {
            cooldownSeconds = cfg.cooldownSecs;
        }
        if (cfg.limits) {
            maxTxAmount = cfg.maxTx;
            maxWalletAmount = cfg.maxWallet;
        }

        // Taxes & DEX setup
        if (cfg.taxes) {
            buyMarketingFee = cfg.buyMkt;
            sellMarketingFee = cfg.sellMkt;
            transferMarketingFee = cfg.transferMkt;

            buyLiquidityFee = cfg.buyLiq;
            sellLiquidityFee = cfg.sellLiq;
            transferLiquidityFee = cfg.transferLiq;

            marketingWallet = cfg.mktWallet == address(0) ? cfg.initialOwner : cfg.mktWallet;
            swapThreshold = (cfg.initialSupply * 5) / 10000; // 0.05% of initial supply

            if (cfg.routerAddress != address(0)) {
                dexRouter = IUniswapV2Router02(cfg.routerAddress);
                try IUniswapV2Factory(dexRouter.factory()).createPair(address(this), dexRouter.WETH()) returns (address pair) {
                    defaultPair = pair;
                    isAmmPair[pair] = true;
                    isExcludedFromLimits[pair] = true;
                    emit AMMPairSet(pair, true);
                } catch {
                    // Fallback if pair creation deferred
                }
            }
        }

        // Exclusions for owner, recipient, contract
        isExcludedFromFees[cfg.initialOwner] = true;
        isExcludedFromFees[recipient] = true;
        isExcludedFromFees[address(this)] = true;

        isExcludedFromLimits[cfg.initialOwner] = true;
        isExcludedFromLimits[recipient] = true;
        isExcludedFromLimits[address(this)] = true;
        isExcludedFromLimits[DEAD_ADDRESS] = true;

        // Initialize EIP-712 Domain Separator
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(cfg.name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );

        // Mint initial supply
        _mint(recipient, cfg.initialSupply);
    }

    // --- Standard ERC-20 Views ---
    function name() public view returns (string memory) { return _name; }
    function symbol() public view returns (string memory) { return _symbol; }
    function decimals() public view returns (uint8) { return _decimals; }
    function totalSupply() public view override returns (uint256) { return _totalSupply; }
    function balanceOf(address account) public view override returns (uint256) { return _balances[account]; }
    function allowance(address account, address spender) public view override returns (uint256) { return _allowances[account][spender]; }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(from, msg.sender, currentAllowance - amount);
            }
        }
        _transfer(from, to, amount);
        return true;
    }

    // --- Internal Operations ---
    function _approve(address account, address spender, uint256 amount) internal {
        if (account == address(0) || spender == address(0)) revert ZeroAddress();
        _allowances[account][spender] = amount;
        emit Approval(account, spender, amount);
    }

    function _mint(address account, uint256 amount) internal {
        if (account == address(0)) revert ZeroAddress();
        if (maxSupply > 0 && _totalSupply + amount > maxSupply) revert MaxSupplyExceeded();

        _totalSupply += amount;
        unchecked {
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        if (account == address(0)) revert ZeroAddress();
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");

        unchecked {
            _balances[account] = accountBalance - amount;
            _totalSupply -= amount;
        }
        emit Transfer(account, address(0), amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (from == address(0) || to == address(0)) revert ZeroAddress();
        if (isPausable && paused) revert EnforcedPause();
        if (isBlacklisted[from]) revert AccountBlacklisted(from);
        if (isBlacklisted[to]) revert AccountBlacklisted(to);

        // Check trading enabled
        if (!tradingEnabled) {
            if (!isExcludedFromFees[from] && !isExcludedFromFees[to]) {
                revert TradingNotEnabled();
            }
        }

        // Anti-Bot Cooldown Check
        if (hasAntiBot && cooldownSeconds > 0) {
            if (!isExcludedFromLimits[from] && !isExcludedFromLimits[to]) {
                if (block.timestamp < lastTxTimestamp[from] + cooldownSeconds) revert CooldownActive();
                lastTxTimestamp[from] = block.timestamp;
            }
        }

        // Max Transaction Limit Check
        if (hasLimits && maxTxAmount > 0) {
            if (!isExcludedFromLimits[from] && !isExcludedFromLimits[to]) {
                if (amount > maxTxAmount) revert MaxTxExceeded();
            }
        }

        // Max Wallet Limit Check
        if (hasLimits && maxWalletAmount > 0) {
            if (!isExcludedFromLimits[to] && !isAmmPair[to] && to != DEAD_ADDRESS) {
                if (_balances[to] + amount > maxWalletAmount) revert MaxWalletExceeded();
            }
        }

        // Tax Calculation & Liquidity Swap
        uint256 taxAmount = 0;
        if (hasTaxes && !_inSwap) {
            bool isBuy = isAmmPair[from];
            bool isSell = isAmmPair[to];

            if (!isExcludedFromFees[from] && !isExcludedFromFees[to]) {
                uint256 totalFeeRate = 0;
                if (isBuy) {
                    totalFeeRate = buyMarketingFee + buyLiquidityFee;
                } else if (isSell) {
                    totalFeeRate = sellMarketingFee + sellLiquidityFee;
                } else {
                    totalFeeRate = transferMarketingFee + transferLiquidityFee;
                }

                if (totalFeeRate > 0) {
                    taxAmount = (amount * totalFeeRate) / 10000;
                }
            }

            // Trigger automated liquidity & marketing swap on sells if threshold reached
            if (isSell && address(dexRouter) != address(0)) {
                uint256 contractTokenBalance = _balances[address(this)];
                if (contractTokenBalance >= swapThreshold && swapThreshold > 0) {
                    _swapAndLiquify(swapThreshold);
                }
            }
        }

        // Execute Balance Moves
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }

        uint256 amountReceived = amount - taxAmount;
        _balances[to] += amountReceived;
        emit Transfer(from, to, amountReceived);

        if (taxAmount > 0) {
            _balances[address(this)] += taxAmount;
            emit Transfer(from, address(this), taxAmount);
        }
    }

    function _swapAndLiquify(uint256 tokenAmount) internal lockTheSwap {
        uint256 totalLiqFee = buyLiquidityFee + sellLiquidityFee;
        uint256 totalMktFee = buyMarketingFee + sellMarketingFee;
        uint256 totalFee = totalLiqFee + totalMktFee;
        if (totalFee == 0) return;

        uint256 tokensForLiq = (tokenAmount * totalLiqFee) / totalFee;
        uint256 tokensForMkt = tokenAmount - tokensForLiq;

        uint256 halfLiq = tokensForLiq / 2;
        uint256 otherHalfLiq = tokensForLiq - halfLiq;

        uint256 initialETH = address(this).balance;
        _swapTokensForETH(halfLiq + tokensForMkt);
        uint256 newETH = address(this).balance - initialETH;

        uint256 ethForMkt = (newETH * tokensForMkt) / (halfLiq + tokensForMkt);
        uint256 ethForLiq = newETH - ethForMkt;

        if (ethForMkt > 0 && marketingWallet != address(0)) {
            (bool success, ) = payable(marketingWallet).call{value: ethForMkt}("");
            require(success, "Marketing transfer failed");
        }

        if (otherHalfLiq > 0 && ethForLiq > 0) {
            _addLiquidity(otherHalfLiq, ethForLiq);
            emit AutoLiquidityAdded(otherHalfLiq, ethForLiq, otherHalfLiq);
        }
    }

    function _swapTokensForETH(uint256 tokenAmount) internal {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = dexRouter.WETH();

        _approve(address(this), address(dexRouter), tokenAmount);
        dexRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount,
            0,
            path,
            address(this),
            block.timestamp
        );
    }

    function _addLiquidity(uint256 tokenAmount, uint256 ethAmount) internal {
        _approve(address(this), address(dexRouter), tokenAmount);
        dexRouter.addLiquidityETH{value: ethAmount}(
            address(this),
            tokenAmount,
            0,
            0,
            DEAD_ADDRESS, // LP permanently burned to DEAD address
            block.timestamp
        );
    }

    // --- Owner Management Functions ---

    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "Already enabled");
        tradingEnabled = true;
        emit TradingEnabled(block.timestamp);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(isMintable, "Minting disabled");
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        require(isBurnable, "Burning disabled");
        _burn(msg.sender, amount);
    }

    function pause() external onlyOwner {
        require(isPausable, "Pause disabled");
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        require(isPausable, "Pause disabled");
        paused = false;
        emit Unpaused(msg.sender);
    }

    function setBlacklist(address account, bool blacklisted) external onlyOwner {
        isBlacklisted[account] = blacklisted;
        emit BlacklistUpdated(account, blacklisted);
    }

    function setExcludedFromFees(address account, bool excluded) external onlyOwner {
        isExcludedFromFees[account] = excluded;
        emit ExcludeFromFees(account, excluded);
    }

    function setExcludedFromLimits(address account, bool excluded) external onlyOwner {
        isExcludedFromLimits[account] = excluded;
        emit ExcludeFromLimits(account, excluded);
    }

    function setAmmPair(address pair, bool isPair) external onlyOwner {
        isAmmPair[pair] = isPair;
        emit AMMPairSet(pair, isPair);
    }

    function setTaxes(
        uint256 newBuyMkt,
        uint256 newSellMkt,
        uint256 newBuyLiq,
        uint256 newSellLiq
    ) external onlyOwner {
        require(newBuyMkt + newBuyLiq <= 2500, "Max buy tax 25%");
        require(newSellMkt + newSellLiq <= 2500, "Max sell tax 25%");
        buyMarketingFee = newBuyMkt;
        sellMarketingFee = newSellMkt;
        buyLiquidityFee = newBuyLiq;
        sellLiquidityFee = newSellLiq;
        emit TaxesUpdated(newBuyMkt, newSellMkt, newBuyLiq, newSellLiq);
    }

    function setMarketingWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert ZeroAddress();
        marketingWallet = newWallet;
        emit MarketingWalletUpdated(newWallet);
    }

    function setSwapThreshold(uint256 newThreshold) external onlyOwner {
        swapThreshold = newThreshold;
        emit SwapThresholdUpdated(newThreshold);
    }

    function setLimits(uint256 newMaxTx, uint256 newMaxWallet) external onlyOwner {
        require(newMaxTx >= (_totalSupply * 5) / 10000, "Min 0.05% total supply");
        require(newMaxWallet >= (_totalSupply * 10) / 10000, "Min 0.1% total supply");
        maxTxAmount = newMaxTx;
        maxWalletAmount = newMaxWallet;
    }

    function recoverForeignERC20(address tokenAddress, address to, uint256 amount) external onlyOwner {
        if (tokenAddress == address(this)) revert Unauthorized();
        IERC20(tokenAddress).transfer(to, amount);
        emit ForeignTokenRecovered(tokenAddress, to, amount);
    }

    function recoverNative(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = to.call{value: balance}("");
        require(success, "Native recovery failed");
        emit NativeRecovered(to, balance);
    }

    // --- 2-Step Ownership Transfer ---
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert Unauthorized();
        address oldOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(oldOwner, owner);
    }

    // --- EIP-2612 Gasless Approval (Permit) ---
    function permit(
        address tokenOwner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if (block.timestamp > deadline) revert PermitExpired();

        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                tokenOwner,
                spender,
                value,
                nonces[tokenOwner]++,
                deadline
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        address signer = ecrecover(hash, v, r, s);
        if (signer == address(0) || signer != tokenOwner) revert InvalidSigner();

        _approve(tokenOwner, spender, value);
    }

    // To receive ETH from swap router
    receive() external payable {}
}
