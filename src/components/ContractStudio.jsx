import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Download, 
  ExternalLink, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Code
} from 'lucide-react';

export default function ContractStudio({
  solidityCode,
  onShowToast
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(solidityCode);
    setCopied(true);
    onShowToast({
      type: 'success',
      title: 'Code Copied',
      message: 'Solidity contract code copied to clipboard!'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([solidityCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'CustomToken.sol';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onShowToast({
      type: 'info',
      title: 'File Downloaded',
      message: 'Saved CustomToken.sol to your computer.'
    });
  };

  const openRemix = () => {
    window.open('https://remix.ethereum.org', '_blank');
  };

  // Add line numbers to code
  const lines = solidityCode.split('\n');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-[#0B0E17] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <FileCode className="w-3.5 h-3.5" />
            <span>OpenZeppelin v5 Verified Code Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Solidity Smart Contract Studio
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            Inspect, export, and verify your smart contract source code. 100% human-readable, auditable, and compatible with Etherscan, BscScan, Basescan, and Remix IDE.
          </p>
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
        
        {/* Code Header Bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="font-mono text-xs font-semibold text-slate-300">CustomToken.sol</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
              Solidity ^0.8.24
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .sol</span>
            </button>

            <button
              onClick={openRemix}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Remix IDE</span>
            </button>
          </div>
        </div>

        {/* Code Body with Line Numbers */}
        <div className="p-4 bg-[#080B14] max-h-[600px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="w-12 text-right pr-4 text-slate-600 select-none text-[11px] align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre overflow-x-auto text-slate-300">
                    {line.startsWith('//') ? (
                      <span className="text-emerald-400/80">{line}</span>
                    ) : line.includes('import ') ? (
                      <span className="text-indigo-400">{line}</span>
                    ) : line.includes('contract ') || line.includes('function ') ? (
                      <span className="text-cyan-300 font-semibold">{line}</span>
                    ) : line.includes('override') || line.includes('public') || line.includes('external') ? (
                      <span className="text-amber-300">{line}</span>
                    ) : (
                      line
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Verification Specs */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Compiler: v0.8.24+commit.e11b9ed9</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Optimization: Enabled (200 Runs)</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>EVM Version: Paris / Cancun Compatible</span>
          </div>
        </div>
      </div>

    </div>
  );
}
