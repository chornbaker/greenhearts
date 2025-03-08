'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/user';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [plantHavenName, setPlantHavenName] = useState('My Plant Haven');
  const [displayName, setDisplayName] = useState('');
  const [isEditingHavenName, setIsEditingHavenName] = useState(false);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            if (profile.plantHavenName) setPlantHavenName(profile.plantHavenName);
            if (profile.displayName) setDisplayName(profile.displayName);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  const handleSavePlantHavenName = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await updateUserProfile(user.uid, { plantHavenName });
      setIsEditingHavenName(false);
      setSuccessMessage('Plant Haven name updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating Plant Haven name:', error);
      setError('Failed to update Plant Haven name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await updateUserProfile(user.uid, { displayName });
      setIsEditingDisplayName(false);
      setSuccessMessage('Display name updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating display name:', error);
      setError('Failed to update display name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-800">Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
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
              <p className="text-sm text-gray-600">Plant Haven Name</p>
              <button 
                onClick={() => setIsEditingHavenName(!isEditingHavenName)}
                className="text-xs text-green-600"
              >
                {isEditingHavenName ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {isEditingHavenName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={plantHavenName}
                  onChange={(e) => setPlantHavenName(e.target.value)}
                  placeholder="Enter your Plant Haven name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSavePlantHavenName}
                  disabled={loading}
                  className="bg-green-600 text-white text-sm py-2 px-3 rounded-xl disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="font-medium">{plantHavenName}</p>
            )}
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-600">What should your GreenHearts call you?</p>
              <button 
                onClick={() => setIsEditingDisplayName(!isEditingDisplayName)}
                className="text-xs text-green-600"
              >
                {isEditingDisplayName ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {isEditingDisplayName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your preferred name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSaveDisplayName}
                  disabled={loading}
                  className="bg-green-600 text-white text-sm py-2 px-3 rounded-xl disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="font-medium">{displayName || 'Not set'}</p>
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