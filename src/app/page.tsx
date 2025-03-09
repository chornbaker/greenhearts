'use client';

import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f8f5]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/landing/hero-bg-better.jpg" 
            alt="Beautiful houseplants" 
            fill 
            style={{ objectFit: 'cover' }}
            priority
            className="brightness-[0.9]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-6 flex justify-center">
            <Logo size="large" showText={true} vertical={true} className="text-white" />
          </div>
          
          <h2 className="text-white text-2xl md:text-3xl font-light mb-8 leading-relaxed text-shadow">
            Keep your plants happy and healthy with personalized care reminders and AI-powered recommendations
          </h2>
          
          <div className="flex flex-col items-center gap-4 mt-8">
            <Link 
              href="/signup" 
              className="bg-green-600 hover:bg-green-700 text-white py-4 px-10 rounded-full text-xl font-medium transition-all shadow-lg hover:shadow-xl w-full max-w-xs"
            >
              Get Started
            </Link>
            <p className="text-white text-shadow">
              Already have an account? <Link href="/login" className="text-white underline hover:text-green-200 font-medium">Sign In</Link>
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <button 
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="animate-bounce bg-white p-2 w-10 h-10 ring-1 ring-slate-200 shadow-lg rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50"
            aria-label="Scroll to features"
          >
            <svg className="w-6 h-6 text-green-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </button>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-green-700 mb-16">
            How GreenHearts Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all hover:scale-105">
              <div className="h-48 relative">
                <Image 
                  src="/images/landing/feature-1.jpg" 
                  alt="Add your plants" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-700 text-center mb-2">Add Your Plants</h3>
                <p className="text-gray-600 text-center">
                  Easily add your plants with basic information and photos. Our AI will suggest personalized care routines.
                </p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all hover:scale-105">
              <div className="h-48 relative">
                <Image 
                  src="/images/landing/feature-2.jpg" 
                  alt="Track plant care" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-700 text-center mb-2">Track Care</h3>
                <p className="text-gray-600 text-center">
                  Log watering and care activities with a simple tap. Monitor your plants&apos; health and growth over time.
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all hover:scale-105">
              <div className="h-48 relative">
                <Image 
                  src="/images/landing/feature-3.jpg" 
                  alt="Get reminders" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-700 text-center mb-2">Get Reminders</h3>
                <p className="text-gray-600 text-center">
                  Receive timely reminders for watering and care. Sync with your calendar to never forget plant care again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Plant Testimonials Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/landing/testimonial-bg.jpg" 
            alt="Plants background" 
            fill 
            style={{ objectFit: 'cover' }}
            className="opacity-20"
          />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-green-700 mb-16">
            What Our Plants Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Plant Testimonial 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold">🌿</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-700">Fern Gully</h4>
                  <p className="text-sm text-gray-500">Boston Fern</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;Ever since my human started using GreenHearts, I&apos;ve been getting the perfect amount of water! No more drowning or drought for me. My fronds have never looked better!&quot;
              </p>
            </div>
            
            {/* Plant Testimonial 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold">🌵</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-700">Spike</h4>
                  <p className="text-sm text-gray-500">Cactus</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;As a desert dweller, I hate being overwatered. Thanks to GreenHearts, my human finally understands I only need water once a month! I&apos;m no longer sitting in soggy soil!&quot;
              </p>
            </div>
            
            {/* Plant Testimonial 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold">🍃</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-700">Monty</h4>
                  <p className="text-sm text-gray-500">Monstera Deliciosa</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;I used to be so neglected, but now my human gets reminders to check on me! My new leaves are huge and I&apos;ve got so many beautiful fenestrations. GreenHearts saved my life!&quot;
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Give Your Plants Some Love?</h2>
          <p className="text-xl mb-8 opacity-90 italic">
            &quot;We plants have been waiting for someone to understand our needs! With GreenHearts, your leafy friends will finally get the care they deserve. We&apos;re rooting for you to join!&quot;
          </p>
          <Link 
            href="/signup" 
            className="inline-block bg-white text-green-700 hover:bg-gray-100 py-4 px-10 rounded-full text-xl font-medium transition-all shadow-lg hover:shadow-xl"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Logo size="small" showText={true} />
            </div>
            
            <div className="text-gray-400 font-light italic tracking-wide">
              Created with love by Charles for Kristen
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2025 GreenHearts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
