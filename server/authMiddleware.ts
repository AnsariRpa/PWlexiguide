/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from "express";
import { getFirebaseAdmin } from "./firebaseAdmin";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
  };
}

/**
 * Authentication middleware that verifies the Firebase ID token in the Authorization header.
 * Enforces production-grade identity: Never trusts x-user-id or query params.
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

  try {
    const { auth } = getFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(idToken);

    // Attach verified user identity from decoded token
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    };

    next();
  } catch (err: any) {
    console.warn("Firebase ID token verification failed:", err?.code || err?.message);
    res.status(401).json({
      error: "Invalid or expired authentication session. Please sign in again."
    });
  }
}
