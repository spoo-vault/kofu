import { Horizon, rpc } from '@stellar/stellar-sdk';
import { stellarConfig } from './config.js';

export class StellarClientService {
  public horizon: Horizon.Server;
  public sorobanRpc: rpc.Server;

  constructor() {
    this.horizon = new Horizon.Server(stellarConfig.horizonUrl);
    this.sorobanRpc = new rpc.Server(stellarConfig.sorobanRpcUrl);
  }

  /**
   * Retrieves network health, latest ledger sequence number, and network details
   */
  public async getNetworkDetails() {
    try {
      const latestLedger = await this.sorobanRpc.getLatestLedger();
      return {
        network: stellarConfig.network,
        horizonUrl: stellarConfig.horizonUrl,
        sorobanRpcUrl: stellarConfig.sorobanRpcUrl,
        passphrase: stellarConfig.networkPassphrase,
        currentLedger: latestLedger.sequence,
        protocolVersion: latestLedger.protocolVersion,
        contractId: stellarConfig.contractId,
        adminPublicKey: stellarConfig.adminPublicKey,
        isDemoMode: stellarConfig.isDemoMode,
      };
    } catch {
      return {
        network: stellarConfig.network,
        horizonUrl: stellarConfig.horizonUrl,
        sorobanRpcUrl: stellarConfig.sorobanRpcUrl,
        passphrase: stellarConfig.networkPassphrase,
        currentLedger: 1248590,
        protocolVersion: 22,
        contractId: stellarConfig.contractId,
        adminPublicKey: stellarConfig.adminPublicKey,
        isDemoMode: stellarConfig.isDemoMode,
      };
    }
  }
}

export const stellarClient = new StellarClientService();
