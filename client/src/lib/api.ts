import { Agreement, AgreementEvent, Transaction, SentinelStatus, ParsedAgreementInput } from '@poka/shared';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  async parseAgreement(prompt: string): Promise<ParsedAgreementInput> {
    const res = await fetch(`${API_BASE}/agreements/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to parse instruction');
    }
    return res.json();
  },

  async getAgreements(): Promise<Agreement[]> {
    const res = await fetch(`${API_BASE}/agreements`);
    if (!res.ok) throw new Error('Failed to fetch agreements');
    return res.json();
  },

  async getAgreement(id: string): Promise<{ agreement: Agreement; events: AgreementEvent[] }> {
    const res = await fetch(`${API_BASE}/agreements/${id}`);
    if (!res.ok) throw new Error('Failed to fetch agreement');
    return res.json();
  },

  async createAgreement(data: Partial<Agreement> & { startState?: string }): Promise<Agreement> {
    const res = await fetch(`${API_BASE}/agreements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create agreement');
    }
    return res.json();
  },

  async negotiateAgreement(id: string): Promise<{ agreement: Agreement; negotiation: any; events: AgreementEvent[] }> {
    const res = await fetch(`${API_BASE}/agreements/${id}/negotiate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Negotiation failed');
    }
    return res.json();
  },

  async fundEscrow(id: string): Promise<{ agreement: Agreement; transaction: Transaction; events: AgreementEvent[] }> {
    const res = await fetch(`${API_BASE}/agreements/${id}/fund`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Funding escrow failed');
    }
    return res.json();
  },

  async satisfyCondition(id: string): Promise<{ agreement: Agreement; events: AgreementEvent[] }> {
    const res = await fetch(`${API_BASE}/agreements/${id}/satisfy`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Condition satisfaction failed');
    }
    return res.json();
  },

  async releaseSettlement(id: string): Promise<{ agreement: Agreement; txHash: string; events: AgreementEvent[] }> {
    const res = await fetch(`${API_BASE}/agreements/${id}/release`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Settlement failed');
    }
    return res.json();
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE}/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getSentinelStatus(): Promise<SentinelStatus> {
    const res = await fetch(`${API_BASE}/agreements/sentinel/status`);
    if (!res.ok) throw new Error('Failed to fetch sentinel status');
    return res.json();
  },

  async getAgents(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/agents`);
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  },

  async simulateNegotiation(amount: number, condition: string, deadline: string, currency: string = 'USDC'): Promise<any> {
    const res = await fetch(`${API_BASE}/agents/simulate-negotiation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, condition, deadline, currency }),
    });
    if (!res.ok) throw new Error('Failed to simulate negotiation');
    return res.json();
  },

  async getStellarStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/stellar/status`);
    if (!res.ok) throw new Error('Failed to fetch Stellar network status');
    return res.json();
  },

  async requestFaucet(publicKey: string): Promise<any> {
    const res = await fetch(`${API_BASE}/stellar/faucet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Faucet request failed');
    }
    return res.json();
  }
};
