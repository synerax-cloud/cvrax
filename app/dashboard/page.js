'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaPlus, FaFile, FaUser, FaBrain, FaCrown } from 'react-icons/fa';

export default function DashboardPage() {
  const { data: session } = useSession();

  const quickActions = [
    {
      title: 'Create New CV',
      description: 'Start from scratch with a template',
      icon: FaPlus,
      href: '/dashboard/cvs/new',
      color: 'primary',
    },
    {
      title: 'Complete Profile',
      description: 'Add your experience and skills',
      icon: FaUser,
      href: '/dashboard/profile',
      color: 'accent',
    },
    {
      title: 'View My CVs',
      description: 'Manage your existing CVs',
      icon: FaFile,
      href: '/dashboard/cvs',
      color: 'green',
    },
    {
      title: 'AI Optimization',
      description: 'Optimize CV for job description',
      icon: FaBrain,
      href: '/dashboard/ai-optimize',
      color: 'purple',
      badge: 'Coming Soon',
    },
  ];

  const stats = [
    { label: 'Total CVs', value: '0', color: 'primary' },
    { label: 'Profile Completion', value: '0%', color: 'green' },
    { label: 'Templates Used', value: '0', color: 'accent' },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          Create professional CVs with LaTeX templates and AI optimization
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                <FaFile className={`text-2xl text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="card card-hover text-center relative"
              >
                {action.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="badge badge-warning text-xs">{action.badge}</span>
                  </div>
                )}
                <div className={`w-16 h-16 bg-${action.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`text-3xl text-${action.color}-600`} />
                </div>
                <h3 className="font-bold mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="card bg-gradient-to-r from-primary-50 to-accent-50">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-bold mb-1">Complete Your Profile</h3>
              <p className="text-sm text-gray-600">
                Add your work experience, education, skills, and projects
              </p>
              <Link href="/dashboard/profile" className="text-sm text-primary-600 font-medium hover:underline mt-2 inline-block">
                Go to Profile →
              </Link>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-bold mb-1">Choose a Template</h3>
              <p className="text-sm text-gray-600">
                Select from our professional LaTeX templates
              </p>
              <Link href="/dashboard/cvs/new" className="text-sm text-primary-600 font-medium hover:underline mt-2 inline-block">
                Browse Templates →
              </Link>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-bold mb-1">Generate Your CV</h3>
              <p className="text-sm text-gray-600">
                Create a beautiful PDF and start applying to jobs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent CVs</h2>
        <div className="card text-center py-12">
          <FaFile className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">You haven't created any CVs yet</p>
          <Link href="/dashboard/cvs/new" className="btn btn-primary">
            Create Your First CV
          </Link>
        </div>
      </div>
    </div>
  );
}
