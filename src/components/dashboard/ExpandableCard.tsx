'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plant, PlantHealth } from '@/types';
import { updatePlant, waterPlant } from '@/services/plants';

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

// Calendar icon component
const CalendarIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <div className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  </div>
);

type ExpandableCardProps = {
  plant: Plant;
  onWater: (plantId: string) => void;
  onUpdate?: (plantId: string, updates: Partial<Plant>) => void;
};

enum ExpansionState {
  Collapsed = 0,
  Expanded = 1,
  FullyExpanded = 2,
}

export default function ExpandableCard({ plant, onWater, onUpdate }: ExpandableCardProps) {
  const [expansionState, setExpansionState] = useState<ExpansionState>(ExpansionState.Collapsed);
  const [isEditingWateringDate, setIsEditingWateringDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [comment, setComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showWaterTooltip, setShowWaterTooltip] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

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

  // Convert date to YYYY-MM-DD format for input
  const dateToInputValue = (date: Date | undefined) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Handle card clicks
  const handleClick = () => {
    // Don't change state if we're editing
    if (isEditingWateringDate || isAddingComment) return;
    
    // Cycle through expansion states: Collapsed -> Expanded -> FullyExpanded -> Collapsed
    setExpansionState((current) => (current + 1) % 3);
  };

  // Handle water button click
  const handleWaterClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    
    try {
      setIsUpdating(true);
      await onWater(plant.id);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle last watered date click
  const handleLastWateredClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    
    if (expansionState >= ExpansionState.Expanded) {
      setSelectedDate(dateToInputValue(plant.lastWatered));
      setIsEditingWateringDate(true);
    }
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  // Handle date update
  const handleDateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the card click event
    
    if (!selectedDate) {
      setIsEditingWateringDate(false);
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Update the watering date
      const newDate = new Date(selectedDate);
      await waterPlant(plant.id, newDate);
      
      // Update local state if onUpdate is provided
      if (onUpdate) {
        const nextWateringDate = new Date(newDate);
        nextWateringDate.setDate(newDate.getDate() + (plant.wateringSchedule?.frequency || 7));
        
        onUpdate(plant.id, {
          lastWatered: newDate,
          nextWateringDate,
          wateringSchedule: {
            ...plant.wateringSchedule,
            lastWatered: newDate,
            nextWateringDate,
          },
        });
      }
    } catch (error) {
      console.error('Error updating watering date:', error);
    } finally {
      setIsUpdating(false);
      setIsEditingWateringDate(false);
    }
  };

  // Handle cancel date edit
  const handleCancelDateEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setIsEditingWateringDate(false);
  };

  // Handle add comment button click
  const handleAddCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setIsAddingComment(true);
    
    // Focus the comment input after a short delay to allow the animation to complete
    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 100);
  };

  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  // Handle comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the card click event
    
    if (!comment.trim()) {
      setIsAddingComment(false);
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Combine existing notes with new comment
      const updatedNotes = plant.notes 
        ? `${plant.notes}\n\n${new Date().toLocaleDateString()}: ${comment}`
        : `${new Date().toLocaleDateString()}: ${comment}`;
      
      // Update the plant notes
      await updatePlant(plant.id, { notes: updatedNotes });
      
      // Update local state if onUpdate is provided
      if (onUpdate) {
        onUpdate(plant.id, { notes: updatedNotes });
      }
      
      // Clear the comment input
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsUpdating(false);
      setIsAddingComment(false);
    }
  };

  // Handle cancel comment
  const handleCancelComment = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setIsAddingComment(false);
    setComment('');
  };

  // Prevent propagation for form elements
  const handleFormClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
  };

  return (
    <motion.div 
      className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-4 w-full ${isUpdating ? 'opacity-70' : ''}`}
      initial={{ borderRadius: 12 }}
      animate={{ 
        minHeight: expansionState === ExpansionState.Collapsed 
          ? '100px' 
          : expansionState === ExpansionState.Expanded 
            ? '180px' 
            : 'auto',
        borderRadius: 12,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
      onClick={handleClick}
    >
      {/* Content Container - Different layout based on expansion state */}
      {expansionState !== ExpansionState.FullyExpanded ? (
        // Collapsed and Expanded views - horizontal layout
        <div className="flex h-full">
          {/* Image Section */}
          <motion.div 
            className="relative bg-gray-100"
            initial={{ width: '100px' }}
            animate={{ 
              width: expansionState === ExpansionState.Collapsed 
                ? '100px' 
                : '120px'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
            
            {/* Water button for plants that need water */}
            {needsWater && (
              <motion.button
                className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={handleWaterClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isUpdating}
                onMouseEnter={() => setShowWaterTooltip(true)}
                onMouseLeave={() => setShowWaterTooltip(false)}
                aria-label="Mark as watered"
              >
                <WaterDropIcon className="h-5 w-5 text-white" />
                
                {/* Tooltip */}
                {showWaterTooltip && (
                  <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    Mark as watered
                  </div>
                )}
              </motion.button>
            )}
          </motion.div>
          
          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col">
            {/* Basic Info */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-700">{plant.name}</h3>
                <p className="text-sm text-gray-500">{plant.species || 'Unknown species'}</p>
              </div>
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
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Last watered:</span>
                      {isEditingWateringDate ? (
                        <form onSubmit={handleDateUpdate} onClick={handleFormClick} className="mt-1">
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-full p-1 text-sm border border-gray-300 rounded"
                            max={new Date().toISOString().split('T')[0]}
                          />
                          <div className="flex gap-2 mt-1">
                            <button
                              type="submit"
                              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                              disabled={isUpdating}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelDateEdit}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              disabled={isUpdating}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={handleLastWateredClick}
                          className="font-medium text-gray-700 hover:text-blue-500 flex items-center gap-1 mt-1"
                        >
                          <span>{formatDate(plant.lastWatered)}</span>
                          <CalendarIcon className="h-3 w-3 text-gray-400" />
                        </button>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Next watering:</span>
                      <p className="font-medium text-gray-700 mt-1">{formatDate(plant.nextWateringDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Health:</span>
                      <p className="font-medium text-gray-700 mt-1">{plant.health || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Watering frequency:</span>
                      <p className="font-medium text-gray-700 mt-1">
                        {plant.wateringSchedule?.frequency 
                          ? `Every ${plant.wateringSchedule.frequency} days` 
                          : 'Not set'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        // Fully Expanded view - vertical layout with full-width image
        <div className="flex flex-col">
          {/* Full-width image */}
          <div className="relative w-full h-48 md:h-64 bg-gray-100">
            {plant.image ? (
              <Image 
                src={plant.image} 
                alt={plant.name} 
                fill 
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Water button for plants that need water */}
            {needsWater && (
              <motion.button
                className="absolute top-4 right-4 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={handleWaterClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isUpdating}
                onMouseEnter={() => setShowWaterTooltip(true)}
                onMouseLeave={() => setShowWaterTooltip(false)}
                aria-label="Mark as watered"
              >
                <WaterDropIcon className="h-6 w-6 text-white" />
                
                {/* Tooltip */}
                {showWaterTooltip && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    Mark as watered
                  </div>
                )}
              </motion.button>
            )}
          </div>
          
          {/* Content Section */}
          <div className="p-5">
            {/* Header with name */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{plant.name}</h2>
              <p className="text-sm text-gray-500">{plant.species || 'Unknown species'}</p>
            </div>
            
            {/* Personality Quote - Prominent display */}
            {plant.bio && (
              <motion.div 
                className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-green-800 italic relative">
                  <span className="text-3xl absolute -top-2 -left-2 text-green-300">"</span>
                  <span className="ml-3">{plant.bio}</span>
                  <span className="text-3xl absolute -bottom-5 -right-2 text-green-300">"</span>
                </p>
                {plant.personalityType && (
                  <div className="mt-2 flex justify-end">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {plant.personalityType.charAt(0).toUpperCase() + plant.personalityType.slice(1)}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Basic Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <p className="text-gray-800">{plant.location || 'Not specified'}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Health</h3>
                <p className="text-gray-800">{plant.health || 'Unknown'}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Last Watered</h3>
                {isEditingWateringDate ? (
                  <form onSubmit={handleDateUpdate} onClick={handleFormClick} className="mt-1">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="w-full p-1 text-sm border border-gray-300 rounded"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="submit"
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        disabled={isUpdating}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelDateEdit}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        disabled={isUpdating}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={handleLastWateredClick}
                    className="text-gray-800 hover:text-blue-500 flex items-center gap-1"
                  >
                    <span>{formatDate(plant.lastWatered)}</span>
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Next Watering</h3>
                <p className="text-gray-800">{formatDate(plant.nextWateringDate)}</p>
              </div>
            </div>
            
            {/* Watering Schedule */}
            {plant.wateringSchedule && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Watering Schedule</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <WaterDropIcon className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 font-medium">Every {plant.wateringSchedule.frequency} days</p>
                      {plant.wateringSchedule.description && (
                        <p className="text-blue-600 text-sm mt-1">{plant.wateringSchedule.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Care Instructions */}
            {plant.careInstructions && Object.keys(plant.careInstructions).length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Care Instructions</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    {plant.careInstructions.light && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Light</h4>
                        <p className="text-sm text-gray-600">{plant.careInstructions.light}</p>
                      </div>
                    )}
                    
                    {plant.careInstructions.soil && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Soil</h4>
                        <p className="text-sm text-gray-600">{plant.careInstructions.soil}</p>
                      </div>
                    )}
                    
                    {plant.careInstructions.humidity && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Humidity</h4>
                        <p className="text-sm text-gray-600">{plant.careInstructions.humidity}</p>
                      </div>
                    )}
                    
                    {plant.careInstructions.temperature && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Temperature</h4>
                        <p className="text-sm text-gray-600">{plant.careInstructions.temperature}</p>
                      </div>
                    )}
                    
                    {plant.careInstructions.fertilizer && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Fertilizer</h4>
                        <p className="text-sm text-gray-600">{plant.careInstructions.fertilizer}</p>
                      </div>
                    )}
                    
                    {plant.careInstructions.pruning && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Pruning</h4>
                        <p className="text-sm text-gray-600">{plant.careInstructions.pruning}</p>
                      </div>
                    )}
                    
                    {plant.careInstructions.repotting && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Repotting</h4>
                        <p className="text-sm text-gray-600">{plant.careInstructions.repotting}</p>
                      </div>
                    )}
                    
                    {plant.careInstructions.commonIssues && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Common Issues</h4>
                        <p className="text-sm text-gray-600">{plant.careInstructions.commonIssues}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Notes and Comments */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-medium text-gray-700">Notes & Comments</h3>
                {!isAddingComment && (
                  <button
                    onClick={handleAddCommentClick}
                    className="text-sm text-green-600 hover:text-green-700"
                    disabled={isUpdating}
                  >
                    + Add Comment
                  </button>
                )}
              </div>
              
              {isAddingComment ? (
                <form onSubmit={handleCommentSubmit} onClick={handleFormClick} className="mb-4">
                  <textarea
                    ref={commentInputRef}
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder="Add your comment here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleCancelComment}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      disabled={isUpdating || !comment.trim()}
                    >
                      Save Comment
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {plant.notes ? (
                    <p className="text-sm text-gray-600 whitespace-pre-line">{plant.notes}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No notes or comments yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 