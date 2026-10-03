import React, { useState } from 'react';
import { Shield, Terminal, ArrowUpRight, Cpu, Wallet, CheckCircle2, Loader2 } from 'lucide-react';
import { FreighterService } from '../lib/freighter';

interface NavbarProps {
  currentTab: 'home' | 'agreements' | 'detail' | 'negotiation' | 'activity';
  onNavigate: (tab: 'home' | 'agreements' | 'negotiation' | 'activity') => void;
  selectedAgreementId?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, selectedAgreementId }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    setConnecting(true);
    setWalletError(null);
    try {
      const res = await FreighterService.connect();
      if (res.connected && res.publicKey) {
        setWalletAddress(res.publicKey);
      } else if (res.error) {
        setWalletError(res.error);
        alert(res.error);
      }
    } catch (err: any) {
      setWalletError(err?.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const displayAddress = walletAddress
    ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`
    : 'GBZH...4A5';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E1E28] bg-[#08080A]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-left group focus:outline-none"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded border border-[#1E1E28] bg-white flex items-center justify-center p-1 overflow-hidden group-hover:border-[#00FF66] transition-colors shadow-[0_0_10px_rgba(0,255,102,0.15)]">
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
                <div className="text-[10px] font-mono tracking-widest text-[#848494] uppercase">
                  Autonomous Escrow on Stellar
                </div>
              </div>
            </div>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#1E1E28]">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 text-xs font-mono tracking-wide rounded transition-all ${
                currentTab === 'home'
                  ? 'bg-[#1E1E28] text-[#F3F3F6] border border-[#2E2E3C]'
                  : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
              }`}
            >
              Command
            </button>
            <button
              onClick={() => onNavigate('agreements')}
              className={`px-3 py-1.5 text-xs font-mono tracking-wide rounded transition-all ${
                currentTab === 'agreements' || currentTab === 'detail'
                  ? 'bg-[#1E1E28] text-[#F3F3F6] border border-[#2E2E3C]'
                  : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
              }`}
            >
              Agreements
            </button>
            <button
              onClick={() => onNavigate('negotiation')}
              className={`px-3 py-1.5 text-xs font-mono tracking-wide rounded transition-all flex items-center space-x-1.5 ${
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
              className={`px-3 py-1.5 text-xs font-mono tracking-wide rounded transition-all ${
                currentTab === 'activity'
                  ? 'bg-[#1E1E28] text-[#F3F3F6] border border-[#2E2E3C]'
                  : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
              }`}
            >
              Ledger & Settlement
            </button>
          </nav>
        </div>

        {/* Right side: Stellar Testnet status & Freighter wallet button */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#0D0D11] border border-[#1E1E28] text-[11px] font-mono text-[#848494]">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]"></span>
            <span className="text-[#F3F3F6] font-medium">STELLAR TESTNET</span>
            <span className="text-[#00FF66] text-[10px]">SOROBAN v22</span>
          </div>

          <button
            onClick={handleConnectWallet}
            disabled={connecting}
            className="flex items-center space-x-2 px-3 py-1.5 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#00FF66]/50 text-xs font-mono transition-all cursor-pointer"
            title="Connect Freighter Stellar Wallet"
          >
            {connecting ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#00FF66]" />
            ) : walletAddress ? (
              <CheckCircle2 className="w-3 h-3 text-[#00FF66]" />
            ) : (
              <Wallet className="w-3 h-3 text-[#848494]" />
            )}
            <span className={walletAddress ? 'text-[#00FF66]' : 'text-[#F3F3F6]'}>
              {displayAddress}
            </span>
            <span className="text-[#848494] hidden md:inline text-[10px]">
              {walletAddress ? 'Freighter' : 'Demo Agent'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
