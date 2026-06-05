import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let auth = null;
let db = null;
let isFirebaseConnected = false;

try {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  // Resiliency Execution Check
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here') {
    throw new Error('Firebase configuration missing or incomplete.');
  }

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseConnected = true;
  console.log("Firebase initialized successfully. Cloud Sync active.");

} catch (error) {
  console.warn("Firebase initialization skipped or failed:", error.message);
  console.warn("Running in Offline Local Storage Active fallback mode.");
  auth = null;
  db = null;
  isFirebaseConnected = false;
}

export { auth, db, isFirebaseConnected };
