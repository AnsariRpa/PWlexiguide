/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { defaultFirebaseConfig } from "./firebaseConfigDefault";

const firebaseConfig = defaultFirebaseConfig;

// Helper to determine if an env var is a genuine value rather than a placeholder/dummy name
function getEffectiveConfigValue(envVal: string | undefined, defaultVal: string | undefined): string {
  if (
    typeof envVal === "string" &&
    envVal.trim().length > 0 &&
    !envVal.startsWith("firebaseConfig.") &&
    !envVal.startsWith("YOUR_") &&
    !envVal.endsWith(".ts") &&
    !envVal.endsWith(".js")
  ) {
    return envVal.trim();
  }
  return defaultVal || "";
}

// Ensure API key starts with valid Google API key prefix "AIza" if provided via env, otherwise fallback to firebaseConfig
const rawEnvApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const effectiveApiKey = (typeof rawEnvApiKey === "string" && rawEnvApiKey.startsWith("AIza"))
  ? rawEnvApiKey
  : ((firebaseConfig as any)?.apiKey || "");

// Initialize Firebase client configuration using firebase-applet-config.json as primary source of truth
const activeFirebaseConfig = {
  apiKey: effectiveApiKey,
  authDomain: getEffectiveConfigValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, (firebaseConfig as any)?.authDomain),
  projectId: getEffectiveConfigValue(import.meta.env.VITE_FIREBASE_PROJECT_ID, (firebaseConfig as any)?.projectId),
  storageBucket: getEffectiveConfigValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, (firebaseConfig as any)?.storageBucket),
  messagingSenderId: getEffectiveConfigValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, (firebaseConfig as any)?.messagingSenderId),
  appId: getEffectiveConfigValue(import.meta.env.VITE_FIREBASE_APP_ID, (firebaseConfig as any)?.appId),
};

// Initialize Firebase client instance
const app = getApps().length === 0 ? initializeApp(activeFirebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Initialize client Firestore (passing named databaseId if configured)
const effectiveDbId = getEffectiveConfigValue(import.meta.env.VITE_FIREBASE_DATABASE_ID, (firebaseConfig as any)?.firestoreDatabaseId);
export const db = effectiveDbId && effectiveDbId !== "(default)"
  ? getFirestore(app, effectiveDbId)
  : getFirestore(app);

// Connection test helper according to skill requirement
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Client offline check. Firebase connection initializing.");
    }
  }
}

export default app;
