/**
 * Send a message to Claude and get a response
 * @param prompt The user's message to Claude
 * @returns The response from Claude
 */
export async function sendMessageToClaude(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || 'No response received';
  } catch (error) {
    console.error('Error communicating with Claude:', error);
    throw error;
  }
}

/**
 * Generate plant personality using Claude
 * @param plantInfo Object containing plant information
 * @returns Object with name, personalityType, and bio
 */
export async function generatePlantPersonality(plantInfo: {
  species: string;
  locationType: string;
  locationSpace?: string;
  sunlight: string;
  soil: string;
  potSize: string;
  imageUrl?: string;
}): Promise<{
  name: string;
  personalityType: string;
  bio: string;
}> {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'generate_personality',
        plantInfo,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.personality) {
      return data.personality;
    }
    
    // Fallback with default values if no personality data
    return {
      name: plantInfo.species,
      personalityType: 'Cheerful',
      bio: `Hi! I'm a ${plantInfo.species} and I'm happy to be part of your plant family!`
    };
  } catch (error) {
    console.error('Error generating plant personality:', error);
    // Fallback with default values
    return {
      name: plantInfo.species,
      personalityType: 'Cheerful',
      bio: `Hi! I'm a ${plantInfo.species} and I'm happy to be part of your plant family!`
    };
  }
}

/**
 * Generate plant care information and watering schedule using Claude
 * @param plantInfo Object containing plant information
 * @returns Object with watering schedule and care instructions
 */
export async function generatePlantCareInfo(plantInfo: {
  species: string;
  locationType: string;
  locationSpace?: string;
  sunlight: string;
  soil: string;
  potSize: string;
  imageUrl?: string;
}): Promise<{
  wateringSchedule: {
    frequency: number;
    description: string;
  };
  careInstructions: {
    light?: string;
    soil?: string;
    temperature?: string;
    humidity?: string;
    fertilizer?: string;
    pruning?: string;
    repotting?: string;
    commonIssues?: string;
  };
}> {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'generate_care_info',
        plantInfo,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.careInfo) {
      return data.careInfo;
    }
    
    // Fallback with default values if no care info data
    return {
      wateringSchedule: {
        frequency: 7,
        description: `Water your ${plantInfo.species} once a week, adjusting based on environmental conditions.`
      },
      careInstructions: {
        light: `Provide appropriate light for your ${plantInfo.species} based on its needs.`,
        soil: `Use well-draining soil appropriate for your ${plantInfo.species}.`,
        temperature: "Keep at room temperature, away from drafts and heat sources.",
        humidity: "Maintain moderate humidity levels.",
        fertilizer: "Fertilize during growing season with appropriate plant food.",
        pruning: "Remove dead or yellowing leaves as needed.",
        repotting: "Repot when the plant becomes root-bound, typically every 1-2 years.",
        commonIssues: "Watch for pests and diseases. Adjust care as needed."
      }
    };
  } catch (error) {
    console.error('Error generating plant care information:', error);
    // Fallback with default values
    return {
      wateringSchedule: {
        frequency: 7,
        description: `Water your ${plantInfo.species} once a week, adjusting based on environmental conditions.`
      },
      careInstructions: {
        light: `Provide appropriate light for your ${plantInfo.species} based on its needs.`,
        soil: `Use well-draining soil appropriate for your ${plantInfo.species}.`,
        temperature: "Keep at room temperature, away from drafts and heat sources.",
        humidity: "Maintain moderate humidity levels.",
        fertilizer: "Fertilize during growing season with appropriate plant food.",
        pruning: "Remove dead or yellowing leaves as needed.",
        repotting: "Repot when the plant becomes root-bound, typically every 1-2 years.",
        commonIssues: "Watch for pests and diseases. Adjust care as needed."
      }
    };
  }
}

/**
 * Generate a water reminder message from a plant
 * @param plantInfo Object containing plant information
 * @param daysOverdue Number of days the watering is overdue
 * @returns A message from the plant asking to be watered
 */
export async function generateWaterReminderMessage(plantInfo: {
  name: string;
  species: string;
  personalityType?: string;
  daysOverdue: number;
}): Promise<string> {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'generate_water_reminder',
        plantInfo,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.message) {
      return data.message;
    }
    
    // Fallback with default message if no data
    return getDefaultWaterMessage(plantInfo);
  } catch (error) {
    console.error('Error generating water reminder message:', error);
    // Fallback with default message
    return getDefaultWaterMessage(plantInfo);
  }
}

/**
 * Get a default water reminder message based on personality type
 */
function getDefaultWaterMessage(plantInfo: {
  name: string;
  species: string;
  personalityType?: string;
  daysOverdue: number;
}): string {
  const { name, personalityType, daysOverdue } = plantInfo;
  
  // Default messages by personality type
  switch (personalityType?.toLowerCase()) {
    case 'dramatic':
      return `I'm DYING of thirst over here! ${daysOverdue} days without water? How could you?!`;
    case 'zen':
      return `Finding inner peace despite being ${daysOverdue} days without water. But perhaps we could find balance together?`;
    case 'sassy':
      return `Excuse me? ${daysOverdue} days and counting. The water isn't going to pour itself, you know.`;
    case 'royal':
      return `One formally requests hydration, as it has been ${daysOverdue} days. Chop chop!`;
    case 'shy':
      return `Um... sorry to bother you, but... I'm a little thirsty... it's been ${daysOverdue} days...`;
    case 'adventurous':
      return `${daysOverdue} days without water? I'm on a survival adventure! But I could use some backup!`;
    case 'wise':
      return `A plant without water for ${daysOverdue} days is like wisdom without action. Both wither away.`;
    case 'cheerful':
    default:
      return `Hey there! I'm feeling a bit parched after ${daysOverdue} days. A drink would be lovely!`;
  }
} 