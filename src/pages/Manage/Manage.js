import React, { useState, useEffect } from 'react';
import { Users, UserCheck, FileText, Briefcase, Plus, Search, BarChart3, LayoutDashboard } from 'lucide-react';
import ClientComponent from '../../component/Manage/client/client';
import EmployeeComponent from '../../component/Manage/employee/employee';
import ProjectComponent from '../../component/Manage/project/project';
import TeamComponent from '../../component/Manage/team/team';

import { useDispatch, useSelector } from 'react-redux';

const ManagePage = () => {
  const dispatch = useDispatch();
  const [profileCount, setProfileCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  
  // Get the active tab from localStorage or default to 'overview'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = typeof window !== 'undefined' ? localStorage.getItem('activeTab') : null;
    return savedTab || 'overview';
  });

  const handleProfileCountChange = (count) => {
    setProfileCount(count);
  };
  
  const handleClientCountChange = (count) => {
    setClientCount(count);
  };
  
  const handleProjectCountChange = (count) => {
    setProjectCount(count);
  };
  
  const handleTeamCountChange = (count) => {
    setTeamCount(count);
  };

  // Save the active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3, color: 'bg-orange-500' },
    { id: 'client', name: 'Clients', icon: Users, color: 'bg-orange-400' },
    { id: 'employee', name: 'Employees', icon: UserCheck, color: 'bg-orange-500' },
    { id: 'project', name: 'Projects', icon: Briefcase, color: 'bg-orange-600' },
    { id: 'team', name: 'Teams', icon: Users, color: 'bg-orange-400' },
  ];

  // Enhanced preview components with better styling and scroll containers
  const PreviewCard = ({ title, children, onViewAll, icon: Icon, height = 'h-80' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200 flex flex-col ${height}`}>
      <div className="p-4 border-b border-orange-50 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 bg-orange-100 rounded-lg">
                <Icon className="h-5 w-5 text-orange-600" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm"
            >
              View All
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100">
          <div className="space-y-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Full page container for individual components
  const FullPageContainer = ({ children, title, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm border border-orange-100 flex flex-col h-[calc(100vh-220px)]">
      <div className="p-6 border-b border-orange-50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 bg-orange-100 rounded-lg">
              <Icon className="h-6 w-6 text-orange-600" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100">
          {children}
        </div>
      </div>
    </div>
  );

  const EmployeePreview = () => (
    <PreviewCard
      title="Employee Management"
      icon={UserCheck}
      onViewAll={() => setActiveTab('employee')}
    >
      <EmployeeComponent preview={true} previewLimit={5} onProfileCountChange={handleProfileCountChange} />
    </PreviewCard>
  );

  const StatCard = ({ label, value, trend }) => (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-6 border border-orange-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'client':
        return (
          <FullPageContainer title="Client Management" icon={Users}>
            <ClientComponent onClientsCountChange={handleClientCountChange} />
          </FullPageContainer>
        );
      case 'employee':
        return (
          <FullPageContainer title="Employee Management" icon={UserCheck}>
            <EmployeeComponent onProfileCountChange={handleProfileCountChange} />
          </FullPageContainer>
        );
      case 'project':
        return (
          <FullPageContainer title="Project Management" icon={Briefcase}>
            <ProjectComponent onProjectsCountChange={handleProjectCountChange} />
          </FullPageContainer>
        );
      case 'team':
        return (
          <FullPageContainer title="Team Management" icon={Users}>
            <TeamComponent />
          </FullPageContainer>
        );
      default:
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Clients" value={clientCount} trend="+0%" />
              <StatCard label="Active Employees" value={profileCount} trend="+0%" />
              <StatCard label="Ongoing Projects" value={projectCount} trend="+0%" />
              <StatCard label="Active Teams" value={teamCount} trend="+0%" />
            </div>

            {/* Main Content Grid with different heights for different components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PreviewCard
                title="Project Management"
                icon={Briefcase}
                height="h-[670px]"
                onViewAll={() => setActiveTab('project')}
              >
                <div className="space-y-4">
                  <ProjectComponent preview={true} previewLimit={2} onProjectsCountChange={handleProjectCountChange} />
                </div>
              </PreviewCard>
              
              <PreviewCard
                title="Client Management"
                icon={Users}
                height="h-[670px]"
                onViewAll={() => setActiveTab('client')}
              >
                <div className="space-y-4">
                  <ClientComponent preview={true} previewLimit={4} onClientsCountChange={handleClientCountChange} />
                </div>
              </PreviewCard>

              <PreviewCard
                title="Employee Management"
                icon={UserCheck}
                height="h-[670px]"
                onViewAll={() => setActiveTab('employee')}
              >
                <div className="space-y-4">
                  <EmployeeComponent preview={true} previewLimit={3} onProfileCountChange={handleProfileCountChange} />
                </div>
              </PreviewCard>

              <PreviewCard
                title="Team Management"
                icon={Users}
                height="h-[670px]"
                onViewAll={() => setActiveTab('team')}
              >
                <div className="space-y-4">
                  <TeamComponent preview={true} previewLimit={2} onTeamCountChange={handleTeamCountChange} />
                </div>
              </PreviewCard>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <LayoutDashboard className="w-8 h-8 text-orange-500" />
                  <h1 className="text-3xl font-bold text-gray-900">
                    Management Dashboard
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-2">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-105'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </div>

      {/* Custom CSS for animations and scrollbar styling */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Custom scrollbar styles */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-orange-300::-webkit-scrollbar-thumb {
          background-color: #fed7aa;
          border-radius: 6px;
        }
        
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #fed7aa;
          border-radius: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #fdba74;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background-color: #f3f4f6;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default ManagePage;