import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Plus, Trash2, Check, ChevronUp, ChevronDown, CheckCircle, Circle, Printer } from 'lucide-react';
import Cookies from 'js-cookie';
import PhotoUploader from '../../Global/uploader';
import TeamSelect from '../../Global/TeamSelect';
import ClientSelect from '../../Global/ClientSelect';

const ProjectForm = ({ project, onSubmit, onCancel, operationStatus, operationError }) => {
  const [formData, setFormData] = useState({
    name: '',
    clients: '',
    start_date: '',
    expected_end_date: '',
    target_end_date: '',
    status: 'Not Started',
    priority: 'Medium',
    job_no: '',
    assigned_team: '',
    goals: '',
    description: '',
    urls: [],
    milestones: [],
    milestones_status: [],
    isPrintProject: 0 // New field for print option
  });
  const [imageUrls, setImageUrls] = useState([]);
  const [uid] = useState(Cookies.get('userUid') || '');
  const [isGeneratingMilestones, setIsGeneratingMilestones] = useState(false);
  const [milestoneError, setMilestoneError] = useState(null);
  const [newMilestone, setNewMilestone] = useState('');
  const [generatedMilestones, setGeneratedMilestones] = useState([]);
  const [showGeneratedMilestones, setShowGeneratedMilestones] = useState(false);

  const normalizeUrls = (urls) => {
    if (!urls) return [];
    if (Array.isArray(urls)) return urls;
    if (typeof urls === 'string') {
      return urls.split(',').map(url => url.trim()).filter(url => url);
    }
    return [];
  };

  const normalizeMilestones = (milestones) => {
    if (!milestones) return [];
    if (Array.isArray(milestones)) return milestones;
    if (typeof milestones === 'string') {
      return milestones.split(',').map(milestone => milestone.trim()).filter(milestone => milestone);
    }
    return [];
  };

  const normalizeMilestoneStatus = (statuses) => {
    if (!statuses) return [];
    if (Array.isArray(statuses)) return statuses.map(status => parseInt(status));
    if (typeof statuses === 'string') {
      return statuses.split(',').map(status => parseInt(status.trim())).filter(status => !isNaN(status));
    }
    return [];
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const formatDateForBackend = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setHours(12, 0, 0, 0);
    return date.toISOString();
  };

  useEffect(() => {
    if (project) {
      const normalizedUrls = normalizeUrls(project.urls);
      const normalizedMilestones = normalizeMilestones(project.milestones);
      const normalizedStatuses = normalizeMilestoneStatus(project.milestones_status);
      
      // Ensure status array matches milestone array length
      const statusArray = normalizedMilestones.map((_, index) => 
        normalizedStatuses[index] !== undefined ? normalizedStatuses[index] : 0
      );
      
      setFormData({
        name: project.name || '',
        clients: project.clients || '',
        start_date: formatDateForInput(project.start_date),
        expected_end_date: formatDateForInput(project.expected_end_date),
        target_end_date: formatDateForInput(project.target_end_date),
        status: project.status || 'Not Started',
        priority: project.priority || 'Medium',
        job_no: project.job_no || '',
        assigned_team: project.assigned_team || '',
        goals: project.goals || '',
        description: project.description || '',
        urls: normalizedUrls,
        milestones: normalizedMilestones,
        milestones_status: statusArray,
        isPrintProject: project.isPrintProject || 0 // Set existing value or default to 0
      });
      
      setImageUrls(normalizedUrls);
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamChange = (teamId) => {
    setFormData(prev => ({ ...prev, assigned_team: teamId }));
  };

  const handleClientChange = (clientId) => {
    setFormData(prev => ({ ...prev, clients: clientId }));
  };

  const handleImageUpload = (url) => {
    setImageUrls(prev => [...prev, url]);
  };

  const removeImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Manual milestone functions
  const addManualMilestone = () => {
    if (!newMilestone.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone.trim()],
      milestones_status: [...prev.milestones_status, 0] // New milestones start as incomplete
    }));
    setNewMilestone('');
  };

  const deleteMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
      milestones_status: prev.milestones_status.filter((_, i) => i !== index)
    }));
  };

  const editMilestone = (index, newText) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? newText : milestone
      )
    }));
  };

  const toggleMilestoneStatus = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones_status: prev.milestones_status.map((status, i) => 
        i === index ? (status === 1 ? 0 : 1) : status
      )
    }));
  };

  const moveMilestoneUp = (index) => {
    if (index === 0) return; // Can't move first item up
    
    setFormData(prev => {
      const newMilestones = [...prev.milestones];
      const newStatuses = [...prev.milestones_status];
      
      // Swap milestones
      [newMilestones[index - 1], newMilestones[index]] = [newMilestones[index], newMilestones[index - 1]];
      // Swap statuses
      [newStatuses[index - 1], newStatuses[index]] = [newStatuses[index], newStatuses[index - 1]];
      
      return { 
        ...prev, 
        milestones: newMilestones,
        milestones_status: newStatuses
      };
    });
  };

  const moveMilestoneDown = (index) => {
    if (index === formData.milestones.length - 1) return; // Can't move last item down
    
    setFormData(prev => {
      const newMilestones = [...prev.milestones];
      const newStatuses = [...prev.milestones_status];
      
      // Swap milestones
      [newMilestones[index], newMilestones[index + 1]] = [newMilestones[index + 1], newMilestones[index]];
      // Swap statuses
      [newStatuses[index], newStatuses[index + 1]] = [newStatuses[index + 1], newStatuses[index]];
      
      return { 
        ...prev, 
        milestones: newMilestones,
        milestones_status: newStatuses
      };
    });
  };

  // AI milestone generation functions
  const generateMilestones = async () => {
    if (!formData.goals && !formData.description) {
      setMilestoneError('Please enter project goals or description to generate milestones');
      return;
    }

    setIsGeneratingMilestones(true);
    setMilestoneError(null);

    try {
      const response = await fetch('https://internalApi.sequoia-print.com/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectDescription: `${formData.goals}\n${formData.description}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate milestones');
      }

      const data = await response.json();
      setGeneratedMilestones(data.milestones || []);
      setShowGeneratedMilestones(true);
    } catch (error) {
      console.error('Error generating milestones:', error);
      setMilestoneError('Failed to generate milestones. Please try again.');
    } finally {
      setIsGeneratingMilestones(false);
    }
  };

  const confirmGeneratedMilestone = (milestone) => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, milestone],
      milestones_status: [...prev.milestones_status, 0] // AI milestones start as incomplete
    }));
    setGeneratedMilestones(prev => prev.filter(m => m !== milestone));
  };

  const confirmAllGeneratedMilestones = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, ...generatedMilestones],
      milestones_status: [...prev.milestones_status, ...generatedMilestones.map(() => 0)] // All start as incomplete
    }));
    setGeneratedMilestones([]);
    setShowGeneratedMilestones(false);
  };

  const discardGeneratedMilestones = () => {
    setGeneratedMilestones([]);
    setShowGeneratedMilestones(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlsToSubmit = imageUrls.join(',');
    
    // Convert milestones and statuses to comma-separated strings
    const milestonesToSubmit = formData.milestones.join(',');
    const statusesToSubmit = formData.milestones_status.join(',');
    
    // For new projects, ensure first milestone is marked as started (1) if milestones exist
    let finalStatuses = [...formData.milestones_status];
    if (!project && finalStatuses.length > 0) {
      finalStatuses[0] = 1; // Mark first milestone as started for new projects
    }
    
    const dataToSubmit = {
      urls: urlsToSubmit,
      name: formData.name,
      start_date: formatDateForBackend(formData.start_date),
      expected_end_date: formatDateForBackend(formData.expected_end_date),
      status: formData.status,
      priority: formData.priority,
      end_date: null, // Set when project is completed
      job_no: formData.job_no,
      assigned_team: formData.assigned_team,
      clients: formData.clients,
      target_end_date: formatDateForBackend(formData.target_end_date),
      goals: formData.goals,
      description: formData.description,
      created_by: uid,
      milestones: milestonesToSubmit,
      milestones_status: finalStatuses.join(','),
      isPrintProject: parseInt(formData.isPrintProject) // Ensure it's an integer
    };
    
    onSubmit(dataToSubmit);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected End Date</label>
            <input
              type="date"
              name="expected_end_date"
              value={formData.expected_end_date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
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
          
          {/* Print Project Option */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Print Project</label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="isPrintProject"
                  value="1"
                  checked={formData.isPrintProject == 1}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-orange-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="isPrintProject"
                  value="0"
                  checked={formData.isPrintProject == 0}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-orange-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>
          
          {/* <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="2"
            />
          </div> */}
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
          
          {/* Milestones Section */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Milestones</label>
              <button
                type="button"
                onClick={generateMilestones}
                disabled={isGeneratingMilestones}
                className="text-sm flex items-center text-orange-600 hover:text-orange-800 disabled:text-orange-300"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {isGeneratingMilestones ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            
            {milestoneError && (
              <div className="text-red-500 text-sm mb-2">{milestoneError}</div>
            )}

            {/* Add Manual Milestone */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a milestone manually..."
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addManualMilestone();
                  }
                }}
              />
              <button
                type="button"
                onClick={addManualMilestone}
                disabled={!newMilestone.trim()}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 flex items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Current Milestones */}
            {formData.milestones.length > 0 && (
              <div className="border border-gray-200 rounded-md p-3 bg-white mb-3">
                <h6 className="font-medium text-gray-800 mb-2 text-sm">Project Milestones</h6>
                <div className="space-y-2">
                  {formData.milestones.map((milestone, index) => (
                    <MilestoneItem
                      key={index}
                      milestone={milestone}
                      index={index}
                      status={formData.milestones_status[index] || 0}
                      totalMilestones={formData.milestones.length}
                      onEdit={(newText) => editMilestone(index, newText)}
                      onDelete={() => deleteMilestone(index)}
                      onMoveUp={() => moveMilestoneUp(index)}
                      onMoveDown={() => moveMilestoneDown(index)}
                      onToggleStatus={() => toggleMilestoneStatus(index)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Generated Milestones for Review */}
            {showGeneratedMilestones && generatedMilestones.length > 0 && (
              <div className="border border-orange-200 rounded-md p-3 bg-orange-50 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <h6 className="font-medium text-orange-800 text-sm">AI Generated Milestones</h6>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={confirmAllGeneratedMilestones}
                      className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Add All
                    </button>
                    <button
                      type="button"
                      onClick={discardGeneratedMilestones}
                      className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Discard
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {generatedMilestones.map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                      <span className="text-sm text-gray-800 flex-1">{milestone}</span>
                      <button
                        type="button"
                        onClick={() => confirmGeneratedMilestone(milestone)}
                        className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                        title="Add this milestone"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {formData.milestones.length === 0 && !showGeneratedMilestones && (
              <div className="text-gray-500 text-sm italic border border-gray-200 rounded-md p-3 bg-gray-50">
                No milestones added yet. Add them manually or generate with AI.
              </div>
            )}
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

// Individual Milestone Item Component (unchanged)
const MilestoneItem = ({ milestone, index, status, totalMilestones, onEdit, onDelete, onMoveUp, onMoveDown, onToggleStatus }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(milestone);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(milestone);
    setIsEditing(false);
  };

  const canMoveUp = index > 0;
  const canMoveDown = index < totalMilestones - 1;
  const isCompleted = status === 1;

  return (
    <div className={`flex items-center justify-between p-2 rounded border group hover:bg-gray-100 ${
      isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    }`}>
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-1 p-1 border border-gray-300 rounded text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={handleSaveEdit}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="p-1 text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-gray-500 font-mono w-6 text-center">
              {index + 1}.
            </span>
            <button
              type="button"
              onClick={onToggleStatus}
              className={`p-1 rounded ${
                isCompleted 
                  ? 'text-green-600 hover:text-green-800' 
                  : 'text-gray-400 hover:text-green-600'
              }`}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </button>
            <span 
              className={`text-sm flex-1 cursor-pointer hover:text-orange-600 ${
                isCompleted ? 'line-through text-gray-600' : 'text-gray-800'
              }`}
              onClick={() => setIsEditing(true)}
            >
              {milestone}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Move Up Button */}
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`p-1 rounded ${
                canMoveUp 
                  ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-100' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            
            {/* Move Down Button */}
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`p-1 rounded ${
                canMoveDown 
                  ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-100' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {/* Delete Button */}
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
              title="Delete milestone"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectForm;