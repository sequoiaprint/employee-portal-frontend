
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const LeaveComplainComponent = () => {
  const request = { 
    id: 1, 
    employee: 'John Doe', 
    type: 'Leave', 
    subject: 'Annual Leave Request', 
    date: '2024-08-15', 
    status: 'Pending' 
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Leave & Complaints</h3>
        <button className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600">
          <Plus className="h-4 w-4 inline mr-1" />
          New Request
        </button>
      </div>
      
      <div className="border border-gray-200 rounded-md p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-900">{request.subject}</h4>
            <p className="text-sm text-gray-600">By: {request.employee}</p>
            <p className="text-sm text-gray-600">Date: {request.date}</p>
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mt-2">
              {request.type}
            </span>
          </div>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
            {request.status}
          </span>
        </div>
      </div>
    </div>
  );
};
export default LeaveComplainComponent