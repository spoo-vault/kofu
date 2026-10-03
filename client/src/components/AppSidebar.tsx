import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Layers,
  Cpu,
  Activity,
  Plus,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  Wallet,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { Agreement } from '@kofu/shared';
import { stellarWalletService, SupportedWalletId } from '../lib/stellarWallets';
import { WalletModal } from './WalletModal';
import { api } from '../lib/api';

interface AppSidebarProps {
  currentTab: 'home' | 'create' | 'detail' | 'negotiation' | 'activity';
  onNavigate: (tab: 'landing' | 'home' | 'agreements' | 'negotiation' | 'activity') => void;
  onSelectAgreement: (id: string) => void;
  onNewAgreement: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onNavigate,
  onSelectAgreement,
  onNewAgreement,
  collapsed,
  onToggleCollapse,
}) => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<SupportedWalletId | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadAgreements = async () => {
      try {
        const list = await api.getAgreements();
        setAgreements(list);
      } catch {
        // Fallback handled in api
      }
    };
    loadAgreements();
  }, [currentTab]);

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
    <aside
      className={`h-screen bg-[#0A0A0E] border-r border-[#1E1E28] flex flex-col justify-between transition-all duration-300 select-none z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header & New Button */}
      <div className="p-3">
        {/* Brand & Collapse Toggle */}
        <div className="flex items-center justify-between mb-4 px-1">
          {!collapsed ? (
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded border border-[#1E1E28] bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-[0_0_10px_rgba(0,255,102,0.15)]">
                <img src="/kofu-logo.png" alt="KOFU Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-sm font-bold tracking-wider text-[#F3F3F6]">KOFU</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
                </div>
                <div className="text-[9px] font-mono text-[#848494] uppercase tracking-wider">
                  Autonomous Escrow
                </div>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded border border-[#1E1E28] bg-white flex items-center justify-center p-0.5 overflow-hidden mx-auto">
              <img src="/kofu-logo.png" alt="KOFU" className="w-full h-full object-contain" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* ChatGPT Style "+ New Agreement" Button */}
        <button
          onClick={onNewAgreement}
          className={`w-full py-2 px-3 rounded-lg border border-[#1E1E28] hover:border-[#00FF66]/50 bg-[#121217] hover:bg-[#16161D] text-xs font-mono text-[#F3F3F6] transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer group mb-3 ${
            collapsed ? 'px-0' : ''
          }`}
          title="New Agreement"
        >
          <Plus className="w-4 h-4 text-[#00FF66] group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="font-medium">New Agreement</span>}
        </button>

        {/* Primary App Navigation */}
        <nav className="space-y-1 font-mono text-xs">
          <button
            onClick={() => onNavigate('home')}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg transition-all text-left ${
              currentTab === 'home' || currentTab === 'create'
                ? 'bg-[#1E1E28] text-[#00FF66] font-semibold border border-[#00FF66]/20'
                : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
            }`}
            title="Command Terminal"
          >
            <Terminal className="w-4 h-4 shrink-0 text-[#00FF66]" />
            {!collapsed && <span>Command Terminal</span>}
          </button>

          <button
            onClick={() => onNavigate('agreements')}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg transition-all text-left ${
              currentTab === 'activity'
                ? 'bg-[#1E1E28] text-[#F3F3F6] font-semibold border border-[#2E2E3C]'
                : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
            }`}
            title="Active Escrows"
          >
            <Layers className="w-4 h-4 shrink-0 text-[#848494]" />
            {!collapsed && <span>Active Escrows</span>}
          </button>

          <button
            onClick={() => onNavigate('negotiation')}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg transition-all text-left ${
              currentTab === 'negotiation'
                ? 'bg-[#1E1E28] text-[#00FF66] font-semibold border border-[#00FF66]/20'
                : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]'
            }`}
            title="Agent Negotiation"
          >
            <Cpu className="w-4 h-4 shrink-0 text-[#00FF66]" />
            {!collapsed && <span>Agent Negotiation</span>}
          </button>
        </nav>
      </div>

      {/* Middle: ChatGPT Style Recent History */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-2 border-t border-[#1E1E28]/60 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#505060] px-2 py-1 flex items-center justify-between">
            <span>Recent Escrows</span>
            <span className="text-[9px] bg-[#121217] px-1 rounded text-[#848494]">{agreements.length}</span>
          </div>

          <div className="space-y-0.5">
            {agreements.map((agr) => {
              const isSettled = agr.status === 'SETTLED';
              const isFunded = agr.escrowFunded;
              return (
                <button
                  key={agr.id}
                  onClick={() => onSelectAgreement(agr.id)}
                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-mono transition-colors flex items-center justify-between group ${
                    currentTab === 'detail'
                      ? 'bg-[#121217] text-[#F3F3F6]'
                      : 'text-[#848494] hover:text-[#F3F3F6] hover:bg-[#121217]/60'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isSettled
                          ? 'bg-[#00FF66]'
                          : isFunded
                          ? 'bg-[#FFB800]'
                          : 'bg-[#505060]'
                      }`}
                    />
                    <span className="font-semibold text-[#F3F3F6]">{agr.humanReadableId}</span>
                    <span className="truncate text-[#848494] group-hover:text-[#F3F3F6] text-[10px]">
                      {agr.condition}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#505060] shrink-0 pl-1 font-mono">
                    ${agr.amount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Profile, Network & Website Link */}
      <div className="p-3 border-t border-[#1E1E28] bg-[#0A0A0E] space-y-2">
        {/* Back to Marketing Website */}
        <button
          onClick={() => onNavigate('landing')}
          className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs font-mono text-[#848494] hover:text-[#00FF66] hover:bg-[#121217] transition-colors ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Back to Marketing Website"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
          {!collapsed && <span>Marketing Website</span>}
        </button>

        {/* Network status indicator */}
        {!collapsed && (
          <div className="px-2.5 py-1.5 rounded bg-[#121217] border border-[#1E1E28] text-[10px] font-mono flex items-center justify-between text-[#848494]">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] shadow-[0_0_6px_#00FF66]" />
              <span className="text-[#F3F3F6]">Stellar Testnet</span>
            </div>
            <span className="text-[#00FF66] text-[9px]">Soroban v22</span>
          </div>
        )}

        {/* Wallet Account Box */}
        <button
          onClick={() => setWalletModalOpen(true)}
          className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg bg-[#121217] hover:bg-[#16161D] border border-[#1E1E28] hover:border-[#00FF66]/40 text-xs font-mono transition-all text-left cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Stellar Wallets (LOBSTR, Freighter, Albedo, xBull)"
        >
          {walletAddress ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
          ) : (
            <Wallet className="w-3.5 h-3.5 text-[#848494] shrink-0" />
          )}

          {!collapsed && (
            <div className="flex-1 truncate">
              <div className={walletAddress ? 'text-[#00FF66] font-medium' : 'text-[#F3F3F6]'}>
                {displayAddress}
              </div>
              <div className="text-[9px] text-[#505060] capitalize">
                {walletAddress ? `${walletId || 'Stellar'} Connected` : 'Connect Multi-Wallet'}
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Multi-Wallet Connection Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        activeAddress={walletAddress}
        activeWalletId={walletId}
      />
    </aside>
  );
};
