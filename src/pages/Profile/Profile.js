import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  ProfileHeader,
  PersonalInformation,
  WorkInformation,
  RecentActivity
} from '../../component/Profile';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Get profile data from localStorage or use defaults
  const getProfileData = () => {
    // const savedProfile = localStorage.getItem('userProfile');
    // if (savedProfile) {
    //   return JSON.parse(savedProfile);
    // }
    return {
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@sequoia.com',
      phone: '+1 (555) 123-4567',
      department: 'Engineering',
      position: 'Senior Developer',
      location: 'San Francisco, CA',
      joinDate: 'January 15, 2022',
      bio: 'Passionate software developer with 5+ years of experience in full-stack development. Love creating efficient and scalable solutions.',
      profileImage: null
    };
  };

  const [formData, setFormData] = useState(getProfileData());

  // Handle success message from EditProfile
  useEffect(() => {
    if (location.state?.message) {
      setShowSuccessMessage(true);
      if (location.state?.updatedData) {
        setFormData(location.state.updatedData);
      }
      
      // Clear the message after showing it
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        // Clear the location state
        window.history.replaceState({}, document.title);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Update profile data when localStorage changes (in case of external updates)
  useEffect(() => {
    const handleStorageChange = () => {
      setFormData(getProfileData());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-fade-in">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">{location.state?.message}</p>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <ProfileHeader formData={formData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PersonalInformation formData={formData} />
          </div>

          <div className="space-y-6">
            <WorkInformation formData={formData} />
            <RecentActivity />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;
