import { 
  collection, 
  getDocs, 
  query, 
  where, 
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { PlantHealth, CareInstructions } from '@/types';
import { createPlant } from './plants';

const PLANTS_COLLECTION = 'plants';

// Mock for the Claude API personality generation since we can't directly call it from a script
const mockGeneratePlantPersonality = (species: string, locationType: string): {
  name: string;
  personalityType: string;
  bio: string;
} => {
  // Personality types from the app
  const personalityTypes = ['cheerful', 'dramatic', 'zen', 'sassy', 'royal', 'shy', 'adventurous', 'wise'];
  
  // Select a random personality type
  const personalityType = personalityTypes[Math.floor(Math.random() * personalityTypes.length)];
  
  // Generate a name based on species
  const speciesWords = species.split(' ');
  let name = '';
  
  // If there's a common name in the species, use a variation of it for the name
  if (speciesWords.length > 0) {
    // Take the first word and add a cute ending
    const baseWord = speciesWords[0];
    const endings = ['y', 'ie', 'a', 'o', 'er', 'kins', 'ly'];
    const ending = endings[Math.floor(Math.random() * endings.length)];
    name = baseWord.substring(0, 3) + ending;
    
    // Capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1);
  } else {
    // Fallback to a generic plant name
    const plantNames = ['Leaf', 'Green', 'Sprout', 'Blossom', 'Flora', 'Fern', 'Woody', 'Petal'];
    name = plantNames[Math.floor(Math.random() * plantNames.length)];
  }
  
  // Generate a bio based on personality type
  let bio = '';
  switch (personalityType) {
    case 'cheerful':
      bio = `Hi there! I'm ${name}, your friendly ${species}! I'm always looking on the bright side of life and love bringing joy to your ${locationType.toLowerCase()}.`;
      break;
    case 'dramatic':
      bio = `I am ${name}, the MOST magnificent ${species} you'll ever meet! When I need water, everyone will know it - my drooping is legendary!`;
      break;
    case 'zen':
      bio = `I am ${name}. I bring peace and tranquility to your ${locationType.toLowerCase()} through mindful growth and serene presence. Breathe with me.`;
      break;
    case 'sassy':
      bio = `Look, I'm ${name}, and while I appreciate the attention, let's get one thing straight - overwatering is NOT showing love. Got it?`;
      break;
    case 'royal':
      bio = `I am ${name}, the regal ${species} of this household. I expect to be treated with the dignity befitting my majestic foliage.`;
      break;
    case 'shy':
      bio = `Um, hi... I'm ${name}. I don't like to make a fuss, but I do appreciate the quiet corner you've given me in your ${locationType.toLowerCase()}.`;
      break;
    case 'adventurous':
      bio = `Howdy! I'm ${name}, always ready for the next adventure! My leaves are reaching for new horizons, just like my spirit!`;
      break;
    case 'wise':
      bio = `I am ${name}, bearer of ancient plant wisdom. I've seen many seasons come and go, and I'm here to share my leafy knowledge with you.`;
      break;
    default:
      bio = `Hi! I'm ${name} the ${species}. I'm happy to be part of your plant family!`;
  }
  
  return {
    name,
    personalityType,
    bio
  };
};

// Mock for the Claude API care information generation
const mockGeneratePlantCareInfo = (species: string, sunlight: string, soil: string): {
  wateringSchedule: {
    frequency: number;
    description: string;
  };
  careInstructions: CareInstructions;
} => {
  // Determine watering frequency based on plant type and conditions
  let wateringFrequency = 7; // Default to weekly
  let wateringDescription = '';
  
  // Adjust watering based on plant type
  if (species.toLowerCase().includes('cactus') || 
      species.toLowerCase().includes('succulent') || 
      species.toLowerCase().includes('aloe') || 
      species.toLowerCase().includes('sansevieria')) {
    wateringFrequency = 14; // Desert plants need less water
    wateringDescription = "Water sparingly, allowing soil to completely dry out between waterings. In winter, reduce frequency by half.";
  } else if (species.toLowerCase().includes('fern') || 
            species.toLowerCase().includes('peace lily') || 
            species.toLowerCase().includes('calathea')) {
    wateringFrequency = 4; // Moisture-loving plants need more water
    wateringDescription = "Keep soil consistently moist but not soggy. Water when the top inch of soil feels slightly dry.";
  } else if (species.toLowerCase().includes('monstera') || 
            species.toLowerCase().includes('pothos') || 
            species.toLowerCase().includes('philodendron')) {
    wateringFrequency = 7; // Average tropical plants
    wateringDescription = "Allow the top 1-2 inches of soil to dry out between waterings. Reduce in winter months.";
  } else if (species.toLowerCase().includes('fiddle') || 
            species.toLowerCase().includes('ficus')) {
    wateringFrequency = 8; // Ficus types
    wateringDescription = "Water when the top 2 inches of soil are dry. Ensure thorough drainage and avoid soggy soil.";
  }
  
  // Further adjust based on sunlight conditions
  if (sunlight.toLowerCase().includes('low')) {
    wateringFrequency += 2; // Less light means less water needed
    wateringDescription += " Due to lower light, be careful not to overwater.";
  } else if (sunlight.toLowerCase().includes('direct') || sunlight.toLowerCase().includes('full')) {
    wateringFrequency -= 1; // More light means more water needed
    wateringDescription += " In bright conditions, check soil moisture more frequently.";
  }
  
  // Generate care instructions based on plant type
  const careInstructions: CareInstructions = {};
  
  // Light requirements
  if (species.toLowerCase().includes('cactus') || species.toLowerCase().includes('succulent')) {
    careInstructions.light = "Bright direct or indirect light. At least 6 hours of sunlight daily is ideal.";
  } else if (species.toLowerCase().includes('fern') || species.toLowerCase().includes('calathea')) {
    careInstructions.light = "Low to medium indirect light. Keep away from direct sunlight which can scorch leaves.";
  } else if (species.toLowerCase().includes('pothos') || species.toLowerCase().includes('zz')) {
    careInstructions.light = "Adaptable to various light conditions from low to bright indirect light. Avoid direct sunlight.";
  } else {
    careInstructions.light = "Bright indirect light is ideal. Avoid harsh direct sunlight, especially in afternoon hours.";
  }
  
  // Soil recommendations
  if (soil.toLowerCase().includes('cactus')) {
    careInstructions.soil = "Fast-draining cactus or succulent mix. Add extra perlite or sand for better drainage.";
  } else if (soil.toLowerCase().includes('all-purpose')) {
    careInstructions.soil = "Well-draining, all-purpose potting mix. Consider adding perlite to improve aeration.";
  } else if (soil.toLowerCase().includes('orchid')) {
    careInstructions.soil = "Specialized orchid mix with bark, charcoal, and minimal soil. Keeps roots aerated.";
  } else {
    careInstructions.soil = "Well-draining potting mix appropriate for this species. Avoid compacted soils that retain too much moisture.";
  }
  
  // Temperature
  careInstructions.temperature = "Prefers temperatures between 65-80°F (18-27°C). Protect from cold drafts and sudden temperature changes.";
  
  // Humidity
  if (species.toLowerCase().includes('fern') || 
      species.toLowerCase().includes('calathea') || 
      species.toLowerCase().includes('peace lily')) {
    careInstructions.humidity = "Requires high humidity (50%+). Consider a humidifier, pebble tray, or regular misting.";
  } else if (species.toLowerCase().includes('cactus') || species.toLowerCase().includes('succulent')) {
    careInstructions.humidity = "Prefers dry air. No additional humidity needed; avoid misting.";
  } else {
    careInstructions.humidity = "Average household humidity is fine. Occasional misting can be beneficial during dry seasons.";
  }
  
  // Fertilizer
  careInstructions.fertilizer = "Feed with balanced liquid fertilizer diluted to half strength every 4-6 weeks during growing season (spring and summer). Reduce or eliminate in fall and winter.";
  
  // Pruning
  careInstructions.pruning = "Remove yellow or damaged leaves at the base. Prune leggy growth in spring to encourage fullness.";
  
  // Repotting
  careInstructions.repotting = "Repot every 1-2 years or when roots become crowded. Choose a pot 1-2 inches larger than the current one.";
  
  // Common issues
  careInstructions.commonIssues = "Yellow leaves often indicate overwatering, while brown leaf tips suggest low humidity or salt buildup. Drooping can signal either over or under-watering - check soil moisture.";
  
  return {
    wateringSchedule: {
      frequency: wateringFrequency,
      description: wateringDescription
    },
    careInstructions
  };
};

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
 * Upload a test plant image from public/test-images to Firebase Storage
 * @param userId User ID for the storage path
 * @param filename The filename in the test-images folder
 * @returns The download URL of the uploaded image
 */
async function uploadTestImage(userId: string, filename: string): Promise<string> {
  try {
    if (!storage) throw new Error('Firebase Storage is not initialized');
    
    // In a browser environment, we can't access the filesystem directly
    // so we fetch the image using the fetch API
    const response = await fetch(`/test-images/${filename}`);
    const blob = await response.blob();
    
    // Create a storage reference
    const storageRef = ref(storage, `plants/${userId}/${filename}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading test image:', error);
    throw error;
  }
}

/**
 * Populate test data for a specific user
 * @param userId The user ID to populate data for
 */
export async function populateTestData(userId: string): Promise<void> {
  try {
    // First clear existing data
    await clearUserData(userId);
    
    // Sample plant data with realistic information
    const plantData = [
      {
        species: 'Monstera Deliciosa',
        locationType: 'Indoor',
        locationSpace: 'Living Room',
        sunlight: 'Bright Indirect',
        soil: 'All-Purpose',
        potSize: '8-10"',
        imageFilename: 'monstera.jpg',
        health: PlantHealth.Excellent,
      },
      {
        species: 'Ficus Lyrata',
        locationType: 'Indoor',
        locationSpace: 'Living Room',
        sunlight: 'Bright Indirect',
        soil: 'All-Purpose',
        potSize: '12-14"',
        imageFilename: 'fiddle-leaf-fig.jpg',
        health: PlantHealth.Good,
      },
      {
        species: 'Sansevieria Trifasciata',
        locationType: 'Indoor',
        locationSpace: 'Bedroom',
        sunlight: 'Low Light',
        soil: 'Cactus Mix',
        potSize: '4-6"',
        imageFilename: 'snake-plant.jpg',
        health: PlantHealth.Excellent,
      },
      {
        species: 'Epipremnum Aureum',
        locationType: 'Indoor',
        locationSpace: 'Office',
        sunlight: 'Partial Shade',
        soil: 'All-Purpose',
        potSize: '4-6"',
        imageFilename: 'pothos.jpg',
        health: PlantHealth.Good,
      },
      {
        species: 'Spathiphyllum',
        locationType: 'Indoor',
        locationSpace: 'Bathroom',
        sunlight: 'Low Light',
        soil: 'All-Purpose',
        potSize: '4-6"',
        imageFilename: 'peace-lily.jpg',
        health: PlantHealth.Fair,
      },
      {
        species: 'Zamioculcas Zamiifolia',
        locationType: 'Indoor',
        locationSpace: 'Hallway',
        sunlight: 'Low Light',
        soil: 'Cactus Mix',
        potSize: '8-10"',
        imageFilename: 'zz-plant.jpg',
        health: PlantHealth.Excellent,
      },
      {
        species: 'Aloe Barbadensis Miller',
        locationType: 'Indoor',
        locationSpace: 'Kitchen',
        sunlight: 'Direct Sun',
        soil: 'Cactus Mix',
        potSize: '4-6"',
        imageFilename: 'aloe-vera.jpg',
        health: PlantHealth.Good,
      },
      {
        species: 'Chlorophytum Comosum',
        locationType: 'Indoor',
        locationSpace: 'Living Room',
        sunlight: 'Bright Indirect',
        soil: 'All-Purpose',
        potSize: '4-6"',
        imageFilename: 'spider-plant.jpg',
        health: PlantHealth.Excellent,
      },
      {
        species: 'Ficus Elastica',
        locationType: 'Indoor',
        locationSpace: 'Office',
        sunlight: 'Bright Indirect',
        soil: 'All-Purpose',
        potSize: '8-10"',
        imageFilename: 'rubber-plant.jpg',
        health: PlantHealth.Good,
      },
      {
        species: 'Nephrolepis Exaltata',
        locationType: 'Indoor',
        locationSpace: 'Bathroom',
        sunlight: 'Partial Shade',
        soil: 'All-Purpose',
        potSize: '8-10"',
        imageFilename: 'boston-fern.jpg',
        health: PlantHealth.Fair,
      },
    ];
    
    console.log(`Adding ${plantData.length} test plants for user ${userId}`);
    
    // Create plants one by one, just like the app would
    for (const plant of plantData) {
      try {
        // 1. Upload the plant image (simulating user selecting a photo)
        const imageUrl = await uploadTestImage(userId, plant.imageFilename);
        
        // 2. Generate personality (simulating Claude API call)
        const personality = mockGeneratePlantPersonality(plant.species, plant.locationType);
        
        // 3. Generate care info (simulating Claude API call)
        const careInfo = mockGeneratePlantCareInfo(plant.species, plant.sunlight, plant.soil);
        
        // 4. Set up watering dates just like the app would
        const lastWatered = new Date();
        // Randomize last watered date between 1-wateringFrequency days ago
        const daysAgo = Math.floor(Math.random() * careInfo.wateringSchedule.frequency) + 1;
        lastWatered.setDate(lastWatered.getDate() - daysAgo);
        
        // Calculate next watering date
        const nextWateringDate = new Date(lastWatered);
        nextWateringDate.setDate(lastWatered.getDate() + careInfo.wateringSchedule.frequency);
        
        // 5. Create the plant using the exact same API the app uses
        await createPlant({
          userId,
          name: personality.name,
          species: plant.species,
          image: imageUrl,
          location: plant.locationSpace,
          wateringSchedule: {
            frequency: careInfo.wateringSchedule.frequency,
            description: careInfo.wateringSchedule.description,
            lastWatered,
            nextWateringDate,
          },
          lastWatered,
          nextWateringDate,
          notes: `This is a test plant generated to showcase the ${personality.personalityType} personality.`,
          health: plant.health,
          personalityType: personality.personalityType,
          bio: personality.bio,
          careInstructions: careInfo.careInstructions,
        });
        
        console.log(`Added test plant: ${personality.name} (${plant.species})`);
      } catch (error) {
        console.error(`Error adding test plant ${plant.species}:`, error);
      }
    }
    
    console.log(`Successfully added test plants for user ${userId}`);
  } catch (error) {
    console.error('Error populating test data:', error);
    throw error;
  }
} 