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
  Search
} from 'lucide-react';
import { getStoredTokens, updateStoredToken } from '../utils/web3Service';

export default function TokenDashboard({
  wallet,
  selectedChain,
  onShowToast
}) {
  const [tokens, setTokens] = useState([]);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState('');
  const [customSearchAddress, setCustomSearchAddress] = useState('');
  const [activeTab, setActiveTab] = useState('supply'); // 'supply', 'pause', 'blacklist', 'taxes', 'ownership'

  // Operation form states
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('1000000');
  const [burnAmount, setBurnAmount] = useState('500000');
  const [blacklistInput, setBlacklistInput] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [newMarketingFee, setNewMarketingFee] = useState(2);
  const [newBurnFee, setNewBurnFee] = useState(1);
  const [newMarketingWallet, setNewMarketingWallet] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Load stored tokens
  const reloadTokens = () => {
    const list = getStoredTokens();
    setTokens(list);
    if (list.length > 0 && !selectedTokenAddress) {
      setSelectedTokenAddress(list[0].address);
    }
  };

  useEffect(() => {
    reloadTokens();
  }, []);

  const currentToken = tokens.find(t => t.address.toLowerCase() === selectedTokenAddress?.toLowerCase()) || tokens[0];

  useEffect(() => {
    if (currentToken) {
      setMintAddress(wallet.address || currentToken.owner);
      setNewMarketingFee(currentToken.taxConfig?.marketingFee || 2);
      setNewBurnFee(currentToken.taxConfig?.burnFee || 1);
      setNewMarketingWallet(currentToken.taxConfig?.marketingWallet || currentToken.owner);
    }
  }, [currentToken, wallet.address]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    onShowToast({
      type: 'info',
      title: 'Copied',
      message: `${label} copied to clipboard!`
    });
  };

  // 1. Mint Tokens Action
  const handleMint = () => {
    if (!mintAddress || !mintAmount) {
      onShowToast({ type: 'error', title: 'Input Error', message: 'Enter recipient address and amount.' });
      return;
    }
    setActionLoading(true);
    setTimeout(() => {
      const currentSupplyNum = Number(currentToken.totalSupply) || 0;
      const mintNum = Number(mintAmount) || 0;
      const newTotal = (currentSupplyNum + mintNum).toString();

      updateStoredToken(currentToken.address, { totalSupply: newTotal });
      reloadTokens();
      setActionLoading(false);
      onShowToast({
        type: 'success',
        title: 'Mint Transaction Confirmed',
        message: `Minted ${Number(mintAmount).toLocaleString()} ${currentToken.symbol} to ${mintAddress.slice(0, 6)}...`
      });
    }, 1200);
  };

  // 2. Burn Tokens Action
  const handleBurn = () => {
    if (!burnAmount) {
      onShowToast({ type: 'error', title: 'Input Error', message: 'Enter amount to burn.' });
      return;
    }
    setActionLoading(true);
    setTimeout(() => {
      const currentSupplyNum = Number(currentToken.totalSupply) || 0;
      const burnNum = Number(burnAmount) || 0;
      const newTotal = Math.max(0, currentSupplyNum - burnNum).toString();

      updateStoredToken(currentToken.address, { totalSupply: newTotal });
      reloadTokens();
      setActionLoading(false);
      onShowToast({
        type: 'success',
        title: 'Tokens Burned',
        message: `Burned ${Number(burnAmount).toLocaleString()} ${currentToken.symbol}. Total supply reduced.`
      });
    }, 1200);
  };

  // 3. Pause / Unpause Action
  const handleTogglePause = () => {
    setActionLoading(true);
    setTimeout(() => {
      const newPausedState = !currentToken.isPaused;
      updateStoredToken(currentToken.address, { isPaused: newPausedState });
      reloadTokens();
      setActionLoading(false);
      onShowToast({
        type: newPausedState ? 'error' : 'success',
        title: newPausedState ? 'Contract Paused' : 'Contract Resumed',
        message: newPausedState 
          ? 'Token transfers are now paused globally across all DEXs and wallets.'
          : 'Token transfers are now resumed and active.'
      });
    }, 1200);
  };

  // 4. Blacklist Add / Remove
  const handleAddBlacklist = () => {
    if (!blacklistInput) return;
    const currentList = currentToken.blacklistedAddresses || [];
    if (currentList.includes(blacklistInput)) {
      onShowToast({ type: 'info', title: 'Already Blacklisted', message: 'This address is already blacklisted.' });
      return;
    }
    const updated = [...currentList, blacklistInput];
    updateStoredToken(currentToken.address, { blacklistedAddresses: updated });
    reloadTokens();
    setBlacklistInput('');
    onShowToast({
      type: 'success',
      title: 'Address Blacklisted',
      message: `Restricted ${blacklistInput.slice(0, 6)}... from trading.`
    });
  };

  const handleRemoveBlacklist = (addr) => {
    const updated = (currentToken.blacklistedAddresses || []).filter(a => a.toLowerCase() !== addr.toLowerCase());
    updateStoredToken(currentToken.address, { blacklistedAddresses: updated });
    reloadTokens();
    onShowToast({
      type: 'info',
      title: 'Address Removed',
      message: `Removed ${addr.slice(0, 6)}... from blacklist.`
    });
  };

  // 5. Update Taxes
  const handleUpdateTaxes = () => {
    setActionLoading(true);
    setTimeout(() => {
      const updatedTax = {
        marketingFee: Number(newMarketingFee),
        burnFee: Number(newBurnFee),
        marketingWallet: newMarketingWallet
      };
      updateStoredToken(currentToken.address, { taxConfig: updatedTax });
      reloadTokens();
      setActionLoading(false);
      onShowToast({
        type: 'success',
        title: 'Tax Configuration Saved',
        message: `Updated to ${newMarketingFee}% Marketing and ${newBurnFee}% Auto-Burn.`
      });
    }, 1200);
  };

  // 6. Ownership Transfer or Renounce
  const handleTransferOwnership = () => {
    if (!newOwnerAddress) return;
    setActionLoading(true);
    setTimeout(() => {
      updateStoredToken(currentToken.address, { owner: newOwnerAddress });
      reloadTokens();
      setActionLoading(false);
      onShowToast({
        type: 'success',
        title: 'Ownership Transferred',
        message: `New contract owner is ${newOwnerAddress.slice(0, 8)}...`
      });
      setNewOwnerAddress('');
    }, 1200);
  };

  const handleRenounceOwnership = () => {
    if (!window.confirm('⚠️ WARNING: Renouncing ownership will permanently make the contract immutable with NO owner. Are you 100% sure?')) {
      return;
    }
    setActionLoading(true);
    setTimeout(() => {
      updateStoredToken(currentToken.address, { owner: '0x0000000000000000000000000000000000000000' });
      reloadTokens();
      setActionLoading(false);
      onShowToast({
        type: 'info',
        title: 'Ownership Renounced',
        message: 'Contract ownership permanently transferred to 0x000...000.'
      });
    }, 1200);
  };

  if (!currentToken) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <Coins className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">No Tokens Available</h3>
        <p className="text-sm text-slate-400">Deploy a token first using the Token Forge tab to manage it here.</p>
      </div>
    );
  }

  const isOwner = wallet.address?.toLowerCase() === currentToken.owner?.toLowerCase() || wallet.isSimulated;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Token Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Coins className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Token Owner Dashboard</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Admin Suite
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage contract state, execute token minting, burn tokens, control taxes, and adjust security parameters.
          </p>
        </div>

        {/* Token Switcher */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-400 font-semibold whitespace-nowrap">Select Token:</label>
          <select
            value={selectedTokenAddress}
            onChange={(e) => setSelectedTokenAddress(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
          >
            {tokens.map((tok) => (
              <option key={tok.address} value={tok.address}>
                {tok.name} ({tok.symbol}) - {tok.chainName || 'Testnet'}
              </option>
            ))}
          </select>
          <button
            onClick={reloadTokens}
            title="Reload token list"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

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
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {currentToken.chainName}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-400">
                <span>Contract:</span>
                <span className="font-mono text-slate-300">{currentToken.address}</span>
                <button
                  onClick={() => copyToClipboard(currentToken.address, 'Contract Address')}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`${selectedChain.explorer}/address/${currentToken.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 inline-flex items-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
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

            {currentToken.features?.transferTax && (
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
              {currentToken.owner === '0x0000000000000000000000000000000000000000' ? 'Renounced (0x0)' : 'Active Owner'}
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
            { id: 'pause', label: 'Emergency Controls', icon: PauseCircle },
            { id: 'blacklist', label: 'Blacklist Management', icon: ShieldAlert },
            { id: 'taxes', label: 'Taxes & Fees', icon: Percent },
            { id: 'ownership', label: 'Ownership & Admin', icon: Crown }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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
                  disabled={actionLoading || !currentToken.features?.mintable}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Execute Minting</span>
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
                  Tokens will be sent to the zero burn address (0x000...000) permanently.
                </div>

                <button
                  onClick={handleBurn}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md"
                >
                  <Flame className="w-4 h-4" />
                  <span>Execute Burn</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Emergency Pause Controls */}
        {activeTab === 'pause' && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
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

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                className={`py-2.5 px-6 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 shadow-lg ${
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
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-2 shadow-md"
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
                        className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20"
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
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md"
            >
              Save New Tax Settings
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
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                >
                  Transfer Ownership
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
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
              >
                Renounce Ownership Permanently
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
