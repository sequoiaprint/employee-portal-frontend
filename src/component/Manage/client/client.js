import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const ClientComponent = () => {
  const client = { 
    id: 1, 
    name: 'Acme Corp', 
    email: 'contact@acme.com', 
    phone: '+1-555-0123', 
    status: 'Active' 
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Client Management</h3>
        <button className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600">
          <Plus className="h-4 w-4 inline mr-1" />
          Add Client
        </button>
      </div>
      
      <div className="border border-gray-200 rounded-md p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-900">{client.name}</h4>
            <p className="text-sm text-gray-600">{client.email}</p>
            <p className="text-sm text-gray-600">{client.phone}</p>
          </div>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            {client.status}
          </span>
        </div>
      </div>
    </div>
  );
};
export default ClientComponent