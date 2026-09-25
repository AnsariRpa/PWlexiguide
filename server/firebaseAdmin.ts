/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

let adminApp: App | null = null;
let firestoreDb: Firestore | null = null;
let authAdmin: Auth | null = null;

const DEFAULT_PROJECT_ID = "symmetric-scholar-xcjpc";
const DEFAULT_DATABASE_ID = "ai-studio-lexiguide-e69b607a-ac07-4d3f-984c-1cff1514a0c8";

export function getFirebaseAdmin(): { app: App; db: Firestore; auth: Auth } {
  if (!adminApp) {
    let projectId = process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
    let databaseId: string | undefined = process.env.VITE_FIREBASE_DATABASE_ID || DEFAULT_DATABASE_ID;

    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (config.projectId) projectId = config.projectId;
        if (config.firestoreDatabaseId) databaseId = config.firestoreDatabaseId;
      }
    } catch (e) {
      console.warn("Could not read firebase-applet-config.json:", e);
    }

    const apps = getApps();
    if (apps.length > 0) {
      adminApp = apps[0];
    } else {
      adminApp = initializeApp({
        projectId
      });
    }

    authAdmin = getAuth(adminApp);

    if (databaseId && databaseId !== "(default)") {
      try {
        firestoreDb = getFirestore(adminApp, databaseId);
      } catch (err) {
        console.warn(`Could not initialize Firestore with databaseId ${databaseId}, using default database:`, err);
        firestoreDb = getFirestore(adminApp);
      }
    } else {
      firestoreDb = getFirestore(adminApp);
    }
  }

  return { app: adminApp, db: firestoreDb!, auth: authAdmin! };
}
