import React, { useState, useEffect } from 'react';
import {
  Shield,
  Terminal,
  ArrowRight,
  Cpu,
  Wallet,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Code2,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { stellarWalletService, SupportedWalletId } from '../lib/stellarWallets';
import { WalletModal } from './WalletModal';

const TwitterXIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface NavbarProps {
  currentTab: 'landing' | 'home' | 'agreements' | 'create' | 'detail' | 'negotiation' | 'activity';
  onNavigate: (tab: 'landing' | 'home' | 'agreements' | 'negotiation' | 'activity') => void;
  selectedAgreementId?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<SupportedWalletId | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const isLandingMode = currentTab === 'landing';

  useEffect(() => {
    const unsubscribe = stellarWalletService.subscribe((address, wid) => {
      setWalletAddress(address);
      setWalletId(wid);
    });
    return () => unsubscribe();
  }, []);

  const displayAddress = walletAddress
    ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`
    : 'Connect Wallet';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E1E28] bg-[#08080A]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-2 text-left group focus:outline-none cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded border border-[#1E1E28] bg-white flex items-center justify-center p-1 overflow-hidden group-hover:border-[#00FF66] transition-colors shadow-[0_0_12px_rgba(0,255,102,0.18)]">
                <img
                  src="/kofu-logo.png"
                  alt="KOFU Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-base font-bold tracking-wider text-[#F3F3F6]">KOFU</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
                </div>
                <div className="text-[10px] font-mono tracking-widest text-[#848494] uppercase hidden sm:block">
                  Autonomous Escrow on Stellar
                </div>
              </div>
            </div>
          </button>

          {/* Navigation - Landing Mode */}
          {isLandingMode ? (
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#1E1E28] text-xs font-mono">
              <button
                onClick={() => onNavigate('landing')}
                className="px-3 py-1.5 text-[#00FF66] font-medium"
              >
                Home
              </button>
              <a
                href="#about"
                className="px-3 py-1.5 text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217] rounded transition-all"
              >
                About
              </a>
              <a
                href="#features"
                className="px-3 py-1.5 text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217] rounded transition-all"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="px-3 py-1.5 text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217] rounded transition-all"
              >
                How It Works
              </a>
              <a
                href="#docs"
                className="px-3 py-1.5 text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217] rounded transition-all"
              >
                Docs
              </a>
              <a
                href="https://github.com/spoo-vault/kofu"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-[#848494] hover:text-[#00FF66] hover:bg-[#121217] rounded transition-all flex items-center space-x-1"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <a
                href="https://x.com/kofuapp"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-[#848494] hover:text-[#00FF66] hover:bg-[#121217] rounded transition-all flex items-center space-x-1"
                title="Follow KOFU on X (@kofuapp)"
              >
                <TwitterXIcon className="w-3.5 h-3.5" />
                <span>@kofuapp</span>
              </a>
            </nav>
          ) : (
            /* Navigation - Protocol App Mode */
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#1E1E28] text-xs font-mono">
              <button
                onClick={() => onNavigate('landing')}
                className="px-3 py-1.5 text-[#848494] hover:text-[#00FF66] hover:bg-[#121217] rounded transition-all flex items-center space-x-1 mr-2 border-r border-[#1E1E28] pr-3"
              >
                <ArrowLeft className="w-3 h-3 text-[#00FF66]" />
                <span>Website</span>
              </button>

              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-1.5 rounded transition-all ${
                  currentTab === 'home'
                    ? 'bg-[#1E1E28] text-[#00FF66] border border-[#00FF66]/40'
                    : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
                }`}
              >
                Command Terminal
              </button>
              <button
                onClick={() => onNavigate('agreements')}
                className={`px-3 py-1.5 rounded transition-all ${
                  currentTab === 'agreements' || currentTab === 'detail'
                    ? 'bg-[#1E1E28] text-[#F3F3F6] border border-[#2E2E3C]'
                    : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
                }`}
              >
                Active Escrows
              </button>
              <button
                onClick={() => onNavigate('negotiation')}
                className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1.5 ${
                  currentTab === 'negotiation'
                    ? 'bg-[#1E1E28] text-[#00FF66] border border-[#00FF66]/40'
                    : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
                }`}
              >
                <Cpu className="w-3 h-3 text-[#00FF66]" />
                <span>Agent Negotiation</span>
              </button>
              <button
                onClick={() => onNavigate('activity')}
                className={`px-3 py-1.5 rounded transition-all ${
                  currentTab === 'activity'
                    ? 'bg-[#1E1E28] text-[#F3F3F6] border border-[#2E2E3C]'
                    : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
                }`}
              >
                Ledger Settlement
              </button>
            </nav>
          )}
        </div>

        {/* Right side CTAs */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#0D0D11] border border-[#1E1E28] text-[11px] font-mono text-[#848494]">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]"></span>
            <span className="text-[#F3F3F6] font-medium">STELLAR TESTNET</span>
            <span className="text-[#00FF66] text-[10px]">SOROBAN v22</span>
          </div>

          {/* If on Landing page, show glowing "Launch App" CTA button */}
          {isLandingMode ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={() => onNavigate('home')}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded bg-[#00FF66] hover:bg-[#00D154] text-[#08080A] font-bold text-[11px] sm:text-xs uppercase tracking-wider font-mono transition-all shadow-[0_0_15px_rgba(0,255,102,0.25)] hover:shadow-[0_0_25px_rgba(0,255,102,0.4)] flex items-center space-x-1 sm:space-x-1.5 cursor-pointer transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              >
                <span>Launch App</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 rounded text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217] transition-colors shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#00FF66]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            /* Wallet button in app */
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setWalletModalOpen(true)}
                className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#00FF66]/50 text-[11px] sm:text-xs font-mono transition-all cursor-pointer whitespace-nowrap"
                title="Connect Stellar Multi-Wallet (LOBSTR, Freighter, Albedo, xBull)"
              >
                {walletAddress ? (
                  <CheckCircle2 className="w-3 h-3 text-[#00FF66]" />
                ) : (
                  <Wallet className="w-3 h-3 text-[#848494]" />
                )}
                <span className={walletAddress ? 'text-[#00FF66]' : 'text-[#F3F3F6]'}>
                  {displayAddress}
                </span>
                <span className="text-[#848494] hidden md:inline text-[10px] capitalize">
                  {walletAddress ? (walletId || 'Stellar') : 'Signers'}
                </span>
              </button>

              {walletAddress && (
                <button
                  onClick={async () => {
                    await stellarWalletService.disconnect();
                  }}
                  className="p-1 sm:p-1.5 rounded bg-[#121217] hover:bg-[#FF4D4D]/15 border border-[#1E1E28] hover:border-[#FF4D4D]/50 text-[#848494] hover:text-[#FF4D4D] transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Dropdown for Landing Page */}
      {isLandingMode && mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1E1E28] bg-[#0A0A0E] px-4 py-3 space-y-2 font-mono text-xs animate-in slide-in-from-top-2">
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]"
          >
            About
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]"
          >
            How It Works
          </a>
          <a
            href="#docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]"
          >
            Docs
          </a>
          <a
            href="https://github.com/spoo-vault/kofu"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-3 py-2 rounded text-[#848494] hover:text-[#00FF66] hover:bg-[#121217]"
          >
            <Code2 className="w-4 h-4" />
            <span>GitHub Repository</span>
          </a>
          <a
            href="https://x.com/kofuapp"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-3 py-2 rounded text-[#848494] hover:text-[#00FF66] hover:bg-[#121217]"
          >
            <TwitterXIcon className="w-4 h-4" />
            <span>X (@kofuapp)</span>
          </a>
        </div>
      )}

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        activeAddress={walletAddress}
        activeWalletId={walletId}
      />
    </header>
  );
};
