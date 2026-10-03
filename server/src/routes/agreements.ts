import { Router } from 'express';
import { db } from '../db/store.js';
import { AgreementParser } from '../services/ai/parser.js';
import { policyEngine } from '../services/ai/policy.js';
import { AgentNegotiator } from '../services/ai/negotiator.js';
import { SentinelService } from '../services/sentinel/monitor.js';
import { stellarEscrow } from '../services/stellar/escrow.js';
import { stellarConfig } from '../services/stellar/config.js';
import { Agreement, AutonomyLevel } from '../types/shared.js';

export const agreementsRouter = Router();

// Parse natural language agreement instruction
agreementsRouter.post('/parse', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt string is required' });
      return;
    }

    const parsed = await AgreementParser.parse(prompt);
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to parse agreement instruction' });
  }
});

// List all agreements
agreementsRouter.get('/', (_req, res) => {
  res.json(db.getAgreements());
});

// Get Sentinel system status
agreementsRouter.get('/sentinel/status', (_req, res) => {
  res.json(db.getSentinelStatus());
});

// Get single agreement with events
agreementsRouter.get('/:id', (req, res) => {
  const agreement = db.getAgreement(req.params.id);
  if (!agreement) {
    res.status(404).json({ error: 'Agreement not found' });
    return;
  }
  const events = db.getEvents(agreement.id);
  res.json({ agreement, events });
});

// Create new agreement
agreementsRouter.post('/', (req, res) => {
  try {
    const {
      counterparty,
      counterpartyType = 'human',
      amount,
      currency = 'USDC',
      condition,
      deadline = 'Tomorrow',
      autonomyLevel = 'ASSISTED',
      startState = 'AGREED',
    } = req.body;

    const policyCheck = policyEngine.validateAgreementCreation(Number(amount), counterparty);
    if (!policyCheck.allowed) {
      res.status(422).json({ error: policyCheck.reason });
      return;
    }

    const id = `poka-${Date.now()}`;
    const humanReadableId = db.getNextHumanReadableId();

    const agreement: Agreement = {
      id,
      humanReadableId,
      initiator: 'GBZH7K5V6GZ6F5OXZXU7F5K7D2Z5H7A6C3Q7K2V5N6M8B4V2C1X3Z4A5 (Alice)',
      counterparty,
      counterpartyType,
      amount: Number(amount),
      currency: ['USDC', 'XLM', 'EURC'].includes(currency) ? (currency as any) : 'USDC',
      condition,
      deadline,
      status: startState as any,
      autonomyLevel: autonomyLevel as AutonomyLevel,
      sorobanContractId: stellarConfig.contractId,
      escrowFunded: false,
      conditionSatisfied: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveAgreement(agreement);
    SentinelService.onAgreementCreated(agreement);

    res.status(201).json(agreement);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create agreement' });
  }
});

// Run autonomous negotiation
agreementsRouter.post('/:id/negotiate', (req, res) => {
  try {
    const agreement = db.getAgreement(req.params.id);
    if (!agreement) {
      res.status(404).json({ error: 'Agreement not found' });
      return;
    }

    const negotiationResult = AgentNegotiator.simulateNegotiation(
      agreement.amount,
      agreement.condition,
      agreement.deadline,
      agreement.currency
    );

    agreement.negotiationHistory = negotiationResult.messages;
    if (negotiationResult.finalAmount) {
      agreement.amount = negotiationResult.finalAmount;
    }
    agreement.status = 'AGREED';
    db.saveAgreement(agreement);

    SentinelService.onTermsAccepted(agreement);

    res.json({
      agreement,
      negotiation: negotiationResult,
      events: db.getEvents(agreement.id),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Negotiation failed' });
  }
});

// Fund Escrow on Soroban
agreementsRouter.post('/:id/fund', async (req, res) => {
  try {
    const agreement = db.getAgreement(req.params.id);
    if (!agreement) {
      res.status(404).json({ error: 'Agreement not found' });
      return;
    }

    const tx = await stellarEscrow.deposit({
      agreementId: agreement.id,
      humanReadableId: agreement.humanReadableId,
      amount: agreement.amount,
      currency: agreement.currency,
      from: agreement.initiator,
      to: stellarConfig.contractId,
    });

    db.addTransaction(tx);

    agreement.escrowFunded = true;
    agreement.status = 'ESCROWED';
    agreement.stellarTxHash = tx.txHash;
    agreement.stellarLedger = tx.stellarLedger;
    db.saveAgreement(agreement);

    SentinelService.onEscrowFunded(agreement, tx.txHash, tx.stellarLedger);

    // Transition to MONITORING
    agreement.status = 'MONITORING';
    db.saveAgreement(agreement);

    res.json({
      agreement,
      transaction: tx,
      events: db.getEvents(agreement.id),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Escrow funding failed' });
  }
});

// Trigger / Verify Condition
agreementsRouter.post('/:id/satisfy', async (req, res) => {
  try {
    const agreement = db.getAgreement(req.params.id);
    if (!agreement) {
      res.status(404).json({ error: 'Agreement not found' });
      return;
    }

    const updated = await SentinelService.verifyCondition(agreement);
    res.json({
      agreement: updated,
      events: db.getEvents(agreement.id),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Condition verification failed' });
  }
});

// Settle / Release Payment on Soroban
agreementsRouter.post('/:id/release', async (req, res) => {
  try {
    const agreement = db.getAgreement(req.params.id);
    if (!agreement) {
      res.status(404).json({ error: 'Agreement not found' });
      return;
    }

    const result = await SentinelService.settleAgreement(agreement);
    res.json({
      agreement: result.agreement,
      txHash: result.txHash,
      events: db.getEvents(agreement.id),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Settlement failed' });
  }
});

// Get activity events for an agreement
agreementsRouter.get('/:id/activity', (req, res) => {
  const events = db.getEvents(req.params.id);
  res.json(events);
});
