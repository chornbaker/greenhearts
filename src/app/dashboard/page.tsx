'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants, waterPlant } from '@/services/plants';
import { getUserProfile } from '@/services/user';
import { Plant } from '@/types';
import ExpandableCard from '@/components/dashboard/ExpandableCard';

// Organization view types
type OrganizationView = 'location' | 'alphabetical' | 'wateringPriority';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plantHavenName, setPlantHavenName] = useState('My Plant Haven');
  const [displayName, setDisplayName] = useState('');
  const [organizationView, setOrganizationView] = useState<OrganizationView>('location');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          if (userProfile.plantHavenName) {
            setPlantHavenName(userProfile.plantHavenName);
          }
          if (userProfile.displayName) {
            setDisplayName(userProfile.displayName);
          }
        }

        // Fetch plants from Firebase
        const userPlants = await getUserPlants(user.uid);
        setPlants(userPlants);
        
        // Redirect to Add Plant page if no plants
        if (userPlants.length === 0 && !loading) {
          router.push('/dashboard/add');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your plants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, loading, router]);

  // Redirect to Add Plant page if no plants and not loading
  useEffect(() => {
    if (!loading && plants.length === 0 && user) {
      router.push('/dashboard/add');
    }
  }, [plants, loading, router, user]);

  // Plants that need watering (past due)
  const plantsNeedingWater = plants.filter((plant) => {
    if (!plant.nextWateringDate) return false;
    const today = new Date();
    return plant.nextWateringDate <= today;
  });

  // Handle watering a plant
  const handleWaterPlant = async (plantId: string) => {
    if (!user) return;
    
    try {
      // Call the actual waterPlant service
      await waterPlant(plantId);
      
      // Update the local state to reflect the watering
      const updatedPlants = plants.map(plant => {
        if (plant.id === plantId) {
          const today = new Date();
          const nextWateringDate = new Date(today);
          nextWateringDate.setDate(today.getDate() + (plant.wateringSchedule?.frequency || 7));
          
          return {
            ...plant,
            lastWatered: today,
            nextWateringDate
          };
        }
        return plant;
      });
      
      setPlants(updatedPlants);
    } catch (error) {
      console.error('Error watering plant:', error);
    }
  };

  // Handle updating a plant
  const handleUpdatePlant = async (plantId: string, updates: Partial<Plant>) => {
    if (!user) return;
    
    try {
      // Update the local state to reflect the changes
      const updatedPlants = plants.map(plant => {
        if (plant.id === plantId) {
          return {
            ...plant,
            ...updates
          };
        }
        return plant;
      });
      
      setPlants(updatedPlants);
    } catch (error) {
      console.error('Error updating plant:', error);
    }
  };

  // Get plants organized by the selected view
  const getOrganizedPlants = () => {
    switch (organizationView) {
      case 'location':
        // Group by location
        const locationGroups: { [key: string]: Plant[] } = {};
        plants.forEach((plant) => {
          const location = plant.location || 'Unassigned';
          if (!locationGroups[location]) {
            locationGroups[location] = [];
          }
          locationGroups[location].push(plant);
        });
        
        // Sort locations alphabetically
        return Object.entries(locationGroups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([location, plants]) => ({
            title: location,
            plants: plants.sort((a, b) => a.name.localeCompare(b.name))
          }));
        
      case 'alphabetical':
        // Just one group with all plants sorted alphabetically
        return [{
          title: 'All Plants',
          plants: [...plants].sort((a, b) => a.name.localeCompare(b.name))
        }];
        
      case 'wateringPriority':
        // Sort by watering date
        return [{
          title: 'Watering Priority',
          plants: [...plants].sort((a, b) => {
            // Plants without watering dates go last
            if (!a.nextWateringDate) return 1;
            if (!b.nextWateringDate) return -1;
            return a.nextWateringDate.getTime() - b.nextWateringDate.getTime();
          })
        }];
        
      default:
        return [];
    }
  };
  
  // If loading or no plants, show loading state or redirect
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-800">{plantHavenName}</h1>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-500">Loading your plants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-800">{plantHavenName}</h1>
        </div>

        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-800">{plantHavenName}</h1>
        
        {displayName && (
          <div className="text-sm text-gray-600">
            Welcome, {displayName}
          </div>
        )}
      </div>
      
      {/* Plants needing water */}
      {plantsNeedingWater.length > 0 && (
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 mb-6">
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
                      sizes="(max-width: 768px) 33vw, 96px"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{plant.name}</p>
                  <p className="text-xs text-red-600">
                    Last watered: {plant.lastWatered?.toLocaleDateString()}
                  </p>
                </div>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded-lg flex items-center gap-1"
                  onClick={(e) => {
                    e.preventDefault();
                    handleWaterPlant(plant.id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.5c-1.7 2.3-6 7.6-6 11.5 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.9-4.3-9.2-6-11.5z" />
                  </svg>
                  <span>Water</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Organization view selector */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Your Plants</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setOrganizationView('location')}
            className={`text-xs px-2 py-1 rounded ${
              organizationView === 'location' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Location
          </button>
          <button 
            onClick={() => setOrganizationView('alphabetical')}
            className={`text-xs px-2 py-1 rounded ${
              organizationView === 'alphabetical' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            A-Z
          </button>
          <button 
            onClick={() => setOrganizationView('wateringPriority')}
            className={`text-xs px-2 py-1 rounded ${
              organizationView === 'wateringPriority' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Watering
          </button>
        </div>
      </div>
      
      {/* Plant groups with expandable cards */}
      <div className="space-y-8">
        {getOrganizedPlants().map((group) => (
          <div key={group.title}>
            <h3 className="text-md font-medium text-gray-700 mb-3">{group.title}</h3>
            <div className="space-y-3">
              {group.plants.map((plant, index) => (
                <ExpandableCard 
                  key={plant.id || index}
                  plant={plant} 
                  onWater={handleWaterPlant}
                  onUpdate={handleUpdatePlant}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add a plant button */}
      <div className="mt-8 mb-4">
        <Link 
          href="/dashboard/add" 
          className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl text-center font-medium shadow-sm transition-colors"
        >
          Add a Plant
        </Link>
      </div>

      {/* Upcoming watering schedule */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 mt-8">
        <h3 className="text-md font-medium text-gray-700 mb-3">Upcoming Watering</h3>
        <div className="space-y-1">
          {plants
            .filter(plant => plant.nextWateringDate && plant.nextWateringDate > new Date())
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
                      sizes="(max-width: 768px) 33vw, 96px"
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
            ))
          }
        </div>
      </div>
    </div>
  );
} 