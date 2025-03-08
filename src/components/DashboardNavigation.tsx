'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserPlants } from '@/services/plants';
import { CSSProperties } from 'react';

interface DashboardNavigationProps {
  userId: string;
}

export default function DashboardNavigation({ userId }: DashboardNavigationProps) {
  const router = useRouter();
  const [hasPlants, setHasPlants] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPlants = async () => {
      try {
        const plants = await getUserPlants(userId);
        setHasPlants(plants.length > 0);
      } catch (error) {
        console.error('Error checking plants:', error);
        // Default to true in case of error to avoid redirect loops
        setHasPlants(true);
      }
    };

    if (userId) {
      checkPlants();
    }
  }, [userId]);

  const handleHomeClick = (e: React.MouseEvent) => {
    if (hasPlants === false) {
      e.preventDefault();
      e.stopPropagation();
      router.push('/dashboard/add');
    }
  };

  const navLinkStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.75rem 0.5rem',
    color: '#047857', // text-green-700 equivalent
    textDecoration: 'none',
    WebkitTapHighlightColor: 'transparent',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none'
  };

  const grayNavLinkStyle: CSSProperties = {
    ...navLinkStyle,
    color: '#374151', // text-gray-700 equivalent
  };

  const textStyle: CSSProperties = {
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    color: '#1f2937' // text-gray-800 equivalent
  };

  return (
    <nav 
      style={{
        backgroundColor: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderTop: '1px solid #e5e7eb',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden'
      }}
    >
      <div style={{
        maxWidth: '28rem',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          position: 'relative',
          height: '72px'
        }}>
          <Link
            href="/dashboard"
            style={navLinkStyle}
            onClick={handleHomeClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span style={textStyle}>Home</span>
          </Link>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '60px',
            position: 'relative',
            paddingTop: '0.75rem'
          }}>
            <Link
              href="/dashboard/add"
              style={{
                backgroundColor: '#65a30d', // bg-green-600 to match other buttons
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                position: 'absolute',
                zIndex: 20,
                top: '-18px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
            <div style={{ height: '24px' }}></div>
            <span style={textStyle}>
              Add Plant
            </span>
          </div>
          
          <Link
            href="/dashboard/reminders"
            style={grayNavLinkStyle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={textStyle}>Reminders</span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 