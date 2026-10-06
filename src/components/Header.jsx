import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Wallet, 
  ExternalLink, 
  Check, 
  Globe, 
  Menu, 
  X, 
  LogOut, 
  Copy, 
  Sparkles
} from 'lucide-react';
import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from '../utils/chains';

export default function Header({
  currentPath = '/',
  onNavigate,
  selectedChain,
  setSelectedChain,
  wallet,
  setWallet,
  sandboxMode,
  setSandboxMode,
  onShowToast
}) {
  const [chainMenuOpen, setChainMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const languages = [
    { code: 'en', label: 'English', flag: '/flags/en.svg' },
    { code: 'es', label: 'Español', flag: '/flags/en.svg' },
    { code: 'de', label: 'Deutsch', flag: '/flags/en.svg' },
    { code: 'ru', label: 'Русский', flag: '/flags/en.svg' },
    { code: 'zh', label: '中文', flag: '/flags/en.svg' }
  ];

  // Sync Web3 provider events (network changes, account changes)
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (wallet?.connected && !wallet?.isSimulated) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balWei = await provider.getBalance(accounts[0]);
          const balFmt = parseFloat(ethers.formatEther(balWei)).toFixed(4);
          setWallet(prev => ({
            ...prev,
            address: accounts[0],
            balance: `${balFmt} ${selectedChain?.symbol || 'ETH'}`
          }));
        } catch (e) {
          setWallet(prev => ({ ...prev, address: accounts[0] }));
        }
      }
    };

    const handleChainChanged = (hexChainId) => {
      const numChainId = parseInt(hexChainId, 16);
      const matched = SUPPORTED_CHAINS.find(c => c.chainId === numChainId);
      if (matched) {
        setSelectedChain(matched);
        onShowToast?.({
          type: 'info',
          title: 'Network Synced',
          message: `Active network updated to ${matched.name} (${matched.isTestnet ? 'Testnet' : 'Mainnet'})`
        });
      }
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [wallet?.connected, wallet?.isSimulated, selectedChain]);

  // Network Switcher: updates UI and requests MetaMask to switch network
  const switchChain = async (targetChain) => {
    setSelectedChain(targetChain);
    setChainMenuOpen(false);

    if (typeof window.ethereum !== 'undefined' && wallet?.connected && !wallet?.isSimulated) {
      const hexChainId = '0x' + targetChain.chainId.toString(16);
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexChainId }]
        });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const balWei = await provider.getBalance(wallet.address);
        const balFmt = parseFloat(ethers.formatEther(balWei)).toFixed(4);
        setWallet(prev => ({
          ...prev,
          balance: `${balFmt} ${targetChain.symbol}`
        }));

        onShowToast?.({
          type: 'success',
          title: 'Network Switched',
          message: `Switched wallet to ${targetChain.name} (${targetChain.symbol})`
        });
      } catch (switchErr) {
        if (switchErr.code === 4902 || switchErr.message?.includes('Unrecognized')) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: hexChainId,
                chainName: targetChain.name,
                nativeCurrency: {
                  name: targetChain.symbol || 'ETH',
                  symbol: targetChain.symbol || 'ETH',
                  decimals: 18
                },
                rpcUrls: [targetChain.rpcUrl],
                blockExplorerUrls: [targetChain.explorer]
              }]
            });
            onShowToast?.({
              type: 'success',
              title: 'Network Added',
              message: `Added and connected to ${targetChain.name}`
            });
          } catch (addErr) {
            console.error('Failed to add chain:', addErr);
          }
        }
      }
    } else {
      onShowToast?.({
        type: 'info',
        title: 'Network Selected',
        message: `Selected ${targetChain.name} (${targetChain.isTestnet ? 'Testnet' : 'Mainnet'})`
      });
    }
  };

  const connectWallet = async () => {
    // 1. Connect Real Web3 Wallet (MetaMask, Rabby, Coinbase, Phantom, etc.)
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts && accounts.length > 0) {
          const network = await provider.getNetwork();
          const currentNetworkId = Number(network.chainId);
          const targetChainId = Number(selectedChain?.chainId || 1);

          // Prompt switch if network does not match selected chain
          if (currentNetworkId !== targetChainId) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x' + targetChainId.toString(16) }]
              });
            } catch (swErr) {
              if (swErr.code === 4902 || swErr.message?.includes('Unrecognized')) {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x' + targetChainId.toString(16),
                    chainName: selectedChain.name,
                    nativeCurrency: {
                      name: selectedChain.symbol || 'ETH',
                      symbol: selectedChain.symbol || 'ETH',
                      decimals: 18
                    },
                    rpcUrls: [selectedChain.rpcUrl],
                    blockExplorerUrls: [selectedChain.explorer]
                  }]
                });
              }
            }
          }

          // Fetch real on-chain native balance
          const updatedProvider = new ethers.BrowserProvider(window.ethereum);
          let balFormatted = '0.0000';
          try {
            const bal = await updatedProvider.getBalance(accounts[0]);
            balFormatted = parseFloat(ethers.formatEther(bal)).toFixed(4);
          } catch (e) {
            console.warn('Balance fetch error:', e);
          }

          setSandboxMode(false);
          setWallet({
            connected: true,
            address: accounts[0],
            balance: `${balFormatted} ${selectedChain?.symbol || 'ETH'}`,
            isSimulated: false
          });

          onShowToast?.({
            type: 'success',
            title: 'Live Web3 Wallet Connected',
            message: `Connected ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)} on ${selectedChain?.name || 'Mainnet'}!`
          });
          return;
        }
      } catch (err) {
        console.error('Wallet connection error:', err);
        onShowToast?.({
          type: 'error',
          title: 'Connection Rejected',
          message: err.message || 'User rejected Web3 connection request'
        });
        return;
      }
    }

    // 2. Demo fallback if no browser Web3 extension found
    setSandboxMode(true);
    setWallet({
      connected: true,
      address: '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8',
      balance: '4.850 ' + (selectedChain?.symbol || 'ETH'),
      isSimulated: true
    });
    onShowToast?.({
      type: 'info',
      title: 'Demo Wallet Mode',
      message: 'No Web3 extension detected. Opened sandbox funded with test tokens.'
    });
  };

  const disconnectWallet = () => {
    setWallet({
      connected: false,
      address: null,
      balance: null,
      isSimulated: false
    });
    setWalletMenuOpen(false);
    onShowToast?.({
      type: 'info',
      title: 'Wallet Disconnected',
      message: 'You have disconnected your wallet.'
    });
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isHome = currentPath === '/';
  const isApp = !isHome;
  const isCreateToken = currentPath.startsWith('/generate');
  const isDashboard = currentPath.startsWith('/dashboard');
  const isTools = currentPath.startsWith('/tools');

  return (
    <div className="fixed left-0 top-0 w-full z-45 bg-[#0c0c1c]/90 backdrop-blur-md border-b border-[#44617d]/20 transition-all">
      <div>
        <nav className="container relative flex items-center justify-between gap-2 py-4 max-w-screen px-4 sm:px-6 lg:px-8 mx-auto">
          
          {/* RobinPump Deployer Brand Logo */}
          <a 
            className="cursor-pointer flex items-center gap-2.5 grow-0" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            href="/"
          >
            <img 
              alt="RobinPump Deployer logo" 
              loading="lazy" 
              width="40" 
              height="40" 
              decoding="async" 
              className="h-10 w-10 object-contain drop-shadow-[0_0_12px_rgba(7,227,248,0.35)]"
              src="/robinpump-logo.png"
            />
            <div className="flex flex-col">
              <span className="font-serif font-black text-lg tracking-tight bg-linear-to-r from-white via-slate-100 to-[#07e3f8] bg-clip-text text-transparent leading-none">
                RobinPump
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#07e3f8] font-bold font-mono leading-tight">
                Deployer
              </span>
            </div>
          </a>

          {/* Center Navigation Links: App Mode vs Landing Mode */}
          {isApp ? (
            /* App Mode Navbar (Create Token / Dashboard / Tools) */
            <div className="ml-8 flex items-center gap-1.5 xl:gap-5 max-lg:hidden">
              <div className="flex items-center gap-0 xl:gap-5">
                <div>
                  <div className={`relative font-medium ${isCreateToken ? 'text-primary' : 'hover:text-foreground/80'}`}>
                    <a 
                      className="px-3 text-sm font-serif cursor-pointer block" 
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('/generate/');
                      }}
                      href="/generate/"
                    >
                      <div className="inline-block">Create Token</div>
                    </a>
                    {isCreateToken && (
                      <span className="absolute inset-x-0 -bottom-1 -z-10 h-0.5 rounded-full bg-primary/60"></span>
                    )}
                  </div>
                </div>

                <div>
                  <div className={`relative font-medium ${isDashboard ? 'text-primary' : 'hover:text-foreground/80'}`}>
                    <a 
                      className="px-3 text-sm font-serif cursor-pointer block" 
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('/dashboard/');
                      }}
                      href="/dashboard/"
                    >
                      <div className="inline-block">Dashboard</div>
                    </a>
                    {isDashboard && (
                      <span className="absolute inset-x-0 -bottom-1 -z-10 h-0.5 rounded-full bg-primary/60"></span>
                    )}
                  </div>
                </div>

                <div>
                  <div className={`relative font-medium ${isTools ? 'text-primary' : 'hover:text-foreground/80'}`}>
                    <a 
                      className="px-3 text-sm font-serif cursor-pointer block" 
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('/tools/');
                      }}
                      href="/tools/"
                    >
                      <div className="inline-block">Tools</div>
                    </a>
                    {isTools && (
                      <span className="absolute inset-x-0 -bottom-1 -z-10 h-0.5 rounded-full bg-primary/60"></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Network Selector Pill (Always Visible for Mainnet / Testnet switching) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setChainMenuOpen(!chainMenuOpen)}
                  className="flex items-center gap-2 bg-[#1a3249] hover:bg-[#28445f] border border-[#44617d]/60 rounded-lg px-3 py-2 text-xs font-serif text-white cursor-pointer transition-colors shadow-sm"
                  title="Switch Active Blockchain"
                >
                  <span className="text-sm">{selectedChain?.icon || '🔷'}</span>
                  <span className="font-bold">{selectedChain?.name || 'Ethereum'}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${selectedChain?.isTestnet ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                    {selectedChain?.isTestnet ? 'Testnet' : 'Mainnet'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {chainMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#142638] border border-[#44617d]/70 p-2 shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                      <span>Live Mainnets</span>
                      <span className="text-[10px] text-emerald-400/80 font-mono">100% Real Assets</span>
                    </div>
                    {SUPPORTED_CHAINS.filter(c => !c.isTestnet && !c.isSolana).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => switchChain(c)}
                        className={`flex items-center w-full gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-white/10 text-left transition-colors cursor-pointer ${
                          selectedChain?.id === c.id ? 'bg-[#07e3f8]/20 text-[#07e3f8] font-bold border border-[#07e3f8]/30' : 'text-slate-200'
                        }`}
                      >
                        <span className="text-sm">{c.icon}</span>
                        <div className="flex-1 truncate">
                          <div className="font-semibold">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Chain ID: {c.chainId} • {c.symbol}</div>
                        </div>
                        {selectedChain?.id === c.id && <Check size={14} className="text-[#07e3f8]" />}
                      </button>
                    ))}

                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-2 py-1 mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <span>Testnets</span>
                      <span className="text-[10px] text-slate-400 font-mono">Free Testing</span>
                    </div>
                    {SUPPORTED_CHAINS.filter(c => c.isTestnet && !c.isSolana).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => switchChain(c)}
                        className={`flex items-center w-full gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-white/10 text-left transition-colors cursor-pointer ${
                          selectedChain?.id === c.id ? 'bg-[#07e3f8]/20 text-[#07e3f8] font-bold border border-[#07e3f8]/30' : 'text-slate-300'
                        }`}
                      >
                        <span className="text-sm">{c.icon}</span>
                        <div className="flex-1 truncate">
                          <div className="font-semibold">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Chain ID: {c.chainId} • {c.symbol}</div>
                        </div>
                        {selectedChain?.id === c.id && <Check size={14} className="text-[#07e3f8]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Connected Chain & Wallet Button */}
              {wallet?.connected ? (
                <div className="relative">
                  <button
                    onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                    className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg ring-offset-background transition-colors bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-10 px-4 text-xs cursor-pointer gap-2"
                    id="connected_wallet_btn"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span>{formatAddress(wallet.address)}</span>
                    <ChevronDown size={14} />
                  </button>

                  {walletMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-lg bg-[#1a3249] border border-[#44617d]/60 p-3 shadow-2xl z-50 font-serif">
                      <div className="text-xs text-slate-400 mb-1">Connected Address</div>
                      <div className="text-xs text-white font-mono break-all bg-[#0b2034] p-2 rounded mb-3 flex items-center justify-between">
                        <span>{formatAddress(wallet.address)}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard?.writeText(wallet.address);
                            onShowToast?.({ type: 'info', title: 'Copied', message: 'Address copied to clipboard' });
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 mb-1">Native Balance</div>
                      <div className="text-sm font-bold text-white mb-3 font-mono">
                        {wallet.balance || `0.0000 ${selectedChain?.symbol || 'ETH'}`}
                      </div>

                      <button
                        onClick={disconnectWallet}
                        className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      >
                        <LogOut size={13} />
                        <span>Disconnect Wallet</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Connect Wallet Button matching 20lab #connect_button_erc20 */
                <button 
                  className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 gap-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:brightness-75 disabled:border-black/20 bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-10 md:px-6 py-2 text-xs cursor-pointer shadow-lg shadow-[#07e3f8]/20" 
                  id="connect_button_erc20"
                  onClick={connectWallet}
                >
                  <Wallet size={14} />
                  <span>Connect Wallet</span>
                </button>
              )}

              {/* Language Selector */}
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex h-12 items-center justify-between rounded-lg px-3 py-2 text-sm ring-offset-field focus:outline-none font-serif w-fit bg-transparent text-primary pl-2 sm:pl-3 pr-0 cursor-pointer" 
                  aria-label="Select language"
                >
                  <img alt="en" width="20" height="20" src="/flags/en.svg"/>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-lg bg-[#1a3249] border border-[#44617d]/50 p-1 shadow-xl z-50">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setCurrentLang(l.code);
                          setLangMenuOpen(false);
                        }}
                        className={`flex items-center w-full px-3 py-2 text-xs rounded hover:bg-[#07e3f8]/20 text-left transition-colors ${
                          currentLang === l.code ? 'text-[#07e3f8] font-bold' : 'text-slate-300'
                        }`}
                      >
                        <img src={l.flag} alt={l.code} className="w-4 h-4 mr-2" />
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Landing Mode Navbar */
            <div className="flex items-center gap-1.5 xl:gap-5 max-lg:hidden ml-5">
              <div className="flex items-center gap-0 xl:gap-5">
                <div>
                  <div className="relative font-medium hover:text-foreground/80">
                    <a 
                      className="px-3 text-sm font-serif cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isHome) onNavigate('/');
                        setTimeout(() => {
                          const el = document.getElementById('info');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                      href="/#info"
                    >
                      <div className="inline-block">Info</div>
                    </a>
                  </div>
                </div>

                <div>
                  <div className="relative font-medium hover:text-foreground/80">
                    <a 
                      className="px-3 text-sm font-serif cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isHome) onNavigate('/');
                        setTimeout(() => {
                          const el = document.getElementById('features');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                      href="/#features"
                    >
                      <div className="inline-block">Features</div>
                    </a>
                  </div>
                </div>

                <div>
                  <div className="relative font-medium hover:text-foreground/80">
                    <a 
                      className="px-3 text-sm font-serif cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isHome) onNavigate('/');
                        setTimeout(() => {
                          const el = document.getElementById('audits');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                      href="/#audits"
                    >
                      <div className="inline-block">Audits</div>
                    </a>
                  </div>
                </div>

                <div>
                  <div className="relative font-medium hover:text-foreground/80">
                    <a 
                      className="px-3 text-sm font-serif cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isHome) onNavigate('/');
                        setTimeout(() => {
                          const el = document.getElementById('statistics');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                      href="/#statistics"
                    >
                      <div className="inline-block">Statistics</div>
                    </a>
                  </div>
                </div>

                <div>
                  <div className="relative font-medium hover:text-foreground/80">
                    <a 
                      className="px-3 text-sm font-serif cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isHome) onNavigate('/');
                        setTimeout(() => {
                          const el = document.getElementById('pricing');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                      href="/#pricing"
                    >
                      <div className="inline-block">Pricing</div>
                    </a>
                  </div>
                </div>

                <div>
                  <div className="relative font-medium hover:text-foreground/80">
                    <a 
                      className="px-3 text-sm font-serif cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isHome) onNavigate('/');
                        setTimeout(() => {
                          const el = document.getElementById('reviews');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      }}
                      href="/#reviews"
                    >
                      <div className="inline-block">Reviews &amp; FAQ</div>
                    </a>
                  </div>
                </div>

                <div>
                  <div className="relative font-medium hover:text-foreground/80">
                    <a 
                      className="px-3 text-sm font-serif cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        onShowToast?.({
                          type: 'info',
                          title: '20lab Blog',
                          message: 'Explore the latest token guides and technical tutorials.'
                        });
                      }}
                      href="/blog/"
                    >
                      <div className="inline-block">Blog</div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Open App CTA button */}
              <button 
                className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 gap-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:brightness-75 disabled:border-black/20 bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 md:px-10 py-2 text-base px-2 sm:px-10 lg:px-6 xl:px-10 cursor-pointer shadow-lg shadow-[#07e3f8]/20" 
                id="initial_open_app"
                onClick={() => onNavigate('/generate/')}
              >
                Open App <span></span>
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex h-12 items-center justify-between rounded-lg px-3 py-2 text-sm ring-offset-field focus:outline-none font-serif w-fit bg-transparent text-primary pl-2 sm:pl-3 pr-0 cursor-pointer" 
                  aria-label="Select language"
                >
                  <img alt="en" width="20" height="20" src="/flags/en.svg"/>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-lg bg-[#1a3249] border border-[#44617d]/50 p-1 shadow-xl z-50">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setCurrentLang(l.code);
                          setLangMenuOpen(false);
                        }}
                        className={`flex items-center w-full px-3 py-2 text-xs rounded hover:bg-[#07e3f8]/20 text-left transition-colors ${
                          currentLang === l.code ? 'text-[#07e3f8] font-bold' : 'text-slate-300'
                        }`}
                      >
                        <img src={l.flag} alt={l.code} className="w-4 h-4 mr-2" />
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Icon & Wallet / Open App Button */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="px-2 text-foreground cursor-pointer"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
            {isApp ? (
              wallet?.connected ? (
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg ring-offset-background transition-colors bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-10 px-3 text-xs"
                >
                  {formatAddress(wallet.address)}
                </button>
              ) : (
                <button 
                  className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg ring-offset-background transition-colors bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-10 px-3 text-xs" 
                  id="connect_button_erc20"
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              )
            ) : (
              <button 
                className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg ring-offset-background transition-colors bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-10 px-4 text-sm" 
                id="initial_open_app"
                onClick={() => onNavigate('/generate/')}
              >
                Open App
              </button>
            )}
          </div>

        </nav>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0c0c1c] border-b border-[#44617d]/30 px-6 py-4 space-y-3 font-serif">
            {isApp ? (
              <>
                <a 
                  href="/generate/" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    onNavigate('/generate/');
                  }} 
                  className={`block py-2 ${isCreateToken ? 'text-[#07e3f8] font-bold' : 'text-slate-200 hover:text-[#07e3f8]'}`}
                >
                  Create Token
                </a>
                <a 
                  href="/dashboard/" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    onNavigate('/dashboard/');
                  }} 
                  className={`block py-2 ${isDashboard ? 'text-[#07e3f8] font-bold' : 'text-slate-200 hover:text-[#07e3f8]'}`}
                >
                  Dashboard
                </a>
                <a 
                  href="/tools/" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    onNavigate('/tools/');
                  }} 
                  className={`block py-2 ${isTools ? 'text-[#07e3f8] font-bold' : 'text-slate-200 hover:text-[#07e3f8]'}`}
                >
                  Tools
                </a>
              </>
            ) : (
              <>
                <a 
                  href="/#info" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    if (!isHome) onNavigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('info');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }} 
                  className="block py-2 text-slate-200 hover:text-[#07e3f8]"
                >
                  Info
                </a>
                <a 
                  href="/#features" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    if (!isHome) onNavigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('features');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }} 
                  className="block py-2 text-slate-200 hover:text-[#07e3f8]"
                >
                  Features
                </a>
                <a 
                  href="/#audits" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    if (!isHome) onNavigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('audits');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }} 
                  className="block py-2 text-slate-200 hover:text-[#07e3f8]"
                >
                  Audits
                </a>
                <a 
                  href="/#statistics" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    if (!isHome) onNavigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('statistics');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }} 
                  className="block py-2 text-slate-200 hover:text-[#07e3f8]"
                >
                  Statistics
                </a>
                <a 
                  href="/#pricing" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    if (!isHome) onNavigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('pricing');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }} 
                  className="block py-2 text-slate-200 hover:text-[#07e3f8]"
                >
                  Pricing
                </a>
                <a 
                  href="/#reviews" 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    if (!isHome) onNavigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('reviews');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }} 
                  className="block py-2 text-slate-200 hover:text-[#07e3f8]"
                >
                  Reviews &amp; FAQ
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
