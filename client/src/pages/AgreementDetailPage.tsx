import React, { useState, useEffect } from 'react';
import { Agreement, AgreementEvent, AgreementState } from '@kofu/shared';
import { api } from '../lib/api';
import { PolicyBadge } from '../components/PolicyBadge';
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

  const fetchDetails = async () => {
    try {
      const data = await api.getAgreement(agreementId);
      setAgreement(data.agreement);
      setEvents(data.events);
    } catch (err: any) {
      setError(err.message || 'Failed to load agreement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 3000);
    return () => clearInterval(interval);
  }, [agreementId]);

  const handleFundEscrow = async () => {
    if (!agreement) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.fundEscrow(agreement.id);
      setAgreement(res.agreement);
      setEvents(res.events);
    } catch (err: any) {
      setError(err.message || 'Failed to fund escrow');
    } finally {
      setActionLoading(false);
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
      const res = await api.releaseSettlement(agreement.id);
      setAgreement(res.agreement);
      setEvents(res.events);
    } catch (err: any) {
      setError(err.message || 'Failed to release payment');
    } finally {
      setActionLoading(false);
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
        <button onClick={onBack} className="text-xs text-[#848494] hover:text-[#EDEDED]">
          ← Back to Command Center
        </button>
      </div>
    );
  }

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(agreement.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-mono">
      {/* Top action / back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs text-[#848494] hover:text-[#F3F3F6] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ALL AGREEMENTS</span>
        </button>

        <div className="flex items-center space-x-2 text-[11px] text-[#848494]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
          <span>SYNCED WITH STELLAR TESTNET (SOROBAN)</span>
        </div>
      </div>

      {/* Main Header & Economic Value Flow */}
      <div className="border border-[#1E1E28] bg-[#0D0D11] rounded-lg p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Subtle accent border at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00FF66]/50 to-transparent"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-[#848494] uppercase tracking-widest mb-1">
              Autonomous Agreement
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F3F6]">
              AGREEMENT #{agreement.humanReadableId}
            </h1>
          </div>

          <div className="sm:text-right">
            <div className="text-[11px] text-[#848494] uppercase tracking-widest mb-1">Total Value</div>
            <div className="text-2xl sm:text-3xl font-bold text-[#00FF66]">
              ${agreement.amount.toFixed(2)}
              <span className="text-xs font-normal text-[#848494] ml-1.5">{agreement.currency}</span>
            </div>
          </div>
        </div>

        {/* The 3-node Economic Flow */}
        <div className="p-4 sm:p-6 bg-[#08080A] border border-[#1E1E28] rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            {/* Initiator */}
            <div className="p-3 bg-[#121217] border border-[#1E1E28] rounded">
              <div className="text-[10px] text-[#505060] uppercase tracking-wider mb-0.5">Initiator / Buyer</div>
              <div className="text-sm font-bold text-[#F3F3F6] truncate">{agreement.initiator}</div>
              <div className="text-[10px] text-[#00FF66] mt-1">Authorized</div>
            </div>

            {/* KOFU ESCROW */}
            <div className="relative py-2 md:py-0 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-2 text-[#00FF66] mb-1">
                <span className="text-xs font-bold tracking-wider">KOFU ESCROW</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping"></span>
              </div>
              <div className="text-[11px] text-[#848494] bg-[#121217] px-2.5 py-1 rounded border border-[#1E1E28]">
                {agreement.escrowFunded ? (
                  <span className="text-[#00FF66] font-semibold">FUNDS LOCKED ($ {agreement.amount})</span>
                ) : (
                  <span className="text-[#FFB800]">ESCROW PENDING</span>
                )}
              </div>
              <div className="hidden md:flex absolute top-1/2 left-0 right-0 -z-0 h-[1px] bg-[#1E1E28]"></div>
            </div>

            {/* Counterparty */}
            <div className="p-3 bg-[#121217] border border-[#1E1E28] rounded">
              <div className="text-[10px] text-[#505060] uppercase tracking-wider mb-0.5">Counterparty / Seller</div>
              <div className="text-sm font-bold text-[#F3F3F6] truncate">{agreement.counterparty}</div>
              <div className="text-[10px] text-[#848494] mt-1 uppercase">({agreement.counterpartyType})</div>
            </div>
          </div>
        </div>

        {/* 4 Core Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-3 bg-[#121217]/60 border border-[#1E1E28] rounded">
            <span className="text-[#505060] text-[10px] uppercase block mb-1">Status</span>
            <span className="text-[#00FF66] font-bold text-sm tracking-wide">{agreement.status}</span>
          </div>

          <div className="p-3 bg-[#121217]/60 border border-[#1E1E28] rounded">
            <span className="text-[#505060] text-[10px] uppercase block mb-1">Condition</span>
            <span className="text-[#F3F3F6] font-medium text-xs truncate block" title={agreement.condition}>
              {agreement.condition}
            </span>
          </div>

          <div className="p-3 bg-[#121217]/60 border border-[#1E1E28] rounded">
            <span className="text-[#505060] text-[10px] uppercase block mb-1">Deadline</span>
            <span className="text-[#F3F3F6] font-medium text-xs">{agreement.deadline}</span>
          </div>

          <div className="p-3 bg-[#121217]/60 border border-[#1E1E28] rounded">
            <span className="text-[#505060] text-[10px] uppercase block mb-1">Autonomy</span>
            <span className="text-[#00FF66] font-bold text-xs">{agreement.autonomyLevel}</span>
          </div>
        </div>
      </div>

      {/* Lifecycle Stepper */}
      <div className="border border-[#1E1E28] bg-[#0D0D11] rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-[#848494]">
          <span className="font-semibold uppercase tracking-wider text-[#EDEDED]">Lifecycle State Tracker</span>
          <span className="text-[10px] text-[#505060]">PROGRAMMABLE ESCROW MACHINE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCurrent = agreement.status === step;
            const isPast = currentStepIndex > idx || agreement.status === 'SETTLED';

            return (
              <div
                key={step}
                className={`p-2.5 rounded border text-center transition-all ${
                  isCurrent
                    ? 'border-[#00FF66] bg-[#00FF66]/10 text-[#00FF66] font-bold shadow-[0_0_12px_rgba(0,255,102,0.2)] ring-1 ring-[#00FF66]/40'
                    : isPast
                    ? 'border-[#1E1E28] bg-[#121217] text-[#848494]'
                    : 'border-[#1E1E28]/40 bg-[#08080A] text-[#505060]'
                }`}
              >
                <div className="text-[9px] uppercase tracking-wider mb-0.5">Step 0{idx + 1}</div>
                <div className="text-[11px] font-semibold truncate">{step.replace('_', ' ')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Golden Path Actions */}
      <div className="border border-[#00FF66]/30 bg-[#00FF66]/[0.03] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#00FF66]" />
            <span className="text-xs font-bold text-[#F3F3F6] uppercase tracking-wider">
              Autonomous Action Controller
            </span>
          </div>
          <span className="text-[10px] text-[#00FF66] font-mono">NEXT STEP READY</span>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {agreement.status === 'NEGOTIATING' && (
            <button
              onClick={() => onOpenNegotiation(agreement)}
              className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00D154] text-[#08080A] font-bold text-xs rounded transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>OPEN AGENT NEGOTIATION SCREEN</span>
            </button>
          )}

          {agreement.status === 'AGREED' && (
            <button
              onClick={handleFundEscrow}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-bold text-xs rounded transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
            >
              {actionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Layers className="w-3.5 h-3.5" />
              )}
              <span>LOCK {agreement.amount.toFixed(2)} {agreement.currency} (SOROBAN ESCROW)</span>
            </button>
          )}

          {(agreement.status === 'ESCROWED' || agreement.status === 'MONITORING') && (
            <button
              onClick={handleSatisfyCondition}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-bold text-xs rounded transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
            >
              {actionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>MARK CONDITION SATISFIED (DEMO TRIGGER)</span>
            </button>
          )}

          {agreement.status === 'CONDITION_MET' && (
            <button
              onClick={handleReleasePayment}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-bold text-xs rounded transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
            >
              {actionLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>RELEASE PAYMENT TO {agreement.counterparty.toUpperCase()} ON STELLAR</span>
            </button>
          )}

          {agreement.status === 'SETTLED' && (
            <div className="flex items-center space-x-3 text-xs text-[#00FF66] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>AGREEMENT SETTLED &amp; CONFIRMED ON STELLAR SOROBAN</span>
            </div>
          )}

          {agreement.stellarTxHash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${agreement.stellarTxHash}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-[#121217] hover:bg-[#1E1E28] border border-[#1E1E28] hover:border-[#00FF66]/40 text-xs text-[#848494] hover:text-[#00FF66] rounded flex items-center space-x-1.5 transition-colors"
            >
              <span>View StellarExpert Tx</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {error && (
          <div className="p-2.5 rounded bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs">
            {error}
          </div>
        )}
      </div>

      {/* KOFU SENTINEL Live Activity & Monitoring Panel */}
      <div className="border border-[#1E1E28] bg-[#0D0D11] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E1E28]">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-pulse"></span>
            <div>
              <span className="text-sm font-bold text-[#F3F3F6] uppercase tracking-wider block">
                KOFU SENTINEL
              </span>
              <span className="text-[11px] text-[#848494]">
                Autonomous Observer &middot; {agreement.status === 'SETTLED' ? 'Settlement Complete' : 'Monitoring delivery condition'}
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-[#121217] border border-[#1E1E28] px-2.5 py-1 rounded text-[#848494]">
            HEARTBEAT: ACTIVE
          </span>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-3 pt-2">
          {events.length === 0 ? (
            <div className="text-xs text-[#505060] italic py-3">No activity recorded yet.</div>
          ) : (
            events.map((ev, i) => {
              const timeStr = new Date(ev.timestamp).toLocaleTimeString([], { hour12: false });
              return (
                <div
                  key={ev.id || i}
                  className="flex items-start space-x-3 text-xs p-2.5 rounded bg-[#08080A]/60 border border-[#1E1E28]/60 hover:border-[#1E1E28] transition-colors"
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
    </div>
  );
};
