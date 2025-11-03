import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Github, ExternalLink, RefreshCw, Search } from 'lucide-react';
import {
    fetchProjects,
    selectAllTechProjects,
    selectTechProjectsStatus,
    selectTechProjectsError,
    resetOperationStatus,
    clearError
} from '../../../redux/TechProject/TechProject';
import AllProjectsPopup from './AllProjectsPopup';

const AllTechProject = () => {
    const dispatch = useDispatch();
    const projects = useSelector(selectAllTechProjects);
    const status = useSelector(selectTechProjectsStatus);
    const error = useSelector(selectTechProjectsError);

    const [searchTerm, setSearchTerm] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [filteredProjects, setFilteredProjects] = useState([]);

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    useEffect(() => {
        if (projects) {
            const filtered = projects.filter(project =>
                project.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProjects(filtered);
        }
    }, [projects, searchTerm]);

    const handleRefresh = () => {
        dispatch(clearError());
        dispatch(fetchProjects());
    };

    const displayedProjects = filteredProjects.slice(0, 5);
    const isLoading = status === 'loading';

    return (
        <div className="w-full bg-white rounded-lg shadow-md p-6">
            {/* Header with Search and Refresh */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Tech Projects</h2>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                        />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Projects Horizontal Scroll */}
            <div className="relative">
                <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                    {isLoading ? (
                        // Loading Skeleton
                        Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4 animate-pulse"
                            >
                                <div className="h-4 bg-gray-300 rounded mb-3 w-3/4"></div>
                                <div className="h-3 bg-gray-300 rounded mb-2 w-1/2"></div>
                                <div className="h-3 bg-gray-300 rounded mb-4 w-full"></div>
                                <div className="h-6 bg-gray-300 rounded w-24"></div>
                            </div>
                        ))
                    ) : displayedProjects.length > 0 ? (
                        displayedProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))
                    ) : (
                        <div className="w-full text-center py-8 text-gray-500">
                            No projects found
                        </div>
                    )}
                </div>
            </div>

            {/* View All Button */}
            {!isLoading && filteredProjects.length > 5 && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => setShowPopup(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        View All Projects ({filteredProjects.length})
                    </button>
                </div>
            )}

            {/* All Projects Popup */}
            {showPopup && (
                <AllProjectsPopup
                    projects={filteredProjects}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </div>
    );
};

// Individual Project Card Component
const ProjectCard = ({ project }) => {
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

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Safe techstacks processing
    const getTechStacks = (techstacks) => {
        if (!techstacks) return [];

        try {
            if (typeof techstacks === 'string') {
                return techstacks.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
            } else if (Array.isArray(techstacks)) {
                return techstacks;
            } else {
                return [String(techstacks)];
            }
        } catch (error) {
            console.warn('Error processing techstacks:', error);
            return [];
        }
    };

    const techStacks = getTechStacks(project.techstacks);

    return (
        <div className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
            {/* Project Header */}
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800 text-lg line-clamp-2 flex-1">
                    {project.project_name || 'Unnamed Project'}
                </h3>
                {project.github_links && (
                    <a
                        href={project.github_links}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 p-1 text-orange-400 hover:text-gray-900 transition-colors"
                    >
                        <Github className="h-5 w-5" />
                    </a>
                )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {project.description || 'No description available'}
            </p>

            {/* Tech Stacks */}
            {techStacks.length > 0 && (
                <div className="mb-3">
                    
                    <div className="flex flex-wrap gap-1">
                        {techStacks.slice(0, 4).map((tech, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-orange-400 text-white text-xs rounded"
                            >
                                {tech}
                            </span>
                        ))}
                        {techStacks.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                +{techStacks.length - 4} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Project Footer */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(project.status)}`}>
                    {project.status || 'Pending'}
                </span>
                <span className="text-xs font-bold text-gray-500">
                    {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </span>
            </div>
        </div>
    );
};

export default AllTechProject;