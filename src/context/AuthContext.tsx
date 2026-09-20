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
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'lexiguide_demo_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate Firestore connection on boot
    testFirestoreConnection().catch(() => {});

    // Check if a demo session already exists in storage
    let savedDemoToken: string | null = null;
    let savedDemoUser: UserSession | null = null;
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token && parsed.user) {
          savedDemoToken = parsed.token;
          savedDemoUser = parsed.user;
          setDemoToken(savedDemoToken);
        }
      }
    } catch (e) {
      console.warn("Could not read demo session from localStorage", e);
    }

    // Register token getter with LexiGuideApi so all API calls include the live Bearer token
    LexiGuideApi.setTokenGetter(async () => {
      if (auth.currentUser) {
        try {
          return await auth.currentUser.getIdToken();
        } catch (e) {
          console.error("Failed to get current ID token:", e);
        }
      }
      return demoToken || savedDemoToken || null;
    });

    // Listen to Firebase token and user changes
    const unsubscribe = onIdTokenChanged(auth, async (current) => {
      setFirebaseUser(current);
      if (current) {
        setUser({
          uid: current.uid,
          email: current.email || '',
          displayName: current.displayName || current.email?.split('@')[0] || 'Authenticated User',
          photoURL: current.photoURL || undefined,
          isDemo: false
        });
        // Clear demo state if real user is signed in
        localStorage.removeItem(DEMO_STORAGE_KEY);
        setDemoToken(null);
      } else if (savedDemoUser) {
        setUser(savedDemoUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [demoToken]);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      // If popup blocked or unauthorized domain in iframe, provide clear helpful error
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not in Firebase Authorized Domains. Use "Explore Interactive Demo / Guest Workspace" below to test all features instantly.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser/iframe. Use "Explore Interactive Demo / Guest Workspace" below.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to complete Google Sign-In.');
      }
    }
  };

  const continueAsGuest = async () => {
    setError(null);
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/demo-session', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Failed to initialize demo session');
      }

      setDemoToken(data.token);
      setUser(data.user);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({
        token: data.token,
        user: data.user
      }));
    } catch (err: any) {
      console.error("Demo session error:", err);
      setError(err.message || 'Could not start guest session.');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setDemoToken(null);
    setUser(null);
    setFirebaseUser(null);
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error("Sign-out error:", err);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return demoToken;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        signInWithGoogle,
        continueAsGuest,
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
