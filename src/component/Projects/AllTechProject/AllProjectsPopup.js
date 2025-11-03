import React, { useState } from 'react';
import { X, Github, Search, Calendar, Tag } from 'lucide-react';

const AllProjectsPopup = ({ projects, searchTerm, onSearchChange, onClose }) => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    const handleSearchChange = (value) => {
        setLocalSearchTerm(value);
        onSearchChange(value);
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

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">All Projects</h2>
                        <p className="text-gray-600 mt-1">
                            {projects.length} project{projects.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-gray-200">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search projects by name..."
                            value={localSearchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Projects List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid gap-6">
                        {projects.length > 0 ? (
                            projects.map((project) => {
                                const techStacks = getTechStacks(project.techstacks);

                                return (
                                    <div
                                        key={project.id}
                                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            {/* Project Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-xl font-semibold text-gray-800">
                                                        {project.project_name || 'Unnamed Project'}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        {project.github_links && (
                                                            <a
                                                                href={project.github_links}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                            >
                                                                <Github className="h-5 w-5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className="text-gray-600 mb-4 leading-relaxed">
                                                    {project.description || 'No description available'}
                                                </p>

                                                {/* Tech Stacks */}
                                                {techStacks.length > 0 && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Tag className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-700">Tech Stack</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {techStacks.map((tech, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dates */}
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {formatDate(project.start_date)} - {formatDate(project.end_date)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="lg:text-right">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                                        project.status
                                                    )}`}
                                                >
                                                    {project.status || 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <Search className="h-16 w-16 mx-auto" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                                <p className="text-gray-600">
                                    No projects match your search criteria. Try different keywords.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllProjectsPopup;