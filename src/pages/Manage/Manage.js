import React, { useState } from 'react';
import { Users, UserCheck, FileText, Briefcase, Plus, Search } from 'lucide-react';
import ClientComponent from '../../component/Manage/client/client';
import EmployeeComponent from '../../component/Manage/employee/employee';
import LeaveComplainComponent from '../../component/Manage/leave&complain/leave&complain';
import ProjectComponent from '../../component/Manage/project/project';
import TeamComponent from '../../component/Manage/team/team';

const ManagePage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Users },
    { id: 'client', name: 'Clients', icon: Users },
    { id: 'employee', name: 'Employees', icon: UserCheck },
    { id: 'leave', name: 'Requests', icon: FileText },
    { id: 'project', name: 'Projects', icon: Briefcase },
    { id: 'team', name: 'Teams', icon: Users },
  ];

  // Preview version of EmployeeComponent that shows only 5 employees
  const EmployeePreview = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Employee Management</h3>
          <button 
            onClick={() => setActiveTab('employee')}
            className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600"
          >
            View All
          </button>
        </div>
        <EmployeeComponent preview={true} />
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'client':
        return <ClientComponent />;
      case 'employee':
        return <EmployeeComponent />;
      case 'leave':
        return <LeaveComplainComponent />;
      case 'project':
        return <ProjectComponent />;
      case 'team':
        return <TeamComponent />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClientComponent preview={true} />
            <EmployeePreview />
            <LeaveComplainComponent preview={true} />
            <ProjectComponent preview={true} />
            <TeamComponent preview={true} />
            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Clients</span>
                  <span className="font-medium text-orange-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Employees</span>
                  <span className="font-medium text-orange-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongoing Projects</span>
                  <span className="font-medium text-orange-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Teams</span>
                  <span className="font-medium text-orange-600">1</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Management System</h1>
          <p className="text-gray-600">Simple and clean management dashboard</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full bg-white"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-orange-100 border border-orange-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ManagePage;