import { PolicyPermissions, Agreement } from '../../types/shared.js';

// Standard MVP Policy limits on Stellar
export const DEFAULT_POLICY: PolicyPermissions = {
  maxTransaction: 100, // 100 USDC / 500 XLM max single transaction without human override
  maxNegotiation: 75,  // 75 USDC maximum auto-negotiated settlement
  canRequestExtension: true,
  canNegotiate: true,
  canReleaseFunds: true,
};

export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
  policy: PolicyPermissions;
}

export class PolicyEngine {
  private policy: PolicyPermissions;

  constructor(policy: PolicyPermissions = DEFAULT_POLICY) {
    this.policy = policy;
  }

  public getPolicy(): PolicyPermissions {
    return { ...this.policy };
  }

  public validateAgreementCreation(amount: number, counterparty: string): PolicyCheckResult {
    if (!counterparty || counterparty.trim().length === 0) {
      return {
        allowed: false,
        reason: 'Counterparty identifier or Stellar public key cannot be empty.',
        policy: this.policy,
      };
    }

    if (isNaN(amount) || amount <= 0) {
      return {
        allowed: false,
        reason: 'Agreement amount must be a positive numeric value.',
        policy: this.policy,
      };
    }

    if (amount > 10000) {
      return {
        allowed: false,
        reason: `Amount exceeds hard cap of 10,000 for autonomous escrow creation.`,
        policy: this.policy,
      };
    }

    return { allowed: true, policy: this.policy };
  }

  public validateNegotiation(proposedAmount: number): PolicyCheckResult {
    if (!this.policy.canNegotiate) {
      return {
        allowed: false,
        reason: 'Autonomous negotiation is disabled by current security policy.',
        policy: this.policy,
      };
    }

    if (proposedAmount > this.policy.maxNegotiation) {
      return {
        allowed: false,
        reason: `Negotiated amount ${proposedAmount} exceeds autonomous ceiling of ${this.policy.maxNegotiation}. Human approval required.`,
        policy: this.policy,
      };
    }

    return { allowed: true, policy: this.policy };
  }

  public validateFundRelease(agreement: Agreement): PolicyCheckResult {
    if (!agreement.escrowFunded) {
      return {
        allowed: false,
        reason: 'Soroban escrow has not been funded yet.',
        policy: this.policy,
      };
    }

    if (!agreement.conditionSatisfied) {
      return {
        allowed: false,
        reason: `Delivery condition '${agreement.condition}' has not been confirmed satisfied by Sentinel.`,
        policy: this.policy,
      };
    }

    if (agreement.amount > this.policy.maxTransaction) {
      return {
        allowed: false,
        reason: `Amount (${agreement.amount} ${agreement.currency}) exceeds autonomous policy limit (${this.policy.maxTransaction}). Requires manual approval.`,
        policy: this.policy,
      };
    }

    return { allowed: true, policy: this.policy };
  }
}

export const policyEngine = new PolicyEngine();
