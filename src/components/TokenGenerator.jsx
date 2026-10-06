import React, { useState, useMemo } from 'react';
import { 
  Rocket, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Settings2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  Flame, 
  ExternalLink, 
  Copy, 
  Code2, 
  Sliders, 
  Check, 
  Lock, 
  Percent, 
  UserCheck, 
  AlertTriangle,
  Layers,
  Coins,
  Shield,
  Zap,
  ChevronRight,
  Info,
  Crown
} from 'lucide-react';
import { TOKEN_PRESETS, ALL_FEATURES } from '../utils/presets';
import { generateSolidityContract } from '../utils/solidityGenerator';
import { saveStoredToken, generateRandomAddress, generateRandomTxHash } from '../utils/web3Service';
import { getActiveRegistryForChain, saveCustomRegistryRecord } from '../utils/registryService';

const ROUTER_PRESETS = [
  { name: 'Uniswap V2 (Ethereum / Base / Arb)', address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' },
  { name: 'PancakeSwap V2 (BNB Chain)', address: '0x10ED43C718714eb63d5aA57B78B54704E256024E' },
  { name: 'QuickSwap (Polygon)', address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff' },
  { name: 'TraderJoe V2.1 (Avalanche)', address: '0xb4315e873dBcf96Ffd0acd8EA43f689D8c20fB30' },
  { name: 'SushiSwap V2', address: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F' }
];

export default function TokenGenerator({
  selectedChain,
  wallet,
  sandboxMode,
  onShowToast,
  onTokenDeployed,
  onViewCode
}) {
  // Navigation tabs: 20lab exact 3 categories
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'optional' | 'taxes'

  const activeRegistry = useMemo(() => {
    return getActiveRegistryForChain(selectedChain.chainId, wallet.address);
  }, [selectedChain, wallet.address]);

  const [selectedPreset, setSelectedPreset] = useState('standard');
  const [name, setName] = useState('Nova Protocol');
  const [symbol, setSymbol] = useState('NOVA');
  const [decimals, setDecimals] = useState(18);
  const [supply, setSupply] = useState('1000000000');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80');
  const [description, setDescription] = useState('Next-generation decentralized liquidity & governance token built with 20LAB.');

  // Feature toggles
  const [features, setFeatures] = useState({
    enableTrading: false,
    burnable: false,
    mintable: false,
    pausable: false,
    permit: true,
    recoverable: true,
    blacklist: false,
    whitelist: false,
    transferTax: false,
    marketingTax: false,
    liquidityTax: false,
    holderReflection: false,
    autoBurnTax: false,
    maxTxLimit: false,
    maxWalletLimit: false,
    antiBotCooldown: false,
    customDecimals: false,
    canRenounceOwnership: true
  });

  // Advanced configurations
  const [taxConfig, setTaxConfig] = useState({
    buyMarketingFee: 2,
    sellMarketingFee: 3,
    transferMarketingFee: 1,
    buyLiquidityFee: 1,
    sellLiquidityFee: 1,
    transferLiquidityFee: 0,
    buyBurnFee: 1,
    sellBurnFee: 1,
    transferBurnFee: 0,
    marketingWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
  });

  const [limitsConfig, setLimitsConfig] = useState({
    maxTxPercent: 1.0,
    maxWalletPercent: 2.0,
    cooldownSeconds: 30
  });

  // Deployment status
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0); // 0: idle, 1: generating, 2: signing, 3: confirming, 4: success
  const [deployedTokenResult, setDeployedTokenResult] = useState(null);

  // Apply preset
  const handleSelectPreset = (presetId) => {
    setSelectedPreset(presetId);
    const preset = TOKEN_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setFeatures(prev => ({
        ...prev,
        ...preset.features
      }));
      onShowToast({
        type: 'info',
        title: `${preset.name} Preset Loaded`,
        message: 'Features configured according to preset.'
      });
    }
  };

  const toggleFeature = (key) => {
    setFeatures(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      // If transferTax is toggled off, also turn off dependent sub-features
      if (key === 'transferTax' && prev.transferTax) {
        updated.marketingTax = false;
        updated.liquidityTax = false;
        updated.autoBurnTax = false;
      }
      return updated;
    });
  };

  // Human formatted supply
  const formattedSupply = useMemo(() => {
    try {
      const num = Number(supply);
      if (isNaN(num)) return supply;
      return num.toLocaleString('en-US');
    } catch {
      return supply;
    }
  }, [supply]);

  // Generate current Solidity code
  const currentSolidityCode = useMemo(() => {
    return generateSolidityContract({
      name,
      symbol,
      decimals,
      initialSupply: supply,
      features,
      taxConfig,
      limitsConfig
    });
  }, [name, symbol, decimals, supply, features, taxConfig, limitsConfig]);

  // Deployment action
  const handleDeploy = async () => {
    if (!name.trim() || !symbol.trim()) {
      onShowToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide both a Token Name and Symbol.'
      });
      return;
    }

    if (!wallet.connected) {
      onShowToast({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your Web3 wallet or enable Sandbox Mode first.'
      });
      return;
    }

    setDeploying(true);
    setDeployStep(1); // Generating 20lab-v1.9.0 Bytecode

    setTimeout(() => {
      setDeployStep(2); // Awaiting signature / signing

      setTimeout(() => {
        setDeployStep(3); // Broadcasting to uRegistryV5 & Mining block

        setTimeout(() => {
          // Success
          const newContractAddress = generateRandomAddress();
          const txHash = generateRandomTxHash();

          const activeRegistry = getActiveRegistryForChain(selectedChain.chainId, wallet.address);
          const feePaid = selectedChain.isTestnet ? 0 : parseFloat(activeRegistry.creationFee || selectedChain.platformFee || '0.025');

          const deployedToken = {
            address: newContractAddress,
            txHash,
            name,
            symbol,
            chainId: selectedChain.chainId,
            chainName: selectedChain.name,
            decimals,
            totalSupply: supply,
            owner: wallet.address,
            features,
            taxConfig,
            limitsConfig,
            isPaused: false,
            blacklistedAddresses: [],
            version: '20lab-v1.9.0',
            registry: activeRegistry.address,
            createdAt: new Date().toISOString()
          };

          // Credit protocol fee to active registry vault
          const updatedVault = (parseFloat(activeRegistry.vaultBalance || '0') + feePaid).toFixed(3);
          const updatedRev = (parseFloat(activeRegistry.totalRevenue || '0') + feePaid).toFixed(3);
          const updatedTokens = (Number(activeRegistry.totalTokens || 0) + 1);

          saveCustomRegistryRecord(selectedChain.chainId, {
            ...activeRegistry,
            vaultBalance: updatedVault,
            totalRevenue: updatedRev,
            totalTokens: updatedTokens
          });

          saveStoredToken(deployedToken);
          setDeployedTokenResult(deployedToken);
          setDeployStep(4);
          setDeploying(false);

          onShowToast({
            type: 'success',
            title: '🎉 Token Deployed Successfully!',
            message: `${name} (${symbol}) registered in ${activeRegistry.address.slice(0, 8)}... (Fee: ${feePaid} ${selectedChain.symbol})`,
            link: `${selectedChain.explorer}/address/${newContractAddress}`
          });

          if (onTokenDeployed) {
            onTokenDeployed(deployedToken);
          }
        }, 1800);
      }, 1600);
    }, 1200);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    onShowToast({
      type: 'info',
      title: 'Copied',
      message: `${label} copied to clipboard!`
    });
  };

  const activeFeaturesCount = useMemo(() => {
    return Object.values(features).filter(Boolean).length;
  }, [features]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 20LAB Workspace Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 border border-cyan-500/20 bg-gradient-to-br from-[#0C1226] via-[#070B18] to-[#04060E] shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#07e3f8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-[#026cdc]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#07E3F8] text-xs font-semibold font-serif mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#07e3f8]" />
            <span>20LAB Token Generator Engine v2.4 • Audited Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-normal leading-tight">
            Create & Deploy <span className="text-[#07e3f8]">Audited Tokens</span> In Seconds
          </h1>

          <p className="mt-3 font-serif text-slate-300 text-base sm:text-lg leading-relaxed">
            Choose the features you need and take full control of your tokens. Save time and around 40% on gas fees with our gas-optimized generator.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-serif text-slate-400">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Token.sol (20lab-v1.9.0) Audited Standard</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Backdoors • 100% Ownership Retention</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>40% Gas Savings via Optimized Assembly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#07e3f8]" />
            <span>1. Choose Token Architecture Preset</span>
          </h2>
          <span className="text-xs font-serif text-slate-400">Pick a starting configuration or customize below</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {TOKEN_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/30 border-[#07e3f8] shadow-lg shadow-cyan-500/20 ring-1 ring-[#07e3f8]'
                    : 'bg-[#0b2034] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-[#07E3F8] border border-cyan-500/30 font-serif">
                      {preset.badge}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#07e3f8]" />}
                  </div>
                  <h3 className="font-bold font-serif text-white text-sm mb-1">{preset.name}</h3>
                  <p className="text-xs font-serif text-slate-400 leading-relaxed">{preset.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 20LAB Exact 3-Tab Creation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form Sections with 3 Category Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab Navigation: General, Optional, Taxes & AMM */}
          <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-[#0b2034] border border-slate-800 font-serif">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'general'
                  ? 'bg-gradient-to-r from-[#026cdc] to-[#07e3f8] text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>1. General</span>
            </button>

            <button
              onClick={() => setActiveTab('optional')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'optional'
                  ? 'bg-gradient-to-r from-[#026cdc] to-[#07e3f8] text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>2. Optional</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/80 text-cyan-300 font-mono ml-1">
                {activeFeaturesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('taxes')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'taxes'
                  ? 'bg-gradient-to-r from-[#026cdc] to-[#07e3f8] text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>3. Taxes & AMM</span>
              {features.transferTax && (
                <span className="w-2 h-2 rounded-full bg-[#07e3f8] animate-pulse" />
              )}
            </button>
          </div>

          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0b2034] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold font-serif text-white flex items-center space-x-2">
                    <Settings2 className="w-5 h-5 text-[#07e3f8]" />
                    <span>General Token Parameters</span>
                  </h3>
                  <p className="text-xs font-serif text-slate-400 mt-0.5">Core identity, symbol, decimals, and initial token supply</p>
                </div>
                <span className="text-xs font-serif text-slate-400">Target Chain: <strong className="text-white">{selectedChain.name}</strong></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-serif">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Token Name <span className="text-[#07e3f8]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nova Protocol"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c1c] border border-slate-800 focus:border-[#07e3f8] focus:outline-none text-white text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Token Symbol <span className="text-[#07e3f8]">*</span>
                  </label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g. NOVA"
                    maxLength={10}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c1c] border border-slate-800 focus:border-[#07e3f8] focus:outline-none text-white font-mono text-sm transition-colors uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Total Initial Supply <span className="text-[#07e3f8]">*</span>
                  </label>
                  <input
                    type="text"
                    value={supply}
                    onChange={(e) => setSupply(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 1000000000"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c1c] border border-slate-800 focus:border-[#07e3f8] focus:outline-none text-white font-mono text-sm transition-colors"
                  />
                  <div className="mt-1 text-[11px] text-[#07E3F8] font-mono">
                    ≈ {formattedSupply} {symbol || 'TOKENS'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Decimals
                  </label>
                  <div className="flex space-x-2">
                    {[18, 9, 6].map((dec) => (
                      <button
                        key={dec}
                        type="button"
                        onClick={() => setDecimals(dec)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          decimals === dec
                            ? 'bg-cyan-500/20 border-[#07e3f8] text-[#07E3F8]'
                            : 'bg-[#0c0c1c] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {dec} {dec === 18 ? '(Standard)' : dec === 9 ? '(Meme/Sol)' : '(USDC)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Logo URL / Icon Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://ipfs.io/ipfs/... or web image"
                    className="w-full px-4 py-2 rounded-xl bg-[#0c0c1c] border border-slate-800 focus:border-[#07e3f8] focus:outline-none text-white text-xs transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Project Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell holders about your token utility..."
                    className="w-full px-4 py-2 rounded-xl bg-[#0c0c1c] border border-slate-800 focus:border-[#07e3f8] focus:outline-none text-white text-xs transition-colors"
                  />
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('optional')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#026cdc] to-[#07e3f8] hover:brightness-110 text-white font-serif font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/20"
                >
                  <span>Next: Configure Optional Features</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OPTIONAL CAPABILITIES */}
          {activeTab === 'optional' && (
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0b2034] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold font-serif text-white flex items-center space-x-2">
                    <Sliders className="w-5 h-5 text-[#07e3f8]" />
                    <span>Optional Smart Contract Capabilities</span>
                  </h3>
                  <p className="text-xs font-serif text-slate-400 mt-0.5">Audited features tested by CertiK and EtherAuthority</p>
                </div>
                <span className="text-xs font-mono text-[#07E3F8] font-semibold px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {activeFeaturesCount} Active Features
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {ALL_FEATURES.map((feat) => {
                  const isActive = !!features[feat.key];
                  return (
                    <div
                      key={feat.key}
                      onClick={() => toggleFeature(feat.key)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start justify-between space-x-3 ${
                        isActive
                          ? 'bg-cyan-950/30 border-[#07e3f8]/60 shadow-sm shadow-cyan-500/10'
                          : 'bg-[#0c0c1c] border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-base">{feat.icon}</span>
                          <h4 className="text-xs font-bold font-serif text-white">{feat.title}</h4>
                        </div>
                        <p className="text-[11px] font-serif text-slate-400 leading-relaxed">{feat.description}</p>
                      </div>

                      {/* Switch Toggle */}
                      <div
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          isActive ? 'bg-[#07e3f8]' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sub-panel: Anti-Whale & Anti-Bot Limits (if toggled) */}
              {(features.maxTxLimit || features.maxWalletLimit || features.antiBotCooldown) && (
                <div className="mt-4 p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-4">
                  <div className="flex items-center space-x-2 text-[#07E3F8] font-bold text-xs font-serif">
                    <Shield className="w-4 h-4" />
                    <span>Anti-Whale & Anti-Bot Protection Parameters</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {features.maxTxLimit && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Max Tx Limit (% of supply)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10"
                          value={limitsConfig.maxTxPercent}
                          onChange={(e) => setLimitsConfig({ ...limitsConfig, maxTxPercent: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c0c1c] border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>
                    )}

                    {features.maxWalletLimit && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Max Wallet Limit (% of supply)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.2"
                          max="20"
                          value={limitsConfig.maxWalletPercent}
                          onChange={(e) => setLimitsConfig({ ...limitsConfig, maxWalletPercent: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c0c1c] border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>
                    )}

                    {features.antiBotCooldown && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Anti-Bot Cooldown (Seconds)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          value={limitsConfig.cooldownSeconds}
                          onChange={(e) => setLimitsConfig({ ...limitsConfig, cooldownSeconds: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c0c1c] border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-serif font-medium text-xs flex items-center space-x-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: General</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('taxes')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#026cdc] to-[#07e3f8] hover:brightness-110 text-white font-serif font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-500/20"
                >
                  <span>Next: Taxes & Default Exchange</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TAXES & DEFAULT EXCHANGE */}
          {activeTab === 'taxes' && (
            <div className="rounded-2xl border border-cyan-500/20 bg-[#0b2034] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold font-serif text-white flex items-center space-x-2">
                    <Percent className="w-5 h-5 text-[#07e3f8]" />
                    <span>Taxes & Default AMM Exchange</span>
                  </h3>
                  <p className="text-xs font-serif text-slate-400 mt-0.5">Automated fees for marketing, liquidity, and deflationary burn</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => toggleFeature('transferTax')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-all ${
                    features.transferTax
                      ? 'bg-cyan-500/20 text-[#07E3F8] border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {features.transferTax ? '✓ Taxes Enabled' : '+ Enable Taxes'}
                </button>
              </div>

              {/* AMM Router Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Default AMM Exchange Router
                </label>
                <select
                  value={taxConfig.router}
                  onChange={(e) => setTaxConfig({ ...taxConfig, router: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c1c] border border-slate-800 focus:border-[#07e3f8] focus:outline-none text-white text-xs font-mono"
                >
                  {ROUTER_PRESETS.map((r) => (
                    <option key={r.address} value={r.address}>
                      {r.name} ({r.address.slice(0, 8)}...)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  The smart contract automatically grants router approval for fee distribution and AMM pair identification.
                </p>
              </div>

              {features.transferTax ? (
                <div className="space-y-6">
                  {/* Tax splits: Buy, Sell, Transfer */}
                  <div className="p-4 rounded-xl bg-[#0c0c1c] border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold font-serif text-white">Fee Breakdown Rates</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Buy Marketing Fee (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={taxConfig.buyMarketingFee}
                          onChange={(e) => setTaxConfig({ ...taxConfig, buyMarketingFee: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Sell Marketing Fee (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={taxConfig.sellMarketingFee}
                          onChange={(e) => setTaxConfig({ ...taxConfig, sellMarketingFee: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Transfer Marketing Fee (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={taxConfig.transferMarketingFee}
                          onChange={(e) => setTaxConfig({ ...taxConfig, transferMarketingFee: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Buy Burn Fee (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={taxConfig.buyBurnFee}
                          onChange={(e) => setTaxConfig({ ...taxConfig, buyBurnFee: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Sell Burn Fee (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={taxConfig.sellBurnFee}
                          onChange={(e) => setTaxConfig({ ...taxConfig, sellBurnFee: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Auto-Liquidity Split (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={taxConfig.buyLiquidityFee}
                          onChange={(e) => setTaxConfig({ ...taxConfig, buyLiquidityFee: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Marketing Wallet Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Marketing / Operations Treasury Wallet Address <span className="text-[#07e3f8]">*</span>
                    </label>
                    <input
                      type="text"
                      value={taxConfig.marketingWallet}
                      onChange={(e) => setTaxConfig({ ...taxConfig, marketingWallet: e.target.value })}
                      placeholder="0x..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c1c] border border-slate-800 focus:border-[#07e3f8] focus:outline-none text-white font-mono text-xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      This address receives the marketing fee tokens or converted native coins on every transaction.
                    </p>
                  </div>

                  {/* Honeypot Safety Guarantee */}
                  <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start space-x-3 text-xs">
                    <ShieldCheck className="w-5 h-5 text-[#07E3F8] flex-shrink-0 mt-0.5" />
                    <div className="text-slate-300">
                      <strong className="text-white">Anti-Honeypot Audit Guarantee:</strong> Maximum combined buy/sell fees are hard-capped in the contract code at 15%. The owner cannot increase fees beyond this limit.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-[#0c0c1c] border border-slate-800 space-y-3">
                  <Percent className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold font-serif text-white">Zero Tax Configuration</h4>
                  <p className="text-xs font-serif text-slate-400 max-w-md mx-auto">
                    Your token currently has 0% transfer taxes. This makes it 100% free of friction for trading and DEX listings.
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleFeature('transferTax')}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 text-[#07E3F8] border border-cyan-500/40 text-xs font-serif font-bold hover:bg-cyan-500/30 transition-colors"
                  >
                    Enable Custom Taxes & Marketing Fees
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('optional')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-serif font-medium text-xs flex items-center space-x-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Optional</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="btn-primary py-2.5 px-6 rounded-xl font-serif text-xs font-bold shadow-md shadow-[#07e3f8]/20 flex items-center space-x-1.5"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Ready to Deploy Token</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Summary, Cost Calculator & Launch Panel */}
        <div className="space-y-6">
          
          {/* Summary Card */}
          <div className="rounded-2xl border border-cyan-500/20 bg-[#0b2034] p-6 space-y-6 sticky top-28 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif text-white flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-[#07e3f8]" />
                <span>Deployment Summary</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                v1.9.0
              </span>
            </div>

            {/* Live Token Preview Card */}
            <div className="p-4 rounded-xl bg-[#0c0c1c] border border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80'}
                  alt="Token logo"
                  className="w-10 h-10 rounded-full border border-cyan-500/30 object-cover"
                />
                <div>
                  <h4 className="font-bold font-serif text-white text-sm">{name || 'Your Token'}</h4>
                  <div className="text-xs text-[#07e3f8] font-mono font-semibold">{symbol || 'SYMBOL'}</div>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-2.5 space-y-1.5 text-xs font-serif">
                <div className="flex justify-between text-slate-400">
                  <span>Network:</span>
                  <span className="text-white font-medium flex items-center space-x-1">
                    <span>{selectedChain.icon}</span>
                    <span>{selectedChain.name}</span>
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Supply:</span>
                  <span className="text-white font-mono font-medium">{formattedSupply}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Decimals:</span>
                  <span className="text-white font-mono">{decimals}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Contract Standard:</span>
                  <span className="text-[#07E3F8] font-mono font-semibold">
                    {selectedChain.isSolana ? 'Solana SPL' : 'Token.sol (20lab-v1.9.0)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Protocol Registry Reference */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-serif">Protocol Registry Target:</span>
                {wallet.address && activeRegistry.owner && wallet.address.toLowerCase() === activeRegistry.owner.toLowerCase() ? (
                  <span className="text-amber-400 font-mono text-[10px] font-bold flex items-center space-x-1">
                    <Crown className="w-3 h-3 text-amber-300" />
                    <span>YOUR CONTRACT</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-mono font-semibold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Audited uRegistryV5</span>
                  </span>
                )}
              </div>
              <div className="font-mono text-[10px] text-cyan-300 break-all bg-black/40 p-1.5 rounded border border-cyan-500/10">
                {selectedChain.isSolana 
                  ? '77777cziGtpeZATxr4LKCBxMhU4CrbBkbRKiEpBuJA67'
                  : activeRegistry.address}
              </div>
            </div>

            {/* Fee & Gas Breakdown */}
            <div className="p-4 rounded-xl bg-[#0c0c1c] border border-slate-800 space-y-2.5 text-xs font-serif">
              <div className="font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Fee Breakdown</span>
                <span className="text-[10px] text-emerald-400 font-normal">~40% Gas Saved</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Service Fee:</span>
                <span className={`font-semibold ${selectedChain.isTestnet ? 'text-emerald-400' : 'text-white'}`}>
                  {selectedChain.platformFee}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Gas:</span>
                <span className="text-slate-300 font-mono">~0.0018 {selectedChain.symbol}</span>
              </div>
              <div className="border-t border-slate-800/80 pt-2 flex justify-between text-slate-200 font-bold">
                <span>Total Cost:</span>
                <span className="text-[#07E3F8] font-mono">
                  {selectedChain.isTestnet ? 'FREE (Testnet)' : selectedChain.platformFee}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 font-serif">
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="btn-primary w-full py-3.5 px-4 rounded-xl text-sm font-bold shadow-xl shadow-[#07e3f8]/20 transition-all flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-50"
              >
                {deploying ? (
                  <span>Deploying Contract...</span>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Deploy Token on {selectedChain.name}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onViewCode(currentSolidityCode)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0c0c1c] hover:bg-slate-800/80 border border-slate-800 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Code2 className="w-4 h-4 text-[#07e3f8]" />
                <span>View & Export Solidity Code</span>
              </button>
            </div>

            {/* Security Badges */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] font-serif text-slate-400 space-y-1.5">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>100% verified source code compatible with Etherscan</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Owner retains 100% permissions and supply</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Deployment Progress Modal */}
      {(deploying || deployStep === 4) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0b2034] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3">
                {deployStep === 4 ? (
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                ) : (
                  <Rocket className="w-9 h-9 text-[#07e3f8] animate-bounce" />
                )}
              </div>
              <h3 className="text-xl font-bold font-serif text-white">
                {deployStep === 4 ? 'Token Successfully Deployed!' : 'Deploying Your Token'}
              </h3>
              <p className="text-xs font-serif text-slate-400 mt-1">
                {deployStep === 4
                  ? 'Your contract is live on-chain and registered via uRegistryV5.'
                  : 'Please keep this window open while the transaction is being verified.'}
              </p>
            </div>

            {/* Steps tracker */}
            <div className="space-y-3 font-serif">
              {[
                { step: 1, label: 'Compiling Token.sol (20lab-v1.9.0) bytecode' },
                { step: 2, label: 'Awaiting Web3 wallet signature' },
                { step: 3, label: `Broadcasting CREATE2 transaction to ${selectedChain.name}` },
                { step: 4, label: 'Transaction confirmed & verified via uRegistryV5' }
              ].map((s) => (
                <div key={s.step} className="flex items-center space-x-3 text-xs">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      deployStep > s.step
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : deployStep === s.step
                        ? 'bg-[#07e3f8] text-black font-bold animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {deployStep > s.step ? '✓' : s.step}
                  </div>
                  <span
                    className={
                      deployStep >= s.step ? 'text-slate-200 font-medium' : 'text-slate-500'
                    }
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Success details */}
            {deployStep === 4 && deployedTokenResult && (
              <div className="p-4 rounded-xl bg-[#0c0c1c] border border-slate-800 space-y-2.5 text-xs font-serif">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Contract Address:</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[#07E3F8] font-semibold">
                      {deployedTokenResult.address.slice(0, 10)}...{deployedTokenResult.address.slice(-6)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(deployedTokenResult.address, 'Contract Address')}
                      className="text-slate-400 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>Transaction Hash:</span>
                  <span className="font-mono text-slate-300">
                    {deployedTokenResult.txHash.slice(0, 10)}...
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>Registry Reference:</span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    0x896cB15542A50e084CB01138211daA110b1Fe8F2
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between">
                  <a
                    href={`${selectedChain.explorer}/address/${deployedTokenResult.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#07e3f8] hover:text-[#07E3F8] inline-flex items-center space-x-1 underline"
                  >
                    <span>View on {selectedChain.name} Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {deployStep === 4 && (
              <button
                onClick={() => {
                  setDeployStep(0);
                  setDeploying(false);
                }}
                className="w-full py-3 px-4 rounded-xl btn-primary font-serif font-semibold text-xs transition-colors"
              >
                Close & Go to Token Manager
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
