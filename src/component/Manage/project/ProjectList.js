// components/ProjectList.js
import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Circle, X, User, Users, Mail, Phone, Building, MapPin, Eye } from 'lucide-react';

const statusIcons = {
  'Not Started': <Clock className="h-4 w-4 inline mr-1" />,
  'In Progress': <AlertCircle className="h-4 w-4 inline mr-1 text-yellow-500" />,
  'Completed': <CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />,
};

const priorityColors = {
  'High': 'bg-red-100 text-red-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Low': 'bg-green-100 text-green-800',
};

// Helper function to parse milestones
const parseMilestones = (milestonesString) => {
  if (!milestonesString) return [];
  return milestonesString.split(',').map(milestone => milestone.trim()).filter(milestone => milestone);
};

// Helper function to parse milestone statuses
const parseMilestoneStatuses = (statusesString) => {
  if (!statusesString) return [];
  return statusesString.split(',').map(status => parseInt(status.trim())).filter(status => !isNaN(status));
};

// Helper function to calculate progress percentage
const calculateProgress = (statuses) => {
  if (!statuses || statuses.length === 0) return 0;
  const completed = statuses.filter(status => status === 1).length;
  return Math.round((completed / statuses.length) * 100);
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Client Information Modal
const ClientModal = ({ client, isOpen, onClose }) => {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Client Avatar/Logo */}
            <div className="flex items-center space-x-4">
              {client.client_urls ? (
                <img 
                  src={client.client_urls} 
                  alt={client.client_Company_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-900">{client.client_name}</h4>
                <p className="text-sm text-gray-600">{client.client_Company_name}</p>
              </div>
            </div>

            {/* Company Details */}
            <div className="border-t pt-4">
              <h5 className="font-medium text-gray-900 mb-2">Company Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{client.client_Company_name || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{client.client_company_type || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {client.client_description && (
              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                <p className="text-sm text-gray-600">{client.client_description}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="border-t pt-4">
              <h5 className="font-medium text-gray-900 mb-2">Contact Person</h5>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">{client.client_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Team Information Modal
const TeamModal = ({ project, isOpen, onClose }) => {
  if (!isOpen || !project) return null;

  const { team_name, team_manager, team_lead, team_members } = project;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Information</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Team Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">{team_name}</h4>
              <p className="text-sm text-gray-600">
                {team_members ? team_members.length + 2 : 2} Team Members
              </p>
            </div>

            {/* Team Manager */}
            {team_manager && (
              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Team Manager
                </h5>
                <TeamMemberCard member={team_manager} role="Manager" />
              </div>
            )}

            {/* Team Lead */}
            {team_lead && (
              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Team Lead
                </h5>
                <TeamMemberCard member={team_lead} role="Lead" />
              </div>
            )}

            {/* Team Members */}
            {team_members && team_members.length > 0 && (
              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Team Members ({team_members.length})
                </h5>
                <div className="space-y-3">
                  {team_members.map((member, index) => (
                    <TeamMemberCard key={member.uid || index} member={member} role="Member" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Team Member Card
const TeamMemberCard = ({ member, role }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        {member.profilepicurl ? (
          <img 
            src={member.profilepicurl} 
            alt={member.username}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-400" />
          </div>
        )}

        {/* Member Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h6 className="font-medium text-gray-900">
              {member.firstname && member.lastname 
                ? `${member.firstname} ${member.lastname}` 
                : member.username || 'Unknown User'
              }
            </h6>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {role}
            </span>
          </div>
          
          <div className="space-y-1 mt-1">
            {member.role && (
              <p className="text-sm text-gray-600">{member.role}</p>
            )}
            {member.designation && (
              <p className="text-xs text-gray-500">{member.designation}</p>
            )}
            {member.department && (
              <p className="text-xs text-gray-500">{member.department}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex items-center space-x-4 mt-2">
            {member.email && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Mail className="h-3 w-3" />
                <span>{member.email}</span>
              </div>
            )}
            {member.phonno && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Phone className="h-3 w-3" />
                <span>{member.phonno}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Milestone Progress Chain Component
const MilestoneChain = ({ milestones, statuses }) => {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic mb-2">
        No milestones defined
      </div>
    );
  }

  const progress = calculateProgress(statuses);
  const completedCount = statuses.filter(status => status === 1).length;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">
          Milestones ({completedCount}/{milestones.length})
        </span>
        <span className="text-xs text-gray-600">
          {progress}% Complete
        </span>
      </div>
      
      {/* Milestone Chain */}
      <div className="flex items-center space-x-1 mb-2">
        {milestones.map((milestone, index) => {
          const isCompleted = statuses[index] === 1;
          const isNext = !isCompleted && index > 0 && statuses[index - 1] === 1;
          const isPending = !isCompleted && !isNext;
          
          return (
            <React.Fragment key={index}>
              {/* Milestone Node */}
              <div
                className={`relative group cursor-pointer transition-all duration-300 ${
                  isCompleted
                    ? 'transform scale-110'
                    : isNext
                    ? 'transform scale-105'
                    : ''
                }`}
                title={milestone}
              >
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-green-500 drop-shadow-sm" />
                ) : isNext ? (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 border-2 border-white shadow-lg animate-pulse flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
                
                {/* Milestone tooltip on hover */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  {milestone}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
              
              {/* Connection Line */}
              {index < milestones.length - 1 && (
                <div className="flex-1 h-1 mx-1 rounded-full overflow-hidden bg-gray-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      statuses[index] === 1
                        ? 'bg-gradient-to-r from-green-400 to-green-500 w-full'
                        : statuses[index] === 1 || isNext
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500 w-1/2'
                        : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-700 bg-gradient-to-r from-orange-400 via-orange-500 to-green-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const ProjectList = ({ projects, status, error, onEdit, onDelete }) => {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const openClientModal = (project) => {
    setSelectedProject(project);
    setClientModalOpen(true);
  };

  const openTeamModal = (project) => {
    setSelectedProject(project);
    setTeamModalOpen(true);
  };

  if (status === 'loading') return <div className="text-center py-8">Loading projects...</div>;
  if (status === 'failed') return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  if (projects.length === 0) return <div className="text-center py-8 text-gray-500">No projects found</div>;

  return (
    <>
      <div className="space-y-6">
        {projects.map(project => {
          const milestones = parseMilestones(project.milestones);
          const milestoneStatuses = parseMilestoneStatuses(project.milestones_status);
          const calculatedProgress = calculateProgress(milestoneStatuses);
          
          // Ensure statuses array matches milestones array length
          const normalizedStatuses = milestones.map((_, index) => 
            milestoneStatuses[index] !== undefined ? milestoneStatuses[index] : 0
          );

          return (
            <div key={project.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg mb-1">{project.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p className="flex items-center">
                      Client: 
                      <button
                        onClick={() => openClientModal(project)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline ml-1 flex items-center"
                      >
                        {project.client_Company_name || 'N/A'}
                        <Eye className="h-3 w-3 ml-1" />
                      </button>
                    </p>
                    <p>Job No: <span className="font-bold text-orange-500">{project.job_no || 'N/A'}</span></p>
                    <p>Start: <span className="font-medium">{formatDate(project.start_date)}</span></p>
                    <p>Target: <span className="font-medium">{formatDate(project.target_end_date)}</span></p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`${priorityColors[project.priority]} px-3 py-1 rounded-full text-xs font-medium`}>
                    {project.priority}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    {statusIcons[project.status]}
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Goals and Description */}
              {(project.goals || project.description) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  {project.goals && (
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Goals:</span> {project.goals}
                    </p>
                  )}
                  {project.description && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Description:</span> {project.description}
                    </p>
                  )}
                </div>
              )}

              {/* Milestone Progress Chain */}
              <MilestoneChain 
                milestones={milestones} 
                statuses={normalizedStatuses} 
              />

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Progress: <span className="font-semibold text-orange-600">{calculatedProgress}%</span>
                  </span>
                  {project.team_name && (
                    <button
                      onClick={() => openTeamModal(project)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    >
                      Team: <span className="font-medium ml-1">{project.team_name}</span>
                      <Eye className="h-3 w-3 ml-1" />
                    </button>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => onEdit(project)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(project.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Project Images */}
              {project.urls && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <ProjectImages urls={project.urls} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Client Modal */}
      <ClientModal 
        client={selectedProject}
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
      />

      {/* Team Modal */}
      <TeamModal 
        project={selectedProject}
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
      />
    </>
  );
};

// Component to display project images
const ProjectImages = ({ urls }) => {
  if (!urls) return null;
  
  const imageUrls = typeof urls === 'string' 
    ? urls.split(',').map(url => url.trim()).filter(url => url)
    : [];
    
  if (imageUrls.length === 0) return null;

  return (
    <div>
      <h6 className="text-sm font-medium text-gray-700 mb-2">Project Images</h6>
      <div className="flex flex-wrap gap-2">
        {imageUrls.slice(0, 4).map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Project image ${index + 1}`}
            className="h-16 w-16 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform duration-200"
          />
        ))}
        {imageUrls.length > 4 && (
          <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-600">+{imageUrls.length - 4}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;