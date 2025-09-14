
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, getFirestore, Firestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

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

let db: Firestore | null = null;

// Function to get the Firestore instance, initializing it differently for client and server.
export const getFirestoreInstance = () => {
    if (db) {
        return db;
    }

    if (typeof window !== 'undefined') {
        // Client-side execution
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
    } else {
        // Server-side execution
        db = getFirestore(app);
    }

    return db;
}
