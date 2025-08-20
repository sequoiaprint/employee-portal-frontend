import { useState, useEffect } from 'react';
import { Folder, Users, Clock, CheckCircle, XCircle, Search, ChevronDown, ChevronUp, ChevronRight, Star } from 'lucide-react';
import ViewProjectDetails from './ViewProjectDetails';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import {
  fetchProjects,
  selectAllProjects,
} from '../../redux/project/project';

export default function MyProjects() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('active');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uid] = useState(Cookies.get('userUid') || '');
  
  // Get projects from Redux store
  const allProjects = useSelector(selectAllProjects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Function to check if user is part of the project
  const isUserPartOfProject = (project) => {
    const userUid = uid;
    
    // Check if user is team manager
    if (project.team_manager_uid === userUid) {
      return true;
    }
    
    // Check if user is team lead
    if (project.team_lead_uid === userUid) {
      return true;
    }
    
    // Check if user is in team members
    if (project.team_member) {
      const teamMembers = project.team_member.split(',');
      return teamMembers.includes(userUid);
    }
    
    return false;
  };

  // Get user's role in the project
  const getUserRole = (project) => {
    const userUid = uid;
    
    if (project.team_manager_uid === userUid) {
      return 'Manager';
    }
    
    if (project.team_lead_uid === userUid) {
      return 'Lead';
    }
    
    if (project.team_member && project.team_member.split(',').includes(userUid)) {
      return 'Member';
    }
    
    return 'Member';
  };

  // Calculate progress based on milestones
  const calculateProgress = (milestonesStatus) => {
    if (!milestonesStatus) return 0;
    
    const statusArray = milestonesStatus.split(',').map(status => parseInt(status));
    const completedMilestones = statusArray.filter(status => status === 1).length;
    const totalMilestones = statusArray.length;
    
    return Math.round((completedMilestones / totalMilestones) * 100);
  };

  // Filter and categorize projects
  const userProjects = allProjects ? allProjects.filter(isUserPartOfProject) : [];
  
  const categorizedProjects = {
    active: userProjects.filter(project => 
      project.status === 'In Progress' || 
      project.status === 'Not Started' || 
      project.status === 'Planning'
    ),
    closed: userProjects.filter(project => 
      project.status === 'Completed' || 
      project.status === 'Cancelled' || 
      project.status === 'On Hold'
    )
  };

  // Transform project data for display
  const transformProjectData = (project) => {
    const progress = calculateProgress(project.milestones_status);
    const isActive = categorizedProjects.active.includes(project);
    
    return {
      id: project.id,
      title: project.name,
      description: project.description || 'No description available',
      team: project.team_members ? project.team_members.length + 2 : 2, // +2 for manager and lead
      deadline: project.expected_end_date ? new Date(project.expected_end_date).toLocaleDateString() : 'No deadline',
      completed: project.end_date ? new Date(project.end_date).toLocaleDateString() : null,
      progress: progress,
      category: project.client_Company_name || 'General',
      starred: project.priority === 'High',
      status: project.status,
      jobNo: project.job_no,
      goals: project.goals,
      clientName: project.client_name,
      userRole: getUserRole(project),
      teamManager: project.team_manager,
      teamLead: project.team_lead,
      teamMembers: project.team_members || [],
      milestones: project.milestones ? project.milestones.split(',') : [],
      milestonesStatus: project.milestones_status ? project.milestones_status.split(',').map(s => parseInt(s)) : [],
      projectUrl: project.urls,
      startDate: project.start_date ? new Date(project.start_date).toLocaleDateString() : null,
      targetEndDate: project.target_end_date ? new Date(project.target_end_date).toLocaleDateString() : null,
      originalProject: project // Keep reference to original project data
    };
  };

  // Apply transformation and filtering
  const projects = {
    active: categorizedProjects.active.map(transformProjectData),
    closed: categorizedProjects.closed.map(transformProjectData)
  };

  // Filter projects based on search term
  const filteredProjects = {
    active: projects.active.filter(project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    closed: projects.closed.filter(project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  };

  // Get status display for closed projects
  const getStatusDisplay = (project) => {
    switch (project.status) {
      case 'Completed':
        return { text: 'Completed', style: 'bg-green-100 text-green-800' };
      case 'Cancelled':
        return { text: 'Cancelled', style: 'bg-red-100 text-red-800' };
      case 'On Hold':
        return { text: 'On Hold', style: 'bg-yellow-100 text-yellow-800' };
      default:
        return { text: project.status, style: 'bg-gray-100 text-gray-800' };
    }
  };

  // console.log('User UID:', uid);
  // console.log('All Projects:', allProjects);
  // console.log('User Projects:', userProjects);
  // console.log('Filtered Projects:', filteredProjects);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Folder className="mr-2 text-orange-500" size={24} />
          My Projects
        </h2>
        
        {/* User Info */}
        <div className="mt-2 text-sm text-gray-600">
          User ID: {uid} • Total Projects: {userProjects.length}
        </div>
        
        {/* Expandable Search Bar */}
        <div className="mb-8 mt-3 flex justify-end">
          <div 
            className={`flex items-center bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${searchExpanded ? 'w-full' : 'w-12 hover:w-64'}`}
            onClick={() => !searchExpanded && setSearchExpanded(true)}
          >
            <div className="p-3 bg-orange-500 text-white">
              <Search size={20} />
            </div>
            {searchExpanded && (
              <>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="flex-1 px-4 py-2 outline-none"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  className="p-2 text-gray-500 hover:text-orange-500"
                  onClick={() => {
                    setSearchExpanded(false);
                    setSearchTerm('');
                  }}
                >
                  {searchExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex mt-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'active' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('active')}
          >
            <Clock className="mr-2" size={16} />
            Active ({filteredProjects.active.length})
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'closed' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('closed')}
          >
            {activeTab === 'closed' ? (
              <CheckCircle className="mr-2" size={16} />
            ) : (
              <XCircle className="mr-2" size={16} />
            )}
            Closed ({filteredProjects.closed.length})
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="divide-y divide-gray-200">
        {filteredProjects[activeTab].length > 0 ? (
          filteredProjects[activeTab].map(project => {
            const statusDisplay = getStatusDisplay(project);
            
            return (
              <div 
                key={project.id} 
                className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-bold text-lg text-gray-800">{project.title}</h3>
                      {project.starred && (
                        <Star className="ml-2 text-orange-500 fill-orange-500" size={16} />
                      )}
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {project.userRole}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{project.description}</p>
                    <div className="flex items-center mt-3 text-sm text-gray-500 flex-wrap gap-2">
                      <div className="flex items-center">
                        <Users className="mr-1" size={14} />
                        <span>{project.team} team members</span>
                      </div>
                      <span>•</span>
                      <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                        {project.category}
                      </span>
                      {project.jobNo && (
                        <>
                          <span>•</span>
                          <span className="text-xs">Job #{project.jobNo}</span>
                        </>
                      )}
                      {project.clientName && (
                        <>
                          <span>•</span>
                          <span className="text-xs">Client: {project.clientName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {activeTab === 'active' ? (
                    <div className="text-right ml-4">
                      <span className="text-sm font-medium text-gray-500">Due {project.deadline}</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full transition-all duration-300" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{project.progress}% complete</span>
                    </div>
                  ) : (
                    <div className="flex items-center ml-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.style}`}>
                        {statusDisplay.text}
                      </div>
                      <ChevronRight className="ml-2 text-gray-400" size={20} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No projects found matching your search.' : 'No projects assigned to you yet.'}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <ViewProjectDetails 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </div>
  );
}