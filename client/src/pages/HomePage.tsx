import React, { useState } from 'react';
import { ArrowRight, Terminal, Sparkles, Loader2 } from 'lucide-react';
import { ParsedAgreementInput } from '@poka/shared';
import { api } from '../lib/api';

interface HomePageProps {
  onParsed: (parsed: ParsedAgreementInput) => void;
  onOpenNegotiationDemo: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onParsed, onOpenNegotiationDemo }) => {
  const [prompt, setPrompt] = useState('Pay David 50 USDC when he delivers the website tomorrow.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const parsed = await api.parseAgreement(prompt);
      onParsed(parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to parse natural language agreement instruction.');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (presetText: string) => {
    setPrompt(presetText);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 sm:px-6 relative">
      {/* Background subtle radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#00FF66]/[0.025] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-2xl mx-auto text-center space-y-8 relative z-10">
        {/* Subtitle / System tag */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#121217] border border-[#1E1E28] text-[11px] font-mono text-[#848494]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]"></span>
          <span>POKA AUTONOMOUS PROTOCOL</span>
          <span className="text-[#00FF66]">STELLAR &amp; SOROBAN</span>
          <span className="text-[#505060]">v0.2</span>
        </div>

        {/* Central Large Prompt */}
        <h1 className="text-2xl sm:text-4xl font-mono font-medium tracking-tight text-[#EDEDED] leading-snug">
          What economic agreement <br className="hidden sm:inline" />
          are we creating?
        </h1>

        {/* Command Form */}
        <form onSubmit={handleSubmit} className="w-full relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#00FF66]/80 font-mono text-base">
              &gt;
            </div>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Pay David 50 USDC when he delivers the website tomorrow."
              className="w-full pl-9 pr-32 py-4 bg-[#0D0D11] border border-[#1E1E28] hover:border-[#2E2E3C] focus:border-[#00FF66] rounded text-[#EDEDED] placeholder-[#505060] font-mono text-sm sm:text-base outline-none transition-all shadow-2xl focus:ring-1 focus:ring-[#00FF66]/30"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute inset-y-2 right-2 px-4 sm:px-5 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-mono font-semibold text-xs tracking-wider rounded transition-all flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#08080A]" />
                  <span>PARSING</span>
                </>
              ) : (
                <>
                  <span>CREATE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 text-left p-2.5 rounded bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-mono">
              {error}
            </div>
          )}
        </form>

        {/* Subtle Shortcuts */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#848494]">
          <span className="text-[#505060] text-[11px] mr-1">EXAMPLES:</span>
          
          <button
            type="button"
            onClick={() => setPreset('Pay David 50 USDC when he delivers the website tomorrow.')}
            className="px-2.5 py-1 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#2E2E3C] text-[#848494] hover:text-[#EDEDED] transition-all"
          >
            [ Escrow 50 USDC ]
          </button>

          <button
            type="button"
            onClick={onOpenNegotiationDemo}
            className="px-2.5 py-1 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#00FF66]/30 hover:border-[#00FF66] text-[#00FF66] transition-all"
          >
            [ Agent Negotiation ]
          </button>

          <button
            type="button"
            onClick={() => setPreset('Send Research Agent 25 USDC once verified dataset is delivered.')}
            className="px-2.5 py-1 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#2E2E3C] text-[#848494] hover:text-[#EDEDED] transition-all"
          >
            [ Agent-to-Agent 25 USDC ]
          </button>

          <button
            type="button"
            onClick={() => setPreset('Release 100 XLM to Auditor once smart contract verification passes.')}
            className="px-2.5 py-1 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#2E2E3C] text-[#848494] hover:text-[#EDEDED] transition-all"
          >
            [ 100 XLM Audit Escrow ]
          </button>
        </div>

        {/* Minimalist philosophy footer notice */}
        <div className="pt-8 text-center text-[#505060] text-[11px] font-mono">
          <span>Natural-language promise</span>
          <span className="mx-2 text-[#848494]">→</span>
          <span>Sentinel monitoring</span>
          <span className="mx-2 text-[#848494]">→</span>
          <span>Soroban autonomous settlement</span>
        </div>
      </div>
    </div>
  );
};
