// Firebase initialization module.
// All Firebase interactions (Firestore, Auth, Storage) go through here.
//
// CONFIG: Add your Firebase project credentials in `.env.local`.
// Copy `.env.local.example` to `.env.local` and fill in the values
// from the Firebase console (Project settings > General > Your apps > Web app).
//
//   NEXT_PUBLIC_FIREBASE_API_KEY=
//   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
//   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
//   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
//   NEXT_PUBLIC_FIREBASE_APP_ID=
//
// Until these are provided, the app runs in DEMO MODE using a local
// in-browser store (lib/store.ts) so the UI works without a backend.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured && typeof window !== 'undefined') {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };

// Hardcode admin UIDs here (or use env var NEXT_PUBLIC_ADMIN_UIDS, comma separated).
// Replace with the real Firebase UIDs of the shop owner(s).
const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export function isAdminUid(uid?: string | null): boolean {
  if (!uid) return false;
  // Demo fallback: in demo mode without configured admins, the local demo
  // admin account (see lib/store.ts) is always treated as admin.
  if (!isFirebaseConfigured) return uid === 'demo-admin';
  return ADMIN_UIDS.includes(uid);
}
