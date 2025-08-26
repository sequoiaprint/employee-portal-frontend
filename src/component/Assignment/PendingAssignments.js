import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, User, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import HtmlContentDisplay, { getPlainTextFromHtml, isHtmlContentEmpty } from '../Global/HtmlContentDisplay';
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

const PendingAssignments = ({ isOpen, onClose, pendingTasks, onTaskCompleted }) => {
  const [assigneeProfiles, setAssigneeProfiles] = useState({});
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  //console.log(pendingTasks)

  const CurrentUid = Cookies.get('userUid');
  const role = Cookies.get('role');
  //  console.log(CurrentUid,role)
  const isAdmin = role === "Admin Ops";

  // Remove the canEdit check from here since it needs to be per task
  // const canEdit = isAdmin || CurrentUid === pendingTasks.assignee;
  // console.log(canEdit)

  const fetchProfile = async (uid) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return;
      }

      const response = await fetch(`https://internalApi.sequoia-print.com/api/profiles/${uid}`, {
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
      if (!pendingTasks || pendingTasks.length === 0) return;

      // Get unique assignee IDs from all tasks
      const uniqueAssigneeIds = [...new Set(pendingTasks.map(task => task.assignee).filter(Boolean))];

      const profiles = {};
      for (const uid of uniqueAssigneeIds) {
        if (uid) {
          const profileData = await fetchProfile(uid);
          if (profileData) {
            profiles[uid] = profileData;
          }
        }
      }

      setAssigneeProfiles(profiles);
    };

    if (isOpen) {
      fetchAllProfiles();
    }
  }, [pendingTasks, isOpen]);

  const getAssigneeName = (uid) => {
    const profile = assigneeProfiles[uid];
    if (!profile) return uid;

    const profileData = profile.data || profile;

    if (profileData.firstname || profileData.lastname) {
      return `${profileData.firstname || ''} ${profileData.lastname || ''}`.trim();
    }

    if (profileData.username) {
      return profileData.username;
    }

    return uid;
  };

  const handleMarkAsCompleted = async (taskId) => {
    if (confirmationText.toLowerCase() !== 'confirm') {
      setError('Please type "confirm" to complete the task');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const updateData = {
        status: 'completed',
        isCompleted: 1
      };

      const response = await fetch(`https://internalApi.sequoia-print.com/api/assignment/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Reset state first
      setConfirmationText('');
      setCompletingTaskId(null);
      setIsProcessing(false);

      // Call the parent callback to refresh tasks
      if (onTaskCompleted) {
        onTaskCompleted();
      }

    } catch (error) {
      console.error('Error marking task as completed:', error);
      setError('Failed to mark task as completed');
      setIsProcessing(false);
    }
  };

  const handleCancelCompletion = () => {
    setCompletingTaskId(null);
    setConfirmationText('');
    setError('');
  };

  const handleStartCompletion = (taskId) => {
    setCompletingTaskId(taskId);
    setConfirmationText('');
    setError('');
  };
  const truncateHtmlContent = (html, wordLimit = 1025) => {
    if (!html) return '';

    // Get plain text to count words
    const plainText = getPlainTextFromHtml(html);
    const words = plainText.split(' ');

    if (words.length <= wordLimit) return html;

    // Create a temporary element to parse HTML
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    // Function to recursively truncate text content
    const truncateNode = (node, remainingWords) => {
      if (remainingWords <= 0) return 0;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const words = text.split(' ');

        if (words.length <= remainingWords) {
          return remainingWords - words.length;
        } else {
          node.textContent = words.slice(0, remainingWords).join(' ') + '...';
          return 0;
        }
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length && remainingWords > 0; i++) {
          remainingWords = truncateNode(node.childNodes[i], remainingWords);
        }
      }

      return remainingWords;
    };

    // Truncate the content
    truncateNode(tempElement, wordLimit);

    return tempElement.innerHTML;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Pending Assignments</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No pending assignments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.map(task => {
              // Check canEdit for each individual task
              const canEdit = isAdmin || CurrentUid === task.assignee;
              console.log(`Task ${task.id}: canEdit = ${canEdit}, CurrentUid = ${CurrentUid}, task.assignee = ${task.assignee}`);

              return (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900"><HtmlContentDisplay 
                        content={truncateHtmlContent(task.title)} 
                        className="task-title-preview"
                      /></h3>
                    {(completingTaskId !== task.id && canEdit) && (
                      <button
                        onClick={() => handleStartCompletion(task.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Completed
                      </button>
                    )}
                  </div>

                  {completingTaskId === task.id && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800 mb-2">
                        Are you sure you want to mark this task as completed? Type "confirm" to proceed.
                      </p>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={confirmationText}
                          onChange={(e) => setConfirmationText(e.target.value)}
                          placeholder="Type 'confirm'"
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                          disabled={isProcessing}
                        />
                        <button
                          onClick={() => handleMarkAsCompleted(task.id)}
                          disabled={isProcessing}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 disabled:opacity-50"
                        >
                          {isProcessing ? 'Processing...' : 'Confirm'}
                        </button>
                        <button
                          onClick={handleCancelCompletion}
                          disabled={isProcessing}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                      {error && (
                        <div className="flex items-center gap-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{getAssigneeName(task.assignee)}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Due: {task.dueDate.toLocaleDateString()}</span>
                    </div>

                    {task.comment && (
                      <div className="col-span-2 flex items-start">
                        <FileText className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{task.comment}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingAssignments;