import { PlantRecognitionData, PlantRecognitionResult, PlantCareGuide } from '@/types';

/**
 * Send an image to the Anthropic API for plant recognition
 * @param imageFile The image file to analyze
 * @returns Recognition data including species and confidence level
 */
export async function recognizePlantFromImage(imageFile: File): Promise<PlantRecognitionResult> {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Send to the Claude API route that we'll create
    const response = await fetch('/api/claude/recognize-plant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Failed to recognize plant'
      };
    }
    
    return {
      success: true,
      data: {
        ...data.data,
        recognizedAt: new Date(),
      }
    };
  } catch (error: any) {
    console.error('Error recognizing plant:', error);
    return {
      success: false,
      error: error.message || 'Failed to recognize plant'
    };
  }
}

/**
 * Get care guide for a recognized plant species
 * @param species The recognized plant species
 * @returns Detailed care guide for the plant
 */
export async function getPlantCareGuide(species: string): Promise<PlantCareGuide | null> {
  try {
    const response = await fetch('/api/claude/plant-care-guide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ species }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('Error getting care guide:', data.error);
      return null;
    }
    
    return data.careGuide;
  } catch (error) {
    console.error('Error getting plant care guide:', error);
    return null;
  }
}

/**
 * Convert a file to base64 string
 * @param file File to convert
 * @returns Base64 string representation of the file
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
} 