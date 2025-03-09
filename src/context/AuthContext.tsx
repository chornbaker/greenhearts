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
      try {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
        }, (error) => {
          console.error('Auth state change error:', error);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Setting up auth state listener failed:', error);
        setLoading(false);
        return () => {};
      }
    } else {
      // If we're in SSR or auth is not available, set loading to false
      setLoading(false);
      return () => {};
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      if (db && userCredential.user) {
        try {
          const userRef = doc(db as Firestore, 'users', userCredential.user.uid);
          await setDoc(userRef, {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            plantHavenName: "My GreenHearts",
            displayName: "Human",
          }, { merge: true });
        } catch (firestoreError) {
          console.error('Error creating user document:', firestoreError);
          // Continue even if Firestore fails - the user is still created in Auth
        }
      }
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth as Auth, provider);
      
      if (result.user && db) {
        try {
          // Extract first name from displayName
          let firstName = "";
          if (result.user.displayName) {
            // Split the display name by spaces and take the first part
            firstName = result.user.displayName.split(' ')[0];
          }
          
          // Create or update user document in Firestore
          const userRef = doc(db as Firestore, 'users', result.user.uid);
          await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email,
            displayName: firstName || "Human",
            plantHavenName: "My GreenHearts",
            photoURL: result.user.photoURL,
          }, { merge: true });
        } catch (firestoreError) {
          console.error('Error creating/updating user document after Google sign-in:', firestoreError);
          // Continue even if Firestore fails - the user is still authenticated
        }
      }
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      throw error;
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