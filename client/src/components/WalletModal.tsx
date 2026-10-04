import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  Smartphone,
  Coins
} from 'lucide-react';
import {
  stellarWalletService,
  SupportedWalletId,
} from '../lib/stellarWallets';
import { walletDetectionService, DetectedExtensions } from '../lib/walletDetection';

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
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [faucetLoading, setFaucetLoading] = useState<boolean>(false);
  const [faucetDone, setFaucetDone] = useState<boolean>(false);
  const [installed, setInstalled] = useState<DetectedExtensions>({
    freighter: false,
    lobstr: false,
    xbull: false,
    metamask: false,
  });

  // Subscribe to real-time wallet extension detection
  useEffect(() => {
    const unsub = walletDetectionService.subscribe((status) => {
      setInstalled(status);
    });

    if (isOpen) {
      walletDetectionService.probeAll();
    }

    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectWallet = async (id: string) => {
    setConnectingId(id);
    setError(null);
    try {
      if (id === 'walletconnect' || id === 'all') {
        await stellarWalletService.openUniversalModal();
      } else if (id === 'metamask') {
        await stellarWalletService.openUniversalModal();
      } else {
        await stellarWalletService.connect(id as SupportedWalletId);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || `Failed to connect with ${id}`);
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async () => {
    await stellarWalletService.disconnect();
    onClose();
  };

  const handleRequestFaucet = async () => {
    if (!activeAddress || faucetLoading) return;
    setFaucetLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(activeAddress)}`);
      if (res.ok) {
        setFaucetDone(true);
        setTimeout(() => setFaucetDone(false), 4000);
      } else {
        const text = await res.text();
        setError(`Friendbot notice: ${text || 'Could not fund account.'}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to request testnet XLM');
    } finally {
      setFaucetLoading(false);
    }
  };

  const handleCopy = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Real wallet items using official images
  const walletList = [
    {
      id: 'freighter',
      name: 'Freighter',
      iconUrl: '/wallets/freighter.png',
      isInstalled: installed.freighter,
      badgeText: installed.freighter ? 'INSTALLED' : 'POPULAR',
      badgeStyle: installed.freighter ? 'installed' : 'popular',
      fallbackText: 'Stellar & Soroban extension',
    },
    {
      id: 'lobstr',
      name: 'LOBSTR',
      iconUrl: '/wallets/lobstr.png',
      isInstalled: installed.lobstr,
      badgeText: installed.lobstr ? 'INSTALLED' : 'MOBILE & WEB',
      badgeStyle: installed.lobstr ? 'installed' : 'neutral',
      fallbackText: 'Mobile & Web signer',
    },
    {
      id: 'albedo',
      name: 'Albedo',
      iconUrl: '/wallets/albedo.png',
      isInstalled: true, // Albedo is web-based, zero install needed
      badgeText: 'WEB SIGNER',
      badgeStyle: 'web',
      fallbackText: 'Instant popup (no install)',
    },
    {
      id: 'xbull',
      name: 'xBull',
      iconUrl: '/wallets/xbull.png',
      isInstalled: installed.xbull,
      badgeText: installed.xbull ? 'INSTALLED' : 'EXTENSION',
      badgeStyle: installed.xbull ? 'installed' : 'neutral',
      fallbackText: 'Cross-platform power wallet',
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      iconUrl: '/wallets/metamask.svg',
      isInstalled: installed.metamask,
      badgeText: installed.metamask ? 'INSTALLED' : 'STELLAR SNAP',
      badgeStyle: installed.metamask ? 'installed' : 'snap',
      fallbackText: 'EVM wallet with Stellar Snap',
    },
    {
      id: 'agent',
      name: 'Autonomous Agent',
      isCustomIcon: true,
      badgeText: 'DEV KEYPAIR',
      badgeStyle: 'neutral',
      fallbackText: 'Auto-funded local testnet agent',
    },
  ];

  // Render via React Portal to document.body so it is ALWAYS centered in the viewport
  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] sm:max-w-[380px] bg-[#141519] border border-[#262833] rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#1E2028]">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#8E92A2] hover:text-[#F3F3F6] hover:bg-[#1E2028] transition-colors"
            title="What is a wallet?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <h3 className="text-sm font-semibold text-[#F3F3F6] tracking-tight">
            {activeAddress ? 'Connected Wallet' : 'Connect Wallet'}
          </h3>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#8E92A2] hover:text-[#F3F3F6] hover:bg-[#1E2028] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Help Sheet */}
        {showHelp && (
          <div className="p-3.5 bg-[#1B1D24] border-b border-[#262833] text-xs font-sans text-[#A4A8B8] leading-relaxed">
            <span className="font-semibold text-[#F3F3F6] block mb-1">What is a Stellar Wallet?</span>
            Wallets allow you to hold Stellar lumens (XLM), USDC, and authorize Soroban smart contract operations without revealing private keys.
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-3.5 mt-3 p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-xs font-mono text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] leading-tight">{error}</div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-3.5 overflow-y-auto max-h-[70vh] space-y-2">
          {activeAddress ? (
            /* Connected Wallet State */
            <div className="space-y-3.5 py-1">
              <div className="p-3.5 rounded-2xl bg-[#1A1B22] border border-[#262833] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8E92A2]">
                  <span>Connected via</span>
                  <span className="text-[#00FF66] font-semibold uppercase text-[11px]">
                    {activeWalletId || 'Stellar Signer'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#121317] px-3 py-2.5 rounded-xl border border-[#23252E]">
                  <span className="font-mono text-xs text-[#F3F3F6] truncate max-w-[210px]">
                    {activeAddress}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-[#8E92A2] hover:text-[#00FF66] transition-colors"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Instant Friendbot Testnet Airdrop */}
              <button
                onClick={handleRequestFaucet}
                disabled={faucetLoading}
                className="w-full py-2.5 px-3 rounded-xl bg-[#00FF66]/10 hover:bg-[#00FF66]/20 border border-[#00FF66]/30 text-xs font-mono text-[#00FF66] flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {faucetLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Requesting Friendbot 10,000 XLM...</span>
                  </>
                ) : faucetDone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00FF66]" />
                    <span>Account Funded with 10,000 XLM!</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-3.5 h-3.5" />
                    <span>Airdrop 10,000 Testnet XLM (Friendbot)</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-2">
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${activeAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#1A1B22] hover:bg-[#22242D] border border-[#262833] text-xs font-medium text-[#F3F3F6] flex items-center justify-center space-x-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#8E92A2]" />
                  <span>StellarExpert</span>
                </a>
                <button
                  onClick={handleDisconnect}
                  className="py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-800/40 text-xs text-red-300 font-semibold transition-all"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Elevated Top Card: Real WalletConnect with QR Code Badge */}
              <button
                onClick={() => handleConnectWallet('walletconnect')}
                disabled={!!connectingId}
                className="w-full p-3 rounded-2xl bg-[#1A1B22] hover:bg-[#20222A] border border-[#262833] hover:border-[#3396FF]/50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#3396FF] flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-sm">
                    <img
                      src="/wallets/walletconnect.png"
                      alt="WalletConnect"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-semibold text-[#F3F3F6] group-hover:text-[#3396FF] transition-colors">
                    WalletConnect
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#132A4A] text-[#3396FF] border border-[#3396FF]/30 tracking-wider">
                    QR CODE
                  </span>
                  {connectingId === 'walletconnect' && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3396FF]" />
                  )}
                </div>
              </button>

              {/* Wallet List Items with Real Official Logos */}
              <div className="space-y-1.5 pt-1">
                {walletList.map((w) => {
                  const isConnecting = connectingId === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleConnectWallet(w.id)}
                      disabled={!!connectingId}
                      className="w-full px-3 py-2.5 rounded-2xl bg-[#17181F] hover:bg-[#1E2028] border border-transparent hover:border-[#2A2C38] transition-all flex items-center justify-between group cursor-pointer text-left"
                    >
                      <div className="flex items-center space-x-3">
                        {w.isCustomIcon ? (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00FF66]/20 to-[#0066FF]/20 border border-[#00FF66]/30 flex items-center justify-center text-lg shrink-0">
                            🤖
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-[#0D0E12] border border-[#23252E] flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
                            <img
                              src={w.iconUrl}
                              alt={w.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium text-[#F3F3F6] group-hover:text-white transition-colors">
                          {w.name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isConnecting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00FF66]" />
                        ) : w.badgeText ? (
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              w.badgeStyle === 'installed'
                                ? 'bg-[#0E3320] text-[#00FF66] border border-[#00FF66]/25'
                                : w.badgeStyle === 'popular'
                                ? 'bg-[#132A4A] text-[#38BDF8] border border-[#38BDF8]/25'
                                : w.badgeStyle === 'web'
                                ? 'bg-[#2E1E4D] text-[#C084FC] border border-[#C084FC]/25'
                                : w.badgeStyle === 'snap'
                                ? 'bg-[#3B2514] text-[#FB923C] border border-[#FB923C]/25'
                                : 'bg-[#23252E] text-[#8E92A2]'
                            }`}
                          >
                            {w.badgeText}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}

                {/* Bottom Item: All Wallets (240+) */}
                <button
                  onClick={() => handleConnectWallet('all')}
                  disabled={!!connectingId}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#17181F] hover:bg-[#1E2028] border border-transparent hover:border-[#2A2C38] transition-all flex items-center justify-between group cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1A2035] flex items-center justify-center shrink-0">
                      <div className="grid grid-cols-2 gap-1 p-2">
                        <div className="w-1.5 h-1.5 rounded-sm bg-[#3B82F6]"></div>
                        <div className="w-1.5 h-1.5 rounded-sm bg-[#3B82F6]"></div>
                        <div className="w-1.5 h-1.5 rounded-sm bg-[#3B82F6]"></div>
                        <div className="w-1.5 h-1.5 rounded-sm bg-[#3B82F6]"></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-[#F3F3F6] group-hover:text-white transition-colors">
                      All Wallets
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {connectingId === 'all' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3B82F6]" />
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#23252E] text-[#8E92A2]">
                        240+
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#101115] border-t border-[#1C1D24] flex items-center justify-between text-[10px] text-[#6C7082]">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]"></span>
            <span>Stellar Testnet</span>
          </div>
          <span>Soroban Smart Contracts</span>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
