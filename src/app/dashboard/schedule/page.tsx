'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants, waterPlant as waterPlantService } from '@/services/plants';
import { getUserProfile } from '@/services/user';
import { Plant } from '@/types';
import { useWaterMessages } from '@/context/WaterMessageContext';
import { getDaysOverdue, isDueToday, getWateringStatusText } from '@/utils/dateUtils';

// Water droplet icon component - simplified version
const WaterDropIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12 2.5c-1.7 2.3-6 7.6-6 11.5 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.9-4.3-9.2-6-11.5z" />
  </svg>
);

export default function Schedule() {
  const { user } = useAuth();
  const { getWaterMessage, generateDailyMessages } = useWaterMessages();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today, 1 = tomorrow, etc.
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [wateringPlant, setWateringPlant] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const fetchPlants = async () => {
      if (!user) return;
      
      try {
        // Fetch user profile to get display name
        const userProfile = await getUserProfile(user.uid);
        if (userProfile && userProfile.displayName) {
          setDisplayName(userProfile.displayName);
        }
        
        const userPlants = await getUserPlants(user.uid);
        
        // Set the user's display name on each plant
        const plantsWithDisplayName = userPlants.map(plant => ({
          ...plant,
          userDisplayName: userProfile?.displayName || ''
        }));
        
        setPlants(plantsWithDisplayName);
        
        // Generate messages for plants that need watering today
        const plantsNeedingWater = plantsWithDisplayName.filter(plant => {
          if (!plant.nextWateringDate) return false;
          const wateringDate = new Date(plant.nextWateringDate);
          const today = new Date();
          wateringDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          return wateringDate <= today;
        });
        
        // Ensure we generate messages for all plants needing water
        if (plantsNeedingWater.length > 0) {
          try {
            await generateDailyMessages(plantsNeedingWater);
          } catch (error) {
            console.error('Error generating messages:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching plants:', error);
        setError('Failed to load your plants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [user]);

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
    
    return plants.filter(plant => {
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
    const events: { date: Date; plants: Plant[] }[] = [];
    
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

  // Handle watering a plant
  const handleWaterPlant = async (plantId: string) => {
    if (wateringPlant) return; // Prevent multiple simultaneous watering
    
    setWateringPlant(plantId);
    
    try {
      // Call the watering service
      await waterPlantService(plantId);
      
      // Refresh plants data
      const updatedPlants = await getUserPlants(user!.uid);
      
      // Set the user's display name on each plant
      const updatedPlantsWithDisplayName = updatedPlants.map(plant => ({
        ...plant,
        userDisplayName: displayName || ''
      }));
      
      setPlants(updatedPlantsWithDisplayName);
      
      // Regenerate messages for the updated plants that need water
      const plantsNeedingWater = updatedPlantsWithDisplayName.filter(plant => {
        if (!plant.nextWateringDate) return false;
        const wateringDate = new Date(plant.nextWateringDate);
        const today = new Date();
        wateringDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return wateringDate <= today;
      });
      
      if (plantsNeedingWater.length > 0) {
        try {
          await generateDailyMessages(plantsNeedingWater);
        } catch (error) {
          console.error('Error regenerating messages:', error);
        }
      }
    } catch (error) {
      console.error('Error watering plant:', error);
    } finally {
      setWateringPlant(null);
    }
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
                  <div key={plant.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex">
                      <div className="w-24 bg-green-100 relative">
                        {plant.image && (
                          <Image 
                            src={plant.image} 
                            alt={plant.name} 
                            fill 
                            sizes="(max-width: 768px) 33vw, 96px"
                            priority={plantsToWater.indexOf(plant) === 0}
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <div className="flex-1 p-4 flex items-center justify-between">
                        <div>
                          <p className="text-gray-800 font-medium">{plant.name}</p>
                          <p className="text-xs text-gray-500">{plant.species}</p>
                          {selectedDay === 0 && (
                            <p className={`text-xs mt-1 ${isDueToday(plant) ? 'text-green-600' : 'text-red-600'}`}>
                              {getWateringStatusText(plant)}
                            </p>
                          )}
                          {getWaterMessage(plant) && selectedDay === 0 && (
                            <p className="text-xs text-gray-600 italic mt-1">
                              {getWaterMessage(plant)}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => handleWaterPlant(plant.id)}
                            disabled={wateringPlant === plant.id}
                            className={`
                              w-10 h-10 rounded-full flex items-center justify-center
                              ${wateringPlant === plant.id ? 'bg-blue-300' : 'bg-blue-500'}
                              shadow-md focus:outline-none
                            `}
                            aria-label="Water plant"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
                              <path d="M12 2.5c-1.7 2.3-6 7.6-6 11.5 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.9-4.3-9.2-6-11.5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
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
                    <div key={plant.id} className="bg-white overflow-hidden">
                      <div className="flex">
                        <div className="w-24 bg-green-100 relative">
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
                        <div className="flex-1 p-4 flex items-center justify-between">
                          <div>
                            <p className="text-gray-800 font-medium">{plant.name}</p>
                            <p className="text-xs text-gray-500">{plant.species}</p>
                            {event.date.getTime() === new Date().setHours(0, 0, 0, 0) && (
                              <p className={`text-xs mt-1 ${isDueToday(plant) ? 'text-green-600' : 'text-red-600'}`}>
                                {getWateringStatusText(plant)}
                              </p>
                            )}
                            {getWaterMessage(plant) && event.date.getTime() === new Date().setHours(0, 0, 0, 0) && (
                              <p className="text-xs text-gray-600 italic mt-1">
                                {getWaterMessage(plant)}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleWaterPlant(plant.id)}
                              disabled={wateringPlant === plant.id}
                              className={`
                                w-10 h-10 rounded-full flex items-center justify-center
                                ${wateringPlant === plant.id ? 'bg-blue-300' : 'bg-blue-500'}
                                shadow-md focus:outline-none
                              `}
                              aria-label="Water plant"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
                                <path d="M12 2.5c-1.7 2.3-6 7.6-6 11.5 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.9-4.3-9.2-6-11.5z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
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