// Platform Fee & Treasury Configuration Service

const PLATFORM_FEE_KEY = 'tokenlab_platform_fee_config';

export const DEFAULT_PLATFORM_CONFIG = {
  recipientWallet: '0x71C836466DAB5465F83204C1E371C80f146C8493',
  creationFeeEth: '0.01',
  vaultBalance: '4.850',
  totalTokensCreated: 42,
  totalRevenueEth: '14.25',
  autoRouteToConnectedWallet: true
};

export function getPlatformFeeConfig() {
  try {
    const raw = localStorage.getItem(PLATFORM_FEE_KEY);
    if (raw) {
      return { ...DEFAULT_PLATFORM_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Error reading platform fee config:', err);
  }
  return { ...DEFAULT_PLATFORM_CONFIG };
}

export function savePlatformFeeConfig(config) {
  try {
    const current = getPlatformFeeConfig();
    const updated = { ...current, ...config, updatedAt: new Date().toISOString() };
    localStorage.setItem(PLATFORM_FEE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving platform fee config:', err);
    return config;
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
