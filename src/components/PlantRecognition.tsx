'use client';

import { useState } from 'react';
import { PlantRecognitionData, PlantCareGuide } from '@/types';
import PhotoUploader from './PhotoUploader';
import { recognizePlantFromImage, getPlantCareGuide } from '@/services/plantRecognition';
import Image from 'next/image';

interface PlantRecognitionProps {
  onSaveToCollection?: (recognitionData: PlantRecognitionData, careGuide: PlantCareGuide) => void;
}

export default function PlantRecognition({ onSaveToCollection }: PlantRecognitionProps) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<PlantRecognitionData | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [careGuide, setCareGuide] = useState<PlantCareGuide | null>(null);
  const [isLoadingCareGuide, setIsLoadingCareGuide] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  // Handle photo selection
  const handlePhotoSelected = (file: File) => {
    setSelectedPhoto(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    // Reset previous results
    setRecognitionResult(null);
    setRecognitionError(null);
    setCareGuide(null);
  };

  // Handle photo removal
  const handlePhotoRemoved = () => {
    setSelectedPhoto(null);
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
      setPhotoPreviewUrl(null);
    }
    // Reset results
    setRecognitionResult(null);
    setRecognitionError(null);
    setCareGuide(null);
  };

  // Recognize plant from the selected photo
  const handleRecognize = async () => {
    if (!selectedPhoto) {
      setRecognitionError('Please select a photo first');
      return;
    }

    setIsRecognizing(true);
    setRecognitionError(null);
    
    try {
      const result = await recognizePlantFromImage(selectedPhoto);
      
      if (result.success && result.data) {
        setRecognitionResult(result.data);
        // Automatically fetch care guide for the recognized plant
        fetchCareGuide(result.data.recognizedSpecies);
      } else {
        setRecognitionError(result.error || 'Failed to recognize plant');
      }
    } catch (error: any) {
      setRecognitionError(error.message || 'An error occurred during plant recognition');
    } finally {
      setIsRecognizing(false);
    }
  };

  // Fetch care guide for a recognized plant
  const fetchCareGuide = async (species: string) => {
    setIsLoadingCareGuide(true);
    
    try {
      const guide = await getPlantCareGuide(species);
      setCareGuide(guide);
    } catch (error: any) {
      console.error('Error fetching care guide:', error);
      // We don't set an error state here to not disrupt the recognition result display
    } finally {
      setIsLoadingCareGuide(false);
    }
  };

  // Handle saving the recognized plant to the user's collection
  const handleSaveToCollection = () => {
    if (recognitionResult && careGuide && onSaveToCollection) {
      onSaveToCollection(recognitionResult, careGuide);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Plant Recognition</h2>
        <p className="text-gray-600 mb-6">
          Take or upload a photo of your plant, and we'll identify it and provide care instructions.
        </p>
        
        <div className="mb-6">
          <PhotoUploader 
            onPhotoSelected={handlePhotoSelected}
            onPhotoRemoved={handlePhotoRemoved}
            currentPhotoUrl={photoPreviewUrl || undefined}
            aspectRatio="4:3"
          />
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleRecognize}
            disabled={!selectedPhoto || isRecognizing}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              !selectedPhoto || isRecognizing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } transition-colors duration-200`}
          >
            {isRecognizing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Identifying Plant...
              </span>
            ) : (
              'Identify Plant'
            )}
          </button>
        </div>
        
        {recognitionError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{recognitionError}</p>
          </div>
        )}
      </div>
      
      {/* Recognition Results */}
      {recognitionResult && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recognition Results</h3>
          
          <div className="flex flex-col md:flex-row gap-6">
            {photoPreviewUrl && (
              <div className="w-full md:w-1/3">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image 
                    src={photoPreviewUrl}
                    alt="Plant photo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="w-full md:w-2/3">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-800">
                  {recognitionResult.recognizedSpecies}
                </h4>
                {recognitionResult.scientificName && (
                  <p className="text-gray-500 italic">
                    {recognitionResult.scientificName}
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 mr-2">Confidence:</span>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${recognitionResult.confidence}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{recognitionResult.confidence}%</span>
                </div>
              </div>
              
              {recognitionResult.description && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Description:</h5>
                  <p className="text-gray-600">{recognitionResult.description}</p>
                </div>
              )}
              
              {recognitionResult.alternativeSpecies && recognitionResult.alternativeSpecies.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Alternative Matches:</h5>
                  <ul className="list-disc list-inside text-gray-600">
                    {recognitionResult.alternativeSpecies.map((alt, index) => (
                      <li key={index}>
                        {alt.name} ({alt.confidence}% confidence)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {onSaveToCollection && (
                <div className="mt-4">
                  <button
                    onClick={handleSaveToCollection}
                    disabled={!careGuide}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                      !careGuide
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    } transition-colors duration-200`}
                  >
                    Save to My Collection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Care Guide */}
      {isLoadingCareGuide && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-lg text-gray-700">Loading care guide...</span>
          </div>
        </div>
      )}
      
      {careGuide && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Care Guide</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-800 mb-2">{careGuide.species}</h4>
            {careGuide.scientificName && (
              <p className="text-gray-500 italic mb-2">{careGuide.scientificName}</p>
            )}
            {careGuide.description && (
              <p className="text-gray-600">{careGuide.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 p-4 rounded-md">
              <h5 className="font-medium text-gray-800 mb-2">Watering</h5>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Frequency:</span> Every {careGuide.wateringSchedule.frequency} days
              </p>
              <p className="text-gray-600">{careGuide.wateringSchedule.description}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <h5 className="font-medium text-gray-800 mb-2">Light</h5>
              <p className="text-gray-600">{careGuide.careInstructions.light}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-md">
              <h5 className="font-medium text-gray-800 mb-2">Soil</h5>
              <p className="text-gray-600">{careGuide.careInstructions.soil}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-md">
              <h5 className="font-medium text-gray-800 mb-2">Temperature & Humidity</h5>
              <p className="text-gray-600 mb-2">{careGuide.careInstructions.temperature}</p>
              <p className="text-gray-600">{careGuide.careInstructions.humidity}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h5 className="font-medium text-gray-800 mb-2">Additional Care</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careGuide.careInstructions.fertilizer && (
                <div>
                  <h6 className="text-sm font-medium text-gray-700">Fertilizing</h6>
                  <p className="text-gray-600">{careGuide.careInstructions.fertilizer}</p>
                </div>
              )}
              
              {careGuide.careInstructions.pruning && (
                <div>
                  <h6 className="text-sm font-medium text-gray-700">Pruning</h6>
                  <p className="text-gray-600">{careGuide.careInstructions.pruning}</p>
                </div>
              )}
              
              {careGuide.careInstructions.repotting && (
                <div>
                  <h6 className="text-sm font-medium text-gray-700">Repotting</h6>
                  <p className="text-gray-600">{careGuide.careInstructions.repotting}</p>
                </div>
              )}
              
              {careGuide.careInstructions.commonIssues && (
                <div>
                  <h6 className="text-sm font-medium text-gray-700">Common Issues</h6>
                  <p className="text-gray-600">{careGuide.careInstructions.commonIssues}</p>
                </div>
              )}
            </div>
          </div>
          
          {careGuide.seasonalCare && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-800 mb-2">Seasonal Care</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careGuide.seasonalCare.spring && (
                  <div>
                    <h6 className="text-sm font-medium text-gray-700">Spring</h6>
                    <p className="text-gray-600">{careGuide.seasonalCare.spring}</p>
                  </div>
                )}
                
                {careGuide.seasonalCare.summer && (
                  <div>
                    <h6 className="text-sm font-medium text-gray-700">Summer</h6>
                    <p className="text-gray-600">{careGuide.seasonalCare.summer}</p>
                  </div>
                )}
                
                {careGuide.seasonalCare.fall && (
                  <div>
                    <h6 className="text-sm font-medium text-gray-700">Fall</h6>
                    <p className="text-gray-600">{careGuide.seasonalCare.fall}</p>
                  </div>
                )}
                
                {careGuide.seasonalCare.winter && (
                  <div>
                    <h6 className="text-sm font-medium text-gray-700">Winter</h6>
                    <p className="text-gray-600">{careGuide.seasonalCare.winter}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {careGuide.tips && careGuide.tips.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Pro Tips</h5>
              <ul className="list-disc list-inside text-gray-600">
                {careGuide.tips.map((tip, index) => (
                  <li key={index} className="mb-1">{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 