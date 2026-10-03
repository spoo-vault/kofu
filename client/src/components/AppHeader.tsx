import React from 'react';
import { PanelLeft, ShieldCheck, Activity, Terminal, ExternalLink, Sparkles } from 'lucide-react';
import { SentinelStatus } from '@kofu/shared';

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
  const inEscrow = sentinelStatus?.totalInEscrow ?? 75;

  return (
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

      {/* Right: Quick telemetry & Model badges */}
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#121217] border border-[#1E1E28] text-[11px] text-[#848494]">
          <Sparkles className="w-3 h-3 text-[#00FF66]" />
          <span>Gemini 2.0 Flash</span>
          <span className="text-[#505060]">|</span>
          <span className="text-[#00FF66]">Soroban v22</span>
        </div>

        <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#0D0D11] border border-[#1E1E28] text-[11px] text-[#848494]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
          <span>SENTINELS:</span>
          <span className="text-[#00FF66] font-bold">{activeCount} ACTIVE</span>
        </div>

        <a
          href="https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] text-[11px] text-[#848494] hover:text-[#00FF66] transition-colors"
          title="Soroban Escrow Contract on StellarExpert"
        >
          <span>Contract</span>
          <ExternalLink className="w-3 h-3 text-[#505060]" />
        </a>
      </div>
    </header>
  );
};
