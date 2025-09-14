
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

let db;

// Initialize Firestore with persistence only on the client-side
if (typeof window !== 'undefined') {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: 'MEMORY' }),
    });
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence failed to enable in this tab. This is likely because another tab is already open. Offline capabilities may be limited.');
      } else if (err.code === 'unimplemented') {
          console.warn('This browser does not support the necessary features for multi-tab persistence.');
      }
    });
  } catch (e) {
    console.error("Could not initialize Firestore with persistence", e);
    // Fallback to memory cache if persistence fails
    db = initializeFirestore(app, { localCache: memoryLocalCache() });
  }
} else {
  // For server-side rendering, use memory cache
  db = initializeFirestore(app, { localCache: memoryLocalCache() });
}


export { db };
