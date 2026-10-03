import { NegotiationMessage } from '../../types/shared.js';
import { policyEngine } from './policy.js';

export interface NegotiationStepResult {
  messages: NegotiationMessage[];
  agreementReached: boolean;
  finalAmount?: number;
  condition?: string;
  deadline?: string;
  notes?: string;
}

export class AgentNegotiator {
  /**
   * Simulates an autonomous negotiation sequence between POKA Buyer Agent and Counterparty Agent
   */
  public static simulateNegotiation(
    initialAmount: number,
    condition: string,
    deadline: string,
    currency: string = 'USDC'
  ): NegotiationStepResult {
    const policy = policyEngine.getPolicy();
    
    const sellerCounter = Math.min(Math.round(initialAmount * 1.4), policy.maxNegotiation);
    const buyerCompromise = Math.round(initialAmount * 1.2);
    const bonus = 5;
    const finalAmount = buyerCompromise + bonus;

    const policyCheck = policyEngine.validateNegotiation(finalAmount);
    if (!policyCheck.allowed) {
      throw new Error(policyCheck.reason || 'Negotiation exceeds policy ceiling');
    }

    const messages: NegotiationMessage[] = [
      {
        id: 'msg-1',
        sender: 'KOFU Buyer Agent',
        senderRole: 'buyer_agent',
        content: `${initialAmount} ${currency} upon completion of '${condition}'.`,
        proposedAmount: initialAmount,
        currency,
        timestamp: new Date(Date.now() - 30000).toLocaleTimeString([], { hour12: false }),
        isOffer: true,
      },
      {
        id: 'msg-2',
        sender: 'David Counterparty Agent',
        senderRole: 'seller_agent',
        content: `Scope requires high-urgency turnaround. Propose ${sellerCounter} ${currency}.`,
        proposedAmount: sellerCounter,
        currency,
        timestamp: new Date(Date.now() - 20000).toLocaleTimeString([], { hour12: false }),
        isOffer: true,
      },
      {
        id: 'msg-3',
        sender: 'KOFU Buyer Agent',
        senderRole: 'buyer_agent',
        content: `${buyerCompromise} base + ${bonus} completion bonus in ${currency} if delivered within 24 hours.`,
        proposedAmount: finalAmount,
        currency,
        timestamp: new Date(Date.now() - 10000).toLocaleTimeString([], { hour12: false }),
        isOffer: true,
      },
      {
        id: 'msg-4',
        sender: 'David Counterparty Agent',
        senderRole: 'seller_agent',
        content: `Accepted. Economic terms locked for ${finalAmount} ${currency} Soroban escrow.`,
        proposedAmount: finalAmount,
        currency,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        isAccepted: true,
      }
    ];

    return {
      messages,
      agreementReached: true,
      finalAmount,
      condition,
      deadline: '24 Hours',
      notes: `Autonomous concession made within ${policy.maxNegotiation} ${currency} policy envelope.`,
    };
  }
}
