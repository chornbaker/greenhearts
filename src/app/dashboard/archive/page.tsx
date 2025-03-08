'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants, unarchivePlant, deletePlant } from '@/services/plants';
import { Plant } from '@/types';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function Archive() {
  const { user } = useAuth();
  const [archivedPlants, setArchivedPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnarchiveDialog, setShowUnarchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchArchivedPlants();
    }
  }, [user]);

  const fetchArchivedPlants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all plants including archived ones
      const plants = await getUserPlants(user!.uid, true);
      
      // Filter to only show archived plants
      const archived = plants.filter(plant => plant.archived);
      
      // Sort by archive date, most recent first
      archived.sort((a, b) => {
        if (!a.archivedAt) return 1;
        if (!b.archivedAt) return -1;
        return b.archivedAt.getTime() - a.archivedAt.getTime();
      });
      
      setArchivedPlants(archived);
    } catch (error) {
      console.error('Error fetching archived plants:', error);
      setError('Failed to load archived plants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="container mx-auto px-4 py-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archivedPlants.map((plant) => (
            <div key={plant.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex">
                {/* Plant image */}
                <div className="w-24 h-24 bg-gray-100 relative">
                  {plant.image ? (
                    <Image 
                      src={plant.image} 
                      alt={plant.name} 
                      fill 
                      sizes="96px"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Plant info */}
                <div className="flex-1 p-4">
                  <h2 className="text-lg font-medium text-gray-800">{plant.name}</h2>
                  <p className="text-sm text-gray-500">{plant.species || 'Unknown species'}</p>
                  
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Archived:</span> {formatDate(plant.archivedAt)}
                    </p>
                    {plant.archivedReason && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Reason:</span> {plant.archivedReason}
                      </p>
                    )}
                    {plant.location && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Location:</span> {plant.location}
                      </p>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleUnarchiveClick(plant)}
                      className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteClick(plant)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add padding at the bottom to ensure content is not hidden behind the menu bar */}
      <div className="h-24"></div>
      
      {/* Unarchive Confirmation Dialog */}
      <Transition appear show={showUnarchiveDialog} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowUnarchiveDialog(false)}>
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
        <Dialog as="div" className="relative z-10" onClose={() => setShowDeleteDialog(false)}>
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