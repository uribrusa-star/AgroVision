
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, memoryLocalCache, enableMultiTabIndexedDbPersistence, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-1014760813-be189",
  "appId": "1:772501385922:web:739fa93cd99c91c393c15b",
  "storageBucket": "studio-1014760813-be189.firebasestorage.app",
  "apiKey": "AIzaSyAIIOa4Sz_lyPVHyqGjNm3Px13XjlvxDlY",
  "authDomain": "studio-1014760813-be189.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "772501385922"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

// Enable multi-tab persistence only on the client-side
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
          // This can happen if another tab is already open and has exclusive access.
          // The app will still work with memory-only persistence in this tab.
          console.warn('Firestore persistence failed to enable in this tab. This is likely because another tab is already open. Offline capabilities may be limited.');
      } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the features required to enable this persistence mode.
          console.warn('This browser does not support the necessary features for multi-tab persistence.');
      }
  });
}

export { db };
