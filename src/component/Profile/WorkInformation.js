import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import ScheduleFormModal from './ScheduleFormModal';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createWorkSchedule, 
  updateWorkSchedule, 
  deleteWorkSchedule,
  fetchProfile
} from '../../redux/profile/profile';
// XOR decryption function
const xorDecrypt = (encrypted, secretKey = '28032002') => {
  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode =
        decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Convert HH:mm:ss to 12-hour AM/PM format
const formatTime = (time) => {
  const [hour, minute] = time.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

// Format ISO date to readable format
const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const WorkInformation = ({ formData, onUpdate }) => {
  const dispatch = useDispatch();
  const { currentProfile, loading } = useSelector((state) => state.profile);
  const [managerName, setManagerName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [modalMode, setModalMode] = useState('add');


  useEffect(() => {
    const fetchManagerData = async () => {
      if (!formData?.manager) return;

      const encryptedToken = Cookies.get('authToken');
      const token = xorDecrypt(encryptedToken);

      if (!token) return;

      try {
        const response = await fetch(
          `https://internalApi.sequoia-print.com/api/profiles/${formData.manager}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching manager profile: ${response.statusText}`);
        }

        const resJson = await response.json();
        const manager = resJson.data;
        const fullName = `${manager.firstname || ''} ${manager.lastname || ''}`.trim();
        setManagerName(fullName || manager.username || 'N/A');
      } catch (error) {
        console.error('Failed to fetch manager data:', error);
        setManagerName('N/A');
      }
    };

    fetchManagerData();
  }, [formData.manager]);

  const handleAddSchedule = () => {
    setModalMode('add');
    setCurrentSchedule(null);
    setShowModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setModalMode('edit');
    setCurrentSchedule(schedule);
    setShowModal(true);
  };

 const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await dispatch(deleteWorkSchedule({
        employeeId: formData.EmployeeID,
        scheduleId
      })).unwrap();
      
      // Refresh the profile data
      dispatch(fetchProfile(formData.EmployeeID));
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule');
    }
  };

 const handleSubmitSchedule = async (data) => {
    try {
      const scheduleData = {
        days: `${data.start_day_name}-${data.end_day_name}`,
        start_day_name: data.start_day_name,
        end_day_name: data.end_day_name,
        start_time: data.start_time,
        end_time: data.end_time
      };

      if (modalMode === 'add') {
        await dispatch(createWorkSchedule({
          employeeId: formData.EmployeeID,
          scheduleData
        })).unwrap();
      } else {
        await dispatch(updateWorkSchedule({
          employeeId: formData.EmployeeID,
          scheduleId: currentSchedule.id,
          scheduleData
        })).unwrap();
      }

      setShowModal(false);
      // Refresh the profile data
      dispatch(fetchProfile(formData.EmployeeID));
    } catch (error) {
      console.error(`Error ${modalMode}ing schedule:`, error);
      alert(error.message || `Failed to ${modalMode} schedule`);
    }
  };

  // Use currentProfile instead of formData when available
  const profileData = currentProfile || formData;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Work Information</h3>
        {formData?.EmployeeID && (
          <button
            onClick={handleAddSchedule}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Schedule
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Join Date</p>
          <p className="font-medium text-gray-900">{formatDate(formData.joinDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Employee ID</p>
          <p className="font-medium text-gray-900">{formData.EmployeeID || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Manager</p>
          <p className="font-medium text-gray-900">{managerName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Work Schedule</p>
          {formData?.work_schedule?.length > 0 ? (
            <ul className="font-medium text-[12px] text-gray-900 space-y-2">
              {formData.work_schedule.map((schedule) => (
                <li key={schedule.id} className="flex justify-between items-center">
                  <span>
                    {schedule.start_day_name} - {schedule.end_day_name},{' '}
                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                  </span>
                  <div className="space-x-2 text-[12px]">
                    <button
                      onClick={() => handleEditSchedule(schedule)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-medium text-gray-900">No schedules added</p>
          )}
        </div>
      </div>

      <ScheduleFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitSchedule}
        schedule={currentSchedule}
        mode={modalMode}
      />
    </div>
  );
};

export default WorkInformation;