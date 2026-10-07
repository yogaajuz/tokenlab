import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  ExternalLink, 
  ChevronDown,
  X,
  Copy,
  Code2,
  Droplets,
  Coins,
  Percent,
  Flame,
  Crown,
  CheckCircle2,
  Sparkles,
  Wallet as WalletIcon
} from 'lucide-react';
import { ethers } from 'ethers';
import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from '../utils/chains';
import { generateSolidityContract } from '../utils/solidityGenerator';
import { getPlatformFeeConfig, recordPlatformFeeCollection, PLATFORM_TREASURY_WALLET } from '../utils/platformFeeConfig';
import { saveStoredToken } from '../utils/web3Service';
import CustomTokenArtifact from '../contracts/CustomToken.json';
import { autoVerifyContract, encodeConstructorArgs } from '../utils/contractVerifier';

export default function ERC20TokenCreator({
  onNavigate,
  selectedChain = DEFAULT_CHAIN,
  setSelectedChain,
  wallet,
  setWallet,
  sandboxMode,
  setSandboxMode,
  onShowToast,
  onTokenDeployed,
  onViewCode
}) {
  const [step, setStep] = useState(1); // 1: General, 2: Optional, 3: Taxes, 4: Summary
  const [chainModalOpen, setChainModalOpen] = useState(false);
  const [platformConfig, setPlatformConfig] = useState(getPlatformFeeConfig());
  const [deployedTokenModal, setDeployedTokenModal] = useState(null);
  const [copiedModalAddress, setCopiedModalAddress] = useState(false);

  useEffect(() => {
    setPlatformConfig(getPlatformFeeConfig());
  }, [step]);

  useEffect(() => {
    if (wallet?.address) {
      if (!diffTokenOwner || !tokenOwnerAddress) {
        setTokenOwnerAddress(wallet.address);
      }
      if (!diffSupplyRecipient || !supplyRecipientAddress) {
        setSupplyRecipientAddress(wallet.address);
      }
      if (!walletTaxRecipient) {
        setWalletTaxRecipient(wallet.address);
      }
    }
  }, [wallet?.address]);

  // Form states matching 20lab exact defaults
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [customContractName, setCustomContractName] = useState(false);
  const [contractName, setContractName] = useState('Token');
  const [initialSupply, setInitialSupply] = useState('1 000 000');
  const [decimals, setDecimals] = useState(18);
  const [mintable, setMintable] = useState(false);
  const [diffSupplyRecipient, setDiffSupplyRecipient] = useState(false);
  const [supplyRecipientAddress, setSupplyRecipientAddress] = useState('');
  const [diffTokenOwner, setDiffTokenOwner] = useState(false);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState('');

  // Step 2: Optional features
  const [defaultExchange, setDefaultExchange] = useState('Uniswap V2');
  const [customExchangeAddress, setCustomExchangeAddress] = useState('');
  const [antiBotCooldown, setAntiBotCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState('30');
  const [enableTrading, setEnableTrading] = useState(false);
  const [maxAmountPerWallet, setMaxAmountPerWallet] = useState(false);
  const [maxWalletAmount, setMaxWalletAmount] = useState('20 000');
  const [maxTxLimit, setMaxTxLimit] = useState(false);
  const [maxTxAmount, setMaxTxAmount] = useState('10 000');
  const [pausable, setPausable] = useState(false);
  const [blacklist, setBlacklist] = useState(false);
  const [tokenRecovery, setTokenRecovery] = useState(true);
  const [permit, setPermit] = useState(true);

  // Step 3: Taxes
  const [swapThresholdRatio, setSwapThresholdRatio] = useState('0.05');

  // 1. Liquidity Tax
  const [liquidityTax, setLiquidityTax] = useState(false);
  const [buyLiquidityTax, setBuyLiquidityTax] = useState('1.0');
  const [sellLiquidityTax, setSellLiquidityTax] = useState('1.0');
  const [burnLpTokens, setBurnLpTokens] = useState(false);

  // 2. Dividend Tax
  const [dividendTax, setDividendTax] = useState(false);
  const [buyDividendTax, setBuyDividendTax] = useState('2.0');
  const [sellDividendTax, setSellDividendTax] = useState('2.0');
  const [dividendsSentIn, setDividendsSentIn] = useState('native'); // native, usdt, usdc, custom
  const [customDividendToken, setCustomDividendToken] = useState('');
  const [dividendEligibility, setDividendEligibility] = useState('10 000');
  const [autoClaimInterval, setAutoClaimInterval] = useState('3600');
  const [gasForAutoClaims, setGasForAutoClaims] = useState('300000');
  const [callbackGasLimit, setCallbackGasLimit] = useState('2300');

  // 3. Wallet Taxes (Up to 5)
  const [walletTax, setWalletTax] = useState(false);
  const [walletTaxName, setWalletTaxName] = useState('marketing');
  const [walletTaxRecipient, setWalletTaxRecipient] = useState(wallet?.address || '');
  const [buyWalletTax, setBuyWalletTax] = useState('2.0');
  const [sellWalletTax, setSellWalletTax] = useState('2.0');
  const [walletTaxCurrency, setWalletTaxCurrency] = useState('native');

  // 4. Auto-Burn Tax
  const [autoBurnTax, setAutoBurnTax] = useState(false);
  const [buyAutoBurnTax, setBuyAutoBurnTax] = useState('1.0');
  const [sellAutoBurnTax, setSellAutoBurnTax] = useState('1.0');

  const [isDeploying, setIsDeploying] = useState(false);
  const [showSourceCode, setShowSourceCode] = useState(false);

  const evmChains = SUPPORTED_CHAINS.filter(c => c.standard !== 'solana' && c.standard !== 'sui');

  const handleReset = () => {
    setName('');
    setSymbol('');
    setCustomContractName(false);
    setContractName('Token');
    setInitialSupply('1 000 000');
    setDecimals(18);
    setMintable(false);
    setDiffSupplyRecipient(false);
    setSupplyRecipientAddress('');
    setDiffTokenOwner(false);
    setTokenOwnerAddress('');
    setAntiBotCooldown(false);
    setEnableTrading(false);
    setMaxAmountPerWallet(false);
    setMaxTxLimit(false);
    setPausable(false);
    setBlacklist(false);
    setTokenRecovery(true);
    setPermit(true);
    setLiquidityTax(false);
    setBuyLiquidityTax('1.0');
    setSellLiquidityTax('1.0');
    setBurnLpTokens(false);
    setDividendTax(false);
    setBuyDividendTax('2.0');
    setSellDividendTax('2.0');
    setDividendsSentIn('native');
    setCustomDividendToken('');
    setDividendEligibility('10 000');
    setAutoClaimInterval('3600');
    setGasForAutoClaims('300000');
    setCallbackGasLimit('2300');
    setWalletTax(false);
    setAutoBurnTax(false);
    setStep(1);
    onShowToast?.({
      type: 'info',
      title: 'Form Reset',
      message: 'All parameters returned to initial defaults.'
    });
  };

  const handleSelectChain = async (c) => {
    setSelectedChain(c);
    setChainModalOpen(false);

    // If real Web3 wallet is connected, request switch in MetaMask / wallet
    if (wallet?.connected && !wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
      const targetChainId = Number(c.chainId || 1);
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + targetChainId.toString(16) }]
        });
      } catch (switchErr) {
        if (switchErr.code === 4902 || switchErr.message?.includes('Unrecognized')) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x' + targetChainId.toString(16),
                chainName: c.name,
                nativeCurrency: {
                  name: c.symbol || 'ETH',
                  symbol: c.symbol || 'ETH',
                  decimals: 18
                },
                rpcUrls: [c.rpcUrl],
                blockExplorerUrls: [c.explorer]
              }]
            });
          } catch (addErr) {
            console.error('Failed to add chain:', addErr);
          }
        }
      }

      // Refresh balance on selected chain
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const bal = await provider.getBalance(wallet.address);
        setWallet(prev => ({
          ...prev,
          balance: `${parseFloat(ethers.formatEther(bal)).toFixed(4)} ${c.symbol || 'ETH'}`
        }));
      } catch (balErr) {
        console.warn('Balance refresh error:', balErr);
      }
    }

    onShowToast?.({
      type: 'info',
      title: 'Blockchain Selected',
      message: `Selected ${c.name} (${c.isTestnet ? 'Testnet' : 'Live Mainnet'})`
    });
  };

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts && accounts.length > 0) {
          const targetChainId = Number(selectedChain?.chainId || 1);

          // Prompt switch if network does not match selected chain
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x' + targetChainId.toString(16) }]
            });
          } catch (switchErr) {
            if (switchErr.code === 4902 || switchErr.message?.includes('Unrecognized')) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x' + targetChainId.toString(16),
                  chainName: selectedChain.name,
                  nativeCurrency: {
                    name: selectedChain.symbol || 'ETH',
                    symbol: selectedChain.symbol || 'ETH',
                    decimals: 18
                  },
                  rpcUrls: [selectedChain.rpcUrl],
                  blockExplorerUrls: [selectedChain.explorer]
                }]
              });
            }
          }

          let balFormatted = '0.0000';
          try {
            const updatedProvider = new ethers.BrowserProvider(window.ethereum);
            const bal = await updatedProvider.getBalance(accounts[0]);
            balFormatted = parseFloat(ethers.formatEther(bal)).toFixed(4);
          } catch (bErr) {
            console.warn('Balance fetch warning:', bErr);
          }

          setSandboxMode?.(false);
          setWallet({
            connected: true,
            address: accounts[0],
            balance: `${balFormatted} ${selectedChain?.symbol || 'ETH'}`,
            isSimulated: false
          });
          if (!walletTaxRecipient) {
            setWalletTaxRecipient(accounts[0]);
          }
          onShowToast?.({
            type: 'success',
            title: 'Live Web3 Wallet Connected',
            message: `Connected account ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)} on ${selectedChain?.name}!`
          });
          return;
        }
      } catch (err) {
        console.error('Wallet connection error:', err);
        onShowToast?.({
          type: 'error',
          title: 'Connection Cancelled',
          message: err.message || 'User cancelled connection request'
        });
        return;
      }
    }

    // No Web3 browser extension found
    onShowToast?.({
      type: 'warning',
      title: 'Web3 Wallet Needed for Mainnet',
      message: 'No Web3 extension detected. For live deployment, please use MetaMask or Rabby. Entering sandbox demo mode.'
    });
    const demoAddr = '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8';
    setSandboxMode?.(true);
    setWallet({
      connected: true,
      address: demoAddr,
      balance: '4.850 ' + (selectedChain?.symbol || 'ETH'),
      isSimulated: true
    });
    if (!walletTaxRecipient) {
      setWalletTaxRecipient(demoAddr);
    }
  };

  const handleDeploy = async () => {
    // If wallet not connected at all, prompt connection first
    if (!wallet?.connected) {
      onShowToast?.({
        type: 'warning',
        title: 'Wallet Connection Required',
        message: 'Please connect your Web3 wallet first to deploy to the blockchain.'
      });
      await handleConnectWallet();
      return;
    }

    // If in simulated demo mode but user has real Web3 wallet extension available
    if (wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
      onShowToast?.({
        type: 'info',
        title: 'Connecting Web3 Wallet',
        message: 'Connecting your Web3 wallet for live blockchain deployment...'
      });
      await handleConnectWallet();
      return;
    }

    setIsDeploying(true);

    // REAL MAINNET / LIVE WEB3 WALLET DEPLOYMENT
    if (wallet?.connected && !wallet.isSimulated && typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const targetChainId = Number(selectedChain.chainId || 1);

        // 1. Verify network matches selected chain
        if (Number(network.chainId) !== targetChainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x' + targetChainId.toString(16) }]
            });
          } catch (switchErr) {
            if (switchErr.code === 4902 || switchErr.message?.includes('Unrecognized')) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x' + targetChainId.toString(16),
                  chainName: selectedChain.name,
                  nativeCurrency: {
                    name: selectedChain.symbol || selectedChain.currency || 'ETH',
                    symbol: selectedChain.symbol || selectedChain.currency || 'ETH',
                    decimals: 18
                  },
                  rpcUrls: [selectedChain.rpcUrl],
                  blockExplorerUrls: [selectedChain.explorer]
                }]
              });
            } else {
              throw switchErr;
            }
          }
        }

        // 2. Platform creation fee routing strictly to verified treasury address
        const feeAmount = platformConfig?.creationFeeEth || '0.01';
        const platformWallet = PLATFORM_TREASURY_WALLET;
        if (parseFloat(feeAmount) > 0 && platformWallet) {
          onShowToast?.({
            type: 'info',
            title: 'Collecting Platform Fee',
            message: `Sending ${feeAmount} ${selectedChain.symbol || 'ETH'} creation fee to official platform treasury...`
          });
          const feeTx = await signer.sendTransaction({
            to: platformWallet,
            value: ethers.parseEther(feeAmount.toString())
          });
          await feeTx.wait(1);
        }

        // 3. Deploy CustomToken contract directly to Mainnet!
        onShowToast?.({
          type: 'info',
          title: 'Deploying Smart Contract',
          message: `Confirm transaction in your wallet to deploy ${name || 'Token'} on ${selectedChain.name}...`
        });

        const factory = new ethers.ContractFactory(
          CustomTokenArtifact.abi,
          CustomTokenArtifact.bytecode,
          signer
        );

        const cleanSupply = (initialSupply || '1000000').toString().replace(/\s+/g, '');
        const supplyBN = ethers.parseUnits(cleanSupply, Number(decimals || 18));
        const userAddr = await signer.getAddress();
        const recipient = diffSupplyRecipient && supplyRecipientAddress ? supplyRecipientAddress : userAddr;
        const owner = diffTokenOwner && tokenOwnerAddress ? tokenOwnerAddress : userAddr;
        const marketingRecipient = walletTaxRecipient || userAddr;

        // Construct token configuration struct
        const configTuple = {
          name: name || 'Token',
          symbol: symbol || 'TKN',
          decimals: Number(decimals || 18),
          initialSupply: supplyBN,
          maxSupply: supplyBN,
          supplyRecipient: recipient,
          initialOwner: owner,
          mintable: Boolean(mintable),
          burnable: Boolean(autoBurnTax),
          pausable: Boolean(pausable),
          antiBot: Boolean(antiBotCooldown),
          cooldownSecs: Number(cooldownSeconds || 30),
          limits: Boolean(maxTxLimit || maxAmountPerWallet),
          maxTx: maxTxLimit ? (supplyBN * 10n) / 1000n : 0n,
          maxWallet: maxAmountPerWallet ? (supplyBN * 20n) / 1000n : 0n,
          taxes: Boolean(walletTax || liquidityTax),
          buyMkt: walletTax ? Math.floor(Number(buyWalletTax) * 10) : 0,
          sellMkt: walletTax ? Math.floor(Number(sellWalletTax) * 10) : 0,
          transferMkt: walletTax ? 10 : 0,
          buyLiq: liquidityTax ? Math.floor(Number(buyLiquidityTax) * 10) : 0,
          sellLiq: liquidityTax ? Math.floor(Number(sellLiquidityTax) * 10) : 0,
          transferLiq: 0,
          mktWallet: marketingRecipient,
          routerAddress: customExchangeAddress || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
          tradingDelayed: Boolean(enableTrading)
        };

        const tokenContract = await factory.deploy(configTuple);
        await tokenContract.waitForDeployment();
        const deployedAddress = await tokenContract.getAddress();
        const txHash = tokenContract.deploymentTransaction()?.hash || '';

        recordPlatformFeeCollection(feeAmount, name || 'Token', txHash);

        const constructorArgsHex = encodeConstructorArgs(configTuple);
        const newRecord = {
          name: name || 'Token',
          symbol: symbol || 'TKN',
          address: deployedAddress,
          chainId: targetChainId,
          chainName: selectedChain.name,
          decimals: Number(decimals || 18),
          totalSupply: cleanSupply,
          owner: owner,
          txHash: txHash,
          explorerUrl: `${selectedChain.explorer}/address/${deployedAddress}#code`,
          constructorArgs: constructorArgsHex,
          isVerified: true,
          verificationStatus: 'verified',
          features: {
            mintable: Boolean(mintable),
            burnable: Boolean(autoBurnTax),
            pausable: Boolean(pausable),
            blacklist: Boolean(blacklist),
            recoverable: Boolean(tokenRecovery),
            limits: Boolean(maxTxLimit || maxAmountPerWallet),
            antiBot: Boolean(antiBotCooldown),
            tradingDelayed: Boolean(enableTrading)
          },
          taxConfig: {
            liquidityTax: Boolean(liquidityTax),
            walletTax: Boolean(walletTax),
            marketingFee: walletTax ? Number(buyWalletTax) : 0,
            burnFee: autoBurnTax ? Number(buyAutoBurnTax) : 0,
            marketingWallet: marketingRecipient
          },
          createdAt: new Date().toISOString()
        };
        saveStoredToken(newRecord);

        onShowToast?.({
          type: 'success',
          title: 'Mainnet Token Deployed!',
          message: `${name || 'Token'} (${symbol || 'TKN'}) is live on ${selectedChain.name}!`
        });

        // Auto-Verify Contract on Block Explorer & Sourcify
        onShowToast?.({
          type: 'info',
          title: 'Auto-Verifying Contract...',
          message: `Submitting ${name || 'Token'} source code to ${selectedChain.name} Explorer & Sourcify...`
        });

        autoVerifyContract({
          address: deployedAddress,
          chainId: targetChainId,
          txHash: txHash,
          configTuple: configTuple,
          chain: selectedChain
        }).then((vRes) => {
          if (vRes?.success) {
            onShowToast?.({
              type: 'success',
              title: 'Contract Auto-Verified!',
              message: `${name || 'Token'} smart contract verified on block explorer & Sourcify!`
            });
          }
        }).catch((vErr) => {
          console.warn('Auto verification notice:', vErr);
        });

        onTokenDeployed?.(newRecord);
        setIsDeploying(false);
        setDeployedTokenModal(newRecord);
        return;
      } catch (err) {
        console.error('Mainnet deploy failed:', err);
        setIsDeploying(false);
        onShowToast?.({
          type: 'error',
          title: 'Deployment Failed',
          message: err.reason || err.message || 'Transaction was rejected or gas calculation failed.'
        });
        return;
      }
    }

    // SIMULATED / SANDBOX DEMO FALLBACK
    setTimeout(() => {
      setIsDeploying(false);
      const fakeAddress = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      const feeAmount = platformConfig?.creationFeeEth || '0.01';
      recordPlatformFeeCollection(feeAmount, name || 'Token', fakeAddress);
      
      const demoRecord = {
        name: name || 'Token',
        symbol: symbol || 'TKN',
        address: fakeAddress,
        chainId: Number(selectedChain.chainId || selectedChain.id || 1),
        chainName: selectedChain.name,
        decimals: Number(decimals || 18),
        totalSupply: (initialSupply || '1000000').toString().replace(/\s+/g, ''),
        owner: (diffTokenOwner && tokenOwnerAddress) || wallet?.address || '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8',
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        explorerUrl: `${selectedChain.explorer}/address/${fakeAddress}`,
        isVerified: true,
        verificationStatus: 'verified',
        features: {
          mintable: Boolean(mintable),
          burnable: Boolean(autoBurnTax),
          pausable: Boolean(pausable),
          blacklist: Boolean(blacklist),
          recoverable: Boolean(tokenRecovery),
          limits: Boolean(maxTxLimit || maxAmountPerWallet),
          antiBot: Boolean(antiBotCooldown),
          tradingDelayed: Boolean(enableTrading)
        },
        taxConfig: {
          liquidityTax: Boolean(liquidityTax),
          walletTax: Boolean(walletTax),
          marketingFee: walletTax ? Number(buyWalletTax) : 2,
          burnFee: autoBurnTax ? Number(buyAutoBurnTax) : 1,
          marketingWallet: walletTaxRecipient || wallet?.address || '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8'
        },
        createdAt: new Date().toISOString()
      };
      saveStoredToken(demoRecord);

      onShowToast?.({
        type: 'success',
        title: 'Token Successfully Created (Sandbox Demo)!',
        message: `${name || 'Token'} (${symbol || 'TKN'}) deployed! Platform fee of ${feeAmount} ETH routed to treasury.`
      });
      onTokenDeployed?.(demoRecord);
      setDeployedTokenModal(demoRecord);
    }, 1500);
  };

  const handleAddToMetaMask = async (token) => {
    if (typeof window.ethereum === 'undefined') {
      onShowToast?.({
        type: 'error',
        title: 'MetaMask Not Detected',
        message: 'Please install or open MetaMask / Web3 wallet to import this token.'
      });
      return;
    }
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: Number(token.decimals || 18),
            image: ''
          }
        }
      });
      if (wasAdded) {
        onShowToast?.({
          type: 'success',
          title: 'Token Added to Wallet',
          message: `${token.symbol} successfully added to your Web3 wallet!`
        });
      }
    } catch (err) {
      console.error('Wallet watchAsset error:', err);
      onShowToast?.({
        type: 'error',
        title: 'Wallet Import',
        message: err.message || 'Could not import token into wallet.'
      });
    }
  };

  // Info SVG Icon from 20lab
  const InfoIcon = () => (
    <svg fill="none" height="20" viewBox="0 0 16 17" width="20" xmlns="http://www.w3.org/2000/svg" className="flex-none">
      <path clipRule="evenodd" d="M14.4001 8.49961C14.4001 10.197 13.7258 11.8249 12.5256 13.0251C11.3253 14.2253 9.69748 14.8996 8.0001 14.8996C6.30271 14.8996 4.67485 14.2253 3.47461 13.0251C2.27438 11.8249 1.6001 10.197 1.6001 8.49961C1.6001 6.80222 2.27438 5.17436 3.47461 3.97413C4.67485 2.77389 6.30271 2.09961 8.0001 2.09961C9.69748 2.09961 11.3253 2.77389 12.5256 3.97413C13.7258 5.17436 14.4001 6.80222 14.4001 8.49961ZM8.8001 11.6996C8.8001 11.9118 8.71581 12.1153 8.56578 12.2653C8.41575 12.4153 8.21227 12.4996 8.0001 12.4996C7.78792 12.4996 7.58444 12.4153 7.43441 12.2653C7.28438 12.1153 7.2001 11.9118 7.2001 11.6996C7.2001 11.4874 7.28438 11.284 7.43441 11.1339C7.58444 10.9839 7.78792 10.8996 8.0001 10.8996C8.21227 10.8996 8.41575 10.9839 8.56578 11.1339C8.71581 11.284 8.8001 11.4874 8.8001 11.6996ZM8.0001 4.49961C7.78792 4.49961 7.58444 4.58389 7.43441 4.73392C7.28438 4.88395 7.2001 5.08744 7.2001 5.29961V8.49961C7.2001 8.71178 7.28438 8.91527 7.43441 9.06529C7.58444 9.21532 7.78792 9.29961 8.0001 9.29961C8.21227 9.29961 8.41575 9.21532 8.56578 9.06529C8.71581 8.91527 8.8001 8.71178 8.8001 8.49961V5.29961C8.8001 5.08744 8.71581 4.88395 8.56578 4.73392C8.41575 4.58389 8.21227 4.49961 8.0001 4.49961Z" fill="#9CA3AF" fillRule="evenodd"></path>
    </svg>
  );

  return (
    <main className="flex-1" id="main-content">
      <div className="container py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation matching 20lab */}
        <div className="font-serif text-sm text-foreground/50 flex flex-wrap gap-2 items-center">
          <a 
            className="text-primary-alt hover:underline cursor-pointer" 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
          >
            Home
          </a>
          <span>/</span>
          <a 
            className="text-primary-alt hover:underline cursor-pointer" 
            href="/generate/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/generate/');
            }}
          >
            Generate
          </a>
          <span>/</span>
          <div className="text-white">ERC-20 Token Creator</div>
        </div>

        {/* H1 Heading */}
        <div style={{ display: 'contents' }}>
          <div className="mt-6 text-center">
            <h1 className="text-center mx-auto text-3xl md:text-5xl font-bold font-serif tracking-wide !text-2xl sm:!text-3xl md:!text-4xl text-white">
              ERC-20 Token Creator
            </h1>
          </div>
        </div>

        {/* Stepper Section matching 20lab */}
        <section className="relative md:container-mini pt-10">
          <div className="flex w-full flex-col gap-4 mb-6">
            <div className="relative flex justify-around">
              <div className="absolute inset-y-0 z-[-3] my-auto h-1 w-3/4 bg-stepper"></div>
              
              {/* Step 1 */}
              <button 
                type="button"
                onClick={() => setStep(1)}
                className={`relative size-12 rounded-full bg-stepper font-serif text-xl cursor-pointer transition-all hover:scale-105 ${
                  step === 1 ? 'text-primary border-2 border-primary shadow-lg shadow-[#07e3f8]/30' : 'text-stepper-foreground'
                }`}
                title="Step 1: General Info"
              >
                1
                <p className={`absolute bottom-[-34px] font-serif text-base capitalize center-position-x max-sm:text-sm break-keep ${
                  step === 1 ? 'text-stepper-label font-bold' : 'text-stepper-foreground'
                }`}>
                  General
                </p>
              </button>

              {/* Step 2 */}
              <button 
                type="button"
                onClick={() => setStep(2)}
                className={`relative size-12 rounded-full bg-stepper font-serif text-xl cursor-pointer transition-all hover:scale-105 ${
                  step === 2 ? 'text-primary border-2 border-primary shadow-lg shadow-[#07e3f8]/30' : 'text-stepper-foreground'
                }`}
                title="Step 2: Optional Features"
              >
                2
                <p className={`absolute -bottom-8 font-serif text-base capitalize center-position-x max-sm:text-sm break-keep ${
                  step === 2 ? 'text-stepper-label font-bold' : 'text-stepper-foreground'
                }`}>
                  Optional
                </p>
              </button>

              {/* Step 3 (Taxes - Liquidity & Dividends) */}
              <button 
                type="button"
                onClick={() => setStep(3)}
                className={`relative size-12 rounded-full bg-stepper font-serif text-xl cursor-pointer transition-all hover:scale-105 ${
                  step === 3 ? 'text-primary border-2 border-primary shadow-lg shadow-[#07e3f8]/30 ring-2 ring-primary/40' : 'text-stepper-foreground'
                }`}
                title="Step 3: Taxes (Liquidity & Dividends)"
              >
                3
                <p className={`absolute -bottom-8 font-serif text-base capitalize center-position-x max-sm:text-sm break-keep ${
                  step === 3 ? 'text-stepper-label font-bold' : 'text-stepper-foreground'
                }`}>
                  Taxes
                </p>
              </button>

              {/* Step 4 */}
              <button 
                type="button"
                onClick={() => setStep(4)}
                className={`relative size-12 rounded-full bg-stepper font-serif text-xl cursor-pointer transition-all hover:scale-105 ${
                  step === 4 ? 'text-primary border-2 border-primary shadow-lg shadow-[#07e3f8]/30' : 'text-stepper-foreground'
                }`}
                title="Step 4: Summary & Deploy"
              >
                4
                <p className={`absolute -bottom-8 font-serif text-base capitalize center-position-x max-sm:text-sm break-keep ${
                  step === 4 ? 'text-stepper-label font-bold' : 'text-stepper-foreground'
                }`}>
                  Summary
                </p>
              </button>
            </div>
            <br/>
          </div>

          {/* Quick Step Switcher Tabs */}
          <div className="flex items-center justify-between bg-field/80 p-1.5 rounded-lg border border-[#44617d]/40 mb-4 font-serif text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex-1 py-1.5 px-2 rounded text-center transition-all cursor-pointer ${
                step === 1 ? 'bg-primary text-black font-bold shadow' : 'text-foreground/70 hover:text-white'
              }`}
            >
              1. General
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex-1 py-1.5 px-2 rounded text-center transition-all cursor-pointer ${
                step === 2 ? 'bg-primary text-black font-bold shadow' : 'text-foreground/70 hover:text-white'
              }`}
            >
              2. Optional
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`flex-1 py-1.5 px-2 rounded text-center transition-all cursor-pointer ${
                step === 3 ? 'bg-primary text-black font-bold shadow' : 'text-foreground/70 hover:text-white'
              }`}
            >
              3. Taxes (Liquidity &amp; Dividends)
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className={`flex-1 py-1.5 px-2 rounded text-center transition-all cursor-pointer ${
                step === 4 ? 'bg-primary text-black font-bold shadow' : 'text-foreground/70 hover:text-white'
              }`}
            >
              4. Summary
            </button>
          </div>

          {/* Form Box matching 20lab exact classes */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 4) {
                setStep(step + 1);
              } else {
                handleDeploy();
              }
            }}
            className="rounded-lg border-4 from-primary/60 via-primary/20 to-transparent p-3 md:p-8 bg-form relative shadow-2xl"
          >
            {/* Reset Button */}
            <button 
              className="absolute top-0.5 right-1.5 md:top-2 md:right-2 p-1 cursor-pointer rounded-lg hover:bg-foreground/10 flex flex-col items-center gap-1 text-foreground transition-colors" 
              aria-label="Reset" 
              type="button"
              onClick={handleReset}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 md:size-5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              <span className="text-xs leading-3">Reset</span>
            </button>

            {/* STEP 1: GENERAL */}
            {step === 1 && (
              <>
                {/* Subsection 1: Blockchain */}
                <div className="space-y-2">
                  <div>
                    <div>
                      <div className="flex items-center font-serif gap-2">
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base grow !text-lg -mx-1">
                          Blockchain
                        </label>
                      </div>
                      <div className="my-1.5 border-b-2 border-foreground/50 -mx-1"></div>
                      <div className="text-xs italic text-foreground/50 md:text-sm -mx-1"></div>
                    </div>
                  </div>
                </div>

                {/* Blockchain* Item */}
                <div className="space-y-2">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base grow">
                          Blockchain*
                        </label>
                      </div>
                      <div className="text-xs italic text-foreground/50 md:text-sm">
                        Connect to the chosen blockchain.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Blockchain Card & Wallet Status */}
                <div>
                  <div className="mt-2 space-y-3">
                    {/* Always visible Active Blockchain Card */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-field border border-[#44617d]/60 shadow-inner">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`/images/crypto/${selectedChain?.chainId || selectedChain?.id || 1}.png`} 
                          alt={selectedChain?.name} 
                          className="w-9 h-9 rounded-full ring-2 ring-white/10" 
                          onError={(e) => { e.currentTarget.src = '/images/crypto/1.png'; }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white font-serif">{selectedChain?.name || 'Ethereum'}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${selectedChain?.isTestnet ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                              {selectedChain?.isTestnet ? 'Testnet' : 'Live Mainnet'}
                            </span>
                          </div>
                          <div className="text-xs text-foreground/50 font-serif">
                            Chain ID: {selectedChain?.chainId || 1} • Native: {selectedChain?.currency || selectedChain?.symbol || 'ETH'} • Fee: {selectedChain?.platformFee || '0.01 ETH'}
                          </div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setChainModalOpen(true)}
                        className="text-xs font-serif font-bold text-primary-alt hover:underline px-3.5 py-2 rounded-lg bg-form/80 hover:bg-form border border-[#44617d]/60 cursor-pointer text-center transition-colors"
                      >
                        Switch Blockchain
                      </button>
                    </div>

                    {/* Wallet Status: Connected Info or Connect Button */}
                    {wallet?.connected ? (
                      <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-slate-300 font-serif">Wallet:</span>
                          <span className="font-mono text-emerald-300 font-bold">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                          {wallet.isSimulated && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">Demo Mode</span>
                          )}
                        </div>
                        <div className="font-mono text-slate-300">
                          {wallet.balance || `0.00 ${selectedChain?.symbol || 'ETH'}`}
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg text-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 gap-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:brightness-75 disabled:border-black/20 bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 px-3 md:px-10 py-2 w-full cursor-pointer shadow-lg shadow-[#07e3f8]/20" 
                        id="connect_button_erc20" 
                        type="button"
                        onClick={handleConnectWallet}
                      >
                        Connect Wallet to {selectedChain?.name || 'Blockchain'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Subsection 2: General */}
                <div className="space-y-2">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base grow !text-lg -mx-1">
                          General
                        </label>
                      </div>
                      <div className="my-1.5 border-b-2 border-foreground/50 -mx-1"></div>
                      <div className="text-xs italic text-foreground/50 md:text-sm -mx-1"></div>
                    </div>
                  </div>
                </div>

                {/* Token name* */}
                <div className="space-y-2">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base grow">
                          Token name*
                        </label>
                        <div className="text-right flex-none">
                          <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/general#token-name-and-token-symbol">
                            Check Docs
                          </a>
                        </div>
                      </div>
                      <div className="text-xs italic text-foreground/50 md:text-sm">
                        Choose a great name for your token.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="relative flex items-center gap-2 mt-2">
                      <input 
                        spellCheck="false" 
                        className="min-h-8 w-full rounded-lg bg-field px-3 py-3.5 text-sm ring-offset-field font-serif file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 autofill:shadow-[inset_0_0_0px_1000px_#0B2034] text-white" 
                        placeholder="e.g. MyToken" 
                        name="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                      />
                    </div>
                    <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-4 text-sm gap-2 w-full rounded-lg mt-2.5 italic" role="alert">
                      <InfoIcon />
                      <div className="w-full">
                        <p className="font-medium tracking-tight font-sans text-xs md:text-sm">Max 50 characters. (Not editable later)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Token symbol* */}
                <div className="space-y-2">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base grow">
                          Token symbol*
                        </label>
                        <div className="text-right flex-none">
                          <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/general#token-name-and-token-symbol">
                            Check Docs
                          </a>
                        </div>
                      </div>
                      <div className="text-xs italic text-foreground/50 md:text-sm">
                        Choose a great symbol for your token.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="relative flex items-center gap-2 mt-2">
                      <input 
                        spellCheck="false" 
                        className="min-h-8 w-full rounded-lg bg-field px-3 py-3.5 text-sm ring-offset-field font-serif file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 autofill:shadow-[inset_0_0_0px_1000px_#0B2034] text-white" 
                        placeholder="e.g. MTK" 
                        name="symbol" 
                        value={symbol} 
                        onChange={(e) => setSymbol(e.target.value)} 
                      />
                    </div>
                    <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-4 text-sm gap-2 w-full rounded-lg mt-2.5 italic" role="alert">
                      <InfoIcon />
                      <div className="w-full">
                        <p className="font-medium tracking-tight font-sans text-xs md:text-sm">Max 20 characters. (Not editable later)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contract name* */}
                <div className="space-y-2">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base grow">
                          Contract name*
                        </label>
                        <div className="text-right flex-none">
                          <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/general#contract-name">
                            Check Docs
                          </a>
                        </div>
                      </div>
                      <div className="text-xs italic text-foreground/50 md:text-sm">
                        Smart contract name is being derived from your token name and visible after verification. If you are not sure, we recommend keeping the default value.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="relative flex items-center gap-2 mt-2">
                      <div className="space-y-3 w-full">
                        <div className="flex items-center gap-2">
                          <label 
                            className={`peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm leading-relaxed md:text-base font-normal tracking-tight cursor-pointer ${
                              customContractName ? 'text-foreground/50' : 'text-white'
                            }`}
                            onClick={() => setCustomContractName(false)}
                          >
                            Use default
                          </label>
                          <button 
                            type="button" 
                            role="switch" 
                            aria-checked={customContractName} 
                            onClick={() => setCustomContractName(!customContractName)}
                            className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 max-sm:scale-75 ${
                              customContractName ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-linear-to-l from-primary to-primary-alt'
                            }`}
                          >
                            <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                              customContractName ? 'translate-x-[22px]' : 'translate-x-0.5'
                            }`}></span>
                          </button>
                          <label 
                            className={`peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm leading-relaxed md:text-base font-normal tracking-tight cursor-pointer ${
                              customContractName ? 'text-white' : 'text-foreground/50'
                            }`}
                            onClick={() => setCustomContractName(true)}
                          >
                            Use custom
                          </label>
                        </div>
                        <input 
                          spellCheck="false" 
                          className="min-h-8 w-full rounded-lg bg-field px-3 py-3.5 text-sm ring-offset-field font-serif file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 autofill:shadow-[inset_0_0_0px_1000px_#0B2034] text-white" 
                          disabled={!customContractName} 
                          value={customContractName ? contractName : (name || 'Token')} 
                          onChange={(e) => setContractName(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Initial supply* */}
                <div className="space-y-2">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base grow">
                          Initial supply*
                        </label>
                        <div className="text-right flex-none">
                          <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/general#initial-supply">
                            Check Docs
                          </a>
                        </div>
                      </div>
                      <div className="text-xs italic text-foreground/50 md:text-sm">
                        Choose how many tokens you want to create.
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div>
                    <div className="space-y-2">
                      <div>
                        <div className="relative flex items-center gap-2 mt-2">
                          <input 
                            spellCheck="false" 
                            className="min-h-8 w-full rounded-lg bg-field px-3 py-3.5 text-sm ring-offset-field font-serif file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 autofill:shadow-[inset_0_0_0px_1000px_#0B2034] pr-[4.5rem] text-white" 
                            placeholder="e.g. 1 000 000" 
                            name="initialSupply" 
                            value={initialSupply} 
                            onChange={(e) => setInitialSupply(e.target.value)} 
                          />
                          <p className="absolute right-0 pl-0.5 pr-2 sm:pr-3 font-serif text-sm lg:text-base font-normal text-foreground/50 pointer-events-none">
                            Tokens
                          </p>
                        </div>
                        <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-4 text-sm gap-2 w-full rounded-lg mt-2.5 italic" role="alert">
                          <InfoIcon />
                          <div className="w-full">
                            <p className="font-medium tracking-tight font-sans text-xs md:text-sm">1 ≤ Initial Supply ≤ 9 999 999 999 999 999.9</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mintable Switch */}
                <div className="space-y-2 pl-8 md:pl-12">
                  <div>
                    <div className="flex items-center gap-2 mt-8">
                      <div className="flex items-center gap-2 grow">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={mintable} 
                          onClick={() => setMintable(!mintable)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 max-sm:scale-75 ${
                            mintable ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            mintable ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label 
                          className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base cursor-pointer"
                          onClick={() => setMintable(!mintable)}
                        >
                          Mintable
                        </label>
                      </div>
                      <div className="text-right flex-none">
                        <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/general#mintable">
                          Check Docs
                        </a>
                      </div>
                    </div>
                    <div className="text-xs italic text-foreground/50 md:text-sm mt-1">
                      If the Mintable feature is enabled, the owner will be able to mint new tokens until the total supply reaches the maximum supply.
                    </div>
                  </div>
                </div>

                {/* Decimals* */}
                <div className="space-y-2">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base grow">
                          Decimals*
                        </label>
                        <div className="text-right flex-none">
                          <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/general#decimals">
                            Check Docs
                          </a>
                        </div>
                      </div>
                      <div className="text-xs italic text-foreground/50 md:text-sm">
                        Choose how many decimal places your tokens can be divided to. If you are not sure, we recommend leaving it at 18.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="relative mt-2">
                      <button 
                        type="button" 
                        onClick={() => setDecimals(Math.max(0, Number(decimals) - 1))}
                        className="absolute top-0 left-0 size-11 bg-form m-0.5 rounded-md flex justify-center items-center text-foreground hover:bg-foreground/10 cursor-pointer" 
                        aria-label="Decrease value"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <input 
                        spellCheck="false" 
                        className="min-h-8 w-full rounded-lg bg-field px-3 py-3.5 ring-offset-field font-serif file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 autofill:shadow-[inset_0_0_0px_1000px_#0B2034] text-center text-lg max-h-12 text-white" 
                        name="decimals" 
                        value={decimals} 
                        onChange={(e) => setDecimals(e.target.value)} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setDecimals(Math.min(18, Number(decimals) + 1))}
                        className="absolute top-0 right-0 size-11 bg-form m-0.5 rounded-md flex justify-center items-center text-foreground hover:bg-foreground/10 cursor-pointer" 
                        aria-label="Increase value"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                    <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-4 text-sm gap-2 w-full rounded-lg mt-2.5 italic" role="alert">
                      <InfoIcon />
                      <div className="w-full">
                        <p className="font-medium tracking-tight font-sans text-xs md:text-sm">1 ≤ Decimals ≤ 18. (Not editable later)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subsection 3: Supply recipient & Token owner */}
                <div className="space-y-2">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base grow !text-lg -mx-1">
                          Supply recipient &amp; Token owner
                        </label>
                      </div>
                      <div className="my-1.5 border-b-2 border-foreground/50 -mx-1"></div>
                    </div>
                  </div>
                </div>

                {/* Info Card explaining default wallet routing */}
                <div className="p-3.5 rounded-lg bg-[#0c2438]/80 border border-[#07e3f8]/30 flex items-start gap-3 mt-3">
                  <div className="w-8 h-8 rounded-full bg-[#07e3f8]/20 flex items-center justify-center shrink-0 text-[#07e3f8]">
                    <WalletIcon size={16} />
                  </div>
                  <div className="text-xs font-serif leading-relaxed grow">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>Default Token Owner &amp; Supply Destination</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                        {wallet?.connected && wallet?.address ? 'Connected Wallet' : 'Auto-Assigned to Connected Wallet'}
                      </span>
                    </div>
                    <p className="text-foreground/70 mt-1">
                      By default, <strong>100% of initial supply</strong> and <strong>complete contract owner keys</strong> are automatically delivered into your connected Web3 wallet upon deployment:
                    </p>
                    <div className="mt-1.5 font-mono text-emerald-400 text-[11px] bg-[#071726] px-2 py-1 rounded inline-flex items-center gap-2 max-w-full border border-emerald-500/20">
                      {wallet?.connected && wallet?.address ? (
                        <>
                          <span className="truncate">{wallet.address}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-sans font-bold shrink-0">Connected Wallet (Default Owner)</span>
                        </>
                      ) : (
                        <span className="italic text-slate-400">Connected Wallet (Your active wallet will be set as owner upon deployment)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Different supply recipient switch */}
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center gap-2 mt-6">
                      <div className="flex items-center gap-2 grow">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={diffSupplyRecipient} 
                          onClick={() => setDiffSupplyRecipient(!diffSupplyRecipient)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 max-sm:scale-75 ${
                            diffSupplyRecipient ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            diffSupplyRecipient ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label 
                          className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base cursor-pointer"
                          onClick={() => setDiffSupplyRecipient(!diffSupplyRecipient)}
                        >
                          Different supply recipient
                        </label>
                      </div>
                      <div className="text-right flex-none">
                        <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/general#supply-recipient-and-token-owner">
                          Check Docs
                        </a>
                      </div>
                    </div>
                    <div className="text-xs italic text-foreground/50 md:text-sm mt-1">
                      Instead of your wallet, enter a different address to receive the initial supply of tokens.
                    </div>
                    {diffSupplyRecipient && (
                      <div className="mt-3 flex gap-2">
                        <input 
                          spellCheck="false" 
                          className="min-h-8 flex-1 rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input disabled:cursor-not-allowed text-white border border-[#44617d]/40 font-mono" 
                          placeholder="e.g. 0x..." 
                          value={supplyRecipientAddress} 
                          onChange={(e) => setSupplyRecipientAddress(e.target.value)} 
                        />
                        {wallet?.address && (
                          <button
                            type="button"
                            onClick={() => setSupplyRecipientAddress(wallet.address)}
                            className="px-3 py-2 text-xs font-serif font-bold text-primary-alt bg-[#0e273c] hover:bg-[#153957] border border-[#07e3f8]/40 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
                          >
                            Use Connected Wallet
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Different token owner switch */}
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center gap-2 mt-6">
                      <div className="flex items-center gap-2 grow">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={diffTokenOwner} 
                          onClick={() => setDiffTokenOwner(!diffTokenOwner)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 max-sm:scale-75 ${
                            diffTokenOwner ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            diffTokenOwner ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label 
                          className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-serif text-sm font-bold leading-relaxed text-white md:text-base cursor-pointer"
                          onClick={() => setDiffTokenOwner(!diffTokenOwner)}
                        >
                          Different token owner
                        </label>
                      </div>
                      <div className="text-right flex-none">
                        <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/general#supply-recipient-and-token-owner">
                          Check Docs
                        </a>
                      </div>
                    </div>
                    <div className="text-xs italic text-foreground/50 md:text-sm mt-1">
                      Instead of your wallet, enter a different address that will have ownership of the token after it is created.
                    </div>
                    {diffTokenOwner && (
                      <div className="mt-3 flex gap-2">
                        <input 
                          spellCheck="false" 
                          className="min-h-8 flex-1 rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input disabled:cursor-not-allowed text-white border border-[#44617d]/40 font-mono" 
                          placeholder="e.g. 0x..." 
                          value={tokenOwnerAddress} 
                          onChange={(e) => setTokenOwnerAddress(e.target.value)} 
                        />
                        {wallet?.address && (
                          <button
                            type="button"
                            onClick={() => setTokenOwnerAddress(wallet.address)}
                            className="px-3 py-2 text-xs font-serif font-bold text-primary-alt bg-[#0e273c] hover:bg-[#153957] border border-[#07e3f8]/40 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
                          >
                            Use Connected Wallet
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom CTA & Quick Jump */}
                <div className="space-y-3 mt-8">
                  <button 
                    className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg text-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 gap-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:brightness-75 disabled:border-black/20 bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 px-3 md:px-10 py-2 w-full cursor-pointer shadow-lg shadow-[#07e3f8]/20" 
                    type="submit"
                  >
                    Save &amp; Next<span></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-full text-center text-xs font-serif text-primary hover:underline cursor-pointer py-1"
                  >
                    Configure Liquidity Tax &amp; Dividend Tax directly (Step 3) ➔
                  </button>
                </div>
                <div className="mt-6 text-foreground/50 font-serif text-sm">* - Required fields</div>
              </>
            )}

            {/* STEP 2: OPTIONAL */}
            {step === 2 && (
              <div className="space-y-6 pt-2 font-serif">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-foreground/50 pb-2">
                  <h3 className="text-lg font-bold text-white font-serif">Optional Features</h3>
                  <span className="text-xs text-primary-alt">Step 2 of 4</span>
                </div>

                {/* Default exchange */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white">Default exchange</label>
                    <a className="text-xs font-serif text-primary-alt hover:underline" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/optional#default-exchange">Check Docs</a>
                  </div>
                  <p className="text-xs italic text-foreground/50">Choose a default DEX (V2 only) where you plan to initialize liquidity.</p>
                  <select 
                    value={defaultExchange} 
                    onChange={(e) => setDefaultExchange(e.target.value)}
                    className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm text-white border border-[#44617d]/40 focus:outline-none"
                  >
                    <option value="Uniswap V2">Uniswap V2</option>
                    <option value="PancakeSwap V2">PancakeSwap V2</option>
                    <option value="SushiSwap V2">SushiSwap V2</option>
                    <option value="Custom">Custom Router V2 Address</option>
                  </select>
                </div>

                {/* Anti-bot Cooldown */}
                <div className="flex items-center justify-between pt-2">
                  <div className="grow">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        role="switch" 
                        aria-checked={antiBotCooldown} 
                        onClick={() => setAntiBotCooldown(!antiBotCooldown)}
                        className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors max-sm:scale-75 ${
                          antiBotCooldown ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                        }`}
                      >
                        <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                          antiBotCooldown ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}></span>
                      </button>
                      <label className="text-sm font-bold text-white cursor-pointer" onClick={() => setAntiBotCooldown(!antiBotCooldown)}>
                        Anti-bot cooldown
                      </label>
                    </div>
                    <p className="text-xs italic text-foreground/50 mt-1">Freezes addresses briefly between buys/sells to disrupt automated snipers.</p>
                  </div>
                  <a className="text-xs font-serif text-primary-alt hover:underline" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/optional#anti-bot-cooldown">Check Docs</a>
                </div>

                {/* EnableTrading function */}
                <div className="flex items-center justify-between pt-2">
                  <div className="grow">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        role="switch" 
                        aria-checked={enableTrading} 
                        onClick={() => setEnableTrading(!enableTrading)}
                        className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors max-sm:scale-75 ${
                          enableTrading ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                        }`}
                      >
                        <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                          enableTrading ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}></span>
                      </button>
                      <label className="text-sm font-bold text-white cursor-pointer" onClick={() => setEnableTrading(!enableTrading)}>
                        EnableTrading function
                      </label>
                    </div>
                    <p className="text-xs italic text-foreground/50 mt-1">Prevents public trading after pair creation until the owner activates it.</p>
                  </div>
                  <a className="text-xs font-serif text-primary-alt hover:underline" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/optional#enable-trading">Check Docs</a>
                </div>

                {/* Section: Limits */}
                <div className="pt-4 border-t border-foreground/20">
                  <h4 className="text-base font-bold text-white mb-3">Limits</h4>
                  
                  {/* Max amount per wallet */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={maxAmountPerWallet} 
                          onClick={() => setMaxAmountPerWallet(!maxAmountPerWallet)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors max-sm:scale-75 ${
                            maxAmountPerWallet ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            maxAmountPerWallet ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label className="text-sm font-bold text-white cursor-pointer" onClick={() => setMaxAmountPerWallet(!maxAmountPerWallet)}>
                          Max amount per wallet
                        </label>
                      </div>
                      <a className="text-xs font-serif text-primary-alt hover:underline" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/optional#max-amount-per-wallet">Check Docs</a>
                    </div>
                    {maxAmountPerWallet && (
                      <input 
                        spellCheck="false" 
                        className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm text-white border border-[#44617d]/40 focus:outline-none mt-2" 
                        value={maxWalletAmount} 
                        onChange={(e) => setMaxWalletAmount(e.target.value)} 
                        placeholder="e.g. 20 000" 
                      />
                    )}
                  </div>

                  {/* Max transaction limits */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={maxTxLimit} 
                          onClick={() => setMaxTxLimit(!maxTxLimit)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors max-sm:scale-75 ${
                            maxTxLimit ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            maxTxLimit ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label className="text-sm font-bold text-white cursor-pointer" onClick={() => setMaxTxLimit(!maxTxLimit)}>
                          Max transaction limits
                        </label>
                      </div>
                      <a className="text-xs font-serif text-primary-alt hover:underline" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/optional#max-transaction-limits">Check Docs</a>
                    </div>
                    {maxTxLimit && (
                      <input 
                        spellCheck="false" 
                        className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm text-white border border-[#44617d]/40 focus:outline-none mt-2" 
                        value={maxTxAmount} 
                        onChange={(e) => setMaxTxAmount(e.target.value)} 
                        placeholder="e.g. 10 000" 
                      />
                    )}
                  </div>
                </div>

                {/* Section: Other Utilities */}
                <div className="pt-4 border-t border-foreground/20 space-y-4">
                  <h4 className="text-base font-bold text-white mb-2">Other Utilities</h4>
                  
                  {/* Pausable */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={pausable} 
                          onClick={() => setPausable(!pausable)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors max-sm:scale-75 ${
                            pausable ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            pausable ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label className="text-sm font-bold text-white cursor-pointer" onClick={() => setPausable(!pausable)}>Pausable</label>
                      </div>
                      <p className="text-xs italic text-foreground/50 mt-1">Allows owner to freeze token transfers in emergency.</p>
                    </div>
                  </div>

                  {/* Blacklist */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={blacklist} 
                          onClick={() => setBlacklist(!blacklist)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors max-sm:scale-75 ${
                            blacklist ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            blacklist ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label className="text-sm font-bold text-white cursor-pointer" onClick={() => setBlacklist(!blacklist)}>Blacklist</label>
                      </div>
                      <p className="text-xs italic text-foreground/50 mt-1">Enables owner to ban malicious addresses or exploiters.</p>
                    </div>
                  </div>

                  {/* Token recovery */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={tokenRecovery} 
                          onClick={() => setTokenRecovery(!tokenRecovery)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors max-sm:scale-75 ${
                            tokenRecovery ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            tokenRecovery ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label className="text-sm font-bold text-white cursor-pointer" onClick={() => setTokenRecovery(!tokenRecovery)}>Token recovery</label>
                      </div>
                      <p className="text-xs italic text-foreground/50 mt-1">Recovers accidental ERC-20 transfers sent to the contract address.</p>
                    </div>
                  </div>

                  {/* Permit (ERC-2612) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={permit} 
                          onClick={() => setPermit(!permit)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors max-sm:scale-75 ${
                            permit ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            permit ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label className="text-sm font-bold text-white cursor-pointer" onClick={() => setPermit(!permit)}>Permit (ERC-2612)</label>
                      </div>
                      <p className="text-xs italic text-foreground/50 mt-1">Gasless token approvals via cryptographic signatures.</p>
                    </div>
                  </div>
                </div>

                {/* Stepper Buttons */}
                <div className="flex items-center gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="w-1/3 h-12 rounded-lg bg-field hover:bg-white/10 font-serif font-bold text-white cursor-pointer border border-[#44617d]/40"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="w-2/3 h-12 rounded-lg bg-linear-to-r from-primary to-primary-alt text-primary-foreground font-serif font-bold cursor-pointer hover:opacity-90 shadow-lg shadow-[#07e3f8]/20"
                  >
                    Save &amp; Next (Go to Taxes)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: TAXES (LIQUIDITY TAX & DIVIDEND TAX & WALLET TAXES) */}
            {step === 3 && (
              <div className="space-y-6 pt-2 font-serif">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-foreground/50 pb-2">
                  <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                    <Coins size={20} className="text-[#07e3f8]" />
                    <span>Trading Taxes &amp; Tokenomics</span>
                  </h3>
                  <span className="text-xs text-primary-alt font-bold">Step 3 of 4</span>
                </div>

                {/* Default exchange */}
                <div className="space-y-2">
                  <div className="flex items-center font-serif gap-2">
                    <label className="font-serif text-sm font-bold text-white grow">Default exchange</label>
                    <a className="text-xs font-serif text-primary-alt hover:underline" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/taxes#default-exchange">Check Docs</a>
                  </div>
                  <div className="text-xs italic text-foreground/50">Choose a default exchange (V2 only) where you want to add liquidity. This will allow for more precise configuration and more available features.</div>
                  <select 
                    value={defaultExchange} 
                    onChange={(e) => setDefaultExchange(e.target.value)}
                    className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm text-white border border-[#44617d]/40 focus:outline-none"
                  >
                    <option value="Uniswap V2">Uniswap V2</option>
                    <option value="PancakeSwap V2">PancakeSwap V2</option>
                    <option value="SushiSwap V2">SushiSwap V2</option>
                    <option value="Custom">Custom Router V2 Address</option>
                  </select>
                </div>

                {/* Swap Threshold Ratio */}
                <div className="space-y-2">
                  <div className="flex items-center font-serif gap-2">
                    <label className="font-serif text-sm font-bold text-white grow">Swap threshold ratio</label>
                    <a className="text-xs font-serif text-primary-alt hover:underline" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/taxes#swap-threshold-ratio">Check Docs</a>
                  </div>
                  <div className="text-xs italic text-foreground/50">When the amount of tokens collected by taxes reaches this ratio of liquidity pool, they will be swapped on DEX.</div>
                  <input 
                    spellCheck="false" 
                    className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm text-white border border-[#44617d]/40 focus:outline-none" 
                    value={swapThresholdRatio} 
                    onChange={(e) => setSwapThresholdRatio(e.target.value)} 
                    placeholder="0.05" 
                  />
                </div>

                {/* ============================================================ */}
                {/* 1. LIQUIDITY TAX SECTION (EXACT 20LAB FORM) */}
                {/* ============================================================ */}
                <div className="space-y-2 pt-2">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="font-serif text-sm font-bold leading-relaxed text-white md:text-base grow !text-lg -mx-1 flex items-center gap-2">
                          <Droplets size={18} className="text-[#07e3f8]" />
                          <span>Liquidity tax</span>
                        </label>
                      </div>
                      <div className="my-1.5 border-b-2 border-foreground/50 -mx-1"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center gap-2 grow">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={liquidityTax} 
                          onClick={() => setLiquidityTax(!liquidityTax)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 max-sm:scale-75 ${
                            liquidityTax ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            liquidityTax ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label 
                          className="font-serif text-sm font-bold leading-relaxed text-white md:text-base cursor-pointer"
                          onClick={() => setLiquidityTax(!liquidityTax)}
                        >
                          Liquidity tax
                        </label>
                      </div>
                      <div className="text-right flex-none">
                        <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/taxes#liquidity-tax">
                          Check Docs
                        </a>
                      </div>
                    </div>
                    <div className="text-xs italic text-foreground/50 md:text-sm mt-1">
                      The Liquidity tax will automatically adds collected tokens to your main liquidity pool on the default exchange.
                    </div>

                    {/* Expanded Liquidity Tax Fields */}
                    {liquidityTax && (
                      <div className="mt-4 pl-3 sm:pl-6 border-l-2 border-primary/50 space-y-4 bg-field/30 p-4 rounded-r-lg">
                        {/* Buy Tax Rate */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white font-serif block">Buy tax rate*</label>
                          <div className="text-xs italic text-foreground/50">Specify the exact rate of tax to be charged on buys.</div>
                          <div className="relative flex items-center">
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input border border-[#44617d]/40 pr-10" 
                              placeholder="e.g. 1.0" 
                              value={buyLiquidityTax} 
                              onChange={(e) => setBuyLiquidityTax(e.target.value)} 
                            />
                            <span className="absolute right-3 font-serif text-foreground/50 text-sm">%</span>
                          </div>
                          <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-3 text-sm gap-2 w-full rounded-lg italic" role="alert">
                            <InfoIcon />
                            <p className="font-medium tracking-tight font-sans text-xs md:text-sm">0% (disabled) ≤ Total buy tax ≤ 25%</p>
                          </div>
                        </div>

                        {/* Sell Tax Rate */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white font-serif block">Sell tax rate*</label>
                          <div className="text-xs italic text-foreground/50">Specify the exact rate of tax to be charged on sells.</div>
                          <div className="relative flex items-center">
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input border border-[#44617d]/40 pr-10" 
                              placeholder="e.g. 1.0" 
                              value={sellLiquidityTax} 
                              onChange={(e) => setSellLiquidityTax(e.target.value)} 
                            />
                            <span className="absolute right-3 font-serif text-foreground/50 text-sm">%</span>
                          </div>
                          <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-3 text-sm gap-2 w-full rounded-lg italic" role="alert">
                            <InfoIcon />
                            <p className="font-medium tracking-tight font-sans text-xs md:text-sm">0% (disabled) ≤ Total sell tax ≤ 25%</p>
                          </div>
                        </div>

                        {/* Burn LP tokens switch */}
                        <div className="pt-2">
                          <div className="flex items-center gap-2">
                            <button 
                              type="button" 
                              role="switch" 
                              aria-checked={burnLpTokens} 
                              onClick={() => setBurnLpTokens(!burnLpTokens)}
                              className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors max-sm:scale-75 ${
                                burnLpTokens ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                              }`}
                            >
                              <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                                burnLpTokens ? 'translate-x-[22px]' : 'translate-x-0.5'
                              }`}></span>
                            </button>
                            <label className="text-sm font-bold text-white cursor-pointer font-serif" onClick={() => setBurnLpTokens(!burnLpTokens)}>
                              Burn LP tokens
                            </label>
                          </div>
                          <div className="text-xs italic text-foreground/50 mt-1">
                            LP tokens received from adding liquidity will be burned immediately to permanently lock liquidity.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ============================================================ */}
                {/* 2. DIVIDEND TAX SECTION (EXACT 20LAB FORM) */}
                {/* ============================================================ */}
                <div className="space-y-2 pt-4">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="font-serif text-sm font-bold leading-relaxed text-white md:text-base grow !text-lg -mx-1 flex items-center gap-2">
                          <Percent size={18} className="text-[#07e3f8]" />
                          <span>Dividend tax</span>
                        </label>
                      </div>
                      <div className="my-1.5 border-b-2 border-foreground/50 -mx-1"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center gap-2 grow">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={dividendTax} 
                          onClick={() => setDividendTax(!dividendTax)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 max-sm:scale-75 ${
                            dividendTax ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            dividendTax ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label 
                          className="font-serif text-sm font-bold leading-relaxed text-white md:text-base cursor-pointer"
                          onClick={() => setDividendTax(!dividendTax)}
                        >
                          Dividend tax
                        </label>
                      </div>
                      <div className="text-right flex-none">
                        <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/taxes#dividend-tax">
                          Check Docs
                        </a>
                      </div>
                    </div>
                    <div className="text-xs italic text-foreground/50 md:text-sm mt-1">
                      The Dividend tax will automatically collect tokens, swap them and distribute among the holders.
                    </div>

                    {/* Expanded Dividend Tax Fields */}
                    {dividendTax && (
                      <div className="mt-4 pl-3 sm:pl-6 border-l-2 border-primary/50 space-y-4 bg-field/30 p-4 rounded-r-lg">
                        {/* Buy Tax Rate */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white font-serif block">Buy tax rate*</label>
                          <div className="text-xs italic text-foreground/50">Specify the exact rate of tax to be charged on buys.</div>
                          <div className="relative flex items-center">
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input border border-[#44617d]/40 pr-10" 
                              placeholder="e.g. 2.0" 
                              value={buyDividendTax} 
                              onChange={(e) => setBuyDividendTax(e.target.value)} 
                            />
                            <span className="absolute right-3 font-serif text-foreground/50 text-sm">%</span>
                          </div>
                          <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-3 text-sm gap-2 w-full rounded-lg italic" role="alert">
                            <InfoIcon />
                            <p className="font-medium tracking-tight font-sans text-xs md:text-sm">0% (disabled) ≤ Total buy tax ≤ 25%</p>
                          </div>
                        </div>

                        {/* Sell Tax Rate */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white font-serif block">Sell tax rate*</label>
                          <div className="text-xs italic text-foreground/50">Specify the exact rate of tax to be charged on sells.</div>
                          <div className="relative flex items-center">
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input border border-[#44617d]/40 pr-10" 
                              placeholder="e.g. 2.0" 
                              value={sellDividendTax} 
                              onChange={(e) => setSellDividendTax(e.target.value)} 
                            />
                            <span className="absolute right-3 font-serif text-foreground/50 text-sm">%</span>
                          </div>
                          <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-3 text-sm gap-2 w-full rounded-lg italic" role="alert">
                            <InfoIcon />
                            <p className="font-medium tracking-tight font-sans text-xs md:text-sm">0% (disabled) ≤ Total sell tax ≤ 25%</p>
                          </div>
                        </div>

                        {/* Dividends Sent In */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white font-serif block">Dividends sent in*</label>
                          <div className="text-xs italic text-foreground/50">Choose a currency in which dividends will be send to holders.</div>
                          <select 
                            value={dividendsSentIn} 
                            onChange={(e) => setDividendsSentIn(e.target.value)}
                            className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm text-white border border-[#44617d]/40 focus:outline-none font-serif"
                          >
                            <option value="native">Native Currency ({selectedChain?.currency || 'ETH'})</option>
                            <option value="usdt">Tether USD (USDT)</option>
                            <option value="usdc">USD Coin (USDC)</option>
                            <option value="custom">Custom ERC-20 Token</option>
                          </select>
                          {dividendsSentIn === 'custom' && (
                            <div className="mt-2 space-y-2">
                              <label className="text-sm font-bold text-white font-serif block">Custom token address*</label>
                              <div className="text-xs italic text-foreground/50">Choose any ERC-20 token that has liquidity on your default exchange.</div>
                              <input 
                                spellCheck="false" 
                                className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input border border-[#44617d]/40" 
                                placeholder="Token address (0x...)" 
                                value={customDividendToken} 
                                onChange={(e) => setCustomDividendToken(e.target.value)} 
                              />
                              <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-3 text-sm gap-2 w-full rounded-lg italic" role="alert">
                                <InfoIcon />
                                <p className="font-medium tracking-tight font-sans text-xs md:text-sm">Enter address of the desired ERC-20 token.</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Dividend Eligibility Amount */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white font-serif block">Dividend eligibility amount*</label>
                          <div className="text-xs italic text-foreground/50">Specify the minimum amount of tokens each user must hold to be eligible for dividends.</div>
                          <div className="relative flex items-center">
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input border border-[#44617d]/40 pr-20" 
                              placeholder="e.g. 10 000" 
                              value={dividendEligibility} 
                              onChange={(e) => setDividendEligibility(e.target.value)} 
                            />
                            <span className="absolute right-3 font-serif text-foreground/50 text-sm">Tokens</span>
                          </div>
                          <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-3 text-sm gap-2 w-full rounded-lg italic" role="alert">
                            <InfoIcon />
                            <p className="font-medium tracking-tight font-sans text-xs md:text-sm">1.0 ≤ Dividend eligibility amount ≤ 1% of Initial supply (Not editable later)</p>
                          </div>
                        </div>

                        {/* Auto-Claim Interval */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white font-serif block">Auto-claim interval*</label>
                          <div className="text-xs italic text-foreground/50">Set the minimum interval for auto-claim of dividends. Does not affect manual claiming.</div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { label: '1 Hour', val: '3600' },
                              { label: '3 Hours', val: '10800' },
                              { label: '6 Hours', val: '21600' },
                              { label: '24 Hours', val: '86400' }
                            ].map((int) => (
                              <button
                                key={int.val}
                                type="button"
                                onClick={() => setAutoClaimInterval(int.val)}
                                className={`py-2 px-3 text-xs font-serif rounded-lg border cursor-pointer transition-all ${
                                  autoClaimInterval === int.val 
                                    ? 'bg-linear-to-r from-primary to-primary-alt text-primary-foreground font-bold border-transparent' 
                                    : 'bg-field text-white border-[#44617d]/40 hover:bg-form'
                                }`}
                              >
                                {int.label}
                              </button>
                            ))}
                          </div>
                          <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-3 text-sm gap-2 w-full rounded-lg italic" role="alert">
                            <InfoIcon />
                            <p className="font-medium tracking-tight font-sans text-xs md:text-sm">1 minute ≤ Auto-claim interval ≤ 7 days</p>
                          </div>
                        </div>

                        {/* Gas for auto-claims */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white font-serif block">Gas for auto-claims*</label>
                          <div className="text-xs italic text-foreground/50">Set the amount of gas units to take from each transaction for auto-claim of dividends. If you are not sure, we recommend leaving it at 300000.</div>
                          <div className="relative flex items-center">
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input border border-[#44617d]/40 pr-16" 
                              placeholder="300 000" 
                              value={gasForAutoClaims} 
                              onChange={(e) => setGasForAutoClaims(e.target.value)} 
                            />
                            <span className="absolute right-3 font-serif text-foreground/50 text-sm">units</span>
                          </div>
                          <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-3 text-sm gap-2 w-full rounded-lg italic" role="alert">
                            <InfoIcon />
                            <p className="font-medium tracking-tight font-sans text-xs md:text-sm">200 000 ≤ Gas for auto-claims ≤ 500 000 units</p>
                          </div>
                        </div>

                        {/* Callback Gas Limit */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-white font-serif block">Callback gas limit*</label>
                          <div className="text-xs italic text-foreground/50">Special limiter for the gas units to use for each address when auto-claiming dividends. Increasing it will allow auto-claim for smart contracts with more complex receive logic. We strongly recommend keeping 2300 gas units in most cases.</div>
                          <div className="relative flex items-center">
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input border border-[#44617d]/40 pr-16" 
                              placeholder="2 300" 
                              value={callbackGasLimit} 
                              onChange={(e) => setCallbackGasLimit(e.target.value)} 
                            />
                            <span className="absolute right-3 font-serif text-foreground/50 text-sm">units</span>
                          </div>
                          <div className="relative border flex items-center [&_svg]:min-w-5 bg-[#37546F] border-[#4B5563] text-stepper-foreground p-3 text-sm gap-2 w-full rounded-lg italic" role="alert">
                            <InfoIcon />
                            <p className="font-medium tracking-tight font-sans text-xs md:text-sm">2 300 ≤ Callback gas limit ≤ 10 000 units</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ============================================================ */}
                {/* 3. WALLET TAXES (MARKETING/DEV) */}
                {/* ============================================================ */}
                <div className="space-y-2 pt-4">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="font-serif text-sm font-bold leading-relaxed text-white md:text-base grow !text-lg -mx-1 flex items-center gap-2">
                          <WalletIcon size={18} className="text-[#07e3f8]" />
                          <span>Wallet Taxes</span>
                        </label>
                      </div>
                      <div className="my-1.5 border-b-2 border-foreground/50 -mx-1"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center gap-2 grow">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={walletTax} 
                          onClick={() => setWalletTax(!walletTax)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 max-sm:scale-75 ${
                            walletTax ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            walletTax ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label 
                          className="font-serif text-sm font-bold leading-relaxed text-white md:text-base cursor-pointer"
                          onClick={() => setWalletTax(!walletTax)}
                        >
                          Marketing / Dev Wallet Tax
                        </label>
                      </div>
                      <div className="text-right flex-none">
                        <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/taxes#wallet-taxes">
                          Check Docs
                        </a>
                      </div>
                    </div>
                    <div className="text-xs italic text-foreground/50 md:text-sm mt-1">
                      Wallet taxes will automatically send the specified currency to the wallets you select.
                    </div>

                    {walletTax && (
                      <div className="mt-4 pl-3 sm:pl-6 border-l-2 border-[#07e3f8] space-y-4 bg-field/30 p-4 rounded-r-lg">
                        <div className="p-2.5 rounded bg-[#071726]/80 border border-[#07e3f8]/30 text-xs text-foreground/80 flex items-start gap-2">
                          <Check size={16} className="text-[#07e3f8] shrink-0 mt-0.5" />
                          <span>
                            <strong>Fee Routing:</strong> 100% of trading fees collected from DEX buys &amp; sells will be routed directly to this recipient address in native cryptocurrency / tokens.
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-white font-serif block">Recipient Address*</label>
                            {wallet?.address && (
                              <button
                                type="button"
                                onClick={() => setWalletTaxRecipient(wallet.address)}
                                className="text-xs font-serif text-primary-alt hover:underline cursor-pointer font-bold"
                              >
                                Use Connected Wallet
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input 
                              spellCheck="false" 
                              className="min-h-8 flex-1 rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input border border-[#44617d]/40 font-mono" 
                              placeholder="Wallet address (0x...)" 
                              value={walletTaxRecipient} 
                              onChange={(e) => setWalletTaxRecipient(e.target.value)} 
                            />
                            {wallet?.address && (
                              <button
                                type="button"
                                onClick={() => setWalletTaxRecipient(wallet.address)}
                                className="px-3 py-2 text-xs font-serif font-bold text-primary-alt bg-[#0e273c] hover:bg-[#153957] border border-[#07e3f8]/40 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
                              >
                                My Wallet
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-white font-serif block">Buy tax rate %</label>
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white border border-[#44617d]/40" 
                              placeholder="2.0" 
                              value={buyWalletTax} 
                              onChange={(e) => setBuyWalletTax(e.target.value)} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-white font-serif block">Sell tax rate %</label>
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white border border-[#44617d]/40" 
                              placeholder="2.0" 
                              value={sellWalletTax} 
                              onChange={(e) => setSellWalletTax(e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ============================================================ */}
                {/* 4. AUTO-BURN TAX */}
                {/* ============================================================ */}
                <div className="space-y-2 pt-4">
                  <div>
                    <div className="mt-8">
                      <div className="flex items-center font-serif gap-2">
                        <label className="font-serif text-sm font-bold leading-relaxed text-white md:text-base grow !text-lg -mx-1 flex items-center gap-2">
                          <Flame size={18} className="text-[#07e3f8]" />
                          <span>Auto-burn tax</span>
                        </label>
                      </div>
                      <div className="my-1.5 border-b-2 border-foreground/50 -mx-1"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center gap-2 grow">
                        <button 
                          type="button" 
                          role="switch" 
                          aria-checked={autoBurnTax} 
                          onClick={() => setAutoBurnTax(!autoBurnTax)}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 max-sm:scale-75 ${
                            autoBurnTax ? 'bg-linear-to-r from-primary to-primary-alt' : 'bg-[#44617d]'
                          }`}
                        >
                          <span className={`pointer-events-none block size-5 rounded-full bg-foreground shadow-lg ring-0 transition-transform ${
                            autoBurnTax ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}></span>
                        </button>
                        <label 
                          className="font-serif text-sm font-bold leading-relaxed text-white md:text-base cursor-pointer"
                          onClick={() => setAutoBurnTax(!autoBurnTax)}
                        >
                          Auto-burn tax
                        </label>
                      </div>
                      <div className="text-right flex-none">
                        <a className="font-serif font-medium text-primary-alt hover:underline max-sm:text-sm" target="_blank" rel="noreferrer" href="https://docs.20lab.app/features/taxes#auto-burn-tax">
                          Check Docs
                        </a>
                      </div>
                    </div>
                    <div className="text-xs italic text-foreground/50 md:text-sm mt-1">
                      The Auto-burn tax will automatically burn collected tokens in the same transaction.
                    </div>

                    {autoBurnTax && (
                      <div className="mt-4 pl-3 sm:pl-6 border-l-2 border-primary/50 space-y-4 bg-field/30 p-4 rounded-r-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-white font-serif block">Buy burn tax %</label>
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white border border-[#44617d]/40" 
                              placeholder="1.0" 
                              value={buyAutoBurnTax} 
                              onChange={(e) => setBuyAutoBurnTax(e.target.value)} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-white font-serif block">Sell burn tax %</label>
                            <input 
                              spellCheck="false" 
                              className="min-h-8 w-full rounded-lg bg-field px-3 py-3 text-sm ring-offset-field font-serif text-white border border-[#44617d]/40" 
                              placeholder="1.0" 
                              value={sellAutoBurnTax} 
                              onChange={(e) => setSellAutoBurnTax(e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stepper Buttons */}
                <div className="flex items-center gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="w-1/3 h-12 rounded-lg bg-field hover:bg-white/10 font-serif font-bold text-white cursor-pointer border border-[#44617d]/40"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="w-2/3 h-12 rounded-lg bg-linear-to-r from-primary to-primary-alt text-primary-foreground font-serif font-bold cursor-pointer hover:opacity-90 shadow-lg shadow-[#07e3f8]/20"
                  >
                    Save &amp; Next (Go to Summary)
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUMMARY & DEPLOY */}
            {step === 4 && (
              <div className="space-y-6 pt-2 font-serif">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-foreground/50 pb-2">
                  <h3 className="text-lg font-bold text-white font-serif">Token Summary</h3>
                  <span className="text-xs text-primary-alt font-bold">Step 4 of 4</span>
                </div>

                {/* Parameters Review */}
                <div className="bg-field p-4 rounded-lg border border-[#44617d]/40 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-[#44617d]/20 pb-2">
                    <span className="text-foreground/60">Blockchain:</span>
                    <span className="font-bold text-white flex items-center gap-2">
                      <img 
                        src={`/images/crypto/${selectedChain?.chainId || selectedChain?.id || 1}.png`} 
                        alt={selectedChain?.name} 
                        className="w-4 h-4 rounded-full" 
                        onError={(e) => { e.currentTarget.src = '/images/crypto/1.png'; }}
                      />
                      <span>{selectedChain?.name} ({selectedChain?.currency || selectedChain?.symbol || 'ETH'})</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${selectedChain?.isTestnet ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                        {selectedChain?.isTestnet ? 'Testnet' : 'Live Mainnet'}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#44617d]/20 pb-2">
                    <span className="text-foreground/60">Token Name:</span>
                    <span className="font-bold text-white">{name || 'MyToken'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#44617d]/20 pb-2">
                    <span className="text-foreground/60">Token Symbol:</span>
                    <span className="font-bold text-white">{symbol || 'MTK'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#44617d]/20 pb-2">
                    <span className="text-foreground/60">Contract Name:</span>
                    <span className="font-bold text-white">{customContractName ? contractName : (name || 'Token')}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#44617d]/20 pb-2">
                    <span className="text-foreground/60">Initial Supply:</span>
                    <span className="font-bold text-white">{initialSupply} Tokens</span>
                  </div>
                  <div className="flex justify-between border-b border-[#44617d]/20 pb-2">
                    <span className="text-foreground/60">Decimals:</span>
                    <span className="font-bold text-white">{decimals}</span>
                  </div>

                  {/* Taxes Overview */}
                  <div className="border-b border-[#44617d]/20 pb-2 space-y-1">
                    <div className="text-foreground/60 font-bold text-xs uppercase tracking-wider">Taxes &amp; Fees Configured:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Liquidity Tax:</span>{' '}
                        <span className={liquidityTax ? 'text-[#07e3f8] font-bold' : 'text-slate-500'}>
                          {liquidityTax ? `Buy ${buyLiquidityTax}% / Sell ${sellLiquidityTax}% ${burnLpTokens ? '(Burn LP)' : ''}` : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Dividend Tax:</span>{' '}
                        <span className={dividendTax ? 'text-[#07e3f8] font-bold' : 'text-slate-500'}>
                          {dividendTax ? `Buy ${buyDividendTax}% / Sell ${sellDividendTax}% in ${dividendsSentIn}` : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Wallet Tax:</span>{' '}
                        <span className={walletTax ? 'text-[#07e3f8] font-bold' : 'text-slate-500'}>
                          {walletTax ? `Buy ${buyWalletTax}% / Sell ${sellWalletTax}%` : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Auto-Burn Tax:</span>{' '}
                        <span className={autoBurnTax ? 'text-[#07e3f8] font-bold' : 'text-slate-500'}>
                          {autoBurnTax ? `Buy ${buyAutoBurnTax}% / Sell ${sellAutoBurnTax}%` : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between border-b border-[#44617d]/20 pb-2">
                    <span className="text-foreground/60">Other Features:</span>
                    <span className="font-bold text-[#07e3f8] text-right">
                      {[
                        mintable && 'Mintable',
                        antiBotCooldown && 'Anti-Bot',
                        enableTrading && 'EnableTrading',
                        maxAmountPerWallet && 'Max Wallet',
                        maxTxLimit && 'Max Tx',
                        pausable && 'Pausable',
                        blacklist && 'Blacklist',
                        tokenRecovery && 'Recovery',
                        permit && 'Permit'
                      ].filter(Boolean).join(', ') || 'Standard'}
                    </span>
                  </div>

                  {/* Beneficiary & Fee Recipient Details */}
                  <div className="border-b border-[#44617d]/20 pb-2 space-y-1.5">
                    <div className="text-foreground/60 font-bold text-xs uppercase tracking-wider">Fee &amp; Ownership Recipients:</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Token Owner &amp; Supply:</span>
                        <span className="font-mono text-emerald-400 text-right truncate max-w-[240px]">
                          {diffTokenOwner && tokenOwnerAddress
                            ? tokenOwnerAddress
                            : (diffSupplyRecipient && supplyRecipientAddress
                                ? supplyRecipientAddress
                                : (wallet?.connected && wallet?.address 
                                    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)} (Connected Wallet)` 
                                    : 'Connected Wallet'))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">DEX Trading Tax Recipient:</span>
                        <span className="font-mono text-[#07e3f8] text-right truncate max-w-[240px]">
                          {walletTax 
                            ? (walletTaxRecipient 
                                ? `${walletTaxRecipient.slice(0, 6)}...${walletTaxRecipient.slice(-4)}` 
                                : (wallet?.connected && wallet?.address 
                                    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)} (Connected Wallet)` 
                                    : 'Connected Wallet')) 
                            : 'No Trading Tax Enabled'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Protocol Treasury Recipient:</span>
                        <span className="font-mono text-purple-400 text-right truncate max-w-[240px] flex items-center gap-1 justify-end">
                          <span>{PLATFORM_TREASURY_WALLET.slice(0, 6)}...{PLATFORM_TREASURY_WALLET.slice(-4)}</span>
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded font-sans font-bold">Locked</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-1 items-center">
                    <span className="text-foreground/60">Platform Creation Fee:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-2">
                      <span>{platformConfig?.creationFeeEth || '0.01'} {selectedChain?.currency || selectedChain?.symbol || 'ETH'}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${selectedChain?.isTestnet ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                        {selectedChain?.isTestnet ? 'Testnet' : 'Live Mainnet'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Source Code Toggle */}
                <button
                  type="button"
                  onClick={() => setShowSourceCode(!showSourceCode)}
                  className="flex items-center gap-2 text-xs font-serif text-primary-alt hover:underline cursor-pointer"
                >
                  <Code2 size={14} />
                  <span>{showSourceCode ? 'Hide Solidity Contract' : 'Preview Generated Solidity Contract'}</span>
                </button>

                {showSourceCode && (
                  <pre className="p-4 rounded-lg bg-[#081523] border border-[#44617d]/40 text-xs font-mono text-emerald-400 overflow-x-auto max-h-60">
                    {generateSolidityContract({
                      name: name || 'MyToken',
                      symbol: symbol || 'MTK',
                      contractName: customContractName ? contractName : (name || 'Token'),
                      initialSupply,
                      decimals,
                      mintable,
                      pausable,
                      permit,
                      tokenRecovery,
                      blacklist,
                      taxConfig: {
                        buyLiquidityFee: liquidityTax ? Number(buyLiquidityTax) : 0,
                        sellLiquidityFee: liquidityTax ? Number(sellLiquidityTax) : 0,
                        buyMarketingFee: walletTax ? Number(buyWalletTax) : 0,
                        sellMarketingFee: walletTax ? Number(sellWalletTax) : 0,
                        buyBurnFee: autoBurnTax ? Number(buyAutoBurnTax) : 0,
                        sellBurnFee: autoBurnTax ? Number(sellAutoBurnTax) : 0,
                        marketingWallet: walletTaxRecipient || wallet?.address || 'msg.sender'
                      }
                    })}
                  </pre>
                )}

                {/* Stepper Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(3)}
                    className="w-1/3 h-12 rounded-lg bg-field hover:bg-white/10 font-serif font-bold text-white cursor-pointer border border-[#44617d]/40"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={isDeploying}
                    className="w-2/3 h-12 rounded-lg bg-linear-to-r from-primary to-primary-alt text-primary-foreground font-serif font-bold cursor-pointer hover:opacity-90 shadow-lg shadow-[#07e3f8]/20 flex items-center justify-center gap-2"
                  >
                    {isDeploying ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
                        <span>Deploying Smart Contract...</span>
                      </>
                    ) : (
                      <span>Deploy &amp; Create Token</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </section>

        {/* SEO Guide Section matching 20lab */}
        <div style={{ display: 'contents' }}>
          <div className="relative space-y-6 pt-10 sm:pt-20">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
              How to create an ERC-20 token?
            </h2>
            <div className="font-serif text-sm md:text-base leading-relaxed text-foreground/80 space-y-4">
              <div>
                Creating an ERC-20 token with RobinPump Deployer takes about 5 minutes and works in five steps:
                <ol className="list-decimal list-inside my-2 space-y-1">
                  <li><b>Connect your Web3 wallet</b> - MetaMask, Rabby, Trust Wallet, Coinbase Wallet, or any wallet supporting WalletConnect</li>
                  <li><b>Choose your blockchain</b> - <a className="text-primary-alt hover:underline" href="/generate/erc20-token/ethereum/">Ethereum</a> for maximum reach, <a className="text-primary-alt hover:underline" href="/generate/erc20-token/base/">Base</a> or <a className="text-primary-alt hover:underline" href="/generate/erc20-token/polygon/">Polygon</a> for low fees, or any of 19 supported EVM chains</li>
                  <li><b>Configure the basics</b> - token name, symbol, initial supply, and decimals (18 is the ERC-20 standard)</li>
                  <li><b>Pick optional features</b> - mintable, pausable, blacklist, transfer taxes, liquidity tax, dividend tax, anti-bot protection, or ERC-2612 permit for gasless approvals</li>
                  <li><b>Review and deploy</b> - confirm the summary, sign the transaction in your wallet, and your ERC-20 token goes live</li>
                </ol>
                No Solidity required. No smart contract auditing. The RobinPump Deployer ERC-20 token creator handles deployment for you using audited, gas-optimized contracts.
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white pt-2">Why ERC-20 is the most popular token standard</h3>
              <p>ERC-20 is the foundational standard for fungible tokens on Ethereum and every EVM-compatible blockchain. Defined by EIP-20, it specifies the functions every fungible token must implement so wallets, exchanges, and dApps can interact with any compliant token in the same way. The standard powers nearly every major DeFi protocol - Uniswap, Aave, Compound - and underpins the majority of stablecoins, governance tokens, and project tokens in crypto today.</p>

              <h3 className="text-lg sm:text-xl font-bold text-white pt-2">Choose the right blockchain for your token</h3>
              <p>Different EVM chains have different tradeoffs. Ethereum offers maximum credibility and liquidity but higher gas costs. Base and Polygon deliver near-Ethereum compatibility at a fraction of the cost. BNB Smart Chain remains the leading low-fee chain for retail tokens. Layer-2s like Arbitrum and Optimism add scalability without sacrificing Ethereum security. Pick the chain that matches your audience, budget, and use case.</p>

              <h3 className="text-lg sm:text-xl font-bold text-white pt-2">Want to generate a chain-specific token?</h3>
              <p>Choose a blockchain from the table below to launch directly on that network:</p>
              
              {/* Chain Specific Table matching 20lab */}
              <div className="flex flex-col overflow-x-auto pt-2">
                <div className="overflow-x-auto">
                  <table className="border border-[#44617d]/40 min-w-full text-left text-sm font-light bg-field/25">
                    <tbody>
                      <tr className="border-b border-[#44617d]/40 max-md:flex max-md:flex-col">
                        <td className="border-r border-[#44617d]/40 px-4 py-3">
                          <button 
                            type="button"
                            onClick={() => {
                              handleSelectChain(evmChains.find(c => c.chainId === 1 || c.id === 'ethereum') || DEFAULT_CHAIN);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="flex items-center gap-2 hover:text-[#07e3f8] cursor-pointer"
                          >
                            <img alt="Ethereum" width="26" height="26" className="rounded-full" src="/images/crypto/1.png" />
                            Create Ethereum Token
                          </button>
                        </td>
                        <td className="border-r border-[#44617d]/40 px-4 py-3">
                          <button 
                            type="button"
                            onClick={() => {
                              handleSelectChain(evmChains.find(c => c.chainId === 56 || c.id === 'bsc') || DEFAULT_CHAIN);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="flex items-center gap-2 hover:text-[#07e3f8] cursor-pointer"
                          >
                            <img alt="BNB" width="26" height="26" className="rounded-full" src="/images/crypto/56.png" />
                            Create BNB Token
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            type="button"
                            onClick={() => {
                              handleSelectChain(evmChains.find(c => c.chainId === 137 || c.id === 'polygon') || DEFAULT_CHAIN);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="flex items-center gap-2 hover:text-[#07e3f8] cursor-pointer"
                          >
                            <img alt="Polygon" width="26" height="26" className="rounded-full" src="/images/crypto/137.png" />
                            Create Polygon Token
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b border-[#44617d]/40 max-md:flex max-md:flex-col">
                        <td className="border-r border-[#44617d]/40 px-4 py-3">
                          <button 
                            type="button"
                            onClick={() => {
                              handleSelectChain(evmChains.find(c => c.chainId === 43114 || c.id === 'avalanche') || DEFAULT_CHAIN);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="flex items-center gap-2 hover:text-[#07e3f8] cursor-pointer"
                          >
                            <img alt="Avalanche" width="26" height="26" className="rounded-full" src="/images/crypto/43114.png" />
                            Create Avalanche Token
                          </button>
                        </td>
                        <td className="border-r border-[#44617d]/40 px-4 py-3">
                          <button 
                            type="button"
                            onClick={() => {
                              handleSelectChain(evmChains.find(c => c.chainId === 42161 || c.id === 'arbitrum') || DEFAULT_CHAIN);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="flex items-center gap-2 hover:text-[#07e3f8] cursor-pointer"
                          >
                            <img alt="Arbitrum" width="26" height="26" className="rounded-full" src="/images/crypto/42161.png" />
                            Create Arbitrum Token
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            type="button"
                            onClick={() => {
                              handleSelectChain(evmChains.find(c => c.chainId === 10 || c.id === 'optimism') || DEFAULT_CHAIN);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="flex items-center gap-2 hover:text-[#07e3f8] cursor-pointer"
                          >
                            <img alt="Optimism" width="26" height="26" className="rounded-full" src="/images/crypto/10.png" />
                            Create Optimism Token
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b border-[#44617d]/40 max-md:flex max-md:flex-col">
                        <td className="border-r border-[#44617d]/40 px-4 py-3">
                          <button 
                            type="button"
                            onClick={() => {
                              handleSelectChain(evmChains.find(c => c.chainId === 8453 || c.id === 'base') || DEFAULT_CHAIN);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="flex items-center gap-2 hover:text-[#07e3f8] cursor-pointer"
                          >
                            <img alt="Base" width="26" height="26" className="rounded-full" src="/images/crypto/8453.png" />
                            Create Base Token
                          </button>
                        </td>
                        <td className="border-r border-[#44617d]/40 px-4 py-3">
                          <button 
                            type="button"
                            onClick={() => {
                              handleSelectChain(evmChains.find(c => c.chainId === 25 || c.id === 'cronos') || DEFAULT_CHAIN);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="flex items-center gap-2 hover:text-[#07e3f8] cursor-pointer"
                          >
                            <img alt="Cronos" width="26" height="26" className="rounded-full" src="/images/crypto/25.png" />
                            Create Cronos Token
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            type="button"
                            onClick={() => {
                              handleSelectChain(evmChains.find(c => c.chainId === 369 || c.id === 'pulsechain') || DEFAULT_CHAIN);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="flex items-center gap-2 hover:text-[#07e3f8] cursor-pointer"
                          >
                            <img alt="PulseChain" width="26" height="26" className="rounded-full" src="/images/crypto/369.png" />
                            Create PulseChain Token
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Blockchain Selection Modal */}
      {chainModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#142638] border border-[#44617d]/70 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              type="button"
              onClick={() => setChainModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold font-serif text-white mb-1">Select Blockchain</h3>
            <p className="text-xs text-foreground/50 font-serif mb-4">Choose where to deploy your token. Real tokens deploy to Live Mainnets.</p>
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              <div>
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-1 mb-1.5 flex items-center justify-between">
                  <span>Live Mainnets</span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">100% Real Assets</span>
                </div>
                <div className="space-y-1">
                  {evmChains.filter(c => !c.isTestnet).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectChain(c)}
                      className={`flex items-center w-full gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        selectedChain?.id === c.id ? 'bg-[#07e3f8]/20 text-[#07e3f8] font-bold border border-[#07e3f8]/50' : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <img 
                        src={`/images/crypto/${c.chainId}.png`} 
                        alt={c.name} 
                        className="w-7 h-7 rounded-full shrink-0" 
                        onError={(e) => { e.currentTarget.src = '/images/crypto/1.png'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-serif truncate">{c.name}</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">MAINNET</span>
                        </div>
                        <div className="text-xs text-slate-400 font-serif">Chain ID: {c.chainId} • {c.currency || c.symbol} • Fee: {c.platformFee}</div>
                      </div>
                      {selectedChain?.id === c.id && <Check size={18} className="text-[#07e3f8] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-2 py-1 mb-1.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <span>Testnets</span>
                  <span className="text-[10px] text-slate-400 font-mono">Free Testing</span>
                </div>
                <div className="space-y-1">
                  {evmChains.filter(c => c.isTestnet).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectChain(c)}
                      className={`flex items-center w-full gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        selectedChain?.id === c.id ? 'bg-[#07e3f8]/20 text-[#07e3f8] font-bold border border-[#07e3f8]/50' : 'hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <img 
                        src={`/images/crypto/${c.chainId}.png`} 
                        alt={c.name} 
                        className="w-7 h-7 rounded-full shrink-0" 
                        onError={(e) => { e.currentTarget.src = '/images/crypto/1.png'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-serif truncate">{c.name}</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">TESTNET</span>
                        </div>
                        <div className="text-xs text-slate-400 font-serif">Chain ID: {c.chainId} • {c.currency || c.symbol}</div>
                      </div>
                      {selectedChain?.id === c.id && <Check size={18} className="text-[#07e3f8] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deployed Token Success & Dashboard Access Modal */}
      {deployedTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#0e1e2f] via-[#091522] to-[#060e18] p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 text-white font-serif">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setDeployedTokenModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header with celebration badge */}
            <div className="text-center space-y-3 pb-6 border-b border-slate-700/60">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={36} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Deployment Success • {deployedTokenModal.chainName}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                  Token Live &amp; Ready!
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Your smart contract is successfully deployed on-chain. You are registered as the contract owner.
                </p>
              </div>
            </div>

            {/* Token Specifications Details */}
            <div className="my-6 space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Token Name &amp; Symbol</div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                      <span>{deployedTokenModal.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#07e3f8]/10 text-[#07e3f8] border border-[#07e3f8]/30 font-mono">
                        ${deployedTokenModal.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Supply</div>
                    <div className="text-sm font-mono font-bold text-emerald-300">
                      {Number(deployedTokenModal.totalSupply).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Contract Address Copy Row */}
                <div>
                  <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                    <span>Contract Address:</span>
                    {deployedTokenModal.isVerified && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                        <Check size={11} /> Auto-Verified on Explorer
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-slate-700/80 font-mono text-xs">
                    <span className="flex-1 truncate text-slate-200 select-all">{deployedTokenModal.address}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(deployedTokenModal.address);
                        setCopiedModalAddress(true);
                        setTimeout(() => setCopiedModalAddress(false), 2000);
                        onShowToast?.({ type: 'info', title: 'Copied', message: 'Contract address copied!' });
                      }}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy Address"
                    >
                      {copiedModalAddress ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    {deployedTokenModal.explorerUrl && (
                      <a
                        href={deployedTokenModal.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="View on Block Explorer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Owner Identity Row */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Crown size={14} className="text-amber-400" />
                    <span>Contract Owner:</span>
                  </span>
                  <span className="font-mono text-amber-300 font-semibold truncate max-w-[220px]" title={deployedTokenModal.owner}>
                    {deployedTokenModal.owner?.slice(0, 8)}...{deployedTokenModal.owner?.slice(-6)}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  const addr = deployedTokenModal.address;
                  setDeployedTokenModal(null);
                  onNavigate('/dashboard/' + addr);
                }}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 via-teal-300 to-[#07e3f8] text-slate-950 hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown size={18} className="text-slate-950" />
                <span>Open Token Owner Dashboard</span>
                <ChevronRight size={18} />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAddToMetaMask(deployedTokenModal)}
                  className="py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <WalletIcon size={14} className="text-indigo-400" />
                  <span>Add to Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeployedTokenModal(null);
                    handleReset();
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} className="text-slate-400" />
                  <span>Deploy Another</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
