'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { createPlant } from '@/services/plants';
import { PlantHealth } from '@/types';

export default function AddPlant() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('Indoor');
  const [sunlight, setSunlight] = useState('Medium');
  const [soil, setSoil] = useState('Loamy');
  const [potSize, setPotSize] = useState('Medium');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add a plant');
      return;
    }
    
    if (!name) {
      setError('Please provide a name for your plant');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // For now, we'll create a placeholder plant
      // In a real implementation, we would upload the image and use AI to generate a schedule
      await createPlant({
        userId: user.uid,
        name,
        species: species || undefined,
        wateringSchedule: {
          frequency: 7, // Default to weekly watering
        },
        lastWatered: new Date(),
        nextWateringDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        health: PlantHealth.Good,
        notes: `Location: ${location}, Sunlight: ${sunlight}, Soil: ${soil}, Pot Size: ${potSize}`,
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error adding plant:', error);
      setError('Failed to add plant. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-800">Add a New Plant</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Plant Name*
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter plant name"
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
            Plant Type/Species
          </label>
          <input
            id="species"
            type="text"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder="Enter species (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sunlight" className="block text-sm font-medium text-gray-700 mb-1">
              Sunlight
            </label>
            <select
              id="sunlight"
              value={sunlight}
              onChange={(e) => setSunlight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="soil" className="block text-sm font-medium text-gray-700 mb-1">
              Soil Type
            </label>
            <select
              id="soil"
              value={soil}
              onChange={(e) => setSoil(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Sandy">Sandy</option>
              <option value="Loamy">Loamy</option>
              <option value="Clay">Clay</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="potSize" className="block text-sm font-medium text-gray-700 mb-1">
              Pot Size
            </label>
            <select
              id="potSize"
              value={potSize}
              onChange={(e) => setPotSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 mb-3">
            Photo Upload (Coming Soon)
          </p>
          <div className="h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Upload plant photo</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">
            AI-Generated Personality (Coming Soon)
          </p>
          <p className="text-xs text-gray-500">
            We'll generate a fun personality for your plant based on its type and characteristics.
          </p>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Adding Plant...' : 'Add Plant'}
          </button>
        </div>
      </form>
    </div>
  );
} 