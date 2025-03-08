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
  // Firebase Storage URLs for plant images
  const plantImageUrls = {
    monstera: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.firebasestorage.app/o/test-plants%2Fmonstera.jpg?alt=media&token=88393f00-8195-4f30-8806-7e764e069f94',
    'fiddle-leaf-fig': 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.firebasestorage.app/o/test-plants%2Ffiddle-leaf-fig.jpg?alt=media&token=67716f8a-e3bb-48b4-9eea-4a2f645e3f36',
    'snake-plant': 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.firebasestorage.app/o/test-plants%2Fsnake-plant.jpg?alt=media&token=b4f76b4a-5ad7-48ea-b4d2-46c6115c7aeb',
    pothos: 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.firebasestorage.app/o/test-plants%2Fpothos.jpg?alt=media&token=8cabea20-a475-41c9-96d2-8958ff3c7e75',
    'peace-lily': 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.firebasestorage.app/o/test-plants%2Fpeace-lily.jpg?alt=media&token=71d9be35-a5fb-4613-b6d9-343c43bef09b',
    'zz-plant': 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.firebasestorage.app/o/test-plants%2Fzz-plant.jpg?alt=media&token=08174952-a806-420c-b029-eb90e9a8f40b',
    'aloe-vera': 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.firebasestorage.app/o/test-plants%2Faloe-vera.jpg?alt=media&token=9ce1e03d-5faa-486a-89c9-c4d12e042211',
    'spider-plant': 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.firebasestorage.app/o/test-plants%2Fspider-plant.jpg?alt=media&token=cc6a1be0-ec20-49d8-a2fd-0770615ebbc2',
    'rubber-plant': 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.firebasestorage.app/o/test-plants%2Frubber-plant.jpg?alt=media&token=f0e61bae-1911-423d-982c-6896ba5c3855',
    'boston-fern': 'https://firebasestorage.googleapis.com/v0/b/greenhearts-d0dc7.firebasestorage.app/o/test-plants%2Fboston-fern.jpg?alt=media&token=2e592255-f8af-4a4d-b188-216ad9259e2f',
  };

  // Sample plant data with realistic information
  const plantData = [
    {
      name: 'Monstera Deliciosa',
      species: 'Monstera Deliciosa',
      location: 'Living Room',
      imageUrl: plantImageUrls.monstera,
      wateringFrequency: 7, // days
      notes: 'Loves bright indirect light. Allow soil to dry out between waterings.',
      health: PlantHealth.Excellent,
    },
    {
      name: 'Fiddle Leaf Fig',
      species: 'Ficus Lyrata',
      location: 'Living Room',
      imageUrl: plantImageUrls['fiddle-leaf-fig'],
      wateringFrequency: 7, // days
      notes: 'Keep in bright indirect light. Sensitive to overwatering and drafts.',
      health: PlantHealth.Good,
    },
    {
      name: 'Snake Plant',
      species: 'Sansevieria Trifasciata',
      location: 'Bedroom',
      imageUrl: plantImageUrls['snake-plant'],
      wateringFrequency: 14, // days
      notes: 'Very drought tolerant. Let soil dry completely between waterings.',
      health: PlantHealth.Excellent,
    },
    {
      name: 'Pothos',
      species: 'Epipremnum Aureum',
      location: 'Office',
      imageUrl: plantImageUrls.pothos,
      wateringFrequency: 7, // days
      notes: 'Adaptable to various light conditions. Water when top inch of soil is dry.',
      health: PlantHealth.Good,
    },
    {
      name: 'Peace Lily',
      species: 'Spathiphyllum',
      location: 'Bathroom',
      imageUrl: plantImageUrls['peace-lily'],
      wateringFrequency: 5, // days
      notes: 'Loves humidity. Droops when thirsty but recovers quickly after watering.',
      health: PlantHealth.Fair,
    },
    {
      name: 'ZZ Plant',
      species: 'Zamioculcas Zamiifolia',
      location: 'Hallway',
      imageUrl: plantImageUrls['zz-plant'],
      wateringFrequency: 14, // days
      notes: 'Very drought tolerant. Can survive in low light conditions.',
      health: PlantHealth.Excellent,
    },
    {
      name: 'Aloe Vera',
      species: 'Aloe Barbadensis Miller',
      location: 'Kitchen',
      imageUrl: plantImageUrls['aloe-vera'],
      wateringFrequency: 21, // days
      notes: 'Medicinal plant. Needs bright light and infrequent watering.',
      health: PlantHealth.Good,
    },
    {
      name: 'Spider Plant',
      species: 'Chlorophytum Comosum',
      location: 'Living Room',
      imageUrl: plantImageUrls['spider-plant'],
      wateringFrequency: 7, // days
      notes: 'Easy to propagate from the "babies" it produces. Likes bright indirect light.',
      health: PlantHealth.Excellent,
    },
    {
      name: 'Rubber Plant',
      species: 'Ficus Elastica',
      location: 'Office',
      imageUrl: plantImageUrls['rubber-plant'],
      wateringFrequency: 7, // days
      notes: 'Wipe leaves occasionally to keep them dust-free and shiny.',
      health: PlantHealth.Good,
    },
    {
      name: 'Boston Fern',
      species: 'Nephrolepis Exaltata',
      location: 'Bathroom',
      imageUrl: plantImageUrls['boston-fern'],
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