import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ClipboardList, CheckCircle2, RefreshCcw, AlertTriangle, Search, Filter, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';
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

const ViewTaskByStatus = ({ isOpen, onClose, tasks, statusType, statusLabel }) => {
  const [assigneeProfiles, setAssigneeProfiles] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [suggestedAssignees, setSuggestedAssignees] = useState([]);
  const [showAssigneeSuggestions, setShowAssigneeSuggestions] = useState(false);

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
      if (!tasks || tasks.length === 0) return;
      
      // Get unique assignee IDs from all tasks
      const uniqueAssigneeIds = [...new Set(tasks.map(task => task.assignee).filter(Boolean))];

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
      // Reset filters when modal opens
      setSearchTerm('');
      setDueDateFilter('');
      setAssigneeFilter('');
      setShowFilters(false);
    }
  }, [tasks, isOpen]);

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

  // Get all assignee names for suggestions
  const allAssigneeNames = useMemo(() => {
    const assigneeIds = [...new Set(tasks.map(task => task.assignee).filter(Boolean))];
    return assigneeIds.map(uid => ({
      uid,
      name: getAssigneeName(uid)
    })).filter(item => item.name && item.name !== item.uid);
  }, [tasks, assigneeProfiles]);

  // Filter assignee suggestions based on input
  useEffect(() => {
    if (assigneeFilter.trim() === '') {
      setSuggestedAssignees(allAssigneeNames.slice(0, 5));
    } else {
      const filtered = allAssigneeNames.filter(assignee =>
        assignee.name.toLowerCase().includes(assigneeFilter.toLowerCase())
      );
      setSuggestedAssignees(filtered.slice(0, 5));
    }
  }, [assigneeFilter, allAssigneeNames]);

  // Filter tasks based on search and filter criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search term filter (title and comment)
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.comment && task.comment.toLowerCase().includes(searchTerm.toLowerCase()));

      // Due date filter
      const matchesDueDate = dueDateFilter === '' || 
        new Date(task.dueDate).toLocaleDateString() === new Date(dueDateFilter).toLocaleDateString();

      // Assignee filter
      const matchesAssignee = assigneeFilter === '' || 
        getAssigneeName(task.assignee).toLowerCase().includes(assigneeFilter.toLowerCase());

      return matchesSearch && matchesDueDate && matchesAssignee;
    });
  }, [tasks, searchTerm, dueDateFilter, assigneeFilter, assigneeProfiles]);

  const handleAssigneeSelect = (assigneeName) => {
    setAssigneeFilter(assigneeName);
    setShowAssigneeSuggestions(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDueDateFilter('');
    setAssigneeFilter('');
  };

  const hasActiveFilters = searchTerm !== '' || dueDateFilter !== '' || assigneeFilter !== '';

  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (statusType) {
      case 'total':
        return <ClipboardList className="w-6 h-6 text-orange-500" />;
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'in-progress':
        return <RefreshCcw className="w-6 h-6 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default:
        return <ClipboardList className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>;
      case 'in-progress':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">In Progress</span>;
      case 'overdue':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Overdue</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <h2 className="text-xl font-semibold text-gray-900">
              {statusLabel} Tasks ({filteredTasks.length})
            </h2>
            {hasActiveFilters && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                Filtered
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filters Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks by title or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Due Date Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDateFilter}
                    onChange={(e) => setDueDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Assignee Filter with Suggestions */}
                <div className="relative">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Assignee
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search assignee..."
                      value={assigneeFilter}
                      onChange={(e) => {
                        setAssigneeFilter(e.target.value);
                        setShowAssigneeSuggestions(true);
                      }}
                      onFocus={() => setShowAssigneeSuggestions(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    
                    {showAssigneeSuggestions && suggestedAssignees.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestedAssignees.map((assignee) => (
                          <div
                            key={assignee.uid}
                            onClick={() => handleAssigneeSelect(assignee.name)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            {assignee.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="md:col-span-2">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {hasActiveFilters 
                  ? 'No tasks match your filters. Try adjusting your search criteria.'
                  : `No ${statusLabel.toLowerCase()} tasks found.`
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-orange-600 hover:text-orange-800 text-sm font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="grid gap-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900"> <HtmlContentDisplay 
                        content={truncateHtmlContent(task.title, 25)} 
                        className="task-title-preview"
                      /></h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Assignee: {getAssigneeName(task.assignee) || 'Unassigned'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {formatDate(task.dueDate)}
                        </p>
                        {task.comment && (
                          <p className="text-sm text-gray-600 mt-2">Comment: {task.comment}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(task.status)}
                        {task.hasComment && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            Has Comment
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTaskByStatus;