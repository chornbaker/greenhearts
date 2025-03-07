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
            src="/images/landing/hero-bg.jpg" 
            alt="Beautiful plants background" 
            fill 
            style={{ objectFit: 'cover' }}
            priority
            className="brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-8 flex justify-center">
            <Logo size="large" showText={true} vertical={true} className="text-white" />
          </div>
          
          <h2 className="text-white text-2xl md:text-3xl font-light mb-6 leading-relaxed">
            Keep your plants happy and healthy with personalized care reminders and AI-powered recommendations
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link 
              href="/signup" 
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="bg-white hover:bg-gray-100 text-green-700 py-3 px-8 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <div className="animate-bounce bg-white p-2 w-10 h-10 ring-1 ring-slate-200 shadow-lg rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-700" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
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
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto -mt-14 border-4 border-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Add Your Plants</h3>
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
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto -mt-14 border-4 border-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Track Care</h3>
                <p className="text-gray-600 text-center">
                  Log watering and care activities with a simple tap. Monitor your plants' health and growth over time.
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
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto -mt-14 border-4 border-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Get Reminders</h3>
                <p className="text-gray-600 text-center">
                  Receive timely reminders for watering and care. Sync with your calendar to never forget plant care again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
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
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            What Plant Lovers Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold">S</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Sarah K.</h4>
                  <p className="text-sm text-gray-500">Plant Enthusiast</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "GreenHearts has transformed how I care for my plants. The reminders are so helpful, and I love the personalized care tips!"
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold">M</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Michael T.</h4>
                  <p className="text-sm text-gray-500">Apartment Gardener</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "As a beginner, I was killing all my plants before finding GreenHearts. Now my apartment is thriving with healthy greenery!"
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-700 font-bold">J</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Jamie L.</h4>
                  <p className="text-sm text-gray-500">Plant Collector</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "With over 50 plants, keeping track of watering schedules was impossible until I found GreenHearts. Now it's all automated!"
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Give Your Plants Some Love?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of plant lovers who have transformed their plant care routine with GreenHearts.
          </p>
          <Link 
            href="/signup" 
            className="inline-block bg-white text-green-700 hover:bg-gray-100 py-3 px-8 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl"
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
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <Link href="/about" className="text-gray-600 hover:text-green-700">About</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-green-700">Privacy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-green-700">Terms</Link>
              <Link href="/contact" className="text-gray-600 hover:text-green-700">Contact</Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2024 GreenHearts. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
