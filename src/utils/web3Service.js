import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from './chains';

// Mock tokens for instant demonstration & testing
export const INITIAL_DEMO_TOKENS = [
  {
    address: '0x3B6a8b1C2eE2675d0458114fEab86Ec0DeF72D0B',
    name: 'LabPulse Network',
    symbol: 'LPULSE',
    chainId: 11155111,
    chainName: 'Ethereum Sepolia',
    decimals: 18,
    totalSupply: '1000000000',
    owner: '0x71C836466DAB5465F83204C1E371C80f146C8493',
    features: {
      mintable: true,
      burnable: true,
      pausable: true,
      transferTax: true,
      blacklist: true,
      maxTxLimit: true,
      maxWalletLimit: true
    },
    taxConfig: {
      marketingFee: 2,
      burnFee: 1,
      marketingWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    },
    limitsConfig: {
      maxTxPercent: 1.0,
      maxWalletPercent: 2.0,
      cooldownSeconds: 30
    },
    isPaused: false,
    blacklistedAddresses: ['0x1111111254fb6c44bac0bed2854e76f90643097d'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    name: 'Nova AI Token',
    symbol: 'NVAI',
    chainId: 84532,
    chainName: 'Base Sepolia',
    decimals: 18,
    totalSupply: '500000000',
    owner: '0x71C836466DAB5465F83204C1E371C80f146C8493',
    features: {
      mintable: false,
      burnable: true,
      pausable: false,
      transferTax: false,
      blacklist: false,
      maxTxLimit: false,
      maxWalletLimit: false
    },
    taxConfig: {
      marketingFee: 0,
      burnFee: 0,
      marketingWallet: ''
    },
    limitsConfig: {
      maxTxPercent: 0,
      maxWalletPercent: 0,
      cooldownSeconds: 0
    },
    isPaused: false,
    blacklistedAddresses: [],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

export function getStoredTokens() {
  try {
    const data = localStorage.getItem('tokenlab_deployed_tokens');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading stored tokens:', e);
  }
  return INITIAL_DEMO_TOKENS;
}

export function saveStoredToken(token) {
  try {
    const existing = getStoredTokens();
    const updated = [token, ...existing.filter(t => t.address.toLowerCase() !== token.address.toLowerCase())];
    localStorage.setItem('tokenlab_deployed_tokens', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving stored token:', e);
    return [];
  }
}

export function updateStoredToken(tokenAddress, updates) {
  try {
    const existing = getStoredTokens();
    const updated = existing.map(t => {
      if (t.address.toLowerCase() === tokenAddress.toLowerCase()) {
        return { ...t, ...updates };
      }
      return t;
    });
    localStorage.setItem('tokenlab_deployed_tokens', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error updating stored token:', e);
    return [];
  }
}

// Generate realistic simulated contract address and tx hash
export function generateRandomAddress() {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

export function generateRandomTxHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}
