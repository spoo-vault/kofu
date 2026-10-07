import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { Agreement, AgreementEvent, ParsedAgreementInput } from '@kofu/shared';

const AGREEMENTS_COLLECTION = 'agreements';
const EVENTS_COLLECTION = 'agreement_events';

export class FirestoreService {
  private static isAvailable(): boolean {
    return Boolean(firestoreDb);
  }

  /**
   * Save or update an agreement in Firestore
   */
  public static async saveAgreement(agreement: Agreement): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const ref = doc(firestoreDb, AGREEMENTS_COLLECTION, agreement.id);
      await setDoc(ref, {
        ...agreement,
        updatedAt: new Date().toISOString(),
        cloudTimestamp: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore saveAgreement notice:', err);
    }
  }

  /**
   * Log an agreement event in Firestore
   */
  public static async logEvent(event: AgreementEvent): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const eventId = event.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const ref = doc(firestoreDb, EVENTS_COLLECTION, eventId);
      await setDoc(ref, {
        ...event,
        id: eventId,
        cloudTimestamp: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore logEvent notice:', err);
    }
  }

  /**
   * Get an agreement by ID
   */
  public static async getAgreement(id: string): Promise<Agreement | null> {
    if (!this.isAvailable()) return null;
    try {
      const ref = doc(firestoreDb, AGREEMENTS_COLLECTION, id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as Agreement;
      }
      return null;
    } catch (err) {
      console.warn('Firestore getAgreement notice:', err);
      return null;
    }
  }

  /**
   * Subscribe to real-time changes on all agreements
   */
  /**
   * Subscribe to real-time changes on agreements (optionally filtered by connected wallet)
   */
  public static subscribeAgreements(
    callback: (agreements: Agreement[]) => void,
    walletAddress?: string | null
  ): Unsubscribe | null {
    if (!this.isAvailable()) return null;

    // Requirement 1: Do NOT expose session history without a connected wallet
    if (!walletAddress) {
      callback([]);
      return () => {};
    }

    const target = walletAddress.trim().toLowerCase();

    try {
      const q = query(collection(firestoreDb, AGREEMENTS_COLLECTION));
      return onSnapshot(
        q,
        (snapshot) => {
          const list: Agreement[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Agreement;
            // Filter out any legacy dummy seeds
            if (data.id === 'kofu-1789658758725' || data.id === 'kofu-1789659998124') {
              return;
            }

            // Requirement 3: Strict per-account session filtering
            const init = data.initiator?.trim().toLowerCase();
            const cpWallet = data.counterpartyWallet?.trim().toLowerCase();
            const cp = data.counterparty?.trim().toLowerCase();

            const isMyAccount =
              init === target ||
              cpWallet === target ||
              cp === target;

            if (isMyAccount) {
              list.push(data);
            }
          });
          // Sort client-side by createdAt descending
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(list);
        },
        (error) => {
          console.warn('Firestore real-time listener notice:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore subscribe notice:', err);
      return null;
    }
  }

  /**
   * Subscribe to real-time changes on a specific agreement
   */
  public static subscribeAgreement(
    id: string,
    callback: (agreement: Agreement | null) => void
  ): Unsubscribe | null {
    if (!this.isAvailable()) return null;
    try {
      const ref = doc(firestoreDb, AGREEMENTS_COLLECTION, id);
      return onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            callback(snapshot.data() as Agreement);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.warn('Firestore agreement listener notice:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore subscribe notice:', err);
      return null;
    }
  }

  /**
   * Subscribe to real-time event logs for an agreement
   */
  public static subscribeEvents(
    agreementId: string,
    callback: (events: AgreementEvent[]) => void
  ): Unsubscribe | null {
    if (!this.isAvailable()) return null;
    try {
      const q = query(collection(firestoreDb, EVENTS_COLLECTION));
      return onSnapshot(
        q,
        (snapshot) => {
          const events: AgreementEvent[] = [];
          snapshot.forEach((d) => {
            const ev = d.data() as AgreementEvent;
            if (ev.agreementId === agreementId) {
              events.push(ev);
            }
          });
          events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          callback(events);
        },
        (error) => {
          console.warn('Firestore events listener notice:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore events subscribe notice:', err);
      return null;
    }
  }
}
