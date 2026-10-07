import React, { useState, useEffect } from 'react';
import { Agreement, AgreementEvent, AgreementState } from '@kofu/shared';
import { api } from '../lib/api';
import { FirestoreService } from '../lib/firestoreService';
import { SorobanEscrowClient } from '../lib/sorobanClient';
import { PolicyBadge } from '../components/PolicyBadge';
import { stellarWalletService, SupportedWalletId } from '../lib/stellarWallets';
import { WalletModal } from '../components/WalletModal';
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Play,
  Check,
  Cpu,
  Layers,
  Sparkles,
  ArrowDown,
  Loader2,
  Wallet,
  Share2,
  Copy,
  Send,
  FileCheck,
  AlertTriangle,
  User,
  Briefcase,
  Radio,
  FileText
} from 'lucide-react';

interface AgreementDetailPageProps {
  agreementId: string;
  onBack: () => void;
  onOpenNegotiation: (agreement: Agreement) => void;
}

const LIFECYCLE_STEPS: AgreementState[] = [
  'NEGOTIATING',
  'AGREED',
  'ESCROWED',
  'MONITORING',
  'CONDITION_MET',
  'SETTLING',
  'SETTLED',
];

export const AgreementDetailPage: React.FC<AgreementDetailPageProps> = ({
  agreementId,
  onBack,
  onOpenNegotiation,
}) => {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [events, setEvents] = useState<AgreementEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<SupportedWalletId | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // 3-Party Perspective State
  const [activePerspective, setActivePerspective] = useState<'funder' | 'counterparty' | 'sentinel'>('funder');
  const [copiedLink, setCopiedLink] = useState(false);

  // Deliverable Submission State (Counterparty View)
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [isSubmittingDeliverable, setIsSubmittingDeliverable] = useState(false);
  const [deliverableSuccess, setDeliverableSuccess] = useState(false);

  // Dispute State
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isDisputing, setIsDisputing] = useState(false);

  useEffect(() => {
    const unsub = stellarWalletService.subscribe((addr, wid) => {
      setWalletAddress(addr);
      setWalletId(wid);
    });
    return () => unsub();
  }, []);

  const fetchDetails = async () => {
    try {
      const data = await api.getAgreement(agreementId);
      setAgreement(data.agreement);
      setEvents(data.events);
      if (data.agreement.deliverableUrl) {
        setDeliverableUrl(data.agreement.deliverableUrl);
      }
      if (data.agreement.deliverableNotes) {
        setDeliverableNotes(data.agreement.deliverableNotes);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load agreement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch from backend / local state
    fetchDetails();

    // Subscribe to real-time Firestore updates
    const unsubAgreement = FirestoreService.subscribeAgreement(agreementId, (ag) => {
      if (ag) {
        setAgreement(ag);
        if (ag.deliverableUrl) setDeliverableUrl(ag.deliverableUrl);
        if (ag.deliverableNotes) setDeliverableNotes(ag.deliverableNotes);
        setLoading(false);
      }
    });

    const unsubEvents = FirestoreService.subscribeEvents(agreementId, (evs) => {
      if (evs && evs.length > 0) {
        setEvents(evs);
      }
    });

    // Fallback sync interval for background blockchain sentinel checks
    const interval = setInterval(fetchDetails, 5000);

    return () => {
      if (unsubAgreement) unsubAgreement();
      if (unsubEvents) unsubEvents();
      clearInterval(interval);
    };
  }, [agreementId]);

  // Handle Share Link Copy
  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/app?agreement=${agreementId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleFundEscrow = async () => {
    if (!agreement) return;

    if (!stellarWalletService.isConnected()) {
      setWalletModalOpen(true);
      setError('Please connect a Stellar wallet (Freighter, LOBSTR, Albedo, xBull, or Testnet Agent) to lock escrow.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const isRealBrowserWallet = walletId && walletId !== 'agent';
      if (isRealBrowserWallet) {
        // Attempt real on-chain Soroban deposit via connected wallet popup
        const onChainResult = await SorobanEscrowClient.fundEscrowOnChain(agreement);
        const updatedAgr: Agreement = {
          ...agreement,
          status: 'ESCROWED',
          escrowFunded: true,
          stellarTxHash: onChainResult.txHash,
          updatedAt: new Date().toISOString(),
        };
        setAgreement(updatedAgr);
        await FirestoreService.saveAgreement(updatedAgr);
        await FirestoreService.logEvent({
          id: `ev-${Date.now()}`,
          agreementId: agreement.id,
          type: 'SOROBAN_LOCKBOX_SECURED',
          message: `Escrow funded on Soroban contract CAXN...SVJS. Ledger: ${onChainResult.ledger || 'confirmed'}. Tx: ${onChainResult.txHash}`,
          timestamp: updatedAgr.updatedAt,
          actor: 'STELLAR_NETWORK',
        });
        return;
      }

      // Fallback for synthetic Testnet Agent
      const res = await api.fundEscrow(agreement.id);
      setAgreement(res.agreement);
      setEvents(res.events);
    } catch (err: any) {
      console.error('Real on-chain escrow funding error:', err);
      const msg = err?.message || 'Failed to fund escrow on Stellar Testnet';
      if (msg.includes('declined') || msg.includes('cancel') || msg.includes('reject')) {
        setError('Transaction signature was cancelled in your wallet.');
      } else if (msg.includes('balance') || msg.includes('underfunded')) {
        setError(`Insufficient balance on Stellar Testnet. Please request Friendbot XLM from the wallet menu.`);
      } else {
        setError(`Stellar Testnet Notice: ${msg}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Party 2 (Worker) submits deliverable proof
  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement || !deliverableUrl.trim()) return;

    setIsSubmittingDeliverable(true);
    setError(null);

    try {
      const updatedAgr: Agreement = {
        ...agreement,
        deliverableUrl: deliverableUrl.trim(),
        deliverableNotes: deliverableNotes.trim(),
        counterpartyWallet: walletAddress || agreement.counterpartyWallet,
        status: 'CONDITION_MET',
        conditionSatisfied: true,
        updatedAt: new Date().toISOString(),
      };

      setAgreement(updatedAgr);
      await FirestoreService.saveAgreement(updatedAgr);
      await FirestoreService.logEvent({
        id: `ev-${Date.now()}`,
        agreementId: agreement.id,
        type: 'DELIVERABLE_SUBMITTED',
        message: `Counterparty submitted deliverable proof: "${deliverableUrl.trim()}". Status moved to CONDITION_MET.`,
        timestamp: updatedAgr.updatedAt,
        actor: 'COUNTERPARTY',
      });

      setDeliverableSuccess(true);
      setTimeout(() => setDeliverableSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit deliverable proof');
    } finally {
      setIsSubmittingDeliverable(false);
    }
  };

  const handleSatisfyCondition = async () => {
    if (!agreement) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.satisfyCondition(agreement.id);
      setAgreement(res.agreement);
      setEvents(res.events);
    } catch (err: any) {
      setError(err.message || 'Failed to verify condition');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleasePayment = async () => {
    if (!agreement) return;
    setActionLoading(true);
    setError(null);
    try {
      const isRealBrowserWallet = walletId && walletId !== 'agent';
      if (isRealBrowserWallet) {
        // Real on-chain Soroban settle call
        const settleRes = await SorobanEscrowClient.settleEscrowOnChain(agreement);
        const updatedAgr: Agreement = {
          ...agreement,
          status: 'SETTLED',
          stellarTxHash: settleRes.txHash,
          updatedAt: new Date().toISOString(),
        };
        setAgreement(updatedAgr);
        await FirestoreService.saveAgreement(updatedAgr);
        await FirestoreService.logEvent({
          id: `ev-${Date.now()}`,
          agreementId: agreement.id,
          type: 'SETTLEMENT_RELEASED',
          message: `Settlement released on-chain via Soroban. Ledger: ${settleRes.ledger || 'confirmed'}. Tx: ${settleRes.txHash}`,
          timestamp: updatedAgr.updatedAt,
          actor: 'STELLAR_NETWORK',
        });
        return;
      }

      const res = await api.releaseSettlement(agreement.id);
      setAgreement(res.agreement);
      setEvents(res.events);
    } catch (err: any) {
      console.error('Real on-chain settlement release error:', err);
      const msg = err?.message || 'Failed to release payment on Stellar Testnet';
      if (msg.includes('declined') || msg.includes('cancel') || msg.includes('reject')) {
        setError('Transaction signature was cancelled in your wallet.');
      } else {
        setError(`Stellar Testnet Settlement Notice: ${msg}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Party 1 (Buyer) reclaims escrowed funds upon timeout or cancellation
  const handleRefundEscrow = async () => {
    if (!agreement) return;

    if (!stellarWalletService.isConnected()) {
      setWalletModalOpen(true);
      setError('Please connect your Stellar wallet to claim refund.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const isRealBrowserWallet = walletId && walletId !== 'agent';
      if (isRealBrowserWallet) {
        const refundRes = await SorobanEscrowClient.refundEscrowOnChain(agreement);
        const updatedAgr: Agreement = {
          ...agreement,
          status: 'REFUNDED',
          stellarTxHash: refundRes.txHash,
          updatedAt: new Date().toISOString(),
        };
        setAgreement(updatedAgr);
        await FirestoreService.saveAgreement(updatedAgr);
        await FirestoreService.logEvent({
          id: `ev-${Date.now()}`,
          agreementId: agreement.id,
          type: 'ESCROW_REFUNDED',
          message: `Escrow refunded on-chain via Soroban. Ledger: ${refundRes.ledger || 'confirmed'}. Tx: ${refundRes.txHash}`,
          timestamp: updatedAgr.updatedAt,
          actor: 'STELLAR_NETWORK',
        });
        return;
      }

      const res = await api.refundEscrow(agreement.id);
      setAgreement(res.agreement);
      setEvents(res.events);
    } catch (err: any) {
      console.error('Real on-chain escrow refund error:', err);
      const msg = err?.message || 'Failed to refund escrow on Stellar Testnet';
      if (msg.includes('TimeoutNotReached') || msg.includes('8')) {
        setError('Soroban Notice: Escrow timeout ledger has not yet elapsed.');
      } else if (msg.includes('declined') || msg.includes('cancel') || msg.includes('reject')) {
        setError('Transaction signature was cancelled in your wallet.');
      } else {
        setError(`Stellar Testnet Refund Notice: ${msg}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Party 1 or Party 2 triggers on-chain dispute freeze
  const handleTriggerDispute = async () => {
    if (!agreement) return;
    setIsDisputing(true);
    setError(null);

    try {
      const isRealBrowserWallet = walletId && walletId !== 'agent';
      let txHash = agreement.stellarTxHash;

      if (isRealBrowserWallet) {
        const disputeRes = await SorobanEscrowClient.disputeEscrowOnChain(agreement);
        txHash = disputeRes.txHash;
      }

      const updatedAgr: Agreement = {
        ...agreement,
        status: 'DISPUTED',
        disputeReason: disputeReason.trim() || 'Dispute raised by participant',
        disputedAt: new Date().toISOString(),
        stellarTxHash: txHash,
        updatedAt: new Date().toISOString(),
      };

      setAgreement(updatedAgr);
      await FirestoreService.saveAgreement(updatedAgr);
      await FirestoreService.logEvent({
        id: `ev-${Date.now()}`,
        agreementId: agreement.id,
        type: 'ESCROW_DISPUTED',
        message: `Escrow frozen in DISPUTED state on Soroban. Reason: "${disputeReason.trim() || 'Condition contested'}". Automated release halted.`,
        timestamp: updatedAgr.updatedAt,
        actor: activePerspective === 'counterparty' ? 'COUNTERPARTY' : 'INITIATOR',
      });

      setDisputeModalOpen(false);
      setDisputeReason('');
    } catch (err: any) {
      setError(err?.message || 'Failed to trigger dispute freeze on Soroban');
    } finally {
      setIsDisputing(false);
    }
  };

  if (loading && !agreement) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-mono space-y-3">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#00FF66]" />
        <div className="text-xs text-[#848494]">LOADING AGREEMENT FROM DECENTRALIZED REGISTRY...</div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-mono space-y-4">
        <div className="text-[#FF4D4D] text-sm">Agreement not found</div>
        <button onClick={onBack} className="text-xs text-[#848494] hover:text-[#EDEDED] cursor-pointer">
          &larr; Back to Command Center
        </button>
      </div>
    );
  }

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(agreement.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-mono">
      {/* Top action / back bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs text-[#848494] hover:text-[#F3F3F6] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ALL AGREEMENTS</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Share Button */}
          <button
            onClick={handleCopyShareLink}
            className="px-3 py-1.5 rounded-lg border border-[#1E1E28] hover:border-[#00FF66]/50 bg-[#121217] text-xs text-[#EDEDED] hover:text-[#00FF66] transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Copy shareable link for counterparty"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00FF66]" />
                <span className="text-[#00FF66]">Copied Share Link!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link with Worker</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2 text-[11px] text-[#848494] bg-[#0D0D11] border border-[#1E1E28] px-2.5 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
            <span>STELLAR TESTNET (SOROBAN)</span>
          </div>
        </div>
      </div>

      {/* 3-PARTY PERSPECTIVE SWITCHER */}
      <div className="border border-[#1E1E28] bg-[#0A0A0E] p-2 rounded-xl flex items-center justify-between flex-wrap gap-2">
        <span className="text-[10px] uppercase tracking-wider text-[#686878] px-2 flex items-center space-x-1">
          <span>Active Interface View:</span>
        </span>

        <div className="flex items-center space-x-1.5 bg-[#121217] p-1 rounded-lg border border-[#1E1E28]">
          <button
            onClick={() => setActivePerspective('funder')}
            className={`px-3 py-1.5 rounded text-xs transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePerspective === 'funder'
                ? 'bg-[#00FF66] text-[#08080A] font-bold shadow-sm'
                : 'text-[#848494] hover:text-[#EDEDED]'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Party 1: Funder (Buyer)</span>
          </button>

          <button
            onClick={() => setActivePerspective('counterparty')}
            className={`px-3 py-1.5 rounded text-xs transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePerspective === 'counterparty'
                ? 'bg-[#00FF66] text-[#08080A] font-bold shadow-sm'
                : 'text-[#848494] hover:text-[#EDEDED]'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Party 2: Worker (Recipient)</span>
          </button>

          <button
            onClick={() => setActivePerspective('sentinel')}
            className={`px-3 py-1.5 rounded text-xs transition-all flex items-center space-x-1.5 cursor-pointer ${
              activePerspective === 'sentinel'
                ? 'bg-[#00FF66] text-[#08080A] font-bold shadow-sm'
                : 'text-[#848494] hover:text-[#EDEDED]'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Party 3: Sentinel (Arbiter)</span>
          </button>
        </div>
      </div>

      {/* Main Header & Economic Value Flow */}
      <div className="border border-[#1E1E28] bg-[#0D0D11] rounded-xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00FF66]/50 to-transparent"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-[#848494] uppercase tracking-widest mb-1">
              Autonomous Escrow Agreement
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F6]">
              AGREEMENT #{agreement.humanReadableId}
            </h1>
          </div>

          <div className="sm:text-right">
            <div className="text-[11px] text-[#848494] uppercase tracking-widest mb-1">Escrow Value</div>
            <div className="text-2xl sm:text-3xl font-bold text-[#00FF66]">
              ${agreement.amount.toFixed(2)}
              <span className="text-xs font-normal text-[#848494] ml-1.5">{agreement.currency}</span>
            </div>
          </div>
        </div>

        {/* The 3-node Economic Flow */}
        <div className="p-4 sm:p-6 bg-[#08080A] border border-[#1E1E28] rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            {/* Initiator */}
            <div className={`p-3.5 rounded-lg border transition-all ${
              activePerspective === 'funder'
                ? 'bg-[#00FF66]/10 border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                : 'bg-[#121217] border-[#1E1E28]'
            }`}>
              <div className="text-[10px] text-[#505060] uppercase tracking-wider mb-0.5">Party 1: Initiator / Buyer</div>
              <div className="text-sm font-bold text-[#F3F3F6] truncate">{agreement.initiator}</div>
              <div className="text-[10px] text-[#00FF66] mt-1 font-semibold">Funds Funder</div>
            </div>

            {/* KOFU ESCROW */}
            <div className="relative py-2 md:py-0 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-2 text-[#00FF66] mb-1">
                <span className="text-xs font-bold tracking-wider">KOFU ESCROW (SOROBAN)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping"></span>
              </div>
              <div className="text-[11px] text-[#848494] bg-[#121217] px-2.5 py-1 rounded border border-[#1E1E28]">
                {agreement.status === 'DISPUTED' ? (
                  <span className="text-[#FF4D4D] font-bold">FROZEN (IN DISPUTE)</span>
                ) : agreement.escrowFunded ? (
                  <span className="text-[#00FF66] font-semibold">FUNDS LOCKED (${agreement.amount} {agreement.currency})</span>
                ) : (
                  <span className="text-[#FFB800]">DEPOSIT PENDING</span>
                )}
              </div>
              <div className="hidden md:flex absolute top-1/2 left-0 right-0 -z-0 h-[1px] bg-[#1E1E28]"></div>
            </div>

            {/* Counterparty */}
            <div className={`p-3.5 rounded-lg border transition-all ${
              activePerspective === 'counterparty'
                ? 'bg-[#00FF66]/10 border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                : 'bg-[#121217] border-[#1E1E28]'
            }`}>
              <div className="text-[10px] text-[#505060] uppercase tracking-wider mb-0.5">Party 2: Worker / Payee</div>
              <div className="text-sm font-bold text-[#F3F3F6] truncate">{agreement.counterparty}</div>
              <div className="text-[10px] text-[#848494] mt-1 uppercase">({agreement.counterpartyType})</div>
            </div>
          </div>
        </div>

        {/* 4 Core Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-3 bg-[#121217]/60 border border-[#1E1E28] rounded-lg">
            <span className="text-[#505060] text-[10px] uppercase block mb-1">Status</span>
            <span className={`font-bold text-sm tracking-wide ${
              agreement.status === 'DISPUTED' ? 'text-[#FF4D4D]' : 'text-[#00FF66]'
            }`}>{agreement.status}</span>
          </div>

          <div className="p-3 bg-[#121217]/60 border border-[#1E1E28] rounded-lg">
            <span className="text-[#505060] text-[10px] uppercase block mb-1">Required Deliverable</span>
            <span className="text-[#F3F3F6] font-medium text-xs truncate block" title={agreement.condition}>
              {agreement.condition}
            </span>
          </div>

          <div className="p-3 bg-[#121217]/60 border border-[#1E1E28] rounded-lg">
            <span className="text-[#505060] text-[10px] uppercase block mb-1">Deadline</span>
            <span className="text-[#F3F3F6] font-medium text-xs">{agreement.deadline}</span>
          </div>

          <div className="p-3 bg-[#121217]/60 border border-[#1E1E28] rounded-lg">
            <span className="text-[#505060] text-[10px] uppercase block mb-1">Autonomy Model</span>
            <span className="text-[#00FF66] font-bold text-xs">{agreement.autonomyLevel}</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC ROLE WORKSPACE (PARTY 1 VS PARTY 2 VS PARTY 3) */}
      {activePerspective === 'counterparty' ? (
        /* ================= PARTY 2: WORKER / COUNTERPARTY VIEW ================= */
        <div className="border border-[#00FF66]/30 bg-[#0D0D11] rounded-xl p-6 space-y-5 shadow-[0_0_20px_rgba(0,255,102,0.06)]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E1E28]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#F3F3F6] uppercase tracking-wider block">
                  Worker Deliverable Hub
                </span>
                <span className="text-[11px] text-[#848494]">
                  You are the recipient. Submit completion proof to unlock your ${agreement.amount} {agreement.currency} payout.
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded bg-[#121217] border border-[#1E1E28] text-[#00FF66]">
              ROLE: PAYEE
            </span>
          </div>

          {/* Deliverable Submission Form */}
          {agreement.status === 'SETTLED' ? (
            <div className="p-4 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center space-x-3 text-xs text-[#00FF66]">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">Funds Have Been Paid Out!</span>
                <span className="text-[#EDEDED]">
                  ${agreement.amount.toFixed(2)} {agreement.currency} was released to your Stellar wallet address.
                </span>
              </div>
            </div>
          ) : agreement.status === 'DISPUTED' ? (
            <div className="p-4 rounded-lg bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 space-y-2 text-xs text-[#FF4D4D]">
              <div className="flex items-center space-x-2 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Escrow Frozen in Dispute</span>
              </div>
              <p className="text-[#EDEDED]">
                Reason: {agreement.disputeReason || 'Terms contested by a party.'} Autonomous Sentinel arbiter is evaluating the case.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitDeliverable} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#EDEDED] uppercase tracking-wider block">
                  Deliverable Proof Link (GitHub PR / Preview / IPFS)
                </label>
                <input
                  type="text"
                  required
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  placeholder="e.g. https://github.com/org/repo/pull/42 or https://mydemo.app"
                  className="w-full bg-[#08080A] border border-[#1E1E28] focus:border-[#00FF66] px-3.5 py-2.5 rounded-lg text-xs text-[#F3F3F6] outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#848494] uppercase tracking-wider block">
                  Completion Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  placeholder="Describe completed work, test passes, or deliverables..."
                  className="w-full bg-[#08080A] border border-[#1E1E28] focus:border-[#00FF66] p-3 rounded-lg text-xs text-[#F3F3F6] outline-none font-mono"
                />
              </div>

              {deliverableSuccess && (
                <div className="p-2.5 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 text-xs text-[#00FF66] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deliverable proof submitted! Buyer and Sentinel have been notified.</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingDeliverable || !deliverableUrl.trim()}
                  className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)] disabled:cursor-not-allowed"
                >
                  {isSubmittingDeliverable ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Submit Deliverable Proof</span>
                </button>

                {agreement.status === 'CONDITION_MET' && (
                  <button
                    type="button"
                    onClick={handleReleasePayment}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-[#121217] hover:bg-[#1E1E28] border border-[#00FF66]/50 text-[#00FF66] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Claim ${agreement.amount.toFixed(2)} {agreement.currency} Payout</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(true)}
                  className="px-4 py-2.5 bg-[#121217] hover:bg-[#FF4D4D]/20 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ml-auto"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Raise Dispute</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : activePerspective === 'sentinel' ? (
        /* ================= PARTY 3: SENTINEL MONITOR VIEW ================= */
        <div className="border border-[#1E1E28] bg-[#0D0D11] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E1E28]">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-pulse"></span>
              <div>
                <span className="text-sm font-bold text-[#F3F3F6] uppercase tracking-wider block">
                  Sentinel Oracle &amp; Arbitration Protocol
                </span>
                <span className="text-[11px] text-[#848494]">
                  Autonomous neutral observer monitoring cryptographic condition milestones.
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-[#121217] border border-[#1E1E28] px-2.5 py-1 rounded text-[#848494]">
              HEARTBEAT: ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-[#08080A] border border-[#1E1E28]">
              <span className="text-[#686878] text-[10px] uppercase block mb-1">Dual-Trigger Mechanism</span>
              <span className="text-[#00FF66] font-semibold">Client Release + Oracle Release</span>
            </div>
            <div className="p-3 rounded-lg bg-[#08080A] border border-[#1E1E28]">
              <span className="text-[#686878] text-[10px] uppercase block mb-1">Smart Contract Lock</span>
              <span className="text-[#EDEDED] font-mono text-[11px] truncate block">
                {SorobanEscrowClient ? 'CAXNYG...SVJS' : 'On-Chain'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#08080A] border border-[#1E1E28]">
              <span className="text-[#686878] text-[10px] uppercase block mb-1">Dispute Sovereignty</span>
              <span className="text-[#00FF66] font-semibold">Immediate On-Chain Freeze</span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= PARTY 1: FUNDER / BUYER VIEW ================= */
        <div className="border border-[#1E1E28] bg-[#0D0D11] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E1E28]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#F3F3F6] uppercase tracking-wider block">
                  Buyer Management Console
                </span>
                <span className="text-[11px] text-[#848494]">
                  Manage escrow lock, review worker deliverables, and execute final payment release.
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded bg-[#121217] border border-[#1E1E28] text-[#00FF66]">
              ROLE: INITIATOR
            </span>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!agreement.escrowFunded && agreement.status === 'AGREED' && (
              <button
                onClick={handleFundEscrow}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
                <span>LOCK {agreement.amount.toFixed(2)} {agreement.currency} (SOROBAN ESCROW)</span>
              </button>
            )}

            {(agreement.status === 'ESCROWED' || agreement.status === 'MONITORING') && (
              <>
                <button
                  onClick={handleSatisfyCondition}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>MARK CONDITION SATISFIED (MANUAL SIGN-OFF)</span>
                </button>

                <button
                  onClick={handleRefundEscrow}
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-[#121217] hover:bg-[#1E1E28] border border-[#FFB800]/50 hover:border-[#FFB800] text-[#FFB800] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center space-x-2 cursor-pointer"
                  title="Claim refund if deliverable deadline has elapsed without completion"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                  <span>CLAIM TIMEOUT REFUND</span>
                </button>
              </>
            )}

            {agreement.status === 'CONDITION_MET' && (
              <button
                onClick={handleReleasePayment}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>RELEASE PAYMENT TO {agreement.counterparty.toUpperCase()} ON STELLAR</span>
              </button>
            )}

            {agreement.status === 'REFUNDED' && (
              <div className="flex items-center space-x-2.5 text-xs text-[#FFB800] font-bold py-1">
                <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />
                <span>ESCROW REFUNDED BACK TO BUYER ON STELLAR SOROBAN</span>
              </div>
            )}

            {agreement.status === 'SETTLED' && (
              <div className="flex items-center space-x-2.5 text-xs text-[#00FF66] font-bold py-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>AGREEMENT SETTLED &amp; CONFIRMED ON STELLAR SOROBAN</span>
              </div>
            )}

            {agreement.stellarTxHash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${agreement.stellarTxHash}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 bg-[#121217] hover:bg-[#1E1E28] border border-[#1E1E28] hover:border-[#00FF66]/40 text-xs text-[#848494] hover:text-[#00FF66] rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                <span>View StellarExpert Tx</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {agreement.status !== 'SETTLED' && agreement.status !== 'DISPUTED' && (
              <button
                type="button"
                onClick={() => setDisputeModalOpen(true)}
                className="px-3 py-2 bg-[#121217] hover:bg-[#FF4D4D]/20 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ml-auto"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Raise Dispute</span>
              </button>
            )}
          </div>

          {/* Worker Deliverable Preview if submitted */}
          {agreement.deliverableUrl && (
            <div className="p-3.5 rounded-lg bg-[#08080A] border border-[#1E1E28] space-y-1.5 text-xs">
              <span className="text-[10px] text-[#00FF66] font-bold uppercase block">
                Submitted Worker Deliverable:
              </span>
              <a
                href={agreement.deliverableUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#00FF66] hover:underline flex items-center space-x-1 font-mono"
              >
                <span className="truncate">{agreement.deliverableUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              {agreement.deliverableNotes && (
                <p className="text-[#848494] italic text-[11px] pt-1">
                  &ldquo;{agreement.deliverableNotes}&rdquo;
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Lifecycle Stepper */}
      <div className="border border-[#1E1E28] bg-[#0D0D11] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-[#848494]">
          <span className="font-semibold uppercase tracking-wider text-[#EDEDED]">Lifecycle State Tracker</span>
          <span className="text-[10px] text-[#505060]">PROGRAMMABLE ESCROW MACHINE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step}
                className={`p-2 rounded text-center border text-[11px] transition-all ${
                  isCurrent
                    ? 'bg-[#00FF66]/10 border-[#00FF66] text-[#00FF66] font-bold'
                    : isCompleted
                    ? 'bg-[#121217] border-[#1E1E28] text-[#EDEDED]'
                    : 'bg-[#08080A] border-[#1E1E28]/40 text-[#505060]'
                }`}
              >
                <div className="text-[9px] mb-0.5">{idx + 1}</div>
                <div className="truncate">{step}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="border border-[#1E1E28] bg-[#0D0D11] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E1E28]">
          <span className="text-sm font-bold text-[#F3F3F6] uppercase tracking-wider">
            Protocol Activity Timeline
          </span>
          <span className="text-[10px] text-[#848494]">{events.length} Events Logged</span>
        </div>

        <div className="space-y-2.5">
          {events.length === 0 ? (
            <div className="text-xs text-[#505060] italic py-3">No activity recorded yet.</div>
          ) : (
            events.map((ev, i) => {
              const timeStr = new Date(ev.timestamp).toLocaleTimeString([], { hour12: false });
              return (
                <div
                  key={ev.id || i}
                  className="flex items-start space-x-3 text-xs p-3 rounded-lg bg-[#08080A]/60 border border-[#1E1E28]/60 hover:border-[#1E1E28] transition-colors"
                >
                  <span className="text-[#505060] text-[11px] font-mono mt-0.5">{timeStr}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="text-[10px] text-[#00FF66] font-bold uppercase">{ev.actor}</span>
                      <span className="text-[#505060] text-[9px]">&bull;</span>
                      <span className="text-[#848494] text-[10px]">{ev.type}</span>
                    </div>
                    <p className="text-[#EDEDED] leading-relaxed">{ev.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Autonomy & Security Layer */}
      <PolicyBadge level={agreement.autonomyLevel} interactive={false} />

      {/* Multi-Wallet Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        activeAddress={walletAddress}
        activeWalletId={walletId}
      />

      {/* DISPUTE CONFIRMATION MODAL */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
          <div className="bg-[#0D0D11] border border-[#FF4D4D]/40 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2.5 text-[#FF4D4D]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base">Raise On-Chain Dispute</h3>
            </div>

            <p className="text-xs text-[#848494] leading-relaxed">
              Triggering a dispute freezes the escrow on the Soroban smart contract. Automated Sentinel release will be halted until an agreed resolution is reached.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#EDEDED] uppercase">Dispute Reason</label>
              <textarea
                rows={3}
                required
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="State the reason for contesting terms or deliverable..."
                className="w-full bg-[#08080A] border border-[#1E1E28] focus:border-[#FF4D4D] p-3 rounded-lg text-xs text-[#F3F3F6] outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDisputeModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#121217] text-xs text-[#848494] hover:text-[#EDEDED] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerDispute}
                disabled={isDisputing}
                className="px-4 py-2 rounded-lg bg-[#FF4D4D] hover:bg-[#D93838] text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDisputing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>Confirm Freeze &amp; Dispute</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
