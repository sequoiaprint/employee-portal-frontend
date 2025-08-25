import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProjects,
  selectAllProjects,
} from '../../redux/project/project';
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

const getUserUid = () => {
  const encryptedUserUid = Cookies.get('userUid');
  if (!encryptedUserUid) {
    return null;
  }

  const userUid = encryptedUserUid
  if (!userUid) {
    console.warn('Failed to decrypt user UID');
    return null;
  }

  return userUid;
};

const ProfileHeader = ({ formData }) => {
  const dispatch = useDispatch();
  const [uid] = useState(Cookies.get('userUid') || '');
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const allProjects = useSelector(selectAllProjects);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  console.log(formData)

  const handleEditClick = () => {
    navigate('/profile/edit');
  };
  
  const isUserPartOfProject = (project) => {
    const userUid = uid;
    
    if (project.team_manager_uid === userUid) return true;
    if (project.team_lead_uid === userUid) return true;
    if (project.team_member && project.team_member.split(',').includes(userUid)) return true;
    
    return false;
  };

  const userProjects = allProjects ? allProjects.filter(isUserPartOfProject) : [];
  console.log(userProjects)
  
  const projects = useSelector(selectAllProjects);

  // Calculate success rate based on completed tasks
  const calculateSuccessRate = () => {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => 
      task.status === "completed" || task.done === true
    ).length;
    
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const successRate = calculateSuccessRate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const userUid = getUserUid();

        console.log('User UID from cookies:', userUid);

        if (!userUid) {
          setError("User UID not found in cookies");
          setDebugInfo("User UID is missing from cookies");
          return;
        }

        const token = getAuthToken();
        if (!token) {
          setError("No authentication token found");
          setDebugInfo("Authentication token is missing");
          return;
        }

        const apiUrl = `https://internalApi.sequoia-print.com/api/assignment/assigned-person/${userUid}`;
        console.log('API URL:', apiUrl);
        setDebugInfo(`Calling API: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);

        if (response.status === 404) {
          // Handle 404 specifically - no assignments found
          console.log('No assignments found for user');
          setTasks([]);
          setError(null);
          setDebugInfo('No assignments found for this user');
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw API response:', data);

        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data, data);
          setError("Invalid data format received from server");
          return;
        }

        if (data.length === 0) {
          console.log('No tasks found for user:', userUid);
          setDebugInfo(`No tasks found for user: ${userUid}`);
        }

        // Replace the current task transformation code with this:
        const transformedTasks = data 
          .map(item => {
            console.log('Transforming item:', item);
            return {
              id: item.id,
              text: item.task,
              done: item.isCompleted === 1,
              startDate: item.startDate,
              endDate: item.endDate,
              comment: item.comment || '',
              status: item.status || 'pending',
              projectId: item.projectId || null,
              projectName: item.projectName || null
            };
          });

        console.log('Transformed tasks:', transformedTasks);
        setTasks(transformedTasks);
        setError(null);
        setDebugInfo(`Successfully loaded ${transformedTasks.length} tasks`);

      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(`Failed to load tasks: ${err.message}`);
        setDebugInfo(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
          <ProfileAvatar 
            image={formData.profileImage}
            name={formData.name}
            size="large"
            showBorder={true}
          />
          <div className="text-white mt-4 sm:mt-0">
            <h1 className="text-3xl font-bold mb-2">{formData.name}</h1>
            <p className="text-orange-100 text-lg">{formData.position}</p>
            <p className="text-orange-200 text-sm">{formData.department}</p>
          </div>
        </div>
      </div>
      
      <div className="px-8 py-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-8 justify-center sm:justify-start">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userProjects.length}</p>
              <p className="text-sm text-gray-600">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              <p className="text-sm text-gray-600">Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
          <button
            onClick={handleEditClick}
            className="w-full sm:w-auto bg-gradient-to-r from-[#EA7125] to-[#F58E3F] text-white px-6 py-2 rounded-lg hover:from-[#F58E3F] hover:to-[#EA7125] transition-all duration-200 font-semibold shadow-md"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;