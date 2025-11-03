import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, X, Filter, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import {
  fetchProjects,
  selectAllTechProjects,
  selectTechProjectsStatus,
  selectTechProjectsError,
  resetOperationStatus,
  clearError
} from '../../../redux/TechProject/TechProject';
import TechProjectForm from './TechProjectForm';
import TechProjectList from './TechProjectList';

const TechProjects = () => {
  const dispatch = useDispatch();
  const projects = useSelector(selectAllTechProjects);
  const status = useSelector(selectTechProjectsStatus);
  const error = useSelector(selectTechProjectsError);
  const operationStatus = useSelector(state => state.techProjects.operationStatus);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch projects on component mount
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Handle operation success
  useEffect(() => {
    if (operationStatus === 'succeeded') {
      setShowSuccess(true);
      // Auto hide success message after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [operationStatus]);

  // Reset operation status when form closes
  useEffect(() => {
    if (!showForm) {
      dispatch(resetOperationStatus());
    }
  }, [showForm, dispatch]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
    dispatch(resetOperationStatus());
  };

  const handleFormSuccess = () => {
    // Just close the form - the project is already added to state via Redux
    handleCloseForm();
  };

  const handleRefresh = () => {
    dispatch(clearError());
    dispatch(fetchProjects());
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTeamFilter = (e) => {
    setTeamFilter(e.target.value);
  };

  const handleDateFilter = (field, value) => {
    setDateFilter(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTeamFilter('');
    setDateFilter({ start: '', end: '' });
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchProjects());
  };

  // Safe filtering with null checks
  const safeProjects = Array.isArray(projects) ? projects : [];
  
  const filteredProjects = safeProjects.filter(project => {
    if (!project) return false;
    
    const matchesSearch = !searchTerm || 
      project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = !teamFilter || project.team_id?.toString() === teamFilter;
    
    let matchesStartDate = true;
    let matchesEndDate = true;
    
    if (dateFilter.start && project.start_date) {
      try {
        matchesStartDate = new Date(project.start_date) >= new Date(dateFilter.start);
      } catch (e) {
        console.warn('Invalid start date:', project.start_date);
        matchesStartDate = true;
      }
    }
    
    if (dateFilter.end && project.end_date) {
      try {
        matchesEndDate = new Date(project.end_date) <= new Date(dateFilter.end);
      } catch (e) {
        console.warn('Invalid end date:', project.end_date);
        matchesEndDate = true;
      }
    }
    
    return matchesSearch && matchesTeam && matchesStartDate && matchesEndDate;
  });

  // Extract unique teams safely
  const uniqueTeams = [...new Set(safeProjects
    .map(project => project?.team_id)
    .filter(teamId => teamId != null && teamId !== '')
  )];

  // Show authentication error with retry option
  if (error && error.includes('Authentication')) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Authentication Required</h2>
            <p className="text-red-600 mb-4">
              {error || 'You need to be logged in to access tech projects.'}
            </p>
            <button
              onClick={handleRetry}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <TechProjectForm 
        project={editingProject} 
        onClose={handleCloseForm} 
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tech Projects Management</h1>
            <p className="text-gray-600 mt-2">Manage your technology projects and teams</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={status === 'loading'}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-300"
            >
              <RefreshCw size={20} className={status === 'loading' ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleCreateProject}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              New Project
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Operation completed successfully!
          </div>
        )}

        {/* Error Display */}
        {error && !error.includes('Authentication') && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className={`bg-white rounded-lg shadow-md p-4 mb-6 transition-all duration-300 ${searchExpanded ? 'ring-2 ring-orange-200' : ''}`}>
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects by name or description..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Expand/Collapse Search Button */}
            <button
              onClick={() => setSearchExpanded(!searchExpanded)}
              className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Filter size={20} />
            </button>
          </div>

          {/* Expanded Search Options */}
          {searchExpanded && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
              {/* Team Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Team
                </label>
                <select
                  value={teamFilter}
                  onChange={handleTeamFilter}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Teams</option>
                  {uniqueTeams.map(teamId => (
                    <option key={teamId} value={teamId}>
                      Team {teamId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date From
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => handleDateFilter('start', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date Until
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => handleDateFilter('end', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-2"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects List */}
        <TechProjectList
          projects={filteredProjects}
          loading={status === 'loading'}
          error={error && !error.includes('Authentication') ? error : null}
          onEditProject={handleEditProject}
        />

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredProjects.length} of {safeProjects.length} projects
        </div>
      </div>
    </div>
  );
};

export default TechProjects;