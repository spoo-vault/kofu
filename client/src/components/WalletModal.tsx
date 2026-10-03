import React, { useState } from 'react';
import {
  X,
  Wallet,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import {
  stellarWalletService,
  SUPPORTED_WALLETS,
  SupportedWalletId,
  WalletInfo
} from '../lib/stellarWallets';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAddress: string | null;
  activeWalletId: SupportedWalletId | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  activeAddress,
  activeWalletId,
}) => {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectWallet = async (wallet: WalletInfo) => {
    setConnectingId(wallet.id);
    setError(null);
    try {
      await stellarWalletService.connect(wallet.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || `Failed to connect with ${wallet.name}`);
    } finally {
      setConnectingId(null);
    }
  };

  const handleOpenUniversalModal = async () => {
    setConnectingId('universal');
    setError(null);
    try {
      await stellarWalletService.openUniversalModal();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Connection cancelled');
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async () => {
    await stellarWalletService.disconnect();
    onClose();
  };

  const handleCopy = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0D0D12] border border-[#1E1E28] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#1E1E28] flex items-center justify-between bg-[#121217]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#00FF66]" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-[#F3F3F6]">
                {activeAddress ? 'Connected Wallet' : 'Connect Stellar Wallet'}
              </h3>
              <p className="text-[10px] font-mono text-[#848494]">
                Stellar Network & Soroban Smart Contracts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#848494] hover:text-[#F3F3F6] hover:bg-[#1E1E28] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs font-mono text-red-200 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-red-300">Connection Failed</div>
              <div className="text-[11px] text-red-400/90 mt-0.5 leading-relaxed">{error}</div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          {activeAddress ? (
            /* Connected State View */
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#121217] border border-[#1E1E28] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#848494]">
                  <span>Active Signer</span>
                  <span className="capitalize text-[#00FF66] font-bold">
                    {activeWalletId || 'Stellar Signer'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#0A0A0E] px-3 py-2 rounded border border-[#1E1E28]">
                  <span className="font-mono text-xs text-[#F3F3F6] truncate max-w-[240px]">
                    {activeAddress}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-[#848494] hover:text-[#00FF66] transition-colors"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${activeAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-lg bg-[#121217] hover:bg-[#1A1A24] border border-[#1E1E28] hover:border-[#2E2E3C] text-xs font-mono text-[#F3F3F6] flex items-center justify-center space-x-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#848494]" />
                  <span>View on StellarExpert</span>
                </a>
                <button
                  onClick={handleDisconnect}
                  className="py-2 px-4 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 text-xs font-mono text-red-400 hover:text-red-300 transition-all font-semibold"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            /* Wallet Selection List */
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#505060] px-1">
                Choose Signer
              </div>

              {SUPPORTED_WALLETS.map((w) => {
                const isConnecting = connectingId === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => handleSelectWallet(w)}
                    disabled={!!connectingId}
                    className="w-full text-left p-3 rounded-lg bg-[#121217] hover:bg-[#181820] border border-[#1E1E28] hover:border-[#00FF66]/50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1E1E28] border border-[#2E2E3C] flex items-center justify-center text-lg">
                        {w.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-[#F3F3F6] group-hover:text-[#00FF66] transition-colors">
                            {w.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1E1E28] text-[#848494]">
                            {w.badge}
                          </span>
                          {w.recommended && (
                            <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-[#6A6A7A] mt-0.5 max-w-[280px]">
                          {w.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#00FF66]" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-[#505060] group-hover:text-[#00FF66] group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Universal Stellar Wallets Kit Modal Trigger */}
              <div className="pt-2">
                <button
                  onClick={handleOpenUniversalModal}
                  disabled={!!connectingId}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#0A0A0E] hover:bg-[#121217] border border-[#1E1E28] border-dashed hover:border-[#00FF66]/40 text-xs font-mono text-[#848494] hover:text-[#F3F3F6] flex items-center justify-center space-x-2 transition-all"
                >
                  {connectingId === 'universal' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00FF66]" />
                  ) : (
                    <Layers className="w-3.5 h-3.5 text-[#00FF66]" />
                  )}
                  <span>Open Universal Stellar Wallets Kit</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0A0A0E] border-t border-[#1E1E28] flex items-center justify-between text-[10px] font-mono text-[#505060]">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3 h-3 text-[#00FF66]" />
            <span>Non-custodial & secure</span>
          </div>
          <span>Stellar Testnet (Soroban)</span>
        </div>
      </div>
    </div>
  );
};
