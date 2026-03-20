import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is provided, not a placeholder, and app doesn't exist
const isConfigValid = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your_');

const app =
  !getApps().length && isConfigValid
    ? initializeApp(firebaseConfig)
    : getApps().length > 0 ? getApp() : null;

export const auth = app ? getAuth(app) : null;
