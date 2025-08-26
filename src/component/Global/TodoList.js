import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ChevronRight, Eye, RefreshCw } from 'lucide-react';
import Cookies from 'js-cookie';
import Request from './Request';
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

const TodoList = ({ onRemainingChange, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Fetch tasks from API
  const fetchTasks = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const userUid = getUserUid();

      console.log('Current user from Redux:', user);
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

      // Transform tasks and filter out completed ones
      const transformedTasks = data
        .filter(item => item.isCompleted !== 1) // Filter out completed tasks
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
      setRefreshing(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchTasks(true);
  };

  const truncateHtmlContent = (html, wordLimit = 25) => {
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

  // Separate tasks into general and project-based
  const generalTasks = tasks.filter(task => !task.projectId || task.projectId === "general");
  const projectTasks = tasks.filter(task => task.projectId && task.projectId !== "general");

  // Update remaining count when tasks change
  useEffect(() => {
    const remaining = tasks.filter((t) => !t.done).length;
    if (onRemainingChange) {
      onRemainingChange(remaining);
    }
  }, [tasks, onRemainingChange]);

  // Handle task click to open request modal
  const handleTaskClick = (task, event) => {
    event.stopPropagation(); // Prevent event bubbling
    setSelectedTask(task);
    setShowRequestModal(true);
  };

  // Handle task update from request modal
  const handleTaskUpdate = (updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No date";

    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error('Date formatting error:', err);
      return "Invalid date";
    }
  };

  // Get days until due date
  const getDaysUntilDue = (endDate) => {
    if (!endDate) return null;

    try {
      const today = new Date();
      const due = new Date(endDate);
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (err) {
      return null;
    }
  };

  // Render task item
  const renderTask = (task) => {
    const daysUntilDue = getDaysUntilDue(task.endDate);
    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;
    const isMoreDays = daysUntilDue > 2;

    return (
      <li
        key={task.id}
        onClick={(e) => handleTaskClick(task, e)}
        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer border border-gray-200 group"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span
                  className={`text-sm font-medium ${task.done ? "line-through text-gray-400" : "text-gray-800"
                    }`}
                >
                  <HtmlContentDisplay 
                    content={truncateHtmlContent(task.text)} 
                    className="task-title-preview"
                  />
                </span>
                {task.status && task.status !== 'pending' && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${task.status === 'urgent'
                      ? 'bg-red-100 text-red-800'
                      : task.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                    {task.status}
                  </span>
                )}
              </div>

              {/* Due date indicator */}
              {daysUntilDue !== null && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${isOverdue
                    ? 'bg-red-100 text-red-700'
                    : isDueSoon
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                  {isOverdue
                    ? `${Math.abs(daysUntilDue)} days overdue`
                    : daysUntilDue === 0
                      ? 'Due today'
                      : isMoreDays
                        ? `${daysUntilDue} more days left`
                        : `${daysUntilDue} days left`
                  }
                </span>
              )}
            </div>

            {/* Project name for project tasks */}
            {task.projectName && (
              <div className="text-xs text-blue-600 mb-2 font-medium">
                📁 {task.projectName}
              </div>
            )}

            <div className="text-xs text-gray-500 mb-2">
              <div className="flex justify-between">
                <span>Start: {formatDate(task.startDate)}</span>
                <span>Due: {formatDate(task.endDate)}</span>
              </div>
            </div>

            {task.comment && (
              <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded">
                <p className="italic line-clamp-2">"{task.comment}"</p>
              </div>
            )}
          </div>

          {/* Action indicator */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye size={16} className="text-gray-400" />
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>
      </li>
    );
  };

  // Render empty state
  const renderEmptyState = (type) => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-3">
        <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
      </div>
      <p className="text-gray-500 text-base font-medium">
        No {type} tasks available
      </p>
      <p className="text-gray-400 mt-1 text-sm">
        {type === 'general' ? 'All general tasks completed!' : 'No project assignments yet!'}
      </p>
    </div>
  );

  // Handle tab clicks
  const handleTabClick = (tab, event) => {
    event.stopPropagation(); // Prevent event bubbling
    setActiveTab(tab);
  };

  // Handle refresh click
  const handleRefreshClick = (event) => {
    event.stopPropagation(); // Prevent event bubbling
    handleRefresh();
  };

  // Handle close button click
  const handleCloseClick = (event) => {
    event.stopPropagation(); // Prevent event bubbling
    if (onClose) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="todolist-container w-[700px] bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">To Do List</h2>
          {onClose && (
            <button
              onClick={handleCloseClick}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
        <div className="flex flex-col justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-500 mb-3"></div>
          <p className="text-base text-gray-500">Loading tasks...</p>
          {debugInfo && (
            <p className="text-sm text-gray-400 mt-3 text-center">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  // Don't show error for 404 - just show empty state
  if (error && !debugInfo.includes('No assignments found for this user')) {
    return (
      <div className="todolist-container w-[700px] bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">To Do List</h2>
          {onClose && (
            <button
              onClick={handleCloseClick}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
        <div className="text-center py-12 text-red-500">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-base mb-3 font-medium">{error}</p>
          {debugInfo && (
            <p className="text-sm text-gray-400 mb-6">{debugInfo}</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="todolist-container w-[700px] bg-white rounded-xl shadow-lg border border-gray-200 max-h-[700px] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">To Do List</h2>
            <div className="flex items-center space-x-3">
              <p className="text-sm text-gray-500">Click on any task to view details</p>
              <button
                onClick={handleRefreshClick}
                disabled={refreshing}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  refreshing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700'
                }`}
                title="Refresh tasks"
              >
                <RefreshCw 
                  size={16} 
                  className={refreshing ? 'animate-spin' : ''} 
                />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              {onClose && (
                <button
                  onClick={handleCloseClick}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={(e) => handleTabClick('general', e)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'general'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              General
              {generalTasks.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  {generalTasks.filter(t => !t.done).length}
                </span>
              )}
            </button>
            <button
              onClick={(e) => handleTabClick('project', e)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'project'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Project Assignments
              {projectTasks.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  {projectTasks.filter(t => !t.done).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-3">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <p className="text-gray-500 text-base font-medium">
                No tasks available
              </p>
              <p className="text-gray-400 mt-1 text-sm">
                You don't have any assignments yet
              </p>
            </div>
          ) : activeTab === 'general' ? (
            <>
              {generalTasks.length === 0 ? (
                renderEmptyState('general')
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                      {generalTasks.length} task{generalTasks.length !== 1 ? 's' : ''} total
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {generalTasks.filter(t => !t.done).length} remaining
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {generalTasks.map(renderTask)}
                  </ul>
                </>
              )}
            </>
          ) : (
            <>
              {projectTasks.length === 0 ? (
                renderEmptyState('project')
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                      {projectTasks.length} assignment{projectTasks.length !== 1 ? 's' : ''} total
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {projectTasks.filter(t => !t.done).length} remaining
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {projectTasks.map(renderTask)}
                  </ul>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer with summary */}
        {tasks.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Total: {tasks.length} tasks
              </span>
              <span className="text-blue-600 font-medium">
                {tasks.filter(t => !t.done).length} pending overall
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedTask && (
        <Request
          task={selectedTask}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedTask(null);
          }}
          onUpdate={handleTaskUpdate}
        />
      )}
    </>
  );
};

export default TodoList;