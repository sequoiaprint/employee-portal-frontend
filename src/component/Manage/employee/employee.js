import React, { useEffect, useState } from 'react';
import { Plus, Trash, User as UserIcon, X, Calendar, Search, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProfiles, deleteProfile } from '../../../redux/profile/profile';
import AddUser from './AddUser';
import ViewUser from './ViewUser';
import WorkSchedule from './WorkSchedules';

const EmployeeComponent = ({ preview = false, onProfileCountChange }) => {
  const dispatch = useDispatch();
  const { profiles, loading, error } = useSelector((state) => state.profile);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showScheduleDetails, setShowScheduleDetails] = useState(false);
  //console.log(profiles.length)
  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('displayName');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    dispatch(fetchAllProfiles());
  }, [dispatch]);


  // Send profiles length to parent component when profiles change
useEffect(() => {
  if (onProfileCountChange && profiles) {
    onProfileCountChange(profiles.length);
  }
}, [profiles, onProfileCountChange]);
  // Update selectedUser when profiles change (to reflect latest data)
  useEffect(() => {
    if (selectedUser && selectedUser.uid && profiles) {
      const updatedUser = profiles.find(p => p.uid === selectedUser.uid);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  }, [profiles, selectedUser?.uid]);

  // Generate suggestions based on search term and field
  useEffect(() => {
    if (searchTerm.length > 0 && profiles) {
      const filtered = profiles.filter(employee => {
        let fieldValue = '';
        
        if (searchField === 'displayName') {
          const displayName = getDisplayName(employee);
          fieldValue = displayName.toLowerCase();
        } else {
          fieldValue = String(employee[searchField] || '').toLowerCase();
        }
        
        return fieldValue.includes(searchTerm.toLowerCase());
      });
      
      const uniqueSuggestions = [...new Set(
        filtered.map(employee => {
          if (searchField === 'displayName') {
            return getDisplayName(employee);
          }
          return employee[searchField];
        })
      )].filter(Boolean);
      
      setSuggestions(uniqueSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, searchField, profiles]);

  const getDisplayName = (employee) => {
    return employee.firstname && employee.lastname
      ? `${employee.firstname} ${employee.lastname}`
      : employee.username || "User";
  };

  const formatWorkSchedule = (schedules) => {
    if (!schedules || schedules.length === 0) return 'No schedule set';
    
    return schedules.map(schedule => {
      const daysText = schedule.days === 5 
        ? `${schedule.start_day_name} to ${schedule.end_day_name}`
        : schedule.start_day_name;
      
      return `${daysText}, ${schedule.start_time} - ${schedule.end_time}`;
    }).join(' | ');
  };

  const filteredProfiles = profiles ? profiles.filter(employee => {
    if (!searchTerm) return true;
    
    let fieldValue = '';
    if (searchField === 'displayName') {
      fieldValue = getDisplayName(employee).toLowerCase();
    } else {
      fieldValue = String(employee[searchField] || '').toLowerCase();
    }
    
    return fieldValue.includes(searchTerm.toLowerCase());
  }) : [];

  const uniqueFilteredProfiles = Array.from(
    new Map(filteredProfiles.map((p) => [p.uid || p.email || p.name, p])).values()
  );

  const displayedProfiles = preview
    ? uniqueFilteredProfiles.slice(0, 5)
    : uniqueFilteredProfiles;

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  if (loading && (!profiles || profiles.length === 0)) {
    return <div className="p-6 text-center">Loading employees...</div>;
  }

  if (error && (!profiles || profiles.length === 0)) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="p-6 text-center">
        No employees found
        <button
          onClick={() => setShowAddUser(true)}
          className="mt-4 bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600 block mx-auto"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          Add Employee
        </button>
      </div>
    );
  }

  const handleDelete = (uid) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      dispatch(deleteProfile(uid));
    }
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const openScheduleDetails = (user) => {
    setSelectedUser(user);
    setShowScheduleDetails(true);
  };

  const closeUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const closeScheduleDetails = () => {
    setShowScheduleDetails(false);
    setSelectedUser(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
      {!preview && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Employee Management
          </h3>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <div className={`flex items-center transition-all duration-300 ${isSearchExpanded ? 'w-[600px]' : 'w-10'}`}>
                {isSearchExpanded && (
                  <>
                    <select
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                      className="h-10 px-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm"
                    >
                      <option value="displayName">Display Name</option>
                      <option value="designation">Designation</option>
                      <option value="email">Email</option>
                     
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Search..."
                        className="h-10 w-full px-3 py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onMouseDown={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <button
                  onClick={() => {
                    setIsSearchExpanded(!isSearchExpanded);
                    if (isSearchExpanded) {
                      setSearchTerm('');
                      setShowSuggestions(false);
                    }
                  }}
                  className={`h-10 w-10 flex items-center justify-center ${isSearchExpanded ? 'bg-orange-500 text-white rounded-r-md' : 'bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'}`}
                >
                  {isSearchExpanded ? <X size={18} /> : <Search size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAddUser(true)}
              className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Add Employee
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displayedProfiles.map((employee) => {
          const displayName = getDisplayName(employee);
          const firstLetter = displayName.charAt(0).toUpperCase();

          return (
            <div
              key={employee.uid || employee.email}
              className="border border-gray-200 rounded-md p-4 flex justify-between items-center"
            >
              {/* Profile picture + info */}
              <div className="flex items-center">
                {employee.profilepicurl ? (
                  <img
                    src={employee.profilepicurl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-500 text-white font-bold mr-3">
                    {firstLetter}
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900">{displayName}</h4>
                  <p className="text-sm text-gray-600">{employee.designation}</p>
                  <p className="text-sm text-gray-500">
                    {formatWorkSchedule(employee.work_schedules)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    employee.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {employee.status}
                </span>
                <button
                  onClick={() => openUserDetails(employee)}
                  className="text-blue-500 hover:text-blue-700 p-1"
                  title="View User Details"
                >
                  <UserIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => openScheduleDetails(employee)}
                  className="text-purple-500 hover:text-purple-700 p-1"
                  title="View Schedule Details"
                >
                  <Calendar className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(employee.uid)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete Employee"
                  disabled={loading}
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddUser && <AddUser onClose={() => setShowAddUser(false)} />}
      
      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <ViewUser
          user={selectedUser}
          onClose={closeUserDetails}
        />
      )}
      
      {/* Schedule Details Modal */}
      {showScheduleDetails && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Schedule Details - {selectedUser.firstname || selectedUser.username}
              </h2>
              <button
                onClick={closeScheduleDetails}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <WorkSchedule 
              schedules={selectedUser.work_schedules || []} 
              setSchedules={(newSchedules) => {
                setSelectedUser(prev => ({
                  ...prev,
                  work_schedules: newSchedules
                }));
              }}
              isEditing={true}
              employeeId={selectedUser.uid}
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded-lg">
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeComponent;