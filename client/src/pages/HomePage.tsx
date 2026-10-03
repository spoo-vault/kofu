import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Sparkles,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Bot,
  User,
  Layers,
  Lock,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { ParsedAgreementInput } from '@kofu/shared';
import { api } from '../lib/api';

interface HomePageProps {
  onParsed: (parsed: ParsedAgreementInput) => void;
  onOpenNegotiationDemo: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  parsed?: ParsedAgreementInput;
  timestamp: string;
}

export const HomePage: React.FC<HomePageProps> = ({ onParsed, onOpenNegotiationDemo }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || prompt;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const parsed = await api.parseAgreement(text);

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        text: `I've analyzed your agreement instruction. Here are the structured parameters extracted by Gemini 2.0 and validated against your policy limits:`,
        parsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'agent',
        text: err?.message || 'Sorry, I could not parse those terms. Please specify an amount, asset (USDC/XLM), and condition.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    {
      title: 'Website Delivery',
      desc: 'Pay David 50 USDC when website is delivered tomorrow',
      text: 'Pay David 50 USDC when he delivers the website tomorrow.',
    },
    {
      title: 'Smart Contract Audit',
      desc: 'Release 100 XLM upon security verification completion',
      text: 'Release 100 XLM to Security Auditor once contract audit passes by next week.',
    },
    {
      title: 'AI Dataset Bounty',
      desc: 'Send Research Bot 25 EURC when dataset PR is merged',
      text: 'Send Research Bot 25 EURC once clean training dataset PR is merged on GitHub.',
    },
    {
      title: 'Bug Bounty Escrow',
      desc: 'Lock 75 USDC for critical vulnerability resolution',
      text: 'Pay 75 USDC to Bug Hunter once the patch is verified in staging.',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-4xl mx-auto px-4 font-sans">
      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State - Minimalist ChatGPT style greeting */
          <div className="h-full flex flex-col items-center justify-center text-center my-auto pb-8">
            <div className="w-12 h-12 rounded-xl border border-[#1E1E28] bg-white flex items-center justify-center p-1.5 shadow-[0_0_20px_rgba(0,255,102,0.15)] mb-4">
              <img src="/kofu-logo.png" alt="KOFU" className="w-full h-full object-contain" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#F3F3F6] mb-2 tracking-tight">
              What agreement would you like to create?
            </h2>
            <p className="text-xs sm:text-sm text-[#848494] max-w-md mx-auto mb-8 font-mono">
              Describe your terms in natural language. KOFU extracts conditions, enforces spend limits, and prepares Soroban escrow on Stellar.
            </p>

            {/* Quick Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl text-left font-mono">
              {quickPrompts.map((p) => (
                <button
                  key={p.title}
                  onClick={() => handleSend(p.text)}
                  className="p-3.5 rounded-xl bg-[#0D0D11] hover:bg-[#121217] border border-[#1E1E28] hover:border-[#00FF66]/40 transition-all text-left group cursor-pointer"
                >
                  <div className="text-xs font-semibold text-[#F3F3F6] group-hover:text-[#00FF66] transition-colors flex items-center justify-between">
                    <span>{p.title}</span>
                    <ArrowRight className="w-3 h-3 text-[#505060] group-hover:text-[#00FF66] transition-colors" />
                  </div>
                  <div className="text-[11px] text-[#848494] mt-1 font-sans truncate">
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Stream */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'agent' && (
                <div className="w-8 h-8 rounded-lg border border-[#1E1E28] bg-white flex items-center justify-center p-1 shrink-0 mt-0.5">
                  <img src="/kofu-logo.png" alt="KOFU" className="w-full h-full object-contain" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#1E1E28] text-[#F3F3F6] rounded-tr-none'
                    : 'bg-[#0D0D11] border border-[#1E1E28] text-[#F3F3F6] rounded-tl-none shadow-lg'
                }`}
              >
                <div className="text-sm leading-relaxed">{msg.text}</div>

                {/* Structured Agreement Card if present */}
                {msg.parsed && (
                  <div className="mt-4 pt-4 border-t border-[#1E1E28] font-mono text-xs space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded bg-[#121217] border border-[#1E1E28]">
                        <span className="text-[#848494] block text-[10px] uppercase">Amount &amp; Token</span>
                        <span className="text-[#00FF66] font-bold text-sm">
                          {msg.parsed.amount} {msg.parsed.currency}
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-[#121217] border border-[#1E1E28]">
                        <span className="text-[#848494] block text-[10px] uppercase">Counterparty</span>
                        <span className="text-[#F3F3F6] font-bold text-sm truncate block">
                          {msg.parsed.counterparty}
                        </span>
                        <span className="text-[10px] text-[#848494]">
                          {msg.parsed.counterpartyType === 'agent' ? 'AI Agent' : 'Human'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#121217] border border-[#1E1E28]">
                      <span className="text-[#848494] block text-[10px] uppercase">Deliverable Condition</span>
                      <span className="text-[#F3F3F6] font-medium text-xs font-sans mt-0.5 block">
                        {msg.parsed.condition}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-[#08080A] border border-[#1E1E28] text-[11px]">
                      <div className="flex items-center space-x-1.5 text-[#00FF66]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Policy Envelope: Under $100 Ceiling</span>
                      </div>
                      <span className="text-[#848494]">Soroban v22</span>
                    </div>

                    {/* Action buttons inside message */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        onClick={() => onParsed(msg.parsed!)}
                        className="px-4 py-2 bg-[#00FF66] hover:bg-[#00D154] text-[#08080A] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                      >
                        <span>Review &amp; Lock Escrow</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={onOpenNegotiationDemo}
                        className="px-3.5 py-2 bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#00FF66]/40 text-[#848494] hover:text-[#F3F3F6] text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Cpu className="w-3 h-3 text-[#00FF66]" />
                        <span>Negotiate with Agent</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-[#505060] font-mono mt-2 text-right">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-[#1E1E28] border border-[#2E2E3C] flex items-center justify-center text-[#848494] shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[#F3F3F6]" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg border border-[#1E1E28] bg-white flex items-center justify-center p-1 shrink-0">
              <img src="/kofu-logo.png" alt="KOFU" className="w-full h-full object-contain" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#0D0D11] border border-[#1E1E28] flex items-center space-x-2 text-xs font-mono text-[#848494]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00FF66]" />
              <span>Gemini 2.0 parsing terms &amp; verifying policy limits...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ChatGPT-Style Bottom Input Bar */}
      <div className="pb-4 pt-2">
        <div className="relative rounded-2xl bg-[#0D0D11] border border-[#1E1E28] focus-within:border-[#00FF66]/60 transition-colors shadow-2xl">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Describe an escrow agreement (e.g. Pay Alex 50 USDC when website PR is merged)..."
            className="w-full pl-4 pr-12 py-3.5 bg-transparent text-sm text-[#F3F3F6] placeholder-[#505060] focus:outline-none font-sans"
            autoFocus
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className={`absolute right-2 top-2 bottom-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              prompt.trim() && !loading
                ? 'bg-[#00FF66] text-[#08080A] shadow-[0_0_12px_rgba(0,255,102,0.3)] hover:scale-105'
                : 'bg-[#1E1E28] text-[#505060] cursor-not-allowed'
            }`}
            title="Send agreement prompt"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="text-[11px] font-mono text-[#505060] text-center mt-2 flex items-center justify-center space-x-2">
          <span>KOFU Agent enforces non-custodial Soroban escrows on Stellar.</span>
          <span>•</span>
          <span className="text-[#848494]">Instant testnet finality</span>
        </div>
      </div>
    </div>
  );
};
