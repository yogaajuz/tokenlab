export const SUPPORTED_CHAINS = [
  // MAINNETS (DEFAULT & LIVE READY)
  {
    id: 'ethereum',
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    currency: 'ETH',
    icon: '🔷',
    color: '#627EEA',
    isTestnet: false,
    explorer: 'https://etherscan.io',
    rpcUrl: 'https://eth.llamarpc.com',
    platformFee: '0.015 ETH'
  },
  {
    id: 'base',
    chainId: 8453,
    name: 'Base',
    symbol: 'ETH',
    currency: 'ETH',
    icon: '🔵',
    color: '#0052FF',
    isTestnet: false,
    explorer: 'https://basescan.org',
    rpcUrl: 'https://mainnet.base.org',
    platformFee: '0.008 ETH'
  },
  {
    id: 'bsc',
    chainId: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    currency: 'BNB',
    icon: '🟡',
    color: '#F3BA2F',
    isTestnet: false,
    explorer: 'https://bscscan.com',
    rpcUrl: 'https://binance.llamarpc.com',
    platformFee: '0.05 BNB'
  },
  {
    id: 'arbitrum',
    chainId: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    currency: 'ETH',
    icon: '🔷',
    color: '#28A0F0',
    isTestnet: false,
    explorer: 'https://arbiscan.io',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    platformFee: '0.008 ETH'
  },
  {
    id: 'polygon',
    chainId: 137,
    name: 'Polygon PoS',
    symbol: 'POL',
    currency: 'POL',
    icon: '🟣',
    color: '#8247E5',
    isTestnet: false,
    explorer: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com',
    platformFee: '15 POL'
  },
  {
    id: 'optimism',
    chainId: 10,
    name: 'OP Mainnet',
    symbol: 'ETH',
    currency: 'ETH',
    icon: '🔴',
    color: '#FF0420',
    isTestnet: false,
    explorer: 'https://optimistic.etherscan.io',
    rpcUrl: 'https://mainnet.optimism.io',
    platformFee: '0.008 ETH'
  },
  {
    id: 'avalanche',
    chainId: 43114,
    name: 'Avalanche C-Chain',
    symbol: 'AVAX',
    currency: 'AVAX',
    icon: '🔺',
    color: '#E84142',
    isTestnet: false,
    explorer: 'https://snowtrace.io',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    platformFee: '0.5 AVAX'
  },
  {
    id: 'pulsechain',
    chainId: 369,
    name: 'PulseChain',
    symbol: 'PLS',
    currency: 'PLS',
    icon: '💚',
    color: '#00FF85',
    isTestnet: false,
    explorer: 'https://otter.pulsechain.com',
    rpcUrl: 'https://rpc.pulsechain.com',
    platformFee: '5000 PLS'
  },
  {
    id: 'cronos',
    chainId: 25,
    name: 'Cronos',
    symbol: 'CRO',
    currency: 'CRO',
    icon: '🔷',
    color: '#002D74',
    isTestnet: false,
    explorer: 'https://cronoscan.com',
    rpcUrl: 'https://evm.cronos.org',
    platformFee: '50 CRO'
  },

  // TESTNETS
  {
    id: 'sepolia',
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    symbol: 'SepoliaETH',
    currency: 'SepoliaETH',
    icon: '🔷',
    color: '#627EEA',
    isTestnet: true,
    explorer: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://rpc.sepolia.org',
    platformFee: 'FREE (Testnet)'
  },
  {
    id: 'base-sepolia',
    chainId: 84532,
    name: 'Base Sepolia',
    symbol: 'ETH',
    currency: 'ETH',
    icon: '🔵',
    color: '#0052FF',
    isTestnet: true,
    explorer: 'https://sepolia.basescan.org',
    rpcUrl: 'https://sepolia.base.org',
    platformFee: 'FREE (Testnet)'
  },
  {
    id: 'bsc-testnet',
    chainId: 97,
    name: 'BNB Testnet',
    symbol: 'tBNB',
    currency: 'tBNB',
    icon: '🟡',
    color: '#F3BA2F',
    isTestnet: true,
    explorer: 'https://testnet.bscscan.com',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    platformFee: 'FREE (Testnet)'
  },

  // NON-EVM
  {
    id: 'solana-mainnet',
    chainId: 999902,
    name: 'Solana Mainnet',
    symbol: 'SOL',
    currency: 'SOL',
    icon: '🟣',
    color: '#14F195',
    isTestnet: false,
    explorer: 'https://explorer.solana.com',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    platformFee: '0.15 SOL',
    isSolana: true
  },
  {
    id: 'solana-devnet',
    chainId: 999901,
    name: 'Solana Devnet',
    symbol: 'SOL',
    currency: 'SOL',
    icon: '🟣',
    color: '#14F195',
    isTestnet: true,
    explorer: 'https://explorer.solana.com/?cluster=devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    platformFee: 'FREE (Testnet)',
    isSolana: true
  }
];

// Default chain is Ethereum Mainnet (Chain ID: 1)
export const DEFAULT_CHAIN = SUPPORTED_CHAINS[0];
