import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, MessageCircle, User, Link } from 'lucide-react';
import Cookies from 'js-cookie';

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

const Task = ({ tasks, selectedDate }) => {
  const [assigneeProfiles, setAssigneeProfiles] = useState({});

  const fetchProfile = async (uid) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token available');
        return;
      }

      const response = await fetch(`http://localhost:9000/api/profiles/${uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAllProfiles = async () => {
      // Get unique assignee IDs from all tasks
      const uniqueAssigneeIds = [...new Set(tasks.map(task => task.assignee))];
      
      const profiles = {};
      for (const uid of uniqueAssigneeIds) {
        if (uid) {
          const profileData = await fetchProfile(uid);
          if (profileData) {
            // Store the profile data including the success flag
            profiles[uid] = profileData;
          }
        }
      }
      
      setAssigneeProfiles(profiles);
    };

    if (tasks.length > 0) {
      fetchAllProfiles();
    }
  }, [tasks]);

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return tasks.filter(task => task.dueDate.toDateString() === dateStr);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'in-progress':
        return <Clock className="text-blue-500" size={16} />;
      case 'overdue':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'completed': 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in-progress':
        return 'in progress';
      case 'completed':
        return 'completed';
      case 'overdue':
        return 'overdue';
      default:
        return status;
    }
  };

  const getAssigneeName = (uid) => {
    const profile = assigneeProfiles[uid];
    if (!profile) return uid; // Return UID if no profile found
    
    // Check if we have the direct data object (from your API response structure)
    const profileData = profile.data || profile;
    
    // First try firstname + lastname
    if (profileData.firstname || profileData.lastname) {
      return `${profileData.firstname || ''} ${profileData.lastname || ''}`.trim();
    }
    
    // Then try username
    if (profileData.username) {
      return profileData.username;
    }
    
    // Fallback to UID
    return uid;
  };

  const tasksForSelectedDate = getTasksForDate(selectedDate);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Tasks for {selectedDate ? formatDate(selectedDate) : 'Select a Date'}
      </h2>
      
      {tasksForSelectedDate.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No tasks scheduled for this date</p>
            <p className="text-sm text-gray-500 mt-1">Select a different date to view tasks</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {tasksForSelectedDate.map(task => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 flex-1 pr-4">{task.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <User size={14} className="text-gray-400" />
                    <span>{getAssigneeName(task.assignee)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(task.status)}
                    <span>Due {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {task.comment && (
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} className="text-gray-400" />
                      <span>Comment</span>
                    </div>
                  )}
                  {task.urls && (
                    <div className="flex items-center gap-1">
                      <Link size={14} className="text-gray-400" />
                      <span>Attachment</span>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  {task.comment && (
                    <p className="italic">"{task.comment}"</p>
                  )}
                </div>
                
                {task.urls && (
                  <a 
                    href={task.urls} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors block mb-2"
                  >
                    View Attachment
                  </a>
                )}
                
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;