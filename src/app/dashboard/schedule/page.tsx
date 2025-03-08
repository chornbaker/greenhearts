'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants } from '@/services/plants';
import { Plant } from '@/types';

export default function Schedule() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today, 1 = tomorrow, etc.
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

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
      wateringFrequency: 5, // days
    },
    {
      id: '2',
      name: 'Snake Plant',
      image: '/images/plants-header.jpg',
      species: 'Sansevieria',
      lastWatered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      nextWateringDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      wateringFrequency: 14, // days
    },
    {
      id: '3',
      name: 'Fiddle Leaf Fig',
      image: '/images/plants-header.jpg',
      species: 'Ficus lyrata',
      lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      nextWateringDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (needs water)
      wateringFrequency: 7, // days
    },
    {
      id: '4',
      name: 'Peace Lily',
      image: '/images/plants-header.jpg',
      species: 'Spathiphyllum',
      lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      nextWateringDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      wateringFrequency: 3, // days
    },
    {
      id: '5',
      name: 'Aloe Vera',
      image: '/images/plants-header.jpg',
      species: 'Aloe',
      lastWatered: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      nextWateringDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      wateringFrequency: 21, // days
    },
  ];

  // Use demo plants for now
  const displayPlants = demoPlants;

  // Generate dates for the next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
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

  // Get all watering events for the next 14 days
  const getAllWateringEvents = () => {
    const events: { date: Date; plants: typeof demoPlants }[] = [];
    
    for (let i = 0; i < 14; i++) {
      const plantsForDay = getPlantsByDay(i);
      if (plantsForDay.length > 0) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(0, 0, 0, 0);
        events.push({ date, plants: plantsForDay });
      }
    }
    
    return events;
  };

  const wateringEvents = getAllWateringEvents();
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-800">Watering Schedule</h1>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setView('calendar')}
            className={`px-3 py-1 text-sm rounded-md ${
              view === 'calendar' ? 'bg-white shadow-sm' : 'text-gray-600'
            }`}
          >
            Calendar
          </button>
          <button 
            onClick={() => setView('list')}
            className={`px-3 py-1 text-sm rounded-md ${
              view === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
            }`}
          >
            List
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading your schedule...</p>
        </div>
      ) : view === 'calendar' ? (
        <div className="space-y-6">
          {/* Calendar view */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + i); // Start from current week's Sunday
                date.setHours(0, 0, 0, 0);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const isToday = date.getTime() === today.getTime();
                const isPast = date < today;
                
                // Check if any plants need watering on this day
                const hasWatering = wateringEvents.some(event => 
                  event.date.getTime() === date.getTime()
                );
                
                const plantCount = wateringEvents.find(event => 
                  event.date.getTime() === date.getTime()
                )?.plants.length || 0;
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const dayDiff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      if (dayDiff >= 0 && dayDiff < 14) {
                        setSelectedDay(dayDiff);
                      }
                    }}
                    disabled={isPast && !isToday}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                      ${isToday ? 'ring-2 ring-green-500' : ''}
                      ${isPast && !isToday ? 'text-gray-400' : 'text-gray-800'}
                      ${hasWatering && !isPast ? 'bg-green-50' : ''}
                      ${selectedDay === Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) && !isPast ? 'bg-green-100' : ''}
                    `}
                  >
                    <span>{date.getDate()}</span>
                    {hasWatering && (
                      <div className="mt-1 w-5 h-5 flex items-center justify-center bg-green-600 rounded-full text-white text-xs">
                        {plantCount}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Selected day details */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700 flex items-center">
              <span className="mr-2">{formatDate(dates[selectedDay])}</span>
              {plantsToWater.length > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  {plantsToWater.length} plant{plantsToWater.length !== 1 ? 's' : ''}
                </span>
              )}
            </h2>
            
            {plantsToWater.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <p className="text-gray-600">No plants need watering on this day.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {plantsToWater.map((plant) => (
                  <div 
                    key={plant.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-sm p-4"
                  >
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-green-100 rounded-xl overflow-hidden relative mr-4">
                        {plant.image && (
                          <Image 
                            src={plant.image} 
                            alt={plant.name} 
                            fill 
                            sizes="(max-width: 768px) 33vw, 56px"
                            priority={plantsToWater.indexOf(plant) === 0}
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{plant.name}</h3>
                        <p className="text-xs text-gray-500">{plant.species}</p>
                        <p className="text-xs text-green-600 mt-1">
                          {selectedDay === 0 && new Date() > plant.nextWateringDate! 
                            ? 'Watering overdue' 
                            : `Water every ${plant.wateringFrequency} days`
                          }
                        </p>
                      </div>
                      <button
                        onClick={() => handleWaterPlant(plant.id)}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                      >
                        Water
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* List view */}
          {wateringEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <p className="text-gray-600">No watering scheduled for the next 14 days.</p>
            </div>
          ) : (
            wateringEvents.map((event, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                  <h3 className="font-medium text-green-800">
                    {formatDate(event.date)} - {event.plants.length} plant{event.plants.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {event.plants.map((plant) => (
                    <div key={plant.id} className="p-4 flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg overflow-hidden relative mr-3">
                        {plant.image && (
                          <Image 
                            src={plant.image} 
                            alt={plant.name} 
                            fill 
                            sizes="(max-width: 768px) 33vw, 48px"
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{plant.name}</h4>
                        <p className="text-xs text-gray-500">{plant.species}</p>
                      </div>
                      <button
                        onClick={() => handleWaterPlant(plant.id)}
                        className="bg-green-600 text-white py-1 px-3 rounded-lg text-sm"
                      >
                        Water
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Google Calendar Sync
            </p>
            <p className="text-xs text-gray-500">
              Sync your watering schedule to Google Calendar to get reminders on your phone.
            </p>
          </div>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Coming Soon</span>
        </div>
      </div>
      
      {/* Add padding at the bottom to ensure content is not hidden behind the menu bar */}
      <div className="h-24"></div>
    </div>
  );
} 