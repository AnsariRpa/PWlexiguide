/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { getFirebaseAdmin } from "./firebaseAdmin";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    isDemo?: boolean;
  };
}

const DEMO_SECRET = process.env.SESSION_SECRET || "lexiguide-secure-demo-secret-salt-2026";

/**
 * Creates a cryptographically signed demo token for interactive preview / guest mode.
 */
export function createDemoToken(uid: string, name: string): string {
  const payload = Buffer.from(JSON.stringify({ uid, name, iat: Date.now() })).toString("base64url");
  const signature = crypto.createHmac("sha256", DEMO_SECRET).update(payload).digest("base64url");
  return `demo.${payload}.${signature}`;
}

/**
 * Verifies HMAC signature on demo tokens.
 */
export function verifyDemoToken(token: string): { uid: string; name: string } | null {
  if (!token.startsWith("demo.")) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [, payload, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", DEMO_SECRET).update(payload).digest("base64url");
  if (signature !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return data;
  } catch {
    return null;
  }
}

/**
 * Authentication middleware that verifies either:
 * 1. A verified Firebase ID token from Google Sign-In
 * 2. An HMAC-signed demo token for instant guest evaluation
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Authentication required. Please provide a valid Bearer token."
    });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();
  if (!idToken) {
    res.status(401).json({
      error: "Authentication token missing or invalid."
    });
    return;
  }

  // 1. Check for signed demo / guest token
  const demoData = verifyDemoToken(idToken);
  if (demoData) {
    req.user = {
      uid: demoData.uid,
      name: demoData.name,
      email: `${demoData.uid}@lexiguide.local`,
      isDemo: true
    };
    next();
    return;
  }

  // 2. Otherwise verify via Firebase Admin SDK
  try {
    const { auth } = getFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(idToken);

    // Attach verified user identity from decoded token
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      isDemo: false
    };

    next();
  } catch (err: any) {
    console.warn("Firebase ID token verification failed:", err?.code || err?.message);
    res.status(401).json({
      error: "Invalid or expired authentication session. Please sign in again."
    });
  }
}

