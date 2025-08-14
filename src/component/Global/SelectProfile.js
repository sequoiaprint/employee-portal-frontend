import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProfiles } from '../../redux/profile/profile';

const UserSelect = ({ value, onChange, disabled = false }) => {
  const dispatch = useDispatch();
  const { profiles, loading, error } = useSelector(state => ({
    profiles: state.profile.profiles || [],
    loading: state.profile.loading,
    error: state.profile.error
  }));
  console.log(value)

  // Fetch profiles only if they haven't been loaded yet
  useEffect(() => {
    if (profiles.length === 0 && !loading) {
      dispatch(fetchAllProfiles());
    }
  }, [dispatch, profiles.length, loading]);

  // For better UX during loading
  if (loading && profiles.length === 0) {
    return (
      <select disabled className="w-full p-2 border rounded bg-gray-100">
        <option>Loading employees...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select disabled className="w-full p-2 border rounded bg-red-50">
        <option className="text-red-500">Error loading employees</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        const selectedProfile = profiles.find(p => p.uid === e.target.value);
        onChange(e.target.value, selectedProfile);
      }}
      className="w-full p-2 border rounded"
      disabled={disabled || loading}
    >
      <option value="">Select a user</option>
      {profiles.map((profile) => (
        <option key={profile.uid} value={profile.uid}>
          {[profile.firstname, profile.lastname].filter(Boolean).join(' ') ||
            profile.username ||
            profile.uid}
        </option>
      ))}
    </select>
  );
};

export default UserSelect;