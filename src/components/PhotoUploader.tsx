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
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

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

  // Handle clicks outside the options menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    setShowOptions(false);
    
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

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Trigger camera input click
  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  // Toggle options menu
  const toggleOptions = () => {
    setShowOptions(!showOptions);
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
            
            <div className="relative" ref={optionsRef}>
              <button
                type="button"
                onClick={toggleOptions}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                style={{
                  WebkitAppearance: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Add Photo
              </button>
              
              {showOptions && (
                <div 
                  className="absolute mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                  style={{
                    width: '200px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    WebkitTransform: 'translateX(-50%)'
                  }}
                >
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {/* Take Photo option */}
                    <button
                      type="button"
                      onClick={handleCameraClick}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      style={{
                        WebkitAppearance: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      <span>Take Photo</span>
                    </button>
                    
                    {/* Choose from Library option */}
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      style={{
                        WebkitAppearance: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                      </svg>
                      <span>Choose from Library</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Add photo from device"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Take photo with camera"
            />
          </div>
        )}
      </div>
    </div>
  );
} 