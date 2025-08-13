import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import UserSelect from '../../Global/SelectProfile';

const TeamComponent = () => {
  // Sample data structure matching your database fields
  const [teams, setTeams] = useState([
    {
      id: 1,
      team_name: 'Development Team A',
      manager: 'manager1@example.com',
      team_lead: 'lead1@example.com',
      team_member: 'member1@example.com,member2@example.com,member3@example.com'
    },
    {
      id: 2,
      team_name: 'Design Team',
      manager: 'manager2@example.com',
      team_lead: 'lead2@example.com',
      team_member: 'member4@example.com,member5@example.com'
    }
  ]);

  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({
    team_name: '',
    manager: '',
    team_lead: '',
    team_member: []
  });

  const handleAddMember = (uid) => {
    if (!newTeam.team_member.includes(uid)) {
      setNewTeam({
        ...newTeam,
        team_member: [...newTeam.team_member, uid]
      });
    }
  };

  const handleRemoveMember = (uid) => {
    setNewTeam({
      ...newTeam,
      team_member: newTeam.team_member.filter(member => member !== uid)
    });
  };

  const handleCreateTeam = () => {
    if (newTeam.team_name && newTeam.manager && newTeam.team_lead) {
      const teamToAdd = {
        ...newTeam,
        id: teams.length + 1,
        team_member: newTeam.team_member.join(',')
      };
      
      setTeams([...teams, teamToAdd]);
      setNewTeam({
        team_name: '',
        manager: '',
        team_lead: '',
        team_member: []
      });
      setShowAddTeam(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Team Management</h3>
        <button 
          onClick={() => setShowAddTeam(true)}
          className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600 flex items-center"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          Create Team
        </button>
      </div>
      
      {/* Teams List */}
      <div className="space-y-4">
        {teams.map(team => (
          <div key={team.id} className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{team.team_name}</h4>
                <p className="text-sm text-gray-600">Manager: {team.manager}</p>
                <p className="text-sm text-gray-600">Team Lead: {team.team_lead}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-600">Members:</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {team.team_member.split(',').map((member, index) => (
                      <li key={index}>{member}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Team Popup */}
      {showAddTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Team</h3>
              <button 
                onClick={() => setShowAddTeam(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={newTeam.team_name}
                  onChange={(e) => setNewTeam({...newTeam, team_name: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Enter team name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <UserSelect
                  value={newTeam.manager}
                  onChange={(value) => setNewTeam({...newTeam, manager: value})}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
                <UserSelect
                  value={newTeam.team_lead}
                  onChange={(value) => setNewTeam({...newTeam, team_lead: value})}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
                <UserSelect
                  value=""
                  onChange={handleAddMember}
                  className="w-full"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {newTeam.team_member.map(member => (
                    <div key={member} className="bg-gray-100 px-2 py-1 rounded flex items-center">
                      <span className="text-sm">{member}</span>
                      <button 
                        onClick={() => handleRemoveMember(member)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowAddTeam(false)}
                  className="px-4 py-2 border rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600"
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamComponent;