'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants, unarchivePlant, deletePlant } from '@/services/plants';
import { Plant } from '@/types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { motion } from 'framer-motion';

export default function Archive() {
  const { user } = useAuth();
  const [archivedPlants, setArchivedPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnarchiveDialog, setShowUnarchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchArchivedPlants = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const plants = await getUserPlants(user.uid, true);
      setArchivedPlants(plants);
    } catch (error) {
      console.error('Error fetching archived plants:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch archived plants when component mounts
  useEffect(() => {
    if (user) {
      fetchArchivedPlants();
    }
  }, [user, fetchArchivedPlants]);

  const handleUnarchiveClick = (plant: Plant) => {
    setSelectedPlant(plant);
    setShowUnarchiveDialog(true);
  };

  const handleDeleteClick = (plant: Plant) => {
    setSelectedPlant(plant);
    setShowDeleteDialog(true);
  };

  const handleUnarchiveConfirm = async () => {
    if (!selectedPlant) return;
    
    try {
      setIsProcessing(true);
      await unarchivePlant(selectedPlant.id);
      
      // Update local state
      setArchivedPlants(archivedPlants.filter(p => p.id !== selectedPlant.id));
      setShowUnarchiveDialog(false);
    } catch (error) {
      console.error('Error unarchiving plant:', error);
      setError('Failed to unarchive plant. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlant) return;
    
    try {
      setIsProcessing(true);
      await deletePlant(selectedPlant.id);
      
      // Update local state
      setArchivedPlants(archivedPlants.filter(p => p.id !== selectedPlant.id));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting plant:', error);
      setError('Failed to delete plant. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format date nicely
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Plant Archive</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : archivedPlants.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-gray-700 mb-2">No Archived Plants</h2>
          <p className="text-gray-500">
            When you archive plants, they will appear here. Archiving allows you to keep a record of plants that are no longer in your collection.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {archivedPlants.map((plant) => (
            <motion.div 
              key={plant.id} 
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-4 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex h-full">
                {/* Image Section */}
                <div className="relative bg-gray-100 w-[100px]">
                  {plant.image ? (
                    <Image 
                      src={plant.image} 
                      alt={plant.name} 
                      fill 
                      sizes="100px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col">
                  {/* Basic Info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{plant.name}</h2>
                      <p className="text-sm text-gray-500">{plant.species || 'Unknown species'}</p>
                    </div>
                    
                    {/* Archive badge */}
                    <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                        <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Archived
                    </div>
                  </div>
                  
                  {/* Archive info */}
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500">
                        {formatDate(plant.archivedAt)}
                      </span>
                    </div>
                    {plant.archivedReason && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-gray-500">
                          {plant.archivedReason}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Location info if available */}
                  {plant.location && (
                    <div className="flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs text-gray-500">
                        {plant.location}
                      </span>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="mt-3 flex gap-2 justify-end">
                    <button
                      onClick={() => handleUnarchiveClick(plant)}
                      className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteClick(plant)}
                      className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Unarchive Confirmation Dialog */}
      <Transition appear show={showUnarchiveDialog} as={Fragment}>
        <Dialog as="div" className="relative z-100" onClose={() => setShowUnarchiveDialog(false)}>
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
                    Restore {selectedPlant?.name}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      This will restore {selectedPlant?.name} to your active plants collection. The plant will appear in your dashboard again.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setShowUnarchiveDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      onClick={handleUnarchiveConfirm}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Restoring...' : 'Restore Plant'}
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
                    Delete {selectedPlant?.name} Permanently
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      This action cannot be undone. This will permanently delete {selectedPlant?.name} and all of its data from your account.
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
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
} 