'use client';

import { useState } from 'react';
import Link from 'next/link';
import PlantRecognition from '@/components/PlantRecognition';
import { PlantRecognitionData, PlantCareGuide } from '@/types';

export default function PublicIdentifyPage() {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Handle save to collection attempt
  const handleSaveToCollection = (recognitionData: PlantRecognitionData, careGuide: PlantCareGuide) => {
    // Show login prompt when user tries to save
    setShowLoginPrompt(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-green-700 mb-4">Plant Recognition</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Identify any plant with our AI-powered recognition tool and get detailed care instructions.
          </p>
        </header>

        {showLoginPrompt && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-green-800 mb-2">Want to save this plant?</h3>
            <p className="text-gray-700 mb-4">
              Create a free account or log in to save this plant to your collection and track its care.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/signup" 
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Sign Up
              </Link>
              <Link 
                href="/login" 
                className="px-6 py-2 bg-white text-green-700 font-medium rounded-md border border-green-600 hover:bg-green-50 transition-colors"
              >
                Log In
              </Link>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
              >
                Continue Without Saving
              </button>
            </div>
          </div>
        )}

        <PlantRecognition onSaveToCollection={handleSaveToCollection} />

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Join GreenHearts</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Create a free account to save your plants, get watering reminders, and track your plant care journey.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/signup" 
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Sign Up Free
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-3 bg-white text-green-700 font-medium rounded-md border border-green-600 hover:bg-green-50 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 