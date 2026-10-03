import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agreementsRouter } from './routes/agreements.js';
import { transactionsRouter } from './routes/transactions.js';
import { agentsRouter } from './routes/agents.js';
import { stellarRouter } from './routes/stellar.js';
import { stellarConfig } from './services/stellar/config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3005;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/agreements', agreementsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/stellar', stellarRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'KOFU Autonomous Economic Agreement Protocol',
    chain: 'Stellar & Soroban',
    network: stellarConfig.network === 'public' ? 'Stellar Mainnet' : 'Stellar Testnet',
    sorobanContractId: stellarConfig.contractId,
    timestamp: new Date().toISOString(),
  });
});

if (!process.env.VERCEL && !process.env.SERVERLESS) {
  app.listen(PORT, () => {
    console.log(`[KOFU SERVER] Running on port ${PORT}`);
    console.log(`[KOFU SERVER] Stellar Network: ${stellarConfig.network === 'public' ? 'Stellar Mainnet' : 'Stellar Testnet'}`);
    console.log(`[KOFU SERVER] Soroban Contract ID: ${stellarConfig.contractId}`);
  });
}

export { app };
export default app;
