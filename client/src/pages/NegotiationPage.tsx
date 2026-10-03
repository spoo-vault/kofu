import React, { useState, useEffect } from 'react';
import { NegotiationMessage, Agreement } from '@poka/shared';
import { api } from '../lib/api';
import { Cpu, ShieldCheck, Check, ArrowRight, Play, RefreshCw, Layers } from 'lucide-react';

interface NegotiationPageProps {
  onAgreementCreated: (agreement: Agreement) => void;
  targetAgreement?: Agreement | null;
}

export const NegotiationPage: React.FC<NegotiationPageProps> = ({
  onAgreementCreated,
  targetAgreement,
}) => {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [negotiating, setNegotiating] = useState<boolean>(false);
  const [agreementReached, setAgreementReached] = useState<boolean>(false);
  const [finalAmount, setFinalAmount] = useState<number>(65);
  const [creating, setCreating] = useState<boolean>(false);

  const script: NegotiationMessage[] = [
    {
      id: 'm1',
      sender: 'KOFU BUYER AGENT',
      senderRole: 'buyer_agent',
      content: '$50 upon completion of website delivery.',
      proposedAmount: 50,
      timestamp: '09:31:02',
      isOffer: true,
    },
    {
      id: 'm2',
      sender: 'DAVID SELLER AGENT',
      senderRole: 'seller_agent',
      content: 'Current developer compute load high. Counter-offer: $70 for rapid priority sprint.',
      proposedAmount: 70,
      timestamp: '09:31:05',
      isOffer: true,
    },
    {
      id: 'm3',
      sender: 'KOFU BUYER AGENT',
      senderRole: 'buyer_agent',
      content: '$60 base + $5 completion bonus if verified and delivered within 24 hours.',
      proposedAmount: 65,
      timestamp: '09:31:08',
      isOffer: true,
    },
    {
      id: 'm4',
      sender: 'DAVID SELLER AGENT',
      senderRole: 'seller_agent',
      content: 'Accepted. SLA parameters committed to cryptographic agreement.',
      proposedAmount: 65,
      timestamp: '09:31:10',
      isAccepted: true,
    },
  ];

  const runNegotiationSequence = () => {
    setMessages([]);
    setCurrentStep(0);
    setAgreementReached(false);
    setNegotiating(true);

    script.forEach((msg, idx) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, msg]);
        setCurrentStep(idx + 1);
        if (idx === script.length - 1) {
          setNegotiating(false);
          setAgreementReached(true);
        }
      }, (idx + 1) * 900);
    });
  };

  useEffect(() => {
    runNegotiationSequence();
  }, []);

  const handleCommitAgreement = async () => {
    setCreating(true);
    try {
      const created = await api.createAgreement({
        counterparty: 'David (via Autonomous Agent)',
        counterpartyType: 'agent',
        amount: finalAmount,
        currency: 'USDC',
        condition: 'Website delivered within 24 hour SLA',
        deadline: '24 Hours',
        autonomyLevel: 'AUTONOMOUS',
        startState: 'AGREED',
      });
      onAgreementCreated(created);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-mono">
      {/* Header */}
      <div className="border border-[#1E1E28] bg-[#0D0D11] p-6 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Cpu className="w-5 h-5 text-[#00FF66]" />
            <h1 className="text-lg font-bold text-[#F3F3F6] tracking-wider uppercase">
              Autonomous Agent Negotiation Protocol
            </h1>
          </div>
          <button
            onClick={runNegotiationSequence}
            disabled={negotiating}
            className="flex items-center space-x-1.5 text-xs text-[#848494] hover:text-[#00FF66] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${negotiating ? 'animate-spin' : ''}`} />
            <span>RE-RUN NEGOTIATION</span>
          </button>
        </div>
        <p className="text-xs text-[#848494] leading-relaxed">
          Two independent economic agents autonomously bargaining terms within user-defined policy limits ($100 cap, $75 max autonomous negotiation).
        </p>
      </div>

      {/* Agents Telemetry Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer Agent Box */}
        <div className="p-4 bg-[#0D0D11] border border-[#1E1E28] rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#00FF66] font-bold tracking-wider uppercase">
              POKA Buyer Agent
            </span>
            <span className="text-[10px] text-[#848494] bg-[#121217] px-2 py-0.5 rounded border border-[#1E1E28]">
              0x71C...49b
            </span>
          </div>
          <div className="text-xs text-[#848494] space-y-1">
            <div>Target: Website delivery</div>
            <div>Strategy: Concession with time-bound bonus</div>
            <div className="text-[10px] text-[#505060]">Policy ceiling: $75.00</div>
          </div>
        </div>

        {/* Seller Agent Box */}
        <div className="p-4 bg-[#0D0D11] border border-[#1E1E28] rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#848494] font-bold tracking-wider uppercase">
              David Counterparty Agent
            </span>
            <span className="text-[10px] text-[#848494] bg-[#121217] px-2 py-0.5 rounded border border-[#1E1E28]">
              0x489...11A
            </span>
          </div>
          <div className="text-xs text-[#848494] space-y-1">
            <div>Target: Maximize rate for 24h turnaround</div>
            <div>Strategy: Counter-bid anchored to urgency</div>
            <div className="text-[10px] text-[#505060]">Min acceptable: $60.00</div>
          </div>
        </div>
      </div>

      {/* Structured Negotiation Feed (Technical, not chat-like) */}
      <div className="border border-[#1E1E28] bg-[#08080A] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E1E28] text-xs text-[#848494]">
          <span className="uppercase tracking-wider">Protocol Message Stream</span>
          <span>{negotiating ? 'BARGAINING IN PROGRESS...' : 'SESSION CONCLUDED'}</span>
        </div>

        <div className="space-y-4">
          {messages.map((m, i) => {
            const isBuyer = m.senderRole === 'buyer_agent';
            return (
              <div
                key={m.id || i}
                className={`p-4 rounded border transition-all animate-fade-in ${
                  isBuyer
                    ? 'border-[#00FF66]/30 bg-[#00FF66]/[0.02]'
                    : 'border-[#1E1E28] bg-[#0D0D11]'
                }`}
              >
                <div className="flex items-center justify-between mb-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-bold tracking-wider text-[11px] ${
                        isBuyer ? 'text-[#00FF66]' : 'text-[#F3F3F6]'
                      }`}
                    >
                      {m.sender}
                    </span>
                    <span className="text-[#505060] text-[10px]">&bull; {m.timestamp}</span>
                  </div>
                  {m.proposedAmount && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        isBuyer ? 'bg-[#00FF66]/20 text-[#00FF66]' : 'bg-[#1E1E28] text-[#EDEDED]'
                      }`}
                    >
                      ${m.proposedAmount}
                    </span>
                  )}
                </div>
                <div className="text-sm text-[#EDEDED] pl-1 font-mono leading-relaxed">
                  "{m.content}"
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Consensus Box */}
        {agreementReached && (
          <div className="mt-6 p-6 border-2 border-[#00FF66] bg-[#0D0D11] rounded-lg text-center space-y-4 shadow-[0_0_25px_rgba(0,255,102,0.15)] animate-fade-in">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#00FF66]/10 text-[#00FF66] text-xs font-bold tracking-wider uppercase">
              <Check className="w-3.5 h-3.5" />
              <span>AGREEMENT REACHED</span>
            </div>

            <div className="space-y-1">
              <div className="text-4xl font-bold text-[#00FF66]">${finalAmount}</div>
              <div className="text-xs text-[#848494]">Website delivered &middot; 24 hour deadline</div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCommitAgreement}
                disabled={creating}
                className="px-8 py-3 bg-[#00FF66] hover:bg-[#00D154] text-[#08080A] font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)] cursor-pointer"
              >
                {creating ? 'COMMITTING TO ESCROW...' : 'CREATE AGREEMENT (#POKA-001)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
