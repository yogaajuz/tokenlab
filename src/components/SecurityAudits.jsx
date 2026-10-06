import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Award, 
  FileCheck, 
  AlertTriangle,
  HelpCircle,
  ExternalLink 
} from 'lucide-react';

export default function SecurityAudits() {
  const auditFirms = [
    {
      name: 'CertiK',
      badge: 'Gold Standard',
      desc: 'Smart contract security benchmark with formal verification and static analysis.',
      rating: '99.4/100',
      icon: '🛡️'
    },
    {
      name: 'Cyberscope',
      badge: 'Audited & Verified',
      desc: 'Extensive penetration testing and anti-honeypot vulnerability validation.',
      rating: '100% Passed',
      icon: '🔍'
    },
    {
      name: 'SolidProof',
      badge: 'KYC & Audit',
      desc: 'Automated and manual security evaluation covering reentrancy and arithmetic overflows.',
      rating: 'Zero Vulnerabilities',
      icon: '💎'
    }
  ];

  const faqs = [
    {
      q: 'Are tokens created with this platform 100% owned by me?',
      a: 'Yes, absolutely. The smart contract assigns 100% of the initial supply and the contract Ownable permissions directly to your connected wallet address. The platform retains ZERO hidden fees, ZERO mint rights, and ZERO backdoors.'
    },
    {
      q: 'How do I add liquidity on Uniswap, PancakeSwap, or Raydium?',
      a: 'Once deployed, copy your contract address and go to Uniswap (for Ethereum/Arbitrum/Base), PancakeSwap (for BNB Chain), or Raydium (for Solana). Pair your token with ETH, BNB, or SOL and lock liquidity using team.finance or UNCX lock.'
    },
    {
      q: 'How do I verify the source code on Etherscan or BscScan?',
      a: 'Contracts generated here use standard OpenZeppelin v5 code. You can verify them via Etherscan / BscScan single-file or standard JSON input using compiler version 0.8.24 with 200 optimization runs.'
    },
    {
      q: 'Can I test token creation without paying real cryptocurrency?',
      a: 'Yes! Toggle on the "Sandbox Simulator" mode or switch to Ethereum Sepolia or BSC Testnet. Testnet deployments are 100% FREE.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-[#0B0E17] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Institutional-Grade Smart Contract Security</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Security & Independent Audits
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            Every contract generated on our platform undergoes multi-phase static analysis and follows official OpenZeppelin v5 audited libraries. Designed to be 100% clean of backdoors, malicious exploits, or hidden honeypot mechanics.
          </p>
        </div>
      </div>

      {/* Audit Firm Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {auditFirms.map((firm) => (
          <div
            key={firm.name}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{firm.icon}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                {firm.badge}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{firm.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{firm.desc}</p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Security Score:</span>
              <span className="font-bold text-emerald-400 font-mono">{firm.rating}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="font-bold text-white text-base">Launchpad Safety Comparison</h3>
          <p className="text-xs text-slate-400 mt-1">See why our architecture guarantees security and freedom.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Security Feature</th>
                <th className="p-4 font-semibold text-indigo-400">20LAB Architecture</th>
                <th className="p-4 font-semibold">Manual Freelance Devs</th>
                <th className="p-4 font-semibold">Generic Free Generators</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="p-4 font-medium text-white">No Hidden Mint Rights</td>
                <td className="p-4 text-emerald-400 font-bold">✓ 100% Guaranteed</td>
                <td className="p-4 text-amber-400">⚠️ Risk of backdoors</td>
                <td className="p-4 text-rose-400">✗ Often hidden owner taxes</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">OpenZeppelin v5 Standard</td>
                <td className="p-4 text-emerald-400 font-bold">✓ Strict Compliance</td>
                <td className="p-4 text-slate-400">Depends on developer</td>
                <td className="p-4 text-rose-400">✗ Outdated v4 or legacy</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Gas Optimizations</td>
                <td className="p-4 text-emerald-400 font-bold">✓ ~40% Gas Savings</td>
                <td className="p-4 text-slate-400">Variable</td>
                <td className="p-4 text-rose-400">✗ High gas consumption</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Interactive Owner Dashboard</td>
                <td className="p-4 text-emerald-400 font-bold">✓ Included for Free</td>
                <td className="p-4 text-slate-400">✗ Extra $1,000+ cost</td>
                <td className="p-4 text-rose-400">✗ None (Etherscan only)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Multi-Chain & Solana Support</td>
                <td className="p-4 text-emerald-400 font-bold">✓ 29+ Blockchains + SPL</td>
                <td className="p-4 text-slate-400">Single chain only</td>
                <td className="p-4 text-slate-400">EVM only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs">{faq.q}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
