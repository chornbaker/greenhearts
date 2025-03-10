'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PlantRecognition from '@/components/PlantRecognition';
import { PlantRecognitionData, PlantCareGuide, Plant } from '@/types';
import { createPlant } from '@/services/plants';
import { useAuth } from '@/context/AuthContext';

export default function IdentifyPlantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle saving the recognized plant to the user's collection
  const handleSaveToCollection = async (recognitionData: PlantRecognitionData, careGuide: PlantCareGuide) => {
    if (!user) {
      setError('You must be logged in to save plants to your collection');
      return;
    }

    setIsAddingToCollection(true);
    setError(null);
    setSuccess(null);

    try {
      // Create a new plant object from the recognition data and care guide
      const newPlant: Omit<Plant, 'id' | 'createdAt'> = {
        userId: user.uid, // Using uid from Firebase user
        name: recognitionData.recognizedSpecies,
        species: recognitionData.recognizedSpecies,
        image: recognitionData.imageUrl,
        wateringSchedule: {
          frequency: careGuide.wateringSchedule.frequency,
          description: careGuide.wateringSchedule.description,
        },
        careInstructions: careGuide.careInstructions,
        recognitionData: {
          ...recognitionData,
          recognizedAt: new Date(),
        },
      };

      // Add the plant to the user's collection using the createPlant function
      await createPlant(newPlant);
      
      setSuccess(`${recognitionData.recognizedSpecies} has been added to your collection!`);
      
      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error adding plant to collection:', error);
      setError(error.message || 'Failed to add plant to your collection');
    } finally {
      setIsAddingToCollection(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Identify Your Plant</h1>
        <p className="text-gray-600">
          Take or upload a photo of your plant, and we'll identify it and provide detailed care instructions.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {isAddingToCollection && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center">
          <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-blue-600">Adding plant to your collection...</p>
        </div>
      )}

      <PlantRecognition onSaveToCollection={handleSaveToCollection} />
    </div>
  );
} 