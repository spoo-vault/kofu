import { Networks } from '@stellar/stellar-sdk';

export interface StellarConfig {
  network: 'testnet' | 'public';
  horizonUrl: string;
  sorobanRpcUrl: string;
  networkPassphrase: string;
  contractId: string;
  adminPublicKey: string;
  adminSecretKey?: string;
  usdcAssetCode: string;
  usdcIssuer: string;
  friendbotUrl: string;
  isDemoMode: boolean;
}

const isMainnet = process.env.STELLAR_NETWORK === 'public' || process.env.STELLAR_NETWORK === 'mainnet';

export const stellarConfig: StellarConfig = {
  network: isMainnet ? 'public' : 'testnet',
  horizonUrl: isMainnet
    ? (process.env.STELLAR_HORIZON_URL || 'https://horizon.stellar.org')
    : (process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'),
  sorobanRpcUrl: isMainnet
    ? (process.env.STELLAR_SOROBAN_RPC_URL || 'https://soroban-rpc.mainnet.stellar.org')
    : (process.env.STELLAR_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org'),
  networkPassphrase: isMainnet ? Networks.PUBLIC : Networks.TESTNET,
  contractId: process.env.STELLAR_CONTRACT_ID || 'CAXNYG4P32DU3EVJLAN6HZ3PR67OZGABG4VRFIYITJQZDHR76X6RSVJS',
  adminPublicKey: process.env.STELLAR_ADMIN_PUBLIC_KEY || 'GBFOWEYQWBD6QSKBXMAXY2JFRDD7XAEZXHWFWXHQYK374M3YEWJYIQWQ',
  adminSecretKey: process.env.STELLAR_ADMIN_SECRET_KEY,
  usdcAssetCode: 'USDC',
  // Official Circle USDC on Stellar Testnet and Mainnet
  usdcIssuer: isMainnet
    ? (process.env.STELLAR_USDC_ISSUER || 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN')
    : (process.env.STELLAR_USDC_ISSUER || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'),
  friendbotUrl: 'https://friendbot.stellar.org',
  isDemoMode: process.env.DEMO_MODE === 'true',
};

export function getExplorerTxUrl(txHash: string): string {
  const net = stellarConfig.network === 'public' ? 'public' : 'testnet';
  return `https://stellar.expert/explorer/${net}/tx/${txHash}`;
}

export function getExplorerAccountUrl(address: string): string {
  const net = stellarConfig.network === 'public' ? 'public' : 'testnet';
  return `https://stellar.expert/explorer/${net}/account/${address}`;
}

export function getExplorerContractUrl(contractId: string): string {
  const net = stellarConfig.network === 'public' ? 'public' : 'testnet';
  return `https://stellar.expert/explorer/${net}/contract/${contractId}`;
}
