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
 * Generate a thirsty plant message based on personality and days overdue
 * @param plantInfo Object containing plant information
 * @returns A message from the plant about being thirsty
 */
export async function generateThirstyPlantMessage(plantInfo: {
  name: string;
  species: string;
  personalityType: string;
  daysOverdue: number;
  userName?: string;
}): Promise<string> {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'generate_thirsty_message',
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
    return getDefaultThirstyMessage(plantInfo);
  } catch (error) {
    console.error('Error generating thirsty plant message:', error);
    // Fallback with default message
    return getDefaultThirstyMessage(plantInfo);
  }
}

/**
 * Generate a default thirsty plant message based on personality type
 * @param plantInfo Object containing plant information
 * @returns A default message from the plant about being thirsty
 */
function getDefaultThirstyMessage(plantInfo: {
  name: string;
  species: string;
  personalityType: string;
  daysOverdue: number;
  userName?: string;
}): string {
  const { name, personalityType, daysOverdue, userName } = plantInfo;
  const includeUserName = userName && Math.random() < 0.4; // 40% chance to include user name
  
  // Default messages based on personality type
  switch (personalityType.toLowerCase()) {
    case 'cheerful':
      return includeUserName 
        ? `Hey ${userName}! I'm feeling a bit parched. A drink would be lovely!` 
        : `Hey there! I'm feeling a bit parched. A drink would be lovely!`;
    case 'dramatic':
      return includeUserName 
        ? `${userName}, I'm DYING of thirst over here! It's been ${daysOverdue} days too many!` 
        : `I'm DYING of thirst over here! It's been ${daysOverdue} days too many!`;
    case 'zen':
      return includeUserName 
        ? `${userName}, one cannot flourish without water. I seek hydration.` 
        : `One cannot flourish without water. I seek hydration.`;
    case 'sassy':
      return includeUserName 
        ? `Excuse me, ${userName}? Did you forget about me for ${daysOverdue} days? I'm thirsty!` 
        : `Excuse me? Did you forget about me for ${daysOverdue} days? I'm thirsty!`;
    case 'royal':
      return includeUserName 
        ? `Your Majesty ${name} requests the royal water treatment from ${userName}, post-haste.` 
        : `Your Majesty ${name} requests the royal water treatment, post-haste.`;
    case 'shy':
      return includeUserName 
        ? `Um... ${userName}... sorry to bother you, but... I'm a little thirsty...` 
        : `Um... sorry to bother you, but... I'm a little thirsty...`;
    case 'adventurous':
      return includeUserName 
        ? `${userName}! I've been exploring the desert of neglect for ${daysOverdue} days! Water, please!` 
        : `I've been exploring the desert of neglect for ${daysOverdue} days! Water, please!`;
    case 'wise':
      return includeUserName 
        ? `${userName}, a wise gardener knows that water brings life. I've been waiting patiently.` 
        : `A wise gardener knows that water brings life. I've been waiting patiently.`;
    default:
      return includeUserName 
        ? `${userName}, I'm thirsty! I need water, please!` 
        : `I'm thirsty! I need water, please!`;
  }
} 