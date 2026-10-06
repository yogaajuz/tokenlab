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
  ExternalLink
} from 'lucide-react';
import { getPlatformFeeConfig, savePlatformFeeConfig } from '../utils/platformFeeConfig';

export default function PlatformFeeModal({
  isOpen,
  onClose,
  wallet,
  selectedChain,
  onShowToast
}) {
  const [config, setConfig] = useState(getPlatformFeeConfig);
  const [customAddress, setCustomAddress] = useState(config.recipientWallet || '');
  const [feeEth, setFeeEth] = useState(config.creationFeeEth || '0.01');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getPlatformFeeConfig();
      setConfig(current);
      setCustomAddress(current.recipientWallet || (wallet?.address || ''));
      setFeeEth(current.creationFeeEth || '0.01');
    }
  }, [isOpen, wallet?.address]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!customAddress || !customAddress.startsWith('0x') || customAddress.length !== 42) {
      onShowToast?.({
        type: 'error',
        title: 'Invalid Address',
        message: 'Please enter a valid 42-character EVM wallet address (0x...).'
      });
      return;
    }

    const updated = savePlatformFeeConfig({
      recipientWallet: customAddress,
      creationFeeEth: feeEth
    });
    setConfig(updated);
    onShowToast?.({
      type: 'success',
      title: 'Platform Fee Wallet Updated!',
      message: `All platform fees will now be sent directly to ${customAddress.slice(0, 6)}...${customAddress.slice(-4)}`
    });
    onClose();
  };

  const handleUseConnectedWallet = () => {
    if (!wallet?.connected || !wallet?.address) {
      onShowToast?.({
        type: 'warning',
        title: 'Wallet Not Connected',
        message: 'Please connect your Web3 wallet first.'
      });
      return;
    }
    setCustomAddress(wallet.address);
    onShowToast?.({
      type: 'info',
      title: 'Address Filled',
      message: `Set to your connected wallet: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    });
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
      const recipient = config.recipientWallet || wallet?.address;
      const amount = config.vaultBalance;
      const updated = savePlatformFeeConfig({
        vaultBalance: '0.000'
      });
      setConfig(updated);
      onShowToast?.({
        type: 'success',
        title: 'Withdrawal Successful!',
        message: `${amount} ${selectedChain?.currency || 'ETH'} transferred to your wallet: ${recipient.slice(0, 6)}...${recipient.slice(-4)}`
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
          
          {/* Platform Fee Recipient Wallet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-1.5">
                <Wallet size={15} className="text-[#07e3f8]" />
                <span>Platform Fee Recipient Wallet*</span>
              </label>
              {wallet?.connected && (
                <button
                  type="button"
                  onClick={handleUseConnectedWallet}
                  className="text-xs text-[#07e3f8] hover:underline cursor-pointer font-bold"
                >
                  Use Connected Wallet
                </button>
              )}
            </div>
            <p className="text-xs italic text-foreground/50">
              Every token created on this site will pay its creation fee directly to this address.
            </p>
            <input 
              spellCheck="false" 
              className="min-h-10 w-full rounded-lg bg-field px-3 py-2.5 text-sm font-mono text-white placeholder:text-foreground/40 border border-[#44617d]/40 focus:border-[#07e3f8] focus:outline-none" 
              placeholder="0x..." 
              value={customAddress} 
              onChange={(e) => setCustomAddress(e.target.value)} 
            />
            {wallet?.connected && customAddress.toLowerCase() === wallet.address?.toLowerCase() && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-sans pt-0.5">
                <Check size={14} />
                <span>Currently mapped to your connected wallet ({wallet.address.slice(0, 6)}...{wallet.address.slice(-4)})</span>
              </div>
            )}
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
            <span>Save Platform Fee Recipient</span>
          </button>
        </div>

      </div>
    </div>
  );
}
