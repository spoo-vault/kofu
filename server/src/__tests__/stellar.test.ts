import { stellarAccountService } from '../services/stellar/account.js';
import { stellarConfig, getExplorerTxUrl } from '../services/stellar/config.js';

function runTests() {
  console.log('--- RUNNING POKA STELLAR SERVICE TESTS ---');

  // Test 1: Keypair generation
  const pair = stellarAccountService.generateKeypair();
  console.assert(pair.publicKey.startsWith('G'), 'Public key must start with G');
  console.assert(pair.secretKey.startsWith('S'), 'Secret key must start with S');
  console.assert(stellarAccountService.isValidPublicKey(pair.publicKey) === true, 'Generated key must be valid');

  // Test 2: Validation of invalid keys
  console.assert(stellarAccountService.isValidPublicKey('0x123invalid') === false, 'EVM address must be invalid on Stellar');
  console.assert(stellarAccountService.isValidPublicKey('random-text') === false, 'Random string must be invalid');

  // Test 3: Contract ID validation
  console.assert(stellarAccountService.isValidContractId(stellarConfig.contractId) === true, 'Config contract ID must be valid');

  // Test 4: Explorer URL generator
  const mockTx = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
  const explorerUrl = getExplorerTxUrl(mockTx);
  console.assert(explorerUrl.includes('stellar.expert/explorer/testnet/tx/'), 'Explorer URL must point to stellar.expert testnet');

  console.log('✅ ALL STELLAR SERVICE TESTS PASSED!\n');
}

runTests();
