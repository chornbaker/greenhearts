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
You are an imaginative plant personification expert with a flair for the whimsical and unexpected. Your job is to bring plants to life with truly unique personalities that surprise and delight. Think outside the pot!

Plant Information:
- Type/Species: ${plantInfo.species}
- Location Type: ${plantInfo.locationType}
- Room/Space: ${plantInfo.locationSpace || 'Not specified'}
- Sunlight: ${plantInfo.sunlight}
- Soil Type: ${plantInfo.soil}
- Container Size: ${plantInfo.potSize}
${plantInfo.imageUrl ? '- The plant has a photo uploaded' : ''}

Please create a delightfully unexpected personality for this plant with:

1. NAME: Create a truly original name that goes beyond the obvious plant puns. Consider unexpected cultural references, literary characters, historical figures with a twist, or completely invented names with personality. Be bold and surprising!

2. PERSONALITY TYPE: Choose one that best fits your creative vision (Cheerful, Dramatic, Zen, Sassy, Royal, Shy, Adventurous, Wise)

3. BIO: Write a first-person bio that's memorable and distinctive. Use unexpected metaphors, quirky hobbies, surprising aspirations, or unusual speech patterns. Give the plant a unique voice that makes it feel like a character from a beloved story. Aim for humor, charm, and originality in 1-2 sentences.

Return your response in this JSON format:
{
  "name": "Your creative plant name",
  "personalityType": "One of the personality types listed above",
  "bio": "Your imaginative first-person bio"
}

Examples of creative approaches (don't copy these, create something new):
- A dramatic plant that speaks like a Shakespearean character
- A zen plant with an unexpected meditation practice
- A royal plant with delusions of grandeur and specific demands
- A shy plant that's secretly writing a novel
- An adventurous plant with impossible travel dreams
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