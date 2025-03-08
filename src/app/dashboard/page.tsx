'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants } from '@/services/plants';
import { getUserProfile } from '@/services/user';
import { Plant } from '@/types';

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

  const renderPlantCard = (plant: Plant, index: number) => (
    <Link 
      href={`/dashboard/plant/${plant.id}`} 
      key={plant.id} 
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="aspect-square bg-gray-100 relative">
        {plant.image ? (
          <Image 
            src={plant.image} 
            alt={plant.name} 
            fill 
            sizes="(max-width: 768px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">{plant.name}</h3>
        {plant.species && (
          <p className="text-sm text-gray-500 truncate">{plant.species}</p>
        )}
        {plant.nextWateringDate && (
          <p className={`text-xs mt-2 ${
            plant.nextWateringDate < new Date() 
              ? 'text-red-600 font-medium' 
              : 'text-gray-500'
          }`}>
            {plant.nextWateringDate < new Date() 
              ? 'Needs water now!' 
              : `Water in ${Math.ceil((plant.nextWateringDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`}
          </p>
        )}
      </div>
    </Link>
  );

  // If loading or no plants, show loading state or redirect
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-800">{plantHavenName}</h1>
        </div>

        <div className="text-center py-8">
          <p className="text-gray-600">Loading your plants...</p>
        </div>
      </div>
    );
  }

  // If no plants, we'll redirect in the useEffect, but still render something in case
  if (plants.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-800">{plantHavenName}</h1>
        </div>

        <div className="text-center py-8">
          <p className="text-gray-600">Redirecting to add your first plant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-800">{plantHavenName}</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Welcome message with display name */}
      <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
        <h2 className="text-lg font-semibold text-green-800">
          {displayName ? `Welcome back, ${displayName}!` : 'Welcome to your Plant Haven!'}
        </h2>
        <p className="text-sm text-green-700 mt-1">
          {plantsNeedingWater.length > 0 
            ? `You have ${plantsNeedingWater.length} plant${plantsNeedingWater.length > 1 ? 's' : ''} that need${plantsNeedingWater.length === 1 ? 's' : ''} watering today.`
            : 'All your plants are happy and hydrated!'}
        </p>
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
                  <Link href={`/dashboard/plant/${plant.id}`} className="font-medium text-gray-900 hover:text-green-700">
                    {plant.name}
                  </Link>
                  <p className="text-xs text-amber-700">Last watered: {plant.lastWatered?.toLocaleDateString()}</p>
                </div>
                <button 
                  className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    // This would call waterPlant service in a real implementation
                    alert(`Watering ${plant.name}! This is a placeholder for the actual watering functionality.`);
                  }}
                >
                  Water
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

      {/* Plant grid */}
      <div className="space-y-8">
        {getOrganizedPlants().map((group) => (
          <div key={group.title}>
            <h3 className="text-md font-medium text-gray-700 mb-3">{group.title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {group.plants.map((plant, index) => renderPlantCard(plant, index))}
            </div>
          </div>
        ))}
      </div>

      {/* Add plant button */}
      <div className="fixed bottom-20 right-4 z-10">
        <Link 
          href="/dashboard/add" 
          className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
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