import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import Cookies from 'js-cookie';
import PhotoUploader from '../../Global/uploader';
import TeamSelect from '../../Global/TeamSelect'; // Adjust import path
import ClientSelect from '../../Global/ClientSelect'; // Adjust import path

const ProjectForm = ({ project, onSubmit, onCancel, operationStatus, operationError }) => {
  const [formData, setFormData] = useState({
    name: '',
    clients: '', // This will now store client ID
    start_date: '',
    expected_end_date: '',
    target_end_date: '',
    status: 'Not Started',
    priority: 'Medium',
    job_no: '',
    assigned_team: '', // This will now store team ID
    goals: '',
    description: '',
    progress: 0,
    urls: []
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [uid] = useState(Cookies.get('userUid') || '');

  // Convert string URLs to array
  const normalizeUrls = (urls) => {
    if (!urls) return [];
    if (Array.isArray(urls)) return urls;
    if (typeof urls === 'string') {
      return urls.split(',').map(url => url.trim()).filter(url => url);
    }
    return [];
  };

  useEffect(() => {
    if (project) {
      const normalizedUrls = normalizeUrls(project.urls);
      
      setFormData({
        name: project.name || '',
        clients: project.clients || '', // Assuming this is already the ID
        start_date: project.start_date || '',
        expected_end_date: project.expected_end_date || '',
        target_end_date: project.target_end_date || '',
        status: project.status || 'Not Started',
        priority: project.priority || 'Medium',
        job_no: project.job_no || '',
        assigned_team: project.assigned_team || '', // Assuming this is already the ID
        goals: project.goals || '',
        description: project.description || '',
        progress: project.progress || 0,
        urls: normalizedUrls
      });
      
      setImageUrls(normalizedUrls);
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamChange = (teamId, team) => {
    setFormData(prev => ({ ...prev, assigned_team: teamId }));
  };

  const handleClientChange = (clientId, client) => {
    setFormData(prev => ({ ...prev, clients: clientId }));
  };

  const handleImageUpload = (url) => {
    setImageUrls(prev => [...prev, url]);
  };

  const removeImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlsToSubmit = imageUrls.join(',');
    onSubmit({ ...formData, urls: urlsToSubmit, created_by: uid });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-900">
          {project ? 'Edit Project' : 'Create New Project'}
        </h4>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      {operationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {operationError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <ClientSelect
              value={formData.clients}
              onChange={handleClientChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target End Date</label>
            <input
              type="date"
              name="target_end_date"
              value={formData.target_end_date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
            <input
              type="text"
              name="job_no"
              value={formData.job_no}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Team</label>
            <TeamSelect
              value={formData.assigned_team}
              onChange={handleTeamChange}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
            <input
              type="number"
              name="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <PhotoUploader 
              onUploadSuccess={handleImageUpload}
              onUploadError={(error) => console.error('Upload error:', error)}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt={`Project ${index}`} className="h-20 w-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={operationStatus === 'loading'}
            className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:bg-orange-300 flex items-center"
          >
            <Save className="h-4 w-4 inline mr-1" />
            {operationStatus === 'loading' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;