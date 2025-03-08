'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [gardenName, setGardenName] = useState('My Garden');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  const handleSaveGardenName = () => {
    // In a real implementation, this would update the garden name in Firestore
    setIsEditing(false);
    // Show success message or toast
    alert('Garden name updated! This is a placeholder for the actual update functionality.');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-800">Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-gray-800">Account Information</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your account details</p>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="font-medium">{user?.email || 'Not available'}</p>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-600">Garden Name</p>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-green-600"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={gardenName}
                  onChange={(e) => setGardenName(e.target.value)}
                  placeholder="Enter your garden name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSaveGardenName}
                  className="bg-green-600 text-white text-sm py-2 px-3 rounded-xl"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="font-medium">{gardenName}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-gray-800">Preferences</h2>
            <p className="text-sm text-gray-500 mt-1">Customize your app experience</p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-gray-500">Get reminders for watering your plants</p>
            </div>
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-200">
              <label htmlFor="toggle" className="absolute left-0 w-6 h-6 transition duration-100 ease-in-out transform bg-white border rounded-full cursor-pointer">
                <input type="checkbox" id="toggle" className="sr-only" />
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-200">
              <label htmlFor="toggle-dark" className="absolute left-0 w-6 h-6 transition duration-100 ease-in-out transform bg-white border rounded-full cursor-pointer">
                <input type="checkbox" id="toggle-dark" className="sr-only" disabled />
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-gray-800">Connected Services</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your connected accounts</p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-medium">Google Calendar</p>
              <p className="text-sm text-gray-500">Not connected</p>
            </div>
            <button className="text-sm text-green-600">
              Connect
            </button>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button
          onClick={handleSignOut}
          className="w-full py-3 px-4 border border-red-300 text-red-600 rounded-xl hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
} 