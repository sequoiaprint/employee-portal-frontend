import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';

const ProfileHeader = ({ formData }) => {
  const navigate = useNavigate();
  console.log(formData)

  const handleEditClick = () => {
    navigate('/profile/edit');
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
          <ProfileAvatar 
            image={formData.profileImage}
            name={formData.name}
            size="large"
            showBorder={true}
          />
          <div className="text-white mt-4 sm:mt-0">
            <h1 className="text-3xl font-bold mb-2">{formData.name}</h1>
            <p className="text-orange-100 text-lg">{formData.position}</p>
            <p className="text-orange-200 text-sm">{formData.department}</p>
          </div>
        </div>
      </div>
      
      <div className="px-8 py-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-8 justify-center sm:justify-start">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-600">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">2.5k</p>
              <p className="text-sm text-gray-600">Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
          <button
            onClick={handleEditClick}
            className="w-full sm:w-auto bg-gradient-to-r from-[#EA7125] to-[#F58E3F] text-white px-6 py-2 rounded-lg hover:from-[#F58E3F] hover:to-[#EA7125] transition-all duration-200 font-semibold shadow-md"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;