import React, { useState } from 'react';
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
  Crown
} from 'lucide-react';
import { SUPPORTED_CHAINS } from '../utils/chains';
import PlatformFeeModal from './PlatformFeeModal';

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
  const [platformFeeModalOpen, setPlatformFeeModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const languages = [
    { code: 'en', label: 'English', flag: '/flags/en.svg' },
    { code: 'es', label: 'Español', flag: '/flags/en.svg' },
    { code: 'de', label: 'Deutsch', flag: '/flags/en.svg' },
    { code: 'ru', label: 'Русский', flag: '/flags/en.svg' },
    { code: 'zh', label: '中文', flag: '/flags/en.svg' }
  ];

  const connectWallet = async () => {
    if (sandboxMode) {
      setWallet({
        connected: true,
        address: '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8',
        balance: '4.850 ' + (selectedChain?.symbol || 'ETH'),
        isSimulated: true
      });
      onShowToast?.({
        type: 'success',
        title: 'Demo Wallet Connected',
        message: 'Connected to Sandbox funded with 4.85 ' + (selectedChain?.symbol || 'ETH')
      });
      return;
    }

    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWallet({
            connected: true,
            address: accounts[0],
            balance: '1.240 ' + (selectedChain?.symbol || 'ETH'),
            isSimulated: false
          });
          onShowToast?.({
            type: 'success',
            title: 'MetaMask Connected',
            message: `Connected account ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
          });
        }
      } catch (err) {
        onShowToast?.({
          type: 'error',
          title: 'Connection Failed',
          message: err.message || 'User rejected Web3 connection request'
        });
      }
    } else {
      setSandboxMode(true);
      setWallet({
        connected: true,
        address: '0xe14482e488A7Cee514fbB7Ac99D323a9070e90C8',
        balance: '4.850 ' + (selectedChain?.symbol || 'ETH'),
        isSimulated: true
      });
      onShowToast?.({
        type: 'info',
        title: 'Web3 Demo Wallet Connected',
        message: 'No browser Web3 extension found. Connected demo testnet wallet!'
      });
    }
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
          
          {/* 20lab Official Logo */}
          <a 
            className="max-w-[150px] grow basis-20 cursor-pointer flex items-center" 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            href="/"
          >
            <img 
              alt="20lab logo" 
              loading="lazy" 
              width="138" 
              height="53" 
              decoding="async" 
              className="h-10 w-auto object-contain"
              src="/20lab-logo-min.svg"
            />
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

              {/* Platform Fee Key & Revenue Button */}
              <button
                type="button"
                onClick={() => setPlatformFeeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-bold text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg cursor-pointer transition-all shadow-sm"
                title="Configure Platform Fee & Revenue Wallet"
              >
                <Crown size={14} className="text-amber-400" />
                <span>Platform Fee</span>
              </button>

              {/* Connected Chain & Wallet Button */}
              {wallet?.connected ? (
                <div className="flex items-center gap-2">
                  {/* Selected Chain Badge */}
                  <div className="relative">
                    <button
                      onClick={() => setChainMenuOpen(!chainMenuOpen)}
                      className="flex items-center gap-2 bg-[#1a3249] hover:bg-[#28445f] border border-[#44617d]/40 rounded-lg px-3 py-2 text-xs font-serif text-white cursor-pointer transition-colors"
                    >
                      {selectedChain?.icon ? (
                        <img src={selectedChain.icon} alt={selectedChain.name} className="w-4 h-4 rounded-full" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-[#07e3f8]"></div>
                      )}
                      <span>{selectedChain?.name || 'Ethereum'}</span>
                      <ChevronDown size={14} className="text-slate-400" />
                    </button>

                    {chainMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#1a3249] border border-[#44617d]/60 p-2 shadow-2xl z-50 max-h-80 overflow-y-auto">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                          Select Network
                        </div>
                        {SUPPORTED_CHAINS.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedChain(c);
                              setChainMenuOpen(false);
                            }}
                            className={`flex items-center w-full gap-2 px-2 py-1.5 text-xs rounded hover:bg-white/10 text-left transition-colors cursor-pointer ${
                              selectedChain?.id === c.id ? 'bg-[#07e3f8]/20 text-[#07e3f8] font-bold' : 'text-slate-300'
                            }`}
                          >
                            <img src={c.icon} alt={c.name} className="w-4 h-4 rounded-full" />
                            <span className="truncate flex-1">{c.name}</span>
                            {selectedChain?.id === c.id && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connected Address Button */}
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
                        <div className="text-xs text-slate-400 mb-1">Balance</div>
                        <div className="text-sm font-bold text-white mb-3">
                          {wallet.balance || '0.00 ETH'}
                        </div>

                        {/* Quick Platform Fee Option */}
                        <button
                          onClick={() => {
                            setWalletMenuOpen(false);
                            setPlatformFeeModalOpen(true);
                          }}
                          className="w-full flex items-center justify-between py-2 px-2 text-xs text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 rounded transition-colors cursor-pointer mb-2 font-bold"
                        >
                          <div className="flex items-center gap-1.5">
                            <Crown size={14} className="text-amber-400" />
                            <span>Platform Fee Setup</span>
                          </div>
                          <span className="text-[10px] text-amber-400">Manage</span>
                        </button>

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
                </div>
              ) : (
                /* Connect Wallet Button matching 20lab #connect_button_erc20 */
                <button 
                  className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 gap-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:brightness-75 disabled:border-black/20 bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 md:px-10 py-2 text-base px-2 sm:px-10 lg:px-6 xl:px-10 cursor-pointer shadow-lg shadow-[#07e3f8]/20" 
                  id="connect_button_erc20"
                  onClick={connectWallet}
                >
                  Connect Wallet
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

              {/* Platform Fee Key & Revenue Button */}
              <button
                type="button"
                onClick={() => setPlatformFeeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-bold text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg cursor-pointer transition-all shadow-sm"
                title="Configure Platform Fee & Revenue Wallet"
              >
                <Crown size={14} className="text-amber-400" />
                <span>Platform Fee</span>
              </button>

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
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setPlatformFeeModalOpen(true);
                  }}
                  className="w-full text-left py-2 text-amber-300 font-bold flex items-center gap-2"
                >
                  <Crown size={16} />
                  <span>Platform Fee Settings</span>
                </button>
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
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setPlatformFeeModalOpen(true);
                  }}
                  className="w-full text-left py-2 text-amber-300 font-bold flex items-center gap-2"
                >
                  <Crown size={16} />
                  <span>Platform Fee Settings</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Platform Fee Modal */}
      <PlatformFeeModal
        isOpen={platformFeeModalOpen}
        onClose={() => setPlatformFeeModalOpen(false)}
        wallet={wallet}
        selectedChain={selectedChain}
        onShowToast={onShowToast}
      />
    </div>
  );
}
