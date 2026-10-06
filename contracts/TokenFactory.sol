// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenRegistry.sol";
import "./CustomToken.sol";

/**
 * @title TokenFactory
 * @author 20lab.app Architecture Clone
 * @notice Factory smart contract allowing 1-click on-chain deployment of custom ERC-20 tokens.
 *         Ensures that:
 *         1. The deployment fee is collected and recorded in TokenRegistry (where the USER is owner).
 *         2. The new token's ownership is assigned directly to the creator (msg.sender or designated owner).
 *         3. Token information is registered in the TokenRegistry for historical tracking and block explorer verification.
 */
contract TokenFactory {
    TokenRegistry public immutable registry;

    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        address indexed owner,
        string name,
        string symbol,
        uint256 initialSupply,
        uint256 feePaid
    );

    constructor(address payable registryAddress) {
        require(registryAddress != address(0), "Zero address");
        registry = TokenRegistry(registryAddress);
    }

    /**
     * @notice Deploys a new CustomToken on-chain and registers it in TokenRegistry.
     * @param cfg Full token configuration parameters.
     */
    function deployToken(CustomToken.TokenConfig memory cfg) external payable returns (address) {
        uint256 requiredFee = registry.creationFee();
        if (!registry.feeExempt(msg.sender) && !registry.feeExempt(cfg.initialOwner)) {
            require(msg.value >= requiredFee, "Insufficient creation fee");
        }

        // If no initial owner specified, default to msg.sender
        if (cfg.initialOwner == address(0)) {
            cfg.initialOwner = msg.sender;
        }

        // Deploy the new token contract
        CustomToken token = new CustomToken(cfg);
        address tokenAddress = address(token);

        // Register token with TokenRegistry and forward the fee
        registry.registerToken{value: msg.value}(
            tokenAddress,
            cfg.name,
            cfg.symbol,
            cfg.initialSupply,
            cfg.initialOwner
        );

        emit TokenCreated(
            tokenAddress,
            msg.sender,
            cfg.initialOwner,
            cfg.name,
            cfg.symbol,
            cfg.initialSupply,
            msg.value
        );

        return tokenAddress;
    }
}
