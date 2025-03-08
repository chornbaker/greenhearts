'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createPlant } from '@/services/plants';
import { uploadPlantImage } from '@/services/storage';
import { PlantHealth } from '@/types';
import FormInput from '@/components/FormInput';
import ButtonSelector from '@/components/ButtonSelector';
import AutocompleteInput from '@/components/AutocompleteInput';
import DateSelector from '@/components/DateSelector';
import PhotoUploader from '@/components/PhotoUploader';

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

// Plant personality options
const PERSONALITIES = [
  { value: 'cheerful', label: 'Cheerful' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'zen', label: 'Zen' },
  { value: 'sassy', label: 'Sassy' },
  { value: 'royal', label: 'Royal' },
  { value: 'shy', label: 'Shy' },
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'wise', label: 'Wise' }
];

export default function AddPlant() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [locationType, setLocationType] = useState('');
  const [locationSpace, setLocationSpace] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [soil, setSoil] = useState('');
  const [potSize, setPotSize] = useState('');
  const [lastWateredDate, setLastWateredDate] = useState(new Date().toISOString().split('T')[0]);
  const [personality, setPersonality] = useState('');
  
  // Get location options based on type
  const getLocationOptions = () => {
    // Default to Indoor locations if no location type is selected yet
    return locationType === 'Outdoor' ? OUTDOOR_LOCATIONS : INDOOR_LOCATIONS;
  };
  
  // Auto-populate name from species if species is changed and name is empty
  useEffect(() => {
    if (species && !name) {
      setName(species);
    }
  }, [species, name]);
  
  const clearPersonality = () => {
    setPersonality('');
  };
  
  const handlePhotoSelected = (file: File) => {
    setPhotoFile(file);
  };
  
  const handlePhotoRemoved = () => {
    setPhotoFile(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add a plant');
      return;
    }
    
    if (!species) {
      setError('Please provide a plant type/species');
      return;
    }
    
    if (!locationType) {
      setError('Please select a location type (Indoor or Outdoor)');
      return;
    }
    
    if (!sunlight) {
      setError('Please select a sunlight level');
      return;
    }
    
    if (!soil) {
      setError('Please select a soil type');
      return;
    }
    
    if (!potSize) {
      setError('Please select a container type');
      return;
    }
    
    // If name is still empty, use species as the name
    const plantName = name || species;
    
    setLoading(true);
    setError('');
    
    try {
      let imageUrl;
      
      // Upload the photo if one was selected
      if (photoFile) {
        imageUrl = await uploadPlantImage(user.uid, photoFile);
      }
      
      // Create the plant with the image URL if available
      await createPlant({
        userId: user.uid,
        name: plantName,
        species: species || undefined,
        image: imageUrl, // Add the image URL to the plant data
        location: locationSpace || 'Unassigned', // Use 'Unassigned' if locationSpace is empty
        wateringSchedule: {
          frequency: 7, // Default to weekly watering
        },
        lastWatered: new Date(lastWateredDate),
        nextWateringDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        health: PlantHealth.Good,
        notes: `Location Type: ${locationType}, Sunlight: ${sunlight}, Soil: ${soil}, Pot Size: ${potSize}${personality ? ', Personality: ' + personality : ''}`,
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
    <div className="space-y-6 pb-36">
      <h1 className="text-2xl font-bold text-green-800">Add a New Plant</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo Upload Section */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <PhotoUploader 
            onPhotoSelected={handlePhotoSelected}
            onPhotoRemoved={handlePhotoRemoved}
            aspectRatio="square"
          />
        </div>
        
        {/* Plant Type/Species - Required */}
        <FormInput
          id="species"
          type="text"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          placeholder="Enter species"
          label={<span>Plant Type/Species <span className="text-red-500">*</span></span>}
          required
        />
        
        {/* Location Type Buttons */}
        <ButtonSelector
          label={<span>Location Type <span className="text-red-500">*</span></span>}
          options={[
            { value: 'Indoor', label: 'Indoor' },
            { value: 'Outdoor', label: 'Outdoor' }
          ]}
          value={locationType}
          onChange={setLocationType}
          containerClassName="w-full"
        />
        
        {/* Room/Space Autocomplete - Now Optional */}
        <AutocompleteInput
          label="Room/Space"
          value={locationSpace}
          onChange={setLocationSpace}
          options={getLocationOptions()}
          placeholder="Enter or select a room/space (optional)"
          containerClassName="w-full"
          required={false}
        />
        
        {/* Sunlight Buttons */}
        <ButtonSelector
          label={<span>Sunlight <span className="text-red-500">*</span></span>}
          options={[
            { value: 'Low Light', label: 'Low Light' },
            { value: 'Partial Shade', label: 'Partial Shade' },
            { value: 'Bright Indirect', label: 'Bright Indirect' },
            { value: 'Direct Sun', label: 'Direct Sun' },
            { value: 'Full Sun', label: 'Full Sun' }
          ]}
          value={sunlight}
          onChange={setSunlight}
          containerClassName="w-full"
        />
        
        {/* Soil Type Buttons */}
        <ButtonSelector
          label={<span>Soil Type <span className="text-red-500">*</span></span>}
          options={[
            { value: 'All-Purpose', label: 'All-Purpose' },
            { value: 'Cactus Mix', label: 'Cactus Mix' },
            { value: 'Orchid Mix', label: 'Orchid Mix' },
            { value: 'African Violet', label: 'African Violet' },
            { value: 'LECA/Hydroponics', label: 'LECA/Hydroponics' },
            { value: 'Other', label: 'Other' }
          ]}
          value={soil}
          onChange={setSoil}
          containerClassName="w-full"
        />
        
        {/* Pot Size Buttons */}
        <ButtonSelector
          label={<span>Container Type <span className="text-red-500">*</span></span>}
          options={[
            { value: '2-3"', label: '2-3" (Tiny)' },
            { value: '4-6"', label: '4-6" (Small)' },
            { value: '8-10"', label: '8-10" (Medium)' },
            { value: '12-14"', label: '12-14" (Large)' },
            { value: '16"+', label: '16"+ (X-Large)' },
            { value: 'Not Potted/Other', label: 'Not Potted/Other' }
          ]}
          value={potSize}
          onChange={setPotSize}
          containerClassName="w-full"
        />
        
        {/* Last Watered Date */}
        <DateSelector
          label={<span>Last Watered Date <span className="text-red-500">*</span></span>}
          value={lastWateredDate}
          onChange={setLastWateredDate}
          containerClassName="w-full"
          required
        />
        
        {/* Optional Section - Name and Personality */}
        <div className="mt-8 bg-green-50 p-4 rounded-xl border border-green-200">
          <h3 className="text-lg font-medium text-green-800 mb-3">Personalize Your Plant (Optional)</h3>
          
          {/* Plant Name */}
          <div className="mb-4">
            <FormInput
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={species ? `Defaults to "${species}"` : "Enter plant name"}
              label="Plant Nickname"
            />
            <p className="text-xs text-gray-500 mt-1">
              If left empty, we'll use the plant type as the name
            </p>
          </div>
          
          {/* Plant Personality */}
          <div className="space-y-2 w-full">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-800">
                Plant Personality
              </label>
              {personality && (
                <button
                  type="button"
                  onClick={clearPersonality}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 w-full">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                    personality === p.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setPersonality(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="w-full">
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