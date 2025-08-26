// components/ProjectComponent.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, X } from 'lucide-react';
import Cookies from 'js-cookie';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  selectAllProjects,
  selectProjectsStatus,
  selectProjectsError,
  selectOperationStatus,
  selectOperationError,
  resetOperationStatus
} from '../../../redux/project/project';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';

const ProjectComponent = ({onProjectsCountChange}) => {
  const dispatch = useDispatch();
  const projects = useSelector(selectAllProjects);
  const status = useSelector(selectProjectsStatus);
  const error = useSelector(selectProjectsError);
  const operationStatus = useSelector(selectOperationStatus);
  const operationError = useSelector(selectOperationError);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [uid] = useState(Cookies.get('userUid') || '');

  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  console.log(projects.length)

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      setShowForm(false);
      setEditingProject(null);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch]);

  useEffect(() => {
    if (onProjectsCountChange && projects) {
      onProjectsCountChange(projects.length);
    }
  }, [projects, onProjectsCountChange]);

  // Generate suggestions based on search term and field
  useEffect(() => {
    if (searchTerm.length > 0 && projects) {
      const filtered = projects.filter(project => {
        let fieldValue = '';
        
        if (searchField === 'name') {
          fieldValue = project.name.toLowerCase();
        } else if (searchField === 'job_no') {
          fieldValue = project.job_no ? project.job_no.toLowerCase() : '';
        }
        
        return fieldValue.includes(searchTerm.toLowerCase());
      });
      
      const uniqueSuggestions = [...new Set(
        filtered.map(project => {
          if (searchField === 'name') {
            return project.name;
          } else if (searchField === 'job_no') {
            return project.job_no;
          }
          return '';
        })
      )].filter(Boolean);
      
      setSuggestions(uniqueSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, searchField, projects]);

  // Filter projects based on search
  const filteredProjects = projects ? projects.filter(project => {
    if (!searchTerm) return true;
    
    let fieldValue = '';
    if (searchField === 'name') {
      fieldValue = project.name.toLowerCase();
    } else if (searchField === 'job_no') {
      fieldValue = project.job_no ? project.job_no.toLowerCase() : '';
    }
    
    return fieldValue.includes(searchTerm.toLowerCase());
  }) : [];

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleCreate = (projectData) => {
    dispatch(createProject({ ...projectData, created_by: uid }));
  };

  const handleUpdate = (projectData) => {
    dispatch(updateProject({ id: editingProject.id, projectData }));
  };

  const handleDelete = (id) => {
    dispatch(deleteProject(id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
      {/* Header with Search Bar and New Project Button */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900"></h3>
        
        {/* Search Bar and New Project Button Container */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className={`flex items-center transition-all duration-300 ${isSearchExpanded ? 'w-[600px]' : 'w-10'}`}>
              {isSearchExpanded && (
                <>
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="h-10 px-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm"
                  >
                    <option value="name">Project Name</option>
                    <option value="job_no">Job Number</option>
                  </select>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Search..."
                      className="h-10 w-full px-3 py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onMouseDown={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              <button
                onClick={() => {
                  setIsSearchExpanded(!isSearchExpanded);
                  if (isSearchExpanded) {
                    setSearchTerm('');
                    setShowSuggestions(false);
                  }
                }}
                className={`h-10 w-10 flex items-center justify-center ${isSearchExpanded ? 'bg-orange-500 text-white rounded-r-md' : 'bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'}`}
              >
                {isSearchExpanded ? <X size={18} /> : <Search size={18} />}
              </button>
            </div>
          </div>

          {/* New Project Button */}
          <button 
            className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 flex items-center whitespace-nowrap"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </button>
        </div>
      </div>

      {/* Popup Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            <ProjectForm
              project={editingProject}
              onSubmit={editingProject ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
              operationStatus={operationStatus}
              operationError={operationError}
            />
          </div>
        </div>
      )}

      {/* Project List with filtered projects */}
      <ProjectList
        projects={filteredProjects}
        status={status}
        error={error}
        onEdit={(project) => {
          setEditingProject(project);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProjectComponent;