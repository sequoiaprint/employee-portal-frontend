// components/ProjectList.js
import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const statusIcons = {
  'Not Started': <Clock className="h-4 w-4 inline mr-1" />,
  'In Progress': <AlertCircle className="h-4 w-4 inline mr-1 text-yellow-500" />,
  'Completed': <CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />,
};

const priorityColors = {
  'High': 'bg-red-100 text-red-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Low': 'bg-green-100 text-green-800',
};

const ProjectList = ({ projects, status, error, onEdit, onDelete }) => {
  if (status === 'loading') return <div>Loading projects...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;
  if (projects.length === 0) return <div>No projects found</div>;

  return (
    <div className="space-y-4">
      {projects.map(project => (
        <div key={project.id} className="border border-gray-200 rounded-md p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-medium text-gray-900">{project.name}</h4>
              <p className="text-sm text-gray-600">Client: {project.clients}</p>
              <p className="text-sm text-gray-600">
                Dates: {project.start_date} to {project.target_end_date}
              </p>
              <p className="text-sm text-gray-600">Job #: {project.job_no}</p>
            </div>
            <div className="flex space-x-2">
              <span className={`${priorityColors[project.priority]} px-2 py-1 rounded-full text-xs`}>
                {project.priority}
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {statusIcons[project.status]} {project.status}
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div 
              className="bg-orange-500 h-2 rounded-full" 
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">{project.progress || 0}% Complete</p>
            <div className="space-x-2">
              <button 
                onClick={() => onEdit(project)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(project.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;