import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client on the server side
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Call the Anthropic API for plant recognition
    const result = await recognizePlantFromImage(body.image);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in plant recognition API route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Send an image to Anthropic's Claude for plant identification
 * @param imageBase64 Base64 encoded image
 * @returns Recognition data including species and confidence level
 */
async function recognizePlantFromImage(imageBase64: string) {
  const base64Image = imageBase64.startsWith('data:') 
    ? imageBase64 
    : `data:image/jpeg;base64,${imageBase64}`;

  const prompt = `
You are a plant identification expert. Please analyze this image and identify the plant species shown. 
I need a detailed and accurate identification.

For your response, provide:
1. The most likely species (both common name and scientific name if possible)
2. Confidence level (as a percentage between 1-100)
3. Brief description of the plant
4. Up to 3 alternative possible species if you're not completely certain
5. Any distinctive features you notice in the image

Format your response as a valid JSON object with these fields:
{
  "recognizedSpecies": "string", // Main identified species common name
  "scientificName": "string", // Scientific name of the main identified species
  "confidence": number, // Number between 1-100
  "description": "string", // Brief description of the plant
  "alternativeSpecies": [
    {
      "name": "string", // Common name of alternative species
      "scientificName": "string", // Scientific name of alternative
      "confidence": number // Confidence level for this alternative (1-100)
    }
  ],
  "distinctiveFeatures": ["string"] // Array of notable features visible in the image
}

Only respond with valid JSON that exactly follows this schema.
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.2,
      system: "You're a plant identification expert that analyzes images and provides detailed, accurate identifications. Always respond with well-structured JSON following the exact schema specified in the prompt.",
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image.split(',')[1]
              }
            }
          ]
        }
      ]
    });

    // Parse the response content as JSON
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
      const result = JSON.parse(jsonContent);
      
      // Transform to our expected format
      return {
        recognizedSpecies: result.recognizedSpecies,
        scientificName: result.scientificName,
        confidence: result.confidence,
        description: result.description,
        alternativeSpecies: result.alternativeSpecies?.map((alt: any) => ({
          name: alt.name,
          scientificName: alt.scientificName,
          confidence: alt.confidence
        })) || [],
        distinctiveFeatures: result.distinctiveFeatures || []
      };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      
      // Safely log the response without assuming its structure
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if ('text' in firstContent) {
          console.log('Raw response:', firstContent.text);
        }
      }
      
      throw new Error('Failed to parse plant recognition response');
    }
  } catch (error: any) {
    console.error('Error calling Anthropic API for plant recognition:', error);
    throw new Error(error.message || 'Failed to identify plant');
  }
} 