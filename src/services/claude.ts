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
  location?: string;
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
  location?: string;
}): string {
  const { name, personalityType, daysOverdue, userName, location } = plantInfo;
  
  // Determine what to include in the message
  const includeUserName = userName && Math.random() < 0.3; // 30% chance to include user name
  const includeLocation = location && Math.random() < 0.3; // 30% chance to include location
  
  // If both userName and location should be included, randomly choose one to avoid overcrowding
  const finalIncludeUserName = includeUserName && includeLocation ? Math.random() < 0.5 : includeUserName;
  const finalIncludeLocation = includeUserName && includeLocation ? !finalIncludeUserName : includeLocation;
  
  // Default messages based on personality type
  switch (personalityType.toLowerCase()) {
    case 'cheerful':
      if (finalIncludeUserName) {
        return `Hey ${userName}! I'm feeling a bit parched. A drink would be lovely!`;
      } else if (finalIncludeLocation) {
        return `Being in the ${location} is great, but I could really use some water right now!`;
      } else {
        return `Hey there! I'm feeling a bit parched. A drink would be lovely!`;
      }
      
    case 'dramatic':
      if (finalIncludeUserName) {
        return `${userName}, I'm DYING of thirst over here! It's been ${daysOverdue} days too many!`;
      } else if (finalIncludeLocation) {
        return `The ${location} has become my desert of despair! I'm DYING after ${daysOverdue} days without water!`;
      } else {
        return `I'm DYING of thirst over here! It's been ${daysOverdue} days too many!`;
      }
      
    case 'zen':
      if (finalIncludeUserName) {
        return `${userName}, one cannot flourish without water. I seek hydration.`;
      } else if (finalIncludeLocation) {
        return `Even in the tranquility of the ${location}, a plant needs water to find balance.`;
      } else {
        return `One cannot flourish without water. I seek hydration.`;
      }
      
    case 'sassy':
      if (finalIncludeUserName) {
        return `Excuse me, ${userName}? Did you forget about me for ${daysOverdue} days? I'm thirsty!`;
      } else if (finalIncludeLocation) {
        return `I didn't ask to be put in the ${location} just to be ignored for ${daysOverdue} days without water!`;
      } else {
        return `Excuse me? Did you forget about me for ${daysOverdue} days? I'm thirsty!`;
      }
      
    case 'royal':
      if (finalIncludeUserName) {
        return `Your Majesty ${name} requests the royal water treatment from ${userName}, post-haste.`;
      } else if (finalIncludeLocation) {
        return `Your Majesty ${name}, ruler of the ${location}, demands water for the royal roots immediately!`;
      } else {
        return `Your Majesty ${name} requests the royal water treatment, post-haste.`;
      }
      
    case 'shy':
      if (finalIncludeUserName) {
        return `Um... ${userName}... sorry to bother you, but... I'm a little thirsty...`;
      } else if (finalIncludeLocation) {
        return `I don't want to be a bother here in the ${location}, but... I could use some water...`;
      } else {
        return `Um... sorry to bother you, but... I'm a little thirsty...`;
      }
      
    case 'adventurous':
      if (finalIncludeUserName) {
        return `${userName}! I've been exploring the desert of neglect for ${daysOverdue} days! Water, please!`;
      } else if (finalIncludeLocation) {
        return `I've been on a ${daysOverdue}-day expedition through the dry ${location}! Time to refuel with water!`;
      } else {
        return `I've been exploring the desert of neglect for ${daysOverdue} days! Water, please!`;
      }
      
    case 'wise':
      if (finalIncludeUserName) {
        return `${userName}, a wise gardener knows that water brings life. I've been waiting patiently.`;
      } else if (finalIncludeLocation) {
        return `The wisdom of the ${location} teaches patience, but after ${daysOverdue} days, even the wisest plant needs water.`;
      } else {
        return `A wise gardener knows that water brings life. I've been waiting patiently.`;
      }
      
    default:
      if (finalIncludeUserName) {
        return `${userName}, I'm thirsty! I need water, please!`;
      } else if (finalIncludeLocation) {
        return `I'm getting too dry here in the ${location}! Water needed!`;
      } else {
        return `I'm thirsty! I need water, please!`;
      }
  }
} 