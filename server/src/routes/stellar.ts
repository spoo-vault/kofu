import { Router } from 'express';
import { stellarClient } from '../services/stellar/client.js';
import { stellarAccountService } from '../services/stellar/account.js';
import { stellarConfig } from '../services/stellar/config.js';

export const stellarRouter = Router();

// Get Stellar and Soroban network details
stellarRouter.get('/status', async (_req, res) => {
  try {
    const details = await stellarClient.getNetworkDetails();
    res.json(details);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch Stellar network status' });
  }
});

// Generate fresh Stellar Keypair
stellarRouter.post('/keypair', (_req, res) => {
  const pair = stellarAccountService.generateKeypair();
  res.json(pair);
});

// Fund account via Stellar Friendbot
stellarRouter.post('/faucet', async (req, res) => {
  const { publicKey } = req.body;
  if (!publicKey || !stellarAccountService.isValidPublicKey(publicKey)) {
    res.status(400).json({ error: 'Valid Stellar public key (G...) is required' });
    return;
  }

  try {
    const success = await stellarAccountService.fundWithFriendbot(publicKey);
    if (success) {
      res.json({ success: true, message: `Account ${publicKey} funded successfully with testnet XLM` });
    } else {
      res.status(500).json({ error: 'Friendbot faucet request failed' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Faucet funding error' });
  }
});

// Query Stellar account balances
stellarRouter.get('/account/:publicKey', async (req, res) => {
  const { publicKey } = req.params;
  if (!stellarAccountService.isValidPublicKey(publicKey)) {
    res.status(400).json({ error: 'Invalid Stellar public key' });
    return;
  }

  try {
    const balances = await stellarAccountService.getBalances(publicKey);
    res.json({ publicKey, balances });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to query account balances' });
  }
});
