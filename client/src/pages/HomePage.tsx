import React, { useState } from 'react';
import {
  ArrowRight,
  Terminal,
  Sparkles,
  Loader2,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  Lock,
  ExternalLink,
  CheckCircle2,
  GitPullRequest,
  Coins,
  FileCode,
} from 'lucide-react';
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
    <div className="relative font-mono text-[#F3F3F6] overflow-hidden">
      {/* Background ambient radial aura */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#00FF66]/[0.035] blur-[150px] rounded-full pointer-events-none"></div>

      {/* Hero Section */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 max-w-5xl mx-auto text-center pt-8 pb-16 relative z-10">
        {/* System Pill Tag */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#121217] border border-[#1E1E28] text-[11px] mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
          <span className="text-[#848494] font-medium">KOFU PROTOCOL</span>
          <span className="text-[#505060]">&bull;</span>
          <span className="text-[#00FF66]">STELLAR &amp; SOROBAN</span>
          <span className="text-[#505060]">v0.2</span>
        </div>

        {/* Bold Minimalist Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-[#EDEDED] leading-[1.1] uppercase max-w-4xl mx-auto">
          MAKE PROMISES <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] via-[#A6FFCB] to-[#00FF66]">
            PROGRAMMABLE.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-[#848494] max-w-2xl mx-auto leading-relaxed">
          The autonomous economic agreement engine for Stellar. Turn natural language commitments into self-enforcing Soroban smart escrows with automated Sentinel verification.
        </p>

        {/* Interactive Command Terminal Input */}
        <div className="w-full max-w-3xl mt-10">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#00FF66] font-bold text-base">
                &gt;
              </div>

              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Pay David 50 USDC when he delivers the website tomorrow."
                className="w-full pl-9 pr-36 py-4 sm:py-5 bg-[#0D0D11] border border-[#1E1E28] hover:border-[#2E2E3C] focus:border-[#00FF66] rounded-lg text-[#EDEDED] placeholder-[#505060] text-sm sm:text-base outline-none transition-all shadow-2xl focus:ring-1 focus:ring-[#00FF66]/30"
                autoFocus
              />

              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="absolute inset-y-2 right-2 px-4 sm:px-6 bg-[#00FF66] hover:bg-[#00D154] disabled:bg-[#1E1E28] disabled:text-[#505060] text-[#08080A] font-bold text-xs tracking-wider rounded-md transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)] disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#08080A]" />
                    <span>PARSING</span>
                  </>
                ) : (
                  <>
                    <span>INITIALIZE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-3 text-left p-3 rounded bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs">
                {error}
              </div>
            )}
          </form>

          {/* Quick Example Presets */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[#848494]">
            <span className="text-[#505060] text-[11px] mr-1">QUICK START:</span>

            <button
              type="button"
              onClick={() => setPreset('Pay David 50 USDC when he delivers the website tomorrow.')}
              className="px-2.5 py-1 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#2E2E3C] text-[#848494] hover:text-[#EDEDED] transition-all cursor-pointer"
            >
              50 USDC Website Escrow
            </button>

            <button
              type="button"
              onClick={() => setPreset('Release 100 XLM to Auditor once smart contract verification passes.')}
              className="px-2.5 py-1 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#2E2E3C] text-[#848494] hover:text-[#EDEDED] transition-all cursor-pointer"
            >
              100 XLM Contract Audit
            </button>

            <button
              type="button"
              onClick={() => setPreset('Send Research Agent 25 USDC once verified dataset is delivered.')}
              className="px-2.5 py-1 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#2E2E3C] text-[#848494] hover:text-[#EDEDED] transition-all cursor-pointer"
            >
              Agent-to-Agent 25 USDC
            </button>

            <button
              type="button"
              onClick={onOpenNegotiationDemo}
              className="px-2.5 py-1 rounded bg-[#121217] hover:bg-[#1A1A22] border border-[#00FF66]/30 hover:border-[#00FF66] text-[#00FF66] transition-all cursor-pointer flex items-center space-x-1"
            >
              <Cpu className="w-3 h-3 text-[#00FF66]" />
              <span>Simulate Agent Negotiation</span>
            </button>
          </div>
        </div>

        {/* Live Protocol Metric Ribbons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-14 pt-8 border-t border-[#1E1E28]/60 text-left">
          <div className="p-4 rounded-lg bg-[#0D0D11] border border-[#1E1E28]">
            <div className="flex items-center space-x-1.5 text-xs text-[#848494] mb-1">
              <Zap className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>FINALITY</span>
            </div>
            <div className="text-xl font-bold text-[#F3F3F6]">&lt; 1 Second</div>
            <div className="text-[10px] text-[#505060] mt-0.5">Stellar Sub-second Consensus</div>
          </div>

          <div className="p-4 rounded-lg bg-[#0D0D11] border border-[#1E1E28]">
            <div className="flex items-center space-x-1.5 text-xs text-[#848494] mb-1">
              <Coins className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>TRANSACTION FEE</span>
            </div>
            <div className="text-xl font-bold text-[#00FF66]">&lt; $0.0001</div>
            <div className="text-[10px] text-[#505060] mt-0.5">Micro-payment Viable</div>
          </div>

          <div className="p-4 rounded-lg bg-[#0D0D11] border border-[#1E1E28]">
            <div className="flex items-center space-x-1.5 text-xs text-[#848494] mb-1">
              <Lock className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>ESCROW CONTRACT</span>
            </div>
            <div className="text-xl font-bold text-[#F3F3F6]">Soroban Wasm</div>
            <div className="text-[10px] text-[#505060] mt-0.5">Rust-compiled Protocol 22</div>
          </div>

          <div className="p-4 rounded-lg bg-[#0D0D11] border border-[#1E1E28]">
            <div className="flex items-center space-x-1.5 text-xs text-[#848494] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>POLICY ENGINE</span>
            </div>
            <div className="text-xl font-bold text-[#F3F3F6]">$100 Spend Cap</div>
            <div className="text-[10px] text-[#505060] mt-0.5">Autonomous Guardrails</div>
          </div>
        </div>
      </section>

      {/* The 3-Step Lifecycle Visualizer */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#1E1E28]">
        <div className="text-center space-y-3 mb-12">
          <div className="text-[11px] font-bold text-[#00FF66] uppercase tracking-widest">
            THE PROGRAMMABLE ESCROW LOOP
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#EDEDED] tracking-tight uppercase">
            How KOFU Works
          </h2>
          <p className="text-xs sm:text-sm text-[#848494] max-w-xl mx-auto">
            From informal natural language agreements to cryptographic on-chain release in 3 deterministic steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-lg bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/40 transition-colors space-y-4">
            <div className="w-8 h-8 rounded bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-xs font-bold text-[#00FF66]">
              01
            </div>
            <h3 className="text-base font-bold text-[#F3F3F6]">Natural Language Intent</h3>
            <p className="text-xs text-[#848494] leading-relaxed">
              Enter your terms in everyday language. POKA's dual parser (Gemini 2.0 + Deterministic heuristics) extracts amounts, currency, SLAs, counterparties, and strict policy envelopes.
            </p>
            <div className="p-2.5 rounded bg-[#08080A] border border-[#1E1E28] text-[11px] text-[#505060]">
              &gt; "Pay 50 USDC when website PR merged"
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-lg bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/40 transition-colors space-y-4">
            <div className="w-8 h-8 rounded bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-xs font-bold text-[#00FF66]">
              02
            </div>
            <h3 className="text-base font-bold text-[#F3F3F6]">Trustless Soroban Lockbox</h3>
            <p className="text-xs text-[#848494] leading-relaxed">
              Funds are locked into the native Rust Soroban escrow contract on Stellar. The buyer can never unilaterally cancel, and the seller knows payment is mathematically guaranteed.
            </p>
            <div className="p-2.5 rounded bg-[#08080A] border border-[#1E1E28] text-[11px] text-[#00FF66]">
              &gt; deposit(50 USDC, timeout: #1249000)
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-lg bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/40 transition-colors space-y-4">
            <div className="w-8 h-8 rounded bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-xs font-bold text-[#00FF66]">
              03
            </div>
            <h3 className="text-base font-bold text-[#F3F3F6]">Sentinel Autonomous Release</h3>
            <p className="text-xs text-[#848494] leading-relaxed">
              The POKA Sentinel daemon continuously monitors condition signals (GitHub webhooks, API telemetry, or cryptographic delivery proofs) and automatically invokes settlement.
            </p>
            <div className="p-2.5 rounded bg-[#08080A] border border-[#1E1E28] text-[11px] text-[#848494]">
              &gt; settle() ➔ Payment Released to Seller
            </div>
          </div>
        </div>
      </section>

      {/* Stellar & Soroban Foundation Pillars */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#1E1E28]">
        <div className="p-8 rounded-xl bg-gradient-to-b from-[#121217] to-[#0D0D11] border border-[#1E1E28] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] text-[#00FF66] font-bold uppercase tracking-widest mb-1">
                BUILT NATIVELY ON STELLAR
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F3F3F6]">
                Why Stellar &amp; Soroban?
              </h2>
            </div>
            <a
              href="https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#08080A] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#00FF66]/50 rounded text-xs text-[#848494] hover:text-[#00FF66] transition-all self-start md:self-auto"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Inspect Soroban Contract on StellarExpert</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-xs text-[#848494]">
            <div className="space-y-1.5">
              <span className="font-bold text-[#EDEDED] block text-sm">Real-World Stablecoins</span>
              <p>Direct settlement in Circle USDC and EURC with worldwide local currency on-ramps via Stellar anchors.</p>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-[#EDEDED] block text-sm">Zero-Friction Micro-deals</span>
              <p>Fractions of a cent in fees enable micro-task bounties ($5 to $50) that are impossible on gas-heavy chains.</p>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-[#EDEDED] block text-sm">WebAssembly Sandboxing</span>
              <p>Soroban's lightweight Rust Wasm engine provides deterministic execution and strict cryptographic auth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 max-w-5xl mx-auto border-t border-[#1E1E28] text-xs text-[#505060] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>KOFU Protocol &middot; Open Source on </span>
          <a
            href="https://github.com/spoo-vault/kofu"
            target="_blank"
            rel="noreferrer"
            className="text-[#848494] hover:text-[#00FF66] transition-colors"
          >
            GitHub (spoo-vault/kofu)
          </a>
        </div>

        <div className="flex items-center space-x-6 text-[11px] text-[#848494]">
          <a
            href="https://communityfund.stellar.org/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#00FF66] transition-colors"
          >
            Stellar Community Fund
          </a>
          <a
            href="https://freighter.app/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#00FF66] transition-colors"
          >
            Freighter Wallet
          </a>
          <span className="text-[#00FF66]">v0.2-STELLAR</span>
        </div>
      </footer>
    </div>
  );
};
