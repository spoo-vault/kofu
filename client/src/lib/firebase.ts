import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: 'kofuapp1',
  appId: '1:283519127941:web:13c8d0adc472b74be674ec',
  storageBucket: 'kofuapp1.firebasestorage.app',
  apiKey: 'AIzaSyAow5rETxEXP7sgqUVH37inBSNusuq9dWc',
  authDomain: 'kofuapp1.firebaseapp.com',
  messagingSenderId: '283519127941',
  measurementId: 'G-QZXHHPETEB',
};

let app: FirebaseApp;
let db: Firestore;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
} catch (err) {
  console.warn('Firebase init notice:', err);
}

export const firebaseApp = app!;
export const firestoreDb = db!;
