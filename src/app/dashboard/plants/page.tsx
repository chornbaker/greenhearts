'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants } from '@/services/plants';
import { Plant } from '@/types';

export default function Plants() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlants = async () => {
      if (!user) return;
      
      try {
        const userPlants = await getUserPlants(user.uid);
        setPlants(userPlants);
      } catch (error) {
        console.error('Error fetching plants:', error);
        setError('Failed to load your plants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [user]);

  // Placeholder plants for demo
  const demoPlants = [
    {
      id: '1',
      name: 'Monstera Deliciosa',
      image: '/images/plants-header.jpg',
      species: 'Monstera',
      lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      nextWateringDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      id: '2',
      name: 'Snake Plant',
      image: '/images/plants-header.jpg',
      species: 'Sansevieria',
      lastWatered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      nextWateringDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    },
    {
      id: '3',
      name: 'Fiddle Leaf Fig',
      image: '/images/plants-header.jpg',
      species: 'Ficus lyrata',
      lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      nextWateringDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (needs water)
    },
    {
      id: '4',
      name: 'Peace Lily',
      image: '/images/plants-header.jpg',
      species: 'Spathiphyllum',
      lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      nextWateringDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    },
    {
      id: '5',
      name: 'Aloe Vera',
      image: '/images/plants-header.jpg',
      species: 'Aloe',
      lastWatered: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      nextWateringDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  ];

  // Use demo plants for now
  const displayPlants = demoPlants;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-800">My Plants</h1>
        <Link
          href="/dashboard/add"
          className="bg-green-600 text-white text-sm py-1 px-3 rounded-full"
        >
          Add Plant
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading your plants...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayPlants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">You haven't added any plants yet.</p>
              <Link
                href="/dashboard/add"
                className="text-green-600 hover:underline mt-2 inline-block"
              >
                Add your first plant
              </Link>
            </div>
          ) : (
            displayPlants.map((plant) => (
              <Link
                key={plant.id}
                href={`/dashboard/plants/${plant.id}`}
                className="block bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="flex items-center p-3">
                  <div className="w-16 h-16 bg-green-100 rounded-xl overflow-hidden relative mr-4">
                    {plant.image && (
                      <Image 
                        src={plant.image} 
                        alt={plant.name} 
                        fill 
                        sizes="(max-width: 768px) 33vw, 64px"
                        priority={displayPlants.indexOf(plant) === 0}
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{plant.name}</h3>
                    <p className="text-xs text-gray-500">{plant.species}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="text-xs">
                          {plant.lastWatered?.toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className={`text-xs ${new Date() > plant.nextWateringDate! ? 'text-red-500' : 'text-gray-500'}`}>
                          {new Date() > plant.nextWateringDate! 
                            ? 'Watering overdue' 
                            : `Next: ${plant.nextWateringDate?.toLocaleDateString(undefined, { 
                                month: 'short', 
                                day: 'numeric' 
                              })}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
} 