// Platform Fee & Treasury Configuration Service

const PLATFORM_FEE_KEY = 'tokenlab_platform_fee_config';

export const PLATFORM_TREASURY_WALLET = '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8';

export const DEFAULT_PLATFORM_CONFIG = {
  recipientWallet: PLATFORM_TREASURY_WALLET,
  creationFeeEth: '0.01',
  vaultBalance: '4.850',
  totalTokensCreated: 42,
  totalRevenueEth: '14.25',
  autoRouteToConnectedWallet: false
};

export function getPlatformFeeConfig() {
  try {
    const raw = localStorage.getItem(PLATFORM_FEE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure recipientWallet is permanently locked to PLATFORM_TREASURY_WALLET
      return { 
        ...DEFAULT_PLATFORM_CONFIG, 
        ...parsed, 
        recipientWallet: PLATFORM_TREASURY_WALLET 
      };
    }
  } catch (err) {
    console.error('Error reading platform fee config:', err);
  }
  return { ...DEFAULT_PLATFORM_CONFIG, recipientWallet: PLATFORM_TREASURY_WALLET };
}

export function savePlatformFeeConfig(config) {
  try {
    const current = getPlatformFeeConfig();
    // Enforce that recipientWallet can NEVER be changed from the official treasury address
    const updated = { 
      ...current, 
      ...config, 
      recipientWallet: PLATFORM_TREASURY_WALLET, 
      updatedAt: new Date().toISOString() 
    };
    localStorage.setItem(PLATFORM_FEE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving platform fee config:', err);
    return { ...config, recipientWallet: PLATFORM_TREASURY_WALLET };
  }
}

export function recordPlatformFeeCollection(feeAmountEth, tokenName, txHash) {
  try {
    const current = getPlatformFeeConfig();
    const feeNum = parseFloat(feeAmountEth) || 0.01;
    const currentVault = parseFloat(current.vaultBalance) || 0;
    const currentTotal = parseFloat(current.totalRevenueEth) || 0;
    
    const updated = {
      ...current,
      vaultBalance: (currentVault + feeNum).toFixed(4),
      totalRevenueEth: (currentTotal + feeNum).toFixed(4),
      totalTokensCreated: (current.totalTokensCreated || 0) + 1,
      lastCollection: {
        amount: feeNum,
        tokenName,
        txHash,
        timestamp: new Date().toISOString()
      }
    };
    localStorage.setItem(PLATFORM_FEE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error recording fee collection:', err);
    return getPlatformFeeConfig();
  }
}
