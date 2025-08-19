import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAssignment, resetAssignmentState, fetchAssignments } from '../../redux/assignment/assignment';
import Cookies from 'js-cookie';
import UserSelect from '../Global/SelectProfile';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Plus, Trash2 } from 'lucide-react';
import PhotoUploader from '../Global/uploader';

const CreateTask = ({ isOpen, onClose, selectedProjectId }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.assignments);
  const [uid] = useState(Cookies.get('userUid') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    assignedPerson: '',
    task: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isCompleted: false,
    projectId: selectedProjectId,
    urls: '',
    status: 'in-progress',
    createdBy: uid,
    comment: '',
    commentUserId: uid,
    issue: '',
    issueUserId: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Update projectId when selectedProjectId changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      projectId: selectedProjectId
    }));
  }, [selectedProjectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleUploadSuccess = (fileUrl) => {
    setUploadedFiles(prev => [...prev, fileUrl]);
  };

  const handleUploadError = (error) => {
    console.error('File upload error:', error);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      assignedPerson: '',
      task: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isCompleted: false,
      projectId: selectedProjectId,
      urls: '',
      status: 'in-progress',
      createdBy: uid,
      comment: '',
      commentUserId: uid,
      issue: '',
      issueUserId: ''
    });
    setUploadedFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submissionData = {
      ...formData,
      urls: uploadedFiles.join(','),
      projectId: selectedProjectId
    };

    console.log('Submitting data:', submissionData);

    // Use optimistic approach - close modal and refresh regardless of response
    try {
      // Fire and forget approach since we know the task is being created
      dispatch(createAssignment(submissionData));
      
      // Close modal immediately
      resetForm();
      onClose();
      
      // Refresh data after a short delay to ensure backend processing
      setTimeout(() => {
        dispatch(fetchAssignments());
      }, 1000);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    dispatch(resetAssignmentState());
    setIsSubmitting(false);
    onClose();
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetAssignmentState());
      setIsSubmitting(false);
    };
  }, [dispatch]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      dispatch(resetAssignmentState());
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Task</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Task Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Description*</label>
              <textarea
                name="task"
                value={formData.task}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Assigned Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To*</label>
              <UserSelect
                value={formData.assignedPerson}
                onChange={(value) => setFormData(prev => ({ ...prev, assignedPerson: value }))}
                disabled={isSubmitting}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                disabled={isSubmitting}
              >
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>                
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
              <DatePicker
                selected={formData.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                className="w-full p-2 border rounded"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
              <DatePicker
                selected={formData.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                className="w-full p-2 border rounded"
                minDate={formData.startDate}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* File Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files</label>
              {!isSubmitting && (
                <PhotoUploader
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                >
                  <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors cursor-pointer">
                    <Plus className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                  </div>
                </PhotoUploader>
              )}

              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {uploadedFiles.map((fileUrl, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm truncate"
                      >
                        {fileUrl.split('/').pop()}
                      </a>
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Success message */}
          {isSubmitting && (
            <div className="mb-4 text-green-500 text-sm">
              Creating task... The modal will close automatically.
            </div>
          )}

          {/* Error message - only show if not submitting */}
          {error && !isSubmitting && (
            <div className="mb-4 text-red-500 text-sm">
              {typeof error === 'string' ? error : 'Failed to create task'}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : (
                <>
                  <Plus size={16} />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;