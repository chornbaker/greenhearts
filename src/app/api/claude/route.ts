import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client on the server side
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // In a real app, you would verify the user is authenticated here
    // const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    // if (!token) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    
    // Handle different types of requests
    if (body.type === 'generate_personality') {
      return handlePersonalityGeneration(body.plantInfo);
    } else if (body.type === 'generate_care_info') {
      return handleCareInfoGeneration(body.plantInfo);
    } else if (body.type === 'generate_thirsty_message') {
      return handleThirstyMessageGeneration(body.plantInfo);
    } else if (body.prompt) {
      // Original functionality for general prompts
      return handleGeneralPrompt(body.prompt);
    } else {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in Claude API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Handle general prompt requests to Claude
 */
async function handleGeneralPrompt(prompt: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Check if the content block is of type 'text'
    if (response.content[0].type === 'text') {
      return NextResponse.json({ response: response.content[0].text });
    }
    
    return NextResponse.json({ response: 'No text response received' });
  } catch (error) {
    console.error('Error communicating with Claude:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with Claude' },
      { status: 500 }
    );
  }
}

/**
 * Handle plant personality generation requests
 */
async function handlePersonalityGeneration(plantInfo: {
  species: string;
  locationType: string;
  locationSpace?: string;
  sunlight: string;
  soil: string;
  potSize: string;
  imageUrl?: string;
}) {
  try {
    const prompt = `
You are an imaginative plant personification expert with a flair for the whimsical and cute. Your job is to bring plants to life with charming personalities that surprise and delight. Think outside the pot!

Plant Information:
- Type/Species: ${plantInfo.species}
- Location Type: ${plantInfo.locationType}
- Room/Space: ${plantInfo.locationSpace || 'Not specified'}
- Sunlight: ${plantInfo.sunlight}
- Soil Type: ${plantInfo.soil}
- Container Size: ${plantInfo.potSize}
${plantInfo.imageUrl ? '- The plant has a photo uploaded' : ''}

Please create a delightfully charming personality for this plant with:

1. NAME: Create a simple, cute, single-word name (or at most two short words). Avoid titles, suffixes (like "III"), or full name formats (first/last name). Focus on names that are:
   - Easy to pronounce
   - Memorable and cute
   - Possibly related to the plant's characteristics but not too obvious
   - No longer than 10 characters in most cases

2. PERSONALITY TYPE: Choose one that best fits your creative vision (Cheerful, Dramatic, Zen, Sassy, Royal, Shy, Adventurous, Wise)

3. BIO: Write a first-person bio that's memorable and distinctive. Use unexpected metaphors, quirky hobbies, or unusual aspirations. Give the plant a unique voice that makes it feel like a character from a beloved story. Aim for humor, charm, and originality in 1-2 sentences.

Return your response in this JSON format:
{
  "name": "Your cute plant name",
  "personalityType": "One of the personality types listed above",
  "bio": "Your imaginative first-person bio"
}

Examples of good names (don't copy these, create something new):
- Sprout
- Fern
- Pip
- Leafy
- Bloom
- Sunny
- Petal
- Jade
- Mossy
- Twiggy
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Check if the content block is of type 'text'
    if (response.content[0].type === 'text') {
      const responseText = response.content[0].text;
      
      try {
        // Parse the JSON from Claude's response
        // Look for JSON object pattern in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          const result = JSON.parse(jsonString);
          
          // Validate the result has the expected fields
          if (!result.name || !result.personalityType || !result.bio) {
            throw new Error('Missing required fields in Claude response');
          }
          
          return NextResponse.json({ personality: result });
        } else {
          throw new Error('No valid JSON found in Claude response');
        }
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        // Fallback with default values
        return NextResponse.json({
          personality: {
            name: plantInfo.species,
            personalityType: 'Cheerful',
            bio: `Hi! I'm a ${plantInfo.species} and I'm happy to be part of your plant family!`
          }
        });
      }
    }
    
    // Fallback if no text response
    return NextResponse.json({
      personality: {
        name: plantInfo.species,
        personalityType: 'Cheerful',
        bio: `Hi! I'm a ${plantInfo.species} and I'm happy to be part of your plant family!`
      }
    });
  } catch (error) {
    console.error('Error generating plant personality:', error);
    return NextResponse.json(
      { error: 'Failed to generate plant personality' },
      { status: 500 }
    );
  }
}

/**
 * Handle plant care information and watering schedule generation
 */
async function handleCareInfoGeneration(plantInfo: {
  species: string;
  locationType: string;
  locationSpace?: string;
  sunlight: string;
  soil: string;
  potSize: string;
  imageUrl?: string;
}) {
  try {
    const prompt = `
You are a knowledgeable plant care expert with years of experience caring for all types of plants. Your job is to provide accurate, practical care information for a specific plant.

Plant Information:
- Type/Species: ${plantInfo.species}
- Location Type: ${plantInfo.locationType}
- Room/Space: ${plantInfo.locationSpace || 'Not specified'}
- Current Sunlight: ${plantInfo.sunlight}
- Current Soil Type: ${plantInfo.soil}
- Container Size: ${plantInfo.potSize}
${plantInfo.imageUrl ? '- The plant has a photo uploaded' : ''}

Please provide detailed care information for this plant, including a watering schedule and care instructions. Be specific and practical, considering the plant's current environment.

Return your response in this JSON format:
{
  "wateringSchedule": {
    "frequency": 7, // Number of days between waterings (integer)
    "description": "Water thoroughly once per week, allowing soil to dry out between waterings."
  },
  "careInstructions": {
    "light": "Bright, indirect light. Avoid direct afternoon sun which can scorch leaves.",
    "soil": "Well-draining potting mix. Add perlite or sand to improve drainage if needed.",
    "temperature": "Prefers temperatures between 65-80°F (18-27°C). Avoid cold drafts.",
    "humidity": "Medium humidity (40-60%). Mist occasionally or use a pebble tray.",
    "fertilizer": "Feed monthly during growing season with balanced liquid fertilizer diluted to half strength.",
    "pruning": "Trim leggy growth in spring to maintain shape. Remove yellow or damaged leaves.",
    "repotting": "Repot every 2 years in spring when roots become crowded.",
    "commonIssues": "Watch for spider mites in dry conditions. Yellow leaves may indicate overwatering."
  }
}

Adjust all recommendations based on the specific plant species and its current environment. Be precise about watering frequency (in days) and provide practical care instructions that a plant owner can easily follow.
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Check if the content block is of type 'text'
    if (response.content[0].type === 'text') {
      const responseText = response.content[0].text;
      
      try {
        // Parse the JSON from Claude's response
        // Look for JSON object pattern in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonString = jsonMatch[0];
          const result = JSON.parse(jsonString);
          
          // Validate the result has the expected fields
          if (!result.wateringSchedule || !result.careInstructions) {
            throw new Error('Missing required fields in Claude response');
          }
          
          // Ensure frequency is a number
          if (typeof result.wateringSchedule.frequency !== 'number') {
            result.wateringSchedule.frequency = parseInt(result.wateringSchedule.frequency) || 7;
          }
          
          return NextResponse.json({ careInfo: result });
        } else {
          throw new Error('No valid JSON found in Claude response');
        }
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        // Fallback with default values
        return NextResponse.json({
          careInfo: {
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
          }
        });
      }
    }
    
    // Fallback if no text response
    return NextResponse.json({
      careInfo: {
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
      }
    });
  } catch (error) {
    console.error('Error generating plant care information:', error);
    return NextResponse.json(
      { error: 'Failed to generate plant care information' },
      { status: 500 }
    );
  }
}

/**
 * Handle thirsty plant message generation
 */
async function handleThirstyMessageGeneration(plantInfo: {
  name: string;
  species: string;
  personalityType: string;
  daysOverdue: number;
  userName?: string;
  location?: string;
}) {
  try {
    const prompt = `
You are a creative writer who specializes in giving plants unique personalities and voices. Your task is to create a short, friendly message from a plant that needs water.

Plant Information:
- Name: ${plantInfo.name}
- Species: ${plantInfo.species}
- Personality Type: ${plantInfo.personalityType}
- Days Overdue for Watering: ${plantInfo.daysOverdue}
${plantInfo.userName ? `- Owner's Name: ${plantInfo.userName}` : ''}
${plantInfo.location ? `- Location/Room: ${plantInfo.location}` : ''}

Based on the plant's personality type (${plantInfo.personalityType}) and the fact that it's ${plantInfo.daysOverdue} days overdue for watering, write a short 1-2 sentence message from the plant asking for water.

The message should:
- Be written in first person, from the plant's perspective
- Match the personality type (cheerful, dramatic, zen, sassy, royal, shy, adventurous, or wise)
- Reference how many days it's been without water if relevant
- Be friendly, humorous, or slightly passive-aggressive depending on personality
- Be concise (1-2 short sentences only)
${plantInfo.userName ? `- IMPORTANT: Frequently (about 60-70% of the time) address the owner by name (${plantInfo.userName}) to make it more personal and engaging` : ''}
${plantInfo.location ? `- Occasionally (about 30% of the time) reference the plant's location (${plantInfo.location}) in a natural way` : ''}

Return ONLY the message text with no additional formatting, explanations, or JSON.
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Check if the content block is of type 'text'
    if (response.content[0].type === 'text') {
      const message = response.content[0].text.trim();
      return NextResponse.json({ message });
    }
    
    // Fallback if no text response
    return NextResponse.json({
      message: getDefaultThirstyMessage(plantInfo)
    });
  } catch (error) {
    console.error('Error generating thirsty plant message:', error);
    return NextResponse.json(
      { error: 'Failed to generate thirsty plant message' },
      { status: 500 }
    );
  }
}

/**
 * Generate a default thirsty plant message based on personality type
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
  const includeUserName = userName && Math.random() < 0.7; // 70% chance to include user name
  const includeLocation = location && Math.random() < 0.3; // 30% chance to include location
  
  // If both userName and location should be included, prioritize userName
  const finalIncludeUserName = includeUserName;
  const finalIncludeLocation = includeUserName && includeLocation ? Math.random() < 0.3 : includeLocation;
  
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