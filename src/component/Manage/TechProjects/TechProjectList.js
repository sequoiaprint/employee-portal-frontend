import React, { useState } from 'react';
import { Edit2, ExternalLink, Calendar, Users, AlertCircle, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { deleteProject } from '../../../redux/TechProject/TechProject';

const TechProjectList = ({ projects, loading, error, onEditProject }) => {
  const dispatch = useDispatch();
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteProject = async (projectId) => {
    if (!projectId) {
      console.error('Cannot delete project: Invalid project ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setDeletingId(projectId);
    try {
      await dispatch(deleteProject(projectId)).unwrap();
      // Success handled by Redux
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project: ' + error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Projects</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Users size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Projects Found</h3>
        <p className="text-gray-500">Get started by creating your first tech project.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      on_hold: 'bg-yellow-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      planning: 'Planning',
      in_progress: 'In Progress',
      completed: 'Completed',
      on_hold: 'On Hold',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div
          key={project.id || `project-${Math.random()}`}
          className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {project.project_name}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => onEditProject(project)}
                  className="text-gray-400 hover:text-orange-500 transition-colors flex-shrink-0 p-1"
                  title="Edit project"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  disabled={deletingId === project.id || !project.id}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1 disabled:opacity-50"
                  title="Delete project"
                >
                  {deletingId === project.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Team {project.team_id}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 border-b border-gray-200">
            <p className="text-gray-600 text-sm line-clamp-3">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Tech Stacks */}
          {project.techstacks && project.techstacks.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-1">
                {project.techstacks.slice(0, 3).map((tech, index) => (
                  <span
                    key={`${project.id}-tech-${index}`}
                    className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
                {project.techstacks.length > 3 && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    +{project.techstacks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* GitHub Links */}
          {project.github_links && project.github_links.filter(link => link && link.trim()).length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink size={14} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">GitHub Links</span>
              </div>
              <div className="space-y-1">
                {project.github_links.filter(link => link && link.trim()).slice(0, 2).map((link, index) => (
                  <a
                    key={`${project.id}-github-${index}`}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm block truncate"
                  >
                    {link.replace('https://', '')}
                  </a>
                ))}
                {project.github_links.filter(link => link && link.trim()).length > 2 && (
                  <span className="text-gray-500 text-xs">
                    +{project.github_links.filter(link => link && link.trim()).length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <div>
                  <div className="text-gray-500 text-xs">Start Date</div>
                  <div className="text-gray-700">{formatDate(project.start_date)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <div>
                  <div className="text-gray-500 text-xs">End Date</div>
                  <div className="text-gray-700">{formatDate(project.end_date)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechProjectList;