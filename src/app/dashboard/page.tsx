'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants } from '@/services/plants';
import { Plant } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gardenName, setGardenName] = useState('My Garden');

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
      lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      nextWateringDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      id: '2',
      name: 'Snake Plant',
      image: '/images/plants-header.jpg',
      lastWatered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      nextWateringDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    },
    {
      id: '3',
      name: 'Fiddle Leaf Fig',
      image: '/images/plants-header.jpg',
      lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      nextWateringDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (needs water)
    },
  ];

  // Use demo plants for now
  const displayPlants = demoPlants;
  
  // Plants that need watering (past due)
  const plantsNeedingWater = displayPlants.filter((plant) => {
    if (!plant.nextWateringDate) return false;
    const today = new Date();
    return plant.nextWateringDate <= today;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-800">{gardenName}</h1>
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
        <>
          {/* Plants needing water */}
          {plantsNeedingWater.length > 0 && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <h2 className="text-lg font-semibold text-amber-800 mb-3">Plants Needing Water</h2>
              <div className="space-y-3">
                {plantsNeedingWater.map((plant) => (
                  <div key={plant.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full overflow-hidden relative">
                      {plant.image && (
                        <Image 
                          src={plant.image} 
                          alt={plant.name} 
                          fill 
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{plant.name}</p>
                      <p className="text-xs text-red-600">
                        Watering overdue
                      </p>
                    </div>
                    <button className="bg-green-600 text-white text-xs py-1 px-3 rounded-full">
                      Water
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plant collection */}
          <div>
            <h2 className="text-lg font-semibold text-green-800 mb-3">My Plants</h2>
            <div className="grid grid-cols-3 gap-3">
              {displayPlants.map((plant) => (
                <Link 
                  key={plant.id} 
                  href={`/dashboard/plants/${plant.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="h-24 relative">
                    {plant.image && (
                      <Image 
                        src={plant.image} 
                        alt={plant.name} 
                        fill 
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-xs font-medium text-gray-800 truncate">{plant.name}</p>
                  </div>
                </Link>
              ))}
              <Link 
                href="/dashboard/add"
                className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm flex flex-col items-center justify-center h-full aspect-square"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600">Add Plant</p>
              </Link>
            </div>
          </div>

          {/* Upcoming waterings */}
          <div>
            <h2 className="text-lg font-semibold text-green-800 mb-3">Upcoming Waterings</h2>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              {displayPlants
                .filter(p => p.nextWateringDate && p.nextWateringDate > new Date())
                .sort((a, b) => a.nextWateringDate!.getTime() - b.nextWateringDate!.getTime())
                .slice(0, 3)
                .map((plant) => (
                  <div key={plant.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full overflow-hidden relative">
                      {plant.image && (
                        <Image 
                          src={plant.image} 
                          alt={plant.name} 
                          fill 
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{plant.name}</p>
                      <p className="text-xs text-gray-500">
                        {plant.nextWateringDate?.toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 