// Firebase Admin SDK initialization for server-side use (API routes only).
// Separate from lib/firebase.ts (which is client-side) to avoid pulling
// firebase/auth (and its undici dependency) into server bundles.
//
// CONFIG: Set FIREBASE_PROJECT_ID (already in NEXT_PUBLIC_FIREBASE_PROJECT_ID)
// and a service account key for server-side Firestore access:
//   FIREBASE_CLIENT_EMAIL=
//   FIREBASE_PRIVATE_KEY=
//   (or GOOGLE_APPLICATION_CREDENTIALS path to a JSON key file)
//
// Until configured, server routes run in DEMO MODE using the local store.

import { initializeApp, getApps, cert, type App as AdminApp } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, type Firestore as AdminFirestore } from 'firebase-admin/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export const isAdminConfigured = Boolean(projectId && clientEmail && privateKey);

let adminApp: AdminApp | null = null;
let adminDb: AdminFirestore | null = null;

if (isAdminConfigured) {
  adminApp = getApps().length ? getApps()[0] : initializeApp({ projectId, credential: cert({ projectId, clientEmail, privateKey }) });
  adminDb = getAdminFirestore(adminApp);
}

export { adminApp, adminDb };
