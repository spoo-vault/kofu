import { Router } from 'express';
import { db } from '../db/store.js';
import { stellarConfig } from '../services/stellar/config.js';

export const transactionsRouter = Router();

transactionsRouter.get('/', (_req, res) => {
  res.json(db.getTransactions());
});

transactionsRouter.get('/network', (_req, res) => {
  res.json({
    network: stellarConfig.network,
    horizonUrl: stellarConfig.horizonUrl,
    sorobanRpcUrl: stellarConfig.sorobanRpcUrl,
    passphrase: stellarConfig.networkPassphrase,
    contractId: stellarConfig.contractId,
    adminPublicKey: stellarConfig.adminPublicKey,
    demoMode: stellarConfig.isDemoMode,
  });
});
