'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { FaSave, FaSpinner, FaCheckCircle, FaBriefcase, FaGraduationCap, FaCode, FaProjectDiagram, FaUpload } from 'react-icons/fa';
import PersonalInfoForm from '@/components/profile/PersonalInfoForm';
import ExperienceSection from '@/components/profile/ExperienceSection';
import EducationSection from '@/components/profile/EducationSection';
import SkillsSection from '@/components/profile/SkillsSection';
import ProjectsSection from '@/components/profile/ProjectsSection';
import CVUploadModal from '@/components/profile/CVUploadModal';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: FaCheckCircle },
    { id: 'experience', name: 'Experience', icon: FaBriefcase },
    { id: 'education', name: 'Education', icon: FaGraduationCap },
    { id: 'skills', name: 'Skills', icon: FaCode },
    { id: 'projects', name: 'Projects', icon: FaProjectDiagram },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        console.log('Profile fetched:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCVParsed = async (responseData) => {
    console.log('CV parsed, response:', responseData);
    setShowUploadModal(false);
    
    // Wait a moment for DB to commit, then refetch
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchProfile();
    
    showSaved();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-600">
            Complete your profile to generate professional CVs
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn btn-outline flex items-center space-x-2"
        >
          <FaUpload />
          <span>Import from CV</span>
        </button>
      </div>

      {/* Save Notification */}
      {saved && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-down z-50 flex items-center space-x-2">
          <FaCheckCircle />
          <span>Changes saved successfully!</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
          <span className="text-sm font-medium text-primary-600">45%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Complete all sections to unlock full CV generation features
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-1 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">

      {/* CV Upload Modal */}
      {showUploadModal && (
        <CVUploadModal
          onClose={() => setShowUploadModal(false)}
          onParsed={handleCVParsed}
        />
      )}
        {activeTab === 'personal' && (
          <PersonalInfoForm profile={profile} onSave={showSaved} onUpdate={fetchProfile} />
        )}
        {activeTab === 'experience' && (
          <ExperienceSection profile={profile} onSave={showSaved} onUpdate={fetchProfile} />
        )}
        {activeTab === 'education' && (
          <EducationSection profile={profile} onSave={showSaved} onUpdate={fetchProfile} />
        )}
        {activeTab === 'skills' && (
          <SkillsSection profile={profile} onSave={showSaved} onUpdate={fetchProfile} />
        )}
        {activeTab === 'projects' && (
          <ProjectsSection profile={profile} onSave={showSaved} onUpdate={fetchProfile} />
        )}
      </div>
    </div>
  );
}
