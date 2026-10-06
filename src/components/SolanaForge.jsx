import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Rocket, 
  Terminal, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  Coins, 
  Flame,
  AlertTriangle 
} from 'lucide-react';

export default function SolanaForge({ onNavigate, wallet, onShowToast }) {
  const [tokenName, setTokenName] = useState('Solana Pulse');
  const [symbol, setSymbol] = useState('SPULSE');
  const [decimals, setDecimals] = useState(9);
  const [supply, setSupply] = useState('1000000000');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&q=80');
  const [description, setDescription] = useState('High-performance Solana SPL community token created via 20LAB.');
  const [network, setNetwork] = useState('devnet'); // devnet or mainnet-beta

  // Authority options
  const [revokeMint, setRevokeMint] = useState(true);
  const [revokeFreeze, setRevokeFreeze] = useState(true);

  const [deploying, setDeploying] = useState(false);
  const [deployedSPL, setDeployedSPL] = useState(null);

  const handleDeploySolana = () => {
    setDeploying(true);
    setTimeout(() => {
      const mockMint = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
      const result = {
        name: tokenName,
        symbol,
        decimals,
        supply,
        network,
        mintAddress: mockMint,
        txHash: '5K3s...mockSig',
        revokeMint,
        revokeFreeze
      };
      setDeployedSPL(result);
      setDeploying(false);
      onShowToast({
        type: 'success',
        title: 'Solana SPL Token Created!',
        message: `${tokenName} (${symbol}) mint created on ${network}!`
      });
    }, 1800);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    onShowToast({
      type: 'info',
      title: 'Copied',
      message: `${label} copied to clipboard!`
    });
  };

  const generatedCliScript = `# 1. Create SPL Token Mint
spl-token create-token --decimals ${decimals} ${network === 'devnet' ? '--url devnet' : ''}

# 2. Create Token Account
spl-token create-account <MINT_ADDRESS>

# 3. Mint Initial Supply
spl-token mint <MINT_ADDRESS> ${supply}

${revokeMint ? '# 4. Revoke Mint Authority (Fixed Supply Guarantee)\nspl-token authorize <MINT_ADDRESS> mint --disable\n' : ''}
${revokeFreeze ? '# 5. Revoke Freeze Authority (Anti-Honeypot Protection)\nspl-token authorize <MINT_ADDRESS> freeze --disable\n' : ''}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-serif">
      
      {/* Breadcrumbs */}
      <div className="font-serif text-sm text-foreground/50 flex flex-wrap gap-2 items-center">
        <button onClick={() => onNavigate?.('/')} className="text-primary-alt hover:underline cursor-pointer">
          Home
        </button>
        <span>/</span>
        <button onClick={() => onNavigate?.('/generate/')} className="text-primary-alt hover:underline cursor-pointer">
          Generate
        </button>
        <span>/</span>
        <div className="text-white">Solana Token Creator</div>
      </div>

      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0b2034] via-[#1a3249] to-[#0c0c1c] border border-[#07e3f8]/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#07e3f8]/10 border border-[#07e3f8]/30 text-[#07e3f8] text-xs font-semibold mb-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Solana SPL Token Program Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Solana Token Creator
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            Generate and deploy standard Solana SPL tokens with full Metaplex metadata, Raydium DEX readiness, and one-click authority revocation for Birdeye &amp; DexScreener compliance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              <span>SPL Token Configuration</span>
            </h3>

            {/* Network Selector */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setNetwork('devnet')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  network === 'devnet'
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Solana Devnet (FREE)
              </button>
              <button
                type="button"
                onClick={() => setNetwork('mainnet-beta')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  network === 'mainnet-beta'
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Solana Mainnet-Beta (0.15 SOL)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Token Name</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Symbol</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Supply</label>
                <input
                  type="number"
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Decimals</label>
                <input
                  type="number"
                  value={decimals}
                  onChange={(e) => setDecimals(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">Default for Solana SPL is 9</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Logo URL (Metaplex metadata)</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Authority Revocation Toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-white">Trust & Security Authorities</h4>

              <div
                onClick={() => setRevokeMint(!revokeMint)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  revokeMint ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Revoke Mint Authority</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Permanently disallows minting more tokens. Guarantees 100% fixed supply for Raydium investors.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${revokeMint ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-700'}`}>
                  {revokeMint && '✓'}
                </div>
              </div>

              <div
                onClick={() => setRevokeFreeze(!revokeFreeze)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  revokeFreeze ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Revoke Freeze Authority</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ensures holders can never have their wallets frozen. Eliminates honeypot flags on DexScreener.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${revokeFreeze ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-700'}`}>
                  {revokeFreeze && '✓'}
                </div>
              </div>
            </div>

          </div>

          {/* Generated CLI Command Display */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Generated Solana CLI Terminal Commands</span>
              </h3>
              <button
                onClick={() => copyToClipboard(generatedCliScript, 'Solana CLI Script')}
                className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-mono overflow-x-auto">
              {generatedCliScript}
            </pre>
          </div>

        </div>

        {/* Right Col: Launch & Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 sticky top-28">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-emerald-400" />
              <span>Solana SPL Summary</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Target:</span>
                <span className="font-semibold text-emerald-400 uppercase">{network}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Supply:</span>
                <span className="font-mono text-white">{Number(supply).toLocaleString()} {symbol}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Decimals:</span>
                <span className="font-mono text-white">{decimals}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Raydium Ready:</span>
                <span className="text-emerald-400 font-bold">YES</span>
              </div>
            </div>

            <button
              onClick={handleDeploySolana}
              disabled={deploying}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
            >
              <Rocket className="w-4 h-4" />
              <span>{deploying ? 'Creating Mint...' : `Create SPL Token on ${network}`}</span>
            </button>

            {deployedSPL && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2 text-xs">
                <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SPL Token Created!</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Mint Address:
                  <div className="font-mono text-white break-all">{deployedSPL.mintAddress}</div>
                </div>
                <a
                  href={`https://explorer.solana.com/address/${deployedSPL.mintAddress}?cluster=${network}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 underline inline-flex items-center space-x-1 text-[11px]"
                >
                  <span>View on Solana Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
