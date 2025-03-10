import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PlantCareGuide } from '@/types';

// Initialize Anthropic client on the server side
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.species) {
      return NextResponse.json(
        { success: false, error: 'No plant species provided' },
        { status: 400 }
      );
    }
    
    // Generate care guide for the specified plant species
    const careGuide = await generatePlantCareGuide(body.species);
    
    return NextResponse.json({
      success: true,
      careGuide
    });
  } catch (error: any) {
    console.error('Error in plant care guide API route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Generate a detailed care guide for a specific plant species
 * @param species Plant species to generate care guide for
 * @returns Detailed care guide with watering, light, and other care requirements
 */
async function generatePlantCareGuide(species: string): Promise<PlantCareGuide> {
  const prompt = `
As a plant care expert, I need you to create a detailed care guide for ${species}. 
Please provide comprehensive and accurate care information that would be helpful to plant owners.

Format your response as a valid JSON object with these fields:
{
  "species": "${species}",
  "scientificName": "string", // Scientific name if different from input
  "commonNames": ["string"], // Array of common names
  "description": "string", // Brief description of the plant
  "careInstructions": {
    "light": "string", // Light requirements
    "soil": "string", // Soil recommendations
    "temperature": "string", // Temperature preferences
    "humidity": "string", // Humidity needs
    "fertilizer": "string", // Fertilization schedule and type
    "pruning": "string", // Pruning recommendations
    "repotting": "string", // Repotting frequency and approach
    "commonIssues": "string" // Common problems and solutions
  },
  "wateringSchedule": {
    "frequency": number, // Recommended watering frequency in days
    "description": "string" // Detailed watering instructions
  },
  "seasonalCare": {
    "spring": "string",
    "summer": "string",
    "fall": "string", 
    "winter": "string"
  },
  "tips": ["string"] // Array of helpful care tips
}

Ensure your response is accurate for this specific plant species. Only respond with valid JSON that exactly follows this schema.
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      temperature: 0.1,
      system: "You are an expert botanist and plant care specialist who provides accurate, detailed, and practical care guides for houseplants and garden plants. Always format your response as valid JSON following the exact schema specified.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    try {
      // Access the text content from the response, handling different content types
      let contentText = '';
      const firstContent = response.content[0];
      
      if ('text' in firstContent) {
        contentText = firstContent.text;
      } else {
        throw new Error('Unexpected response format from Anthropic API');
      }
      
      // Handle potential JSON within markdown code blocks
      const jsonMatch = contentText.match(/```json\n([\s\S]*?)\n```/) || 
                        contentText.match(/```\n([\s\S]*?)\n```/) ||
                        [null, contentText];
      
      const jsonContent = jsonMatch[1] || contentText;
      const careGuide = JSON.parse(jsonContent) as PlantCareGuide;
      
      return careGuide;
    } catch (parseError) {
      console.error('Error parsing JSON response for care guide:', parseError);
      
      // Safely log the response without assuming its structure
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if ('text' in firstContent) {
          console.log('Raw response:', firstContent.text);
        }
      }
      
      throw new Error('Failed to parse plant care guide response');
    }
  } catch (error: any) {
    console.error('Error calling Anthropic API for plant care guide:', error);
    throw new Error(error.message || 'Failed to generate plant care guide');
  }
} 