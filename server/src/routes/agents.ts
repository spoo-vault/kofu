import { Router } from 'express';
import { AgentNegotiator } from '../services/ai/negotiator.js';

export const agentsRouter = Router();

agentsRouter.get('/', (_req, res) => {
  res.json([
    {
      id: 'agent-buyer',
      name: 'POKA Buyer Agent',
      type: 'autonomous_delegated',
      status: 'ONLINE',
      address: 'GBZH7K5V6GZ6F5OXZXU7F5K7D2Z5H7A6C3Q7K2V5N6M8B4V2C1X3Z4A5',
      reputation: 99.4,
      role: 'buyer',
      activeAgreements: 2,
    },
    {
      id: 'agent-seller',
      name: 'David Autonomous Agent',
      type: 'counterparty_delegated',
      status: 'ONLINE',
      address: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ',
      reputation: 98.1,
      role: 'seller',
      activeAgreements: 1,
    },
    {
      id: 'agent-research',
      name: 'Research Agent Alpha',
      type: 'autonomous_delegated',
      status: 'ONLINE',
      address: 'GCLY7B3JNXU7M2K5P4A9B1C3D5E7F9G1H3J5K7L9M1N3P5Q7R9S1T3U5',
      reputation: 99.8,
      role: 'buyer',
      activeAgreements: 1,
    },
    {
      id: 'agent-data',
      name: 'Stellar Data Oracle Agent',
      type: 'autonomous_delegated',
      status: 'ONLINE',
      address: 'GAKF5M7N9P1Q3R5S7T9U1V3W5X7Y9Z1A3B5C7D9E1F3G5H7J9K1L3M5N',
      reputation: 100.0,
      role: 'seller',
      activeAgreements: 1,
    }
  ]);
});

agentsRouter.post('/simulate-negotiation', (req, res) => {
  const { amount = 50, condition = 'Website delivered', deadline = '24 Hours', currency = 'USDC' } = req.body;
  const result = AgentNegotiator.simulateNegotiation(amount, condition, deadline, currency);
  res.json(result);
});
