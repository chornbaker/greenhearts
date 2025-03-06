import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-green-100">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold text-green-800 mb-6">
          Welcome to GreenHearts
        </h1>
        <p className="text-xl text-green-700 mb-8">
          Keep your plants happy and healthy with personalized care reminders and AI-powered recommendations.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-white text-green-700 rounded-lg shadow-md hover:shadow-lg transition-all border border-green-200"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-green-700"
          >
            Sign Up
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-700 mb-3">Track Your Plants</h2>
            <p className="text-gray-600">
              Add your plants to your collection and keep track of their watering schedules and health.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-700 mb-3">Get Reminders</h2>
            <p className="text-gray-600">
              Never forget to water your plants again with customized watering reminders.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-700 mb-3">AI Recommendations</h2>
            <p className="text-gray-600">
              Receive personalized care recommendations powered by Claude AI.
            </p>
          </div>
        </div>
        
        <p className="text-green-600 italic">
          Note: This is a placeholder page. The app is currently in development.
        </p>
      </div>
    </main>
  );
}
