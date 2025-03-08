'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import DashboardNavigation from '@/components/DashboardNavigation';
import TestDataManager from '@/components/TestDataManager';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTestDataManager, setShowTestDataManager] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset image error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [user]);

  // Apply padding to main content based on footer height
  useEffect(() => {
    if (footerRef.current && mainContentRef.current) {
      const footerHeight = footerRef.current.offsetHeight;
      mainContentRef.current.style.paddingBottom = `${footerHeight}px`;
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };
  
  const handleTestDataClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTestDataManager(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f5]">
        <div className="text-center">
          <p className="text-lg text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#f8f8f5] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="small" showText={true} href="/dashboard" />
          
          <div className="flex items-center gap-2">
            {/* Manage Test Data button - only visible in development mode */}
            {isDevelopment && (
              <button
                onClick={handleTestDataClick}
                style={{
                  fontSize: '0.875rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                aria-label="Manage Test Data"
              >
                Test Data
              </button>
            )}
            
            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center focus:outline-none"
                aria-label="Profile menu"
                style={{ 
                  WebkitTapHighlightColor: 'transparent' // Prevent tap highlight on mobile Safari
                }}
              >
                {/* Safari-compatible styling with inline styles for consistency */}
                <div 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#f0fdf4', // Light green background
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '2px solid #22c55e', // Green-500 equivalent
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {user && user.photoURL && !imageError ? (
                    <div style={{ width: '32px', height: '32px', position: 'relative' }}>
                      <Image 
                        src={user.photoURL} 
                        alt="Profile" 
                        width={32} 
                        height={32}
                        className="rounded-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px', color: '#15803d' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
              </button>
              
              {showDropdown && (
                <div 
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: '8px',
                    minWidth: '180px',
                    width: 'auto',
                    whiteSpace: 'nowrap',
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '4px 0',
                    zIndex: 20,
                    border: '1px solid #f3f4f6'
                  }}
                >
                  <Link 
                    href="/dashboard/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                    style={{ display: 'block', padding: '8px 16px', fontSize: '0.875rem', color: '#374151' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleSignOut();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    style={{ 
                      display: 'block', 
                      width: '100%', 
                      textAlign: 'left', 
                      padding: '8px 16px', 
                      fontSize: '0.875rem', 
                      color: '#374151',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={mainContentRef} className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Test Data Manager Modal */}
      {showTestDataManager && (
        <TestDataManager onClose={() => setShowTestDataManager(false)} />
      )}

      {/* Bottom Navigation - Using custom component */}
      <div ref={footerRef}>
        <DashboardNavigation userId={user.uid} />
      </div>
    </div>
  );
} 