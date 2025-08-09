import React from 'react';

const PersonalInformation = ({ formData }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <p className="text-gray-900 py-2">{formData.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <p className="text-gray-900 py-2">{formData.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <p className="text-gray-900 py-2">{formData.phone}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <p className="text-gray-900 py-2">{formData.location}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <p className="text-gray-900 py-2">{formData.department}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <p className="text-gray-900 py-2">{formData.position}</p>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <p className="text-gray-900 py-2">{formData.bio}</p>
      </div>
    </div>
  );
};

export default PersonalInformation;