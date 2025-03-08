'use client';

import { useState } from 'react';
import Image from 'next/image';
import { animate, motion, AnimatePresence } from 'framer-motion';
import { Plant } from '@/types';

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
};

enum ExpansionState {
  Collapsed = 0,
  Expanded = 1,
  FullyExpanded = 2,
}

export default function ExpandableCard({ plant, onWater }: ExpandableCardProps) {
  const [expansionState, setExpansionState] = useState<ExpansionState>(ExpansionState.Collapsed);

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
    // Cycle through expansion states: Collapsed -> Expanded -> FullyExpanded -> Collapsed
    setExpansionState((current) => (current + 1) % 3);
  };

  // Handle water button click
  const handleWaterClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    onWater(plant.id);
  };

  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-4 w-full"
      initial={{ borderRadius: 12 }}
      animate={{ 
        minHeight: expansionState === ExpansionState.Collapsed 
          ? '100px' 
          : expansionState === ExpansionState.Expanded 
            ? '180px' 
            : '320px',
        borderRadius: 12,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
      onClick={handleClick}
    >
      {/* Content Container */}
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
        <div className="flex-1 p-4 flex flex-col">
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
          
          {/* Fully Expanded Content */}
          <AnimatePresence>
            {expansionState === ExpansionState.FullyExpanded && (
              <motion.div 
                className="mt-4 pt-4 border-t border-gray-100"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Personality */}
                {plant.personalityType && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Personality</h4>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                        {plant.personalityType.charAt(0).toUpperCase() + plant.personalityType.slice(1)}
                      </span>
                      {plant.bio && <span className="text-sm text-gray-600 italic">{plant.bio}</span>}
                    </div>
                  </div>
                )}
                
                {/* Care Instructions */}
                {plant.careInstructions && Object.keys(plant.careInstructions).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Care Tips</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      {plant.careInstructions.light && (
                        <p>
                          <span className="font-medium">Light:</span> {plant.careInstructions.light}
                        </p>
                      )}
                      {plant.wateringSchedule?.description && (
                        <p>
                          <span className="font-medium">Watering:</span> {plant.wateringSchedule.description}
                        </p>
                      )}
                      {plant.careInstructions.humidity && (
                        <p>
                          <span className="font-medium">Humidity:</span> {plant.careInstructions.humidity}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                {plant.notes && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{plant.notes}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
} 