'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plant, PlantHealth } from '@/types';
import { updatePlant } from '@/services/plants';

// Water droplet icon component
const WaterDropIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <div 
    className={className} 
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
      <path d="M12 2.5c-1.7 2.3-6 7.6-6 11.5 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.9-4.3-9.2-6-11.5z" />
    </svg>
  </div>
);

type ExpandableCardProps = {
  plant: Plant;
  onWater: (plantId: string) => void;
  onUpdate?: (plantId: string, updatedPlant: Partial<Plant>) => void;
};

enum ExpansionState {
  Collapsed = 0,
  Expanded = 1,
  FullyExpanded = 2,
}

export default function ExpandableCard({ plant, onWater, onUpdate }: ExpandableCardProps) {
  const [expansionState, setExpansionState] = useState<ExpansionState>(ExpansionState.Collapsed);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editable fields
  const [lastWateredDate, setLastWateredDate] = useState<string>(
    plant.lastWatered ? plant.lastWatered.toISOString().split('T')[0] : ''
  );
  const [comments, setComments] = useState<string>(plant.notes || '');
  
  // Refs for focus management
  const commentsRef = useRef<HTMLTextAreaElement>(null);

  // Calculate if the plant needs water
  const needsWater = plant.nextWateringDate && plant.nextWateringDate <= new Date();
  
  // Format dates nicely
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle card clicks
  const handleClick = () => {
    if (isEditing) return; // Don't change state if we're editing
    
    // Cycle through expansion states: Collapsed -> Expanded -> FullyExpanded -> Collapsed
    setExpansionState((current) => (current + 1) % 3);
  };

  // Handle water button click
  const handleWaterClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    onWater(plant.id);
  };
  
  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setIsEditing(true);
  };
  
  // Handle cancel button click
  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setIsEditing(false);
    setHasChanges(false);
    
    // Reset editable fields to original values
    setLastWateredDate(plant.lastWatered ? plant.lastWatered.toISOString().split('T')[0] : '');
    setComments(plant.notes || '');
  };
  
  // Handle save button click
  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Calculate next watering date based on last watered date and frequency
      const newLastWatered = new Date(lastWateredDate);
      const newNextWateringDate = new Date(newLastWatered);
      newNextWateringDate.setDate(newLastWatered.getDate() + (plant.wateringSchedule?.frequency || 7));
      
      // Create updates object
      const updates: Partial<Plant> = {
        lastWatered: newLastWatered,
        nextWateringDate: newNextWateringDate,
        notes: comments,
      };
      
      // Update plant in database
      await updatePlant(plant.id, updates);
      
      // Notify parent component of update
      if (onUpdate) {
        onUpdate(plant.id, updates);
      }
      
      setHasChanges(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving plant updates:', error);
      // Could add error handling UI here
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle last watered date change
  const handleLastWateredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastWateredDate(e.target.value);
    setHasChanges(true);
  };
  
  // Handle comments change
  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
    setHasChanges(true);
  };
  
  // Focus comments field when editing starts
  const focusComments = () => {
    if (isEditing && commentsRef.current) {
      commentsRef.current.focus();
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-4 w-full"
      initial={{ borderRadius: 12 }}
      animate={{ 
        borderRadius: expansionState === ExpansionState.FullyExpanded ? 16 : 12,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
      onClick={handleClick}
      layout
    >
      {expansionState !== ExpansionState.FullyExpanded ? (
        // Collapsed and Expanded Views
        <div className="flex h-full">
          {/* Image Section */}
          <motion.div 
            className="relative bg-gray-100"
            initial={{ width: '100px', height: '100%' }}
            animate={{ 
              width: expansionState === ExpansionState.Collapsed 
                ? '100px' 
                : '120px',
              height: '100%'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            layout
          >
            {plant.image ? (
              <Image 
                src={plant.image} 
                alt={plant.name} 
                fill 
                sizes="(max-width: 768px) 100px, 120px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Water indicator */}
            {needsWater && (
              <motion.div 
                className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <WaterDropIcon className="h-5 w-5 text-white" />
              </motion.div>
            )}
          </motion.div>
          
          {/* Content Section */}
          <motion.div 
            className="flex-1 p-4 flex flex-col"
            layout
          >
            {/* Basic Info */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-700">{plant.name}</h3>
                <p className="text-sm text-gray-500">{plant.species || 'Unknown species'}</p>
              </div>
              
              {/* Water button for plants that need water */}
              {needsWater && (
                <motion.button 
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded-lg flex items-center gap-1"
                  onClick={handleWaterClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <WaterDropIcon className="h-4 w-4 text-white" />
                  <span>Water</span>
                </motion.button>
              )}
            </div>
            
            {/* Location info (always shown) */}
            <p className="text-xs text-gray-500 mt-1">
              {plant.location || 'No location assigned'}
            </p>
            
            {/* Expanded Content */}
            <AnimatePresence>
              {expansionState >= ExpansionState.Expanded && (
                <motion.div 
                  className="mt-4 pt-4 border-t border-gray-100"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Last watered:</span>
                      <p className="font-medium text-gray-700">{formatDate(plant.lastWatered)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Next watering:</span>
                      <p className="font-medium text-gray-700">{formatDate(plant.nextWateringDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Health:</span>
                      <p className="font-medium text-gray-700">{plant.health || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Watering frequency:</span>
                      <p className="font-medium text-gray-700">
                        {plant.wateringSchedule?.frequency 
                          ? `Every ${plant.wateringSchedule.frequency} days` 
                          : 'Not set'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        // Fully Expanded View (Full Width)
        <motion.div 
          className="flex flex-col w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          layout
        >
          {/* Full Width Image */}
          <div className="relative w-full h-64 bg-gray-100">
            {plant.image ? (
              <Image 
                src={plant.image} 
                alt={plant.name} 
                fill 
                sizes="100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Plant name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h2 className="text-white text-xl font-semibold">{plant.name}</h2>
              <p className="text-white/90 text-sm">{plant.species}</p>
            </div>
            
            {/* Close button */}
            <button 
              className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setExpansionState(ExpansionState.Collapsed);
                setIsEditing(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Content Section */}
          <div className="p-5">
            {/* Edit/Save/Cancel Buttons */}
            <div className="flex justify-end mb-4">
              {!isEditing ? (
                <motion.button
                  className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                  onClick={handleEditClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </motion.button>
              ) : (
                <div className="flex gap-2">
                  <motion.button
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium"
                    onClick={handleCancelClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSaving}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className={`${hasChanges ? 'bg-green-600 hover:bg-green-700' : 'bg-green-400'} text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1`}
                    onClick={handleSaveClick}
                    whileHover={hasChanges ? { scale: 1.02 } : {}}
                    whileTap={hasChanges ? { scale: 0.98 } : {}}
                    disabled={!hasChanges || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Save
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
            
            {/* Basic Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-3 rounded-xl">
                <h4 className="text-xs font-medium text-green-700 mb-1">Health</h4>
                <p className="text-green-900 font-medium">{plant.health || 'Unknown'}</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-xl">
                <h4 className="text-xs font-medium text-blue-700 mb-1">Watering</h4>
                <p className="text-blue-900 font-medium">Every {plant.wateringSchedule?.frequency || '7'} days</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-xl">
                <h4 className="text-xs font-medium text-purple-700 mb-1">Location</h4>
                <p className="text-purple-900 font-medium">{plant.location || 'Not set'}</p>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-xl">
                <h4 className="text-xs font-medium text-amber-700 mb-1">Personality</h4>
                <p className="text-amber-900 font-medium capitalize">{plant.personalityType || 'Not set'}</p>
              </div>
            </div>
            
            {/* Watering Schedule */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Watering Schedule</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Watered</h4>
                  {isEditing ? (
                    <input
                      type="date"
                      value={lastWateredDate}
                      onChange={handleLastWateredChange}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  ) : (
                    <p className="text-gray-900">{formatDate(plant.lastWatered)}</p>
                  )}
                </div>
                
                <div className="flex-1 flex justify-center">
                  <div className="h-0.5 w-full max-w-xs bg-gray-200 relative">
                    <div className="absolute -top-2 left-0 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2"></div>
                    <div className="absolute -top-2 right-0 w-4 h-4 bg-green-500 rounded-full transform translate-x-1/2"></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Next Watering</h4>
                  <p className="text-gray-900">{formatDate(plant.nextWateringDate)}</p>
                </div>
              </div>
              
              {plant.wateringSchedule?.description && (
                <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <span className="font-medium">Watering Tip:</span> {plant.wateringSchedule.description}
                </div>
              )}
            </div>
            
            {/* Care Instructions */}
            {plant.careInstructions && Object.keys(plant.careInstructions).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Care Instructions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plant.careInstructions.light && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Light</h4>
                      <p className="text-sm text-gray-600">{plant.careInstructions.light}</p>
                    </div>
                  )}
                  
                  {plant.careInstructions.soil && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Soil</h4>
                      <p className="text-sm text-gray-600">{plant.careInstructions.soil}</p>
                    </div>
                  )}
                  
                  {plant.careInstructions.humidity && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Humidity</h4>
                      <p className="text-sm text-gray-600">{plant.careInstructions.humidity}</p>
                    </div>
                  )}
                  
                  {plant.careInstructions.temperature && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Temperature</h4>
                      <p className="text-sm text-gray-600">{plant.careInstructions.temperature}</p>
                    </div>
                  )}
                  
                  {plant.careInstructions.fertilizer && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Fertilizer</h4>
                      <p className="text-sm text-gray-600">{plant.careInstructions.fertilizer}</p>
                    </div>
                  )}
                  
                  {plant.careInstructions.pruning && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Pruning</h4>
                      <p className="text-sm text-gray-600">{plant.careInstructions.pruning}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Comments/Notes Section */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Notes</h3>
              {isEditing ? (
                <textarea
                  ref={commentsRef}
                  value={comments}
                  onChange={handleCommentsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add notes about your plant here..."
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[100px]">
                  {plant.notes ? (
                    <p className="text-gray-700">{plant.notes}</p>
                  ) : (
                    <p className="text-gray-400 italic">No notes yet. Click Edit to add some!</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Personality and Bio */}
            {plant.personalityType && plant.bio && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Personality</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium capitalize">
                      {plant.personalityType}
                    </span>
                  </div>
                  <p className="text-amber-800 italic">{plant.bio}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 