import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Users, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  Coins, 
  Copy,
  ExternalLink
} from 'lucide-react';
import { getStoredTokens, generateRandomTxHash } from '../utils/web3Service';

export default function MultiSender({
  selectedChain,
  wallet,
  onShowToast
}) {
  const [tokens] = useState(getStoredTokens());
  const [selectedToken, setSelectedToken] = useState(tokens[0] || null);
  const [useNative, setUseNative] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [batchStep, setBatchStep] = useState(0); // 0: idle, 1: approving, 2: sending, 3: completed
  const [txHash, setTxHash] = useState('');

  // Sample data autofill
  const loadSampleRecipients = () => {
    const samples = [
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 500',
      '0x90F79bf6EB2c4f870365E785982E1f101E93b906, 1200',
      '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65, 800',
      '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df, 2500',
      '0x976EA74026E72CD178867bf307F1CE4472379b57, 1000'
    ];
    setRawInput(samples.join('\n'));
    onShowToast({
      type: 'info',
      title: 'Sample Data Loaded',
      message: 'Populated with 5 sample recipient addresses.'
    });
  };

  // Parse lines
  const parsedData = useMemo(() => {
    if (!rawInput.trim()) return { valid: [], invalid: [], totalAmount: 0 };
    const lines = rawInput.split('\n');
    const valid = [];
    const invalid = [];
    let total = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      // split by comma or space or tab
      const parts = trimmed.split(/[,;\s\t]+/).filter(Boolean);
      if (parts.length >= 2) {
        const address = parts[0];
        const amount = Number(parts[1]);
        if (address.startsWith('0x') && address.length === 42 && !isNaN(amount) && amount > 0) {
          valid.push({ address, amount, line: index + 1 });
          total += amount;
        } else {
          invalid.push({ raw: line, line: index + 1, error: 'Invalid address or amount' });
        }
      } else {
        invalid.push({ raw: line, line: index + 1, error: 'Expected: address, amount' });
      }
    });

    return { valid, invalid, totalAmount: total };
  }, [rawInput]);

  const handleSendBatch = () => {
    if (parsedData.valid.length === 0) {
      onShowToast({
        type: 'error',
        title: 'No Valid Recipients',
        message: 'Please provide at least one valid address and amount pair.'
      });
      return;
    }

    if (!wallet.connected) {
      onShowToast({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet first.'
      });
      return;
    }

    setExecuting(true);
    setBatchStep(1); // Approving token allowance

    setTimeout(() => {
      setBatchStep(2); // Batch sending

      setTimeout(() => {
        const hash = generateRandomTxHash();
        setTxHash(hash);
        setBatchStep(3);
        setExecuting(false);

        onShowToast({
          type: 'success',
          title: 'Batch Airdrop Sent!',
          message: `Successfully distributed ${parsedData.totalAmount.toLocaleString()} tokens to ${parsedData.valid.length} addresses!`
        });
      }, 2000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-[#0B0E17] border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Send className="w-3.5 h-3.5" />
            <span>20LAB MultiSender Utility</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            High-Speed MultiSender & Airdrop Tool
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            Distribute ERC-20, BEP-20, or native coins to hundreds of recipients in a single transaction. Save up to 65% on gas fees compared to individual transfers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Token Selection */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Coins className="w-5 h-5 text-indigo-400" />
              <span>1. Select Token to Distribute</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setUseNative(false)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  !useNative
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white mb-2">ERC-20 Token</div>
                <select
                  value={selectedToken?.address || ''}
                  onChange={(e) => {
                    const found = tokens.find(t => t.address === e.target.value);
                    if (found) setSelectedToken(found);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-medium"
                >
                  {tokens.map((tok) => (
                    <option key={tok.address} value={tok.address}>
                      {tok.name} ({tok.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div
                onClick={() => setUseNative(true)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  useNative
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white mb-2">Native Network Coin</div>
                <div className="text-xs text-slate-300 font-mono py-2">
                  {selectedChain.symbol} on {selectedChain.name}
                </div>
              </div>
            </div>
          </div>

          {/* Recipients Input */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>2. Recipient List & Allocations</span>
              </h3>
              <button
                onClick={loadSampleRecipients}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20"
              >
                Load Sample CSV
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter one recipient per line in the format: <code className="text-indigo-300">address, amount</code> (supports comma or space separator)
            </p>

            <textarea
              rows={8}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 500&#10;0x90F79bf6EB2c4f870365E785982E1f101E93b906, 1200&#10;0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65, 800"
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
            />

            {/* Validation Feedback */}
            {parsedData.invalid.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Found {parsedData.invalid.length} invalid line(s):</span>
                </div>
                <div className="text-[11px] text-rose-400 max-h-20 overflow-y-auto font-mono">
                  {parsedData.invalid.map((inv, idx) => (
                    <div key={idx}>Line {inv.line}: "{inv.raw}" ({inv.error})</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Summary & Execute */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 sticky top-28">
            <h3 className="font-bold text-white text-base flex items-center space-x-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span>Airdrop Summary</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Recipients:</span>
                <span className="font-bold text-white font-mono">{parsedData.valid.length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount to Send:</span>
                <span className="font-bold text-indigo-400 font-mono">
                  {parsedData.totalAmount.toLocaleString()} {useNative ? selectedChain.symbol : (selectedToken?.symbol || 'TOKENS')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transactions Needed:</span>
                <span className="text-emerald-400 font-bold">1 Batch Transaction</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Gas Saved:</span>
                <span className="text-emerald-400 font-mono font-semibold">~64% (~$14.20)</span>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleSendBatch}
              disabled={executing || parsedData.valid.length === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Execute Batch MultiSend</span>
            </button>

            {/* Steps feedback */}
            {batchStep > 0 && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${batchStep === 1 ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <span className={batchStep >= 1 ? 'text-white' : 'text-slate-500'}>
                    1. Token Approval Granted
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${batchStep === 2 ? 'bg-indigo-400 animate-pulse' : batchStep === 3 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <span className={batchStep >= 2 ? 'text-white' : 'text-slate-500'}>
                    2. Batch Distribution Confirmed
                  </span>
                </div>

                {batchStep === 3 && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-mono space-y-1">
                    <div>Tx: {txHash.slice(0, 14)}...</div>
                    <div className="text-slate-400">Distributed successfully!</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
