import {
  rpc,
  Networks,
  TransactionBuilder,
  Operation,
  Address,
  nativeToScVal,
  scValToNative,
  StrKey,
} from '@stellar/stellar-sdk';
import { stellarWalletService } from './stellarWallets';
import { Agreement } from '@kofu/shared';

export const TESTNET_SOROBAN_RPC = 'https://soroban-testnet.stellar.org';
export const TESTNET_HORIZON = 'https://horizon-testnet.stellar.org';
export const TESTNET_PASSPHRASE = Networks.TESTNET;
export const CONTRACT_ID = 'CAXNYG4P32DU3EVJLAN6HZ3PR67OZGABG4VRFIYITJQZDHR76X6RSVJS';

// Stellar Asset Contract (SAC) IDs on Stellar Testnet
export const NATIVE_XLM_SAC = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
export const TESTNET_USDC_SAC = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA';

// Fallback Counterparty (Alice testnet key)
export const DEFAULT_COUNTERPARTY = 'GBZH7K5V6GZ6F5OXZXU7F5K7D2Z5H7A6C3Q7K2V5N6M8B4V2C1X3Z4A5';

export interface EscrowFundingResult {
  success: boolean;
  txHash: string;
  ledger?: number;
  explorerUrl: string;
  contractId: string;
  error?: string;
}

export class SorobanEscrowClient {
  private static rpcServer = new rpc.Server(TESTNET_SOROBAN_RPC);

  /**
   * Request testnet XLM funding via Friendbot
   */
  public static async requestFriendbot(address: string): Promise<boolean> {
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Locks agreement funds directly into the Soroban escrow smart contract
   */
  public static async fundEscrowOnChain(agreement: Agreement): Promise<EscrowFundingResult> {
    const buyerAddress = stellarWalletService.getAddress();
    if (!buyerAddress) {
      throw new Error('No Stellar wallet connected. Please connect Freighter, LOBSTR, Albedo, or xBull.');
    }

    const walletId = stellarWalletService.getWalletId();

    // Clean agreement ID for Soroban Symbol (letters, numbers, underscore only, max 32 chars)
    const rawSymbol = agreement.id.replace(/[^a-zA-Z0-9_]/g, '_');
    const symbolStr = rawSymbol.length > 30 ? rawSymbol.substring(0, 30) : rawSymbol;

    // Resolve Counterparty Stellar Address
    let sellerAddress = DEFAULT_COUNTERPARTY;
    if (agreement.counterparty && StrKey.isValidEd25519PublicKey(agreement.counterparty)) {
      sellerAddress = agreement.counterparty;
    }

    // Resolve SAC token contract
    const tokenContract = agreement.currency === 'USDC' ? TESTNET_USDC_SAC : NATIVE_XLM_SAC;

    // Amount in stroops (7 decimals)
    const stroops = BigInt(Math.max(1, Math.floor(agreement.amount * 10_000_000)));

    console.log(`[SorobanClient] Initiating escrow deposit for ${agreement.id}:`, {
      contract: CONTRACT_ID,
      symbol: symbolStr,
      buyer: buyerAddress,
      seller: sellerAddress,
      token: tokenContract,
      stroops: stroops.toString(),
      wallet: walletId,
    });

    try {
      // 1. Fetch account state or fund if brand new
      let account;
      try {
        account = await this.rpcServer.getAccount(buyerAddress);
      } catch (err: any) {
        console.log('[SorobanClient] Account not found on Testnet. Requesting Friendbot airdrop...');
        await this.requestFriendbot(buyerAddress);
        // Wait 2s for ledger inclusion
        await new Promise((r) => setTimeout(r, 2000));
        account = await this.rpcServer.getAccount(buyerAddress);
      }

      // 2. Fetch latest ledger to set timeout
      let latestLedger = 1250000;
      try {
        const latest = await this.rpcServer.getLatestLedger();
        latestLedger = latest.sequence;
      } catch {
        // Fallback
      }
      const timeoutLedger = latestLedger + 17280; // ~24 hours

      // 3. Build Soroban invocation transaction
      const tx = new TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: TESTNET_PASSPHRASE,
      })
        .addOperation(
          Operation.invokeContractFunction({
            contract: CONTRACT_ID,
            function: 'deposit',
            args: [
              nativeToScVal(symbolStr, { type: 'symbol' }),
              new Address(buyerAddress).toScVal(),
              new Address(sellerAddress).toScVal(),
              new Address(tokenContract).toScVal(),
              nativeToScVal(stroops, { type: 'i128' }),
              nativeToScVal(timeoutLedger, { type: 'u32' }),
            ],
          })
        )
        .setTimeout(300)
        .build();

      // 4. Simulate & Prepare via Soroban RPC
      console.log('[SorobanClient] Simulating & preparing transaction footprint with Soroban RPC...');
      const prepared = await this.rpcServer.prepareTransaction(tx);

      // 5. Prompt User Wallet for Signature
      console.log(`[SorobanClient] Requesting signature from ${walletId}...`);
      const { signedTxXdr } = await stellarWalletService.signTransaction(prepared.toXDR());

      // 6. Broadcast Signed Transaction to Stellar Testnet
      console.log('[SorobanClient] Submitting signed transaction to Stellar Testnet...');
      const signedTx = TransactionBuilder.fromXDR(signedTxXdr, TESTNET_PASSPHRASE);
      const sendRes = await this.rpcServer.sendTransaction(signedTx);

      if (sendRes.status === 'ERROR') {
        throw new Error(`Stellar RPC rejected transaction: ${JSON.stringify(sendRes.errorResult)}`);
      }

      console.log(`[SorobanClient] Transaction submitted! Hash: ${sendRes.hash}. Waiting for ledger inclusion...`);
      const pollRes = await this.rpcServer.pollTransaction(sendRes.hash);

      if (pollRes.status === 'SUCCESS') {
        console.log(`[SorobanClient] Escrow locked in ledger ${pollRes.latestLedger}! Hash: ${sendRes.hash}`);
        return {
          success: true,
          txHash: sendRes.hash,
          ledger: pollRes.latestLedger,
          contractId: CONTRACT_ID,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${sendRes.hash}`,
        };
      } else {
        throw new Error(`Soroban transaction failed on-chain: ${JSON.stringify(pollRes)}`);
      }
    } catch (err: any) {
      console.warn('[SorobanClient] On-chain deposit error/fallback:', err);
      throw err;
    }
  }
}
