import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client only in browser environment
const anthropic = typeof window !== 'undefined' 
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    })
  : null;

/**
 * Send a message to Claude and get a response
 * @param prompt The user's message to Claude
 * @returns The response from Claude
 */
export async function sendMessageToClaude(prompt: string): Promise<string> {
  try {
    if (!anthropic) {
      throw new Error('Anthropic client is not initialized');
    }

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
      return response.content[0].text;
    }
    
    return 'No text response received';
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
    const prompt = `
You are a creative plant personalization assistant. Based on the following plant information, create a fun and engaging personality profile for this plant. Use the plant's characteristics to inform your choices.

Plant Information:
- Type/Species: ${plantInfo.species}
- Location Type: ${plantInfo.locationType}
- Room/Space: ${plantInfo.locationSpace || 'Not specified'}
- Sunlight: ${plantInfo.sunlight}
- Soil Type: ${plantInfo.soil}
- Container Size: ${plantInfo.potSize}
${plantInfo.imageUrl ? '- The plant has a photo uploaded' : ''}

Please provide the following in JSON format:
1. A creative and cute nickname for the plant (keep it short and sweet)
2. A personality type that fits the plant's characteristics (choose from: Cheerful, Dramatic, Zen, Sassy, Royal, Shy, Adventurous, Wise)
3. A short, first-person bio/quote from the plant's perspective (1-2 sentences, should be cute and reflect the personality)

Example output format:
{
  "name": "Sunny",
  "personalityType": "Cheerful",
  "bio": "Hi! I'm Sunny and I love soaking up rays by the window. Always looking on the bright side of life!"
}
`;

    const response = await sendMessageToClaude(prompt);
    
    try {
      // Parse the JSON from Claude's response
      // Look for JSON object pattern in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        const result = JSON.parse(jsonString);
        
        // Validate the result has the expected fields
        if (!result.name || !result.personalityType || !result.bio) {
          throw new Error('Missing required fields in Claude response');
        }
        
        return result;
      } else {
        throw new Error('No valid JSON found in Claude response');
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      // Fallback with default values
      return {
        name: plantInfo.species,
        personalityType: 'Cheerful',
        bio: `Hi! I'm a ${plantInfo.species} and I'm happy to be part of your plant family!`
      };
    }
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

export { anthropic }; 