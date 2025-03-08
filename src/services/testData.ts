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
import { Plant, PlantHealth, CareInstructions } from '@/types';

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
      name: 'Monty',
      species: 'Monstera Deliciosa',
      location: 'Living Room',
      imageUrl: plantImageUrls.monstera,
      wateringFrequency: 7, // days
      wateringDescription: "Water thoroughly when the top 2 inches of soil feel dry to the touch. Reduce frequency in winter.",
      notes: 'Loves bright indirect light. Allow soil to dry out between waterings.',
      health: PlantHealth.Excellent,
      personalityType: 'adventurous',
      bio: "I'm Monty, the daring explorer! With my Swiss-cheese leaves, I'm ready to bring tropical vibes and a sense of adventure to your home.",
      careInstructions: {
        light: "Bright indirect light. Avoid direct sunlight which can scorch my leaves.",
        soil: "Well-draining potting mix with peat moss, perlite, and some bark chips.",
        temperature: "Thrives between 65-85°F (18-29°C). Protect from cold drafts and sudden temperature changes.",
        humidity: "Prefers 50-60% humidity. Occasional misting or a nearby humidifier will keep me happy.",
        fertilizer: "Feed monthly during growing season (spring and summer) with a balanced liquid fertilizer diluted to half strength.",
        pruning: "Remove yellow or damaged leaves at the base. Wipe my leaves occasionally to remove dust.",
        repotting: "Repot every 2 years or when I become root-bound, preferably in spring.",
        commonIssues: "Yellow leaves may indicate overwatering. Brown edges usually signal low humidity."
      }
    },
    {
      name: 'Figgy',
      species: 'Ficus Lyrata',
      location: 'Living Room',
      imageUrl: plantImageUrls['fiddle-leaf-fig'],
      wateringFrequency: 7, // days
      wateringDescription: "Water when the top inch of soil is dry. Ensure good drainage and avoid soggy soil.",
      notes: 'Keep in bright indirect light. Sensitive to overwatering and drafts.',
      health: PlantHealth.Good,
      personalityType: 'royal',
      bio: "Greetings, I am Figgy, the regal fiddle leaf fig. My large, violin-shaped leaves demand respect and admiration from all who enter my domain.",
      careInstructions: {
        light: "Bright indirect light with some direct morning sun. Rotate regularly for even growth.",
        soil: "Rich, well-draining soil. A mix of potting soil, peat, and perlite works well for me.",
        temperature: "Prefers consistent temperatures between 65-75°F (18-24°C). Avoid drafts and sudden temperature changes.",
        humidity: "Moderate to high humidity (40-60%). Mist occasionally but avoid getting water droplets on leaves.",
        fertilizer: "Feed with a diluted liquid fertilizer monthly during spring and summer.",
        pruning: "Prune in spring to maintain shape. Clean cuts with sharp shears to avoid damaging stems.",
        repotting: "Repot every 1-2 years in spring when roots become crowded.",
        commonIssues: "Brown spots may indicate overwatering or inconsistent watering. Leaf drop often occurs with environmental changes."
      }
    },
    {
      name: 'Sly',
      species: 'Sansevieria Trifasciata',
      location: 'Bedroom',
      imageUrl: plantImageUrls['snake-plant'],
      wateringFrequency: 14, // days
      wateringDescription: "Water sparingly, allowing soil to dry completely between waterings. Less in winter.",
      notes: 'Very drought tolerant. Let soil dry completely between waterings.',
      health: PlantHealth.Excellent,
      personalityType: 'zen',
      bio: "I am Sly, the mindful snake plant. I silently purify your air while standing tall and strong, reminding you to find balance in life's chaos.",
      careInstructions: {
        light: "Adaptable to various light conditions from low light to bright indirect light. Avoid prolonged direct sunlight.",
        soil: "Well-draining sandy soil. Succulent or cactus mix with extra perlite works perfectly.",
        temperature: "Tolerant of a wide range from 55-85°F (13-29°C). Protect from temperatures below 50°F (10°C).",
        humidity: "Adaptable to normal household humidity. No special humidity requirements.",
        fertilizer: "Light feeding with a balanced fertilizer diluted to half strength once in spring and once in summer.",
        pruning: "Minimal pruning needed. Remove damaged leaves at the base if necessary.",
        repotting: "Repot every 2-3 years or when root-bound. Can thrive in tight quarters.",
        commonIssues: "Overwatering causes root rot. Yellow edges on leaves usually indicate too much water or poor drainage."
      }
    },
    {
      name: 'Potty',
      species: 'Epipremnum Aureum',
      location: 'Office',
      imageUrl: plantImageUrls.pothos,
      wateringFrequency: 7, // days
      wateringDescription: "Water when the top inch of soil feels dry. More water in summer, less in winter.",
      notes: 'Adaptable to various light conditions. Water when top inch of soil is dry.',
      health: PlantHealth.Good,
      personalityType: 'cheerful',
      bio: "Hi, I'm Potty! I'm a go-with-the-flow kind of plant, happy to trail from shelves or climb up poles. Let's grow together!",
      careInstructions: {
        light: "Adaptable to various light conditions from low to bright indirect light. Avoid direct sunlight.",
        soil: "Standard potting mix with good drainage. Add perlite for better aeration.",
        temperature: "Happy in normal room temperatures between 65-85°F (18-29°C).",
        humidity: "Adaptable to normal household humidity but appreciates occasional misting.",
        fertilizer: "Feed with a balanced liquid fertilizer every 4-6 weeks during growing season.",
        pruning: "Prune regularly to control growth and encourage bushiness. Cuttings can be propagated easily in water.",
        repotting: "Repot every 1-2 years or when roots begin circling the pot.",
        commonIssues: "Yellow leaves often indicate overwatering. Brown leaf tips could mean low humidity."
      }
    },
    {
      name: 'Lily',
      species: 'Spathiphyllum',
      location: 'Bathroom',
      imageUrl: plantImageUrls['peace-lily'],
      wateringFrequency: 5, // days
      wateringDescription: "Keep soil consistently moist but not soggy. When leaves begin to droop, it's time to water.",
      notes: 'Loves humidity. Droops when thirsty but recovers quickly after watering.',
      health: PlantHealth.Fair,
      personalityType: 'dramatic',
      bio: "I'm Lily, the peace-keeper with a flair for the dramatic! When I'm thirsty, I'll swoon pathetically until you notice - then bounce back the moment I get a drink!",
      careInstructions: {
        light: "Thrives in medium to low indirect light. Can tolerate fluorescent lights in offices.",
        soil: "Rich, well-draining potting mix that retains some moisture. Mix in peat moss for acidity.",
        temperature: "Prefers 65-80°F (18-27°C). Protect from drafts and cold temperatures.",
        humidity: "Loves high humidity (above 50%). Ideal for bathrooms or near humidifiers.",
        fertilizer: "Feed monthly during growing season with a balanced fertilizer diluted to half strength.",
        pruning: "Remove spent flowers and yellow leaves at the base. Wipe leaves occasionally to keep dust-free.",
        repotting: "Repot annually in spring if root bound or every 2 years otherwise.",
        commonIssues: "Brown leaf tips indicate low humidity or fluoride in water. Yellow leaves often signal overwatering."
      }
    },
    {
      name: 'Zee',
      species: 'Zamioculcas Zamiifolia',
      location: 'Hallway',
      imageUrl: plantImageUrls['zz-plant'],
      wateringFrequency: 14, // days
      wateringDescription: "Water only when soil is completely dry. Can go weeks between waterings.",
      notes: 'Very drought tolerant. Can survive in low light conditions.',
      health: PlantHealth.Excellent,
      personalityType: 'wise',
      bio: "I am Zee, the ancient sage of houseplants. I've survived millennia of harsh conditions and am here to share my wisdom - patience leads to resilience.",
      careInstructions: {
        light: "Adapts to low, medium, or bright indirect light. Avoid direct sunlight.",
        soil: "Well-draining potting mix. Cactus soil mixed with regular potting soil works well.",
        temperature: "Comfortable in normal room temperatures between 65-80°F (18-27°C).",
        humidity: "Adaptable to normal household humidity. No special requirements.",
        fertilizer: "Feed lightly 2-3 times a year with a balanced fertilizer diluted to 1/4 strength.",
        pruning: "Minimal pruning needed. Remove any yellow leaves at the base.",
        repotting: "Repot every 2-3 years or when the pot becomes crowded with rhizomes.",
        commonIssues: "Yellow leaves usually indicate overwatering. Stem or leaf spots could mean too much water or poor air circulation."
      }
    },
    {
      name: 'Vera',
      species: 'Aloe Barbadensis Miller',
      location: 'Kitchen',
      imageUrl: plantImageUrls['aloe-vera'],
      wateringFrequency: 21, // days
      wateringDescription: "Water deeply but infrequently, allowing soil to dry completely between waterings.",
      notes: 'Medicinal plant. Needs bright light and infrequent watering.',
      health: PlantHealth.Good,
      personalityType: 'sassy',
      bio: "Hey there, I'm Vera! I'm not just a pretty face - I'm packed with healing gel and ready to help with your kitchen burns. Just don't ask me to do it too often.",
      careInstructions: {
        light: "Bright direct or indirect light. At least 6 hours of sunlight daily for best growth.",
        soil: "Fast-draining sandy or rocky soil. Cactus or succulent mix is ideal.",
        temperature: "Prefers warm temperatures 55-80°F (13-27°C). Protect from frost.",
        humidity: "Prefers dry air. No additional humidity needed.",
        fertilizer: "Feed sparingly with a diluted cactus fertilizer in spring and summer only.",
        pruning: "Remove outer leaves when they yellow or to harvest gel. Cut damaged leaf tips with clean shears.",
        repotting: "Repot when plant produces many pups or becomes top-heavy, typically every 2-3 years.",
        commonIssues: "Brown leaves usually indicate sunburn or extreme dryness. Soft, mushy stems signal overwatering."
      }
    },
    {
      name: 'Charlotte',
      species: 'Chlorophytum Comosum',
      location: 'Living Room',
      imageUrl: plantImageUrls['spider-plant'],
      wateringFrequency: 7, // days
      wateringDescription: "Water when the top inch of soil dries out. Watch for brown leaf tips from fluoride in tap water.",
      notes: 'Easy to propagate from the "babies" it produces. Likes bright indirect light.',
      health: PlantHealth.Excellent,
      personalityType: 'shy',
      bio: "I'm Charlotte, a quiet plant with a growing family. My babies dangle from long stems, waiting to be noticed by someone who might give them a home of their own.",
      careInstructions: {
        light: "Thrives in bright indirect light. Can tolerate lower light conditions but will produce fewer plantlets.",
        soil: "Well-draining, all-purpose potting mix. Add perlite for extra drainage.",
        temperature: "Prefers 65-75°F (18-24°C). Can tolerate a range of normal household temperatures.",
        humidity: "Adaptable to average household humidity. Mist occasionally if the air is very dry.",
        fertilizer: "Feed once a month during growing season with a balanced liquid fertilizer diluted to half strength.",
        pruning: "Remove brown leaf tips and spent plantlets. The brown tips are often caused by fluoride in tap water.",
        repotting: "Repot when roots fill the container, typically every 1-2 years.",
        commonIssues: "Brown leaf tips can indicate low humidity, fluoride in water, or salt buildup from fertilizer."
      }
    },
    {
      name: 'Rubeus',
      species: 'Ficus Elastica',
      location: 'Office',
      imageUrl: plantImageUrls['rubber-plant'],
      wateringFrequency: 7, // days
      wateringDescription: "Allow the top inch of soil to dry between waterings. Reduce frequency in winter.",
      notes: 'Wipe leaves occasionally to keep them dust-free and shiny.',
      health: PlantHealth.Good,
      personalityType: 'royal',
      bio: "I am Rubeus, guardian of the office realm. My glossy leaves reflect my noble lineage, and I expect to be treated with the respect a plant of my stature deserves.",
      careInstructions: {
        light: "Bright indirect light. Can tolerate some direct morning sun but avoid intense afternoon sun.",
        soil: "Rich, well-draining potting mix with peat and perlite or bark for aeration.",
        temperature: "Prefers 65-85°F (18-29°C). Protect from cold drafts and sudden temperature changes.",
        humidity: "Appreciates moderate humidity around 40-60%. Mist occasionally or use a pebble tray.",
        fertilizer: "Feed monthly during growing season with a balanced liquid fertilizer diluted to half strength.",
        pruning: "Prune in spring to maintain shape and control size. Wipe leaves regularly to maintain shine.",
        repotting: "Repot every 1-2 years in spring until it reaches the desired size.",
        commonIssues: "Leaf drop often indicates temperature stress or inconsistent watering. Yellow leaves may signal overwatering."
      }
    },
    {
      name: 'Fern',
      species: 'Nephrolepis Exaltata',
      location: 'Bathroom',
      imageUrl: plantImageUrls['boston-fern'],
      wateringFrequency: 3, // days
      wateringDescription: "Keep soil consistently moist but not soggy. Watch for drooping fronds which indicate dryness.",
      notes: 'Loves humidity and indirect light. Keep soil consistently moist.',
      health: PlantHealth.Fair,
      personalityType: 'dramatic',
      bio: "I'm Fern, and I absolutely LIVE for drama and humidity! If you let me dry out, I'll drop my fronds in theatrical protest until you mist me back to happiness!",
      careInstructions: {
        light: "Bright, indirect light. Protect from direct sunlight which can scorch delicate fronds.",
        soil: "Rich, organic potting mix with excellent moisture retention. Add peat moss for acidity.",
        temperature: "Prefers 65-75°F (18-24°C). Protect from temperature fluctuations and drafts.",
        humidity: "Requires high humidity (50-80%). Ideal for bathrooms or with a humidifier nearby.",
        fertilizer: "Feed monthly during growing season with a balanced liquid fertilizer diluted to half strength.",
        pruning: "Remove brown or yellow fronds at the base to maintain appearance and encourage new growth.",
        repotting: "Repot annually in spring, or divide when the plant becomes overcrowded.",
        commonIssues: "Brown tips usually indicate low humidity or inconsistent watering. Yellow fronds may signal too much light."
      }
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
        description: plant.wateringDescription,
      },
      notes: plant.notes,
      health: plant.health,
      lastWatered,
      nextWateringDate,
      personalityType: plant.personalityType,
      bio: plant.bio,
      careInstructions: plant.careInstructions,
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