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

export function getFirebaseAdmin(): { app: App; db: Firestore; auth: Auth } {
  if (!adminApp) {
    let projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
    let databaseId: string | undefined = undefined;

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
        projectId: projectId || "symmetric-scholar-xcjpc"
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
