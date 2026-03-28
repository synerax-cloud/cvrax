'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { FaGoogle, FaFileAlt, FaCheck } from 'react-icons/fa';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('Failed to sign up. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <FaFileAlt className="text-primary-600 text-3xl" />
            <span className="text-3xl font-bold text-gradient">CVRAX</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Start building professional CVs in minutes</p>
        </div>

        {/* Register Card */}
        <div className="card animate-slide-up">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Benefits List */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <FaCheck className="text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Create unlimited professional CVs</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <FaCheck className="text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Access to LaTeX templates</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <FaCheck className="text-green-500 flex-shrink-0" />
              <span className="text-gray-700">AI-powered job description matching</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <FaCheck className="text-green-500 flex-shrink-0" />
              <span className="text-gray-700">ATS-compatible exports</span>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="btn btn-google w-full text-base py-3 flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <div className="spinner w-5 h-5" />
            ) : (
              <>
                <FaGoogle className="text-xl" />
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          <p className="mt-4 text-xs text-gray-500 text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-600 font-medium hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-primary-600">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
