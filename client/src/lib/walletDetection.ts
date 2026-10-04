import { isConnected as isFreighterConnected, isAllowed as isFreighterAllowed } from '@stellar/freighter-api';
import { isConnected as isLobstrConnected } from '@lobstrco/signer-extension-api';

export interface DetectedExtensions {
  freighter: boolean;
  lobstr: boolean;
  xbull: boolean;
  metamask: boolean;
}

type DetectionListener = (status: DetectedExtensions) => void;

class WalletDetectionService {
  private status: DetectedExtensions = {
    freighter: false,
    lobstr: false,
    xbull: false,
    metamask: false,
  };

  private listeners: DetectionListener[] = [];
  private probing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Run immediate sync check
      this.runSyncCheck();

      // 2. Schedule async probe passes
      this.probeAll();
      setTimeout(() => this.probeAll(), 150);
      setTimeout(() => this.probeAll(), 500);
      setTimeout(() => this.probeAll(), 1500);
      setTimeout(() => this.probeAll(), 3000);

      // 3. Listen to window message events from extension content scripts
      window.addEventListener('message', (event) => {
        const d = event.data;
        if (
          d?.source === 'FREIGHTER_EXTERNAL_MSG_RESPONSE' ||
          d?.source === 'FREIGHTER_MSG' ||
          d?.type?.includes?.('FREIGHTER') ||
          d?.source?.includes?.('LOBSTR') ||
          d?.type?.includes?.('STELLAR')
        ) {
          this.probeAll();
        }
      });

      // 4. Listen to DOM mutation / load events
      window.addEventListener('load', () => this.probeAll());
    }
  }

  public getStatus(): DetectedExtensions {
    return { ...this.status };
  }

  public subscribe(listener: DetectionListener): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const current = this.getStatus();
    for (const listener of this.listeners) {
      try {
        listener(current);
      } catch (err) {
        console.warn('Wallet detection listener error:', err);
      }
    }
  }

  public runSyncCheck(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as any;

    let changed = false;

    // Freighter sync check
    const hasFreighterSync = Boolean(
      win.freighter !== undefined ||
      win.freighterApi !== undefined ||
      win.stellar?.provider === 'freighter' ||
      win.stellar?.freighter !== undefined ||
      win.stellar !== undefined ||
      document.querySelector('meta[name="freighter"]') !== null
    );
    if (hasFreighterSync && !this.status.freighter) {
      this.status.freighter = true;
      changed = true;
    }

    // LOBSTR sync check
    const hasLobstrSync = Boolean(win.lobstr !== undefined || win.lobstrSignerExtension !== undefined);
    if (hasLobstrSync && !this.status.lobstr) {
      this.status.lobstr = true;
      changed = true;
    }

    // xBull sync check
    const hasXbullSync = Boolean(win.xBullSDK !== undefined || win.xbull !== undefined);
    if (hasXbullSync && !this.status.xbull) {
      this.status.xbull = true;
      changed = true;
    }

    // MetaMask sync check
    const hasMetaMaskSync = Boolean(win.ethereum?.isMetaMask);
    if (hasMetaMaskSync && !this.status.metamask) {
      this.status.metamask = true;
      changed = true;
    }

    if (changed) {
      this.notify();
    }

    return changed;
  }

  public async probeAll(): Promise<DetectedExtensions> {
    this.runSyncCheck();

    if (this.probing) return this.getStatus();
    this.probing = true;

    try {
      // Parallel probe with timeout guarantees
      const freighterPromise = (async (): Promise<boolean> => {
        if (this.status.freighter) return true;
        try {
          const timeout = new Promise<{ isConnected: boolean }>((r) =>
            setTimeout(() => r({ isConnected: false }), 800)
          );
          const res = (await Promise.race([isFreighterConnected(), timeout])) as any;
          if (!res.error && res.isConnected) return true;

          // Also check isFreighterAllowed
          const allowTimeout = new Promise<{ isAllowed: boolean }>((r) =>
            setTimeout(() => r({ isAllowed: false }), 800)
          );
          const allowRes = (await Promise.race([isFreighterAllowed(), allowTimeout])) as any;
          if (!allowRes.error && allowRes.isAllowed) return true;

          return false;
        } catch {
          return false;
        }
      })();

      const lobstrPromise = (async (): Promise<boolean> => {
        if (this.status.lobstr) return true;
        try {
          const timeout = new Promise<boolean>((r) =>
            setTimeout(() => r(false), 800)
          );
          const res = await Promise.race([isLobstrConnected(), timeout]);
          return Boolean(res);
        } catch {
          return false;
        }
      })();

      const [fResult, lResult] = await Promise.allSettled([
        freighterPromise,
        lobstrPromise,
      ]);

      let changed = false;

      if (fResult.status === 'fulfilled' && fResult.value && !this.status.freighter) {
        this.status.freighter = true;
        changed = true;
      }

      if (lResult.status === 'fulfilled' && lResult.value && !this.status.lobstr) {
        this.status.lobstr = true;
        changed = true;
      }

      // Re-run sync check in case globals were populated during async wait
      if (this.runSyncCheck()) {
        changed = true;
      }

      if (changed) {
        this.notify();
      }
    } finally {
      this.probing = false;
    }

    return this.getStatus();
  }
}

export const walletDetectionService = new WalletDetectionService();
