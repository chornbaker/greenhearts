'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants } from '@/services/plants';
import { Plant } from '@/types';

export default function Reminders() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today, 1 = tomorrow, etc.

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

  // Generate dates for the next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Get plants that need watering on the selected day
  const getPlantsByDay = (dayOffset: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    return displayPlants.filter(plant => {
      if (!plant.nextWateringDate) return false;
      const wateringDate = new Date(plant.nextWateringDate);
      wateringDate.setHours(0, 0, 0, 0);
      
      // For today, also include overdue plants
      if (dayOffset === 0) {
        return wateringDate <= targetDate;
      }
      
      return wateringDate.getTime() === targetDate.getTime();
    });
  };

  const plantsToWater = getPlantsByDay(selectedDay);
  
  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleWaterPlant = (plantId: string) => {
    // In a real implementation, this would call the waterPlant service
    console.log(`Watering plant ${plantId}`);
    alert('Plant watered! This is a placeholder for the actual watering functionality.');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-800">Watering Schedule</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Date selector */}
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-2 min-w-max">
          {dates.map((date, index) => (
            <button
              key={index}
              onClick={() => setSelectedDay(index)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl ${
                selectedDay === index 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700'
              }`}
            >
              <span className="text-xs font-medium">
                {date.toLocaleDateString(undefined, { weekday: 'short' })}
              </span>
              <span className="text-lg font-bold">
                {date.getDate()}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading your schedule...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700">
            {formatDate(dates[selectedDay])}
          </h2>
          
          {plantsToWater.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center">
              <p className="text-gray-600">No plants need watering on this day.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plantsToWater.map((plant) => (
                <div 
                  key={plant.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-sm p-3"
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-green-100 rounded-xl overflow-hidden relative mr-3">
                      {plant.image && (
                        <Image 
                          src={plant.image} 
                          alt={plant.name} 
                          fill 
                          sizes="(max-width: 768px) 33vw, 56px"
                          priority
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{plant.name}</h3>
                      <p className="text-xs text-gray-500">{plant.species}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedDay === 0 && new Date() > plant.nextWateringDate! 
                          ? 'Watering overdue' 
                          : 'Water today'
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => handleWaterPlant(plant.id)}
                      className="bg-green-600 text-white text-xs py-1 px-3 rounded-full"
                    >
                      Water
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
            <p className="text-sm text-gray-600 mb-1">
              Google Calendar Sync (Coming Soon)
            </p>
            <p className="text-xs text-gray-500">
              Sync your watering schedule to Google Calendar to get reminders on your phone.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 