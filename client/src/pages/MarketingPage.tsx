import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Lock,
  Coins,
  FileCode,
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  GitPullRequest,
  Check,
  Code2,
  Users,
  Bot
} from 'lucide-react';
import { ParsedAgreementInput } from '@kofu/shared';

interface MarketingPageProps {
  onLaunchApp: () => void;
  onTestPrompt: (prompt: string) => void;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({ onLaunchApp, onTestPrompt }) => {
  const [activePersona, setActivePersona] = useState<'agents' | 'freelancers' | 'daos'>('agents');
  const [demoPrompt, setDemoPrompt] = useState('Pay David 50 USDC when he delivers the website tomorrow.');
  const [simulatedParsed, setSimulatedParsed] = useState<ParsedAgreementInput>({
    counterparty: 'David',
    counterpartyType: 'human',
    amount: 50,
    currency: 'USDC',
    condition: 'Delivers the website',
    deadline: 'Tomorrow 5:00 PM UTC',
    escrowRequired: true,
    rawText: 'Pay David 50 USDC when he delivers the website tomorrow.',
    confidence: 0.96,
    autonomyLevel: 'ASSISTED',
  });

  const promptPresets = [
    {
      label: 'Website Delivery',
      prompt: 'Pay David 50 USDC when he delivers the website tomorrow.',
      amount: 50,
      currency: 'USDC' as const,
      counterparty: 'David',
      condition: 'Delivers the website',
      type: 'human' as const,
    },
    {
      label: 'Smart Contract Audit',
      prompt: 'Release 100 XLM to Security Auditor once verification report is verified.',
      amount: 100,
      currency: 'XLM' as const,
      counterparty: 'Security Auditor',
      condition: 'Verification report verified',
      type: 'agent' as const,
    },
    {
      label: 'AI Agent Dataset',
      prompt: 'Send Research Bot 25 EURC once clean training dataset PR is merged.',
      amount: 25,
      currency: 'EURC' as const,
      counterparty: 'Research Bot',
      condition: 'Training dataset PR merged',
      type: 'agent' as const,
    },
  ];

  const handleSelectPreset = (preset: typeof promptPresets[0]) => {
    setDemoPrompt(preset.prompt);
    setSimulatedParsed({
      counterparty: preset.counterparty,
      counterpartyType: preset.type,
      amount: preset.amount,
      currency: preset.currency,
      condition: preset.condition,
      deadline: '24 Hours',
      escrowRequired: true,
      rawText: preset.prompt,
      confidence: 0.98,
      autonomyLevel: preset.type === 'agent' ? 'AUTONOMOUS' : 'ASSISTED',
    });
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTestPrompt(demoPrompt);
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F3F3F6] font-sans selection:bg-[#00FF66]/20 selection:text-[#00FF66]">
      {/* Glow Ambient Lights */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#00FF66]/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[600px] right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#00FF66]/5 to-transparent blur-[160px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Grant Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#121217] border border-[#00FF66]/30 text-xs font-mono mb-8 shadow-[0_0_20px_rgba(0,255,102,0.12)]">
          <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse shadow-[0_0_8px_#00FF66]" />
          <span className="text-[#F3F3F6] font-semibold tracking-wide">STELLAR COMMUNITY FUND (SCF) BUILD AWARD</span>
          <span className="text-[#848494]">•</span>
          <span className="text-[#00FF66] font-medium">SOROBAN v22</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F3F3F6] max-w-5xl mx-auto leading-[1.1] mb-6">
          Make Promises <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] via-[#70FF9A] to-[#00D154]">Programmable.</span>
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-[#848494] max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          The autonomous economic agreement protocol on <strong className="text-[#F3F3F6]">Stellar</strong> and <strong className="text-[#F3F3F6]">Soroban</strong>.
          Turn natural-language commitments into self-verifying, trustless smart escrows with instant finality and sub-cent fees.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={onLaunchApp}
            className="px-8 py-4 rounded-lg bg-[#00FF66] hover:bg-[#00D154] text-[#08080A] font-bold text-sm uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(0,255,102,0.3)] hover:shadow-[0_0_40px_rgba(0,255,102,0.45)] flex items-center space-x-2.5 cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>Launch Protocol App</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://github.com/spoo-vault/kofu"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-4 rounded-lg bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] hover:border-[#00FF66]/50 text-sm font-mono text-[#F3F3F6] transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-[#00FF66]" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#848494]" />
          </a>

          <a
            href="#how-it-works"
            className="px-6 py-4 rounded-lg bg-transparent hover:bg-[#121217] text-sm font-mono text-[#848494] hover:text-[#F3F3F6] transition-all flex items-center space-x-1"
          >
            <span>How it Works</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Live Interactive Simulator Card */}
        <div className="max-w-4xl mx-auto rounded-xl bg-[#0D0D11]/90 border border-[#1E1E28] p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-left">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1E1E28]">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
              <span className="text-xs font-mono text-[#848494] pl-2">KOFU Intent Simulator — Live Interactive Demo</span>
            </div>
            <span className="text-[11px] font-mono text-[#00FF66] bg-[#00FF66]/10 px-2.5 py-0.5 rounded border border-[#00FF66]/20">
              No Wallet Required
            </span>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-mono text-[#848494]">Quick Presets:</span>
            {promptPresets.map((p) => (
              <button
                key={p.label}
                onClick={() => handleSelectPreset(p)}
                className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${
                  demoPrompt === p.prompt
                    ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40'
                    : 'bg-[#121217] text-[#848494] hover:text-[#F3F3F6] border border-[#1E1E28]'
                }`}
              >
                {p.label} ({p.amount} {p.currency})
              </button>
            ))}
          </div>

          {/* Prompt input */}
          <form onSubmit={handleSimulateSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={demoPrompt}
                onChange={(e) => setDemoPrompt(e.target.value)}
                className="w-full bg-[#08080A] border border-[#1E1E28] focus:border-[#00FF66] rounded-lg px-4 py-3.5 text-sm font-mono text-[#F3F3F6] focus:outline-none transition-colors"
                placeholder="Enter an agreement in natural language..."
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-4 bg-[#00FF66] hover:bg-[#00D154] text-[#08080A] font-bold text-xs uppercase tracking-wider rounded font-mono transition-all flex items-center space-x-1"
              >
                <span>Execute In App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Real-time Intent Decomposition Grid */}
          <div className="mt-6 pt-6 border-t border-[#1E1E28] grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 rounded bg-[#121217] border border-[#1E1E28]">
              <span className="text-[#848494] block text-[10px] uppercase">Lock Value</span>
              <span className="text-[#00FF66] font-bold text-sm mt-0.5 block">
                {simulatedParsed.amount} {simulatedParsed.currency}
              </span>
              <span className="text-[10px] text-[#505060]">Stellar Asset</span>
            </div>

            <div className="p-3 rounded bg-[#121217] border border-[#1E1E28]">
              <span className="text-[#848494] block text-[10px] uppercase">Counterparty</span>
              <span className="text-[#F3F3F6] font-bold text-sm mt-0.5 block truncate">
                {simulatedParsed.counterparty}
              </span>
              <span className="text-[10px] text-[#00FF66]">
                {simulatedParsed.counterpartyType === 'agent' ? 'Autonomous Bot' : 'Human Recipient'}
              </span>
            </div>

            <div className="p-3 rounded bg-[#121217] border border-[#1E1E28]">
              <span className="text-[#848494] block text-[10px] uppercase">Policy Guardrail</span>
              <span className="text-[#00FF66] font-bold text-sm mt-0.5 block">
                APPROVED
              </span>
              <span className="text-[10px] text-[#505060]">Under $100 Ceiling</span>
            </div>

            <div className="p-3 rounded bg-[#121217] border border-[#1E1E28]">
              <span className="text-[#848494] block text-[10px] uppercase">Soroban Wasm</span>
              <span className="text-[#F3F3F6] font-bold text-sm mt-0.5 block">
                ESCROW ACTIVE
              </span>
              <span className="text-[10px] text-[#00FF66]">Sentinel Listening</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stellar Proof & Metrics Strip */}
      <section className="border-y border-[#1E1E28] bg-[#0A0A0E] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center font-mono">
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-[#00FF66] mb-1">&lt; $0.0001</div>
            <div className="text-xs text-[#848494] uppercase tracking-wider">Average Stellar Tx Fee</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-[#F3F3F6] mb-1">~4 Seconds</div>
            <div className="text-xs text-[#848494] uppercase tracking-wider">Deterministic Finality</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-[#00FF66] mb-1">100% Rust</div>
            <div className="text-xs text-[#848494] uppercase tracking-wider">Native Soroban Contract</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-[#F3F3F6] mb-1">USDC &amp; XLM</div>
            <div className="text-xs text-[#848494] uppercase tracking-wider">Multi-Currency Escrows</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-[#00FF66] mb-3">About KOFU Protocol</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F3F3F6] tracking-tight mb-6">
            Bridging the Gap Between Everyday Human Intent and On-Chain Settlement
          </h2>
          <p className="text-base text-[#848494] leading-relaxed">
            In freelancing, digital services, and autonomous AI workflows, commitments are expressed in natural language.
            Traditional contracts are too slow and costly for micro-deals ($10–$500), while standard Web3 escrows require complex manual signing and constant oversight.
            KOFU makes promises programmable, auditable, and autonomously enforceable on Stellar.
          </p>
        </div>

        {/* Persona Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-lg bg-[#121217] border border-[#1E1E28]">
            <button
              onClick={() => setActivePersona('agents')}
              className={`px-4 py-2 rounded text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
                activePersona === 'agents'
                  ? 'bg-[#00FF66] text-[#08080A]'
                  : 'text-[#848494] hover:text-[#F3F3F6]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>For AI Agent Economy</span>
            </button>
            <button
              onClick={() => setActivePersona('freelancers')}
              className={`px-4 py-2 rounded text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
                activePersona === 'freelancers'
                  ? 'bg-[#00FF66] text-[#08080A]'
                  : 'text-[#848494] hover:text-[#F3F3F6]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>For Freelancers &amp; Gigs</span>
            </button>
            <button
              onClick={() => setActivePersona('daos')}
              className={`px-4 py-2 rounded text-xs font-mono font-medium transition-all flex items-center space-x-2 ${
                activePersona === 'daos'
                  ? 'bg-[#00FF66] text-[#08080A]'
                  : 'text-[#848494] hover:text-[#F3F3F6]'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>For DAOs &amp; Bounties</span>
            </button>
          </div>
        </div>

        {/* Persona Details Card */}
        <div className="max-w-4xl mx-auto rounded-xl bg-[#0D0D11] border border-[#1E1E28] p-8 lg:p-10">
          {activePersona === 'agents' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[11px] font-mono text-[#00FF66] uppercase tracking-wider block mb-2">Autonomous Machine Commerce</span>
                <h3 className="text-2xl font-bold text-[#F3F3F6] mb-4">Give Autonomous Agents the Power to Contract and Pay Safely</h3>
                <p className="text-sm text-[#848494] leading-relaxed mb-6">
                  AI agents running on frameworks like AutoGen, CrewAI, and LangChain can establish enforceable deals without handing over unrestricted wallets.
                  KOFU enforces strict human policy envelopes—capping maximum spending, automating SLA counter-offers, and locking micro-funds into Soroban.
                </p>
                <div className="space-y-2 text-xs font-mono text-[#F3F3F6]">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#00FF66]" />
                    <span>Bounded spending ceilings ($100 max tx limit)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#00FF66]" />
                    <span>Autonomous agent-to-agent counter-offers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#00FF66]" />
                    <span>Standardized Model Context Protocol (MCP) support</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#08080A] border border-[#1E1E28] font-mono text-xs space-y-2">
                <div className="text-[#505060]">// Agent Negotiation Log</div>
                <div className="text-[#00FF66]">&gt; [Buyer Agent]: "Offer 50 USDC for dataset delivery"</div>
                <div className="text-[#848494]">&gt; [Seller Agent]: "Counter-offer 65 USDC for 2h SLA"</div>
                <div className="text-[#00FF66]">&gt; [Policy Engine]: "Checked ceiling ($75 max). APPROVED."</div>
                <div className="text-[#F3F3F6]">&gt; [Soroban Escrow]: "Deposit locked on Stellar Testnet."</div>
              </div>
            </div>
          )}

          {activePersona === 'freelancers' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[11px] font-mono text-[#00FF66] uppercase tracking-wider block mb-2">Guaranteed Client Payments</span>
                <h3 className="text-2xl font-bold text-[#F3F3F6] mb-4">Never Work for Free Again. Escrow Locked Before You Begin.</h3>
                <p className="text-sm text-[#848494] leading-relaxed mb-6">
                  Freelancers and developers often face delayed or reneged payments. With KOFU, clients lock USDC or XLM directly into a native Soroban smart contract.
                  Neither party can cheat: once your milestone proof is verified, payment releases instantaneously.
                </p>
                <div className="space-y-2 text-xs font-mono text-[#F3F3F6]">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#00FF66]" />
                    <span>Zero platform commissions (pure Stellar network cost &lt; $0.0001)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#00FF66]" />
                    <span>Automated milestone payouts with verifiable telemetry</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#00FF66]" />
                    <span>Freighter browser wallet support</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#08080A] border border-[#1E1E28] font-mono text-xs space-y-2">
                <div className="text-[#505060]">// Milestone Agreement Status</div>
                <div className="text-[#F3F3F6]">&gt; Agreement: KOFU-001 (Web App UI)</div>
                <div className="text-[#00FF66]">&gt; Funds: 50.00 USDC [LOCKED IN SOROBAN]</div>
                <div className="text-[#848494]">&gt; Timeout: Ledger #1249000 (Refund safeguard)</div>
                <div className="text-[#00FF66]">&gt; Sentinel Status: Awaiting delivery signal...</div>
              </div>
            </div>
          )}

          {activePersona === 'daos' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[11px] font-mono text-[#00FF66] uppercase tracking-wider block mb-2">Automated Contributor Rewards</span>
                <h3 className="text-2xl font-bold text-[#F3F3F6] mb-4">Automate GitHub PR Bounties Without Manual Overhead</h3>
                <p className="text-sm text-[#848494] leading-relaxed mb-6">
                  DAO grant managers and maintainers can lock bounties for open source issues.
                  The KOFU Sentinel monitors GitHub webhooks and automatically releases funds to the contributor's Stellar address the instant their Pull Request merges.
                </p>
                <div className="space-y-2 text-xs font-mono text-[#F3F3F6]">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#00FF66]" />
                    <span>GitHub webhook &amp; CI/CD release triggers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#00FF66]" />
                    <span>Cryptographic proof hashes stored on-chain</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#00FF66]" />
                    <span>Multi-sig dispute arbitration ready</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#08080A] border border-[#1E1E28] font-mono text-xs space-y-2">
                <div className="text-[#505060]">// GitHub Bounty Automation</div>
                <div className="text-[#848494]">&gt; Event: pull_request.closed (merged: true)</div>
                <div className="text-[#00FF66]">&gt; Verifier: HMAC SHA-256 signature verified</div>
                <div className="text-[#F3F3F6]">&gt; Sentinel: invoke_settle(KOFU-003, contributor_addr)</div>
                <div className="text-[#00FF66]">&gt; Tx Confirmed on StellarExpert: 4.1 seconds</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1E1E28]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-[#00FF66] mb-3">Core Innovations</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F3F3F6] tracking-tight mb-4">
            Engineered from First Principles on Stellar &amp; Soroban
          </h2>
          <p className="text-sm text-[#848494]">
            Four architectural pillars delivering institutional-grade trustlessness with everyday simplicity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-xl bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-[#00FF66] mb-6 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F3F3F6] mb-2 font-mono">01. Natural Intent</h3>
              <p className="text-xs text-[#848494] leading-relaxed">
                Dual parser combining Google Gemini 2.0 Flash with deterministic fallback. Extracts assets, counterparties, deadlines, and condition clauses with sub-second latency.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1E1E28] text-[11px] font-mono text-[#00FF66]">
              Gemini 2.0 + Deterministic Regex
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-[#00FF66] mb-6 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F3F3F6] mb-2 font-mono">02. Soroban Vaults</h3>
              <p className="text-xs text-[#848494] leading-relaxed">
                Pure Rust smart contracts (<code className="text-[#00FF66]">soroban-sdk v22</code>) compiled to optimized WebAssembly. Supports native XLM, USDC, EURC with automated Time-To-Live storage extensions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1E1E28] text-[11px] font-mono text-[#00FF66]">
              Non-Custodial Rust Wasm
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-[#00FF66] mb-6 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F3F3F6] mb-2 font-mono">03. Sentinel Daemon</h3>
              <p className="text-xs text-[#848494] leading-relaxed">
                Autonomous oracle daemon monitoring off-chain delivery proofs (GitHub webhooks, REST endpoints, and cryptographic receipts) and automatically invoking settlement on Stellar.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1E1E28] text-[11px] font-mono text-[#00FF66]">
              Autonomous Ledger Watchdog
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-xl bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-[#00FF66] mb-6 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F3F3F6] mb-2 font-mono">04. Policy Envelopes</h3>
              <p className="text-xs text-[#848494] leading-relaxed">
                Pre-configured spending ceilings, autonomous counter-offer boundaries, and human-in-the-loop triggers prevent rogue agent actions or runaway financial loss.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1E1E28] text-[11px] font-mono text-[#00FF66]">
              STRIDE Threat-Model Guarded
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1E1E28]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-[#00FF66] mb-3">Protocol Lifecycle</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F3F3F6] tracking-tight mb-4">
            How KOFU Executes In Practice
          </h2>
          <p className="text-sm text-[#848494]">
            From conversational prompt to cryptographic on-chain release in four simple stages.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 font-mono">
          <div className="p-6 rounded-xl bg-[#0D0D11] border border-[#1E1E28] relative">
            <div className="w-8 h-8 rounded bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-xs font-bold text-[#00FF66] mb-4">
              01
            </div>
            <h4 className="text-base font-bold text-[#F3F3F6] mb-2">Draft in Plain Text</h4>
            <p className="text-xs text-[#848494] leading-relaxed font-sans mb-4">
              Type naturally. The parser extracts the exact value, currency, counterparty, and deliverable condition.
            </p>
            <div className="p-2 rounded bg-[#08080A] border border-[#1E1E28] text-[11px] text-[#505060]">
              &gt; "Pay 50 USDC when website PR merged"
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#0D0D11] border border-[#1E1E28] relative">
            <div className="w-8 h-8 rounded bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-xs font-bold text-[#00FF66] mb-4">
              02
            </div>
            <h4 className="text-base font-bold text-[#F3F3F6] mb-2">Lock into Soroban</h4>
            <p className="text-xs text-[#848494] leading-relaxed font-sans mb-4">
              Funds are deposited into the native Rust smart contract on Stellar. The buyer cannot rug, and seller sees proof.
            </p>
            <div className="p-2 rounded bg-[#08080A] border border-[#1E1E28] text-[11px] text-[#00FF66]">
              &gt; deposit(50 USDC, #1249000)
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#0D0D11] border border-[#1E1E28] relative">
            <div className="w-8 h-8 rounded bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-xs font-bold text-[#00FF66] mb-4">
              03
            </div>
            <h4 className="text-base font-bold text-[#F3F3F6] mb-2">Sentinel Verification</h4>
            <p className="text-xs text-[#848494] leading-relaxed font-sans mb-4">
              The Sentinel listens for webhook triggers or delivery proofs and validates cryptographic signatures.
            </p>
            <div className="p-2 rounded bg-[#08080A] border border-[#1E1E28] text-[11px] text-[#848494]">
              &gt; mark_condition_met(proof_hash)
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#0D0D11] border border-[#1E1E28] relative">
            <div className="w-8 h-8 rounded bg-[#121217] border border-[#1E1E28] flex items-center justify-center text-xs font-bold text-[#00FF66] mb-4">
              04
            </div>
            <h4 className="text-base font-bold text-[#F3F3F6] mb-2">Instant Settlement</h4>
            <p className="text-xs text-[#848494] leading-relaxed font-sans mb-4">
              The Soroban contract releases tokens directly to the seller's Stellar public key. Fully settled on StellarExpert.
            </p>
            <div className="p-2 rounded bg-[#08080A] border border-[#1E1E28] text-[11px] text-[#00FF66]">
              &gt; settle() ➔ Confirmed on Ledger
            </div>
          </div>
        </div>
      </section>

      {/* Docs & Resources Section */}
      <section id="docs" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1E1E28]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-[#00FF66] mb-3">Transparency &amp; Governance</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F3F3F6] tracking-tight mb-4">
            Audited Standards &amp; Documentation
          </h2>
          <p className="text-sm text-[#848494]">
            Prepared in full compliance with Stellar Development Foundation (SDF) standards and Drips Wave requirements.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
          <a
            href="https://github.com/spoo-vault/kofu/blob/main/docs/scf-proposal.md"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-lg bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/50 transition-colors block"
          >
            <FileCode className="w-5 h-5 text-[#00FF66] mb-3" />
            <div className="font-bold text-sm text-[#F3F3F6] mb-1">SCF Proposal</div>
            <div className="text-[#848494] text-[11px]">3-tranche milestone plan, budget breakdown &amp; on-chain metric commitments.</div>
          </a>

          <a
            href="https://github.com/spoo-vault/kofu/blob/main/docs/threat-model.md"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-lg bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/50 transition-colors block"
          >
            <Shield className="w-5 h-5 text-[#00FF66] mb-3" />
            <div className="font-bold text-sm text-[#F3F3F6] mb-1">STRIDE Threat Model</div>
            <div className="text-[#848494] text-[11px]">Formal risk evaluation for spoofing, tampering, replay &amp; storage exhaustion.</div>
          </a>

          <a
            href="https://github.com/spoo-vault/kofu/blob/main/docs/monitoring-plan.md"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-lg bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/50 transition-colors block"
          >
            <Activity className="w-5 h-5 text-[#00FF66] mb-3" />
            <div className="font-bold text-sm text-[#F3F3F6] mb-1">On-Chain Monitoring</div>
            <div className="text-[#848494] text-[11px]">SDF Builder template for contract event ingestion, anomaly alerts &amp; playbooks.</div>
          </a>

          <a
            href="https://github.com/spoo-vault/kofu/blob/main/ROADMAP.md"
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-lg bg-[#0D0D11] border border-[#1E1E28] hover:border-[#00FF66]/50 transition-colors block"
          >
            <Zap className="w-5 h-5 text-[#00FF66] mb-3" />
            <div className="font-bold text-sm text-[#F3F3F6] mb-1">Product Roadmap</div>
            <div className="text-[#848494] text-[11px]">Milestones from Soroban MVP to Mainnet Passkeys and Anchor fiat on-ramps.</div>
          </a>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-2xl bg-gradient-to-b from-[#121217] to-[#0D0D11] border border-[#00FF66]/30 p-10 sm:p-16 shadow-[0_0_50px_rgba(0,255,102,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 bg-[#00FF66]/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-bold text-[#F3F3F6] tracking-tight mb-4">
            Start Making Promises Programmable.
          </h2>
          <p className="text-base text-[#848494] max-w-2xl mx-auto mb-8 font-normal">
            Experience autonomous escrow on Stellar Testnet. Zero gas waste, instant sub-second settlement, and rock-solid Rust security.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onLaunchApp}
              className="px-8 py-4 rounded-lg bg-[#00FF66] hover:bg-[#00D154] text-[#08080A] font-bold text-sm uppercase tracking-wider font-mono transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] cursor-pointer"
            >
              Launch KOFU App Now ➔
            </button>
            <a
              href="https://github.com/spoo-vault/kofu"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-4 rounded-lg bg-[#121217] hover:bg-[#1A1A22] border border-[#1E1E28] text-sm font-mono text-[#F3F3F6] transition-all flex items-center space-x-2"
            >
              <span>Fork On GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#848494]" />
            </a>
          </div>
        </div>
      </section>

      {/* Rich Footer */}
      <footer className="border-t border-[#1E1E28] bg-[#08080A] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded border border-[#1E1E28] bg-white flex items-center justify-center p-1 overflow-hidden">
                <img src="/kofu-logo.png" alt="KOFU Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-mono text-base font-bold text-[#F3F3F6]">KOFU</span>
            </div>
            <p className="text-xs text-[#848494] leading-relaxed">
              Autonomous Economic Agreement Protocol on Stellar &amp; Soroban.
            </p>
            <div className="text-[11px] font-mono text-[#505060]">
              Built for Stellar Community Fund &amp; Drips Wave.
            </div>
          </div>

          {/* Col 1 */}
          <div className="space-y-3 font-mono text-xs">
            <div className="font-bold text-[#F3F3F6] uppercase tracking-wider text-[11px]">Protocol App</div>
            <ul className="space-y-2 text-[#848494]">
              <li><button onClick={onLaunchApp} className="hover:text-[#00FF66]">Command Terminal</button></li>
              <li><button onClick={onLaunchApp} className="hover:text-[#00FF66]">Active Escrows</button></li>
              <li><button onClick={onLaunchApp} className="hover:text-[#00FF66]">Agent Negotiation</button></li>
              <li><button onClick={onLaunchApp} className="hover:text-[#00FF66]">Ledger Explorer</button></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-3 font-mono text-xs">
            <div className="font-bold text-[#F3F3F6] uppercase tracking-wider text-[11px]">Resources</div>
            <ul className="space-y-2 text-[#848494]">
              <li><a href="https://github.com/spoo-vault/kofu/blob/main/docs/scf-proposal.md" target="_blank" rel="noreferrer" className="hover:text-[#00FF66]">SCF Build Award</a></li>
              <li><a href="https://github.com/spoo-vault/kofu/blob/main/docs/threat-model.md" target="_blank" rel="noreferrer" className="hover:text-[#00FF66]">STRIDE Threat Model</a></li>
              <li><a href="https://github.com/spoo-vault/kofu/blob/main/docs/monitoring-plan.md" target="_blank" rel="noreferrer" className="hover:text-[#00FF66]">Monitoring Plan</a></li>
              <li><a href="https://github.com/spoo-vault/kofu/blob/main/ROADMAP.md" target="_blank" rel="noreferrer" className="hover:text-[#00FF66]">Roadmap</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3 font-mono text-xs">
            <div className="font-bold text-[#F3F3F6] uppercase tracking-wider text-[11px]">Community</div>
            <ul className="space-y-2 text-[#848494]">
              <li><a href="https://github.com/spoo-vault/kofu" target="_blank" rel="noreferrer" className="hover:text-[#00FF66]">GitHub Organization</a></li>
              <li><a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-[#00FF66]">Stellar Development Foundation</a></li>
              <li><a href="https://soroban.stellar.org" target="_blank" rel="noreferrer" className="hover:text-[#00FF66]">Soroban Smart Contracts</a></li>
              <li><a href="https://stellar.expert" target="_blank" rel="noreferrer" className="hover:text-[#00FF66]">StellarExpert Block Explorer</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-[#1E1E28] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#505060]">
          <div>
            &copy; 2026 KOFU Protocol. Released under MIT Open Source License.
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
            <span className="text-[#00FF66]">Stellar Testnet: Active</span>
            <span>Contract: CDLZ...YSC</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
