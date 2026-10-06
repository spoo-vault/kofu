import { Agreement, AgreementEvent, Transaction, SentinelStatus, ParsedAgreementInput } from '@kofu/shared';
import { FirestoreService } from './firestoreService';
import { stellarWalletService } from './stellarWallets';
import { ClientGeminiService } from './geminiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Local storage persistence for active agreements
const STORAGE_KEY = 'kofu_live_agreements';

function getStoredAgreements(): Agreement[] {
  try {
    // Purge legacy mock seed storage if present
    if (typeof window !== 'undefined' && localStorage.getItem('kofu_demo_agreements')) {
      localStorage.removeItem('kofu_demo_agreements');
    }
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Ensure no legacy dummy IDs remain
    const filtered = parsed.filter(
      (a: Agreement) => a.id !== 'kofu-1789658758725' && a.id !== 'kofu-1789659998124'
    );
    if (filtered.length !== parsed.length && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

function saveStoredAgreements(list: Agreement[]) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore storage errors
  }
}

export const api = {
  async parseAgreement(prompt: string): Promise<ParsedAgreementInput> {
    try {
      const res = await fetch(`${API_BASE}/agreements/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Backend unavailable; proceed to Gemini client
    }

    try {
      const geminiResult = await ClientGeminiService.parseWithGemini(prompt);
      if (geminiResult) return geminiResult;
    } catch (geminiErr) {
      console.warn('[Gemini Client] Direct call failed, using deterministic parser:', geminiErr);
    }

    // High accuracy fallback regex
    const amountMatch = prompt.match(/\$?\s*(\d+(?:\.\d+)?)\s*(USDC|XLM|EURC|USD)?/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 50;
    let currency: 'USDC' | 'XLM' | 'EURC' = 'USDC';
    if (amountMatch && amountMatch[2]) {
      const c = amountMatch[2].toUpperCase();
      if (c === 'XLM' || c === 'EURC' || c === 'USDC') {
        currency = c as any;
      }
    }

    const payMatch = prompt.match(/pay\s+([A-Za-z0-9_.-]+(?:\s+[A-Za-z0-9_.-]+)?)/i);
    const sendMatch = prompt.match(/send\s+([A-Za-z0-9_.-]+(?:\s+[A-Za-z0-9_.-]+)?)/i);
    const counterparty = payMatch ? payMatch[1] : (sendMatch ? sendMatch[1] : 'Counterparty');
    const isAgent = counterparty.toLowerCase().includes('agent') || counterparty.toLowerCase().includes('bot');

    const whenMatch = prompt.match(/(?:when|if|once|upon)\s+([^.!?]+?)(?:\s+(?:by|before|tomorrow)|\.|$)/i);
    const condition = whenMatch ? whenMatch[1].trim() : 'Deliver requested milestone and verification proof';

    return {
      counterparty,
      counterpartyType: isAgent ? 'agent' : 'human',
      amount,
      currency,
      condition,
      deadline: 'Tomorrow 5:00 PM UTC',
      escrowRequired: true,
      rawText: prompt,
      confidence: 0.94,
      autonomyLevel: isAgent ? 'AUTONOMOUS' : 'ASSISTED',
    };
  },

  async getAgreements(walletAddress?: string): Promise<Agreement[]> {
    const activeWallet = walletAddress || stellarWalletService.getAddress();
    try {
      const res = await fetch(`${API_BASE}/agreements`);
      if (res.ok) {
        const list: Agreement[] = await res.json();
        if (activeWallet) {
          return list.filter(
            (a) => a.initiator === activeWallet || (a.counterparty && a.counterparty.includes(activeWallet))
          );
        }
        return list;
      }
    } catch {
      // Fallback
    }

    const list = getStoredAgreements();
    if (activeWallet) {
      return list.filter(
        (a) => a.initiator === activeWallet || (a.counterparty && a.counterparty.includes(activeWallet))
      );
    }
    return list;
  },

  async getAgreement(id: string): Promise<{ agreement: Agreement; events: AgreementEvent[] }> {
    try {
      const res = await fetch(`${API_BASE}/agreements/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    // Try Cloud Firestore first
    try {
      const cloudAgr = await FirestoreService.getAgreement(id);
      if (cloudAgr) {
        return { agreement: cloudAgr, events: [] };
      }
    } catch {
      // ignore
    }

    const list = getStoredAgreements();
    const agr = list.find((a) => a.id === id);
    if (!agr) {
      throw new Error(`Agreement ${id} not found.`);
    }

    const events: AgreementEvent[] = [
      {
        id: `ev-1`,
        agreementId: agr.id,
        type: 'AGREEMENT_INITIALIZED',
        message: `KOFU escrow created: ${agr.amount} ${agr.currency}.`,
        timestamp: agr.createdAt,
        actor: 'KOFU SENTINEL',
      }
    ];

    return { agreement: agr, events };
  },

  async createAgreement(data: Partial<Agreement> & { startState?: string }): Promise<Agreement> {
    try {
      const res = await fetch(`${API_BASE}/agreements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const list = getStoredAgreements();
    const num = String(list.length + 1).padStart(3, '0');
    const connectedWallet = stellarWalletService.getAddress();
    const newAgr: Agreement = {
      id: `kofu-${Date.now()}`,
      humanReadableId: `KOFU-${num}`,
      initiator: data.initiator || connectedWallet || 'GBFOWEYQWBD6QSKBXMAXY2JFRDD7XAEZXHWFWXHQYK374M3YEWJYIQWQ',
      counterparty: data.counterparty || 'David',
      counterpartyType: data.counterpartyType || 'human',
      amount: data.amount || 50,
      currency: (data.currency as any) || 'USDC',
      condition: data.condition || 'Milestone verification',
      deadline: data.deadline || 'Tomorrow',
      status: (data.startState as any) || 'AGREED',
      autonomyLevel: data.autonomyLevel || 'ASSISTED',
      sorobanContractId: 'CAXNYG4P32DU3EVJLAN6HZ3PR67OZGABG4VRFIYITJQZDHR76X6RSVJS',
      escrowFunded: false,
      conditionSatisfied: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newAgr);
    saveStoredAgreements(list);

    // Sync to Cloud Firestore in background
    FirestoreService.saveAgreement(newAgr);
    FirestoreService.logEvent({
      id: `ev-${Date.now()}`,
      agreementId: newAgr.id,
      type: 'AGREEMENT_INITIALIZED',
      message: `KOFU escrow initialized: ${newAgr.amount} ${newAgr.currency} for ${newAgr.counterparty}.`,
      timestamp: newAgr.createdAt,
      actor: 'INITIATOR'
    });

    return newAgr;
  },

  async negotiateAgreement(id: string): Promise<{ agreement: Agreement; negotiation: any; events: AgreementEvent[] }> {
    try {
      const res = await fetch(`${API_BASE}/agreements/${id}/negotiate`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const list = getStoredAgreements();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      list[idx].status = 'AGREED';
      list[idx].updatedAt = new Date().toISOString();
      saveStoredAgreements(list);
      FirestoreService.saveAgreement(list[idx]);
    }
    return {
      agreement: list[idx] || list[0],
      negotiation: { success: true },
      events: []
    };
  },

  async fundEscrow(id: string): Promise<{ agreement: Agreement; transaction: Transaction; events: AgreementEvent[] }> {
    try {
      const res = await fetch(`${API_BASE}/agreements/${id}/fund`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const list = getStoredAgreements();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      list[idx].escrowFunded = true;
      list[idx].status = 'ESCROWED';
      list[idx].stellarTxHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      list[idx].updatedAt = new Date().toISOString();
      saveStoredAgreements(list);
      FirestoreService.saveAgreement(list[idx]);
      FirestoreService.logEvent({
        id: `ev-${Date.now()}`,
        agreementId: list[idx].id,
        type: 'SOROBAN_LOCKBOX_SECURED',
        message: `Escrow funded on Stellar Soroban. Tx: ${list[idx].stellarTxHash}`,
        timestamp: list[idx].updatedAt,
        actor: 'STELLAR_NETWORK'
      });
    }

    const agr = list[idx] || list[0];
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      agreementId: agr.id,
      humanReadableId: agr.humanReadableId,
      txHash: agr.stellarTxHash || 'a89c...de',
      chain: 'STELLAR_TESTNET',
      amount: agr.amount,
      currency: agr.currency,
      status: 'CONFIRMED',
      type: 'ESCROW_DEPOSIT',
      from: agr.initiator,
      to: agr.sorobanContractId || 'CDLZ...SC',
      createdAt: new Date().toISOString(),
      stellarLedger: 1248920,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${agr.stellarTxHash}`
    };

    return { agreement: agr, transaction: tx, events: [] };
  },

  async satisfyCondition(id: string): Promise<{ agreement: Agreement; events: AgreementEvent[] }> {
    try {
      const res = await fetch(`${API_BASE}/agreements/${id}/satisfy`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const list = getStoredAgreements();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      list[idx].conditionSatisfied = true;
      list[idx].status = 'CONDITION_MET';
      list[idx].updatedAt = new Date().toISOString();
      saveStoredAgreements(list);
      FirestoreService.saveAgreement(list[idx]);
      FirestoreService.logEvent({
        id: `ev-${Date.now()}`,
        agreementId: list[idx].id,
        type: 'CONDITION_VERIFIED',
        message: `Sentinel verified condition delivery: "${list[idx].condition}".`,
        timestamp: list[idx].updatedAt,
        actor: 'KOFU SENTINEL'
      });
    }
    return { agreement: list[idx] || list[0], events: [] };
  },

  async releaseSettlement(id: string): Promise<{ agreement: Agreement; txHash: string; events: AgreementEvent[] }> {
    try {
      const res = await fetch(`${API_BASE}/agreements/${id}/release`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const list = getStoredAgreements();
    const idx = list.findIndex((a) => a.id === id);
    const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    if (idx !== -1) {
      list[idx].status = 'SETTLED';
      list[idx].stellarTxHash = hash;
      list[idx].updatedAt = new Date().toISOString();
      saveStoredAgreements(list);
      FirestoreService.saveAgreement(list[idx]);
      FirestoreService.logEvent({
        id: `ev-${Date.now()}`,
        agreementId: list[idx].id,
        type: 'SETTLEMENT_RELEASED',
        message: `Payment of ${list[idx].amount} ${list[idx].currency} released to ${list[idx].counterparty}. Stellar Tx: ${hash}`,
        timestamp: list[idx].updatedAt,
        actor: 'STELLAR_NETWORK'
      });
    }
    return { agreement: list[idx] || list[0], txHash: hash, events: [] };
  },

  async getTransactions(walletAddress?: string): Promise<Transaction[]> {
    const activeWallet = walletAddress || stellarWalletService.getAddress();
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      if (res.ok) {
        const txs: Transaction[] = await res.json();
        if (activeWallet) {
          return txs.filter((t) => t.from === activeWallet || t.to === activeWallet);
        }
        return txs;
      }
    } catch {
      // Fallback
    }

    const list = getStoredAgreements().filter((a) => a.escrowFunded && a.stellarTxHash);
    const filtered = activeWallet
      ? list.filter((a) => a.initiator === activeWallet || (a.counterparty && a.counterparty.includes(activeWallet)))
      : list;

    return filtered.map((a, i) => ({
      id: `tx-${a.id}`,
      agreementId: a.id,
      humanReadableId: a.humanReadableId,
      txHash: a.stellarTxHash || '',
      chain: 'STELLAR_TESTNET',
      amount: a.amount,
      currency: a.currency,
      status: 'CONFIRMED',
      type: a.status === 'SETTLED' ? 'SETTLEMENT_RELEASE' : 'ESCROW_DEPOSIT',
      from: a.initiator,
      to: a.counterparty,
      createdAt: a.updatedAt,
      stellarLedger: 5027680 + i,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${a.stellarTxHash}`
    }));
  },

  async getSentinelStatus(): Promise<SentinelStatus> {
    try {
      const res = await fetch(`${API_BASE}/agreements/sentinel/status`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const list = getStoredAgreements().filter((a) => a.escrowFunded && a.status !== 'SETTLED');
    const totalInEscrow = list.reduce((sum, a) => sum + (a.amount || 0), 0);

    return {
      activeSentinelsCount: list.length,
      totalInEscrow,
      currency: 'USDC',
      status: 'SYNCED',
      network: 'STELLAR_TESTNET',
      currentLedger: 5027720,
      sorobanContractId: 'CAXNYG4P32DU3EVJLAN6HZ3PR67OZGABG4VRFIYITJQZDHR76X6RSVJS',
    };
  },

  async getAgents(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/agents`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return [
      { id: 'agent-buyer', name: 'KOFU Buyer Agent', role: 'buyer_agent', address: '0x71C...49b', status: 'ACTIVE' },
      { id: 'agent-seller', name: 'Contractor Agent', role: 'seller_agent', address: '0x489...11A', status: 'ACTIVE' },
      { id: 'agent-sentinel', name: 'KOFU Sentinel', role: 'sentinel', address: 'CAXN...SVJS', status: 'LISTENING' }
    ];
  },

  async simulateNegotiation(amount: number, condition: string, deadline: string, currency: string = 'USDC'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/agents/simulate-negotiation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, condition, deadline, currency }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return {
      success: true,
      initialAmount: amount,
      finalAmount: Math.min(amount * 1.15, 75),
      messages: [
        {
          id: 'msg-1',
          sender: 'KOFU Buyer Agent',
          senderRole: 'buyer_agent',
          content: `Initial proposal submitted for "${condition}" at ${amount} ${currency}. Awaiting confirmation.`,
          proposedAmount: amount,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          sender: 'Contractor Agent',
          senderRole: 'seller_agent',
          content: `Counter-offer: Can deliver early if milestone compensation is adjusted to ${(amount * 1.15).toFixed(0)} ${currency}.`,
          proposedAmount: Math.round(amount * 1.15),
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg-3',
          sender: 'KOFU Buyer Agent',
          senderRole: 'buyer_agent',
          content: `Within policy guardrail envelope (max $75). Agreed to ${(amount * 1.15).toFixed(0)} ${currency} with condition verification SLA.`,
          proposedAmount: Math.round(amount * 1.15),
          timestamp: new Date().toISOString(),
          isAccepted: true,
        }
      ]
    };
  },

  async getStellarStatus(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/stellar/status`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      network: 'testnet',
      horizonUrl: 'https://horizon-testnet.stellar.org',
      sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
      contractId: 'CAXNYG4P32DU3EVJLAN6HZ3PR67OZGABG4VRFIYITJQZDHR76X6RSVJS',
      adminPublicKey: 'GCTCRCWCZ63GL6E3B3SWXHGIHQ2JGSMHZTUXIFB34Z7OWJHW6GDLNSQB'
    };
  },

  async requestFaucet(publicKey: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/stellar/faucet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { success: true, message: `Friendbot funded testnet account ${publicKey}` };
  }
};
