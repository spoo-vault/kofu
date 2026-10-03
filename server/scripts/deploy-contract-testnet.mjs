import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Keypair,
  Networks,
  TransactionBuilder,
  Operation,
  Address,
  nativeToScVal,
  scValToNative,
  rpc,
  xdr,
} from '@stellar/stellar-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC_URL = process.env.STELLAR_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

const WASM_PATH = path.resolve(
  __dirname,
  '../../contracts/soroban-kofu-escrow/target/wasm32-unknown-unknown/release/soroban_kofu_escrow.optimized.wasm'
);

async function fundWithFriendbot(publicKey) {
  console.log(`Funding account ${publicKey} with Friendbot...`);
  try {
    const response = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
    if (!response.ok) {
      const text = await response.text();
      console.log(`Friendbot response: ${response.status} ${text}`);
    } else {
      console.log(`Account ${publicKey} funded successfully.`);
    }
  } catch (err) {
    console.warn('Friendbot fetch notice:', err.message);
  }
}

async function signAndSend(server, tx, keypair) {
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(keypair);

  const sendResponse = await server.sendTransaction(prepared);
  if (sendResponse.status === 'ERROR') {
    throw new Error(`Transaction send error: ${JSON.stringify(sendResponse.errorResult)}`);
  }

  console.log(`Transaction submitted (hash: ${sendResponse.hash}). Waiting for ledger inclusion...`);
  
  let result = await server.pollTransaction(sendResponse.hash, { attempts: 30, interval: 2000 });
  if (result.status === 'SUCCESS') {
    return result;
  } else {
    throw new Error(`Transaction failed with status ${result.status}: ${JSON.stringify(result)}`);
  }
}

async function main() {
  console.log('========================================================');
  console.log('   KOFU Protocol - Soroban Testnet Contract Deployer    ');
  console.log('========================================================');

  if (!fs.existsSync(WASM_PATH)) {
    throw new Error(`WASM file not found at ${WASM_PATH}`);
  }
  const wasmBuffer = fs.readFileSync(WASM_PATH);
  console.log(`Loaded WASM: ${WASM_PATH} (${wasmBuffer.length} bytes)`);

  const server = new rpc.Server(RPC_URL);

  let deployerKeypair;
  const keyEnv = process.env.STELLAR_ADMIN_SECRET_KEY;
  if (keyEnv) {
    deployerKeypair = Keypair.fromSecret(keyEnv);
    console.log(`Using existing Admin key: ${deployerKeypair.publicKey()}`);
  } else {
    deployerKeypair = Keypair.random();
    console.log(`Generated new Deployer key: ${deployerKeypair.publicKey()}`);
    console.log(`Deployer Secret: ${deployerKeypair.secret()}`);
  }

  await fundWithFriendbot(deployerKeypair.publicKey());

  const sentinelKeypair = Keypair.random();
  console.log(`Sentinel Public Key: ${sentinelKeypair.publicKey()}`);

  let account = await server.getAccount(deployerKeypair.publicKey());
  console.log(`Deployer Account Sequence: ${account.sequenceNumber()}`);

  let contractId = process.env.STELLAR_CONTRACT_ID;
  let wasmHashHex = process.env.STELLAR_WASM_HASH || 'e04df071595082f729799e8abcd2dd4f46999006355df408013be48e8b9466f7';

  if (!contractId) {
    // Step 1: Upload WASM
    console.log('\n--- Step 1: Uploading Contract WASM ---');
    let uploadTx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(Operation.uploadContractWasm({ wasm: wasmBuffer }))
      .setTimeout(300)
      .build();

    const uploadResult = await signAndSend(server, uploadTx, deployerKeypair);
    
    const wasmHash = scValToNative(uploadResult.returnValue);
    wasmHashHex = Buffer.from(wasmHash).toString('hex');
    console.log(`WASM successfully installed! WASM Hash: ${wasmHashHex}`);

    account = await server.getAccount(deployerKeypair.publicKey());

    // Step 2: Instantiate Custom Contract
    console.log('\n--- Step 2: Instantiating Contract Instance ---');
    const deployerAddress = new Address(deployerKeypair.publicKey());
    const salt = Keypair.random().rawPublicKey();

    let createTx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.createCustomContract({
          address: deployerAddress,
          wasmHash: wasmHash,
          salt: salt,
        })
      )
      .setTimeout(300)
      .build();

    const createResult = await signAndSend(server, createTx, deployerKeypair);
    
    const contractAddressScVal = createResult.returnValue;
    contractId = Address.fromScVal(contractAddressScVal).toString();
    console.log(`Contract deployed! Contract ID: ${contractId}`);

    account = await server.getAccount(deployerKeypair.publicKey());
  } else {
    console.log(`Using existing Contract ID: ${contractId}`);
  }

  // Step 3: Initialize Contract
  console.log('\n--- Step 3: Initializing KofuEscrow with Admin & Sentinel ---');
  const initTx = new TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: contractId,
        function: 'initialize',
        args: [
          new Address(deployerKeypair.publicKey()).toScVal(),
          new Address(sentinelKeypair.publicKey()).toScVal(),
        ],
      })
    )
    .setTimeout(300)
    .build();

  const initResult = await signAndSend(server, initTx, deployerKeypair);
  console.log(`Contract initialized! Init Tx: ${initResult.txHash || 'Confirmed'}`);

  console.log('\n========================================================');
  console.log('   DEPLOYMENT COMPLETE ON STELLAR TESTNET!              ');
  console.log('========================================================');
  console.log(`Contract ID:       ${contractId}`);
  console.log(`WASM Hash:         ${wasmHashHex}`);
  console.log(`Admin Address:     ${deployerKeypair.publicKey()}`);
  console.log(`Admin Secret:      ${deployerKeypair.secret()}`);
  console.log(`Sentinel Address:  ${sentinelKeypair.publicKey()}`);
  console.log(`Sentinel Secret:   ${sentinelKeypair.secret()}`);
  console.log(`StellarExpert:     https://stellar.expert/explorer/testnet/contract/${contractId}`);
  console.log('========================================================');

  const deploymentInfo = {
    network: 'testnet',
    contractId,
    wasmHash: wasmHashHex,
    adminPublicKey: deployerKeypair.publicKey(),
    adminSecretKey: deployerKeypair.secret(),
    sentinelPublicKey: sentinelKeypair.publicKey(),
    sentinelSecretKey: sentinelKeypair.secret(),
    deployedAt: new Date().toISOString(),
    explorerUrl: `https://stellar.expert/explorer/testnet/contract/${contractId}`,
  };

  fs.writeFileSync(
    path.resolve(__dirname, '../../soroban-deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log('Saved deployment configuration to soroban-deployment.json');
}

main().catch((err) => {
  console.error('\nDeployment failed:', err);
  process.exit(1);
});
