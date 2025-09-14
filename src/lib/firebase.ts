
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, memoryLocalCache, getFirestore, Firestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

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

let db: Firestore;

// Function to get the Firestore instance, initializing it differently for client and server.
const getFirestoreInstance = () => {
    if (db) {
        return db;
    }

    if (typeof window !== 'undefined') {
        // Client-side execution
        try {
            db = initializeFirestore(app, {
                // Use persistent cache with tab synchronization.
                // This allows multiple tabs to share the same offline cache.
                localCache: persistentLocalCache({
                    tabManager: 'firestore-multitab'
                }),
                cacheSizeBytes: CACHE_SIZE_UNLIMITED
            });
        } catch (e: any) {
            if (e.code === 'failed-precondition') {
                 console.warn('Firestore persistence failed to enable in this tab. This is likely because another tab is already open. Offline capabilities may be limited.');
                 // Fallback to memory cache if persistence fails
                 db = getFirestore(app);
            } else if (e.code === 'unimplemented') {
                 console.warn('This browser does not support the necessary features for multi-tab persistence.');
                 // Fallback to memory cache
                 db = getFirestore(app);
            } else {
                console.error("Could not initialize Firestore with persistence", e);
                // Fallback to memory cache for other errors
                db = getFirestore(app);
            }
        }
    } else {
        // Server-side execution
        db = getFirestore(app);
    }

    return db;
}


// Export a single db instance by calling the function.
// The logic inside ensures it's initialized correctly for the environment.
db = getFirestoreInstance();

export { db };
