import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plant } from '@/types';

const PLANTS_COLLECTION = 'plants';

/**
 * Get all plants for a user
 * @param userId The user ID
 * @returns Array of plants
 */
export async function getUserPlants(userId: string): Promise<Plant[]> {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const plantsQuery = query(
      collection(db, PLANTS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(plantsQuery);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        lastWatered: data.lastWatered?.toDate(),
        nextWateringDate: data.nextWateringDate?.toDate(),
      } as Plant;
    });
  } catch (error) {
    console.error('Error getting user plants:', error);
    throw error;
  }
}

/**
 * Get a single plant by ID
 * @param plantId The plant ID
 * @returns The plant or null if not found
 */
export async function getPlant(plantId: string): Promise<Plant | null> {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const plantDoc = await getDoc(doc(db, PLANTS_COLLECTION, plantId));
    
    if (!plantDoc.exists()) {
      return null;
    }
    
    const data = plantDoc.data();
    return {
      id: plantDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      lastWatered: data.lastWatered?.toDate(),
      nextWateringDate: data.nextWateringDate?.toDate(),
    } as Plant;
  } catch (error) {
    console.error('Error getting plant:', error);
    throw error;
  }
}

/**
 * Create a new plant
 * @param plant The plant data
 * @returns The created plant with ID
 */
export async function createPlant(plant: Omit<Plant, 'id' | 'createdAt'>): Promise<Plant> {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const plantData = {
      ...plant,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, PLANTS_COLLECTION), plantData);
    
    return {
      id: docRef.id,
      ...plant,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating plant:', error);
    throw error;
  }
}

/**
 * Update an existing plant
 * @param plantId The plant ID
 * @param updates The updates to apply
 * @returns Promise that resolves when the update is complete
 */
export async function updatePlant(
  plantId: string,
  updates: Partial<Omit<Plant, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const plantRef = doc(db, PLANTS_COLLECTION, plantId);
    await updateDoc(plantRef, updates);
  } catch (error) {
    console.error('Error updating plant:', error);
    throw error;
  }
}

/**
 * Delete a plant
 * @param plantId The plant ID
 * @returns Promise that resolves when the deletion is complete
 */
export async function deletePlant(plantId: string): Promise<void> {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const plantRef = doc(db, PLANTS_COLLECTION, plantId);
    await deleteDoc(plantRef);
  } catch (error) {
    console.error('Error deleting plant:', error);
    throw error;
  }
}

/**
 * Update the last watered date for a plant
 * @param plantId The plant ID
 * @param date The date the plant was watered (defaults to now)
 * @returns Promise that resolves when the update is complete
 */
export async function waterPlant(
  plantId: string,
  date: Date = new Date()
): Promise<void> {
  try {
    const plant = await getPlant(plantId);
    
    if (!plant) {
      throw new Error('Plant not found');
    }
    
    const frequency = plant.wateringSchedule.frequency;
    const nextWateringDate = new Date(date);
    nextWateringDate.setDate(nextWateringDate.getDate() + frequency);
    
    await updatePlant(plantId, {
      lastWatered: date,
      nextWateringDate,
      wateringSchedule: {
        ...plant.wateringSchedule,
        lastWatered: date,
        nextWateringDate,
      },
    });
  } catch (error) {
    console.error('Error watering plant:', error);
    throw error;
  }
}

/**
 * Save thirsty messages for a user's plants
 * @param userId The user ID
 * @param messages Object mapping plant IDs to thirsty messages
 * @returns Promise that resolves when the update is complete
 */
export async function saveThirstyMessages(
  userId: string,
  messages: Record<string, string>
): Promise<void> {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      thirstyMessages: messages,
      thirstyMessagesUpdatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving thirsty messages:', error);
    throw error;
  }
}

/**
 * Get thirsty messages for a user's plants
 * @param userId The user ID
 * @returns Object mapping plant IDs to thirsty messages
 */
export async function getThirstyMessages(
  userId: string
): Promise<{
  messages: Record<string, string>;
  updatedAt: Date | null;
}> {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { messages: {}, updatedAt: null };
    }
    
    const data = userDoc.data();
    return {
      messages: data.thirstyMessages || {},
      updatedAt: data.thirstyMessagesUpdatedAt?.toDate() || null
    };
  } catch (error) {
    console.error('Error getting thirsty messages:', error);
    return { messages: {}, updatedAt: null };
  }
} 