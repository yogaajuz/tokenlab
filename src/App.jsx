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
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
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
              onOpenApp={() => navigate('/generate/')}
              onSelectFeature={() => navigate('/generate/')}
              onShowToast={showToast}
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
                navigate('/dashboard/');
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

          {/* Route 6: Dashboard */}
          {normalizedPath === '/dashboard' && (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <TokenDashboard
                wallet={wallet}
                selectedChain={selectedChain}
                onShowToast={showToast}
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

    </div>
  );
}
