import { StellarWalletsKit, Networks, KitEventType, SwkAppDarkTheme } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import {
  requestAccess as requestFreighterAccess,
  getAddress as getFreighterAddress,
  signTransaction as signFreighterTransaction,
} from '@stellar/freighter-api';

export type SupportedWalletId = 'freighter' | 'lobstr' | 'xbull' | 'albedo' | 'agent';

export interface WalletInfo {
  id: SupportedWalletId;
  name: string;
  badge: string;
  description: string;
  icon: string;
  recommended?: boolean;
}

export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    id: 'freighter',
    name: 'Freighter',
    badge: 'Extension & App',
    description: 'The premier browser extension and mobile wallet for Stellar and Soroban.',
    icon: '🚀',
    recommended: true,
  },
  {
    id: 'lobstr',
    name: 'LOBSTR',
    badge: 'Mobile & Web',
    description: 'Leading mobile wallet for Stellar assets, supporting WalletConnect & signer extensions.',
    icon: '🦞',
  },
  {
    id: 'albedo',
    name: 'Albedo',
    badge: 'Web Signer (Instant)',
    description: 'Zero install needed. Signs securely via browser popup on any device.',
    icon: '✨',
  },
  {
    id: 'xbull',
    name: 'xBull Wallet',
    badge: 'Multi-Platform',
    description: 'Feature-rich power wallet with native Soroban smart contract support.',
    icon: '🐂',
  },
  {
    id: 'agent',
    name: 'Autonomous Agent',
    badge: 'Instant Devnet/Testnet',
    description: 'Auto-generated Stellar keypair for programmatic autonomous negotiation and testing.',
    icon: '🤖',
  },
];

class StellarWalletService {
  private initialized = false;
  private currentWallet: SupportedWalletId | null = null;
  private currentAddress: string | null = null;
  private listeners: ((address: string | null, walletId: SupportedWalletId | null) => void)[] = [];

  constructor() {
    this.restoreSession();
  }

  private initKit() {
    if (this.initialized) return;
    try {
      StellarWalletsKit.init({
        network: Networks.TESTNET,
        theme: SwkAppDarkTheme,
        modules: [
          new FreighterModule(),
          new LobstrModule(),
          new xBullModule(),
          new AlbedoModule(),
        ],
        authModal: {
          showInstallLabel: true,
          hideUnsupportedWallets: false,
        },
      });

      // Listen for internal kit state updates
      StellarWalletsKit.on(KitEventType.STATE_UPDATED, (ev) => {
        if (ev.payload?.address) {
          this.setConnected(ev.payload.address, this.currentWallet || 'freighter');
        }
      });

      StellarWalletsKit.on(KitEventType.DISCONNECT, () => {
        this.clearSession();
      });

      this.initialized = true;
    } catch (err) {
      console.warn('StellarWalletsKit init notice:', err);
    }
  }

  private restoreSession() {
    try {
      const savedAddress = localStorage.getItem('kofu_wallet_address');
      const savedWallet = localStorage.getItem('kofu_wallet_id') as SupportedWalletId | null;
      if (savedAddress) {
        this.currentAddress = savedAddress;
        this.currentWallet = savedWallet || 'freighter';
      }
    } catch {
      // LocalStorage unavailable
    }
  }

  private persistSession(address: string, walletId: SupportedWalletId) {
    try {
      localStorage.setItem('kofu_wallet_address', address);
      localStorage.setItem('kofu_wallet_id', walletId);
    } catch {
      // ignore
    }
  }

  private clearSession() {
    this.currentAddress = null;
    this.currentWallet = null;
    try {
      localStorage.removeItem('kofu_wallet_address');
      localStorage.removeItem('kofu_wallet_id');
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(listener: (address: string | null, walletId: SupportedWalletId | null) => void) {
    this.listeners.push(listener);
    listener(this.currentAddress, this.currentWallet);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.currentAddress, this.currentWallet);
    }
  }

  public getAddress(): string | null {
    return this.currentAddress;
  }

  public getWalletId(): SupportedWalletId | null {
    return this.currentWallet;
  }

  public isConnected(): boolean {
    return !!this.currentAddress;
  }

  /**
   * Connects via a specific chosen wallet
   */
  public async connect(walletId: SupportedWalletId): Promise<{ address: string; walletId: SupportedWalletId }> {
    this.initKit();

    if (walletId === 'agent') {
      // Generate or retrieve persistent local testnet agent address
      let agentKey = localStorage.getItem('kofu_agent_pubkey');
      if (!agentKey) {
        agentKey = 'GBZH' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 36).toString(36).toUpperCase()).join('').substring(0, 48) + '4A5';
        localStorage.setItem('kofu_agent_pubkey', agentKey);
      }
      this.setConnected(agentKey, 'agent');
      return { address: agentKey, walletId: 'agent' };
    }

    if (walletId === 'freighter') {
      try {
        const access = await requestFreighterAccess();
        if (access?.address && !access.error) {
          this.setConnected(access.address, 'freighter');
          return { address: access.address, walletId: 'freighter' };
        }
      } catch (fErr) {
        console.warn('Direct Freighter requestAccess notice, attempting StellarWalletsKit:', fErr);
      }
    }

    try {
      StellarWalletsKit.setWallet(walletId);
      const res = await StellarWalletsKit.getAddress();
      if (!res.address) {
        // Fallback to fetchAddress if getAddress returns empty
        const fetched = await StellarWalletsKit.fetchAddress();
        if (!fetched.address) {
          throw new Error(`Unable to fetch address from ${walletId}. Please make sure your wallet is unlocked.`);
        }
        res.address = fetched.address;
      }
      this.setConnected(res.address, walletId);
      return { address: res.address, walletId };
    } catch (err: any) {
      throw new Error(err?.message || `Failed to connect with ${walletId}`);
    }
  }

  /**
   * Opens the universal Stellar Wallets Kit authentication modal
   */
  public async openUniversalModal(): Promise<{ address: string }> {
    this.initKit();
    try {
      const res = await StellarWalletsKit.authModal();
      if (res?.address) {
        const mod = StellarWalletsKit.selectedModule;
        const walletId = (mod?.productId as SupportedWalletId) || 'freighter';
        this.setConnected(res.address, walletId);
        return { address: res.address };
      }
      throw new Error('No address returned from Stellar Wallets Kit');
    } catch (err: any) {
      throw new Error(err?.message || 'Wallet connection was cancelled');
    }
  }

  /**
   * Signs a transaction XDR with the currently connected wallet
   */
  public async signTransaction(xdr: string): Promise<{ signedTxXdr: string }> {
    this.initKit();

    if (this.currentWallet === 'agent') {
      // Synthetic signature for simulated agent transactions
      return { signedTxXdr: xdr };
    }

    if (this.currentWallet === 'freighter') {
      try {
        const fRes = await signFreighterTransaction(xdr, {
          networkPassphrase: Networks.TESTNET,
        });
        if (fRes?.signedTxXdr && !fRes.error) {
          return { signedTxXdr: fRes.signedTxXdr };
        }
      } catch (fErr) {
        console.warn('Direct Freighter signTransaction notice, trying Kit fallback:', fErr);
      }
    }

    try {
      const res = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: Networks.TESTNET,
      });
      return { signedTxXdr: res.signedTxXdr };
    } catch (err: any) {
      throw new Error(err?.message || 'Transaction signing rejected or failed.');
    }
  }

  public async disconnect(): Promise<void> {
    try {
      this.initKit();
      await StellarWalletsKit.disconnect();
    } catch {
      // ignore
    } finally {
      this.clearSession();
    }
  }

  private setConnected(address: string, walletId: SupportedWalletId) {
    this.currentAddress = address;
    this.currentWallet = walletId;
    this.persistSession(address, walletId);
    this.notify();
  }
}

export const stellarWalletService = new StellarWalletService();
