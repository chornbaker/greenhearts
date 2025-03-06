import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#f8f8f5]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-64 w-full">
            <Image 
              src="/images/plants-header.jpg" 
              alt="Plants" 
              fill 
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-3xl font-bold text-white mb-1">GreenHearts</h1>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-6">
              Keep your plants happy and healthy with personalized care reminders and AI-powered recommendations.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Add Plants</span>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Track Care</span>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Get Reminders</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-green-100 rounded-full p-1 mb-6">
              <button className="flex-1 py-2 px-4 text-center text-gray-600 text-sm">
                Get Started
              </button>
              <Link 
                href="/login" 
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-full text-center text-sm flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Try it now
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>© 2024 GreenHearts. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}
