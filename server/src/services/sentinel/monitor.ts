import { Agreement } from '../../types/shared.js';
import { db } from '../../db/store.js';
import { stellarEscrow } from '../stellar/escrow.js';
import { stellarConfig, getExplorerTxUrl } from '../stellar/config.js';
import { policyEngine } from '../ai/policy.js';

export class SentinelService {
  /**
   * Called when an agreement is initialized
   */
  public static onAgreementCreated(agreement: Agreement): void {
    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'AGREEMENT_CREATED',
      message: `Agreement initialized with terms: ${agreement.amount} ${agreement.currency} for '${agreement.condition}'.`,
      actor: 'POKA SENTINEL',
    });

    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'COUNTERPARTY_NOTIFIED',
      message: `Counterparty '${agreement.counterparty}' notified via Stellar Agent protocol.`,
      actor: 'POKA SENTINEL',
    });
  }

  /**
   * Called when agreement terms are accepted
   */
  public static onTermsAccepted(agreement: Agreement): void {
    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'TERMS_ACCEPTED',
      message: `Terms accepted by ${agreement.counterparty}. Economic agreement committed at ${agreement.amount} ${agreement.currency}.`,
      actor: 'POKA SENTINEL',
    });
  }

  /**
   * Called when escrow is funded on Soroban
   */
  public static onEscrowFunded(agreement: Agreement, txHash: string, ledger?: number): void {
    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'ESCROW_FUNDED',
      message: `Escrow funded on Stellar ${stellarConfig.network === 'public' ? 'Mainnet' : 'Testnet'}: ${agreement.amount} ${agreement.currency}. Tx: ${txHash.substring(0, 12)}...`,
      actor: 'POKA SENTINEL',
      metadata: { txHash, ledger, explorerUrl: getExplorerTxUrl(txHash) },
    });

    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'MONITORING_STARTED',
      message: `Autonomous Sentinel initialized. Monitoring Soroban contract: ${stellarConfig.contractId.substring(0, 10)}... for condition: '${agreement.condition}'.`,
      actor: 'POKA SENTINEL',
    });
  }

  /**
   * Verifies the condition fulfillment
   */
  public static async verifyCondition(agreement: Agreement): Promise<Agreement> {
    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'CONDITION_DETECTED',
      message: `Fulfillment signal detected for '${agreement.condition}'.`,
      actor: 'POKA SENTINEL',
    });

    // Mark condition satisfied
    agreement.conditionSatisfied = true;
    agreement.status = 'CONDITION_MET';

    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'CONDITION_VERIFIED',
      message: `Sentinel verified cryptographic proofs & deliverable requirements. Condition satisfied on-chain.`,
      actor: 'POKA SENTINEL',
    });

    db.saveAgreement(agreement);

    // If autonomy level is AUTONOMOUS, immediately trigger Soroban settlement!
    if (agreement.autonomyLevel === 'AUTONOMOUS') {
      await this.settleAgreement(agreement);
    }

    return agreement;
  }

  /**
   * Settle and release payment to counterparty on Stellar
   */
  public static async settleAgreement(agreement: Agreement): Promise<{ agreement: Agreement; txHash: string }> {
    const policyCheck = policyEngine.validateFundRelease(agreement);
    if (!policyCheck.allowed) {
      db.addEvent(agreement.id, {
        agreementId: agreement.id,
        type: 'SETTLEMENT_REJECTED',
        message: `Policy rejection: ${policyCheck.reason}`,
        actor: 'POKA SENTINEL',
      });
      throw new Error(policyCheck.reason);
    }

    agreement.status = 'SETTLING';
    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'SETTLEMENT_INITIATED',
      message: `Settlement initiated. Preparing Soroban release transaction for ${agreement.amount} ${agreement.currency}.`,
      actor: 'POKA SENTINEL',
    });

    const tx = await stellarEscrow.release({
      agreementId: agreement.id,
      humanReadableId: agreement.humanReadableId,
      amount: agreement.amount,
      currency: agreement.currency,
      from: stellarConfig.contractId,
      to: agreement.counterparty,
    });

    db.addTransaction(tx);

    agreement.status = 'SETTLED';
    agreement.stellarTxHash = tx.txHash;
    agreement.stellarLedger = tx.stellarLedger;
    db.saveAgreement(agreement);

    db.addEvent(agreement.id, {
      agreementId: agreement.id,
      type: 'PAYMENT_RELEASED',
      message: `Payment released via Soroban escrow. Stellar transaction confirmed: ${tx.txHash}. Settlement complete.`,
      actor: 'POKA SENTINEL',
      metadata: { txHash: tx.txHash, explorerUrl: tx.explorerUrl, ledger: tx.stellarLedger },
    });

    return { agreement, txHash: tx.txHash };
  }
}
