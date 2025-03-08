'use client';

import { useState, useRef, useEffect, Fragment } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plant, PlantHealth } from '@/types';
import { updatePlant, waterPlant, archivePlant, deletePlant } from '@/services/plants';
import AutocompleteInput from '@/components/AutocompleteInput';
import { getDaysOverdue, isDueToday, getWateringStatusText } from '@/utils/dateUtils';
import { Dialog, Transition } from '@headlessui/react';

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

// Water droplet icon component
const WaterDropIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <div 
    className={className}
    style={{ 
      display: 'inline-flex',
      alignItems: 'center', 
      justifyContent: 'center',
      lineHeight: 1
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%', display: 'block' }}>
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
  onArchive?: (plantId: string) => void;
  onDelete?: (plantId: string) => void;
  organizationView: 'location' | 'alphabetical' | 'wateringPriority' | 'health';
};

enum ExpansionState {
  Collapsed = 0,
  Expanded = 1,
  FullyExpanded = 2,
}

// Get location options based on current location
const getLocationOptions = (currentLocation: string) => {
  // Check if current location is in outdoor locations
  if (OUTDOOR_LOCATIONS.includes(currentLocation)) {
    return OUTDOOR_LOCATIONS;
  }
  // Default to indoor locations
  return INDOOR_LOCATIONS;
};

export default function ExpandableCard({ 
  plant, 
  onWater, 
  onUpdate, 
  onArchive, 
  onDelete, 
  organizationView 
}: ExpandableCardProps) {
  const [expansionState, setExpansionState] = useState<ExpansionState>(ExpansionState.Collapsed);
  const [isEditingWateringDate, setIsEditingWateringDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [comment, setComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showWaterTooltip, setShowWaterTooltip] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [editedLocation, setEditedLocation] = useState(plant.location || '');
  const [editedHealth, setEditedHealth] = useState<PlantHealth | undefined>(plant.health);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

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

  // Get the third line content based on organization view
  const getThirdLineContent = () => {
    switch (organizationView) {
      case 'location':
      case 'alphabetical':
        // Show health and days to next watering
        return (
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs text-gray-500">
                {plant.health ? plant.health.charAt(0).toUpperCase() + plant.health.slice(1).toLowerCase() : 'No health data'}
              </span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.5c-1.7 2.3-6 7.6-6 11.5 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.9-4.3-9.2-6-11.5z" />
              </svg>
              <span className={`text-xs ${getDaysOverdue(plant) > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {getWateringStatusText(plant)}
              </span>
            </div>
          </div>
        );
        
      case 'wateringPriority':
        // Show health and location
        return (
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs text-gray-500">
                {plant.health ? plant.health.charAt(0).toUpperCase() + plant.health.slice(1).toLowerCase() : 'No health data'}
              </span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-gray-500">
                {plant.location || 'No location set'}
              </span>
            </div>
          </div>
        );
        
      case 'health':
        // Show location and days to next watering
        return (
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-gray-500">
                {plant.location || 'No location set'}
              </span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={`text-xs ${getDaysOverdue(plant) > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {getWateringStatusText(plant)}
              </span>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Effect to handle clicks outside the card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        // Don't collapse if we're editing
        if (isEditingWateringDate || isAddingComment || isEditingLocation || isEditingHealth) {
          return;
        }
        
        // Collapse the card if it's expanded
        if (expansionState !== ExpansionState.Collapsed) {
          setExpansionState(ExpansionState.Collapsed);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expansionState, isEditingWateringDate, isAddingComment, isEditingLocation, isEditingHealth]);

  // Effect to focus input when editing location
  useEffect(() => {
    if (isEditingLocation && locationInputRef.current) {
      locationInputRef.current.focus();
    }
  }, [isEditingLocation]);

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

  // Handle location click
  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setIsEditingLocation(true);
  };

  // Handle location change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedLocation(e.target.value);
  };

  // Handle location update
  const handleLocationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onUpdate) return;
    
    try {
      setIsUpdating(true);
      await onUpdate(plant.id, { location: editedLocation });
    } finally {
      setIsUpdating(false);
      setIsEditingLocation(false);
    }
  };

  // Handle cancel location edit
  const handleCancelLocationEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLocation(false);
    setEditedLocation(plant.location || '');
  };

  // Handle health click
  const handleHealthClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setIsEditingHealth(true);
  };

  // Handle health change
  const handleHealthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedHealth(e.target.value as PlantHealth);
  };

  // Handle health update
  const handleHealthUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onUpdate) return;
    
    try {
      setIsUpdating(true);
      await onUpdate(plant.id, { health: editedHealth });
    } finally {
      setIsUpdating(false);
      setIsEditingHealth(false);
    }
  };

  // Handle cancel health edit
  const handleCancelHealthEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingHealth(false);
    setEditedHealth(plant.health);
  };

  // Handle archive button click
  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setShowArchiveDialog(true);
  };

  // Handle archive confirm
  const handleArchiveConfirm = async () => {
    try {
      setIsArchiving(true);
      
      await archivePlant(plant.id, archiveReason);
      
      // Call onArchive callback if provided
      if (onArchive) {
        onArchive(plant.id);
      }
      
      setShowArchiveDialog(false);
      setArchiveReason('');
    } catch (error) {
      console.error('Error archiving plant:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    setShowDeleteDialog(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      
      await deletePlant(plant.id);
      
      // Call onDelete callback if provided
      if (onDelete) {
        onDelete(plant.id);
      }
      
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting plant:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div 
        ref={cardRef}
        className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-4 w-full relative ${
          isUpdating ? 'opacity-70' : ''
        }`}
        initial={{ borderRadius: 12 }}
        animate={{ 
          minHeight: expansionState === ExpansionState.Collapsed 
            ? '100px' 
            : expansionState === ExpansionState.Expanded 
              ? '180px' 
              : 'auto',
          borderRadius: 12,
          zIndex: expansionState === ExpansionState.FullyExpanded ? 5 : 1,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
        onClick={handleClick}
      >
        {/* Trash icon - only show in fully expanded view */}
        {expansionState === ExpansionState.FullyExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card expansion
              handleArchiveClick(e);
            }}
            className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600 z-10"
            aria-label="Archive or delete plant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
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
            </motion.div>
            
            {/* Content Section */}
            <div className="flex-1 p-4 flex flex-col">
              {/* Basic Info */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{plant.name}</h2>
                  <p className="text-sm text-gray-500">{plant.species || 'Unknown species'}</p>
                </div>
                
                {/* Water button for plants that need water - moved here */}
                {needsWater && (
                  <motion.button
                    className="w-10 h-10 bg-blue-500 rounded-full inline-flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={handleWaterClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isUpdating}
                    onMouseEnter={() => setShowWaterTooltip(true)}
                    onMouseLeave={() => setShowWaterTooltip(false)}
                    aria-label="Mark as watered"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      lineHeight: 1
                    }}
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
              
              {/* Third line content based on organization view */}
              {getThirdLineContent()}
              
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
                        <div 
                          className={`font-medium ${
                            plant.nextWateringDate && plant.nextWateringDate <= new Date() 
                              ? 'text-red-500' 
                              : 'text-gray-700'
                          }`}
                        >
                          {plant.nextWateringDate 
                            ? formatDate(plant.nextWateringDate)
                            : 'Not scheduled'
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Health:</span>
                        {isEditingHealth ? (
                          <form onSubmit={handleHealthUpdate} onClick={handleFormClick} className="mt-1">
                            <select
                              value={editedHealth}
                              onChange={handleHealthChange}
                              className="w-full p-1 text-sm border border-gray-300 rounded"
                            >
                              <option value={PlantHealth.Excellent}>Excellent</option>
                              <option value={PlantHealth.Good}>Good</option>
                              <option value={PlantHealth.Fair}>Fair</option>
                              <option value={PlantHealth.Poor}>Poor</option>
                            </select>
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
                                onClick={handleCancelHealthEdit}
                                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                disabled={isUpdating}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={handleHealthClick}
                            className="font-medium text-gray-700 hover:text-blue-500 mt-1 block"
                          >
                            {plant.health ? plant.health.charAt(0).toUpperCase() + plant.health.slice(1).toLowerCase() : 'Unknown'}
                          </button>
                        )}
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
            </div>
            
            {/* Content Section */}
            <div className="p-5">
              {/* Header with name and water button */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{plant.name}</h2>
                  <p className="text-sm text-gray-500">{plant.species || 'Unknown species'}</p>
                </div>
                
                {/* Water button for plants that need water - moved here */}
                {needsWater && (
                  <motion.button
                    className="w-10 h-10 bg-blue-500 rounded-full inline-flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={handleWaterClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isUpdating}
                    onMouseEnter={() => setShowWaterTooltip(true)}
                    onMouseLeave={() => setShowWaterTooltip(false)}
                    aria-label="Mark as watered"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      lineHeight: 1
                    }}
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
                  {isEditingLocation ? (
                    <form onSubmit={handleLocationUpdate} onClick={handleFormClick} className="mt-1">
                      <AutocompleteInput
                        value={editedLocation}
                        onChange={setEditedLocation}
                        options={getLocationOptions(plant.location || '')}
                        placeholder="Enter or select a room/space"
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
                          onClick={handleCancelLocationEdit}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={handleLocationClick}
                      className="text-gray-800 hover:text-blue-500"
                    >
                      {plant.location || 'No location assigned'}
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Health</h3>
                  {isEditingHealth ? (
                    <form onSubmit={handleHealthUpdate} onClick={handleFormClick} className="mt-1">
                      <select
                        value={editedHealth}
                        onChange={handleHealthChange}
                        className="w-full p-2 text-sm border border-gray-300 rounded"
                      >
                        <option value={PlantHealth.Excellent}>Excellent</option>
                        <option value={PlantHealth.Good}>Good</option>
                        <option value={PlantHealth.Fair}>Fair</option>
                        <option value={PlantHealth.Poor}>Poor</option>
                      </select>
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
                          onClick={handleCancelHealthEdit}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={handleHealthClick}
                      className="text-gray-800 hover:text-blue-500"
                    >
                      {plant.health ? plant.health.charAt(0).toUpperCase() + plant.health.slice(1).toLowerCase() : 'Unknown'}
                    </button>
                  )}
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
                  <div 
                    className={`font-medium ${
                      plant.nextWateringDate && plant.nextWateringDate <= new Date() 
                        ? 'text-red-500' 
                        : 'text-gray-700'
                    }`}
                  >
                    {plant.nextWateringDate 
                      ? formatDate(plant.nextWateringDate)
                      : 'Not scheduled'
                    }
                  </div>
                </div>
              </div>
              
              {/* Watering Schedule */}
              {plant.wateringSchedule && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 mb-2">Watering Schedule</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <WaterDropIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
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
                      <div className="text-sm text-gray-600 whitespace-pre-line">
                        {/* Add plant creation date as first comment if it doesn't already exist */}
                        {!plant.notes.includes("Added on:") && (
                          <p className="mb-2 text-gray-500 italic">
                            Added on: {formatDate(plant.createdAt)}
                          </p>
                        )}
                        {plant.notes}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 whitespace-pre-line">
                        <p className="mb-2 text-gray-500 italic">
                          Added on: {formatDate(plant.createdAt)}
                        </p>
                        <p className="text-gray-400 italic">No additional notes or comments yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Archive/Delete Options Dialog */}
      <Transition appear show={showArchiveDialog} as={Fragment}>
        <Dialog as="div" className="relative z-100" onClose={() => setShowArchiveDialog(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Manage {plant.name}
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-medium text-amber-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Archive Plant
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Archiving will remove this plant from your active collection but keep its history. You can restore it later.
                      </p>
                      
                      <div className="mt-3">
                        <label htmlFor="archiveReason" className="block text-sm font-medium text-gray-700">
                          Reason for archiving
                        </label>
                        <select
                          id="archiveReason"
                          value={archiveReason}
                          onChange={(e) => setArchiveReason(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        >
                          <option value="">Select a reason...</option>
                          <option value="Died">Plant died</option>
                          <option value="Given away">Given away</option>
                          <option value="Sold">Sold</option>
                          <option value="Lost">Lost</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                        onClick={handleArchiveConfirm}
                        disabled={isArchiving || !archiveReason}
                      >
                        {isArchiving ? 'Archiving...' : 'Archive Plant'}
                      </button>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete Permanently
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        This action cannot be undone. This will permanently delete {plant.name} and all of its data from your account.
                      </p>
                      
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        onClick={() => {
                          setShowArchiveDialog(false);
                          setShowDeleteDialog(true);
                        }}
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setShowArchiveDialog(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Dialog */}
      <Transition appear show={showDeleteDialog} as={Fragment}>
        <Dialog as="div" className="relative z-100" onClose={() => setShowDeleteDialog(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Delete {plant.name} Permanently
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you absolutely sure? This action cannot be undone. This will permanently delete {plant.name} and all of its data from your account.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Consider archiving the plant instead if you want to keep its history.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
} 