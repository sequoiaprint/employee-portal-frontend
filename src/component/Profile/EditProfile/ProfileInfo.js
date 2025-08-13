// src/component/ProfileInfo.js
import React from 'react';

const ProfileInfo = ({ profileData }) => {
  if (!profileData) {
    return <div className="text-gray-500">No profile data available</div>;
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img
            className="h-16 w-16 rounded-full border-2 border-[#EA7125]"
            src={profileData.profilepicurl || '/default-avatar.png'}
            alt={profileData.name}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{profileData.name}</h2>
          <p className="text-gray-600">{profileData.position}</p>
          <p className="text-sm text-gray-500">Joined {formatDate(profileData.joinDate)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#EA7125] mb-2">Contact Info</h3>
          <p className="text-gray-700">{profileData.email}</p>
          <p className="text-gray-700">{profileData.phone}</p>
          <p className="text-gray-700">{profileData.location}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#EA7125] mb-2">Work Info</h3>
          <p className="text-gray-700">Department: {profileData.department || 'N/A'}</p>
          <p className="text-gray-700">Position: {profileData.position || 'N/A'}</p>
        </div>
      </div>

      {profileData.bio && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#EA7125] mb-2">About</h3>
          <p className="text-gray-700">{profileData.bio}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;