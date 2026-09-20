/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onIdTokenChanged
} from 'firebase/auth';
import { auth, googleProvider, testFirestoreConnection } from '../services/firebaseClient';
import { LexiGuideApi } from '../services/api';
import { UserSession } from '../types';

interface AuthContextType {
  user: UserSession | null;
  firebaseUser: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate Firestore connection on boot
    testFirestoreConnection().catch(() => {});

    // Register token getter with LexiGuideApi so all API calls include the live Bearer token
    LexiGuideApi.setTokenGetter(async () => {
      if (!auth.currentUser) return null;
      try {
        return await auth.currentUser.getIdToken();
      } catch (e) {
        console.error("Failed to get current ID token:", e);
        return null;
      }
    });

    // Listen to Firebase token and user changes
    const unsubscribe = onIdTokenChanged(auth, async (current) => {
      setFirebaseUser(current);
      if (current) {
        setUser({
          uid: current.uid,
          email: current.email || '',
          displayName: current.displayName || current.email?.split('@')[0] || 'Authenticated User',
          photoURL: current.photoURL || undefined
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      // Suppress standard popup closed by user error
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to complete Google Sign-In.');
      }
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error("Sign-out error:", err);
      setError(err.message || 'Failed to sign out.');
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        signInWithGoogle,
        signOut,
        getIdToken,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
