'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaFileAlt, FaUser, FaCog, FaSignOutAlt, FaPlus, 
  FaBars, FaTimes, FaHome, FaFile, FaCrown
} from 'react-icons/fa';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the dashboard</p>
          <Link href="/auth/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FaHome },
    { name: 'My CVs', href: '/dashboard/cvs', icon: FaFile },
    { name: 'Profile', href: '/dashboard/profile', icon: FaUser },
    { name: 'Settings', href: '/dashboard/settings', icon: FaCog },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <FaFileAlt className="text-primary-600 text-2xl" />
              <span className="text-xl font-bold text-gradient">CVRAX</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/cvs/new" className="btn btn-primary hidden md:flex items-center space-x-2">
                <FaPlus />
                <span>New CV</span>
              </Link>
              
              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <img
                  src={session?.user?.image || '/default-avatar.png'}
                  alt={session?.user?.name || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hidden md:flex items-center space-x-2 text-sm text-gray-700 hover:text-primary-600"
                  title="Sign out"
                >
                  <FaSignOutAlt />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-700 hover:text-primary-600"
              >
                {isMobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-slide-down">
          <div className="container-custom py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Link
              href="/dashboard/cvs/new"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium bg-primary-600 text-white"
            >
              <FaPlus className="text-lg" />
              <span>New CV</span>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Subscription Banner */}
        {session?.user?.subscriptionStatus === 'FREE' && (
          <div className="mb-6 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaCrown className="text-2xl" />
              <div>
                <p className="font-medium">Upgrade to Premium</p>
                <p className="text-sm opacity-90">Unlock all templates and AI features</p>
              </div>
            </div>
            <Link href="/dashboard/settings" className="btn bg-white text-primary-600 hover:bg-gray-100">
              Upgrade
            </Link>
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
}
