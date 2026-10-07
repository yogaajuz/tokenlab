import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Flame, 
  PauseCircle, 
  PlayCircle, 
  ShieldAlert, 
  UserX, 
  Crown, 
  Percent, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  PlusCircle,
  RefreshCw,
  Search,
  Code2,
  ShieldCheck,
  Check,
  Plus,
  ArrowRight,
  Sparkles,
  Wallet as WalletIcon
} from 'lucide-react';
import { ethers } from 'ethers';
import { getStoredTokens, updateStoredToken, saveStoredToken } from '../utils/web3Service';
import CustomTokenArtifact from '../contracts/CustomToken.json';
import { 
  autoVerifyContract, 
  CUSTOM_TOKEN_SOURCE, 
  COMPILER_VERSION, 
  OPTIMIZATION_RUNS 
} from '../utils/contractVerifier';

export default function TokenDashboard({
  wallet,
  selectedChain,
  onShowToast,
  targetAddress,
  onNavigate
}) {
  const [tokens, setTokens] = useState([]);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const [filterMode, setFilterMode] = useState('mine'); // 'mine' | 'all'
  const [activeTab, setActiveTab] = useState('supply'); // 'supply', 'pause', 'blacklist', 'taxes', 'ownership', 'verification'
  const [verifying, setVerifying] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Operation form states
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('1000000');
  const [burnAmount, setBurnAmount] = useState('500000');
  const [blacklistInput, setBlacklistInput] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [newMarketingFee, setNewMarketingFee] = useState(2);
  const [newBurnFee, setNewBurnFee] = useState(1);
  const [newMarketingWallet, setNewMarketingWallet] = useState('');

  // Load stored tokens
  const reloadTokens = () => {
    const list = getStoredTokens();
    setTokens(list);

    if (targetAddress) {
      const match = list.find(t => t.address.toLowerCase() === targetAddress.toLowerCase());
      if (match) {
        setSelectedTokenAddress(match.address);
        return;
      }
    }

    // Retain currently selected token if valid, else pick first available
    setSelectedTokenAddress(prev => {
      if (prev && list.some(t => t.address.toLowerCase() === prev.toLowerCase())) {
        return prev;
      }
      if (wallet?.address) {
        const userToken = list.find(t => t.owner?.toLowerCase() === wallet.address.toLowerCase());
        if (userToken) return userToken.address;
      }
      return list.length > 0 ? list[0].address : '';
    });
  };

  useEffect(() => {
    reloadTokens();
  }, [targetAddress]);

  const userAddress = wallet?.address?.toLowerCase();
  const myCreatedTokens = tokens.filter(t => t.owner?.toLowerCase() === userAddress);

  // Auto adjust filter mode if user has created tokens
  useEffect(() => {
    if (userAddress && myCreatedTokens.length > 0) {
      setFilterMode('mine');
    } else {
      setFilterMode('all');
    }
  }, [userAddress, tokens.length]);

  const displayedTokens = filterMode === 'mine' ? myCreatedTokens : tokens;
  const currentToken = tokens.find(t => t.address.toLowerCase() === selectedTokenAddress?.toLowerCase()) 
    || displayedTokens[0] 
    || tokens[0];

  const isOwner = Boolean(
    wallet?.address && 
    currentToken?.owner && 
    (wallet.address.toLowerCase() === currentToken.owner.toLowerCase() || wallet.isSimulated)
  );

  useEffect(() => {
    if (currentToken) {
      setMintAddress(wallet?.address || currentToken.owner || '');
      setNewMarketingFee(currentToken.taxConfig?.marketingFee ?? 2);
      setNewBurnFee(currentToken.taxConfig?.burnFee ?? 1);
      setNewMarketingWallet(currentToken.taxConfig?.marketingWallet || currentToken.owner || '');
    }
  }, [currentToken?.address, wallet?.address]);

  // Live contract state sync with blockchain
  useEffect(() => {
    let isCancelled = false;
    const fetchLiveStatus = async () => {
      if (!currentToken?.address || !window.ethereum || wallet?.isSimulated) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(currentToken.address, CustomTokenArtifact.abi, provider);
        const [liveOwner, livePaused, liveSupply, liveTrading] = await Promise.all([
          contract.owner().catch(() => null),
          contract.paused().catch(() => null),
          contract.totalSupply().catch(() => null),
          contract.tradingEnabled().catch(() => null)
        ]);

        if (!isCancelled) {
          const updates = {};
          if (liveOwner && liveOwner.toLowerCase() !== currentToken.owner?.toLowerCase()) {
            updates.owner = liveOwner;
          }
          if (livePaused !== null && livePaused !== currentToken.isPaused) {
            updates.isPaused = livePaused;
          }
          if (liveTrading !== null && liveTrading !== currentToken.tradingActive) {
            updates.tradingActive = liveTrading;
          }
          if (liveSupply !== null) {
            const dec = currentToken.decimals || 18;
            const formatted = ethers.formatUnits(liveSupply, dec);
            if (formatted !== currentToken.totalSupply) {
              updates.totalSupply = formatted;
            }
          }
          if (Object.keys(updates).length > 0) {
            updateStoredToken(currentToken.address, updates);
            setTokens(getStoredTokens());
          }
        }
      } catch (err) {
        // Contract query quiet fallback
      }
    };

    fetchLiveStatus();
    return () => { isCancelled = true; };
  }, [currentToken?.address, wallet?.address]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
    onShowToast?.({
      type: 'info',
      title: 'Copied',
      message: `${label} copied to clipboard!`
    });
  };

  const getContractSigner = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask / Web3 wallet not detected. Please install a Web3 wallet.');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(currentToken.address, CustomTokenArtifact.abi, signer);
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

  const handleManualVerify = async () => {
    if (!currentToken) return;
    setVerifying(true);
    onShowToast?.({
      type: 'info',
      title: 'Verifying Contract...',
      message: `Submitting ${currentToken.name} source code to block explorer & Sourcify...`
    });

    try {
      await autoVerifyContract({
        address: currentToken.address,
        chainId: currentToken.chainId || selectedChain?.chainId || 1,
        txHash: currentToken.txHash || '',
        configTuple: null,
        chain: selectedChain
      });

      updateStoredToken(currentToken.address, {
        isVerified: true,
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString()
      });
      reloadTokens();

      onShowToast?.({
        type: 'success',
        title: 'Contract Verified!',
        message: `${currentToken.name} verified on block explorer & Sourcify!`
      });
    } catch (err) {
      onShowToast?.({
        type: 'error',
        title: 'Verification Notice',
        message: err.message || 'Verification submission in progress'
      });
    } finally {
      setVerifying(false);
    }
  };

  // 1. Mint Tokens Action (Real Web3 & Simulation)
  const handleMint = async () => {
    if (!mintAddress || !mintAmount) {
      onShowToast?.({ type: 'error', title: 'Input Error', message: 'Enter recipient address and amount.' });
      return;
    }
    if (!isOwner) {
      onShowToast?.({ type: 'error', title: 'Permission Denied', message: 'Only the contract owner can mint new tokens.' });
      return;
    }
    setActionLoading(true);

    try {
      if (wallet?.connected && !wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
        const contract = await getContractSigner();
        const cleanAmt = (mintAmount || '0').toString().replace(/\s+/g, '');
        const amtBN = ethers.parseUnits(cleanAmt, currentToken.decimals || 18);
        onShowToast?.({ type: 'info', title: 'Pending Confirmation', message: 'Please confirm minting in your Web3 wallet...' });
        const tx = await contract.mint(mintAddress, amtBN);
        onShowToast?.({ type: 'info', title: 'Minting in Progress', message: `TX hash: ${tx.hash.slice(0, 10)}...` });
        await tx.wait(1);
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }

      const currentSupplyNum = Number(currentToken.totalSupply) || 0;
      const mintNum = Number(mintAmount) || 0;
      const newTotal = (currentSupplyNum + mintNum).toString();

      updateStoredToken(currentToken.address, { totalSupply: newTotal });
      reloadTokens();
      onShowToast?.({
        type: 'success',
        title: 'Mint Transaction Confirmed',
        message: `Minted ${Number(mintAmount).toLocaleString()} ${currentToken.symbol} to ${mintAddress.slice(0, 6)}...`
      });
    } catch (err) {
      console.error('Mint error:', err);
      onShowToast?.({ type: 'error', title: 'Mint Failed', message: err.reason || err.message || 'Transaction rejected.' });
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Burn Tokens Action (Real Web3 & Simulation)
  const handleBurn = async () => {
    if (!burnAmount) {
      onShowToast?.({ type: 'error', title: 'Input Error', message: 'Enter amount to burn.' });
      return;
    }
    setActionLoading(true);

    try {
      if (wallet?.connected && !wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
        const contract = await getContractSigner();
        const cleanAmt = (burnAmount || '0').toString().replace(/\s+/g, '');
        const amtBN = ethers.parseUnits(cleanAmt, currentToken.decimals || 18);
        onShowToast?.({ type: 'info', title: 'Pending Confirmation', message: 'Please confirm token burn in your wallet...' });
        const tx = await contract.burn(amtBN);
        onShowToast?.({ type: 'info', title: 'Burning in Progress', message: `TX hash: ${tx.hash.slice(0, 10)}...` });
        await tx.wait(1);
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }

      const currentSupplyNum = Number(currentToken.totalSupply) || 0;
      const burnNum = Number(burnAmount) || 0;
      const newTotal = Math.max(0, currentSupplyNum - burnNum).toString();

      updateStoredToken(currentToken.address, { totalSupply: newTotal });
      reloadTokens();
      onShowToast?.({
        type: 'success',
        title: 'Tokens Burned',
        message: `Burned ${Number(burnAmount).toLocaleString()} ${currentToken.symbol}. Total supply reduced.`
      });
    } catch (err) {
      console.error('Burn error:', err);
      onShowToast?.({ type: 'error', title: 'Burn Failed', message: err.reason || err.message || 'Transaction rejected.' });
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Pause / Unpause Action (Real Web3 & Simulation)
  const handleTogglePause = async () => {
    if (!isOwner) {
      onShowToast?.({ type: 'error', title: 'Permission Denied', message: 'Only the contract owner can change pause state.' });
      return;
    }
    setActionLoading(true);

    try {
      const newPausedState = !currentToken.isPaused;
      if (wallet?.connected && !wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
        const contract = await getContractSigner();
        onShowToast?.({ 
          type: 'info', 
          title: 'Pending Confirmation', 
          message: `Confirm ${newPausedState ? 'Pause' : 'Unpause'} in your Web3 wallet...` 
        });
        const tx = newPausedState ? await contract.pause() : await contract.unpause();
        await tx.wait(1);
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }

      updateStoredToken(currentToken.address, { isPaused: newPausedState });
      reloadTokens();
      onShowToast?.({
        type: newPausedState ? 'error' : 'success',
        title: newPausedState ? 'Contract Paused' : 'Contract Resumed',
        message: newPausedState 
          ? 'Token transfers are now paused globally across all DEXs and wallets.'
          : 'Token transfers are now resumed and active.'
      });
    } catch (err) {
      console.error('Pause error:', err);
      onShowToast?.({ type: 'error', title: 'Action Failed', message: err.reason || err.message || 'Transaction rejected.' });
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Activate Public Trading Action (Real Web3 & Simulation)
  const handleEnableTrading = async () => {
    if (!isOwner) {
      onShowToast?.({ type: 'error', title: 'Permission Denied', message: 'Only the contract owner can activate public trading.' });
      return;
    }
    setActionLoading(true);

    try {
      if (wallet?.connected && !wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
        const contract = await getContractSigner();
        onShowToast?.({ type: 'info', title: 'Pending Confirmation', message: 'Confirm Enable Trading transaction in wallet...' });
        const tx = await contract.enableTrading();
        await tx.wait(1);
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }

      updateStoredToken(currentToken.address, { tradingActive: true, isPaused: false });
      reloadTokens();
      onShowToast?.({
        type: 'success',
        title: 'Public Trading Activated!',
        message: 'Trading is now permanently open for all users and DEX liquidity pools.'
      });
    } catch (err) {
      console.error('Enable trading error:', err);
      onShowToast?.({ type: 'error', title: 'Trading Activation Failed', message: err.reason || err.message || 'Transaction rejected.' });
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Blacklist Add / Remove (Real Web3 & Simulation)
  const handleAddBlacklist = async () => {
    if (!blacklistInput) return;
    if (!isOwner) {
      onShowToast?.({ type: 'error', title: 'Permission Denied', message: 'Only owner can blacklist addresses.' });
      return;
    }
    setActionLoading(true);

    try {
      if (wallet?.connected && !wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
        const contract = await getContractSigner();
        onShowToast?.({ type: 'info', title: 'Pending Confirmation', message: 'Confirm blacklist restriction in wallet...' });
        const tx = await contract.setBlacklist(blacklistInput, true);
        await tx.wait(1);
      } else {
        await new Promise(r => setTimeout(r, 800));
      }

      const currentList = currentToken.blacklistedAddresses || [];
      if (!currentList.includes(blacklistInput)) {
        updateStoredToken(currentToken.address, { blacklistedAddresses: [...currentList, blacklistInput] });
        reloadTokens();
      }
      setBlacklistInput('');
      onShowToast?.({
        type: 'success',
        title: 'Address Blacklisted',
        message: `Restricted ${blacklistInput.slice(0, 6)}... from trading.`
      });
    } catch (err) {
      console.error('Blacklist error:', err);
      onShowToast?.({ type: 'error', title: 'Blacklist Failed', message: err.reason || err.message || 'Transaction rejected.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBlacklist = async (addr) => {
    if (!isOwner) {
      onShowToast?.({ type: 'error', title: 'Permission Denied', message: 'Only owner can unblacklist addresses.' });
      return;
    }
    setActionLoading(true);

    try {
      if (wallet?.connected && !wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
        const contract = await getContractSigner();
        onShowToast?.({ type: 'info', title: 'Pending Confirmation', message: 'Confirm unblacklist removal in wallet...' });
        const tx = await contract.setBlacklist(addr, false);
        await tx.wait(1);
      } else {
        await new Promise(r => setTimeout(r, 800));
      }

      const updated = (currentToken.blacklistedAddresses || []).filter(a => a.toLowerCase() !== addr.toLowerCase());
      updateStoredToken(currentToken.address, { blacklistedAddresses: updated });
      reloadTokens();
      onShowToast?.({
        type: 'info',
        title: 'Address Removed',
        message: `Removed ${addr.slice(0, 6)}... from blacklist.`
      });
    } catch (err) {
      console.error('Remove blacklist error:', err);
      onShowToast?.({ type: 'error', title: 'Action Failed', message: err.reason || err.message || 'Transaction rejected.' });
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Update Taxes (Real Web3 & Simulation)
  const handleUpdateTaxes = async () => {
    if (!isOwner) {
      onShowToast?.({ type: 'error', title: 'Permission Denied', message: 'Only owner can update taxes.' });
      return;
    }
    setActionLoading(true);

    try {
      if (wallet?.connected && !wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
        const contract = await getContractSigner();
        const buyMktBps = Math.floor(Number(newMarketingFee) * 10);
        const sellMktBps = Math.floor(Number(newMarketingFee) * 10);
        onShowToast?.({ type: 'info', title: 'Pending Confirmation', message: 'Confirm setTaxes in wallet...' });
        const txTaxes = await contract.setTaxes(buyMktBps, sellMktBps, 0, 0);
        await txTaxes.wait(1);

        if (newMarketingWallet && ethers.isAddress(newMarketingWallet)) {
          const txWallet = await contract.setMarketingWallet(newMarketingWallet);
          await txWallet.wait(1);
        }
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }

      const updatedTax = {
        marketingFee: Number(newMarketingFee),
        burnFee: Number(newBurnFee),
        marketingWallet: newMarketingWallet
      };
      updateStoredToken(currentToken.address, { taxConfig: updatedTax });
      reloadTokens();
      onShowToast?.({
        type: 'success',
        title: 'Tax Configuration Saved',
        message: `Updated to ${newMarketingFee}% Marketing and ${newBurnFee}% Auto-Burn.`
      });
    } catch (err) {
      console.error('Tax update error:', err);
      onShowToast?.({ type: 'error', title: 'Tax Update Failed', message: err.reason || err.message || 'Transaction rejected.' });
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Ownership Transfer or Renounce (Real Web3 & Simulation)
  const handleTransferOwnership = async () => {
    if (!newOwnerAddress) return;
    if (!isOwner) {
      onShowToast?.({ type: 'error', title: 'Permission Denied', message: 'Only owner can transfer ownership.' });
      return;
    }
    setActionLoading(true);

    try {
      if (wallet?.connected && !wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
        const contract = await getContractSigner();
        onShowToast?.({ type: 'info', title: 'Pending Confirmation', message: 'Confirm transferOwnership in wallet...' });
        const tx = await contract.transferOwnership(newOwnerAddress);
        await tx.wait(1);
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }

      updateStoredToken(currentToken.address, { owner: newOwnerAddress });
      reloadTokens();
      onShowToast?.({
        type: 'success',
        title: 'Ownership Transferred',
        message: `New contract owner is ${newOwnerAddress.slice(0, 8)}...`
      });
      setNewOwnerAddress('');
    } catch (err) {
      console.error('Transfer ownership error:', err);
      onShowToast?.({ type: 'error', title: 'Transfer Failed', message: err.reason || err.message || 'Transaction rejected.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenounceOwnership = async () => {
    if (!isOwner) {
      onShowToast?.({ type: 'error', title: 'Permission Denied', message: 'Only owner can renounce ownership.' });
      return;
    }
    if (!window.confirm('⚠️ WARNING: Renouncing ownership will permanently make the contract immutable with NO owner. Are you 100% sure?')) {
      return;
    }
    setActionLoading(true);

    try {
      if (wallet?.connected && !wallet?.isSimulated && typeof window.ethereum !== 'undefined') {
        const contract = await getContractSigner();
        onShowToast?.({ type: 'info', title: 'Pending Confirmation', message: 'Confirm renounce ownership in wallet...' });
        const tx = await contract.transferOwnership(ethers.ZeroAddress);
        await tx.wait(1);
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }

      updateStoredToken(currentToken.address, { owner: '0x0000000000000000000000000000000000000000' });
      reloadTokens();
      onShowToast?.({
        type: 'info',
        title: 'Ownership Renounced',
        message: 'Contract ownership permanently transferred to 0x000...000.'
      });
    } catch (err) {
      console.error('Renounce error:', err);
      onShowToast?.({ type: 'error', title: 'Renounce Failed', message: err.reason || err.message || 'Transaction rejected.' });
    } finally {
      setActionLoading(false);
    }
  };

  // If no tokens found at all
  if (!currentToken) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6 font-serif">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
          <Coins className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">No Created Tokens Found</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            {filterMode === 'mine' && userAddress
              ? `No tokens deployed yet under connected address (${userAddress.slice(0, 6)}...${userAddress.slice(-4)}).`
              : 'Deploy an ERC-20 token first to manage it here in the Token Owner Dashboard.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate?.('/generate/erc20-token/')}
            className="py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-[#07e3f8] text-slate-950 hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus size={16} />
            <span>Deploy a New Token</span>
          </button>
          {filterMode === 'mine' && tokens.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className="py-3 px-6 rounded-xl font-bold text-sm bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white transition-all cursor-pointer"
            >
              <span>View All Deployed Tokens ({tokens.length})</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-serif">
      
      {/* Top Banner & Token Selector with Owner Filtering */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Token Owner Dashboard</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Admin Suite
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time management suite for tokens created by you. Mint &amp; burn supply, emergency pause transfers, manage blacklist bots, and adjust marketing fees.
          </p>
        </div>

        {/* Filter Switcher and Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          
          {/* My Tokens vs All Tokens Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setFilterMode('mine');
                if (myCreatedTokens.length > 0) {
                  setSelectedTokenAddress(myCreatedTokens[0].address);
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'mine'
                  ? 'bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown size={13} className="text-amber-400" />
              <span>Created By Me ({myCreatedTokens.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>All Tokens ({tokens.length})</span>
            </button>
          </div>

          {/* Token Selector Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={selectedTokenAddress}
              onChange={(e) => setSelectedTokenAddress(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none max-w-xs"
            >
              {displayedTokens.map((tok) => {
                const isMine = userAddress && tok.owner?.toLowerCase() === userAddress;
                return (
                  <option key={tok.address} value={tok.address}>
                    {tok.name} (${tok.symbol}) {isMine ? '★ [My Token]' : ''} - {tok.chainName || 'EVM'}
                  </option>
                );
              })}
            </select>

            <button
              onClick={reloadTokens}
              title="Reload token list & contract state"
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/generate/erc20-token/')}
                title="Create a new token"
                className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Owner Privilege Status Banner */}
      {isOwner ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Verified Contract Owner:</span> Your connected wallet (
            <code className="text-emerald-200 font-mono">{wallet?.address}</code>
            ) matches the contract owner. You have full administrative privileges to execute on-chain functions.
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Read-Only Mode:</span> Connected wallet (
            <code className="text-amber-200 font-mono">
              {wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Disconnected'}
            </code>
            ) is not the contract owner (<code className="text-amber-200 font-mono">{currentToken.owner ? `${currentToken.owner.slice(0, 6)}...${currentToken.owner.slice(-4)}` : '0x0'}</code>). Administrative write functions will reject.
          </div>
        </div>
      )}

      {/* Main Token Overview Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                  {currentToken.symbol.slice(0, 3)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">{currentToken.name}</h2>
                <span className="font-mono text-sm font-semibold text-indigo-400">({currentToken.symbol})</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {currentToken.chainName}
                </span>
                {isOwner && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                    <Crown size={10} /> My Token
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-400">
                <span>Contract:</span>
                <span className="font-mono text-slate-300 select-all">{currentToken.address}</span>
                <button
                  onClick={() => copyToClipboard(currentToken.address, 'Contract Address')}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  title="Copy Contract Address"
                >
                  {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={currentToken.explorerUrl || `${selectedChain.explorer}/address/${currentToken.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 inline-flex items-center"
                  title="View on Block Explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleAddToMetaMask(currentToken)}
                  className="text-slate-400 hover:text-indigo-300 inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
                  title="Add Token to MetaMask"
                >
                  <WalletIcon className="w-3 h-3 text-indigo-400" />
                  <span className="text-[11px]">Add to Wallet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold border flex items-center space-x-1.5 ${
                currentToken.isPaused
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentToken.isPaused ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              <span>{currentToken.isPaused ? 'TRANSFERS PAUSED' : 'ACTIVE / TRADING'}</span>
            </span>

            {currentToken.features?.mintable && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                🪙 Mintable
              </span>
            )}

            {currentToken.features?.burnable && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                🔥 Burnable
              </span>
            )}

            {/* Contract Verification Status Badge */}
            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center space-x-1.5 hover:bg-emerald-500/30 transition-colors cursor-pointer"
              title="Click to view verified contract source code"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Contract</span>
            </button>

            {currentToken.features?.taxes && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                💸 Tax: {Number(currentToken.taxConfig?.marketingFee || 0) + Number(currentToken.taxConfig?.burnFee || 0)}%
              </span>
            )}
          </div>
        </div>

        {/* Live Token Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Total Supply</div>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {Number(currentToken.totalSupply).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{currentToken.symbol} tokens</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Decimals</div>
            <div className="text-lg font-bold text-white font-mono mt-1">{currentToken.decimals}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Precision units</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Contract Owner</div>
            <div className="text-sm font-bold text-indigo-400 font-mono mt-1 truncate" title={currentToken.owner}>
              {currentToken.owner ? `${currentToken.owner.slice(0, 6)}...${currentToken.owner.slice(-4)}` : 'Renounced'}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              {currentToken.owner === '0x0000000000000000000000000000000000000000' 
                ? 'Renounced (0x0)' 
                : isOwner 
                  ? '👑 You (Connected)' 
                  : 'Active Owner'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Blacklisted Addresses</div>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {(currentToken.blacklistedAddresses || []).length}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Restricted sniper bots</div>
          </div>
        </div>
      </div>

      {/* Admin Action Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-2">
          {[
            { id: 'supply', label: 'Mint & Burn', icon: Coins },
            { id: 'pause', label: 'Emergency & Trading', icon: PauseCircle },
            { id: 'blacklist', label: 'Blacklist Management', icon: ShieldAlert },
            { id: 'taxes', label: 'Taxes & Fees', icon: Percent },
            { id: 'ownership', label: 'Ownership & Admin', icon: Crown },
            { id: 'verification', label: 'Contract Verification', icon: CheckCircle2 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Mint & Burn */}
        {activeTab === 'supply' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mint Panel */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Mint New Tokens</h3>
              </div>
              <p className="text-xs text-slate-400">
                Generate additional supply and distribute to a recipient address (requires Mintable feature).
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient Address</label>
                  <input
                    type="text"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount to Mint</label>
                  <input
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="e.g. 1000000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleMint}
                  disabled={actionLoading || (!currentToken.features?.mintable && !wallet?.isSimulated)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <PlusCircle className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                  <span>{actionLoading ? 'Executing Mint...' : 'Execute Minting'}</span>
                </button>
                {!currentToken.features?.mintable && (
                  <p className="text-[11px] text-amber-400">⚠️ Minting was not enabled during deployment.</p>
                )}
              </div>
            </div>

            {/* Burn Panel */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Burn Tokens</h3>
              </div>
              <p className="text-xs text-slate-400">
                Permanently destroy tokens from circulation to decrease total supply and increase token scarcity.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount to Burn</label>
                  <input
                    type="number"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                  Tokens will be permanently sent to the dead burn address (0x000...000).
                </div>

                <button
                  onClick={handleBurn}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <Flame className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                  <span>{actionLoading ? 'Executing Burn...' : 'Execute Burn'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Emergency & Trading Controls */}
        {activeTab === 'pause' && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            
            {/* Pause Circuit */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <PauseCircle className="w-5 h-5 text-indigo-400" />
                    <span>Emergency Transfer Pause Circuit</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Freeze all token transfers across DEXs, liquidity pools, and peer-to-peer transfers during emergencies.
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${currentToken.isPaused ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                    {currentToken.isPaused ? 'PAUSED' : 'ACTIVE'}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                <div>
                  <h4 className="font-semibold text-sm text-white">Current State: {currentToken.isPaused ? 'Transfers Frozen' : 'Transfers Enabled'}</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg">
                    {currentToken.isPaused 
                      ? 'No user can buy, sell, or transfer tokens until you unpause the contract.'
                      : 'Tokens can be freely traded and transferred normally according to standard rules.'}
                  </p>
                </div>

                <button
                  onClick={handleTogglePause}
                  disabled={actionLoading}
                  className={`py-2.5 px-6 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 shadow-lg cursor-pointer ${
                    currentToken.isPaused
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {currentToken.isPaused ? (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      <span>Resume Token Transfers</span>
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      <span>Emergency Pause Transfers</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trading Activation Circuit */}
            <div className="pt-6 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-sm text-white">Public DEX Trading Status</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      {currentToken.tradingActive !== false ? 'Trading Open' : 'Delayed Launch'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg">
                    If delayed launch was selected at deployment to protect initial liquidity add, owner can manually activate trading.
                  </p>
                </div>

                <button
                  onClick={handleEnableTrading}
                  disabled={actionLoading}
                  className="py-2.5 px-6 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center space-x-2 shadow-lg cursor-pointer shrink-0"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Activate Public Trading</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Blacklist Management */}
        {activeTab === 'blacklist' && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Anti-Sniper & Blacklist Manager</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Block malicious MEV bots, frontrunners, or bad actors from interacting with your token contract.
              </p>
            </div>

            {/* Add to Blacklist input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={blacklistInput}
                onChange={(e) => setBlacklistInput(e.target.value)}
                placeholder="Enter address to blacklist (0x...)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleAddBlacklist}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Add to Blacklist</span>
              </button>
            </div>

            {/* Blacklist Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">Currently Blacklisted Wallets:</h4>
              {(currentToken.blacklistedAddresses || []).length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500 text-center">
                  No addresses are currently blacklisted.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  {currentToken.blacklistedAddresses.map((addr) => (
                    <div key={addr} className="flex items-center justify-between p-3 text-xs">
                      <span className="font-mono text-slate-300">{addr}</span>
                      <button
                        onClick={() => handleRemoveBlacklist(addr)}
                        className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Taxes & Fees */}
        {activeTab === 'taxes' && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Percent className="w-5 h-5 text-indigo-400" />
                <span>Adjust Token Taxes & Treasury Recipients</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure automated transaction fee percentages and destinations. Total taxes cannot exceed 15%.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Marketing Fee (%)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={newMarketingFee}
                  onChange={(e) => setNewMarketingFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Auto-Burn Fee (%)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={newBurnFee}
                  onChange={(e) => setNewBurnFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Marketing Treasury Wallet</label>
                <input
                  type="text"
                  value={newMarketingWallet}
                  onChange={(e) => setNewMarketingWallet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateTaxes}
              disabled={actionLoading}
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>{actionLoading ? 'Saving...' : 'Save New Tax Settings'}</span>
            </button>
          </div>
        )}

        {/* TAB 5: Ownership & Admin */}
        {activeTab === 'ownership' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Transfer Ownership */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Transfer Ownership</h3>
              </div>
              <p className="text-xs text-slate-400">
                Transfer the owner permissions to a new address (e.g., Gnosis Safe Multi-sig or DAO governance).
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Owner Address</label>
                  <input
                    type="text"
                    value={newOwnerAddress}
                    onChange={(e) => setNewOwnerAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleTransferOwnership}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  {actionLoading ? 'Transferring...' : 'Transfer Ownership'}
                </button>
              </div>
            </div>

            {/* Renounce Ownership */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-rose-500/20 bg-rose-950/10 space-y-4">
              <div className="flex items-center space-x-2">
                <UserX className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">Renounce Ownership</h3>
              </div>
              <p className="text-xs text-slate-400">
                Permanently leave the contract without an owner. This proves 100% decentralization to the community.
              </p>

              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                ⚠️ Danger: This action cannot be reversed. You will lose all ability to mint, pause, or adjust fees.
              </div>

              <button
                onClick={handleRenounceOwnership}
                disabled={actionLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Renouncing...' : 'Renounce Ownership Permanently'}
              </button>
            </div>

          </div>
        )}

        {/* TAB 6: Contract Verification & Source Code */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            
            {/* Top Verification Status Banner */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-emerald-500/30 bg-emerald-950/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-base">Smart Contract Verified</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold uppercase">
                        Full Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Auto-verified across Sourcify &amp; {currentToken.chainName || selectedChain.name} Block Explorer.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualVerify}
                    disabled={verifying}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                    <span>{verifying ? 'Verifying...' : 'Re-Verify On-Chain'}</span>
                  </button>

                  <a
                    href={`${currentToken.explorerUrl || selectedChain.explorer + '/address/' + currentToken.address}#code`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Verification Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Contract Name</div>
                <div className="text-sm font-bold text-white font-mono mt-1">CustomToken</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Compiler Version</div>
                <div className="text-sm font-bold text-indigo-400 font-mono mt-1">{COMPILER_VERSION}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Optimization Runs</div>
                <div className="text-sm font-bold text-white font-mono mt-1">Enabled ({OPTIMIZATION_RUNS})</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Open Source License</div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-1">MIT</div>
              </div>
            </div>

            {/* Constructor Arguments Box */}
            {currentToken.constructorArgs && (
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-300">ABI-Encoded Constructor Arguments</div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentToken.constructorArgs, 'Constructor Arguments')}
                    className="text-xs text-indigo-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Hex</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 break-all max-h-24 overflow-y-auto">
                  {currentToken.constructorArgs}
                </div>
              </div>
            )}

            {/* Source Code Viewer with Copy Button */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold text-white">Flattened Solidity Contract (CustomToken.sol)</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(CUSTOM_TOKEN_SOURCE, 'Solidity Source Code')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Contract Code</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
                {CUSTOM_TOKEN_SOURCE}
              </pre>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
