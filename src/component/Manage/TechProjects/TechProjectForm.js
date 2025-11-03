import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Save, Plus, Trash2, Calendar, ExternalLink } from 'lucide-react';
import PhotoUploader from '../../Global/uploader';
import TeamSelect from '../../Global/TeamSelect';
import { createProject, updateProject, resetOperationStatus } from '../../../redux/TechProject/TechProject';

const TechProjectForm = ({ project, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const operationStatus = useSelector(state => state.techProjects.operationStatus);
  const operationError = useSelector(state => state.techProjects.operationError);
  
  const [formData, setFormData] = useState({
    team_id: '',
    project_name: '',
    github_links: [''],
    description: '',
    techstacks: [],
    media: [],
    start_date: '',
    end_date: '',
    status: 'planning'
  });
  const [newTechStack, setNewTechStack] = useState('');
  const [newGithubLink, setNewGithubLink] = useState('');

  useEffect(() => {
    if (project) {
      // Parse string data back to arrays when editing
      setFormData({
        team_id: project.team_id || '',
        project_name: project.project_name || '',
        github_links: Array.isArray(project.github_links) ? project.github_links : 
                     (project.github_links ? JSON.parse(project.github_links) : ['']),
        description: project.description || '',
        techstacks: Array.isArray(project.techstacks) ? project.techstacks : 
                   (project.techstacks ? JSON.parse(project.techstacks) : []),
        media: Array.isArray(project.media) ? project.media : 
              (project.media ? JSON.parse(project.media) : []),
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        status: project.status || 'planning'
      });
    }
  }, [project]);

  // Handle successful operation
  useEffect(() => {
    if (operationStatus === 'succeeded') {
      onSuccess();
    }
  }, [operationStatus, onSuccess]);

  // Reset operation status when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetOperationStatus());
    };
  }, [dispatch]);

  const handleTeamChange = (teamId) => {
    setFormData(prev => ({ ...prev, team_id: teamId }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTechStack = () => {
    if (newTechStack.trim() && !formData.techstacks.includes(newTechStack.trim())) {
      setFormData(prev => ({
        ...prev,
        techstacks: [...prev.techstacks, newTechStack.trim()]
      }));
      setNewTechStack('');
    }
  };

  const handleRemoveTechStack = (index) => {
    setFormData(prev => ({
      ...prev,
      techstacks: prev.techstacks.filter((_, i) => i !== index)
    }));
  };

  const handleAddGithubLink = () => {
    if (newGithubLink.trim()) {
      setFormData(prev => ({
        ...prev,
        github_links: [...prev.github_links, newGithubLink.trim()]
      }));
      setNewGithubLink('');
    }
  };

  const handleRemoveGithubLink = (index) => {
    setFormData(prev => ({
      ...prev,
      github_links: prev.github_links.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateGithubLink = (index, value) => {
    const updatedLinks = [...formData.github_links];
    updatedLinks[index] = value;
    setFormData(prev => ({ ...prev, github_links: updatedLinks }));
  };

  const handleMediaUpload = (files) => {
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...files]
    }));
  };

  const handleRemoveMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.project_name.trim()) {
      alert('Project name is required');
      return;
    }

    if (!formData.team_id) {
      alert('Team selection is required');
      return;
    }
    
    // Convert arrays to JSON strings for database storage
    const submitData = {
      team_id: formData.team_id,
      project_name: formData.project_name.trim(),
      github_links: JSON.stringify(formData.github_links.filter(link => link.trim() !== '')),
      description: formData.description.trim(),
      techstacks: JSON.stringify(formData.techstacks),
      media: JSON.stringify(formData.media),
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: formData.status
    };

    console.log('Submitting data:', submitData);

    if (project) {
      dispatch(updateProject({ id: project.id, projectData: submitData }));
    } else {
      dispatch(createProject(submitData));
    }
  };

  const statusOptions = [
    { value: 'planning', label: 'Planning', color: 'bg-gray-500' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={operationStatus === 'loading'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {operationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {operationError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.project_name}
                onChange={(e) => handleInputChange('project_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter project name"
                disabled={operationStatus === 'loading'}
              />
            </div>

            {/* Team Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Team *
              </label>
              <TeamSelect
                value={formData.team_id}
                onChange={handleTeamChange}
                disabled={operationStatus === 'loading'}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={operationStatus === 'loading'}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={operationStatus === 'loading'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={operationStatus === 'loading'}
                />
              </div>
            </div>

            {/* Tech Stacks */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tech Stacks
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTechStack}
                  onChange={(e) => setNewTechStack(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechStack())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Add tech stack (e.g., React, Node.js)"
                  disabled={operationStatus === 'loading'}
                />
                <button
                  type="button"
                  onClick={handleAddTechStack}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300"
                  disabled={operationStatus === 'loading'}
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.techstacks.map((tech, index) => (
                  <div
                    key={index}
                    className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTechStack(index)}
                      className="text-orange-600 hover:text-orange-800"
                      disabled={operationStatus === 'loading'}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* GitHub Links */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Links
              </label>
              {formData.github_links.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleUpdateGithubLink(index, e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://github.com/username/repo"
                      disabled={operationStatus === 'loading'}
                    />
                  </div>
                  {formData.github_links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGithubLink(index)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300"
                      disabled={operationStatus === 'loading'}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddGithubLink}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-300 flex items-center gap-2"
                disabled={operationStatus === 'loading'}
              >
                <Plus size={16} />
                Add GitHub Link
              </button>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the project, its goals, and features..."
                disabled={operationStatus === 'loading'}
              />
            </div>

            {/* Media Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Media
              </label>
              <PhotoUploader
                onFilesUpload={handleMediaUpload}
                disabled={operationStatus === 'loading'}
              />
              {formData.media.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.media.map((file, index) => (
                    <div key={index} className="relative group">
                      {typeof file === 'string' && file.startsWith('http') ? (
                        <img
                          src={file}
                          alt={`Project media ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-sm">File</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={operationStatus === 'loading'}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={operationStatus === 'loading'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={operationStatus === 'loading'}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300 flex items-center gap-2"
            >
              {operationStatus === 'loading' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {project ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {project ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechProjectForm;