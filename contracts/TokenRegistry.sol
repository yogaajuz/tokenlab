// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TokenRegistry (uRegistryV5 Clone)
 * @author 20lab.app Architecture Clone
 * @notice Protocol Registry and Fee Collection contract for multi-chain token generation.
 *         Maintains records of all tokens deployed through the platform and allows the
 *         contract OWNER (the deployer / protocol administrator) to collect, manage,
 *         and withdraw 100% of the platform deployment revenue.
 */
contract TokenRegistry {
    // --- Ownership with 2-Step Safe Transfer ---
    address public owner;
    address public pendingOwner;

    // --- Protocol Fee Settings ---
    uint256 public creationFee; // In wei (e.g. 0.05 ether)
    uint256 public totalRevenueCollected;
    uint256 public totalTokensRegistered;

    // --- Token Record Struct ---
    struct TokenRecord {
        address tokenAddress;
        address tokenOwner;
        string name;
        string symbol;
        uint256 initialSupply;
        uint256 timestamp;
        uint256 feePaid;
    }

    // List of all registered tokens
    TokenRecord[] public allTokens;
    
    // Mapping from token address to its record index + 1 (0 = not registered)
    mapping(address => uint256) public tokenIndex;

    // Mapping from owner address to array of token addresses
    mapping(address => address[]) private ownerToTokens;

    // Whitelist for fee exemptions (e.g. promotional launches or partners)
    mapping(address => bool) public feeExempt;

    // --- Events ---
    event TokenRegistered(
        address indexed tokenAddress,
        address indexed tokenOwner,
        string name,
        string symbol,
        uint256 initialSupply,
        uint256 feePaid,
        uint256 timestamp
    );
    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);
    event ProtocolFundsWithdrawn(address indexed recipient, uint256 amount);
    event FeeExemptionUpdated(address indexed account, bool isExempt);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // --- Custom Errors (Gas Optimization) ---
    error Unauthorized();
    error ZeroAddress();
    error InsufficientFee(uint256 required, uint256 sent);
    error TokenAlreadyRegistered(address token);
    error WithdrawFailed();
    error NoPendingOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    /**
     * @param initialOwner Address of the protocol owner (e.g. the USER).
     * @param initialFee Creation fee in wei.
     */
    constructor(address initialOwner, uint256 initialFee) payable {
        if (initialOwner == address(0)) revert ZeroAddress();
        owner = initialOwner;
        creationFee = initialFee;
        emit OwnershipTransferred(address(0), initialOwner);
        emit CreationFeeUpdated(0, initialFee);
    }

    // --- Fallback & Receive to accept protocol fees or tips ---
    receive() external payable {
        totalRevenueCollected += msg.value;
    }

    fallback() external payable {
        totalRevenueCollected += msg.value;
    }

    /**
     * @notice Registers a newly created token with the registry.
     *         Requires payment of creationFee unless msg.sender or tokenOwner is fee exempt.
     * @param tokenAddress The address of the deployed token contract.
     * @param name Token descriptive name.
     * @param symbol Token symbol (e.g. NOVA, FLIRT).
     * @param initialSupply Initial minted token supply.
     * @param tokenOwner The address granted ownership of the token.
     */
    function registerToken(
        address tokenAddress,
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        address tokenOwner
    ) external payable returns (bool) {
        if (tokenAddress == address(0)) revert ZeroAddress();
        if (tokenIndex[tokenAddress] != 0) revert TokenAlreadyRegistered(tokenAddress);

        uint256 requiredFee = (feeExempt[msg.sender] || feeExempt[tokenOwner]) ? 0 : creationFee;
        if (msg.value < requiredFee) {
            revert InsufficientFee(requiredFee, msg.value);
        }

        totalRevenueCollected += msg.value;
        totalTokensRegistered += 1;

        TokenRecord memory record = TokenRecord({
            tokenAddress: tokenAddress,
            tokenOwner: tokenOwner,
            name: name,
            symbol: symbol,
            initialSupply: initialSupply,
            timestamp: block.timestamp,
            feePaid: msg.value
        });

        allTokens.push(record);
        tokenIndex[tokenAddress] = allTokens.length;
        ownerToTokens[tokenOwner].push(tokenAddress);

        emit TokenRegistered(
            tokenAddress,
            tokenOwner,
            name,
            symbol,
            initialSupply,
            msg.value,
            block.timestamp
        );

        // Refund any excess payment back to caller
        if (msg.value > requiredFee) {
            uint256 excess = msg.value - requiredFee;
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            require(success, "Refund failed");
        }

        return true;
    }

    /**
     * @notice Allows the contract OWNER to withdraw 100% of all collected protocol revenue.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientFee(1, 0);

        (bool success, ) = payable(owner).call{value: balance}("");
        if (!success) revert WithdrawFailed();

        emit ProtocolFundsWithdrawn(owner, balance);
    }

    /**
     * @notice Allows the contract OWNER to withdraw funds to a specific recipient or multi-sig.
     * @param recipient The address receiving the protocol revenue.
     */
    function withdrawTo(address payable recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientFee(1, 0);

        (bool success, ) = recipient.call{value: balance}("");
        if (!success) revert WithdrawFailed();

        emit ProtocolFundsWithdrawn(recipient, balance);
    }

    /**
     * @notice Updates the token creation fee. Restricted to contract OWNER.
     * @param newFee The new fee in wei.
     */
    function setCreationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = creationFee;
        creationFee = newFee;
        emit CreationFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Grants or revokes fee exemption for an address.
     * @param account Target wallet or contract.
     * @param isExempt True to exempt from fees, false otherwise.
     */
    function setFeeExemption(address account, bool isExempt) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        feeExempt[account] = isExempt;
        emit FeeExemptionUpdated(account, isExempt);
    }

    // --- 2-Step Ownership Transfer ---

    /**
     * @notice Starts the 2-step ownership transfer process to avoid accidental lockout.
     * @param newOwner Address of the proposed new owner.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /**
     * @notice Proposed owner calls this to accept and finalize ownership transfer.
     */
    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert Unauthorized();
        address oldOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(oldOwner, owner);
    }

    // --- View Functions ---

    /**
     * @notice Returns total count of tokens registered.
     */
    function getTotalTokens() external view returns (uint256) {
        return allTokens.length;
    }

    /**
     * @notice Returns all tokens deployed by a specific creator address.
     */
    function getTokensByOwner(address creator) external view returns (address[] memory) {
        return ownerToTokens[creator];
    }

    /**
     * @notice Returns slice of tokens for pagination in UI.
     */
    function getTokens(uint256 offset, uint256 limit) external view returns (TokenRecord[] memory) {
        uint256 total = allTokens.length;
        if (offset >= total) {
            return new TokenRecord[](0);
        }
        uint256 count = limit;
        if (offset + count > total) {
            count = total - offset;
        }
        TokenRecord[] memory page = new TokenRecord[](count);
        for (uint256 i = 0; i < count; i++) {
            page[i] = allTokens[offset + i];
        }
        return page;
    }

    /**
     * @notice Returns current protocol balance available for withdrawal by owner.
     */
    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
