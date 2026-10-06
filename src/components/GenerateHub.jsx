import React, { useState } from 'react';
import { 
  ChevronRight, 
  ExternalLink, 
  ChevronLeft,
  Check,
  Zap,
  Shield,
  Layers,
  Coins,
  ArrowRight
} from 'lucide-react';

export default function GenerateHub({
  onNavigate,
  onShowToast
}) {
  const [blogSlide, setBlogSlide] = useState(0);

  const evmChains = [
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
    { name: 'Blast', img: '/images/crypto/81457.png' }
  ];

  const blogPosts = [
    {
      title: 'Robinhood Crypto Token: How to Create and Deploy Your Own ERC-20',
      desc: 'Step-by-step guide to deploying customizable ERC-20 tokens compatible with the Robinhood chain ecosystem.',
      date: 'February 20, 2025',
      readTime: '7 min read',
      img: '/images/blog/57a34595fc16029cddb7cb0049bd537127b407c3-1600x900.png'
    },
    {
      title: 'How to Create a Token Page for Your Crypto Project',
      desc: 'Discover how to set up professional branding, tokenomics displays, and verified explorer links.',
      date: 'February 12, 2025',
      readTime: '5 min read',
      img: '/images/blog/2399ca82d314cd7730bebf500bd65802faeee024-1600x900.png'
    },
    {
      title: 'Sonic Crypto Token - Launch Project on One of the Fastest Blockchains',
      desc: 'Discover how Sonic crypto blockchain ecosystem delivers scalable, secure, and lightning-fast performance.',
      date: 'December 20, 2024',
      readTime: '6 min read',
      img: '/images/blog/4536dbad189509f9240a4d22ff7be200a08ae3e3-1600x900.png'
    },
    {
      title: 'Sui Token - Build Your Next-Gen Project on Sui Blockchain',
      desc: 'Create efficient, scalable tokens on the Sui blockchain leveraging the Move language.',
      date: 'November 23, 2024',
      readTime: '9 min read',
      img: '/images/blog/4536dbad189509f9240a4d22ff7be200a08ae3e3-1600x900.png'
    },
    {
      title: 'How to Add Metadata to SPL (Solana) Token',
      desc: 'Learn how to add or modify SPL token metadata using 20lab generator with decentralized IPFS storage.',
      date: 'September 30, 2024',
      readTime: '9 min read',
      img: '/images/blog/57a34595fc16029cddb7cb0049bd537127b407c3-1600x900.png'
    },
    {
      title: 'Ultimate Guide to Creating SPL (Solana) Token with Transfer Tax',
      desc: 'Master the art of creating Solana tokens with transfer tax and token-2022 extensions.',
      date: 'September 02, 2024',
      readTime: '11 min read',
      img: '/images/blog/2399ca82d314cd7730bebf500bd65802faeee024-1600x900.png'
    }
  ];

  const specificTokens = [
    { name: 'Solana Token Creator', path: '/generate/spl-token/', icon: '/images/crypto/solana-mainnet.png' },
    { name: 'Sui Token Creator', path: '/generate/sui-token/', icon: '/images/crypto/sui-mainnet.png' },
    { name: 'Create Ethereum Token', path: '/generate/erc20-token/', icon: '/images/crypto/1.png' },
    { name: 'Create BNB Token', path: '/generate/erc20-token/', icon: '/images/crypto/56.png' },
    { name: 'Create Polygon Token', path: '/generate/erc20-token/', icon: '/images/crypto/137.png' },
    { name: 'Create Avalanche Token', path: '/generate/erc20-token/', icon: '/images/crypto/43114.png' },
    { name: 'Create Arbitrum Token', path: '/generate/erc20-token/', icon: '/images/crypto/42161.png' },
    { name: 'Create Optimism Token', path: '/generate/erc20-token/', icon: '/images/crypto/10.png' },
    { name: 'Create Cronos Token', path: '/generate/erc20-token/', icon: '/images/crypto/25.png' },
    { name: 'Create PulseChain Token', path: '/generate/erc20-token/', icon: '/images/crypto/369.png' },
    { name: 'Create Base Token', path: '/generate/erc20-token/', icon: '/images/crypto/8453.png' },
    { name: 'Create Core Token', path: '/generate/erc20-token/', icon: '/images/crypto/1116.png' },
    { name: 'Create Linea Token', path: '/generate/erc20-token/', icon: '/images/crypto/59144.png' },
    { name: 'Create Mantle Token', path: '/generate/erc20-token/', icon: '/images/crypto/5000.png' },
    { name: 'Create Blast Token', path: '/generate/erc20-token/', icon: '/images/crypto/81457.png' },
    { name: 'Create Metis Token', path: '/generate/erc20-token/', icon: '/images/crypto/1088.png' },
    { name: 'Create Sonic Token', path: '/generate/erc20-token/', icon: '/images/crypto/146.png' },
    { name: 'Create Unichain Token', path: '/generate/erc20-token/', icon: '/images/crypto/130.png' },
    { name: 'Create HyperEVM Token', path: '/generate/erc20-token/', icon: '/images/crypto/999.png' },
    { name: 'Create Monad Token', path: '/generate/erc20-token/', icon: '/images/crypto/143.png' },
    { name: 'Create Robinhood Token', path: '/generate/erc20-token/', icon: '/images/crypto/4663.png' }
  ];

  return (
    <main className="flex-1" id="main-content">
      <div className="container py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="font-serif text-sm text-foreground/50 flex flex-wrap gap-2 items-center">
          <button 
            onClick={() => onNavigate('/')} 
            className="text-primary-alt hover:underline cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <div className="text-white">Generate</div>
        </div>

        {/* Top Header & 3 Main Cards */}
        <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2 relative mt-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold font-serif tracking-wide !text-2xl sm:!text-3xl md:!text-4xl text-white">
              Crypto Token Generator
            </h1>
            <div className="mt-2 font-serif text-base sm:text-lg md:text-xl leading-tight text-foreground/70">
              Select the desired token type you wish to create.
            </div>

            <div className="pt-6 space-y-6 md:space-y-8">
              
              {/* CARD 1: ERC-20 Token */}
              <div className="space-y-4 p-6 rounded-2xl bg-form/70 border border-[#44617d]/40 hover:border-[#07e3f8]/50 transition-all">
                <div>
                  <p className="font-serif text-xl sm:text-2xl font-bold leading-10 text-white">
                    ERC-20 Token
                  </p>
                  <p className="font-serif text-foreground/70 text-sm sm:text-base">
                    Create your token on EVM-compatible blockchain such as Ethereum, BSC, Base, Polygon, etc.
                  </p>
                </div>

                {/* Chain Logos Row */}
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2">
                  {evmChains.map((c) => (
                    <div key={c.name} className="flex min-w-fit items-center gap-2" title={c.name}>
                      <img alt={c.name} width="32" height="32" className="w-8 h-8 rounded-full" src={c.img} />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => onNavigate('/generate/erc20-token/')}
                  className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg text-base ring-offset-background transition-colors bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 px-3 md:px-10 py-2 w-full cursor-pointer shadow-lg shadow-[#07e3f8]/20"
                >
                  Create ERC-20 Token
                </button>
              </div>

              {/* CARD 2: SPL Token (Solana) */}
              <div className="space-y-4 p-6 rounded-2xl bg-form/70 border border-[#44617d]/40 hover:border-[#07e3f8]/50 transition-all">
                <div>
                  <p className="font-serif text-xl sm:text-2xl font-bold leading-10 text-white">
                    SPL Token
                  </p>
                  <p className="font-serif text-foreground/70 text-sm sm:text-base">
                    Create your token on Solana blockchain using SPL token programs.
                  </p>
                </div>

                <div className="flex items-center gap-5 py-2">
                  <div className="flex min-w-fit items-center gap-2">
                    <img alt="Solana Mainnet logo" width="32" height="32" src="/images/crypto/solana-mainnet.png" />
                    <span className="text-xs font-serif text-slate-400">Solana Mainnet</span>
                  </div>
                  <div className="flex min-w-fit items-center gap-2">
                    <img alt="Solana Testnet logo" width="32" height="32" src="/images/crypto/solana-testnet.png" />
                    <span className="text-xs font-serif text-slate-400">Solana Devnet</span>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigate('/generate/spl-token/')}
                  className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg text-base ring-offset-background transition-colors bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 px-3 md:px-10 py-2 w-full cursor-pointer shadow-lg shadow-[#07e3f8]/20"
                >
                  Create SPL Token
                </button>
              </div>

              {/* CARD 3: Sui Token */}
              <div className="space-y-4 p-6 rounded-2xl bg-form/70 border border-[#44617d]/40 hover:border-[#07e3f8]/50 transition-all">
                <div>
                  <p className="font-serif text-xl sm:text-2xl font-bold leading-10 text-white">
                    Sui Token
                  </p>
                  <p className="font-serif text-foreground/70 text-sm sm:text-base">
                    Create your token on Sui blockchain using Coin module.
                  </p>
                </div>

                <div className="flex items-center gap-5 py-2">
                  <div className="flex min-w-fit items-center gap-2">
                    <img alt="Sui Mainnet logo" width="32" height="32" src="/images/crypto/sui-mainnet.png" />
                    <span className="text-xs font-serif text-slate-400">Sui Mainnet</span>
                  </div>
                  <div className="flex min-w-fit items-center gap-2">
                    <img alt="Sui Testnet logo" width="32" height="32" src="/images/crypto/sui-testnet.png" />
                    <span className="text-xs font-serif text-slate-400">Sui Testnet</span>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigate('/generate/sui-token/')}
                  className="inline-flex items-center justify-center font-bold font-serif whitespace-nowrap rounded-lg text-base ring-offset-background transition-colors bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 px-3 md:px-10 py-2 w-full cursor-pointer shadow-lg shadow-[#07e3f8]/20"
                >
                  Create Sui Token
                </button>
              </div>

            </div>
          </div>

          {/* Right Side: 3D Artwork */}
          <div className="max-lg:hidden my-auto flex justify-center">
            <picture>
              <source media="(min-width: 1024px)" srcSet="/images/main/generate.png" />
              <img 
                className="w-full max-w-lg hidden lg:block drop-shadow-2xl" 
                src="/images/main/generate.png" 
                alt="Ethereum, Solana and Sui tokens shown as planets with orbits"
              />
            </picture>
          </div>
        </div>

        {/* Featured Blog Posts Carousel */}
        <div className="pt-16 lg:pt-24 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl md:text-3xl text-white font-semibold font-serif">
              Featured Blog Posts
            </h3>
            <p className="text-sm font-serif text-foreground/70">
              Guides, tutorials, and latest insights from 20lab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post, i) => (
              <div key={i} className="flex flex-col h-full rounded-2xl bg-form/70 border border-[#44617d]/30 overflow-hidden group hover:border-[#07e3f8]/50 transition-all">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.img} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex flex-col justify-between grow space-y-3">
                  <div>
                    <h4 className="font-bold font-serif text-white hover:text-[#07e3f8] transition-colors text-base line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="line-clamp-2 pt-2 text-xs font-serif text-foreground/70">
                      {post.desc}
                    </p>
                  </div>
                  <div className="text-[11px] flex items-center justify-between text-foreground/60 font-semibold pt-2 border-t border-white/10">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button 
              onClick={() => {
                onShowToast?.({
                  type: 'info',
                  title: '20lab Blog',
                  message: 'Visit https://20lab.app/blog/ for more Web3 guides!'
                });
              }}
              className="inline-flex items-center justify-center font-bold font-serif rounded-lg text-base bg-linear-to-r from-primary to-primary-alt text-primary-foreground hover:opacity-90 h-12 px-8 cursor-pointer shadow-lg shadow-[#07e3f8]/20"
            >
              Visit our Blog
            </button>
          </div>
        </div>

        {/* Comprehensive SEO & Knowledge Guide Section (Matching 20lab.app exactly) */}
        <div className="relative space-y-12 py-16 font-serif border-t border-[#44617d]/20 mt-16 text-foreground/80 leading-relaxed text-sm sm:text-base">
          
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              How to Use Our Crypto Token Generator for Your Project
            </h2>
            <p>
              Transform your blockchain vision into reality with our intuitive crypto token generator. Whether you're launching a new utility token project or making a memecoin, 20lab provides an easy token creation process that combines security, flexibility, and speed.
            </p>
            <p>
              Our tool supports major standards like ERC-20, SPL, and Sui. You can configure parameters such as total supply, decimals, burn mechanisms, and tax structures with zero coding knowledge required.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Benefits of Using a Crypto Token Generator for Your Business
            </h3>
            <p>
              Our crypto token generator empowers businesses of all sizes to enter the blockchain space without substantial initial investment. Experience enterprise-grade security features, popular token standards, and complete ownership of your created tokens. The platform eliminates technical barriers, allowing you to deploy professional tokens on Ethereum, Base, Solana, Sui, and 25+ additional chains in minutes.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Top Features of Our Crypto Generator for Custom Tokens
            </h3>
            <p>
              Discover the comprehensive suite of features that makes the 20lab crypto token generator stand out:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li><strong>Multi-chain compatibility:</strong> Deploy seamlessly across 29+ EVM networks, Solana, and Sui.</li>
              <li><strong>Advanced security functions:</strong> Blacklist sniper protection, anti-whale transaction limits, and pausable contracts.</li>
              <li><strong>Lots of customizable features:</strong> Mintable supply, deflationary auto-burn, marketing treasury taxes, and gasless EIP-2612 approvals.</li>
              <li><strong>Built-in liquidity management tools:</strong> Auto-liquidity routing and DEX factory integrations.</li>
              <li><strong>Automated smart contract verification:</strong> Verified on Etherscan, BscScan, Basescan, and Solscan upon deployment.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Generate Tokens Quickly and Securely with Our Advanced Tools
            </h3>
            <p>
              Creating your customizable token has never been more straightforward. The 20lab token generator streamlines the entire process, from initial setup to final deployment. With integrated verification checks and optimized smart contract features, you can generate tokens that meet the highest industry benchmarks while saving up to 40% on deployment gas fees.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Unlock the Power of Token Creation with 20lab
            </h3>
            <p>
              20lab's crypto token generator stands out as the professional's choice for creating secure, customizable tokens without the need for any programming knowledge. To start creating your token, simply select the token type above and customize your features!
            </p>
          </div>

          {/* Quick-Launch Specific Token Buttons Matrix */}
          <div className="space-y-6 pt-6">
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Want to Generate Specific Token?
            </h3>
            <p className="text-foreground/70 text-sm">
              Choose the network or standard from the table below to start deploying immediately:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {specificTokens.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate(t.path)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#0b2034] hover:bg-[#07e3f8]/20 border border-[#44617d]/40 text-xs font-serif font-bold text-white transition-all text-left cursor-pointer hover:border-[#07e3f8]"
                >
                  <img src={t.icon} alt={t.name} className="w-5 h-5 rounded-full" />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
