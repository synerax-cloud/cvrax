'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { FaGoogle, FaFileAlt } from 'react-icons/fa';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error('Sign in error:', err);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to continue to your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="card animate-slide-up">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="btn btn-google w-full text-base py-3 flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <div className="spinner w-5 h-5" />
            ) : (
              <>
                <FaGoogle className="text-xl" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary-600 font-medium hover:text-primary-700">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-4">By signing in, you get access to:</p>
          <div className="flex items-center justify-center space-x-6">
            <div>✓ LaTeX Templates</div>
            <div>✓ AI Optimization</div>
            <div>✓ Unlimited CVs</div>
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
