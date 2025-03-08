'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run auth state listener in browser environment
    if (typeof window !== 'undefined' && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // If we're in SSR or auth is not available, set loading to false
      setLoading(false);
      return () => {};
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    if (db && userCredential.user) {
      const userRef = doc(db as Firestore, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        plantHavenName: "My Plant Haven",
        displayName: "",
      }, { merge: true });
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    if (!db) throw new Error('Firebase Firestore is not initialized');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth as Auth, provider);
      
      if (result.user) {
        // Create/update user document in Firestore
        const userRef = doc(db as Firestore, 'users', result.user.uid);
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          plantHavenName: "My Plant Haven",
          displayName: result.user.displayName || "",
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      throw error; // Re-throw to be handled by the component
    }
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 