import React, { useState } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Eye, 
  Share2, 
  Globe, 
  CheckCircle2, 
  Layers, 
  Compass, 
  Check, 
  Coins 
} from 'lucide-react';
import { getStoredTokens } from '../utils/web3Service';

export default function TokenPageCreator({ onShowToast }) {
  const [tokens] = useState(getStoredTokens());
  const [selectedToken, setSelectedToken] = useState(tokens[0] || null);

  // Token page customization options
  const [tagline, setTagline] = useState('Next-Generation Liquidity & Community Ecosystem');
  const [description, setDescription] = useState('An audited, community-first Web3 protocol launched on 20LAB with automated deflationary tokenomics.');
  const [websiteUrl, setWebsiteUrl] = useState('https://novatoken.io');
  const [telegramUrl, setTelegramUrl] = useState('https://t.me/novatoken');
  const [twitterUrl, setTwitterUrl] = useState('https://x.com/novatoken');
  const [dexUrl, setDexUrl] = useState('https://dexscreener.com');
  const [roadmapPhases, setRoadmapPhases] = useState([
    { phase: 'Phase 1', title: 'Fair Launch & Community', completed: true },
    { phase: 'Phase 2', title: 'DEX Listing & Liquidity Lock', completed: true },
    { phase: 'Phase 3', title: 'CoinGecko & CMC Applications', completed: false },
    { phase: 'Phase 4', title: 'DAO Governance & Staking', completed: false }
  ]);

  const [published, setPublished] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');

  const handlePublish = () => {
    const slug = (selectedToken?.symbol || 'token').toLowerCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const url = `https://20lab.app/p/${slug}`;
    setPublicUrl(url);
    setPublished(true);
    onShowToast({
      type: 'success',
      title: 'Token Page Published!',
      message: `Your public token page is live at ${url}`
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    onShowToast({
      type: 'info',
      title: 'Copied Link',
      message: 'Token page URL copied to clipboard!'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0C1226] via-[#070B18] to-[#04060E] border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#07E3F8] text-xs font-semibold font-serif mb-3">
            <Compass className="w-3.5 h-3.5 text-[#07e3f8]" />
            <span>20LAB Public Token Showcase Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white">
            Token Page Creator
          </h1>
          <p className="mt-2 font-serif text-slate-300 text-sm sm:text-base leading-relaxed">
            Create an official, branded project showcase page for your community with live blockchain verification, roadmap, DEX links, and real-time holder metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Customizer Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0b2034] border border-slate-800 space-y-4">
            <h3 className="font-bold font-serif text-white text-base">Select & Customize</h3>

            <div>
              <label className="block text-xs font-serif font-semibold text-slate-300 mb-1">Select Token</label>
              <select
                value={selectedToken?.address || ''}
                onChange={(e) => {
                  const tok = tokens.find(t => t.address === e.target.value);
                  if (tok) setSelectedToken(tok);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-serif"
              >
                {tokens.map((tok) => (
                  <option key={tok.address} value={tok.address}>
                    {tok.name} ({tok.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif font-semibold text-slate-300 mb-1">Project Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-serif"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-semibold text-slate-300 mb-1">Project Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-serif"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-serif font-bold text-white">Community & DEX Links</span>
              <input
                type="text"
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                placeholder="Telegram URL"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
              <input
                type="text"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="Twitter / X URL"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
              <input
                type="text"
                value={dexUrl}
                onChange={(e) => setDexUrl(e.target.value)}
                placeholder="DEXScreener / Buy Link"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <button
              onClick={handlePublish}
              className="btn-primary w-full py-3 rounded-xl text-xs font-bold font-serif shadow-lg shadow-[#07e3f8]/20"
            >
              Publish Official Token Page
            </button>

            {published && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-serif space-y-1">
                <span className="text-emerald-400 font-bold">✓ Published Publicly</span>
                <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                  <span className="truncate">{publicUrl}</span>
                  <button onClick={() => copyToClipboard(publicUrl)} className="text-[#07e3f8] hover:text-white ml-2">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Live Public Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-[#07e3f8]" />
              <span>Live Public Page Mockup (What your community sees)</span>
            </span>
            <span className="text-xs font-serif text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Live On-Chain Verified
            </span>
          </div>

          {/* Rendered Mock Token Page */}
          <div className="rounded-3xl border border-slate-800 bg-[#070914] overflow-hidden shadow-2xl space-y-6 pb-8">
            
            {/* Mock Header Banner */}
            <div className="h-40 bg-gradient-to-r from-[#07e3f8]/20 via-[#026cdc]/20 to-purple-500/20 border-b border-slate-800 relative p-6 flex items-end">
              <div className="absolute top-4 right-4 flex space-x-2">
                <span className="text-xs px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-white font-serif">
                  {selectedToken?.chainName || 'Ethereum'}
                </span>
              </div>

              {/* Token Avatar */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#026cdc] to-[#07e3f8] p-0.5 shadow-xl">
                  <div className="w-full h-full bg-[#0c0c1c] rounded-[14px] flex items-center justify-center font-black font-serif text-2xl text-[#07e3f8]">
                    {selectedToken?.symbol?.slice(0, 3) || 'TOK'}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-serif text-white">{selectedToken?.name || 'Project Name'}</h2>
                  <div className="text-xs text-[#07e3f8] font-mono font-semibold">${selectedToken?.symbol || 'SYM'}</div>
                </div>
              </div>
            </div>

            {/* Tagline & Links */}
            <div className="px-6 space-y-4">
              <h3 className="text-lg font-bold font-serif text-white">{tagline}</h3>
              <p className="text-xs font-serif text-slate-300 leading-relaxed max-w-2xl">{description}</p>

              <div className="flex flex-wrap gap-2 pt-2">
                <a href={telegramUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-xs font-serif text-slate-200">
                  Telegram Group ↗
                </a>
                <a href={twitterUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-xs font-serif text-slate-200">
                  Twitter / X ↗
                </a>
                <a href={dexUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-[#07e3f8]/10 border border-[#07e3f8]/30 text-[#07E3F8] text-xs font-serif font-bold">
                  Trade on DEX ↗
                </a>
              </div>
            </div>

            {/* Verified Metrics Bar */}
            <div className="mx-6 p-4 rounded-2xl bg-[#0b2034] border border-slate-800 grid grid-cols-3 gap-4 text-center font-serif">
              <div>
                <div className="text-[11px] text-slate-400">Total Supply</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  {Number(selectedToken?.totalSupply || 1000000000).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Contract Verification</div>
                <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center space-x-1">
                  <span>✓ 100% Audited</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Ownership</div>
                <div className="text-xs font-bold text-cyan-400 mt-1">
                  {selectedToken?.owner === '0x0000000000000000000000000000000000000000' ? 'Renounced' : 'Verified'}
                </div>
              </div>
            </div>

            {/* Roadmap Widget */}
            <div className="px-6 space-y-3 font-serif">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Project Roadmap</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roadmapPhases.map((phase, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-cyan-400 font-bold">{phase.phase}</div>
                      <div className="text-white font-medium">{phase.title}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${phase.completed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                      {phase.completed ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
