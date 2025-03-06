'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getUserPlants } from '@/services/plants';
import { Plant } from '@/types';

export default function Dashboard() {
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

  // Calculate plants that need watering soon (within 2 days)
  const plantsNeedingWater = plants.filter((plant) => {
    if (!plant.nextWateringDate) return false;
    const today = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);
    return plant.nextWateringDate <= twoDaysFromNow;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">Dashboard</h1>
        <Link
          href="/dashboard/plants/add"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Add New Plant
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading your plants...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Plants needing water */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-full">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Plants Needing Water Soon</h2>
            {plantsNeedingWater.length === 0 ? (
              <p className="text-gray-600">No plants need watering soon. Good job!</p>
            ) : (
              <div className="space-y-4">
                {plantsNeedingWater.map((plant) => (
                  <div key={plant.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{plant.name}</p>
                      <p className="text-sm text-gray-600">
                        Next watering: {plant.nextWateringDate?.toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/plants/${plant.id}`}
                      className="text-green-600 hover:text-green-800"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary cards */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-700 mb-4">My Collection</h2>
            <p className="text-3xl font-bold text-green-800">{plants.length}</p>
            <p className="text-gray-600">Total Plants</p>
            <div className="mt-4">
              <Link
                href="/dashboard/plants"
                className="text-green-600 hover:text-green-800"
              >
                View All Plants →
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Watering Schedule</h2>
            <p className="text-3xl font-bold text-green-800">{plantsNeedingWater.length}</p>
            <p className="text-gray-600">Plants Need Watering Soon</p>
            <div className="mt-4">
              <Link
                href="/dashboard/reminders"
                className="text-green-600 hover:text-green-800"
              >
                View Schedule →
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Plant Care Tips</h2>
            <p className="text-gray-600 mb-4">
              Get personalized care tips for your plants using our AI assistant.
            </p>
            <Link
              href="/dashboard/tips"
              className="text-green-600 hover:text-green-800"
            >
              Get Plant Care Tips →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 