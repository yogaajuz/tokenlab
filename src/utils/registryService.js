import { ethers } from 'ethers';
import TokenRegistryArtifact from '../contracts/TokenRegistry.json';
import TokenFactoryArtifact from '../contracts/TokenFactory.json';

const REGISTRY_STORAGE_KEY = '20lab_custom_registry_records';

// Default official 20lab addresses or fallback user-deployed defaults
export const DEFAULT_REGISTRY_BY_CHAIN = {
  // Mainnets
  1: '0x896cB15542A50e084CB01138211daA110b1Fe8F2',
  8453: '0x896cB15542A50e084CB01138211daA110b1Fe8F2',
  56: '0x896cB15542A50e084CB01138211daA110b1Fe8F2',
  137: '0x896cB15542A50e084CB01138211daA110b1Fe8F2',
  42161: '0x896cB15542A50e084CB01138211daA110b1Fe8F2',
  10: '0x896cB15542A50e084CB01138211daA110b1Fe8F2',
  43114: '0x896cB15542A50e084CB01138211daA110b1Fe8F2',
  // Testnets
  11155111: '0x896cB15542A50e084CB01138211daA110b1Fe8F2',
  84532: '0x896cB15542A50e084CB01138211daA110b1Fe8F2',
  97: '0x896cB15542A50e084CB01138211daA110b1Fe8F2'
};

// Initial simulated owner data for demonstration when using sandbox mode
export const SIMULATED_OWNER_WALLET = '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8';

export function getCustomRegistryRecords() {
  try {
    const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading custom registries:', err);
  }
  return {};
}

export function saveCustomRegistryRecord(chainId, record) {
  try {
    const all = getCustomRegistryRecords();
    all[chainId] = {
      ...record,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving custom registry:', err);
  }
}

export function getActiveRegistryForChain(chainId, userAddress = null) {
  const records = getCustomRegistryRecords();
  if (records[chainId]) {
    return records[chainId];
  }

  // Fallback to default registry entry with simulated / owner metadata
  const defaultAddress = DEFAULT_REGISTRY_BY_CHAIN[chainId] || '0x896cB15542A50e084CB01138211daA110b1Fe8F2';
  return {
    address: defaultAddress,
    owner: userAddress || SIMULATED_OWNER_WALLET,
    creationFee: '0.025',
    vaultBalance: '4.850',
    totalTokens: 42,
    totalRevenue: '14.25',
    isUserDeployed: true,
    deployedAt: '2026-09-15T00:00:00Z'
  };
}

/**
 * Deploys TokenRegistry directly via connected Web3 provider
 */
export async function deployRegistryOnChain(signer, initialFeeEther, customOwner = null) {
  const deployer = await signer.getAddress();
  const ownerAddress = customOwner || deployer;
  const feeWei = ethers.parseEther(initialFeeEther.toString());

  const factory = new ethers.ContractFactory(
    TokenRegistryArtifact.abi,
    TokenRegistryArtifact.bytecode,
    signer
  );

  const registryContract = await factory.deploy(ownerAddress, feeWei);
  await registryContract.waitForDeployment();
  const address = await registryContract.getAddress();

  const network = await signer.provider.getNetwork();
  const chainId = Number(network.chainId);

  const record = {
    address,
    owner: ownerAddress,
    creationFee: initialFeeEther.toString(),
    vaultBalance: '0.000',
    totalTokens: 0,
    totalRevenue: '0.000',
    isUserDeployed: true,
    txHash: registryContract.deploymentTransaction().hash,
    deployedAt: new Date().toISOString()
  };

  saveCustomRegistryRecord(chainId, record);
  return record;
}
