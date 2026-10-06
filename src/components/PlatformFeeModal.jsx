import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  Wallet, 
  Check, 
  Copy, 
  DollarSign, 
  ArrowDownToLine, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Lock
} from 'lucide-react';
import { 
  getPlatformFeeConfig, 
  savePlatformFeeConfig, 
  PLATFORM_TREASURY_WALLET 
} from '../utils/platformFeeConfig';

export default function PlatformFeeModal({
  isOpen,
  onClose,
  wallet,
  selectedChain,
  onShowToast
}) {
  const [config, setConfig] = useState(getPlatformFeeConfig);
  const [copied, setCopied] = useState(false);
  const [feeEth, setFeeEth] = useState(config.creationFeeEth || '0.01');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getPlatformFeeConfig();
      setConfig(current);
      setFeeEth(current.creationFeeEth || '0.01');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(PLATFORM_TREASURY_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast?.({
      type: 'success',
      title: 'Address Copied',
      message: 'Permanent treasury address copied to clipboard.'
    });
  };

  const handleSave = () => {
    const updated = savePlatformFeeConfig({
      recipientWallet: PLATFORM_TREASURY_WALLET,
      creationFeeEth: feeEth
    });
    setConfig(updated);
    onShowToast?.({
      type: 'success',
      title: 'Platform Fee Configuration Saved',
      message: `Creation fee set to ${feeEth} ${selectedChain?.currency || 'ETH'}. Platform fees permanently route to ${PLATFORM_TREASURY_WALLET.slice(0, 6)}...${PLATFORM_TREASURY_WALLET.slice(-4)}`
    });
    onClose();
  };

  const handleWithdraw = () => {
    const balance = parseFloat(config.vaultBalance || '0');
    if (balance <= 0) {
      onShowToast?.({
        type: 'info',
        title: 'Zero Balance',
        message: 'There are no platform fees in the vault right now.'
      });
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      const recipient = PLATFORM_TREASURY_WALLET;
      const amount = config.vaultBalance;
      const updated = savePlatformFeeConfig({
        vaultBalance: '0.000'
      });
      setConfig(updated);
      onShowToast?.({
        type: 'success',
        title: 'Withdrawal Successful!',
        message: `${amount} ${selectedChain?.currency || 'ETH'} transferred to your treasury: ${recipient.slice(0, 6)}...${recipient.slice(-4)}`
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a3249] border-2 border-[#07e3f8]/50 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative font-serif text-white">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="size-11 rounded-xl bg-linear-to-r from-primary to-primary-alt flex items-center justify-center text-black shadow-lg shadow-[#07e3f8]/30">
            <Crown size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-white">Platform Fee Configuration</h3>
            <p className="text-xs text-foreground/50">Direct all token creation &amp; deployment revenue to your wallet</p>
          </div>
        </div>

        <div className="my-4 border-b border-[#44617d]/40"></div>

        {/* Vault Stats Card */}
        <div className="bg-field p-4 rounded-xl border border-[#44617d]/40 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-foreground/50 block">Accumulated Platform Revenue</span>
              <span className="text-2xl font-bold text-[#07e3f8]">{config.vaultBalance || '0.000'} {selectedChain?.currency || 'ETH'}</span>
              <span className="text-xs text-slate-400 block mt-0.5">{config.totalTokensCreated || 0} tokens created • Total lifetime: {config.totalRevenueEth || '0'} {selectedChain?.currency || 'ETH'}</span>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || parseFloat(config.vaultBalance || '0') <= 0}
              className="px-4 py-2 rounded-lg bg-linear-to-r from-primary to-primary-alt text-black text-xs font-bold hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center gap-1.5 transition-all shadow-md shadow-[#07e3f8]/20"
            >
              {isWithdrawing ? (
                <span>Withdrawing...</span>
              ) : (
                <>
                  <ArrowDownToLine size={14} />
                  <span>Withdraw</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          
          {/* Permanent Platform Fee Recipient Wallet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-1.5">
                <Wallet size={15} className="text-[#07e3f8]" />
                <span>Protocol Treasury Recipient Wallet</span>
              </label>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                <Lock size={11} />
                <span>Immutable & Enforced</span>
              </div>
            </div>
            
            <div className="relative flex items-center rounded-lg bg-field border border-[#07e3f8]/40 px-3 py-2.5 shadow-inner">
              <span className="font-mono text-sm text-[#07e3f8] truncate flex-1 select-all font-semibold">
                {PLATFORM_TREASURY_WALLET}
              </span>
              <button
                type="button"
                onClick={handleCopyWallet}
                className="ml-2 px-2.5 py-1 rounded bg-[#07e3f8]/10 hover:bg-[#07e3f8]/20 text-[#07e3f8] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-[#07e3f8]/30"
                title="Copy Treasury Address"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-start gap-2 bg-[#07e3f8]/5 border border-[#07e3f8]/20 rounded-lg p-2.5 text-xs text-foreground/80">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Hardcoded Protocol Protection:</strong> 100% of creation fees across all 9 EVM mainnet chains are permanently routed exclusively to this wallet.
              </span>
            </div>
          </div>

          {/* Creation Fee per Token */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-white flex items-center gap-1.5">
              <DollarSign size={15} className="text-[#07e3f8]" />
              <span>Creation Fee Per Token ({selectedChain?.currency || 'ETH'})*</span>
            </label>
            <p className="text-xs italic text-foreground/50">
              Amount charged to users when they deploy an ERC-20 / SPL token on your platform.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {['0', '0.01', '0.025', '0.05'].map((fee) => (
                <button
                  key={fee}
                  type="button"
                  onClick={() => setFeeEth(fee)}
                  className={`py-2 px-2 text-xs rounded-lg border text-center transition-all cursor-pointer font-bold ${
                    feeEth === fee 
                      ? 'bg-linear-to-r from-primary to-primary-alt text-black border-transparent shadow' 
                      : 'bg-field text-slate-300 border-[#44617d]/40 hover:bg-white/10'
                  }`}
                >
                  {fee === '0' ? 'FREE' : `${fee} ${selectedChain?.currency || 'ETH'}`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 rounded-lg bg-field hover:bg-white/10 font-bold text-slate-300 border border-[#44617d]/40 text-sm cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-2/3 py-3 rounded-lg bg-linear-to-r from-primary to-primary-alt text-black font-bold text-sm cursor-pointer hover:opacity-90 transition-all shadow-lg shadow-[#07e3f8]/20 flex items-center justify-center gap-2"
          >
            <Check size={16} />
            <span>Save Fee Configuration</span>
          </button>
        </div>

      </div>
    </div>
  );
}
