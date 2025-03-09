import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, type Firestore } from 'firebase/firestore';

interface UserProfile {
  displayName?: string;
  plantHavenName?: string;
  email?: string;
  uid?: string;
}

/**
 * Get user profile data from Firestore
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!db) throw new Error('Firebase Firestore is not initialized');
    
    const userRef = doc(db as Firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    } else {
      console.log('No user profile found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update user profile data in Firestore
 */
export const updateUserProfile = async (userId: string, data: UserProfile): Promise<void> => {
  try {
    if (!db) throw new Error('Firebase Firestore is not initialized');
    
    const userRef = doc(db as Firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      await updateDoc(userRef, data as { [key: string]: string | number | boolean | null | undefined });
    } else {
      // Create the document if it doesn't exist
      await setDoc(userRef, {
        uid: userId,
        ...data
      } as { [key: string]: string | number | boolean | null | undefined });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}; 