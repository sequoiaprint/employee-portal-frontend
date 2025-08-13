import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  ProfileHeader,
  PersonalInformation,
  WorkInformation,
  RecentActivity
} from '../../component/Profile';
import { fetchProfile } from '../../redux/profile/profile';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentProfile, loading, error } = useSelector((state) => state.profile);
  const location = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);

  // Extract uid from URL query params
  const queryParams = new URLSearchParams(location.search);
  const uidFromUrl = queryParams.get('uid');

  // Determine which uid to use: URL uid (if provided) or authenticated user's uid
  const targetUid = uidFromUrl || user?.uid;

  // Fetch profile data when component mounts or targetUid changes
  useEffect(() => {
    if (targetUid) {
      dispatch(fetchProfile(targetUid));
    }
  }, [dispatch, targetUid]);

  // Handle success message from EditProfile
  useEffect(() => {
    if (location.state?.message) {
      setShowSuccessMessage(true);
      
      // Clear the message after showing it
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        // Clear the location state
        window.history.replaceState({}, document.title);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);
   
  // Format profile data for components
  const getProfileData = () => {
    if (currentProfile) {
      const fullName = `${currentProfile.firstname || ''} ${currentProfile.lastname || ''}`.trim();

      return {
        name: fullName || user?.name || 'N/A',
        email: currentProfile.email || user?.email || 'N/A',
        phone: currentProfile.phonno || 'N/A',
        department: currentProfile.department || 'N/A',
        position: currentProfile.position || 'N/A',
        location: currentProfile.location || 'N/A',
        joinDate: currentProfile.joindate || 'N/A',
        bio: currentProfile.bio || 'N/A',
        profileImage: currentProfile.profilepicurl || null,
        EmployeeID: currentProfile.uid || 'N/A',
        manager: currentProfile.manager,
        work_schedule: currentProfile.work_schedule
      };
    }

    return {
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@sequoia.com',
      phone: '+1 (555) 123-4567',
      department: 'Engineering',
      position: 'Senior Developer',
      location: 'San Francisco, CA',
      joinDate: 'January 15, 2022',
      bio: 'Passionate software developer with experience in full-stack development.',
      profileImage: null
    };
  };

  const formData = getProfileData();

  if (loading && !currentProfile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading profile</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

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
            {/* <RecentActivity /> */}
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