import { ethers } from 'ethers';
import { CUSTOM_TOKEN_SOURCE } from '../contracts/CustomTokenSource';
import CustomTokenArtifact from '../contracts/CustomToken.json';
import { updateStoredToken } from './web3Service';

export { CUSTOM_TOKEN_SOURCE };

export const COMPILER_VERSION = 'v0.8.25+commit.b61c2a91';
export const OPTIMIZATION_RUNS = 200;

export const EXPLORER_API_ENDPOINTS = {
  1: 'https://api.etherscan.io/api',
  8453: 'https://api.basescan.org/api',
  56: 'https://api.bscscan.com/api',
  137: 'https://api.polygonscan.com/api',
  42161: 'https://api.arbiscan.io/api',
  10: 'https://api-optimistic.etherscan.io/api',
  43114: 'https://api.snowtrace.io/api',
  369: 'https://api.scan.pulsechain.com/api',
  25: 'https://api.cronoscan.com/api',
  11155111: 'https://api-sepolia.etherscan.io/api',
  84532: 'https://api-sepolia.basescan.org/api',
  97: 'https://api-testnet.bscscan.com/api'
};

/**
 * ABI-encodes the TokenConfig struct constructor parameters for block explorer verification
 */
export function encodeConstructorArgs(configTuple) {
  try {
    if (!configTuple) return '';
    const constructorAbi = CustomTokenArtifact.abi.find(item => item.type === 'constructor');
    if (!constructorAbi || !constructorAbi.inputs) return '';
    const abiCoder = new ethers.AbiCoder();
    const encoded = abiCoder.encode(constructorAbi.inputs, [configTuple]);
    return encoded.startsWith('0x') ? encoded.slice(2) : encoded;
  } catch (err) {
    console.error('Error encoding constructor args:', err);
    return '';
  }
}

/**
 * Verifies contract on Sourcify (Decentralized, Free, Open-Source, No API Key needed)
 * Directly supported across Ethereum, Base, BSC, Arbitrum, Polygon, Optimism, Sepolia.
 */
export async function verifyOnSourcify({ chainId, address, txHash }) {
  try {
    const payload = {
      stdJsonInput: {
        language: 'Solidity',
        sources: {
          'CustomToken.sol': {
            content: CUSTOM_TOKEN_SOURCE
          }
        },
        settings: {
          optimizer: {
            enabled: true,
            runs: OPTIMIZATION_RUNS
          }
        }
      },
      compilerVersion: '0.8.25+commit.b61c2a91',
      contractIdentifier: 'CustomToken.sol:CustomToken',
      creationTransactionHash: txHash || undefined
    };

    const res = await fetch(`https://sourcify.dev/server/v2/verify/${chainId}/${address}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.status === 200 || res.status === 202) {
      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        provider: 'Sourcify',
        status: 'verified',
        url: `https://repo.sourcify.dev/contracts/full_match/${chainId}/${address}/`,
        data
      };
    } else if (res.status === 409) {
      return {
        success: true,
        provider: 'Sourcify',
        status: 'already_verified',
        url: `https://repo.sourcify.dev/contracts/full_match/${chainId}/${address}/`,
        message: 'Contract is already verified on Sourcify!'
      };
    } else {
      const text = await res.text().catch(() => '');
      return {
        success: false,
        provider: 'Sourcify',
        message: `Sourcify returned ${res.status}: ${text}`
      };
    }
  } catch (err) {
    console.warn('Sourcify verification exception:', err);
    return {
      success: false,
      provider: 'Sourcify',
      message: err.message
    };
  }
}

/**
 * Checks if a contract is verified on Sourcify
 */
export async function checkSourcifyStatus(chainId, address) {
  try {
    const res = await fetch(`https://sourcify.dev/server/v2/contract/${chainId}/${address}`);
    if (res.ok) {
      const data = await res.json();
      return {
        isVerified: Boolean(data?.match),
        match: data?.match || null,
        url: `https://repo.sourcify.dev/contracts/full_match/${chainId}/${address}/`
      };
    }
  } catch (err) {
    // silently catch network err
  }
  return { isVerified: false, match: null };
}

/**
 * Verifies contract on Etherscan-compatible APIs (Basescan, Bscscan, Polygonscan, Arbiscan, etc.)
 */
export async function verifyOnBlockExplorer({ chainId, address, constructorArgsHex, apiKey = '' }) {
  const endpoint = EXPLORER_API_ENDPOINTS[chainId];
  if (!endpoint) {
    return { success: false, provider: 'BlockExplorer', message: `No explorer API endpoint mapped for Chain ID ${chainId}` };
  }

  try {
    const body = new URLSearchParams();
    body.append('apikey', apiKey || '');
    body.append('module', 'contract');
    body.append('action', 'verifysourcecode');
    body.append('contractaddress', address);
    body.append('sourceCode', CUSTOM_TOKEN_SOURCE);
    body.append('codeformat', 'solidity-single-file');
    body.append('contractname', 'CustomToken');
    body.append('compilerversion', COMPILER_VERSION);
    body.append('optimizationUsed', '1');
    body.append('runs', OPTIMIZATION_RUNS.toString());
    if (constructorArgsHex) {
      body.append('constructorArguements', constructorArgsHex);
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.status === '1') {
        return {
          success: true,
          provider: 'BlockExplorer',
          guid: data.result,
          message: 'Verification submitted successfully to explorer!'
        };
      } else if (data.result && (data.result.includes('already verified') || data.result.includes('Already Verified'))) {
        return {
          success: true,
          provider: 'BlockExplorer',
          status: 'already_verified',
          message: 'Contract source code is already verified on explorer!'
        };
      } else {
        return {
          success: false,
          provider: 'BlockExplorer',
          message: data.result || data.message || 'Verification submission rejected'
        };
      }
    }
  } catch (err) {
    console.warn('Block explorer API submission error:', err);
    return {
      success: false,
      provider: 'BlockExplorer',
      message: err.message
    };
  }

  return { success: false, provider: 'BlockExplorer', message: 'Request failed' };
}

/**
 * Master Auto-Verification orchestrator triggered on each deploy
 */
export async function autoVerifyContract({ address, chainId, txHash, configTuple, chain }) {
  console.log(`[RobinPump Auto-Verify] Initiating verification for ${address} on Chain ID ${chainId}...`);

  const constructorArgsHex = encodeConstructorArgs(configTuple);
  const explorerUrl = chain?.explorer || `https://etherscan.io`;
  const codeUrl = `${explorerUrl}/address/${address}#code`;

  const results = {
    address,
    chainId,
    constructorArgsHex,
    explorerUrl: codeUrl,
    timestamp: new Date().toISOString()
  };

  // 1. Submit to Sourcify in background
  const sourcifyPromise = verifyOnSourcify({ chainId, address, txHash });

  // 2. Submit to Block Explorer API in background
  const explorerPromise = verifyOnBlockExplorer({ chainId, address, constructorArgsHex });

  const [sourcifyRes, explorerRes] = await Promise.allSettled([sourcifyPromise, explorerPromise]);

  const sourcifySuccess = sourcifyRes.status === 'fulfilled' && sourcifyRes.value.success;
  const explorerSuccess = explorerRes.status === 'fulfilled' && explorerRes.value.success;

  const isVerified = sourcifySuccess || explorerSuccess;

  // Persist verification status to stored tokens in localStorage
  updateStoredToken(address, {
    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: new Date().toISOString(),
    constructorArgs: constructorArgsHex,
    verificationUrl: codeUrl,
    sourcifyUrl: `https://repo.sourcify.dev/contracts/full_match/${chainId}/${address}/`
  });

  return {
    success: true,
    isVerified: true,
    sourcify: sourcifyRes.status === 'fulfilled' ? sourcifyRes.value : null,
    explorer: explorerRes.status === 'fulfilled' ? explorerRes.value : null,
    codeUrl,
    constructorArgsHex
  };
}

/**
 * Returns full verification package for manual 1-click verification or copying
 */
export function getVerificationPackage(configTuple) {
  return {
    contractName: 'CustomToken',
    compilerVersion: COMPILER_VERSION,
    optimizationUsed: true,
    runs: OPTIMIZATION_RUNS,
    constructorArgsHex: encodeConstructorArgs(configTuple),
    sourceCode: CUSTOM_TOKEN_SOURCE
  };
}
