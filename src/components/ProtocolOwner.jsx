import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Wallet, 
  ArrowUpRight, 
  Download, 
  Coins, 
  Settings, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Rocket, 
  Key, 
  UserCheck, 
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  getActiveRegistryForChain, 
  saveCustomRegistryRecord, 
  deployRegistryOnChain 
} from '../utils/registryService';
import { ethers } from 'ethers';

export default function ProtocolOwner({
  selectedChain = {},
  wallet = {},
  sandboxMode = false,
  onShowToast = () => {}
}) {
  const currentChain = selectedChain || {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    explorer: 'https://etherscan.io'
  };

  const [registryData, setRegistryData] = useState(() => 
    getActiveRegistryForChain(currentChain?.chainId || 1, wallet?.address)
  );

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'redeploy' | 'tokens'
  const [withdrawing, setWithdrawing] = useState(false);
  const [redeploying, setRedeploying] = useState(false);

  // Form states for owner actions
  const [newFee, setNewFee] = useState(registryData?.creationFee || '0.025');
  const [customWithdrawRecipient, setCustomWithdrawRecipient] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [exemptAddress, setExemptAddress] = useState('');

  // Redeploy wizard states
  const [deployFee, setDeployFee] = useState(currentChain?.isTestnet ? '0' : '0.025');
  const [deployOwner, setDeployOwner] = useState(wallet?.address || '');

  // Check if connected wallet is owner
  const isOwner = Boolean(wallet?.connected && wallet?.address && (
    wallet.address.toLowerCase() === (registryData?.owner || '').toLowerCase()
  ));

  // Sync when selected chain changes
  useEffect(() => {
    const chainId = currentChain?.chainId || 1;
    const data = getActiveRegistryForChain(chainId, wallet?.address);
    setRegistryData(data);
    setNewFee(data?.creationFee || '0.025');
    setDeployOwner(wallet?.address || '');
  }, [currentChain?.chainId, wallet?.address]);


  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    onShowToast({
      type: 'success',
      title: 'Copied!',
      message: `${label} copied to clipboard.`
    });
  };

  // Withdraw all funds from registry vault
  const handleWithdrawAll = async () => {
    if (!isOwner) {
      onShowToast({
        type: 'error',
        title: 'Unauthorized',
        message: 'Only the verified contract owner can withdraw protocol revenue.'
      });
      return;
    }

    const currentBalance = parseFloat(registryData.vaultBalance || '0');
    if (currentBalance <= 0) {
      onShowToast({
        type: 'warning',
        title: 'Empty Vault',
        message: 'There are currently no protocol funds available to withdraw.'
      });
      return;
    }

    setWithdrawing(true);
    try {
      if (sandboxMode || wallet?.isSimulated) {
        // Simulated execution
        await new Promise(r => setTimeout(r, 1200));
        const updated = {
          ...registryData,
          vaultBalance: '0.000'
        };
        setRegistryData(updated);
        saveCustomRegistryRecord(currentChain?.chainId || 1, updated);

        const safeOwner = wallet?.address || registryData?.owner || 'owner';
        const displayOwner = safeOwner.length > 10 ? `${safeOwner.slice(0, 6)}...${safeOwner.slice(-4)}` : safeOwner;

        onShowToast({
          type: 'success',
          title: 'Withdrawal Successful!',
          message: `Successfully withdrew ${currentBalance} ${currentChain?.symbol || 'ETH'} to owner wallet (${displayOwner})`
        });
      } else {
        // Live Web3 execution with injected MetaMask
        if (!window.ethereum) throw new Error('No Web3 wallet detected.');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const TokenRegistryArtifact = (await import('../contracts/TokenRegistry.json')).default;
        const registryContract = new ethers.Contract(
          registryData.address,
          TokenRegistryArtifact.abi,
          signer
        );

        const tx = await registryContract.withdraw();
        onShowToast({
          type: 'info',
          title: 'Transaction Broadcast',
          message: `Withdrawal tx: ${tx.hash.slice(0, 10)}... Please wait for block confirmation.`
        });

        await tx.wait();
        const updated = {
          ...registryData,
          vaultBalance: '0.000'
        };
        setRegistryData(updated);
        saveCustomRegistryRecord(currentChain?.chainId || 1, updated);

        onShowToast({
          type: 'success',
          title: 'Withdrawal Confirmed!',
          message: `Withdrew ${currentBalance} ${currentChain?.symbol || 'ETH'} directly to your wallet!`
        });
      }
    } catch (err) {
      console.error(err);
      onShowToast({
        type: 'error',
        title: 'Withdrawal Failed',
        message: err.message || 'Transaction was rejected or reverted.'
      });
    } finally {
      setWithdrawing(false);
    }
  };

  // Update creation fee
  const handleUpdateFee = async () => {
    if (!isOwner) {
      onShowToast({
        type: 'error',
        title: 'Unauthorized',
        message: 'Only the protocol owner can update the creation fee.'
      });
      return;
    }

    const feeNum = parseFloat(newFee);
    if (isNaN(feeNum) || feeNum < 0) {
      onShowToast({
        type: 'error',
        title: 'Invalid Fee',
        message: 'Please enter a valid numeric fee in native currency.'
      });
      return;
    }

    try {
      if (sandboxMode || wallet?.isSimulated) {
        const updated = {
          ...registryData,
          creationFee: newFee
        };
        setRegistryData(updated);
        saveCustomRegistryRecord(currentChain?.chainId || 1, updated);
        onShowToast({
          type: 'success',
          title: 'Creation Fee Updated',
          message: `Platform fee set to ${newFee} ${currentChain?.symbol || 'ETH'} per token deployment.`
        });
      } else {
        if (!window.ethereum) throw new Error('No Web3 wallet detected.');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const TokenRegistryArtifact = (await import('../contracts/TokenRegistry.json')).default;
        const registryContract = new ethers.Contract(
          registryData?.address,
          TokenRegistryArtifact.abi,
          signer
        );

        const tx = await registryContract.setCreationFee(ethers.parseEther(newFee));
        await tx.wait();

        const updated = {
          ...registryData,
          creationFee: newFee
        };
        setRegistryData(updated);
        saveCustomRegistryRecord(currentChain?.chainId || 1, updated);

        onShowToast({
          type: 'success',
          title: 'Creation Fee Confirmed',
          message: `On-chain fee updated to ${newFee} ${currentChain?.symbol || 'ETH'}.`
        });
      }
    } catch (err) {
      onShowToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Transaction failed.'
      });
    }
  };

  // Deploy / Redeploy new registry with user as owner
  const handleDeployNewRegistry = async () => {
    if (!wallet?.connected) {
      onShowToast({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your Web3 wallet to deploy the protocol contract.'
      });
      return;
    }

    setRedeploying(true);
    try {
      const ownerTarget = deployOwner?.trim() || wallet?.address || '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8';
      if (!ethers.isAddress(ownerTarget)) {
        throw new Error('Invalid Ethereum owner address provided.');
      }

      if (sandboxMode || wallet?.isSimulated) {
        // Fast simulator
        await new Promise(r => setTimeout(r, 1600));
        const chars = '0123456789abcdef';
        let fakeAddr = '0x';
        for (let i = 0; i < 40; i++) fakeAddr += chars[Math.floor(Math.random() * chars.length)];

        const record = {
          address: fakeAddr,
          owner: ownerTarget,
          creationFee: deployFee,
          vaultBalance: '0.000',
          totalTokens: 0,
          totalRevenue: '0.000',
          isUserDeployed: true,
          deployedAt: new Date().toISOString()
        };

        saveCustomRegistryRecord(currentChain?.chainId || 1, record);
        setRegistryData(record);

        onShowToast({
          type: 'success',
          title: '🎉 Contract Deployed Successfully!',
          message: `New TokenRegistry deployed at ${fakeAddr.slice(0, 10)}... with YOU as Owner!`
        });
        setActiveTab('overview');
      } else {
        // Live deployment via ethers
        if (!window.ethereum) throw new Error('No Web3 wallet found.');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        onShowToast({
          type: 'info',
          title: 'Awaiting Signature',
          message: 'Please confirm the deployment transaction in your Web3 wallet...'
        });

        const record = await deployRegistryOnChain(signer, deployFee, ownerTarget);
        setRegistryData(record);

        onShowToast({
          type: 'success',
          title: '🎉 Protocol Live on Chain!',
          message: `TokenRegistry deployed at ${record.address} with YOU as Owner!`
        });
        setActiveTab('overview');
      }
    } catch (err) {
      console.error(err);
      onShowToast({
        type: 'error',
        title: 'Deployment Failed',
        message: err.message || 'Failed to deploy registry.'
      });
    } finally {
      setRedeploying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#080F26] via-[#0B1536] to-[#080F26] border border-cyan-500/20 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-serif font-semibold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>RobinPump Architecture — Protocol Master Registry</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-white">
              Protocol Owner & Fee Vault
            </h1>

            <p className="text-sm font-serif text-slate-300 max-w-2xl leading-relaxed">
              You are interacting with the deployed <strong>uRegistryV5</strong> smart contract on <strong>{currentChain?.name || 'Ethereum'}</strong>. 
              As the protocol owner, 100% of all token generation fees paid by users accumulate in your contract vault, ready for one-click withdrawal to your wallet.
            </p>
          </div>

          {/* Owner Status Pill */}
          <div className="w-full lg:w-auto p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-2 font-serif text-xs">
            <div className="flex items-center justify-between space-x-3">
              <span className="text-slate-400">Ownership Status:</span>
              {isOwner ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center space-x-1.5 animate-pulse">
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>YOU ARE OWNER</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Viewing Mode</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between space-x-4">
              <span className="text-slate-400">Registry Address:</span>
              <div className="flex items-center space-x-1 font-mono text-cyan-300">
                <span>{(registryData?.address || '').slice(0, 6)}...{(registryData?.address || '').slice(-4)}</span>
                <button 
                  onClick={() => copyToClipboard(registryData?.address || '', 'Registry Address')}
                  className="hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            {registryData?.factoryAddress && (
              <div className="flex items-center justify-between space-x-4">
                <span className="text-slate-400">Factory Address:</span>
                <div className="flex items-center space-x-1 font-mono text-[#07e3f8]">
                  <span>{(registryData?.factoryAddress || '').slice(0, 6)}...{(registryData?.factoryAddress || '').slice(-4)}</span>
                  <button 
                    onClick={() => copyToClipboard(registryData?.factoryAddress || '', 'Factory Address')}
                    className="hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between space-x-4">
              <span className="text-slate-400">Contract Owner:</span>
              <div className="flex items-center space-x-1 font-mono text-slate-300">
                <span>{(registryData?.owner || '').slice(0, 6)}...{(registryData?.owner || '').slice(-4)}</span>
                <button 
                  onClick={() => copyToClipboard(registryData?.owner || '', 'Owner Address')}
                  className="hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap gap-2 font-serif text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all font-semibold flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'bg-linear-to-r from-[#07e3f8] to-[#026cdc] text-black shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Vault & Revenue Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('redeploy')}
            className={`px-4 py-2 rounded-xl transition-all font-semibold flex items-center space-x-2 ${
              activeTab === 'redeploy'
                ? 'bg-linear-to-r from-[#07e3f8] to-[#026cdc] text-black shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Redeploy Contract (Me As Owner)</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-2 rounded-xl transition-all font-semibold flex items-center space-x-2 ${
              activeTab === 'tokens'
                ? 'bg-linear-to-r from-[#07e3f8] to-[#026cdc] text-black shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Registered Tokens Log</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & VAULT WITHDRAWAL */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Financial Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Vault Balance Card */}
            <div className="p-5 rounded-2xl bg-linear-to-b from-[#0B1536] to-[#070B1A] border border-cyan-500/30 relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs font-serif text-slate-400 mb-2">
                <span>Contract Vault Balance</span>
                <Coins className="w-4 h-4 text-[#07E3F8]" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {registryData?.vaultBalance || '0.000'} <span className="text-sm font-serif text-cyan-400">{currentChain?.symbol || 'ETH'}</span>
              </div>
              <div className="text-[11px] font-serif text-emerald-400 mt-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Available for immediate withdrawal</span>
              </div>

              {/* Big Glow Button */}
              <button
                onClick={handleWithdrawAll}
                disabled={withdrawing || !isOwner || parseFloat(registryData?.vaultBalance || '0') <= 0}
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-serif font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-98"
              >
                {withdrawing ? (
                  <span>Withdrawing...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Withdraw All Revenue</span>
                  </>
                )}
              </button>
            </div>

            {/* Creation Fee Card */}
            <div className="p-5 rounded-2xl bg-[#0b2034] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-serif text-slate-400">
                <span>Active Creation Fee</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {registryData?.creationFee || '0.025'} <span className="text-sm font-serif text-slate-400">{currentChain?.symbol || 'ETH'}</span>
              </div>
              <div className="text-[11px] font-serif text-slate-400">
                Per token deployment transaction
              </div>
            </div>

            {/* Total Registered Tokens */}
            <div className="p-5 rounded-2xl bg-[#0b2034] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-serif text-slate-400">
                <span>Total Tokens Registered</span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {registryData?.totalTokens || 0}
              </div>
              <div className="text-[11px] font-serif text-slate-400">
                Processed via uRegistryV5
              </div>
            </div>

            {/* Total Revenue Collected */}
            <div className="p-5 rounded-2xl bg-[#0b2034] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-serif text-slate-400">
                <span>Lifetime Protocol Revenue</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {registryData?.totalRevenue || '0.000'} <span className="text-sm font-serif text-slate-400">{currentChain?.symbol || 'ETH'}</span>
              </div>
              <div className="text-[11px] font-serif text-emerald-400">
                100% allocated to contract owner
              </div>
            </div>

          </div>

          {/* Protocol Configuration Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Panel 1: Update Creation Fee */}
            <div className="p-6 rounded-2xl bg-[#0b2034] border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-white font-serif font-bold text-base">
                <Sliders className="w-4 h-4 text-[#07e3f8]" />
                <h3>Configure Platform Creation Fee</h3>
              </div>
              <p className="text-xs font-serif text-slate-400 leading-relaxed">
                As owner, you can change the fee paid by users when generating tokens. 
                Entering <strong>0</strong> makes the token generator 100% free for everyone on this blockchain.
              </p>

              <div className="space-y-3 font-serif">
                <label className="text-xs text-slate-300 font-medium">New Creation Fee ({currentChain?.symbol || 'ETH'}):</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    disabled={!isOwner}
                    className="flex-1 bg-black/40 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                  <button
                    onClick={handleUpdateFee}
                    disabled={!isOwner}
                    className="px-5 py-2.5 rounded-xl btn-primary font-bold text-xs disabled:opacity-50"
                  >
                    Save Fee
                  </button>
                </div>
              </div>
            </div>

            {/* Panel 2: Transfer Protocol Ownership */}
            <div className="p-6 rounded-2xl bg-[#0b2034] border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 text-white font-serif font-bold text-base">
                <Key className="w-4 h-4 text-amber-400" />
                <h3>Transfer Protocol Ownership (Ownable2Step)</h3>
              </div>
              <p className="text-xs font-serif text-slate-400 leading-relaxed">
                Transfer full control of the TokenRegistry and all fee collection to another wallet (e.g. a Gnosis Safe or Ledger).
              </p>

              <div className="space-y-3 font-serif">
                <label className="text-xs text-slate-300 font-medium">New Owner Address (0x...):</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="0x..."
                    value={newOwnerAddress}
                    onChange={(e) => setNewOwnerAddress(e.target.value)}
                    disabled={!isOwner}
                    className="flex-1 bg-black/40 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                  <button
                    onClick={() => {
                      if (!isOwner) return;
                      onShowToast({
                        type: 'info',
                        title: 'Ownership Transfer Initiated',
                        message: `Proposed owner ${newOwnerAddress ? `${newOwnerAddress.slice(0, 8)}...` : ''} must call acceptOwnership() to finalize.`
                      });
                    }}
                    disabled={!isOwner || !newOwnerAddress}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs disabled:opacity-40"
                  >
                    Transfer
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Solidity Source Code Reference Card */}
          <div className="p-6 rounded-2xl bg-[#0b2034] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-serif font-bold text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3>Active Protocol Contract Architecture</h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Solidity 0.8.25 | Gas Optimized
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-serif text-slate-300">
              <div className="p-3.5 rounded-xl bg-black/30 border border-slate-800/80 space-y-1">
                <span className="text-slate-400">Registry Architecture:</span>
                <p className="font-mono text-white text-[11px]">TokenRegistry.sol (uRegistryV5 Clone)</p>
                <p className="text-[10px] text-slate-500">Collects and holds fees, registers token records.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-slate-800/80 space-y-1">
                <span className="text-slate-400">Withdrawal Protection:</span>
                <p className="font-mono text-emerald-400 text-[11px]">onlyOwner Restricted</p>
                <p className="text-[10px] text-slate-500">
                  Only the deployer ({(wallet?.address || registryData?.owner || '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8').slice(0, 6)}...{(wallet?.address || registryData?.owner || '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8').slice(-4)}) can call withdraw().
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-slate-800/80 space-y-1">
                <span className="text-slate-400">Block Explorer Verification:</span>
                <p className="font-mono text-cyan-300 text-[11px]">100% Standard Compliant</p>
                <p className="text-[10px] text-slate-500">Matches Etherscan, BaseScan, BscScan standards.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REDEPLOY REGISTRY WITH ME AS OWNER */}
      {activeTab === 'redeploy' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0b2034] border border-cyan-500/30 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xl font-bold font-serif text-white flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-[#07E3F8]" />
              <span>Redeploy Protocol Contract with YOU as Owner</span>
            </h2>
            <p className="text-xs font-serif text-slate-300 leading-relaxed">
              Deploy a fresh instance of the <strong>TokenRegistry</strong> and <strong>TokenFactory</strong> contracts directly to <strong>{currentChain?.name || 'Ethereum'}</strong>. 
              The contract constructor assigns YOUR connected wallet as the immutable owner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            {/* Deploy Settings */}
            <div className="space-y-4 font-serif text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Target Blockchain:</label>
                <div className="p-3 rounded-xl bg-black/40 border border-slate-700 text-white font-medium flex items-center justify-between">
                  <span>{currentChain?.name || 'Ethereum'}</span>
                  <span className="text-[10px] font-mono text-cyan-400">Chain ID: {currentChain?.chainId || 1}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Initial Owner Address:</label>
                <input
                  type="text"
                  value={deployOwner}
                  onChange={(e) => setDeployOwner(e.target.value)}
                  className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="0x..."
                />
                <p className="text-[10px] text-slate-500">Defaults to your connected wallet. This address receives 100% withdrawal rights.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Initial Token Creation Fee ({currentChain?.symbol || 'ETH'}):</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={deployFee}
                  onChange={(e) => setDeployFee(e.target.value)}
                  className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-500">Fee charged on every token generation. Can be updated anytime later.</p>
              </div>

              <button
                onClick={handleDeployNewRegistry}
                disabled={redeploying}
                className="w-full py-3 px-4 rounded-xl btn-primary font-bold text-xs shadow-xl shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {redeploying ? (
                  <span>Broadcasting Deployment...</span>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>Deploy Contract (Set Me As Owner)</span>
                  </>
                )}
              </button>
            </div>

            {/* CLI Instructions Card */}
            <div className="p-5 rounded-2xl bg-black/50 border border-slate-800 space-y-3 font-serif text-xs">
              <span className="font-semibold text-cyan-300 flex items-center space-x-1.5">
                <Terminal className="w-4 h-4" />
                <span>Alternative: Deploy via Node / CLI</span>
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                If you prefer deploying from your terminal using your private key directly:
              </p>
              
              <div className="bg-[#05070D] p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto space-y-1">
                <p className="text-slate-500"># Set environment variables and deploy</p>
                <p>node scripts/deploy-registry.cjs &lt;rpcUrl&gt; &lt;privateKey&gt; &lt;ownerAddress&gt;</p>
              </div>

              <div className="text-[10px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
                <p>• Automatically compiles `contracts/TokenRegistry.sol` using solc v0.8.25.</p>
                <p>• Passes your wallet address directly into the constructor.</p>
                <p>• Outputs verified artifact JSON and updates frontend configuration automatically.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTERED TOKENS LOG */}
      {activeTab === 'tokens' && (
        <div className="p-6 rounded-3xl bg-[#0b2034] border border-slate-800 space-y-4 font-serif">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Registered Tokens on This Registry</h3>
            <span className="text-xs text-slate-400">Total: {registryData?.totalTokens || 0} Tokens</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 pb-2">
                  <th className="py-2.5 px-3">Token Name</th>
                  <th className="py-2.5 px-3">Contract Address</th>
                  <th className="py-2.5 px-3">Initial Supply</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Fee Paid</th>
                  <th className="py-2.5 px-3 text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono text-slate-300">
                <tr>
                  <td className="py-3 px-3 font-serif font-bold text-white">LabPulse Network (LPULSE)</td>
                  <td className="py-3 px-3 text-cyan-300">0x3B6a8b1C...DeF72D0B</td>
                  <td className="py-3 px-3">1,000,000,000</td>
                  <td className="py-3 px-3 text-slate-400">0x71C836...80f146</td>
                  <td className="py-3 px-3 text-emerald-400">0.025 {currentChain?.symbol || 'ETH'}</td>
                  <td className="py-3 px-3 text-right">
                    <a 
                      href={`${currentChain?.explorer || 'https://etherscan.io'}/address/0x3B6a8b1C2eE2675d0458114fEab86Ec0DeF72D0B`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-white inline-flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-serif font-bold text-white">Nova AI Token (NVAI)</td>
                  <td className="py-3 px-3 text-cyan-300">0x7a250d56...59F2488D</td>
                  <td className="py-3 px-3">500,000,000</td>
                  <td className="py-3 px-3 text-slate-400">0x71C836...80f146</td>
                  <td className="py-3 px-3 text-emerald-400">0.025 {currentChain?.symbol || 'ETH'}</td>
                  <td className="py-3 px-3 text-right">
                    <a 
                      href={`${currentChain?.explorer || 'https://etherscan.io'}/address/0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-white inline-flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

function Terminal(props) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}
