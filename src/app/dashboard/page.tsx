'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants, waterPlant, updatePlant, saveThirstyMessages, getThirstyMessages } from '@/services/plants';
import { getUserProfile } from '@/services/user';
import { Plant } from '@/types';
import ExpandableCard from '@/components/dashboard/ExpandableCard';
import { generateThirstyPlantMessage } from '@/services/claude';

// Organization view types
type OrganizationView = 'location' | 'alphabetical' | 'wateringPriority' | 'health';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plantHavenName, setPlantHavenName] = useState('My Plant Haven');
  const [displayName, setDisplayName] = useState('');
  const [organizationView, setOrganizationView] = useState<OrganizationView>('location');
  const [thirstyMessages, setThirstyMessages] = useState<Record<string, string>>({});
  const [lastMessageDate, setLastMessageDate] = useState<string>('');
  const [messagesLoaded, setMessagesLoaded] = useState(false);

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
        
        // Fetch thirsty messages from Firebase
        const { messages, updatedAt } = await getThirstyMessages(user.uid);
        if (Object.keys(messages).length > 0) {
          setThirstyMessages(messages);
          
          // Set last message date if available
          if (updatedAt) {
            setLastMessageDate(updatedAt.toDateString());
          }
        }
        setMessagesLoaded(true);
        
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
    try {
      // Find the plant in our state
      const plantIndex = plants.findIndex(p => p.id === plantId);
      if (plantIndex === -1) return;
      
      // Update the plant in the database
      await waterPlant(plantId);
      
      // Get the updated plant data
      const updatedPlants = await getUserPlants(user!.uid);
      setPlants(updatedPlants);
      
      // Remove the thirsty message for this plant
      if (thirstyMessages[plantId]) {
        const updatedMessages = { ...thirstyMessages };
        delete updatedMessages[plantId];
        setThirstyMessages(updatedMessages);
        
        // Update localStorage
        localStorage.setItem('thirstyMessages', JSON.stringify(updatedMessages));
        
        // Update Firebase
        if (user) {
          try {
            await saveThirstyMessages(user.uid, updatedMessages);
          } catch (error) {
            console.error('Error updating thirsty messages in Firebase:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error watering plant:', error);
    }
  };

  // Handle updating a plant
  const handleUpdatePlant = async (plantId: string, updates: Partial<Plant>) => {
    try {
      // Find the plant in our state
      const plantIndex = plants.findIndex(p => p.id === plantId);
      if (plantIndex === -1) return;
      
      // Update the plant in our state
      const updatedPlants = [...plants];
      const updatedPlant = { ...updatedPlants[plantIndex], ...updates };
      updatedPlants[plantIndex] = updatedPlant;
      setPlants(updatedPlants);
      
      // Update the plant in the database
      await updatePlant(plantId, updates);
      
      // Check if the plant is now overdue for watering after the update
      // This could happen if the user updates the last watered date
      const wasOverdue = plantsNeedingWater.some(p => p.id === plantId);
      const isNowOverdue = updatedPlant.nextWateringDate && new Date() > new Date(updatedPlant.nextWateringDate);
      
      // If the plant wasn't overdue before but is now, generate a thirsty message
      if (!wasOverdue && isNowOverdue && updatedPlant.personalityType) {
        try {
          const daysOverdue = getDaysOverdue(updatedPlant);
          const message = await generateThirstyPlantMessage({
            name: updatedPlant.name,
            species: updatedPlant.species || '',
            personalityType: updatedPlant.personalityType,
            daysOverdue,
            userName: displayName || undefined,
            location: updatedPlant.location
          });
          
          // Update the thirsty messages state
          const updatedMessages = {
            ...thirstyMessages,
            [plantId]: message
          };
          setThirstyMessages(updatedMessages);
          
          // Update localStorage
          localStorage.setItem('thirstyMessages', JSON.stringify(updatedMessages));
          
          // Update Firebase
          if (user) {
            try {
              await saveThirstyMessages(user.uid, updatedMessages);
            } catch (error) {
              console.error('Error updating thirsty messages in Firebase:', error);
            }
          }
        } catch (error) {
          console.error(`Error generating message for ${updatedPlant.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error updating plant:', error);
    }
  };

  // Get plants organized by the selected view
  const getOrganizedPlants = () => {
    switch (organizationView) {
      case 'location':
        // Group by indoor/outdoor first, then by location
        const indoorLocations: { [key: string]: Plant[] } = {};
        const outdoorLocations: { [key: string]: Plant[] } = {};
        const unassignedPlants: Plant[] = [];
        
        plants.forEach((plant) => {
          if (!plant.location) {
            unassignedPlants.push(plant);
            return;
          }
          
          // Check if location is indoor or outdoor
          const isOutdoor = ['Patio', 'Balcony', 'Front Yard', 'Back Yard', 'Garden', 'Porch'].some(
            outdoor => plant.location?.includes(outdoor)
          );
          
          if (isOutdoor) {
            if (!outdoorLocations[plant.location]) {
              outdoorLocations[plant.location] = [];
            }
            outdoorLocations[plant.location].push(plant);
          } else {
            if (!indoorLocations[plant.location]) {
              indoorLocations[plant.location] = [];
            }
            indoorLocations[plant.location].push(plant);
          }
        });
        
        // Create groups array with indoor locations first, then outdoor
        const groups = [];
        
        // Add indoor locations
        if (Object.keys(indoorLocations).length > 0) {
          Object.entries(indoorLocations)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([location, plants]) => {
              groups.push({
                title: location,
                plants: plants.sort((a, b) => a.name.localeCompare(b.name))
              });
            });
        }
        
        // Add outdoor locations
        if (Object.keys(outdoorLocations).length > 0) {
          Object.entries(outdoorLocations)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([location, plants]) => {
              groups.push({
                title: location,
                plants: plants.sort((a, b) => a.name.localeCompare(b.name))
              });
            });
        }
        
        // Add unassigned plants if any
        if (unassignedPlants.length > 0) {
          groups.push({
            title: 'Unassigned',
            plants: unassignedPlants.sort((a, b) => a.name.localeCompare(b.name))
          });
        }
        
        return groups;
        
      case 'alphabetical':
        // Just one group with all plants sorted alphabetically
        return [{
          title: 'All Plants',
          plants: [...plants].sort((a, b) => a.name.localeCompare(b.name))
        }];
        
      case 'wateringPriority':
        // Group by watering status: overdue first, then by date
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const overduePlants: Plant[] = [];
        const tomorrowPlants: Plant[] = [];
        const thisWeekPlants: { [key: string]: Plant[] } = {};
        const laterPlants: { [key: string]: Plant[] } = {};
        const noDatePlants: Plant[] = [];
        
        // Days of the week for display
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // Calculate the date one week from today
        const oneWeekFromNow = new Date(today);
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        
        plants.forEach((plant) => {
          if (!plant.nextWateringDate) {
            noDatePlants.push(plant);
            return;
          }
          
          const nextWatering = new Date(plant.nextWateringDate);
          
          // Check if overdue
          if (nextWatering < today) {
            overduePlants.push(plant);
            return;
          }
          
          // Check if tomorrow
          if (nextWatering.getDate() === tomorrow.getDate() && 
              nextWatering.getMonth() === tomorrow.getMonth() && 
              nextWatering.getFullYear() === tomorrow.getFullYear()) {
            tomorrowPlants.push(plant);
            return;
          }
          
          // Check if within a week
          if (nextWatering < oneWeekFromNow) {
            const dayOfWeek = daysOfWeek[nextWatering.getDay()];
            if (!thisWeekPlants[dayOfWeek]) {
              thisWeekPlants[dayOfWeek] = [];
            }
            thisWeekPlants[dayOfWeek].push(plant);
            return;
          }
          
          // Beyond a week, format with full month
          const dateKey = nextWatering.toLocaleDateString(undefined, { 
            month: 'long', 
            day: 'numeric' 
          });
          
          if (!laterPlants[dateKey]) {
            laterPlants[dateKey] = [];
          }
          laterPlants[dateKey].push(plant);
        });
        
        // Create groups array with overdue first, then by date
        const wateringGroupsArray = [];
        
        // Add overdue plants if any
        if (overduePlants.length > 0) {
          wateringGroupsArray.push({
            title: 'Overdue',
            plants: overduePlants.sort((a, b) => {
              // Sort overdue plants by most overdue first
              return a.nextWateringDate!.getTime() - b.nextWateringDate!.getTime();
            })
          });
        }
        
        // Add tomorrow plants if any
        if (tomorrowPlants.length > 0) {
          wateringGroupsArray.push({
            title: 'Water Tomorrow',
            plants: tomorrowPlants.sort((a, b) => a.name.localeCompare(b.name))
          });
        }
        
        // Add this week plants by day of week
        const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        dayOrder.forEach(day => {
          if (thisWeekPlants[day] && thisWeekPlants[day].length > 0) {
            wateringGroupsArray.push({
              title: `Water on ${day}`,
              plants: thisWeekPlants[day].sort((a, b) => a.name.localeCompare(b.name))
            });
          }
        });
        
        // Add later plants by date
        Object.keys(laterPlants)
          .sort((a, b) => {
            const dateA = new Date(laterPlants[a][0].nextWateringDate!);
            const dateB = new Date(laterPlants[b][0].nextWateringDate!);
            return dateA.getTime() - dateB.getTime();
          })
          .forEach(dateKey => {
            wateringGroupsArray.push({
              title: `Water on ${dateKey}`,
              plants: laterPlants[dateKey].sort((a, b) => a.name.localeCompare(b.name))
            });
          });
        
        // Add plants with no watering date if any
        if (noDatePlants.length > 0) {
          wateringGroupsArray.push({
            title: 'No Watering Schedule',
            plants: noDatePlants.sort((a, b) => a.name.localeCompare(b.name))
          });
        }
        
        return wateringGroupsArray;
        
      case 'health':
        // Group by health status, poorest health first
        const healthGroups: { [key: string]: Plant[] } = {};
        const noHealthPlants: Plant[] = [];
        
        // Define health order for sorting
        const healthOrder = ['poor', 'fair', 'good', 'excellent'];
        
        plants.forEach((plant) => {
          if (!plant.health) {
            noHealthPlants.push(plant);
            return;
          }
          
          if (!healthGroups[plant.health]) {
            healthGroups[plant.health] = [];
          }
          healthGroups[plant.health].push(plant);
        });
        
        // Create groups array with poorest health first
        const healthGroupsArray = [];
        
        // Add plants by health status in order
        healthOrder.forEach(health => {
          if (healthGroups[health] && healthGroups[health].length > 0) {
            healthGroupsArray.push({
              title: `${health.charAt(0).toUpperCase() + health.slice(1)} Health`,
              plants: healthGroups[health].sort((a, b) => a.name.localeCompare(b.name))
            });
          }
        });
        
        // Add plants with no health status if any
        if (noHealthPlants.length > 0) {
          healthGroupsArray.push({
            title: 'Health Not Set',
            plants: noHealthPlants.sort((a, b) => a.name.localeCompare(b.name))
          });
        }
        
        return healthGroupsArray;
        
      default:
        return [];
    }
  };
  
  // Calculate days overdue for watering
  const getDaysOverdue = (plant: Plant): number => {
    if (!plant.nextWateringDate) return 0;
    
    const today = new Date();
    const nextWatering = new Date(plant.nextWateringDate);
    
    // Calculate difference in days
    const diffTime = today.getTime() - nextWatering.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Generate thirsty messages for plants
  const generateThirstyMessages = useCallback(async () => {
    if (!user) return;
    
    // Check if we already generated messages today
    const today = new Date().toDateString();
    if (lastMessageDate === today) return;
    
    const messages: Record<string, string> = {};
    const messagePromises = plantsNeedingWater.map(async (plant) => {
      if (!plant.personalityType) return;
      
      try {
        const daysOverdue = getDaysOverdue(plant);
        const message = await generateThirstyPlantMessage({
          name: plant.name,
          species: plant.species || '',
          personalityType: plant.personalityType,
          daysOverdue,
          userName: displayName || undefined,
          location: plant.location
        });
        
        messages[plant.id] = message;
      } catch (error) {
        console.error(`Error generating message for ${plant.name}:`, error);
      }
    });
    
    await Promise.all(messagePromises);
    
    // Only update if we have new messages
    if (Object.keys(messages).length > 0) {
      setThirstyMessages(messages);
      setLastMessageDate(today);
      
      // Save messages to Firebase
      try {
        await saveThirstyMessages(user.uid, messages);
      } catch (error) {
        console.error('Error saving thirsty messages to Firebase:', error);
      }
      
      // Also save to localStorage as a backup
      localStorage.setItem('thirstyMessages', JSON.stringify(messages));
      localStorage.setItem('lastMessageDate', today);
    }
  }, [plantsNeedingWater, lastMessageDate, user, displayName]);

  // Load saved messages from localStorage as a fallback
  useEffect(() => {
    if (messagesLoaded && Object.keys(thirstyMessages).length === 0) {
      const savedMessages = localStorage.getItem('thirstyMessages');
      const savedDate = localStorage.getItem('lastMessageDate');
      
      if (savedMessages) {
        setThirstyMessages(JSON.parse(savedMessages));
      }
      
      if (savedDate) {
        setLastMessageDate(savedDate);
      }
    }
  }, [messagesLoaded, thirstyMessages]);

  // Generate new messages when plants needing water changes
  useEffect(() => {
    if (plantsNeedingWater.length > 0 && !loading && user) {
      generateThirstyMessages();
    }
  }, [plantsNeedingWater, loading, generateThirstyMessages, user]);

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
      {plantsNeedingWater.length > 0 &&
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 mb-6">
          <h2 className="text-lg font-semibold text-amber-800 mb-3">Your Plants are Thirsty...</h2>
          <div className="space-y-3">
            {plantsNeedingWater.map((plant) => (
              <div key={plant.id} className="flex items-center gap-3 bg-white bg-opacity-50 p-3 rounded-xl">
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
                  <p className="font-medium text-gray-800">{plant.name}</p>
                  <p className="text-xs text-red-600">
                    {getDaysOverdue(plant) === 1 
                      ? '1 day overdue' 
                      : `${getDaysOverdue(plant)} days overdue`}
                  </p>
                  {thirstyMessages[plant.id] && (
                    <p className="text-xs text-gray-600 italic mt-1">
                      {thirstyMessages[plant.id]}
                    </p>
                  )}
                </div>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white h-8 w-8 rounded-full flex items-center justify-center"
                  onClick={(e) => {
                    e.preventDefault();
                    handleWaterPlant(plant.id);
                  }}
                  aria-label="Water plant"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.5c-1.7 2.3-6 7.6-6 11.5 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.9-4.3-9.2-6-11.5z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      }
      
      {/* Organization view selector */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {plants.length} {plants.length === 1 ? 'Plant' : 'Plants'}
        </h2>
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
          <button 
            onClick={() => setOrganizationView('health')}
            className={`text-xs px-2 py-1 rounded ${
              organizationView === 'health' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Health
          </button>
        </div>
      </div>
      
      {/* Plant groups with expandable cards */}
      <div className="space-y-8">
        {getOrganizedPlants().map((group) => (
          <div key={group.title}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-md font-medium text-gray-700">{group.title}</h3>
              <div className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {group.plants.length}
              </div>
            </div>
            <div className="space-y-3">
              {group.plants.map((plant, index) => (
                <ExpandableCard 
                  key={plant.id || index}
                  plant={plant} 
                  onWater={handleWaterPlant}
                  onUpdate={handleUpdatePlant}
                  organizationView={organizationView}
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