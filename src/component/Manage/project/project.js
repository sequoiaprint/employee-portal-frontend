
import React, { useState } from 'react';
import { Plus } from 'lucide-react';


const ProjectComponent = () => {
  const project = { 
    id: 1, 
    name: 'E-commerce Platform', 
    client: 'Acme Corp', 
    status: 'In Progress', 
    progress: 75, 
    deadline: '2024-09-30' 
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
        <button className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600">
          <Plus className="h-4 w-4 inline mr-1" />
          New Project
        </button>
      </div>
      
      <div className="border border-gray-200 rounded-md p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium text-gray-900">{project.name}</h4>
            <p className="text-sm text-gray-600">Client: {project.client}</p>
            <p className="text-sm text-gray-600">Deadline: {project.deadline}</p>
          </div>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            {project.status}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{project.progress}% Complete</p>
      </div>
    </div>
  );
};
export default ProjectComponent