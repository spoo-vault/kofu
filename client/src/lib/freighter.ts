import { isConnected, requestAccess, getAddress, getNetwork } from '@stellar/freighter-api';

export interface FreighterWalletState {
  connected: boolean;
  publicKey: string | null;
  network: string | null;
  error?: string | null;
}

export class FreighterService {
  /**
   * Checks if Freighter extension is installed in the browser
   */
  public static async isAvailable(): Promise<boolean> {
    try {
      const result = await isConnected();
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Prompts the user to connect their Freighter wallet
   */
  public static async connect(): Promise<FreighterWalletState> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return {
          connected: false,
          publicKey: null,
          network: null,
          error: 'Freighter wallet extension is not installed. Please install Freighter from freighter.app.',
        };
      }

      // Request user access
      const accessObj = await requestAccess();
      if (accessObj.error) {
        return {
          connected: false,
          publicKey: null,
          network: null,
          error: accessObj.error,
        };
      }

      const addressObj = await getAddress();
      const networkObj = await getNetwork();

      return {
        connected: !!addressObj.address,
        publicKey: addressObj.address || null,
        network: networkObj.network || 'TESTNET',
      };
    } catch (err: any) {
      return {
        connected: false,
        publicKey: null,
        network: null,
        error: err?.message || 'Failed to connect to Freighter wallet.',
      };
    }
  }

  /**
   * Retrieves active wallet address if already connected
   */
  public static async getActiveAddress(): Promise<string | null> {
    try {
      const addressObj = await getAddress();
      return addressObj.address || null;
    } catch {
      return null;
    }
  }
}
