import React from 'react';

const WorkInformation = ({ formData }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Work Information</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Join Date</p>
          <p className="font-medium text-gray-900">{formData.joinDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Employee ID</p>
          <p className="font-medium text-gray-900">EMP-2024-001</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Manager</p>
          <p className="font-medium text-gray-900">Sarah Johnson</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Work Schedule</p>
          <p className="font-medium text-gray-900">Mon - Fri, 9:00 AM - 6:00 PM</p>
        </div>
      </div>
    </div>
  );
};

export default WorkInformation;