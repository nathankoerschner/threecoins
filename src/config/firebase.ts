import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, Auth } from 'firebase/auth';
// @ts-expect-error - getReactNativePersistence exists but types are incomplete
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || '',
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Auth with AsyncStorage persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // If already initialized, just get the instance
  auth = getAuth(app);
}

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Realtime Database
const database = getDatabase(app);

export { auth, firestore, database };
export default app;
