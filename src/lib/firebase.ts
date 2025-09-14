
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, getFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-1014760813-be189",
  "appId": "1:772501385922:web:739fa93cd99c91c393c15b",
  "storageBucket": "studio-1014760813-be189.firebasestorage.app",
  "apiKey": "AIzaSyAIIOa4Sz_lyPVHyqGjNm3Px13XjlvxDlY",
  "authDomain": "studio-1014760813-be189.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "772501385922"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with persistence
// This setup is safe for both server and client. 
// Firestore's SDK handles the check for the browser environment internally.
let db;
try {
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: 'firestore-multitab'
        }),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
    });
} catch (e: any) {
    if (e.code === 'failed-precondition' || e.code === 'unimplemented') {
        console.warn(`Firestore persistence failed to enable in this tab. This is likely because another tab is already open or the browser does not support it. Offline capabilities may be limited.`);
        db = getFirestore(app);
    } else {
        console.error("Could not initialize Firestore with persistence", e);
        db = getFirestore(app);
    }
}


export { db };
