import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInAnonymously,
  onAuthStateChanged,
  linkWithCredential,
  AuthCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAnon: () => Promise<User>;
  linkAccount: (credential: AuthCredential) => Promise<User>;
  isAnonymous: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInAnon: async () => {
    throw new Error('AuthContext not initialized');
  },
  linkAccount: async () => {
    throw new Error('AuthContext not initialized');
  },
  isAnonymous: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user document in Firestore
  const initializeUserDocument = async (userId: string, isNewUser: boolean) => {
    const userRef = doc(firestore, 'users', userId);

    if (isNewUser) {
      // Create new user document
      await setDoc(userRef, {
        createdAt: serverTimestamp(),
        lastFreeReading: null,
        credits: 0,
        subscription: {
          status: 'none',
          expiresAt: null,
          monthlyReadingsUsed: 0,
          monthlyResetAt: null,
        },
        analytics: {
          totalCasts: 0,
          paidConversions: 0,
        },
      });
    } else {
      // Existing user - just verify document exists
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        // Edge case: user exists but document doesn't
        await setDoc(userRef, {
          createdAt: serverTimestamp(),
          lastFreeReading: null,
          credits: 0,
          subscription: {
            status: 'none',
            expiresAt: null,
            monthlyReadingsUsed: 0,
            monthlyResetAt: null,
          },
          analytics: {
            totalCasts: 0,
            paidConversions: 0,
          },
        });
      }
    }
  };

  // Sign in anonymously
  const signInAnon = async (): Promise<User> => {
    try {
      const result = await signInAnonymously(auth);
      await initializeUserDocument(result.user.uid, true);
      return result.user;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  };

  // Link anonymous account to permanent account (Apple/Google)
  const linkAccount = async (credential: AuthCredential): Promise<User> => {
    if (!user) {
      throw new Error('No user to link');
    }

    try {
      const result = await linkWithCredential(user, credential);
      return result.user;
    } catch (error) {
      console.error('Error linking account:', error);
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Ensure user document exists
        await initializeUserDocument(firebaseUser.uid, false);
      } else {
        // No user - sign in anonymously
        try {
          await signInAnon();
        } catch (error) {
          console.error('Failed to sign in anonymously:', error);
          setUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signInAnon,
    linkAccount,
    isAnonymous: user?.isAnonymous ?? true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
