import React, { useState, useEffect } from 'react';
import { Plus, Trash, User as UserIcon, X, Calendar } from 'lucide-react';
import UserSelect from '../../Global/SelectProfile';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTeams, 
  createTeam, 
  updateTeam, 
  deleteTeam 
} from '../../../redux/team/team';
import { fetchAllProfiles } from '../../../redux/profile/profile';

const TeamComponent = () => {
  const dispatch = useDispatch();
  const { teams, loading: teamsLoading, error: teamsError } = useSelector(state => state.teams);
  
  const { profiles, loading: profilesLoading, error: profilesError } = useSelector(state => ({
    profiles: state.profile.profiles || [],
    loading: state.profile.loading,
    error: state.profile.error
  }));

  const [showAddTeam, setShowAddTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({
    team_name: '',
    manager: '',
    team_lead: '',
    team_member: []
  });

  useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchAllProfiles());
  }, [dispatch]);

  // Reset form when opening/closing modal
  useEffect(() => {
    if (showAddTeam) {
      if (editingTeam) {
        const teamToEdit = teams.find(t => t.id === editingTeam);
        setTeamForm({
          team_name: teamToEdit.team_name,
          manager: teamToEdit.manager,
          team_lead: teamToEdit.team_lead,
          team_member: teamToEdit.team_member.split(',').map(uid => {
            const profile = profiles.find(p => p.uid === uid);
            return {
              uid,
              name: profile ? [profile.firstname, profile.lastname].filter(Boolean).join(' ') || 
                            profile.username || 
                            profile.uid : uid
            };
          })
        });
      } else {
        setTeamForm({
          team_name: '',
          manager: '',
          team_lead: '',
          team_member: []
        });
      }
    }
  }, [showAddTeam, editingTeam, teams, profiles]);

  const getProfileInfo = (uid) => {
    const profile = profiles.find(p => p.uid === uid);
    if (!profile) return uid;
    
    return [profile.firstname, profile.lastname].filter(Boolean).join(' ') ||
      profile.username ||
      profile.uid;
  };

  const handleAddMember = (uid, profile) => {
    if (!teamForm.team_member.some(member => member.uid === uid)) {
      const name = [profile.firstname, profile.lastname].filter(Boolean).join(' ') ||
        profile.username ||
        profile.uid;
      setTeamForm({
        ...teamForm,
        team_member: [...teamForm.team_member, { uid, name }]
      });
    }
  };

  const handleRemoveMember = (uid) => {
    setTeamForm({
      ...teamForm,
      team_member: teamForm.team_member.filter(member => member.uid !== uid)
    });
  };

  const handleSubmitTeam = () => {
    const teamData = {
      team_name: teamForm.team_name,
      manager: teamForm.manager,
      team_lead: teamForm.team_lead,
      team_member: teamForm.team_member.map(m => m.uid).join(',')
    };

    if (editingTeam) {
      dispatch(updateTeam({ id: editingTeam, updatedData: teamData }))
        .unwrap()
        .then(() => {
          setEditingTeam(null);
          setShowAddTeam(false);
        })
        .catch(error => {
          console.error('Failed to update team:', error);
        });
    } else {
      dispatch(createTeam(teamData))
        .unwrap()
        .then(() => {
          setShowAddTeam(false);
        })
        .catch(error => {
          console.error('Failed to create team:', error);
        });
    }
  };

  const handleDeleteTeam = (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      dispatch(deleteTeam(id))
        .unwrap()
        .catch(error => {
          console.error('Failed to delete team:', error);
        });
    }
  };

  if (teamsLoading && teams.length === 0) {
    return <div className="text-center py-8">Loading teams...</div>;
  }

  if (teamsError) {
    return <div className="text-center py-8 text-red-500">Error loading teams: {teamsError}</div>;
  }

  if (profilesError) {
    return <div className="text-center py-8 text-red-500">Error loading profiles: {profilesError}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Team Management</h3>
        <button
          onClick={() => {
            setEditingTeam(null);
            setShowAddTeam(true);
          }}
          className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600 flex items-center"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          Create Team
        </button>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {teams.map(team => (
          <div key={team.id} className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-orange-500" />
                  {team.team_name}
                </h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="font-medium mr-1">Manager:</span> 
                    {getProfileInfo(team.manager)}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="font-medium mr-1">Team Lead:</span> 
                    {getProfileInfo(team.team_lead)}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Members:
                    </p>
                    <ul className="text-sm text-gray-600 list-disc list-inside ml-4">
                      {team.team_member.split(',').map((memberUid, index) => (
                        <li key={index} className="flex items-center">
                          {getProfileInfo(memberUid)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
                  Active
                </span>
                <button
                  onClick={() => {
                    setEditingTeam(team.id);
                    setShowAddTeam(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit team"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete team"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Form Popup */}
      {showAddTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </h3>
              <button
                onClick={() => {
                  setShowAddTeam(false);
                  setEditingTeam(null);
                }}
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
                  value={teamForm.team_name}
                  onChange={(e) => setTeamForm({ ...teamForm, team_name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <UserSelect
                  value={teamForm.manager}
                  onChange={(value) => setTeamForm({ ...teamForm, manager: value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Lead</label>
                <UserSelect
                  value={teamForm.team_lead}
                  onChange={(value) => setTeamForm({ ...teamForm, team_lead: value })}
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
                  {teamForm.team_member.map(member => (
                    <div key={member.uid} className="bg-gray-100 px-2 py-1 rounded flex items-center">
                      <span className="text-sm">{member.name}</span>
                      <button
                        onClick={() => handleRemoveMember(member.uid)}
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
                  onClick={() => {
                    setShowAddTeam(false);
                    setEditingTeam(null);
                  }}
                  className="px-4 py-2 border rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTeam}
                  disabled={teamsLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 disabled:bg-orange-300 flex items-center"
                >
                  {teamsLoading ? (
                    <>
                      <span className="animate-spin mr-1">↻</span>
                      {editingTeam ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      {editingTeam ? 'Update Team' : 'Create Team'}
                    </>
                  )}
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