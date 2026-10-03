import React, { useState } from 'react';
import { ParsedAgreementInput, AutonomyLevel, Agreement } from '@poka/shared';
import { PolicyBadge } from '../components/PolicyBadge';
import { api } from '../lib/api';
import { ArrowLeft, CheckCircle2, Edit3, ShieldAlert, Cpu, Layers } from 'lucide-react';

interface CreateAgreementPageProps {
  initialParsed: ParsedAgreementInput;
  onBack: () => void;
  onAgreementCreated: (agreement: Agreement) => void;
}

export const CreateAgreementPage: React.FC<CreateAgreementPageProps> = ({
  initialParsed,
  onBack,
  onAgreementCreated,
}) => {
  const [counterparty, setCounterparty] = useState(initialParsed.counterparty);
  const [counterpartyType, setCounterpartyType] = useState<'human' | 'agent'>(initialParsed.counterpartyType);
  const [amount, setAmount] = useState(initialParsed.amount.toString());
  const initialCurr = initialParsed.currency === 'XLM' ? 'XLM' : initialParsed.currency === 'EURC' ? 'EURC' : 'USDC';
  const [currency, setCurrency] = useState<'USDC' | 'XLM' | 'EURC'>(initialCurr);
  const [condition, setCondition] = useState(initialParsed.condition);
  const [deadline, setDeadline] = useState(initialParsed.deadline);
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>(initialParsed.autonomyLevel || 'ASSISTED');
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const created = await api.createAgreement({
        counterparty,
        counterpartyType,
        amount: numAmount,
        currency,
        condition,
        deadline,
        autonomyLevel,
        startState: 'AGREED',
      });
      onAgreementCreated(created);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize agreement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#848494] hover:text-[#F3F3F6] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>CANCEL & RETURN</span>
      </button>

      {/* Header */}
      <div className="border border-[#1E1E28] bg-[#0D0D11] p-5 rounded space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66]"></span>
            <span className="text-xs font-mono font-bold tracking-widest text-[#00FF66] uppercase">
              POKA UNDERSTANDS
            </span>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-mono text-[#848494] hover:text-[#00FF66] flex items-center space-x-1 transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditing ? 'VIEW SUMMARY' : 'EDIT TERMS'}</span>
          </button>
        </div>
        <p className="text-xs font-mono text-[#848494] italic border-l-2 border-[#1E1E28] pl-3 py-1">
          "{initialParsed.rawText}"
        </p>
      </div>

      {/* Structured Terms Card */}
      <div className="border border-[#1E1E28] bg-[#0D0D11] rounded overflow-hidden">
        <div className="p-4 bg-[#121217] border-b border-[#1E1E28] flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-[#EDEDED] uppercase tracking-wider">
            Structured Agreement Terms
          </span>
          <span className="text-[11px] font-mono text-[#848494]">
            CONFIDENCE: {(initialParsed.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="p-6 space-y-5 font-mono text-sm">
          {/* Counterparty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center pb-4 border-b border-[#1E1E28]">
            <span className="text-xs text-[#848494] uppercase tracking-wider">Counterparty</span>
            <div className="sm:col-span-2">
              {isEditing ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={counterparty}
                    onChange={(e) => setCounterparty(e.target.value)}
                    className="w-full bg-[#08080A] border border-[#1E1E28] focus:border-[#00FF66] px-3 py-1.5 rounded text-sm text-[#F3F3F6] outline-none"
                  />
                  <select
                    value={counterpartyType}
                    onChange={(e) => setCounterpartyType(e.target.value as any)}
                    className="bg-[#08080A] border border-[#1E1E28] px-2 py-1.5 rounded text-xs text-[#848494] outline-none"
                  >
                    <option value="human">Human</option>
                    <option value="agent">AI Agent</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-[#F3F3F6] font-bold text-base">{counterparty}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E1E28] text-[#848494] uppercase">
                    {counterpartyType}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center pb-4 border-b border-[#1E1E28]">
            <span className="text-xs text-[#848494] uppercase tracking-wider">Amount</span>
            <div className="sm:col-span-2">
              {isEditing ? (
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-32 bg-[#08080A] border border-[#1E1E28] focus:border-[#00FF66] px-3 py-1.5 rounded text-sm text-[#F3F3F6] outline-none"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="bg-[#08080A] border border-[#1E1E28] px-3 py-1.5 rounded text-xs text-[#848494] outline-none"
                  >
                    <option value="USDC">USDC (Stellar)</option>
                    <option value="XLM">XLM (Native)</option>
                    <option value="EURC">EURC (Stellar)</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-[#00FF66]">
                    ${numAmount.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#848494]">({currency})</span>
                </div>
              )}
            </div>
          </div>

          {/* Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center pb-4 border-b border-[#1E1E28]">
            <span className="text-xs text-[#848494] uppercase tracking-wider">Condition</span>
            <div className="sm:col-span-2">
              {isEditing ? (
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-[#08080A] border border-[#1E1E28] focus:border-[#00FF66] px-3 py-1.5 rounded text-sm text-[#F3F3F6] outline-none"
                />
              ) : (
                <span className="text-[#F3F3F6] font-medium">{condition}</span>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center pb-4 border-b border-[#1E1E28]">
            <span className="text-xs text-[#848494] uppercase tracking-wider">Deadline</span>
            <div className="sm:col-span-2">
              {isEditing ? (
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#08080A] border border-[#1E1E28] focus:border-[#00FF66] px-3 py-1.5 rounded text-sm text-[#F3F3F6] outline-none"
                />
              ) : (
                <span className="text-[#F3F3F6] font-medium">{deadline}</span>
              )}
            </div>
          </div>

          {/* Escrow Required */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <span className="text-xs text-[#848494] uppercase tracking-wider">Escrow Required</span>
            <div className="sm:col-span-2 flex items-center space-x-2">
              <span className="text-[#00FF66] font-bold">${numAmount.toFixed(2)}</span>
              <span className="text-[11px] text-[#848494]">(To be locked on Celo Sepolia)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Autonomy Selection */}
      <PolicyBadge
        level={autonomyLevel}
        onChange={(lvl) => setAutonomyLevel(lvl)}
        interactive={true}
      />

      {error && (
        <div className="p-3 rounded bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-mono">
          {error}
        </div>
      )}

      {/* Action button */}
      <div className="pt-2">
        <button
          onClick={handleCreate}
          disabled={loading || numAmount <= 0}
          className="w-full py-4 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-mono font-bold text-sm tracking-wider uppercase rounded transition-all shadow-[0_0_20px_rgba(0,255,102,0.15)] flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>INITIALIZING AGREEMENT ON-CHAIN...</span>
          ) : (
            <>
              <span>CREATE AGREEMENT</span>
              <span className="text-xs text-[#08080A]/70">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
