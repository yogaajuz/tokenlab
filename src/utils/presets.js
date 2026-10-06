export const TOKEN_PRESETS = [
  {
    id: 'standard',
    name: 'Standard Token',
    badge: 'Popular',
    description: 'Clean fixed-supply ERC-20 contract with zero taxes. Extremely gas-efficient and ideal for governance or utility.',
    features: {
      enableTrading: false,
      burnable: false,
      mintable: false,
      pausable: false,
      permit: true,
      recoverable: true,
      blacklist: false,
      whitelist: false,
      transferTax: false,
      marketingTax: false,
      liquidityTax: false,
      holderReflection: false,
      autoBurnTax: false,
      maxTxLimit: false,
      maxWalletLimit: false,
      antiBotCooldown: false,
      customDecimals: false,
      canRenounceOwnership: true
    }
  },
  {
    id: 'meme',
    name: 'Meme / Community',
    badge: 'Trending',
    description: 'Equipped with anti-whale protection, max transaction limits, anti-bot cooldowns, and marketing taxes for viral launches.',
    features: {
      burnable: true,
      mintable: false,
      pausable: true,
      permit: true,
      recoverable: true,
      blacklist: true,
      whitelist: false,
      transferTax: true,
      marketingTax: true,
      liquidityTax: true,
      holderReflection: false,
      autoBurnTax: false,
      maxTxLimit: true,
      maxWalletLimit: true,
      antiBotCooldown: true,
      customDecimals: false,
      canRenounceOwnership: true
    }
  },
  {
    id: 'deflationary',
    name: 'Deflationary Token',
    badge: 'Auto-Burn',
    description: 'Supply shrinks over time with automatic burn on transactions plus marketing development funding.',
    features: {
      burnable: true,
      mintable: false,
      pausable: false,
      permit: true,
      recoverable: true,
      blacklist: false,
      whitelist: false,
      transferTax: true,
      marketingTax: true,
      liquidityTax: false,
      holderReflection: false,
      autoBurnTax: true,
      maxTxLimit: true,
      maxWalletLimit: false,
      antiBotCooldown: false,
      customDecimals: false,
      canRenounceOwnership: true
    }
  },
  {
    id: 'utility',
    name: 'Governance & Utility',
    badge: 'DAO Ready',
    description: 'Mintable supply for staking rewards, gasless approvals (EIP-2612 Permit), and emergency pause capability.',
    features: {
      burnable: true,
      mintable: true,
      pausable: true,
      permit: true,
      recoverable: true,
      blacklist: false,
      whitelist: false,
      transferTax: false,
      marketingTax: false,
      liquidityTax: false,
      holderReflection: false,
      autoBurnTax: false,
      maxTxLimit: false,
      maxWalletLimit: false,
      antiBotCooldown: false,
      customDecimals: false,
      canRenounceOwnership: true
    }
  },
  {
    id: 'enterprise',
    name: 'Custom Enterprise',
    badge: 'Maximum Control',
    description: 'Fully customisable configuration with compliance whitelist/blacklist, custom taxes, and full owner controls.',
    features: {
      burnable: true,
      mintable: true,
      pausable: true,
      permit: true,
      recoverable: true,
      blacklist: true,
      whitelist: true,
      transferTax: true,
      marketingTax: true,
      liquidityTax: true,
      holderReflection: true,
      autoBurnTax: true,
      maxTxLimit: true,
      maxWalletLimit: true,
      antiBotCooldown: true,
      customDecimals: true,
      canRenounceOwnership: true
    }
  }
];

export const ALL_FEATURES = [
  {
    key: 'enableTrading',
    category: 'Launch Control',
    title: 'Enable Trading Function',
    description: 'Restricts trading transfers until owner explicitly calls enableTrading(). Prevents frontrunning and snipers during liquidity addition.',
    icon: '🚦',
    extraFee: '0.000 ETH'
  },
  {
    key: 'mintable',
    category: 'Supply & Minting',
    title: 'Mintable Supply',
    description: 'Owner can mint additional tokens after initial deployment. Required for reward pools and emissions.',
    icon: '🪙',
    extraFee: '0.000 ETH'
  },
  {
    key: 'burnable',
    category: 'Supply & Minting',
    title: 'Burnable',
    description: 'Token holders or contract owner can permanently burn tokens from circulation.',
    icon: '🔥',
    extraFee: '0.000 ETH'
  },
  {
    key: 'pausable',
    category: 'Security & Access',
    title: 'Pausable Transfers',
    description: 'Ability to temporarily pause token transfers in case of emergency exploits or migration.',
    icon: '⏸️',
    extraFee: '0.000 ETH'
  },
  {
    key: 'permit',
    category: 'Gas & Convenience',
    title: 'ERC-2612 Permit',
    description: 'Enables gasless token approvals via signed EIP-712 messages (DEX swaps without separate approve tx).',
    icon: '⚡',
    extraFee: '0.000 ETH'
  },
  {
    key: 'blacklist',
    category: 'Security & Access',
    title: 'Blacklist Function',
    description: 'Owner can restrict malicious addresses or exploit bots from buying, selling, or transferring.',
    icon: '🚫',
    extraFee: '0.002 ETH'
  },
  {
    key: 'whitelist',
    category: 'Security & Access',
    title: 'Whitelist Function',
    description: 'Restrict transactions so only approved community or KYC addresses can transfer tokens.',
    icon: '📋',
    extraFee: '0.002 ETH'
  },
  {
    key: 'transferTax',
    category: 'Taxes & Tokenomics',
    title: 'Transfer Taxes & Fees',
    description: 'Applies automated percentage fees on token transfers split between marketing, LP, or burn.',
    icon: '💸',
    extraFee: '0.003 ETH'
  },
  {
    key: 'marketingTax',
    category: 'Taxes & Tokenomics',
    title: 'Marketing Treasury Fee',
    description: 'Direct a percentage fee on every transfer to a dedicated marketing / operations wallet.',
    icon: '📢',
    extraFee: '0.000 ETH',
    dependsOn: 'transferTax'
  },
  {
    key: 'liquidityTax',
    category: 'Taxes & Tokenomics',
    title: 'Auto-Liquidity Tax',
    description: 'Direct a percentage fee toward liquidity reserve or automated pool builder.',
    icon: '💧',
    extraFee: '0.000 ETH',
    dependsOn: 'transferTax'
  },
  {
    key: 'autoBurnTax',
    category: 'Taxes & Tokenomics',
    title: 'Deflationary Auto-Burn',
    description: 'Directly burns a percentage of every transfer, reducing total supply permanently.',
    icon: '🌋',
    extraFee: '0.000 ETH',
    dependsOn: 'transferTax'
  },
  {
    key: 'maxTxLimit',
    category: 'Anti-Whale & Protection',
    title: 'Max Transaction Limit',
    description: 'Cap the maximum amount a single transaction can transfer (prevents massive market dumps).',
    icon: '🐋',
    extraFee: '0.002 ETH'
  },
  {
    key: 'maxWalletLimit',
    category: 'Anti-Whale & Protection',
    title: 'Max Wallet Holding',
    description: 'Cap the maximum percentage of supply any single wallet address can accumulate.',
    icon: '🏦',
    extraFee: '0.002 ETH'
  },
  {
    key: 'antiBotCooldown',
    category: 'Anti-Whale & Protection',
    title: 'Anti-Bot Cooldown Timer',
    description: 'Enforce minimum time delay (e.g. 30 seconds) between transfers from the same address.',
    icon: '⏱️',
    extraFee: '0.002 ETH'
  },
  {
    key: 'recoverable',
    category: 'Utility & Safety',
    title: 'Emergency Token Rescue',
    description: 'Allows owner to recover any other ERC-20 tokens sent to the contract address accidentally.',
    icon: '🛡️',
    extraFee: '0.000 ETH'
  },
  {
    key: 'canRenounceOwnership',
    category: 'Utility & Safety',
    title: 'Renounceable Ownership',
    description: 'Allows renouncing ownership permanently (setting owner to 0x0) to establish 100% community trust.',
    icon: '👑',
    extraFee: '0.000 ETH'
  }
];
