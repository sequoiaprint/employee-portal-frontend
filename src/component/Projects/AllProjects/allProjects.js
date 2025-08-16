import { useState, useEffect } from 'react';
import { Folder, Users, Clock, Star, ChevronRight, Search, X } from 'lucide-react';
import ProjectsList from './ProjectsList';
import ViewProjectDetails from '../ViewProjectDetails';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, selectAllProjects } from '../../../redux/project/project';

export default function AllProjects() {
  const dispatch = useDispatch();
  const allProjects = useSelector(selectAllProjects);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (allProjects && allProjects.length > 0) {
      const formattedProjects = allProjects.map(project => ({
        id: project.id,
        title: project.name,
        description: project.description,
        team: project.team_members ? project.team_members.length : 0,
        deadline: project.expected_end_date,
        starred: false,
        category: project.priority || 'Uncategorized',
        status: project.status,
        urls: project.urls,
        jobNo: project.job_no,
        clientName: project.client_name,
        clientCompanyName: project.client_Company_name,
        clientUrls: project.client_urls,
        clientDescription: project.client_description,
        clientCompanyType: project.client_company_type,
        startDate: project.start_date ? new Date(project.start_date).toLocaleDateString() : null,
        targetEndDate: project.target_end_date ? new Date(project.target_end_date).toLocaleDateString() : null,
        expectedEndDate: project.expected_end_date ? new Date(project.expected_end_date).toLocaleDateString() : null,
        goals: project.goals,
        milestones: project.milestones ? project.milestones.split(',') : [],
        milestonesStatus: project.milestones_status ? project.milestones_status.split(',').map(Number) : [],
        teamManager: project.team_manager,
        teamLead: project.team_lead,
        teamMembers: project.team_members || [],
        teamId: project.team_id,
        teamName: project.team_name,
        clientId: project.client_id,
        assignedTeam: project.assigned_team,
        clients: project.clients,
        endDate: project.end_date,
        createdBy: project.created_by,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        progress: project.milestones_status 
          ? Math.round((project.milestones_status.split(',').filter(s => s === '1').length / 
                        project.milestones.split(',').length) * 100)
          : 0,
        projectUrl: project.urls, // Map urls to projectUrl for ViewProjectDetails
        originalProject: project // Keep the original project data
      }));
      setProjects(formattedProjects);
    }
  }, [allProjects]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Folder className="mr-2 text-orange-500" size={24} />
          All Projects
        </h2>
        <p className="text-gray-600 mt-1">Browse all projects across the organization</p>
      </div>

      {/* Horizontal Scroll Cards */}
      <div className="p-6 pb-8 overflow-x-auto">
        <div className="flex space-x-6" style={{ minWidth: `${projects.length * 320}px` }}>
          {projects.map(project => (
            <div 
              key={project.id} 
              className="w-80 flex-shrink-0 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{project.title}</h3>
                    <p className="text-gray-600 mt-1 line-clamp-2 text-sm">{project.description}</p>
                  </div>
                  {project.starred && (
                    <Star className="text-orange-500 fill-orange-500" size={18} />
                  )}
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Users className="mr-1" size={14} />
                  <span>{project.team} members</span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Clock className="mr-1" size={14} />
                  <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                <div className="mt-3">
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                    {project.category}
                  </span>
                  <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button 
                  className="text-orange-500 text-sm font-medium flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(project);
                  }}
                >
                  View details
                  <ChevronRight className="ml-1" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="p-4 text-center border-t border-gray-200">
        <button 
          className="text-orange-500 font-medium hover:text-orange-600 flex items-center justify-center w-full"
          onClick={() => setShowAllProjects(true)}
        >
          View all projects
          <ChevronRight className="ml-1" size={16} />
        </button>
      </div>

      {/* Project Details Modal (for card clicks) */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <ViewProjectDetails 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        </div>
      )}

      {/* All Projects Modal */}
      {showAllProjects && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          {selectedProject ? (
            <ViewProjectDetails 
              project={selectedProject} 
              onClose={() => setSelectedProject(null)} 
            />
          ) : (
            <ProjectsList 
              projects={projects}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onClose={() => setShowAllProjects(false)}
              onViewDetails={setSelectedProject}
            />
          )}
        </div>
      )}
    </div>
  );
}