'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { clearUserData, populateTestData } from '@/services/testData';

interface TestDataManagerProps {
  onClose: () => void;
}

export default function TestDataManager({ onClose }: TestDataManagerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleClearData = async () => {
    if (!user) {
      setError('You must be logged in to clear data');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setError('');
      
      await clearUserData(user.uid);
      
      setMessage('All test data has been cleared successfully!');
    } catch (err) {
      console.error('Error clearing data:', err);
      setError('Failed to clear data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateData = async () => {
    if (!user) {
      setError('You must be logged in to populate data');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setError('');
      
      await populateTestData(user.uid);
      
      setMessage('Test data has been populated successfully!');
    } catch (err) {
      console.error('Error populating data:', err);
      setError('Failed to populate data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-green-800">Test Data Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Use these tools to manage test data in your account. This is useful for testing the application with different data states.
        </p>
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={handleClearData}
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Clear All Data'}
          </button>
          
          <button
            onClick={handlePopulateData}
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Populate Test Data'}
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p>Note: Clearing data will remove all plants from your account.</p>
          <p>Populating test data will first clear existing data, then add sample plants.</p>
        </div>
      </div>
    </div>
  );
} 