import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import GenerateHub from './components/GenerateHub';
import ERC20TokenCreator from './components/ERC20TokenCreator';
import SolanaForge from './components/SolanaForge';
import SuiForge from './components/SuiForge';
import TokenDashboard from './components/TokenDashboard';
import MultiSender from './components/MultiSender';
import ContractStudio from './components/ContractStudio';
import ProtocolOwner from './components/ProtocolOwner';
import PlatformFeeModal from './components/PlatformFeeModal';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import { Crown } from 'lucide-react';
import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from './utils/chains';
import { generateSolidityContract } from './utils/solidityGenerator';

export default function App() {
  // Path-based routing matching https://20lab.app exactly
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  const [selectedChain, setSelectedChain] = useState(() => {
    const path = window.location.pathname || '';
    const match = path.match(/\/generate\/erc20-token\/([a-z0-9-]+)/i);
    if (match && match[1]) {
      const found = SUPPORTED_CHAINS.find(c => c.id.toLowerCase() === match[1].toLowerCase());
      if (found) return found;
    }
    return DEFAULT_CHAIN;
  });
  const [sandboxMode, setSandboxMode] = useState(false);
  const [wallet, setWallet] = useState({
    connected: false,
    address: null,
    balance: null,
    isSimulated: false
  });
  const [toasts, setToasts] = useState([]);
  const [studioCode, setStudioCode] = useState(generateSolidityContract({}));
  const [platformFeeModalOpen, setPlatformFeeModalOpen] = useState(false);

  // Browser navigation sync
  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname || '/';
      setCurrentPath(newPath);
      const match = newPath.match(/\/generate\/erc20-token\/([a-z0-9-]+)/i);
      if (match && match[1]) {
        const found = SUPPORTED_CHAINS.find(c => c.id.toLowerCase() === match[1].toLowerCase());
        if (found) setSelectedChain(found);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    const match = path.match(/\/generate\/erc20-token\/([a-z0-9-]+)/i);
    if (match && match[1]) {
      const found = SUPPORTED_CHAINS.find(c => c.id.toLowerCase() === match[1].toLowerCase());
      if (found) setSelectedChain(found);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = ({ type = 'info', title = '', message = '', link = null }) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, message, link }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const normalizedPath = currentPath.replace(/\/$/, '') || '/';

  return (
    <div className="min-h-screen bg-[#0c0c1c] text-[#f1f5f9] flex flex-col font-sans selection:bg-[#07e3f8]/30 selection:text-[#07e3f8]">
      
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* 20LAB Header */}
      <Header
        currentPath={normalizedPath}
        onNavigate={navigate}
        selectedChain={selectedChain}
        setSelectedChain={setSelectedChain}
        wallet={wallet}
        setWallet={setWallet}
        sandboxMode={sandboxMode}
        setSandboxMode={setSandboxMode}
        onShowToast={showToast}
      />

      {/* Main View Area */}
      <div className="flex-1 pt-20">
        <ErrorBoundary>
          {/* Route 1: Exact Home Landing Page */}
          {normalizedPath === '/' && (
            <LandingPage
              onNavigate={navigate}
              onOpenApp={() => navigate('/generate/')}
              onSelectFeature={() => navigate('/generate/')}
              onShowToast={showToast}
              onOpenPlatformFee={() => setPlatformFeeModalOpen(true)}
            />
          )}

          {/* Route 2: Exact /generate/ Hub Page */}
          {normalizedPath === '/generate' && (
            <GenerateHub
              onNavigate={navigate}
              onShowToast={showToast}
            />
          )}

          {/* Route 3: Exact /generate/erc20-token/ Page */}
          {normalizedPath.startsWith('/generate/erc20-token') && (
            <ERC20TokenCreator
              onNavigate={navigate}
              selectedChain={selectedChain}
              setSelectedChain={setSelectedChain}
              wallet={wallet}
              setWallet={setWallet}
              sandboxMode={sandboxMode}
              setSandboxMode={setSandboxMode}
              onShowToast={showToast}
              onTokenDeployed={(token) => {
                // Token successfully deployed and saved
              }}
              onViewCode={(code) => {
                setStudioCode(code);
                navigate('/studio');
              }}
            />
          )}

          {/* Route 4: Exact /generate/spl-token/ Page (Solana) */}
          {normalizedPath === '/generate/spl-token' && (
            <SolanaForge
              onNavigate={navigate}
              wallet={wallet}
              onShowToast={showToast}
            />
          )}

          {/* Route 5: Exact /generate/sui-token/ Page (Sui) */}
          {normalizedPath === '/generate/sui-token' && (
            <SuiForge
              onNavigate={navigate}
              wallet={wallet}
              onShowToast={showToast}
            />
          )}

          {/* Route 6: Token Owner Dashboard */}
          {normalizedPath.startsWith('/dashboard') && (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <TokenDashboard
                wallet={wallet}
                selectedChain={selectedChain}
                onShowToast={showToast}
                targetAddress={
                  normalizedPath.replace(/^\/dashboard/, '').replace(/^\//, '') || null
                }
                onNavigate={navigate}
              />
            </main>
          )}

          {/* Route 7: MultiSender Tool */}
          {(normalizedPath === '/multisender' || normalizedPath === '/tools/erc20/multisender') && (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <MultiSender
                selectedChain={selectedChain}
                wallet={wallet}
                onShowToast={showToast}
              />
            </main>
          )}

          {/* Route 8: Solidity Studio */}
          {normalizedPath === '/studio' && (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <ContractStudio
                solidityCode={studioCode}
                onShowToast={showToast}
              />
            </main>
          )}

          {/* Route 9: Protocol Owner / Platform Fee Vault Dashboard */}
          {(normalizedPath === '/owner' || normalizedPath === '/platform-fee') && (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <ProtocolOwner
                selectedChain={selectedChain}
                wallet={wallet}
                sandboxMode={sandboxMode}
                onShowToast={showToast}
              />
            </main>
          )}
        </ErrorBoundary>
      </div>

      {/* Global Page Bottom Footer for all inner pages */}
      {normalizedPath !== '/' && (
        <footer className="border-t border-[#44617d]/30 bg-[#07131e]/90 py-8 mt-16 font-serif">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => navigate('/')} 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img src="/robinpump-logo.png" alt="RobinPump" className="h-6 w-6 object-contain" />
                <span className="font-bold text-white text-sm">RobinPump Deployer</span>
              </div>
              <span className="text-slate-600">•</span>
              <span>&copy; 2026 All rights reserved</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => setPlatformFeeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-bold text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-lg cursor-pointer transition-all shadow-xs"
                title="Configure Platform Fee & Treasury"
              >
                <Crown size={13} className="text-amber-400" />
                <span>Platform Fee Setup</span>
              </button>
              <button onClick={() => navigate('/generate/erc20-token/')} className="hover:text-[#07e3f8] cursor-pointer">
                ERC-20 Generator
              </button>
              <button onClick={() => navigate('/generate/spl-token/')} className="hover:text-[#07e3f8] cursor-pointer">
                Solana SPL
              </button>
              <button onClick={() => navigate('/multisender')} className="hover:text-[#07e3f8] cursor-pointer">
                MultiSender
              </button>
              <button onClick={() => navigate('/studio')} className="hover:text-[#07e3f8] cursor-pointer">
                Solidity Studio
              </button>
              <button onClick={() => navigate('/dashboard/')} className="hover:text-[#07e3f8] cursor-pointer">
                Dashboard
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Platform Fee Modal */}
      <PlatformFeeModal
        isOpen={platformFeeModalOpen}
        onClose={() => setPlatformFeeModalOpen(false)}
        wallet={wallet}
        selectedChain={selectedChain}
        onShowToast={showToast}
      />

    </div>
  );
}
