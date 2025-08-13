import React, { useState, useEffect } from 'react';
import { Clock } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { 
  createWorkSchedule, 
  updateWorkSchedule, 
  deleteWorkSchedule
} from '../../../redux/profile/profile';

const daysOfWeek = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' }
];

const WorkSchedule = ({ schedules, setSchedules, isEditing, employeeId }) => {
  const dispatch = useDispatch();
  const { loading, profiles, currentProfile } = useSelector((state) => state.profile);
  const [localSchedules, setLocalSchedules] = useState(schedules || []);
  const [activeEdits, setActiveEdits] = useState({});

  // Get the latest schedules from Redux state
  const getLatestSchedules = () => {
    // First try to get from profiles array
    const profileFromList = profiles.find(p => p.uid === employeeId);
    if (profileFromList && profileFromList.work_schedules) {
      return profileFromList.work_schedules;
    }
    
    // Then try current profile if it matches
    if (currentProfile && currentProfile.uid === employeeId && currentProfile.work_schedules) {
      return currentProfile.work_schedules;
    }
    
    // Fallback to prop
    return schedules || [];
  };

  // Update local schedules when Redux state changes
  useEffect(() => {
    const latestSchedules = getLatestSchedules();
    setLocalSchedules(latestSchedules);
    
    // Also update parent component
    if (setSchedules) {
      setSchedules(latestSchedules);
    }
  }, [profiles, currentProfile, employeeId, schedules]);

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...localSchedules];
    const scheduleToUpdate = updatedSchedules[index];
    
    const newSchedule = { 
      ...scheduleToUpdate, 
      [field]: value,
      days: field === 'start_day_name' || field === 'end_day_name' 
        ? calculateDays(
            field === 'start_day_name' ? value : scheduleToUpdate.start_day_name,
            field === 'end_day_name' ? value : scheduleToUpdate.end_day_name
          )
        : scheduleToUpdate.days
    };
    
    updatedSchedules[index] = newSchedule;
    setLocalSchedules(updatedSchedules);
    setActiveEdits(prev => ({ ...prev, [index]: true }));
  };

  const calculateDays = (startDay, endDay) => {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const startIndex = dayOrder.indexOf(startDay);
    const endIndex = dayOrder.indexOf(endDay);
    return endIndex >= startIndex ? endIndex - startIndex + 1 : 7 - startIndex + endIndex + 1;
  };

  const addNewSchedule = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const newSchedule = {
      id: `temp_${Date.now()}`,
      start_day_name: 'Monday',
      end_day_name: 'Friday',
      start_time: '09:00',
      end_time: '17:00',
      days: 5,
      isNew: true,
      isTemporary: true
    };

    const updatedSchedules = [...localSchedules, newSchedule];
    setLocalSchedules(updatedSchedules);
    setActiveEdits(prev => ({ ...prev, [localSchedules.length]: true }));
  };

  const saveSchedule = async (index) => {
    const scheduleToSave = localSchedules[index];
    
    try {
      if (scheduleToSave.isTemporary) {
        // Create new schedule
        const result = await dispatch(createWorkSchedule({
          employeeId,
          scheduleData: {
            start_day_name: scheduleToSave.start_day_name,
            end_day_name: scheduleToSave.end_day_name,
            start_time: scheduleToSave.start_time,
            end_time: scheduleToSave.end_time,
            days: scheduleToSave.days
          }
        })).unwrap();

        // The Redux state will be updated automatically via the fulfilled action
        // No need to manually update local state here since useEffect will handle it
      } else {
        // Update existing schedule
        await dispatch(updateWorkSchedule({
          employeeId,
          scheduleId: scheduleToSave.id,
          scheduleData: {
            start_day_name: scheduleToSave.start_day_name,
            end_day_name: scheduleToSave.end_day_name,
            start_time: scheduleToSave.start_time,
            end_time: scheduleToSave.end_time,
            days: scheduleToSave.days
          }
        })).unwrap();
      }
      
      setActiveEdits(prev => ({ ...prev, [index]: false }));
    } catch (error) {
      console.error('Error saving schedule:', error);
      // Revert changes on error
      const latestSchedules = getLatestSchedules();
      setLocalSchedules(latestSchedules);
    }
  };

  const removeSchedule = async (index, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const scheduleToRemove = localSchedules[index];
    
    // If it's a new/temporary schedule, just remove it locally
    if (scheduleToRemove.isTemporary) {
      const updatedSchedules = localSchedules.filter((_, i) => i !== index);
      setLocalSchedules(updatedSchedules);
      
      // Update parent if needed
      if (setSchedules) {
        setSchedules(updatedSchedules);
      }
      return;
    }
    
    try {
      await dispatch(deleteWorkSchedule({
        employeeId,
        scheduleId: scheduleToRemove.id
      })).unwrap();
      
      // The Redux state will be updated automatically via the fulfilled action
      // No need to manually update local state here since useEffect will handle it
    } catch (error) {
      console.error('Error deleting schedule:', error);
      // Revert changes on error
      const latestSchedules = getLatestSchedules();
      setLocalSchedules(latestSchedules);
    }
  };

  const cancelEdit = (index) => {
    // Revert to original state
    const latestSchedules = getLatestSchedules();
    setLocalSchedules(latestSchedules);
    setActiveEdits(prev => ({ ...prev, [index]: false }));
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">Work Schedules</h3>
        {isEditing && (
          <button
            onClick={addNewSchedule}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            disabled={loading}
          >
            + Add Schedule
          </button>
        )}
      </div>
      <div className="space-y-3">
        {localSchedules.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            No work schedules defined
          </div>
        ) : (
          localSchedules.map((ws, index) => (
            <div
              key={ws.id || `schedule-${index}`}
              className="border p-3 rounded-md bg-gray-50 text-sm relative"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Day</label>
                      <select
                        value={ws.start_day_name}
                        onChange={(e) => handleScheduleChange(index, 'start_day_name', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        disabled={loading}
                      >
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>{day.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Day</label>
                      <select
                        value={ws.end_day_name}
                        onChange={(e) => handleScheduleChange(index, 'end_day_name', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        disabled={loading}
                      >
                        {daysOfWeek.map(day => (
                          <option key={day.value} value={day.value}>{day.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={ws.start_time}
                        onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Time</label>
                      <input
                        type="time"
                        value={ws.end_time}
                        onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Days: {ws.days}</span>
                    <div className="flex space-x-2">
                      {activeEdits[index] && (
                        <>
                          <button
                            onClick={() => saveSchedule(index)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => cancelEdit(index)}
                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => removeSchedule(index, e)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg font-bold"
                    disabled={loading}
                    title="Remove Schedule"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p>
                      <strong>{ws.start_day_name}</strong> → <strong>{ws.end_day_name}</strong>
                    </p>
                    <p>
                      <Clock className="h-4 w-4 inline mr-1 text-gray-500" />
                      {ws.start_time} - {ws.end_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600">Days: {ws.days}</span>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkSchedule;