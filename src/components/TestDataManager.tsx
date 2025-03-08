'use client';

import { useState, useEffect, useRef } from 'react';
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
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClearData = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handlePopulateData = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
        WebkitTapHighlightColor: 'transparent'
      }}
      onClick={handleCloseClick}
    >
      <div 
        ref={modalRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          maxWidth: '28rem',
          width: '100%',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#166534' }}>Test Data Manager</h2>
          <button
            onClick={handleCloseClick}
            style={{ 
              color: '#6b7280', 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '0.25rem',
              WebkitAppearance: 'none'
            }}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
          Use these tools to manage test data in your account. This is useful for testing the application with different data states.
        </p>
        
        {message && (
          <div style={{ 
            backgroundColor: '#dcfce7', 
            borderWidth: '1px', 
            borderColor: '#86efac', 
            color: '#166534', 
            padding: '0.75rem 1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            {message}
          </div>
        )}
        
        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            borderWidth: '1px', 
            borderColor: '#fca5a5', 
            color: '#b91c1c', 
            padding: '0.75rem 1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={handleClearData}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.5rem 1rem', 
              backgroundColor: loading ? '#ef4444aa' : '#ef4444', 
              color: 'white', 
              fontWeight: 500, 
              borderRadius: '0.5rem', 
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              WebkitAppearance: 'none',
              transition: 'background-color 0.2s ease'
            }}
          >
            {loading ? 'Processing...' : 'Clear All Data'}
          </button>
          
          <button
            onClick={handlePopulateData}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.5rem 1rem', 
              backgroundColor: loading ? '#16a34aaa' : '#16a34a', 
              color: 'white', 
              fontWeight: 500, 
              borderRadius: '0.5rem', 
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              WebkitAppearance: 'none',
              transition: 'background-color 0.2s ease'
            }}
          >
            {loading ? 'Processing...' : 'Populate Test Data'}
          </button>
        </div>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
          <p>Note: Clearing data will remove all plants from your account.</p>
          <p>Populating test data will first clear existing data, then add sample plants.</p>
        </div>
      </div>
    </div>
  );
} 