// ProjectsList.js
import { Star, Users, Clock, ChevronRight, Search, X, Folder } from 'lucide-react';

export default function ProjectsList({ 
  projects, 
  searchTerm, 
  setSearchTerm, 
  onClose, 
  onViewDetails 
}) {
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.category && project.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (project.clientName && project.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (project.clientCompanyName && project.clientCompanyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
      {/* Modal Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Folder className="mr-2 text-orange-500" size={24} />
          All Projects ({filteredProjects.length})
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Search projects by title, description, category, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {filteredProjects.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredProjects.map(project => (
              <div 
                key={project.id} 
                className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                onClick={() => onViewDetails(project)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {project.starred ? (
                        <Star className="text-orange-500 fill-orange-500" size={18} />
                      ) : (
                        <Star className="text-gray-300" size={18} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{project.title}</h3>
                          <p className="text-gray-600 mt-1 text-sm">{project.description}</p>
                        </div>
                        {project.urls && (
                          <img 
                            src={project.urls} 
                            alt="Project"
                            className="w-16 h-16 rounded-lg object-cover ml-4 flex-shrink-0"
                          />
                        )}
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center text-sm text-gray-500">
                          <Users className="mr-1" size={14} />
                          {project.team} members
                        </span>
                        <span className="inline-flex items-center text-sm text-gray-500">
                          <Clock className="mr-1" size={14} />
                          Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                          {project.category}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      {project.clientName && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Client:</strong> {project.clientName}
                          {project.clientCompanyName && ` (${project.clientCompanyName})`}
                        </div>
                      )}
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Job #:</strong> {project.jobNo}
                      </div>
                      
                      {project.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs font-medium text-gray-700">{project.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-500"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0 ml-2" size={20} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Folder className="mx-auto mb-3 text-gray-300" size={48} />
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm mt-1">
              {searchTerm 
                ? `No projects match "${searchTerm}". Try adjusting your search terms.`
                : "No projects available at the moment."
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Modal Footer */}
      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}