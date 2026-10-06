import React, { useState } from 'react';
import { ParsedAgreementInput, AutonomyLevel, Agreement } from '@kofu/shared';
import { PolicyBadge } from '../components/PolicyBadge';
import { api } from '../lib/api';
import { ClientGeminiService } from '../lib/geminiClient';
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Sparkles,
  Loader2,
  Wand2,
  RefreshCw,
  Cpu,
  Layers,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface CreateAgreementPageProps {
  initialParsed: ParsedAgreementInput;
  onBack: () => void;
  onAgreementCreated: (agreement: Agreement) => void;
}

const PRESET_PROMPTS = [
  {
    label: 'Website Delivery ($50 USDC)',
    text: 'Pay David 50 USDC when website is delivered and passed QA tomorrow',
  },
  {
    label: 'Smart Contract Audit (100 XLM)',
    text: 'Release 100 XLM to Security Auditor once Soroban contract audit passes by Friday',
  },
  {
    label: 'AI Data Bounty (25 EURC)',
    text: 'Send Research Bot 25 EURC once clean training dataset PR is merged on GitHub',
  },
  {
    label: 'Bug Fix Escrow ($75 USDC)',
    text: 'Pay 75 USDC to Bug Hunter once critical patch is verified in staging within 48 hours',
  },
];

export const CreateAgreementPage: React.FC<CreateAgreementPageProps> = ({
  initialParsed,
  onBack,
  onAgreementCreated,
}) => {
  const [magicPrompt, setMagicPrompt] = useState(initialParsed.rawText || '');
  const [isParsingPrompt, setIsParsingPrompt] = useState(false);
  const [isRefiningCondition, setIsRefiningCondition] = useState(false);
  const [aiSuccessFeedback, setAiSuccessFeedback] = useState<string | null>(null);

  const [counterparty, setCounterparty] = useState(initialParsed.counterparty);
  const [counterpartyType, setCounterpartyType] = useState<'human' | 'agent'>(initialParsed.counterpartyType);
  const [amount, setAmount] = useState(initialParsed.amount.toString());
  const initialCurr = initialParsed.currency === 'XLM' ? 'XLM' : initialParsed.currency === 'EURC' ? 'EURC' : 'USDC';
  const [currency, setCurrency] = useState<'USDC' | 'XLM' | 'EURC'>(initialCurr);
  const [condition, setCondition] = useState(initialParsed.condition);
  const [deadline, setDeadline] = useState(initialParsed.deadline);
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>(initialParsed.autonomyLevel || 'ASSISTED');
  const [confidence, setConfidence] = useState<number>(initialParsed.confidence || 0.96);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;

  const handleMagicParse = async (overrideText?: string) => {
    const textToParse = (overrideText || magicPrompt).trim();
    if (!textToParse) return;

    setIsParsingPrompt(true);
    setError(null);
    setAiSuccessFeedback(null);

    try {
      const parsed = await api.parseAgreement(textToParse);
      setCounterparty(parsed.counterparty);
      setCounterpartyType(parsed.counterpartyType);
      setAmount(parsed.amount.toString());
      setCurrency(parsed.currency === 'XLM' ? 'XLM' : parsed.currency === 'EURC' ? 'EURC' : 'USDC');
      setCondition(parsed.condition);
      setDeadline(parsed.deadline);
      setConfidence(parsed.confidence || 0.98);
      if (parsed.autonomyLevel) {
        setAutonomyLevel(parsed.autonomyLevel);
      }
      setMagicPrompt(textToParse);
      setAiSuccessFeedback('Terms successfully parsed with Gemini 2.5!');
      setTimeout(() => setAiSuccessFeedback(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to parse prompt with Gemini AI');
    } finally {
      setIsParsingPrompt(false);
    }
  };

  const handleRefineCondition = async () => {
    if (!condition.trim()) return;

    setIsRefiningCondition(true);
    setAiSuccessFeedback(null);

    try {
      const refined = await ClientGeminiService.refineCondition(condition);
      setCondition(refined);
      setAiSuccessFeedback('Milestone condition refined by Gemini!');
      setTimeout(() => setAiSuccessFeedback(null), 4000);
    } catch (err: any) {
      console.warn('Condition refinement error:', err);
    } finally {
      setIsRefiningCondition(false);
    }
  };

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
        className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#848494] hover:text-[#F3F3F6] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>CANCEL &amp; RETURN</span>
      </button>

      {/* MAGIC AI PROMPT BAR (GEMINI 2.5 POWERED) */}
      <div className="border border-[#00FF66]/30 bg-gradient-to-b from-[#00FF66]/5 to-[#0D0D11] p-5 rounded-xl shadow-[0_0_25px_rgba(0,255,102,0.06)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#00FF66] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-[#00FF66] uppercase">
              Magic AI Escrow Prompt
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E1E28] text-[#848494] border border-[#2E2E38]">
              Gemini 2.5 Pro Powered
            </span>
          </div>

          {aiSuccessFeedback && (
            <span className="text-[11px] font-mono text-[#00FF66] flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{aiSuccessFeedback}</span>
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={magicPrompt}
              onChange={(e) => setMagicPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleMagicParse();
                }
              }}
              placeholder="e.g. Pay Bob 250 USDC when GitHub PR #42 is merged by Friday..."
              className="w-full bg-[#08080A] border border-[#1E1E28] focus:border-[#00FF66] px-3.5 py-2.5 rounded-lg text-sm text-[#F3F3F6] font-mono placeholder:text-[#505060] outline-none transition-all shadow-inner"
            />
          </div>

          <button
            type="button"
            onClick={() => handleMagicParse()}
            disabled={isParsingPrompt || !magicPrompt.trim()}
            className="px-4 py-2.5 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,255,102,0.2)] shrink-0"
          >
            {isParsingPrompt ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Gemini Parsing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Fill with Gemini</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1 text-[11px] font-mono">
          <span className="text-[#686878] text-[10px] uppercase tracking-wider mr-1">Instant Presets:</span>
          {PRESET_PROMPTS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setMagicPrompt(preset.text);
                handleMagicParse(preset.text);
              }}
              className="px-2.5 py-1 rounded-md bg-[#121217] hover:bg-[#1E1E28] text-[#A0A0B0] hover:text-[#00FF66] border border-[#1E1E28] hover:border-[#00FF66]/30 transition-all cursor-pointer truncate max-w-[220px]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Terms Card */}
      <div className="border border-[#1E1E28] bg-[#0D0D11] rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 bg-[#121217] border-b border-[#1E1E28] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold text-[#EDEDED] uppercase tracking-wider">
              Structured Escrow Parameters
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1E28] text-[#00FF66]">
              CONFIDENCE: {(confidence * 100).toFixed(0)}%
            </span>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-mono text-[#848494] hover:text-[#00FF66] flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditing ? 'LOCK FIELDS' : 'EDIT MANUALLY'}</span>
          </button>
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
                    {numAmount.toFixed(2)} {currency}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center pb-4 border-b border-[#1E1E28]">
            <span className="text-xs text-[#848494] uppercase tracking-wider">Condition</span>
            <div className="sm:col-span-2 space-y-2">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="flex-1 bg-[#08080A] border border-[#1E1E28] focus:border-[#00FF66] px-3 py-1.5 rounded text-sm text-[#F3F3F6] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleRefineCondition}
                    disabled={isRefiningCondition || !condition.trim()}
                    className="px-3 py-1.5 bg-[#121217] hover:bg-[#1E1E28] border border-[#1E1E28] hover:border-[#00FF66]/50 text-[#00FF66] text-xs font-mono rounded flex items-center space-x-1 cursor-pointer shrink-0 transition-all disabled:opacity-50"
                  >
                    {isRefiningCondition ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    <span>Refine with AI</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-[#F3F3F6] font-medium">{condition}</span>
                  <button
                    type="button"
                    onClick={handleRefineCondition}
                    disabled={isRefiningCondition || !condition.trim()}
                    className="ml-2 text-[11px] text-[#00FF66] hover:underline flex items-center space-x-1 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isRefiningCondition ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )}
                    <span>Refine with AI</span>
                  </button>
                </div>
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
              <span className="text-[#00FF66] font-bold">{numAmount.toFixed(2)} {currency}</span>
              <span className="text-[11px] text-[#848494]">(To be locked on Stellar Testnet Soroban)</span>
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
          className="w-full py-4 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-mono font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,102,0.15)] flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>INITIALIZING AGREEMENT ON-CHAIN...</span>
          ) : (
            <>
              <span>CREATE &amp; LOCK ON STELLAR</span>
              <span className="text-xs text-[#08080A]/70">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
