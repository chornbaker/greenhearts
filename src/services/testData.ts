import { 
  collection, 
  doc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  writeBatch,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Plant, PlantHealth } from '@/types';

const PLANTS_COLLECTION = 'plants';
const USERS_COLLECTION = 'users';

/**
 * Clear all test data for a specific user
 * @param userId The user ID to clear data for
 */
export async function clearUserData(userId: string): Promise<void> {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    // Delete all plants for the user
    const plantsQuery = query(
      collection(db, PLANTS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(plantsQuery);
    
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`Cleared ${snapshot.docs.length} plants for user ${userId}`);
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
}

/**
 * Populate test data for a specific user
 * @param userId The user ID to populate data for
 */
export async function populateTestData(userId: string): Promise<void> {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    if (!storage) throw new Error('Firebase Storage is not initialized');
    
    // First clear existing data
    await clearUserData(userId);
    
    // Create batch for efficient writes
    const batch = writeBatch(db);
    
    // Sample plant data with realistic information
    const testPlants = await generateTestPlants(userId);
    
    // Add plants to Firestore
    for (const plant of testPlants) {
      const plantRef = doc(collection(db, PLANTS_COLLECTION));
      batch.set(plantRef, {
        ...plant,
        id: plantRef.id,
        createdAt: serverTimestamp(),
      });
    }
    
    await batch.commit();
    
    console.log(`Added ${testPlants.length} test plants for user ${userId}`);
  } catch (error) {
    console.error('Error populating test data:', error);
    throw error;
  }
}

/**
 * Generate test plant data with realistic information
 * @param userId The user ID to generate data for
 */
async function generateTestPlants(userId: string): Promise<Omit<Plant, 'id' | 'createdAt'>[]> {
  // Sample plant data with realistic information
  const plantData = [
    {
      name: 'Monstera Deliciosa',
      species: 'Monstera Deliciosa',
      location: 'Living Room',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.appspot.com/o/test-plants%2Fmonstera.jpg?alt=media',
      wateringFrequency: 7, // days
      notes: 'Loves bright indirect light. Allow soil to dry out between waterings.',
      health: PlantHealth.Excellent,
    },
    {
      name: 'Fiddle Leaf Fig',
      species: 'Ficus Lyrata',
      location: 'Living Room',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.appspot.com/o/test-plants%2Ffiddle-leaf-fig.jpg?alt=media',
      wateringFrequency: 7, // days
      notes: 'Keep in bright indirect light. Sensitive to overwatering and drafts.',
      health: PlantHealth.Good,
    },
    {
      name: 'Snake Plant',
      species: 'Sansevieria Trifasciata',
      location: 'Bedroom',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.appspot.com/o/test-plants%2Fsnake-plant.jpg?alt=media',
      wateringFrequency: 14, // days
      notes: 'Very drought tolerant. Let soil dry completely between waterings.',
      health: PlantHealth.Excellent,
    },
    {
      name: 'Pothos',
      species: 'Epipremnum Aureum',
      location: 'Office',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.appspot.com/o/test-plants%2Fpothos.jpg?alt=media',
      wateringFrequency: 7, // days
      notes: 'Adaptable to various light conditions. Water when top inch of soil is dry.',
      health: PlantHealth.Good,
    },
    {
      name: 'Peace Lily',
      species: 'Spathiphyllum',
      location: 'Bathroom',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.appspot.com/o/test-plants%2Fpeace-lily.jpg?alt=media',
      wateringFrequency: 5, // days
      notes: 'Loves humidity. Droops when thirsty but recovers quickly after watering.',
      health: PlantHealth.Fair,
    },
    {
      name: 'ZZ Plant',
      species: 'Zamioculcas Zamiifolia',
      location: 'Hallway',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.appspot.com/o/test-plants%2Fzz-plant.jpg?alt=media',
      wateringFrequency: 14, // days
      notes: 'Very drought tolerant. Can survive in low light conditions.',
      health: PlantHealth.Excellent,
    },
    {
      name: 'Aloe Vera',
      species: 'Aloe Barbadensis Miller',
      location: 'Kitchen',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.appspot.com/o/test-plants%2Faloe-vera.jpg?alt=media',
      wateringFrequency: 21, // days
      notes: 'Medicinal plant. Needs bright light and infrequent watering.',
      health: PlantHealth.Good,
    },
    {
      name: 'Spider Plant',
      species: 'Chlorophytum Comosum',
      location: 'Living Room',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.appspot.com/o/test-plants%2Fspider-plant.jpg?alt=media',
      wateringFrequency: 7, // days
      notes: 'Easy to propagate from the "babies" it produces. Likes bright indirect light.',
      health: PlantHealth.Excellent,
    },
    {
      name: 'Rubber Plant',
      species: 'Ficus Elastica',
      location: 'Office',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.appspot.com/o/test-plants%2Frubber-plant.jpg?alt=media',
      wateringFrequency: 7, // days
      notes: 'Wipe leaves occasionally to keep them dust-free and shiny.',
      health: PlantHealth.Good,
    },
    {
      name: 'Boston Fern',
      species: 'Nephrolepis Exaltata',
      location: 'Bathroom',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.appspot.com/o/test-plants%2Fboston-fern.jpg?alt=media',
      wateringFrequency: 3, // days
      notes: 'Loves humidity and indirect light. Keep soil consistently moist.',
      health: PlantHealth.Fair,
    },
  ];

  // Create plants with proper structure
  const now = new Date();
  
  return plantData.map((plant, index) => {
    // Randomize last watered date between 1-6 days ago
    const daysAgo = Math.floor(Math.random() * 6) + 1;
    const lastWatered = new Date(now);
    lastWatered.setDate(lastWatered.getDate() - daysAgo);
    
    // Calculate next watering date
    const nextWateringDate = new Date(lastWatered);
    nextWateringDate.setDate(nextWateringDate.getDate() + plant.wateringFrequency);
    
    return {
      userId,
      name: plant.name,
      species: plant.species,
      image: plant.imageUrl,
      location: plant.location,
      wateringSchedule: {
        frequency: plant.wateringFrequency,
        lastWatered,
        nextWateringDate,
      },
      notes: plant.notes,
      health: plant.health,
      lastWatered,
      nextWateringDate,
    };
  });
}

/**
 * Upload test plant images to Firebase Storage
 * This function should be run once to set up the test images
 */
export async function uploadTestImages(): Promise<void> {
  try {
    if (!storage) throw new Error('Firebase Storage is not initialized');
    
    // This would typically fetch images from a local directory or URL
    // For this example, we'll just log that this would upload images
    console.log('This function would upload test plant images to Firebase Storage');
    
    // In a real implementation, you would:
    // 1. Get the image files (from local or fetch from URLs)
    // 2. Upload each to Firebase Storage
    // 3. Return the download URLs
    
    // Example of how to upload an image:
    // const imageRef = ref(storage, 'test-plants/monstera.jpg');
    // await uploadBytes(imageRef, imageFile);
    // const downloadUrl = await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error uploading test images:', error);
    throw error;
  }
} 