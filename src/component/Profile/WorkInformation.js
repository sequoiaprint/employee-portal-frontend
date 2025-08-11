import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

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

const WorkInformation = ({ formData }) => {
  const [managerName, setManagerName] = useState('');

  useEffect(() => {
    const fetchManagerData = async () => {
      if (!formData?.manager) return;

      const encryptedToken = Cookies.get('authToken');
      const token = xorDecrypt(encryptedToken);

      if (!token) return;

      try {
        const response = await fetch(
          `http://localhost:9000/api/profiles/${formData.manager}`,
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Work Information</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Join Date</p>
          <p className="font-medium text-gray-900">{formatDate(formData.joinDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Employee ID</p>
          <p className="font-medium text-gray-900">{formData.EmployeeID}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Manager</p>
          <p className="font-medium text-gray-900">{managerName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Work Schedule</p>
          {formData?.work_schedule?.length > 0 ? (
            <ul className="font-medium text-gray-900 space-y-1">
              {formData.work_schedule.map((schedule) => (
                <li key={schedule.id}>
                  {schedule.start_day_name} - {schedule.end_day_name},{' '}
                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-medium text-gray-900">N/A</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkInformation;
