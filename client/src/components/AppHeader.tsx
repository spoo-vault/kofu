import React, { useState, useEffect } from 'react';
import { PanelLeft, ExternalLink, Sparkles, Wallet, CheckCircle2, LogOut } from 'lucide-react';
import { SentinelStatus } from '@kofu/shared';
import { stellarWalletService, SupportedWalletId } from '../lib/stellarWallets';
import { WalletModal } from './WalletModal';

interface AppHeaderProps {
  currentTab: 'home' | 'create' | 'detail' | 'negotiation' | 'activity';
  selectedAgreementId?: string | null;
  onToggleSidebar: () => void;
  sentinelStatus: SentinelStatus | null;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  selectedAgreementId,
  onToggleSidebar,
  sentinelStatus,
}) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(stellarWalletService.getAddress());
  const [walletId, setWalletId] = useState<SupportedWalletId | null>(stellarWalletService.getWalletId());
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  useEffect(() => {
    const unsub = stellarWalletService.subscribe((addr, wid) => {
      setWalletAddress(addr);
      setWalletId(wid);
    });
    return () => unsub();
  }, []);

  const getTitle = () => {
    switch (currentTab) {
      case 'home':
        return 'Command Terminal';
      case 'create':
        return 'Review & Commit Terms';
      case 'detail':
        return selectedAgreementId ? `Escrow Details (${selectedAgreementId})` : 'Escrow Details';
      case 'negotiation':
        return 'Agent-to-Agent Negotiation Chamber';
      case 'activity':
        return 'Active Escrows & On-Chain Ledger';
      default:
        return 'Command Terminal';
    }
  };

  const activeCount = sentinelStatus?.activeSentinelsCount ?? 4;
  const displayAddress = walletAddress
    ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`
    : null;

  return (
    <>
      <header className="h-14 border-b border-[#1E1E28] bg-[#08080A]/90 backdrop-blur-md px-4 flex items-center justify-between font-mono text-xs z-20 shrink-0">
        {/* Left: Sidebar toggle + Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217] border border-transparent hover:border-[#1E1E28] transition-colors"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4 text-[#00FF66]" />
          </button>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#505060]">KOFU</span>
            <span className="text-[#505060]">/</span>
            <span className="text-[#F3F3F6] font-semibold">{getTitle()}</span>
          </div>
        </div>

        {/* Right: Telemetry, Contract link & Wallet button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#121217] border border-[#1E1E28] text-[11px] text-[#848494]">
            <Sparkles className="w-3 h-3 text-[#00FF66]" />
            <span>Gemini 2.0 Flash</span>
            <span className="text-[#505060]">|</span>
            <span className="text-[#00FF66]">Soroban v22</span>
          </div>

          <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#0D0D11] border border-[#1E1E28] text-[11px] text-[#848494]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
            <span>SENTINELS:</span>
            <span className="text-[#00FF66] font-bold">{activeCount} ACTIVE</span>
          </div>

          <div className="hidden xl:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#0D0D11] border border-[#1E1E28] text-[11px] text-[#848494]">
            <span>ESCROW:</span>
            <span className="text-[#00FF66] font-bold">{sentinelStatus?.totalInEscrow ?? 0} USDC</span>
          </div>

          <a
            href="https://stellar.expert/explorer/testnet/contract/CAXNYG4P32DU3EVJLAN6HZ3PR67OZGABG4VRFIYITJQZDHR76X6RSVJS"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] text-[11px] text-[#848494] hover:text-[#00FF66] transition-colors"
            title="Soroban Escrow Contract on StellarExpert"
          >
            <span>Contract</span>
            <ExternalLink className="w-3 h-3 text-[#505060]" />
          </a>

          {/* Quick Header Wallet Pill */}
          {walletAddress ? (
            <div className="flex items-center space-x-1 pl-1">
              <button
                onClick={() => setWalletModalOpen(true)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#00FF66]/40 text-[11px] text-[#00FF66] transition-all cursor-pointer"
                title={`Connected via ${walletId || 'Stellar'} - Click to manage`}
              >
                <CheckCircle2 className="w-3 h-3 text-[#00FF66]" />
                <span className="font-medium">{displayAddress}</span>
                <span className="text-[9px] text-[#848494] capitalize hidden sm:inline">({walletId || 'Stellar'})</span>
              </button>
              <button
                onClick={async () => {
                  await stellarWalletService.disconnect();
                }}
                className="p-1 rounded-lg bg-[#121217] hover:bg-[#FF4D4D]/15 border border-[#1E1E28] hover:border-[#FF4D4D]/50 text-[#848494] hover:text-[#FF4D4D] transition-colors"
                title="Disconnect Wallet"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#00FF66]/10 hover:bg-[#00FF66]/20 border border-[#00FF66]/30 text-[11px] text-[#00FF66] font-medium transition-all cursor-pointer"
            >
              <Wallet className="w-3 h-3" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </header>

      {/* Multi-Wallet Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        activeAddress={walletAddress}
        activeWalletId={walletId}
      />
    </>
  );
};
