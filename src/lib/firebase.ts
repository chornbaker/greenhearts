// Firebase configuration
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence, setPersistence } from 'firebase/auth';
import { Firestore, initializeFirestore, CACHE_SIZE_UNLIMITED, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy-api-key-for-build',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy-domain.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy-bucket.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-0000000000',
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Check if IndexedDB is available and working
const checkIndexedDBAvailability = (): boolean => {
  try {
    // Feature detection for IndexedDB
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported');
      return false;
    }
    
    // Try to open a test database
    const testDb = window.indexedDB.open('test-db');
    
    // Add event handlers to catch errors
    testDb.onerror = () => {
      console.warn('IndexedDB test open failed');
      return false;
    };
    
    return true;
  } catch (error) {
    console.warn('IndexedDB check failed:', error);
    return false;
  }
};

// Only initialize Firebase in the browser environment
if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    // Initialize auth
    auth = getAuth(app);
    
    // Set appropriate persistence based on browser support
    const isIndexedDBAvailable = checkIndexedDBAvailability();
    
    if (auth) {
      // Set auth persistence based on IndexedDB availability
      setPersistence(auth, isIndexedDBAvailable ? browserLocalPersistence : browserSessionPersistence)
        .catch((error) => {
          console.warn('Auth persistence fallback error:', error);
          // Final fallback to in-memory persistence if needed
          setPersistence(auth as Auth, inMemoryPersistence).catch(e => console.error('Final auth persistence fallback failed:', e));
        });
    }
    
    // Initialize Firestore with appropriate settings
    if (isIndexedDBAvailable) {
      // Use persistent cache if IndexedDB is available
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
          cacheSizeBytes: CACHE_SIZE_UNLIMITED
        })
      });
    } else {
      // Fallback to memory-only cache
      console.warn('Using in-memory Firestore cache due to IndexedDB limitations');
      db = initializeFirestore(app, {
        localCache: memoryLocalCache()
      });
    }
    
    // Initialize storage
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Provide fallbacks or graceful degradation here
  }
}

export { app, auth, db, storage }; 