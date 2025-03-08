'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants } from '@/services/plants';
import { Plant } from '@/types';

// Organization view types
type OrganizationView = 'location' | 'alphabetical' | 'wateringPriority';

export default function Dashboard() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gardenName, setGardenName] = useState('My GreenHearts');
  const [organizationView, setOrganizationView] = useState<OrganizationView>('location');

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

  // Simplified demo plants with 3-4 rooms and 2-5 plants each
  const demoPlants: Plant[] = [
    // Living Room (3 plants)
    {
      id: '1',
      userId: user?.uid || 'demo-user',
      name: 'Monstera Deliciosa',
      species: 'Monstera Deliciosa',
      image: '/images/plants-header.jpg',
      location: 'Living Room',
      wateringSchedule: { frequency: 7 },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      nextWateringDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      userId: user?.uid || 'demo-user',
      name: 'Fiddle Leaf Fig',
      species: 'Ficus Lyrata',
      image: '/images/plants-header.jpg',
      location: 'Living Room',
      wateringSchedule: { frequency: 7 },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      nextWateringDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Needs water
    },
    {
      id: '3',
      userId: user?.uid || 'demo-user',
      name: 'Snake Plant',
      species: 'Sansevieria Trifasciata',
      image: '/images/plants-header.jpg',
      location: 'Living Room',
      wateringSchedule: { frequency: 14 },
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      lastWatered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      nextWateringDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
    
    // Kitchen (2 plants)
    {
      id: '4',
      userId: user?.uid || 'demo-user',
      name: 'Pothos',
      species: 'Epipremnum Aureum',
      image: '/images/plants-header.jpg',
      location: 'Kitchen',
      wateringSchedule: { frequency: 7 },
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      lastWatered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextWateringDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '5',
      userId: user?.uid || 'demo-user',
      name: 'Herbs Collection',
      species: 'Mixed Herbs',
      image: '/images/plants-header.jpg',
      location: 'Kitchen',
      wateringSchedule: { frequency: 3 },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextWateringDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), // Needs water
    },
    
    // Bedroom (2 plants)
    {
      id: '6',
      userId: user?.uid || 'demo-user',
      name: 'Peace Lily',
      species: 'Spathiphyllum',
      image: '/images/plants-header.jpg',
      location: 'Bedroom',
      wateringSchedule: { frequency: 7 },
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      lastWatered: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      nextWateringDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: '7',
      userId: user?.uid || 'demo-user',
      name: 'Aloe Vera',
      species: 'Aloe Vera',
      image: '/images/plants-header.jpg',
      location: 'Bedroom',
      wateringSchedule: { frequency: 21 },
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      lastWatered: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      nextWateringDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    
    // Patio (3 plants)
    {
      id: '8',
      userId: user?.uid || 'demo-user',
      name: 'Boston Fern',
      species: 'Nephrolepis Exaltata',
      image: '/images/plants-header.jpg',
      location: 'Patio',
      wateringSchedule: { frequency: 3 },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextWateringDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '9',
      userId: user?.uid || 'demo-user',
      name: 'Jade Plant',
      species: 'Crassula Ovata',
      image: '/images/plants-header.jpg',
      location: 'Patio',
      wateringSchedule: { frequency: 30 },
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      lastWatered: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      nextWateringDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '10',
      userId: user?.uid || 'demo-user',
      name: 'Lavender',
      species: 'Lavandula',
      image: '/images/plants-header.jpg',
      location: 'Patio',
      wateringSchedule: { frequency: 7 },
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      lastWatered: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      nextWateringDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
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

  // Organize plants based on selected view
  const getOrganizedPlants = () => {
    switch (organizationView) {
      case 'alphabetical':
        return [...displayPlants].sort((a, b) => a.name.localeCompare(b.name));
      
      case 'wateringPriority':
        return [...displayPlants].sort((a, b) => {
          if (!a.nextWateringDate) return 1;
          if (!b.nextWateringDate) return -1;
          return a.nextWateringDate.getTime() - b.nextWateringDate.getTime();
        });
      
      case 'location':
      default:
        // Group by location
        const plantsByLocation: Record<string, Plant[]> = {};
        
        displayPlants.forEach(plant => {
          const location = plant.location || 'Unassigned';
          if (!plantsByLocation[location]) {
            plantsByLocation[location] = [];
          }
          plantsByLocation[location].push(plant);
        });
        
        return plantsByLocation;
    }
  };

  const organizedPlants = getOrganizedPlants();

  // Render a single plant card
  const renderPlantCard = (plant: Plant, index: number) => (
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
            sizes="(max-width: 768px) 33vw, 96px"
            priority={index === 0}
            style={{ objectFit: 'cover' }}
          />
        )}
      </div>
      <div className="p-2 text-center">
        <p className="text-xs font-medium text-gray-800 truncate">{plant.name}</p>
        {organizationView === 'location' && plant.location && (
          <p className="text-xs text-gray-500 truncate">{plant.location}</p>
        )}
        {organizationView === 'wateringPriority' && plant.nextWateringDate && (
          <p className={`text-xs ${plant.nextWateringDate <= new Date() ? 'text-red-500' : 'text-gray-500'} truncate`}>
            {plant.nextWateringDate <= new Date() 
              ? 'Overdue' 
              : `Water in ${Math.ceil((plant.nextWateringDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`}
          </p>
        )}
      </div>
    </Link>
  );

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
                          priority={plantsNeedingWater.indexOf(plant) === 0}
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

          {/* View selector buttons */}
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => setOrganizationView('location')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                organizationView === 'location' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Location
            </button>
            <button
              onClick={() => setOrganizationView('alphabetical')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                organizationView === 'alphabetical' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              A-Z
            </button>
            <button
              onClick={() => setOrganizationView('wateringPriority')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                organizationView === 'wateringPriority' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Watering
            </button>
          </div>

          {/* Plant collection */}
          <div>
            {/* Location View (Grouped by Location) */}
            {organizationView === 'location' && (
              <div className="space-y-6">
                {Object.entries(organizedPlants as Record<string, Plant[]>).map(([location, plants]) => (
                  <div key={location} className="space-y-2">
                    <h3 className="text-md font-medium text-green-700">{location}</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {plants.map((plant, index) => renderPlantCard(plant, index))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Alphabetical or Watering Priority Views */}
            {(organizationView === 'alphabetical' || organizationView === 'wateringPriority') && (
              <div className="grid grid-cols-3 gap-3">
                {(organizedPlants as Plant[]).map((plant, index) => renderPlantCard(plant, index))}
              </div>
            )}
            
            {/* Add Plant Button */}
            <div className="mt-4">
              <Link 
                href="/dashboard/add"
                className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm flex flex-col items-center justify-center h-24 w-full"
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
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 