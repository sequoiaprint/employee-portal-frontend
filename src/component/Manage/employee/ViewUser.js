import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, MapPin, User, Edit, Save } from "lucide-react";
import UserSelect from '../../Global/SelectProfile';
import { useSelector, useDispatch } from 'react-redux';
import WorkSchedule from './WorkSchedules';
import { updateProfile } from '../../../redux/profile/profile';
import PhotoUploader from '../../Global/uploader';// Import the PhotoUploader component

const ViewUser = ({ user, onClose }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const { profiles, loading } = useSelector(state => state.profile);

  // Get the latest user data from Redux state
  const getLatestUser = () => {
    if (!user || !user.uid) return user;
    
    const updatedUser = profiles.find(p => p.uid === user.uid);
    return updatedUser || user;
  };

  // Update local state when user prop changes or when profiles in Redux change
  useEffect(() => {
    const latestUser = getLatestUser();
    setEditedUser({ ...latestUser });
  }, [user, profiles]);

  if (!user) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleManagerChange = (uid) => {
    setEditedUser(prev => ({ ...prev, manager: uid }));
  };

  const handleWorkScheduleUpdate = (newSchedules) => {
    setEditedUser(prev => ({ ...prev, work_schedules: newSchedules }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile({
        uid: user.uid,
        profileData: editedUser
      })).unwrap();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Revert to latest state from Redux on error
      const latestUser = getLatestUser();
      setEditedUser({ ...latestUser });
    }
  };

  const handleCancel = () => {
    // Revert to latest state from Redux
    const latestUser = getLatestUser();
    setEditedUser({ ...latestUser });
    setIsEditing(false);
  };

  const getManagerName = (uid) => {
    if (!profiles || !uid) return "N/A";
    const manager = profiles.find(p => p.uid === uid);
    if (!manager) return "N/A";
    return [manager.firstname, manager.lastname].filter(Boolean).join(' ') || 
           manager.username || 
           uid;
  };

  // Handle successful profile picture upload
  const handleProfilePicUpload = (url) => {
    setEditedUser(prev => ({ ...prev, profilepicurl: url }));
  };

  // Handle upload error
  const handleUploadError = (error) => {
    console.error('Profile picture upload failed:', error);
    // You might want to show a toast notification here
  };

  // Use the latest user data for display
  const displayUser = getLatestUser();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl relative max-h-[90vh] overflow-y-auto">
        {/* Header with Close and Edit/Save buttons */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit User" : "User Details"}
          </h2>
          <div className="flex space-x-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex items-center space-x-4 border-b pb-4 mb-4">
          <div className="relative">
            {isEditing ? (
              <PhotoUploader
                onUploadSuccess={handleProfilePicUpload}
                onUploadError={handleUploadError}
              >
                <div className="relative">
                  <img
                    src={editedUser.profilepicurl || "/placeholder-profile.png"}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border object-cover"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%23gray'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full">
                    <Edit className="h-3 w-3" />
                  </div>
                </div>
              </PhotoUploader>
            ) : (
              <img
                src={displayUser.profilepicurl || "/placeholder-profile.png"}
                alt="Profile"
                className="w-20 h-20 rounded-full border object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%23gray'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                }}
              />
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  name="firstname"
                  value={editedUser.firstname || ''}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  name="lastname"
                  value={editedUser.lastname || ''}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full p-2 border rounded"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900">
                  {displayUser.firstname || displayUser.lastname
                    ? `${displayUser.firstname || ""} ${displayUser.lastname || ""}`
                    : displayUser.username || "No Name"}
                </h2>
                <p className="text-sm text-gray-500">{displayUser.role || "No Role"}</p>
              </>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editedUser.email || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p>{displayUser.email || "N/A"}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="phonno"
                value={editedUser.phonno || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p>{displayUser.phonno || "N/A"}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Department</label>
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={editedUser.department || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p>{displayUser.department || "N/A"}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Designation</label>
            {isEditing ? (
              <input
                type="text"
                name="designation"
                value={editedUser.designation || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p>{displayUser.designation || "N/A"}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Location</label>
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={editedUser.location || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                {displayUser.location || "N/A"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Manager</label>
            {isEditing ? (
              <UserSelect
                value={editedUser.manager || ''}
                onChange={handleManagerChange}
                disabled={false}
              />
            ) : (
              <p className="flex items-center">
                <User className="h-4 w-4 mr-1 text-gray-500" />
                {getManagerName(displayUser.manager)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Join Date</label>
            {isEditing ? (
              <input
                type="date"
                name="joindate"
                value={editedUser.joindate ? editedUser.joindate.split('T')[0] : ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                {formatDate(displayUser.joindate)}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 mb-6">
          <label className="block text-gray-700 font-medium mb-1">Bio</label>
          {isEditing ? (
            <textarea
              name="bio"
              value={editedUser.bio || ''}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-2 border rounded"
            />
          ) : (
            <p className="text-gray-700 text-sm">{displayUser.bio || "N/A"}</p>
          )}
        </div>

        {/* Work Schedules */}
        {/* <WorkSchedule 
          schedules={displayUser.work_schedules || []} 
          setSchedules={handleWorkScheduleUpdate}
          isEditing={isEditing}
          employeeId={displayUser.uid}
        /> */}

        {isEditing && (
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUser;