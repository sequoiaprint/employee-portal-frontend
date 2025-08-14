import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeams } from '../../redux/team/team'; // Adjust import path as needed

const TeamSelect = ({ value, onChange, disabled = false }) => {
  const dispatch = useDispatch();
  const { teams, loading: teamsLoading, error: teamsError } = useSelector(state => state.teams);
  console.log(value);

  // Fetch teams only if they haven't been loaded yet
  useEffect(() => {
    if (teams.length === 0 && !teamsLoading) {
      dispatch(fetchTeams());
    }
  }, [dispatch, teams.length, teamsLoading]);

  // For better UX during loading
  if (teamsLoading && teams.length === 0) {
    return (
      <select disabled className="w-full p-2 border rounded bg-gray-100">
        <option>Loading teams...</option>
      </select>
    );
  }

  if (teamsError) {
    return (
      <select disabled className="w-full p-2 border rounded bg-red-50">
        <option className="text-red-500">Error loading teams</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        const selectedTeam = teams.find(t => t.id === e.target.value);
        onChange(e.target.value, selectedTeam);
      }}
      className="w-full p-2 border rounded"
      disabled={disabled || teamsLoading}
    >
      <option value="">Select a team</option>
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.team_name}
        </option>
      ))}
    </select>
  );
};

export default TeamSelect;