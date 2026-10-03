import { PolicyEngine, DEFAULT_POLICY } from '../services/ai/policy.js';
import { Agreement } from '../types/shared.js';

function runTests() {
  console.log('--- RUNNING POKA POLICY ENGINE TESTS ---');
  const engine = new PolicyEngine();

  // Test 1: Validate creation limits
  const validCheck = engine.validateAgreementCreation(50, 'GBZH7K5V6GZ6F5OXZXU7F5K7D2Z5H7A6C3Q7K2V5N6M8B4V2C1X3Z4A5');
  console.assert(validCheck.allowed === true, 'Valid creation should pass');

  const emptyCounterparty = engine.validateAgreementCreation(50, '');
  console.assert(emptyCounterparty.allowed === false, 'Empty counterparty must fail');

  const negativeAmount = engine.validateAgreementCreation(-10, 'David');
  console.assert(negativeAmount.allowed === false, 'Negative amount must fail');

  const excessiveAmount = engine.validateAgreementCreation(20000, 'David');
  console.assert(excessiveAmount.allowed === false, 'Amount over $10,000 must fail');

  // Test 2: Validate negotiation limits
  const allowedNegotiation = engine.validateNegotiation(65);
  console.assert(allowedNegotiation.allowed === true, 'Negotiation under $75 ceiling should pass');

  const excessiveNegotiation = engine.validateNegotiation(90);
  console.assert(excessiveNegotiation.allowed === false, 'Negotiation above $75 ceiling must require human approval');

  // Test 3: Validate fund release checks
  const mockAgreement: Agreement = {
    id: 'test-1',
    humanReadableId: 'POKA-TEST',
    initiator: 'Alice',
    counterparty: 'David',
    counterpartyType: 'human',
    amount: 50,
    currency: 'USDC',
    condition: 'Website delivered',
    deadline: 'Tomorrow',
    status: 'CONDITION_MET',
    autonomyLevel: 'AUTONOMOUS',
    escrowFunded: true,
    conditionSatisfied: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const allowedRelease = engine.validateFundRelease(mockAgreement);
  console.assert(allowedRelease.allowed === true, 'Fund release for satisfied funded agreement should pass');

  const unfundedAgreement = { ...mockAgreement, escrowFunded: false };
  console.assert(engine.validateFundRelease(unfundedAgreement).allowed === false, 'Unfunded agreement must not release');

  const unsatisfiedAgreement = { ...mockAgreement, conditionSatisfied: false };
  console.assert(engine.validateFundRelease(unsatisfiedAgreement).allowed === false, 'Unsatisfied agreement must not release');

  console.log('✅ ALL POLICY ENGINE TESTS PASSED!\n');
}

runTests();
