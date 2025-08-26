// ViewProjectDetails.js
import { 
  Star, Users, Clock, ChevronLeft, X, Calendar, Target, 
  CheckCircle, Circle, AlertCircle, User, Mail, Phone,
  Building, MapPin, ExternalLink, FileText, Flag,
  TrendingUp, Activity, Award, Timer
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

// XOR decryption function
const xorDecrypt = (encrypted, secretKey = '28032002') => {
  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Get auth token function
const getAuthToken = () => {
  const encryptedToken = Cookies.get('authToken');
  if (!encryptedToken) {
    return null;
  }

  const token = xorDecrypt(encryptedToken);
  if (!token) {
    console.warn('Failed to decrypt auth token');
    return null;
  }

  return token;
};

// Default profile icon URL
const DEFAULT_PROFILE_ICON = "https://img.icons8.com/bubbles/100/man-with-beard-in-suit.png";

export default function ViewProjectDetails({ project, onClose }) {
  const [teamAssignments, setTeamAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project && project.id) {
      fetchTeamAssignments();
    }
  }, [project]);

  const fetchTeamAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('Authentication token not found');
        setLoadingAssignments(false);
        return;
      }

      const response = await fetch(`https://internalApi.sequoia-print.com/api/assignment/project/${project.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`);
      }

      const data = await response.json();
      setTeamAssignments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching team assignments:', err);
      setError(err.message);
    } finally {
      setLoadingAssignments(false);
    }
  };

  if (!project) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'successful':
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'failed':
        return <X className="text-red-500" size={16} />;
      case 'late':
      case 'pending':
        return <AlertCircle className="text-yellow-500" size={16} />;
      default:
        return <Circle className="text-gray-400" size={16} />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      successful: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
      pending: "bg-yellow-100 text-yellow-800"
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'review':
        return <Award className="text-blue-500" size={14} />;
      case 'development':
        return <Activity className="text-green-500" size={14} />;
      case 'design':
        return <TrendingUp className="text-purple-500" size={14} />;
      case 'documentation':
        return <FileText className="text-orange-500" size={14} />;
      default:
        return <Circle className="text-gray-400" size={14} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date() && project.status === 'In Progress';
  };

  // Function to get team member by ID
  const getTeamMemberById = (userId) => {
    // Check team manager
    if (project.teamManager && project.teamManager.uid === userId) {
      return project.teamManager;
    }
    
    // Check team lead
    if (project.teamLead && project.teamLead.uid === userId) {
      return project.teamLead;
    }
    
    // Check team members
    if (project.teamMembers && Array.isArray(project.teamMembers)) {
      const member = project.teamMembers.find(member => member.uid === userId);
      if (member) {
        return member;
      }
    }
    
    // Return a default object if not found
    return {
      firstname: 'Unknown',
      lastname: 'User',
      profilepicurl: DEFAULT_PROFILE_ICON,
      role: 'Team Member'
    };
  };

  // Safe getters for team data with fallbacks
  const getTeamManager = () => {
    return project.teamManager || {
      firstname: 'No Manager',
      lastname: 'Assigned',
      profilepicurl: DEFAULT_PROFILE_ICON,
      designation: 'N/A',
      department: 'N/A',
      email: 'N/A',
      phonno: 'N/A'
    };
  };

  const getTeamLead = () => {
    return project.teamLead || {
      firstname: 'No Lead',
      lastname: 'Assigned',
      profilepicurl: DEFAULT_PROFILE_ICON,
      designation: 'N/A',
      department: 'N/A',
      email: 'N/A',
      phonno: 'N/A'
    };
  };

  const getTeamMembers = () => {
    return project.teamMembers || [];
  };

  const teamManager = getTeamManager();
  const teamLead = getTeamLead();
  const teamMembers = getTeamMembers();

  return (
    <div className="fixed inset-0  bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-orange-50 to-orange-100">
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 flex items-center transition-colors"
          >
            <ChevronLeft className="mr-1" size={20} />
            Back to Projects
          </button>
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Project Header */}
        <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-800 mr-3">{project.title || 'Untitled Project'}</h1>
                {project.starred && (
                  <Star className="text-orange-500 fill-orange-500" size={24} />
                )}
                <span className="ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {project.userRole || 'Member'}
                </span>
              </div>
              <p className="text-gray-700 text-lg mb-3">{project.description || 'No description available'}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <FileText className="mr-2" size={16} />
                  Job #{project.jobNo || 'N/A'}
                </div>
                <div className="flex items-center">
                  <Building className="mr-2" size={16} />
                  {project.category || 'Uncategorized'}
                </div>
                <div className="flex items-center">
                  <User className="mr-2" size={16} />
                  Client: {project.clientName || 'Unknown Client'}
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'In Progress' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  <Flag className="mr-1" size={12} />
                  {project.status || 'Unknown'}
                </div>
              </div>
            </div>
            {project.projectUrl && (
              <img 
                src={project.projectUrl} 
                alt="Project"
                className="w-24 h-24 rounded-lg object-cover shadow-md ml-6"
              />
            )}
          </div>

          {/* Project Timeline */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center text-green-600 mb-1">
                <Calendar className="mr-2" size={16} />
                <span className="text-sm font-medium">Started</span>
              </div>
              <p className="text-gray-800 font-semibold">{project.startDate || 'N/A'}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center text-orange-600 mb-1">
                <Target className="mr-2" size={16} />
                <span className="text-sm font-medium">Target</span>
              </div>
              <p className="text-gray-800 font-semibold">{project.targetEndDate || 'N/A'}</p>
            </div>
            <div className={`bg-white p-3 rounded-lg shadow-sm ${isOverdue(project.deadline) ? 'border-l-4 border-red-500' : ''}`}>
              <div className={`flex items-center mb-1 ${isOverdue(project.deadline) ? 'text-red-600' : 'text-blue-600'}`}>
                <Timer className="mr-2" size={16} />
                <span className="text-sm font-medium">Deadline</span>
              </div>
              <p className={`font-semibold ${isOverdue(project.deadline) ? 'text-red-800' : 'text-gray-800'}`}>
                {project.deadline || 'N/A'}
                {isOverdue(project.deadline) && (
                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">OVERDUE</span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Project Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Milestones Progress Chain */}
            {project.milestones && project.milestonesStatus && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="mr-2 text-orange-500" size={20} />
                  Project Milestones ({project.milestonesStatus.filter(s => s === 1).length}/{project.milestones.length})
                </h3>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    {project.milestones.map((milestone, index) => (
                      <div key={index} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                          project.milestonesStatus[index] === 1 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {project.milestonesStatus[index] === 1 ? (
                            <CheckCircle size={20} />
                          ) : (
                            <Circle size={20} />
                          )}
                        </div>
                        <div className={`mt-2 text-xs text-center max-w-20 ${
                          project.milestonesStatus[index] === 1 ? 'text-green-600 font-medium' : 'text-gray-500'
                        }`}>
                          {milestone}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Connection Line */}
                  <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 -z-10">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                      style={{ 
                        width: `${(project.milestonesStatus.filter(s => s === 1).length / project.milestones.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Progress</span>
                    <span className="text-sm font-medium text-gray-800">{project.progress || 0}% Complete</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Team Information */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Users className="mr-2 text-orange-500" size={20} />
                  Team Members ({project.team || '0'})
                </h3>
                
                {/* Team Manager */}
                <div className="mb-4 p-4 bg-white rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={teamManager.profilepicurl || DEFAULT_PROFILE_ICON} 
                      alt="Manager"
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_PROFILE_ICON;
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800">
                          {teamManager.firstname} {teamManager.lastname}
                        </h4>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Manager
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{teamManager.designation}</p>
                      <p className="text-xs text-gray-500">{teamManager.department}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Mail className="mr-1" size={12} />
                          {teamManager.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-1" size={12} />
                          {teamManager.phonno}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Lead */}
                <div className="mb-4 p-4 bg-white rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={teamLead.profilepicurl || DEFAULT_PROFILE_ICON} 
                      alt="Lead"
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_PROFILE_ICON;
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800">
                          {teamLead.firstname} {teamLead.lastname}
                        </h4>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          Lead
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{teamLead.designation}</p>
                      <p className="text-xs text-gray-500">{teamLead.department}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Mail className="mr-1" size={12} />
                          {teamLead.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-1" size={12} />
                          {teamLead.phonno}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div key={member.uid || index} className="p-3 bg-white rounded-lg border-l-4 border-green-500">
                      <div className="flex items-start space-x-3">
                        <img 
                          src={member.profilepicurl || DEFAULT_PROFILE_ICON} 
                          alt="Member"
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_PROFILE_ICON;
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-800">
                              {member.firstname || member.username || 'Unknown'} {member.lastname || ''}
                            </h4>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              Member
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{member.role || 'Team Member'}</p>
                          {member.designation && (
                            <p className="text-xs text-gray-500 mt-1">{member.designation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {teamMembers.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No team members assigned yet
                    </div>
                  )}
                </div>
              </div>

              {/* Team Activities & Tasks */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Activity className="mr-2 text-orange-500" size={20} />
                  Team Assignments
                </h3>
                
                {loadingAssignments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading assignments...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-red-600">Error loading assignments: {error}</p>
                    <button 
                      onClick={fetchTeamAssignments}
                      className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : teamAssignments.length === 0 ? (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                    <p className="text-yellow-700">No assignments found for this project.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {teamAssignments.map((assignment) => {
                        const assignedMember = getTeamMemberById(assignment.assignedPerson);
                        const isLate = assignment.endDate && new Date(assignment.endDate) < new Date() && !assignment.isCompleted;
                        const status = assignment.isCompleted ? 'completed' : isLate ? 'late' : 'pending';
                        
                        return (
                          <div key={assignment.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <img 
                                  src={assignedMember.profilepicurl || DEFAULT_PROFILE_ICON} 
                                  alt="Member"
                                  className="w-8 h-8 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.src = DEFAULT_PROFILE_ICON;
                                  }}
                                />
                                <div>
                                  <h4 className="font-medium text-gray-800 text-sm">
                                    {assignedMember.firstname || assignedMember.username} {assignedMember.lastname}
                                  </h4>
                                  <p className="text-xs text-gray-500">{assignedMember.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(status)}
                              </div>
                            </div>
                            
                            <h5 className="font-medium text-gray-700 mb-2">{assignment.task}</h5>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <div className="flex items-center">
                                <Calendar className="mr-1" size={12} />
                                Start: {formatDate(assignment.startDate)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-1" size={12} />
                                End: {formatDate(assignment.endDate)}
                              </div>
                            </div>
                            
                            {assignment.comment && (
                              <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 mb-2">
                                <strong>Comment:</strong> {assignment.comment}
                              </div>
                            )}
                            
                            {assignment.issue && (
                              <div className="bg-red-50 p-2 rounded text-xs text-red-600 mb-2">
                                <strong>Issue:</strong> {assignment.issue}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                              {isLate && (
                                <span className="text-xs text-red-600 font-medium">
                                  Overdue
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <AlertCircle className="mr-2" size={16} />
                        Assignment Summary
                      </h4>
                      <div className="grid grid-cols-3 gap-3 text-center text-sm">
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {teamAssignments.filter(a => a.isCompleted).length}
                          </div>
                          <div className="text-xs text-gray-600">Completed</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-yellow-600">
                            {teamAssignments.filter(a => !a.isCompleted && a.endDate && new Date(a.endDate) < new Date()).length}
                          </div>
                          <div className="text-xs text-gray-600">Overdue</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">
                            {teamAssignments.filter(a => !a.isCompleted && (!a.endDate || new Date(a.endDate) >= new Date())).length}
                          </div>
                          <div className="text-xs text-gray-600">Pending</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Project Goals */}
            {project.goals && (
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <Target className="mr-2 text-blue-500" size={20} />
                  Project Goals
                </h3>
                <p className="text-gray-700 leading-relaxed">{project.goals}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Last updated: {project.originalProject?.updated_at ? new Date(project.originalProject.updated_at).toLocaleDateString() : 'N/A'}
          </div>
          <div className="flex space-x-3">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <ExternalLink className="mr-2" size={16} />
                View Files
              </a>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}