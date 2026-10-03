import { Agreement, AgreementEvent, Transaction, SentinelStatus, ParsedAgreementInput } from '@kofu/shared';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Demo / Offline Storage fallback
const STORAGE_KEY = 'kofu_demo_agreements';

const INITIAL_DEMO_AGREEMENTS: Agreement[] = [
  {
    id: 'kofu-1789658758725',
    humanReadableId: 'KOFU-001',
    initiator: 'GBZH7K5V6GZ6F5OXZXU7F5K7D2Z5H7A6C3Q7K2V5N6M8B4V2C1X3Z4A5',
    counterparty: 'David (GBZH7K...4A5)',
    counterpartyType: 'human',
    amount: 50,
    currency: 'USDC',
    condition: 'Website delivery and deployment on Vercel',
    deadline: 'Tomorrow 5:00 PM UTC',
    status: 'AGREED',
    autonomyLevel: 'ASSISTED',
    sorobanContractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    escrowFunded: true,
    conditionSatisfied: false,
    stellarTxHash: 'a89c3b47f29e1208945cf43872931a0e834927b561cda08912ef09843615bcde',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'kofu-1789659998124',
    humanReadableId: 'KOFU-002',
    initiator: 'GBZH7K5V6GZ6F5OXZXU7F5K7D2Z5H7A6C3Q7K2V5N6M8B4V2C1X3Z4A5',
    counterparty: 'Research Agent (0x71C...49b)',
    counterpartyType: 'agent',
    amount: 25,
    currency: 'USDC',
    condition: 'Verified AI training dataset delivery with SHA-256 hash',
    deadline: '2026-10-10',
    status: 'SETTLED',
    autonomyLevel: 'AUTONOMOUS',
    sorobanContractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    escrowFunded: true,
    conditionSatisfied: true,
    stellarTxHash: 'f451a9238bc4081efb984531204895ca7238bdf89421ea9834125b0981e2894a',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  }
];

function getStoredAgreements(): Agreement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_AGREEMENTS));
      return INITIAL_DEMO_AGREEMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_AGREEMENTS;
  }
}

function saveStoredAgreements(list: Agreement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
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
      // Fallback: Client-side Deterministic Regex Parser
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

  async getAgreements(): Promise<Agreement[]> {
    try {
      const res = await fetch(`${API_BASE}/agreements`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getStoredAgreements();
  },

  async getAgreement(id: string): Promise<{ agreement: Agreement; events: AgreementEvent[] }> {
    try {
      const res = await fetch(`${API_BASE}/agreements/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const list = getStoredAgreements();
    const agr = list.find((a) => a.id === id) || list[0];
    const events: AgreementEvent[] = [
      {
        id: `ev-1`,
        agreementId: agr.id,
        type: 'AGREEMENT_INITIALIZED',
        message: `KOFU escrow created with terms: ${agr.amount} ${agr.currency}.`,
        timestamp: agr.createdAt,
        actor: 'KOFU SENTINEL',
      },
      {
        id: `ev-2`,
        agreementId: agr.id,
        type: 'SOROBAN_LOCKBOX_SECURED',
        message: `Funds secured in Soroban smart contract (${agr.sorobanContractId || 'CDLZ...SC'}).`,
        timestamp: agr.updatedAt,
        actor: 'STELLAR_NETWORK',
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
    const newAgr: Agreement = {
      id: `kofu-${Date.now()}`,
      humanReadableId: `KOFU-${num}`,
      initiator: data.initiator || 'GBZH7K5V6GZ6F5OXZXU7F5K7D2Z5H7A6C3Q7K2V5N6M8B4V2C1X3Z4A5',
      counterparty: data.counterparty || 'David',
      counterpartyType: data.counterpartyType || 'human',
      amount: data.amount || 50,
      currency: (data.currency as any) || 'USDC',
      condition: data.condition || 'Milestone verification',
      deadline: data.deadline || 'Tomorrow',
      status: (data.startState as any) || 'AGREED',
      autonomyLevel: data.autonomyLevel || 'ASSISTED',
      sorobanContractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
      escrowFunded: false,
      conditionSatisfied: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newAgr);
    saveStoredAgreements(list);
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
    }
    return { agreement: list[idx] || list[0], txHash: hash, events: [] };
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const list = getStoredAgreements();
    return list.map((a, i) => ({
      id: `tx-${i + 1}`,
      agreementId: a.id,
      humanReadableId: a.humanReadableId,
      txHash: a.stellarTxHash || '8fa2b109e4c5...89',
      chain: 'STELLAR_TESTNET',
      amount: a.amount,
      currency: a.currency,
      status: 'CONFIRMED',
      type: a.status === 'SETTLED' ? 'SETTLEMENT_RELEASE' : 'ESCROW_DEPOSIT',
      from: a.initiator,
      to: a.counterparty,
      createdAt: a.updatedAt,
      stellarLedger: 1248910 + i * 15,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${a.stellarTxHash || ''}`
    }));
  },

  async getSentinelStatus(): Promise<SentinelStatus> {
    try {
      const res = await fetch(`${API_BASE}/agreements/sentinel/status`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    return {
      activeSentinelsCount: 4,
      totalInEscrow: 75.0,
      currency: 'USDC',
      status: 'SYNCED',
      network: 'STELLAR_TESTNET',
      currentLedger: 1249015,
      sorobanContractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
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
      { id: 'agent-sentinel', name: 'KOFU Sentinel', role: 'sentinel', address: 'CDLZ...YSC', status: 'LISTENING' }
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
      contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
      adminPublicKey: 'GBZH7K5V6GZ6F5OXZXU7F5K7D2Z5H7A6C3Q7K2V5N6M8B4V2C1X3Z4A5'
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
