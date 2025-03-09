'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createPlant } from '@/services/plants';
import { uploadPlantImage } from '@/services/storage';
import { generatePlantPersonality, generatePlantCareInfo } from '@/services/claude';
import { getUserProfile } from '@/services/user';
import { PlantHealth, CareInstructions } from '@/types';
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [locationType, setLocationType] = useState('');
  const [locationSpace, setLocationSpace] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [soil, setSoil] = useState('');
  const [potSize, setPotSize] = useState('');
  const [lastWateredDate, setLastWateredDate] = useState(new Date().toISOString().split('T')[0]);
  const [personality, setPersonality] = useState('');
  const [bio, setBio] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState('');
  
  // New state variables for care information
  const [wateringFrequency, setWateringFrequency] = useState(7);
  const [wateringDescription, setWateringDescription] = useState('');
  const [careInstructions, setCareInstructions] = useState<CareInstructions>({});
  const [careInfoGenerated, setCareInfoGenerated] = useState(false);
  
  // Check if all required fields are filled
  const requiredFieldsFilled = species && locationType && sunlight && soil && potSize;
  
  // Get location options based on type
  const getLocationOptions = () => {
    // Default to Indoor locations if no location type is selected yet
    return locationType === 'Outdoor' ? OUTDOOR_LOCATIONS : INDOOR_LOCATIONS;
  };
  
  // Auto-populate name from species if species is changed and name is empty
  useEffect(() => {
    if (species && !name && !aiGenerated) {
      setName(species);
    }
  }, [species, name, aiGenerated]);
  
  // Generate AI personality when all required fields are filled for the first time
  useEffect(() => {
    if (requiredFieldsFilled && !aiGenerated && !manualMode && !aiGenerating) {
      const generatePersonality = async () => {
        if (!requiredFieldsFilled || aiGenerating) return;
        
        setAiGenerating(true);
        try {
          const personality = await generatePlantPersonality({
            species,
            locationType,
            locationSpace,
            sunlight,
            soil,
            potSize,
            imageUrl: photoUrl || undefined
          });
          
          // Update all fields with AI-generated content
          setName(personality.name);
          setPersonality(personality.personalityType.toLowerCase());
          setBio(personality.bio);
          setAiGenerated(true);
        } catch (error) {
          console.error('Error generating plant personality:', error);
          // Don't set error message to avoid confusing the user
        } finally {
          setAiGenerating(false);
        }
      };
      
      generatePersonality();
    }
  }, [requiredFieldsFilled, aiGenerated, manualMode, aiGenerating, species, locationType, locationSpace, sunlight, soil, potSize, photoUrl]);
  
  // Generate care information when all required fields are filled for the first time
  useEffect(() => {
    if (requiredFieldsFilled && !careInfoGenerated && !manualMode && !aiGenerating) {
      const generateCareInfo = async () => {
        if (!requiredFieldsFilled || aiGenerating) return;
        
        setAiGenerating(true);
        try {
          const careInfo = await generatePlantCareInfo({
            species,
            locationType,
            locationSpace,
            sunlight,
            soil,
            potSize,
            imageUrl: photoUrl || undefined
          });
          
          // Update all fields with AI-generated content
          setWateringFrequency(careInfo.wateringSchedule.frequency);
          setWateringDescription(careInfo.wateringSchedule.description);
          setCareInstructions(careInfo.careInstructions);
          setCareInfoGenerated(true);
        } catch (error) {
          console.error('Error generating plant care information:', error);
          // Don't set error message to avoid confusing the user
        } finally {
          setAiGenerating(false);
        }
      };
      
      generateCareInfo();
    }
  }, [requiredFieldsFilled, careInfoGenerated, manualMode, aiGenerating, species, locationType, locationSpace, sunlight, soil, potSize, photoUrl]);
  
  // Fetch user profile to get display name
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile && userProfile.displayName) {
          setUserDisplayName(userProfile.displayName);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  const clearPersonality = () => {
    setPersonality('');
    setBio('');
    setAiGenerated(false);
  };
  
  const handlePhotoSelected = async (file: File) => {
    setPhotoFile(file);
    
    // Create a URL for the selected image
    const tempUrl = URL.createObjectURL(file);
    setPhotoUrl(tempUrl);
  };
  
  const handlePhotoRemoved = () => {
    setPhotoFile(null);
    setPhotoUrl(null);
  };
  
  const toggleManualMode = () => {
    setManualMode(!manualMode);
    // We no longer clear the fields when switching to manual mode
    // This allows users to edit AI-generated content
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
      
      // Calculate next watering date based on frequency
      const lastWatered = new Date(lastWateredDate);
      const nextWateringDate = new Date(lastWatered);
      nextWateringDate.setDate(lastWatered.getDate() + wateringFrequency);
      
      // Create the plant with the image URL if available
      await createPlant({
        userId: user.uid,
        name: plantName,
        species: species || undefined,
        image: imageUrl, // Add the image URL to the plant data
        location: locationSpace || 'Unassigned', // Use 'Unassigned' if locationSpace is empty
        wateringSchedule: {
          frequency: wateringFrequency,
          description: wateringDescription || undefined,
        },
        lastWatered: lastWatered,
        nextWateringDate: nextWateringDate,
        health: PlantHealth.Good,
        notes: `Location Type: ${locationType}, Sunlight: ${sunlight}, Soil: ${soil}, Pot Size: ${potSize}${personality ? ', Personality: ' + personality : ''}`,
        personalityType: personality || undefined,
        bio: bio || undefined,
        careInstructions: Object.keys(careInstructions).length > 0 ? careInstructions : undefined,
        userDisplayName: userDisplayName || undefined,
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
    <div className="space-y-6" style={{ paddingBottom: '120px' }}>
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
        
        {/* Room/Space AutocompleteInput */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room/Space
          </label>
          <AutocompleteInput
            value={locationSpace}
            onChange={setLocationSpace}
            options={getLocationOptions()}
            placeholder="Enter or select a room/space"
          />
        </div>
        
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
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-green-800">Give Your Plant a Heart</h3>
            {!manualMode && aiGenerated && (
              <button
                type="button"
                onClick={() => {
                  setAiGenerated(false);
                  setPersonality('');
                  setBio('');
                }}
                disabled={aiGenerating || !requiredFieldsFilled}
                className="text-xs bg-green-600 text-white p-1 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh personality"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>

          {!manualMode && (
            <div className="mb-4">
              {!aiGenerated && !aiGenerating && requiredFieldsFilled && (
                <div className="text-center mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAiGenerated(true);
                      setPersonality('');
                      setBio('');
                    }}
                    disabled={aiGenerating || !requiredFieldsFilled}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Personality
                  </button>
                </div>
              )}
              
              {aiGenerating && (
                <div className="w-full text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-green-500 border-r-2 border-green-500 border-b-2 border-green-500 border-l-2 border-gray-200"></div>
                </div>
              )}
            </div>
          )}
          
          {/* AI Mode Display */}
          {!manualMode && aiGenerated && !aiGenerating && (
            <div className="bg-white rounded-lg p-4 mb-4 border border-green-100 shadow-sm">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                <p className="text-lg font-medium text-green-800">{name}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Personality Type</h4>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {personality.charAt(0).toUpperCase() + personality.slice(1)}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                <p className="text-sm text-gray-700 italic">{bio}</p>
              </div>
            </div>
          )}
          
          {/* Manual Mode or AI Mode Not Generated Yet */}
          {(manualMode || (!aiGenerated && !aiGenerating)) && (
            <>
              {/* Plant Name */}
              <div className="mb-4">
                <FormInput
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={species ? `Defaults to "${species}"` : "Enter a creative name"}
                  label="Name"
                  disabled={aiGenerating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  If left empty, we&apos;ll use the plant type as the name
                </p>
              </div>
              
              {/* Plant Personality */}
              <div className="space-y-2 w-full mb-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-800">
                    Personality Type
                  </label>
                  {personality && (
                    <button
                      type="button"
                      onClick={clearPersonality}
                      className="text-xs text-gray-500 hover:text-gray-700"
                      disabled={aiGenerating}
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
                      disabled={aiGenerating && !manualMode}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Plant Bio */}
              <div className="w-full">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-800 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter a short bio for your plant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  disabled={aiGenerating && !manualMode}
                />
                <div className="text-sm text-gray-500 mt-2">
                  Don&apos;t worry about filling in all the details - our AI will help generate care instructions and a fun personality for your plant!
                </div>
              </div>
            </>
          )}
          
          {/* Mode Toggle Button - Moved to bottom */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleManualMode}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {manualMode ? 'Use AI' : 'Edit'}
            </button>
          </div>
        </div>
        
        {/* New Section - Care Information */}
        <div className="mt-8 bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-green-800">Care Information</h3>
            {!manualMode && careInfoGenerated && (
              <button
                type="button"
                onClick={() => {
                  setCareInfoGenerated(false);
                  setWateringFrequency(7);
                  setWateringDescription('');
                  setCareInstructions({});
                }}
                disabled={aiGenerating || !requiredFieldsFilled}
                className="text-xs bg-green-600 text-white p-1 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh care info"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>

          {!manualMode && (
            <div className="mb-4">
              {!careInfoGenerated && !aiGenerating && requiredFieldsFilled && (
                <div className="text-center mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCareInfoGenerated(true);
                      setWateringFrequency(7);
                      setWateringDescription('');
                      setCareInstructions({});
                    }}
                    disabled={aiGenerating || !requiredFieldsFilled}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Care Information
                  </button>
                </div>
              )}
              
              {aiGenerating && !aiGenerated && !careInfoGenerated && (
                <div className="w-full text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-green-500 border-r-2 border-green-500 border-b-2 border-green-500 border-l-2 border-gray-200"></div>
                </div>
              )}
            </div>
          )}
          
          {/* AI Generated Care Info Display */}
          {!manualMode && careInfoGenerated && !aiGenerating && (
            <div className="bg-white rounded-lg p-4 mb-4 border border-green-100 shadow-sm">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Watering Schedule</h4>
                <p className="text-sm text-gray-700">Every {wateringFrequency} days</p>
                <p className="text-sm text-gray-700 mt-1">{wateringDescription}</p>
              </div>
              
              {careInstructions.light && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Light</h4>
                  <p className="text-sm text-gray-700">{careInstructions.light}</p>
                </div>
              )}
              
              {careInstructions.soil && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Soil</h4>
                  <p className="text-sm text-gray-700">{careInstructions.soil}</p>
                </div>
              )}
              
              {careInstructions.temperature && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Temperature</h4>
                  <p className="text-sm text-gray-700">{careInstructions.temperature}</p>
                </div>
              )}
              
              {careInstructions.humidity && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Humidity</h4>
                  <p className="text-sm text-gray-700">{careInstructions.humidity}</p>
                </div>
              )}
              
              {careInstructions.fertilizer && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Fertilizer</h4>
                  <p className="text-sm text-gray-700">{careInstructions.fertilizer}</p>
                </div>
              )}
              
              {careInstructions.pruning && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Pruning</h4>
                  <p className="text-sm text-gray-700">{careInstructions.pruning}</p>
                </div>
              )}
              
              {careInstructions.repotting && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Repotting</h4>
                  <p className="text-sm text-gray-700">{careInstructions.repotting}</p>
                </div>
              )}
              
              {careInstructions.commonIssues && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Common Issues</h4>
                  <p className="text-sm text-gray-700">{careInstructions.commonIssues}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Manual Mode for Care Info */}
          {manualMode && (
            <div className="space-y-4">
              <div>
                <label htmlFor="wateringFrequency" className="block text-sm font-medium text-gray-800 mb-1">
                  Watering Frequency (days)
                </label>
                <input
                  id="wateringFrequency"
                  type="number"
                  min="1"
                  max="90"
                  value={wateringFrequency}
                  onChange={(e) => setWateringFrequency(parseInt(e.target.value) || 7)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="wateringDescription" className="block text-sm font-medium text-gray-800 mb-1">
                  Watering Description
                </label>
                <textarea
                  id="wateringDescription"
                  value={wateringDescription}
                  onChange={(e) => setWateringDescription(e.target.value)}
                  placeholder="Describe how to water this plant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <div>
                <label htmlFor="lightNeeds" className="block text-sm font-medium text-gray-800 mb-1">
                  Light Needs
                </label>
                <textarea
                  id="lightNeeds"
                  value={careInstructions.light || ''}
                  onChange={(e) => setCareInstructions({...careInstructions, light: e.target.value})}
                  placeholder="Describe light requirements"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <div>
                <label htmlFor="soilNeeds" className="block text-sm font-medium text-gray-800 mb-1">
                  Soil Needs
                </label>
                <textarea
                  id="soilNeeds"
                  value={careInstructions.soil || ''}
                  onChange={(e) => setCareInstructions({...careInstructions, soil: e.target.value})}
                  placeholder="Describe soil requirements"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
          )}
          
          {/* Mode Toggle Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setManualMode(!manualMode);
                if (!careInfoGenerated && !manualMode) {
                  setCareInfoGenerated(true);
                  setWateringFrequency(7);
                  setWateringDescription('');
                  setCareInstructions({});
                }
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {manualMode ? 'Use AI' : 'Edit Manually'}
            </button>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="w-full">
          <button
            type="submit"
            disabled={loading || aiGenerating}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Adding Plant...' : 'Add Plant'}
          </button>
        </div>
      </form>
    </div>
  );
} 