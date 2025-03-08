'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CSSProperties } from 'react';

interface PhotoUploaderProps {
  onPhotoSelected: (file: File) => void;
  onPhotoRemoved: () => void;
  currentPhotoUrl?: string;
  aspectRatio?: 'square' | '4:3' | '16:9';
}

export default function PhotoUploader({
  onPhotoSelected,
  onPhotoRemoved,
  currentPhotoUrl,
  aspectRatio = 'square'
}: PhotoUploaderProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Set aspect ratio styles
  const getAspectRatio = (): CSSProperties => {
    switch (aspectRatio) {
      case '4:3':
        return { paddingBottom: '75%' }; // 4:3 aspect ratio
      case '16:9':
        return { paddingBottom: '56.25%' }; // 16:9 aspect ratio
      case 'square':
      default:
        return { paddingBottom: '100%' }; // 1:1 aspect ratio
    }
  };

  // Detect if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    
    // Also check on resize in case of responsive mode changes
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handlePhotoSelected(file);
    }
    // Reset the input value so the same file can be selected again if needed
    e.target.value = '';
  };

  // Process the selected photo
  const handlePhotoSelected = (file: File) => {
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create a URL for the selected image
    const objectUrl = URL.createObjectURL(file);
    setPhotoUrl(objectUrl);
    
    // Call the parent component's handler
    onPhotoSelected(file);

    // Clean up the object URL when it's no longer needed
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Handle photo removal
  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    onPhotoRemoved();
  };

  // Handle Add Photo button click
  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div 
        className="relative w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden"
        style={{ ...getAspectRatio() }}
      >
        {photoUrl ? (
          // Photo preview
          <div className="absolute inset-0">
            <Image 
              src={photoUrl}
              alt="Selected photo" 
              fill 
              className="object-cover"
            />
            <div className="absolute top-2 right-2 z-30">
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="bg-white bg-opacity-70 text-gray-700 p-2 rounded-full hover:bg-opacity-100 transition-all"
                aria-label="Remove photo"
                style={{
                  WebkitAppearance: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          // Upload UI
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="text-gray-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center mb-3">
              Add a photo of your plant
            </p>
            
            <button
              type="button"
              onClick={handleAddPhotoClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              style={{
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {isMobile ? (
                // Camera icon for mobile
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              ) : (
                // File icon for desktop
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                </svg>
              )}
              Add Photo
            </button>
            
            {/* Hidden file input - accepts all image types on mobile, just files on desktop */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture={isMobile ? "environment" : undefined}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Add photo"
            />
          </div>
        )}
      </div>
    </div>
  );
} 