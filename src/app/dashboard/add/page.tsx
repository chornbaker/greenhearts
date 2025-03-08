'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { createPlant } from '@/services/plants';
import { PlantHealth } from '@/types';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';

// Predefined room/space options
const INDOOR_LOCATIONS = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Office',
  'Dining Room',
  'Hallway',
  'Other'
];

const OUTDOOR_LOCATIONS = [
  'Patio',
  'Balcony',
  'Front Yard',
  'Back Yard',
  'Garden',
  'Porch',
  'Other'
];

export default function AddPlant() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [locationType, setLocationType] = useState('Indoor');
  const [locationSpace, setLocationSpace] = useState(INDOOR_LOCATIONS[0]);
  const [sunlight, setSunlight] = useState('Medium');
  const [soil, setSoil] = useState('Loamy');
  const [potSize, setPotSize] = useState('Medium');
  
  // Update location space options when location type changes
  const handleLocationTypeChange = (type: string) => {
    setLocationType(type);
    setLocationSpace(type === 'Indoor' ? INDOOR_LOCATIONS[0] : OUTDOOR_LOCATIONS[0]);
  };
  
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
        location: locationSpace, // Store the specific room/space
        wateringSchedule: {
          frequency: 7, // Default to weekly watering
        },
        lastWatered: new Date(),
        nextWateringDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        health: PlantHealth.Good,
        notes: `Location Type: ${locationType}, Sunlight: ${sunlight}, Soil: ${soil}, Pot Size: ${potSize}`,
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
        <FormInput
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter plant name"
          label="Plant Name*"
        />
        
        <FormInput
          id="species"
          type="text"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          placeholder="Enter species (optional)"
          label="Plant Type/Species"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            id="locationType"
            value={locationType}
            onChange={(e) => handleLocationTypeChange(e.target.value)}
            label="Location Type"
            options={[
              { value: 'Indoor', label: 'Indoor' },
              { value: 'Outdoor', label: 'Outdoor' }
            ]}
          />
          
          <FormSelect
            id="locationSpace"
            value={locationSpace}
            onChange={(e) => setLocationSpace(e.target.value)}
            label="Room/Space"
            options={
              (locationType === 'Indoor' ? INDOOR_LOCATIONS : OUTDOOR_LOCATIONS).map(loc => ({
                value: loc,
                label: loc
              }))
            }
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            id="sunlight"
            value={sunlight}
            onChange={(e) => setSunlight(e.target.value)}
            label="Sunlight"
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' }
            ]}
          />
          
          <FormSelect
            id="soil"
            value={soil}
            onChange={(e) => setSoil(e.target.value)}
            label="Soil Type"
            options={[
              { value: 'Sandy', label: 'Sandy' },
              { value: 'Loamy', label: 'Loamy' },
              { value: 'Clay', label: 'Clay' }
            ]}
          />
        </div>
        
        <FormSelect
          id="potSize"
          value={potSize}
          onChange={(e) => setPotSize(e.target.value)}
          label="Pot Size"
          options={[
            { value: 'Small', label: 'Small' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Large', label: 'Large' }
          ]}
        />
        
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