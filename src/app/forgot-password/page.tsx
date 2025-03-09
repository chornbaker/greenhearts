'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import FormInput from '@/components/FormInput';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('Password reset email sent! Check your inbox for further instructions.');
      setEmail(''); // Clear the email field after successful submission
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-green-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Logo size="medium" showText={true} className="mx-auto" href="/" />
          <p className="text-gray-700 mt-2">Reset your password</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            label="Email"
          />
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 px-4 rounded-xl hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">
            Remember your password?{' '}
            <Link href="/login" className="text-green-700 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
} 