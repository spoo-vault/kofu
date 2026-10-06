export type AgreementState =
  | 'DRAFT'
  | 'NEGOTIATING'
  | 'AGREED'
  | 'ESCROWED'
  | 'MONITORING'
  | 'CONDITION_MET'
  | 'SETTLING'
  | 'SETTLED'
  | 'EXTENSION_REQUESTED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'FAILED';

export type AutonomyLevel = 'MANUAL' | 'ASSISTED' | 'AUTONOMOUS';

export interface PolicyPermissions {
  maxTransaction: number; // e.g. 100 USDC / 500 XLM
  maxNegotiation: number; // e.g. 75 USDC
  canRequestExtension: boolean;
  canNegotiate: boolean;
  canReleaseFunds: boolean;
}

export interface ParsedAgreementInput {
  counterparty: string;
  counterpartyType: 'human' | 'agent';
  amount: number;
  currency: 'USDC' | 'XLM' | 'EURC' | 'USD';
  condition: string;
  deadline: string;
  escrowRequired: boolean;
  rawText: string;
  confidence: number;
  autonomyLevel: AutonomyLevel;
}

export interface Agreement {
  id: string;
  humanReadableId: string; // e.g. KOFU-001
  initiator: string; // Stellar public key (G...)
  counterparty: string; // Stellar public key or agent name
  counterpartyType: 'human' | 'agent';
  amount: number;
  currency: 'USDC' | 'XLM' | 'EURC';
  condition: string;
  deadline: string;
  status: AgreementState;
  autonomyLevel: AutonomyLevel;
  sorobanContractId?: string; // Soroban contract address (C...)
  escrowFunded: boolean;
  conditionSatisfied: boolean;
  deliverableUrl?: string; // GitHub PR URL, deliverable link, or IPFS CID
  deliverableNotes?: string; // Worker submission comments
  counterpartyWallet?: string; // Connected worker's Stellar address
  disputeReason?: string;
  disputedAt?: string;
  stellarTxHash?: string; // Stellar 64-char transaction hash
  stellarLedger?: number;
  negotiationHistory?: NegotiationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface NegotiationMessage {
  id: string;
  sender: string;
  senderRole: 'buyer_agent' | 'seller_agent' | 'human_initiator' | 'human_counterparty';
  content: string;
  proposedAmount?: number;
  currency?: string;
  timestamp: string;
  isOffer?: boolean;
  isAccepted?: boolean;
}

export interface AgreementEvent {
  id: string;
  agreementId: string;
  type: string;
  message: string;
  timestamp: string;
  actor: 'SYSTEM' | 'KOFU SENTINEL' | 'BUYER_AGENT' | 'SELLER_AGENT' | 'INITIATOR' | 'COUNTERPARTY' | 'STELLAR_NETWORK';
  metadata?: Record<string, any>;
}

export interface Transaction {
  id: string;
  agreementId: string;
  humanReadableId: string;
  txHash: string; // Stellar transaction hash
  chain: 'STELLAR_TESTNET' | 'STELLAR_MAINNET';
  networkPassphrase?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  type: 'ESCROW_DEPOSIT' | 'SETTLEMENT_RELEASE' | 'REFUND';
  from: string; // Stellar address (G...)
  to: string; // Stellar address or Soroban contract (C...)
  createdAt: string;
  stellarLedger?: number;
  sorobanContractId?: string;
  explorerUrl?: string;
}

export interface SentinelStatus {
  activeSentinelsCount: number;
  totalInEscrow: number;
  currency: string;
  status: 'SYNCED' | 'MONITORING' | 'SETTLING';
  network: 'STELLAR_TESTNET' | 'STELLAR_MAINNET' | 'DEMO_SANDBOX';
  currentLedger?: number;
  sorobanContractId?: string;
}

export interface StellarNetworkInfo {
  network: 'testnet' | 'public';
  horizonUrl: string;
  sorobanRpcUrl: string;
  passphrase: string;
  contractId: string;
  adminPublicKey: string;
  usdcAssetCode: string;
  usdcIssuer: string;
}
