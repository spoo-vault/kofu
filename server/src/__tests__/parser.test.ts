import { AgreementParser } from '../services/ai/parser.js';

function runTests() {
  console.log('--- RUNNING KOFU AI PARSER TESTS ---');

  // Test 1: Standard USD/USDC prompt
  const p1 = AgreementParser.parseDeterministic('Pay David $50 when he delivers the website tomorrow.');
  console.assert(p1.amount === 50, 'Parsed amount should be 50');
  console.assert(p1.currency === 'USDC', 'Default currency should be USDC');
  console.assert(p1.counterparty.includes('David'), 'Counterparty should be David');
  console.assert(p1.condition.includes('delivers the website'), 'Condition should match');

  // Test 2: Stellar XLM prompt
  const p2 = AgreementParser.parseDeterministic('Release 100 XLM to Auditor once smart contract verification passes by 2026-10-15.');
  console.assert(p2.amount === 100, 'Parsed amount should be 100');
  console.assert(p2.currency === 'XLM', 'Currency should be XLM');
  console.assert(p2.counterpartyType === 'agent', 'Auditor should be recognized as agent');

  // Test 3: Agent-to-Agent 25 USDC
  const p3 = AgreementParser.parseDeterministic('Send Research Agent 25 USDC once verified dataset is delivered.');
  console.assert(p3.amount === 25, 'Parsed amount should be 25');
  console.assert(p3.currency === 'USDC', 'Currency should be USDC');
  console.assert(p3.counterpartyType === 'agent', 'Research Agent should be agent type');

  console.log('✅ ALL PARSER TESTS PASSED!\n');
}

runTests();
