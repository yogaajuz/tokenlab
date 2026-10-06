import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Check, 
  ExternalLink,
  ChevronDown,
  ArrowUp,
  Sparkles,
  Shield,
  Zap,
  Lock,
  Layers,
  Coins,
  Send,
  Code
} from 'lucide-react';

export default function LandingPage({
  onNavigate,
  onShowToast
}) {
  const [pricingTab, setPricingTab] = useState('erc20'); // 'spl', 'erc20', 'sui'
  const [pricingSubTab, setPricingSubTab] = useState('generator'); // 'generator', 'tools'
  const [openFaq, setOpenFaq] = useState(0); // 0th open by default
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const blockchains = [
    { name: 'Ethereum', img: '/images/crypto/1.png' },
    { name: 'Optimism', img: '/images/crypto/10.png' },
    { name: 'Cronos', img: '/images/crypto/25.png' },
    { name: 'BSC', img: '/images/crypto/56.png' },
    { name: 'Unichain', img: '/images/crypto/130.png' },
    { name: 'Polygon', img: '/images/crypto/137.png' },
    { name: 'Monad', img: '/images/crypto/143.png' },
    { name: 'Sonic', img: '/images/crypto/146.png' },
    { name: 'PulseChain', img: '/images/crypto/369.png' },
    { name: 'HyperEVM', img: '/images/crypto/999.png' },
    { name: 'Metis', img: '/images/crypto/1088.png' },
    { name: 'Core', img: '/images/crypto/1116.png' },
    { name: 'Robinhood', img: '/images/crypto/4663.png' },
    { name: 'Mantle', img: '/images/crypto/5000.png' },
    { name: 'Base', img: '/images/crypto/8453.png' },
    { name: 'Arbitrum', img: '/images/crypto/42161.png' },
    { name: 'Avalanche', img: '/images/crypto/43114.png' },
    { name: 'Linea', img: '/images/crypto/59144.png' },
    { name: 'Blast', img: '/images/crypto/81457.png' },
    { name: 'Solana', img: '/images/crypto/solana-mainnet.png' },
    { name: 'Sui', img: '/images/crypto/sui-mainnet.png' },
  ];

  const audits = [
    {
      auditor: 'CertiK',
      logo: '/images/auditors/certik-min.svg',
      tokenName: 'Nexis Network Token',
      tokenChain: 'Ethereum',
      chainImg: '/images/crypto/1.png',
      score: '94/100',
      badge: 'Audited'
    },
    {
      auditor: 'Cyberscope',
      logo: '/images/auditors/cyberscope-min.png',
      tokenName: 'AeroFinance Protocol',
      tokenChain: 'Base',
      chainImg: '/images/crypto/8453.png',
      score: '100% Passed',
      badge: 'Verified'
    },
    {
      auditor: 'SolidProof',
      logo: '/images/auditors/solidproof-min.png',
      tokenName: 'SolVortex Utility',
      tokenChain: 'Solana',
      chainImg: '/images/crypto/solana-mainnet.png',
      score: 'Audited',
      badge: 'KYC & Audit'
    },
    {
      auditor: 'EtherAuthority',
      logo: '/images/auditors/etherauthority-min.png',
      tokenName: 'Quantum Pulse',
      tokenChain: 'Arbitrum',
      chainImg: '/images/crypto/42161.png',
      score: 'No Vulnerabilities',
      badge: 'Verified'
    },
    {
      auditor: 'BlockSAFU',
      logo: '/images/auditors/blocksafu-min.png',
      tokenName: 'HyperDEX Token',
      tokenChain: 'BSC',
      chainImg: '/images/crypto/56.png',
      score: 'Passed',
      badge: 'Audited'
    }
  ];

  const reviews = [
    {
      author: 'Alex K.',
      title: 'Flawless token deployment on Base',
      rating: 5,
      content: 'We created our token some time ago and the process was simple and easy to follow. We have recently had cause to ask for assistance in a matter and the support was ultra-responsive and resolved everything in minutes.',
      date: 'Verified Trustpilot Review'
    },
    {
      author: 'Marco R.',
      title: 'Saved us $2,500 in dev audit costs',
      rating: 5,
      content: '20lab is without question the cleanest token generator out there. The gas optimization is real — we saved roughly 38% compared to standard OpenZeppelin templates on Ethereum.',
      date: 'Verified Trustpilot Review'
    },
    {
      author: 'Elena S.',
      title: 'Solana SPL and Sui support is top tier',
      rating: 5,
      content: 'The ability to revoke freeze authority and mint authority directly in the creation flow made our launch instantly greenlit on DexScreener and Birdeye without honeypot flags.',
      date: 'Verified Trustpilot Review'
    },
    {
      author: 'David P.',
      title: 'Transparent pricing and 100% token ownership',
      rating: 5,
      content: 'No hidden mint backdoors, zero creator fees taken from transfers. Etherscan verified the contract automatically without having to flatten manually. 10/10.',
      date: 'Verified Trustpilot Review'
    }
  ];

  const faqs = [
    {
      q: 'How token creation process look like?',
      a: 'Creating your token takes just 3 simple steps:\n1. Select your desired token type you wish to create (ERC-20, SPL, Sui).\n2. Choose features and supply parameters tailored to your project.\n3. Deploy the token to the blockchain with zero coding — verified source code and full ownership are transferred directly to your wallet.'
    },
    {
      q: 'Do I have full ownership of the token?',
      a: 'Yes! 100% of the initial supply and all smart contract owner permissions are assigned directly to your wallet address upon deployment. 20lab retains zero hidden fees, zero mint rights, and zero backdoors.'
    },
    {
      q: 'How can I verify my ERC-20 token on block explorer?',
      a: 'All contracts generated by 20lab use audited OpenZeppelin standards and are pre-configured for automated verification on Etherscan, BscScan, Basescan, and Polygonscan using standard compiler settings.'
    },
    {
      q: 'Are the 20lab tokens secure?',
      a: 'Yes. Our smart contract architecture has undergone rigorous security reviews and testing against CertiK, SolidProof, and Cyberscope standards. Contracts are gas-optimized (saving up to 40% on deployment and transfers) and completely free from malicious honeypot logic.'
    },
    {
      q: 'I need more help - what should I do?',
      a: 'You can reach out directly to the 20lab team and active community via our official Telegram channel (@x20lab) or email us at contact@20lab.app. We offer rapid 24/7 developer assistance.'
    }
  ];

  const handlePricingCta = () => {
    if (pricingTab === 'spl') onNavigate('/generate/spl-token/');
    else if (pricingTab === 'sui') onNavigate('/generate/sui-token/');
    else onNavigate('/generate/erc20-token/');
  };

  return (
    <main className="flex-1" id="main-content">
      <div className="container space-y-20 py-16 md:space-y-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. HERO SECTION */}
        <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-x-5 pt-12 md:pt-16">
          <div className="space-y-5">
            <p className="text-primary font-serif font-medium">The most customizable token generator</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif md:!leading-normal tracking-normal text-white">
              Customizable token for your project
            </h1>
            <p className="font-serif text-lg leading-relaxed pb-5 max-sm:text-base text-foreground/80">
              Choose the features you need and take full control of your tokens. Save time and around 40% on gas fees with our gas-optimized generator. Create ERC-20, SPL (Solana) or Sui token today!
            </p>
            <button 
              className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg text-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 gap-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:brightness-75 disabled:border-black/20 bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 px-3 md:px-10 py-2 cursor-pointer shadow-lg shadow-[#07e3f8]/25" 
              id="initial-create-token"
              onClick={() => onNavigate('/generate/')}
            >
              Create a Token <span></span>
            </button>
          </div>

          {/* Hero 3D Graphic */}
          <div className="max-md:hidden flex justify-end">
            <picture>
              <source media="(min-width: 768px)" srcSet="/images/main/main.png" />
              <img 
                className="hidden md:block w-full max-w-[560px] drop-shadow-2xl" 
                alt="Ethereum, Solana and Sui tokens in 3D space with various shapes. Hand pointing to the Ethereum token." 
                width="560" 
                src="/images/main/main.png"
              />
            </picture>
          </div>

          {/* Ambient Blurred Background Glows */}
          <div className="relative w-full pointer-events-none">
            <div className="absolute -z-10 size-[32rem] rounded-full bg-linear-to-b blur-[180px] from-[#00C2FF] via-[#06E1F8] to-transparent right-[-200%] top-[-40rem] scale-125 opacity-70"></div>
            <div className="absolute -z-10 size-[32rem] rounded-full bg-linear-to-b blur-[180px] from-[#2453ff] via-[#174AFF] to-transparent right-[-170%] top-[-25rem] opacity-70"></div>
          </div>
        </div>

        {/* 2. POWERED BY STRIP */}
        <div className="relative overflow-hidden pt-4 pb-2 border-y border-[#44617d]/20">
          <p className="relative z-20 text-sm font-medium leading-tight text-gray-400">Powered by</p>
          <div className="absolute -inset-10 z-10 bg-linear-to-r from-background/40 via-transparent to-background/40 max-md:hidden pointer-events-none"></div>
          <div className="flex items-center gap-10 py-7 overflow-x-auto scrollbar-none">
            {blockchains.map((chain) => (
              <div 
                key={chain.name} 
                onClick={() => onNavigate('/generate/')}
                className="flex min-w-fit items-center gap-2 group cursor-pointer hover:scale-105 transition-transform"
              >
                <img 
                  alt={`${chain.name} logo`} 
                  width="32" 
                  height="32" 
                  className="w-8 h-8 rounded-full" 
                  src={chain.img}
                />
                <div className="font-serif font-medium text-gray-400 group-hover:text-[#07e3f8] transition-colors">
                  {chain.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. BENEFITS OF CUSTOMIZABLE TOKENS (ID: INFO) */}
        <div className="space-y-12" id="info">
          <div className="flex max-w-[1000px] flex-col gap-3 items-center mx-auto text-center">
            <p className="text-primary font-serif">Info</p>
            <h2 className="text-3xl md:text-5xl font-bold font-serif tracking-wide !leading-normal text-white">
              Benefits of customizable tokens
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Unleash Innovation */}
            <div className="flex flex-col justify-between rounded-2xl bg-form/70 border border-[#44617d]/30 p-8 hover:border-[#07e3f8]/50 transition-all hover:shadow-xl hover:shadow-[#07e3f8]/5 group">
              <div className="space-y-4">
                <div className="h-48 flex items-center justify-center overflow-hidden rounded-xl bg-[#0b2034]/50 p-4">
                  <img 
                    src="/images/projects/unleash-innovation.png" 
                    alt="Unleash Innovation" 
                    className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold font-serif text-white pt-2">Unleash Innovation</h3>
                <p className="text-sm font-serif text-foreground/80 leading-relaxed">
                  Build your token with standard or advanced features like mintable supply, burning, emergency pause, automated tax rewards, or gasless transactions.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('/generate/')}
                className="mt-6 flex items-center gap-2 text-sm font-serif font-bold text-primary hover:text-white transition-colors cursor-pointer"
              >
                <span>Create with features</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Card 2: Maximize Efficiency */}
            <div className="flex flex-col justify-between rounded-2xl bg-form/70 border border-[#44617d]/30 p-8 hover:border-[#07e3f8]/50 transition-all hover:shadow-xl hover:shadow-[#07e3f8]/5 group">
              <div className="space-y-4">
                <div className="h-48 flex items-center justify-center overflow-hidden rounded-xl bg-[#0b2034]/50 p-4">
                  <img 
                    src="/images/projects/maximize-efficiency.png" 
                    alt="Maximize Efficiency" 
                    className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold font-serif text-white pt-2">Maximize Efficiency</h3>
                <p className="text-sm font-serif text-foreground/80 leading-relaxed">
                  Save around 40% on gas fees thanks to gas-optimized assembly routines. Eliminate repetitive developer hours and deploy in under two minutes.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('/generate/')}
                className="mt-6 flex items-center gap-2 text-sm font-serif font-bold text-primary hover:text-white transition-colors cursor-pointer"
              >
                <span>Save on gas</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Card 3: Generate with Confidence */}
            <div className="flex flex-col justify-between rounded-2xl bg-form/70 border border-[#44617d]/30 p-8 hover:border-[#07e3f8]/50 transition-all hover:shadow-xl hover:shadow-[#07e3f8]/5 group">
              <div className="space-y-4">
                <div className="h-48 flex items-center justify-center overflow-hidden rounded-xl bg-[#0b2034]/50 p-4">
                  <img 
                    src="/images/projects/generate-with-confidence.png" 
                    alt="Generate with Confidence" 
                    className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold font-serif text-white pt-2">Generate with Confidence</h3>
                <p className="text-sm font-serif text-foreground/80 leading-relaxed">
                  Audited architecture using OpenZeppelin standards. Zero backdoors, zero hidden fees, verified source code ready for block explorers.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('/generate/')}
                className="mt-6 flex items-center gap-2 text-sm font-serif font-bold text-primary hover:text-white transition-colors cursor-pointer"
              >
                <span>Audited code</span>
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </div>

        {/* 4. STATISTICS & FEATURES COUNTERS (ID: FEATURES) */}
        <div className="space-y-12" id="features">
          <div className="flex max-w-[1000px] flex-col gap-3 items-center mx-auto text-center">
            <p className="text-primary font-serif">Features</p>
            <h3 className="text-3xl md:text-5xl font-bold font-serif tracking-wide !leading-normal text-white">
              Trusted by 1500+ crypto project owners
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-form/70 border border-[#44617d]/30 text-center space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-[#07e3f8]">1500+</div>
              <div className="text-xs sm:text-sm font-serif text-foreground/80">Crypto project owners</div>
            </div>
            <div className="p-6 rounded-2xl bg-form/70 border border-[#44617d]/30 text-center space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-[#07e3f8]">3</div>
              <div className="text-xs sm:text-sm font-serif text-foreground/80">Token types supported</div>
            </div>
            <div className="p-6 rounded-2xl bg-form/70 border border-[#44617d]/30 text-center space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-[#07e3f8]">17</div>
              <div className="text-xs sm:text-sm font-serif text-foreground/80">Customizable features</div>
            </div>
            <div className="p-6 rounded-2xl bg-form/70 border border-[#44617d]/30 text-center space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-[#07e3f8]">29</div>
              <div className="text-xs sm:text-sm font-serif text-foreground/80">Efficient tools</div>
            </div>
          </div>
        </div>

        {/* 5. HOW TO GENERATE FIRST TOKEN TUTORIAL (ID: TUTORIAL) */}
        <div className="space-y-12" id="tutorial">
          <div className="flex max-w-[1000px] flex-col gap-3 items-center mx-auto text-center">
            <p className="text-primary font-serif">Tutorial</p>
            <h3 className="text-3xl md:text-5xl font-bold font-serif tracking-wide !leading-normal text-white">
              How to generate first crypto token?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              
              <div className="flex gap-4 p-5 rounded-2xl bg-form/70 border border-[#44617d]/30 items-start">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-primary-alt text-black font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold font-serif text-white">Select Token Type</h4>
                  <p className="text-sm font-serif text-foreground/80">
                    Choose between ERC-20 (Ethereum, Base, BSC, Arbitrum, Polygon, etc.), Solana SPL standard, or Move-based Sui token.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-5 rounded-2xl bg-form/70 border border-[#44617d]/30 items-start">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-primary-alt text-black font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold font-serif text-white">Customize Features &amp; Parameters</h4>
                  <p className="text-sm font-serif text-foreground/80">
                    Set your Token Name, Symbol, Decimals, Initial Supply, and toggle features like mintable, burnable, anti-whale limit, marketing tax, or pausable.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-5 rounded-2xl bg-form/70 border border-[#44617d]/30 items-start">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-primary-alt text-black font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold font-serif text-white">Deploy &amp; Take Ownership</h4>
                  <p className="text-sm font-serif text-foreground/80">
                    Connect your wallet or test in demo sandbox. Deploy your token in one click. 100% supply and ownership rights go directly to your address.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => onNavigate('/generate/')}
                className="inline-flex items-center justify-center font-bold font-serif rounded-lg text-base bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 px-8 cursor-pointer shadow-lg shadow-[#07e3f8]/20"
              >
                Start Token Creation
              </button>
            </div>

            <div className="flex justify-center">
              <img 
                src="/images/main/tutorials.png" 
                alt="Tutorials graphic" 
                className="w-full max-w-lg rounded-2xl border border-[#44617d]/30 shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* 6. AUDITED TOKENS ON 20LAB (ID: AUDITS) */}
        <div className="space-y-12" id="audits">
          <div className="flex max-w-[1000px] flex-col gap-3 items-center mx-auto text-center">
            <p className="text-primary font-serif">Audits</p>
            <h3 className="text-3xl md:text-5xl font-bold font-serif tracking-wide !leading-normal text-white">
              Audited tokens created on 20lab
            </h3>
          </div>

          {/* Auditor Logos */}
          <div className="flex flex-wrap items-center justify-center gap-8 py-6 border-y border-[#44617d]/20">
            <img src="/images/auditors/certik-min.svg" alt="CertiK" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            <img src="/images/auditors/cyberscope-min.png" alt="Cyberscope" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            <img src="/images/auditors/solidproof-min.png" alt="SolidProof" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            <img src="/images/auditors/etherauthority-min.png" alt="EtherAuthority" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            <img src="/images/auditors/blocksafu-min.png" alt="BlockSAFU" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
          </div>

          {/* Audited Tokens Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {audits.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-[#44617d]/30 bg-form/70 p-6 flex flex-col justify-between space-y-4 hover:border-[#07e3f8]/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={item.chainImg} alt={item.tokenChain} className="w-5 h-5 rounded-full" />
                    <span className="text-xs font-serif text-slate-400">{item.tokenChain}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#014737] text-[#31c48d] text-xs font-mono font-bold">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-bold font-serif text-white">{item.tokenName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span>Audited by:</span>
                    <span className="font-bold text-[#07e3f8]">{item.auditor}</span>
                  </div>
                  <div className="text-xs font-mono text-[#31c48d]">Security Score: {item.score}</div>
                </div>

                <button 
                  onClick={() => {
                    onShowToast?.({
                      type: 'success',
                      title: 'Verified Audit',
                      message: `${item.tokenName} smart contract verified with zero high-severity issues.`
                    });
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#0b2034] hover:bg-[#07e3f8]/20 border border-[#44617d]/40 text-xs font-serif font-bold text-white transition-colors cursor-pointer"
                >
                  View Audit Report
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 7. STATISTICS SECTION (ID: STATISTICS) */}
        <div className="space-y-12" id="statistics">
          <div className="flex max-w-[1000px] flex-col gap-3 items-center mx-auto text-center">
            <p className="text-primary font-serif">Statistics</p>
            <h3 className="text-3xl md:text-5xl font-bold font-serif tracking-wide !leading-normal text-white">
              Backed by experience
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img 
                src="/images/main/statistics.png" 
                alt="20lab statistics" 
                className="w-full max-w-lg rounded-2xl border border-[#44617d]/30 shadow-2xl"
              />
            </div>

            <div className="space-y-6">
              <h4 className="text-2xl font-bold font-serif text-white">Engineered for Reliability</h4>
              <p className="font-serif text-foreground/80 leading-relaxed">
                20lab token contracts are battle-tested across thousands of successful deployments on Ethereum, Solana, Base, BSC, and Sui. Every line of code is structured to protect founders and investors alike.
              </p>
              
              <ul className="space-y-3 font-serif text-sm text-foreground/90">
                <li className="flex items-center gap-3">
                  <span className="p-1 rounded-full bg-[#31c48d]/20 text-[#31c48d]"><Check size={14} /></span>
                  <span><strong>~40% Gas Reduction:</strong> Custom assembly optimizations minimize mint and transfer costs.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="p-1 rounded-full bg-[#31c48d]/20 text-[#31c48d]"><Check size={14} /></span>
                  <span><strong>Zero Honeypot Logic:</strong> 100% clean, non-malicious smart contract architecture.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="p-1 rounded-full bg-[#31c48d]/20 text-[#31c48d]"><Check size={14} /></span>
                  <span><strong>Instant Block Explorer Verification:</strong> Flawless auto-verification without manual flattening.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="p-1 rounded-full bg-[#31c48d]/20 text-[#31c48d]"><Check size={14} /></span>
                  <span><strong>Full Ownership:</strong> You retain complete mint, burn, and administrative rights.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 8. PRICING SECTION (ID: PRICING) */}
        <div className="space-y-12" id="pricing">
          <div className="flex max-w-[1000px] flex-col gap-3 items-center mx-auto text-center">
            <p className="text-primary font-serif">Pricing</p>
            <h3 className="text-3xl md:text-5xl font-bold font-serif tracking-wide !leading-normal text-white">
              Simple and Transparent
            </h3>
            <p className="max-w-2xl font-serif text-lg leading-normal text-foreground/80">
              Choose the best setup for your new token.<br/>
              Already have one? Use our tools to manage it.<br/>
              If you have any questions, feel free to <a target="_blank" rel="noopener noreferrer nofollow" className="text-primary-alt hover:underline whitespace-nowrap" href="https://t.me/x20lab">contact us</a>.
            </p>
          </div>

          {/* Pricing Tabs */}
          <div className="flex flex-col items-center gap-6">
            
            {/* Primary Chain Tabs: SPL, ERC-20, Sui */}
            <div className="inline-flex items-center rounded-full bg-form/70 border border-[#44617d]/40 p-1">
              <button
                onClick={() => setPricingTab('spl')}
                className={`px-5 py-2 rounded-full text-sm font-serif font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  pricingTab === 'spl' ? 'bg-[#07e3f8] text-black shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                <img src="/images/crypto/solana-mainnet.png" alt="Solana" className="w-5 h-5 rounded-full" />
                <span>SPL Tokens</span>
              </button>

              <button
                onClick={() => setPricingTab('erc20')}
                className={`px-5 py-2 rounded-full text-sm font-serif font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  pricingTab === 'erc20' ? 'bg-[#07e3f8] text-black shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                <img src="/images/crypto/1.png" alt="ERC-20" className="w-5 h-5 rounded-full" />
                <span>ERC-20 Tokens</span>
              </button>

              <button
                onClick={() => setPricingTab('sui')}
                className={`px-5 py-2 rounded-full text-sm font-serif font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  pricingTab === 'sui' ? 'bg-[#07e3f8] text-black shadow-md' : 'text-slate-300 hover:text-white'
                }`}
              >
                <img src="/images/crypto/sui-mainnet.png" alt="Sui" className="w-5 h-5 rounded-full" />
                <span>Sui Tokens</span>
              </button>
            </div>

            {/* Sub Tabs: Generator vs Tools */}
            <div className="inline-flex rounded-lg bg-[#0b2034] p-1 border border-[#44617d]/30 text-xs font-serif font-semibold">
              <button
                onClick={() => setPricingSubTab('generator')}
                className={`px-4 py-1.5 rounded-md transition-all ${
                  pricingSubTab === 'generator' ? 'bg-[#1a3249] text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Token Generator
              </button>
              <button
                onClick={() => setPricingSubTab('tools')}
                className={`px-4 py-1.5 rounded-md transition-all ${
                  pricingSubTab === 'tools' ? 'bg-[#1a3249] text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Token Tools
              </button>
            </div>

          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Standard Tier */}
            <div className="rounded-2xl border border-[#44617d]/30 bg-form/70 p-8 flex flex-col justify-between space-y-6 hover:border-[#07e3f8]/50 transition-all">
              <div className="space-y-4">
                <div className="text-sm font-serif text-[#07e3f8] font-bold uppercase tracking-wider">Basic</div>
                <h4 className="text-2xl font-bold font-serif text-white">Standard Token</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-serif text-white">
                    {pricingTab === 'erc20' ? 'Free / Gas' : pricingTab === 'spl' ? '0.1 SOL' : '0.5 SUI'}
                  </span>
                  <span className="text-xs text-slate-400">+ network gas</span>
                </div>
                <p className="text-xs font-serif text-slate-300">
                  Ideal for utility tokens and simple community projects with fixed total supply.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs font-serif text-slate-200">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> 100% Token Ownership</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Fixed Initial Supply</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Standard Decimals (18 / 9)</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Auto-verified on Explorers</li>
                </ul>
              </div>

              <button 
                onClick={handlePricingCta}
                className="w-full py-3 rounded-lg bg-[#0b2034] hover:bg-[#07e3f8]/20 border border-[#44617d]/50 text-sm font-serif font-bold text-white transition-colors cursor-pointer"
              >
                Create Standard Token
              </button>
            </div>

            {/* Popular Tier */}
            <div className="rounded-2xl border-2 border-[#07e3f8] bg-linear-to-b from-[#1a3249] to-form/90 p-8 flex flex-col justify-between space-y-6 shadow-2xl shadow-[#07e3f8]/10 relative">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-linear-to-r from-primary to-primary-alt text-black text-xs font-serif font-black uppercase tracking-wider">
                Most Popular
              </div>

              <div className="space-y-4">
                <div className="text-sm font-serif text-[#07e3f8] font-bold uppercase tracking-wider">Custom</div>
                <h4 className="text-2xl font-bold font-serif text-white">Deflationary / Meme</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-serif text-white">
                    {pricingTab === 'erc20' ? '0.015 ETH' : pricingTab === 'spl' ? '0.3 SOL' : '1.5 SUI'}
                  </span>
                  <span className="text-xs text-slate-400">+ network gas</span>
                </div>
                <p className="text-xs font-serif text-slate-300">
                  Full customizability for community memes and tokens requiring marketing fees.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs font-serif text-slate-200">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Everything in Standard</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Auto-Burn / Deflationary Fee</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Marketing Treasury Tax</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Anti-Whale Max Tx Limit</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Anti-Bot Transaction Cooldown</li>
                </ul>
              </div>

              <button 
                onClick={handlePricingCta}
                className="w-full py-3 rounded-lg bg-linear-to-r from-primary to-primary-alt text-black font-serif font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-[#07e3f8]/25"
              >
                Create Custom Token
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-2xl border border-[#44617d]/30 bg-form/70 p-8 flex flex-col justify-between space-y-6 hover:border-[#07e3f8]/50 transition-all">
              <div className="space-y-4">
                <div className="text-sm font-serif text-[#07e3f8] font-bold uppercase tracking-wider">Enterprise</div>
                <h4 className="text-2xl font-bold font-serif text-white">Full Protocol Suite</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-serif text-white">
                    {pricingTab === 'erc20' ? '0.04 ETH' : pricingTab === 'spl' ? '0.6 SOL' : '3.0 SUI'}
                  </span>
                  <span className="text-xs text-slate-400">+ network gas</span>
                </div>
                <p className="text-xs font-serif text-slate-300">
                  Complete feature set with gasless approvals, blacklist manager, and multi-sig ownership.
                </p>

                <ul className="space-y-2.5 pt-4 text-xs font-serif text-slate-200">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Everything in Custom</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> ERC-2612 Gasless Permit</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Emergency Circuit Breaker (Pause)</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Blacklist &amp; Sniper Protection</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#31c48d]" /> Batch MultiSender Airdrop Access</li>
                </ul>
              </div>

              <button 
                onClick={handlePricingCta}
                className="w-full py-3 rounded-lg bg-[#0b2034] hover:bg-[#07e3f8]/20 border border-[#44617d]/50 text-sm font-serif font-bold text-white transition-colors cursor-pointer"
              >
                Create Enterprise Token
              </button>
            </div>

          </div>
        </div>

        {/* 9. REVIEWS SECTION (ID: REVIEWS) */}
        <div className="space-y-12" id="reviews">
          <div className="flex max-w-[1000px] flex-col gap-3 items-center mx-auto text-center">
            <p className="text-primary font-serif">Reviews</p>
            <h3 className="text-3xl md:text-5xl font-bold font-serif tracking-wide !leading-normal text-white">
              What Users say about 20lab
            </h3>
            
            {/* Trustpilot Stars */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex gap-1">
                <img src="/images/star-min.svg" alt="star" className="w-5 h-5" />
                <img src="/images/star-min.svg" alt="star" className="w-5 h-5" />
                <img src="/images/star-min.svg" alt="star" className="w-5 h-5" />
                <img src="/images/star-min.svg" alt="star" className="w-5 h-5" />
                <img src="/images/star-min.svg" alt="star" className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-sm text-white">4.3 / 5 Rating on Trustpilot</span>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-2xl border border-[#44617d]/30 bg-form/70 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {[...Array(r.rating)].map((_, s) => (
                      <img key={s} src="/images/star-min.svg" alt="star" className="w-4 h-4" />
                    ))}
                  </div>
                  <h4 className="text-sm font-bold font-serif text-white">{r.title}</h4>
                  <p className="text-xs font-serif text-foreground/80 leading-relaxed italic">
                    "{r.content}"
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-slate-400">
                  <span className="font-bold text-white">{r.author}</span>
                  <span>{r.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <a 
              href="https://www.trustpilot.com/review/20lab.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#44617d]/50 bg-[#0b2034] text-sm font-serif font-bold text-white hover:bg-[#07e3f8]/20 transition-colors"
            >
              <span>See all Trustpilot reviews</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* 10. FAQ SECTION (ID: FAQ) */}
        <div className="space-y-12" id="faq">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            
            {/* Left FAQ Intro */}
            <div className="space-y-6">
              <p className="text-primary font-serif font-medium">FAQ</p>
              <h3 className="text-3xl md:text-5xl font-bold font-serif tracking-wide !leading-normal text-white">
                Frequently Asked Questions
              </h3>
              <p className="font-serif text-lg leading-relaxed text-foreground/80">
                Have any questions?<br />
                Feel free to ask our team directly on Telegram!
              </p>
              <a 
                href="https://t.me/x20lab" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-bold font-serif rounded-lg text-base bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 px-8 cursor-pointer shadow-lg shadow-[#07e3f8]/20"
              >
                Join Telegram
              </a>
            </div>

            {/* Right Accordion List */}
            <div className="space-y-4 font-serif">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div 
                    key={index} 
                    className="border-b border-[#44617d]/40 pb-4 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left py-2 font-serif font-bold text-base md:text-lg text-white hover:text-[#07e3f8] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown 
                        size={20} 
                        className={`text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                          isOpen ? 'rotate-180 text-[#07e3f8]' : ''
                        }`} 
                      />
                    </button>
                    {isOpen && (
                      <div className="pt-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-line animate-fadeIn">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* 11. FOOTER */}
        <footer className="pt-16 pb-8 border-t border-[#44617d]/30 font-serif space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Col 1: Logo & Company Description */}
            <div className="md:col-span-2 space-y-4">
              <img 
                alt="20lab logo" 
                width="138" 
                height="53" 
                className="h-10 w-auto object-contain cursor-pointer"
                src="/20lab-logo-min.svg"
                onClick={() => onNavigate('/')}
              />
              <p className="text-sm text-foreground/70 max-w-sm leading-relaxed">
                20lab is the leading customizable token generator for ERC-20, Solana SPL, and Sui. Create, deploy, and manage your tokens with audited security and gas-optimized performance.
              </p>
              <div className="text-xs text-slate-400 space-y-1 pt-2">
                <div>20lab — Romana Dmowskiego 3/9, Wrocław, Poland</div>
                <div>VAT ID: PL9151826889</div>
                <div>Email: contact@20lab.app</div>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-3">
              <h5 className="text-sm font-bold text-white uppercase tracking-wider">Navigation</h5>
              <ul className="space-y-2 text-xs text-foreground/80">
                <li><a href="#info" className="hover:text-[#07e3f8]">Info</a></li>
                <li><a href="#features" className="hover:text-[#07e3f8]">Features</a></li>
                <li><a href="#audits" className="hover:text-[#07e3f8]">Audits</a></li>
                <li><a href="#statistics" className="hover:text-[#07e3f8]">Statistics</a></li>
                <li><a href="#pricing" className="hover:text-[#07e3f8]">Pricing</a></li>
                <li><a href="#reviews" className="hover:text-[#07e3f8]">Reviews &amp; FAQ</a></li>
              </ul>
            </div>

            {/* Col 3: Tools & Utilities */}
            <div className="space-y-3">
              <h5 className="text-sm font-bold text-white uppercase tracking-wider">Tools</h5>
              <ul className="space-y-2 text-xs text-foreground/80">
                <li><button onClick={() => onNavigate('/generate/erc20-token/')} className="hover:text-[#07e3f8] text-left cursor-pointer">ERC-20 Generator</button></li>
                <li><button onClick={() => onNavigate('/generate/spl-token/')} className="hover:text-[#07e3f8] text-left cursor-pointer">Solana SPL Forge</button></li>
                <li><button onClick={() => onNavigate('/generate/sui-token/')} className="hover:text-[#07e3f8] text-left cursor-pointer">Sui Token Creator</button></li>
                <li><button onClick={() => onNavigate('/multisender')} className="hover:text-[#07e3f8] text-left cursor-pointer">MultiSender Airdrop</button></li>
                <li><button onClick={() => onNavigate('/studio')} className="hover:text-[#07e3f8] text-left cursor-pointer">Solidity Studio</button></li>
                <li><button onClick={() => onNavigate('/dashboard/')} className="hover:text-[#07e3f8] text-left cursor-pointer">Owner Dashboard</button></li>
              </ul>
            </div>

            {/* Col 4: Community & Social */}
            <div className="space-y-3">
              <h5 className="text-sm font-bold text-white uppercase tracking-wider">Community</h5>
              <ul className="space-y-2 text-xs text-foreground/80">
                <li><a href="https://t.me/x20lab" target="_blank" rel="noopener noreferrer" className="hover:text-[#07e3f8]">Telegram Channel</a></li>
                <li><a href="https://x.com/x20lab" target="_blank" rel="noopener noreferrer" className="hover:text-[#07e3f8]">Twitter / X (@x20lab)</a></li>
                <li><a href="https://medium.com/@20lab" target="_blank" rel="noopener noreferrer" className="hover:text-[#07e3f8]">Medium Blog</a></li>
                <li><a href="https://www.youtube.com/@20lab" target="_blank" rel="noopener noreferrer" className="hover:text-[#07e3f8]">YouTube Tutorials</a></li>
                <li><a href="https://www.trustpilot.com/review/20lab.app" target="_blank" rel="noopener noreferrer" className="hover:text-[#07e3f8]">Trustpilot Reviews</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[#44617d]/20 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>&copy; 2026 20lab. All rights reserved.</div>
            <div className="flex gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Safety &amp; Trust</span>
            </div>
          </div>
        </footer>

        {/* 12. FLOATING "GO TO TOP" BUTTON */}
        {showScrollTop && (
          <button 
            onClick={scrollToTop}
            className="fixed z-40 size-11 bottom-6 right-6 rounded-full bg-linear-to-r from-primary to-primary-alt text-black flex items-center justify-center shadow-lg shadow-[#07e3f8]/30 hover:scale-110 transition-transform cursor-pointer"
            title="Go to top"
          >
            <ArrowUp size={20} className="stroke-[2.5]" />
          </button>
        )}

      </div>
    </main>
  );
}
