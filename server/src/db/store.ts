import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Agreement, AgreementEvent, Transaction, SentinelStatus } from '../types/shared.js';

interface StorageSchema {
  agreements: Record<string, Agreement>;
  events: Record<string, AgreementEvent[]>;
  transactions: Record<string, Transaction>;
  counter: number;
}

class DataStore {
  private agreements: Map<string, Agreement> = new Map();
  private events: Map<string, AgreementEvent[]> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private counter: number = 1;
  private filePath: string;

  constructor() {
    // Resolve safe persistence path (works in local, Render, or /tmp in serverless)
    let storageDir = process.env.DATA_DIR;
    if (!storageDir) {
      if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        storageDir = '/tmp';
      } else {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        storageDir = path.resolve(__dirname, '../../data');
      }
    }

    try {
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
    } catch {
      storageDir = '/tmp';
    }

    this.filePath = path.join(storageDir, 'poka-db.json');
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const data: StorageSchema = JSON.parse(raw);

        if (data.agreements) {
          for (const [k, v] of Object.entries(data.agreements)) {
            this.agreements.set(k, v);
          }
        }
        if (data.events) {
          for (const [k, v] of Object.entries(data.events)) {
            this.events.set(k, v);
          }
        }
        if (data.transactions) {
          for (const [k, v] of Object.entries(data.transactions)) {
            this.transactions.set(k, v);
          }
        }
        if (typeof data.counter === 'number') {
          this.counter = data.counter;
        }
      }
    } catch (err) {
      console.warn('[POKA DB] No existing DB file or failed to read. Starting with clean state.');
    }
  }

  private saveToDisk(): void {
    try {
      const data: StorageSchema = {
        agreements: Object.fromEntries(this.agreements.entries()),
        events: Object.fromEntries(this.events.entries()),
        transactions: Object.fromEntries(this.transactions.entries()),
        counter: this.counter,
      };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[POKA DB] Persistence write skipped:', (err as Error)?.message);
    }
  }

  public getNextHumanReadableId(): string {
    const id = `KOFU-${String(this.counter).padStart(3, '0')}`;
    this.counter++;
    this.saveToDisk();
    return id;
  }

  public getAgreements(): Agreement[] {
    return Array.from(this.agreements.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getAgreement(id: string): Agreement | undefined {
    return this.agreements.get(id) || Array.from(this.agreements.values()).find(
      a => a.humanReadableId.toLowerCase() === id.toLowerCase()
    );
  }

  public saveAgreement(agreement: Agreement): Agreement {
    agreement.updatedAt = new Date().toISOString();
    this.agreements.set(agreement.id, agreement);
    this.saveToDisk();
    return agreement;
  }

  public addEvent(agreementId: string, event: Omit<AgreementEvent, 'id' | 'timestamp'>): AgreementEvent {
    const newEvent: AgreementEvent = {
      ...event,
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    const list = this.events.get(agreementId) || [];
    list.push(newEvent);
    this.events.set(agreementId, list);
    this.saveToDisk();
    return newEvent;
  }

  public getEvents(agreementId: string): AgreementEvent[] {
    return this.events.get(agreementId) || [];
  }

  public addTransaction(tx: Transaction): Transaction {
    this.transactions.set(tx.id, tx);
    this.saveToDisk();
    return tx;
  }

  public getTransactions(): Transaction[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getSentinelStatus(): SentinelStatus {
    const active = Array.from(this.agreements.values()).filter(
      a => a.status === 'ESCROWED' || a.status === 'MONITORING' || a.status === 'CONDITION_MET'
    );
    const totalEscrow = active.reduce((sum, a) => sum + (a.escrowFunded ? a.amount : 0), 0);

    const isLive = process.env.DEMO_MODE === 'false';
    const network = isLive
      ? (process.env.STELLAR_NETWORK === 'public' ? 'STELLAR_MAINNET' : 'STELLAR_TESTNET')
      : 'STELLAR_TESTNET';

    return {
      activeSentinelsCount: active.length,
      totalInEscrow: totalEscrow,
      currency: 'USDC',
      status: 'SYNCED',
      network,
      currentLedger: 1248590,
      sorobanContractId: process.env.STELLAR_CONTRACT_ID || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    };
  }

  public clearAll(): void {
    this.agreements.clear();
    this.events.clear();
    this.transactions.clear();
    this.counter = 1;
    this.saveToDisk();
  }
}

export const db = new DataStore();
