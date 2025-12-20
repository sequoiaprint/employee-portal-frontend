import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LateEmployeesModal = ({ isOpen, onClose, timeFilter, floorFilter }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [groupedEmployees, setGroupedEmployees] = useState({});
  const [expandedEmployees, setExpandedEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('desktop');

  // Check screen size and update view
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setCurrentView('mobile');
      } else if (window.innerWidth < 1024) {
        setCurrentView('tablet');
      } else {
        setCurrentView('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen, timeFilter, floorFilter]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(employee =>
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.division?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.machine?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
      groupEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
      groupEmployees(employees);
    }
  }, [searchTerm, employees]);

  const groupEmployees = (employeeList) => {
    const grouped = {};
    employeeList.forEach(employee => {
      if (!grouped[employee.employee_id]) {
        grouped[employee.employee_id] = {
          employee_id: employee.employee_id,
          name: employee.name,
          floor: employee.floor,
          division: employee.division,
          machine: employee.machine,
          records: [],
          totalLateDays: 0
        };
      }
      grouped[employee.employee_id].records.push(employee);
      grouped[employee.employee_id].totalLateDays = grouped[employee.employee_id].records.length;
    });
    setGroupedEmployees(grouped);
  };

  const toggleExpand = (employeeId) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://attendance.sequoia-print.com/api/dashboard/late?floor=${floorFilter}&timeFilter=${timeFilter}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch late employees data');
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setEmployees(result.data);
        setFilteredEmployees(result.data);
        groupEmployees(result.data);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err) {
      setError(err.message);
      setEmployees([]);
      setFilteredEmployees([]);
      setGroupedEmployees({});
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatRange = (range) => {
    if (!range) return "";
    const [start, end] = range.split("_to_");

    const format = (d) =>
      new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit" });

    return `${format(start)} to ${format(end)}`;
  };

  // Mobile card view
  const renderMobileCard = (employeeGroup) => {
    const isExpanded = expandedEmployees[employeeGroup.employee_id];
    
    return (
      <div key={employeeGroup.employee_id} className="bg-white border border-gray-200 rounded-lg p-2 mb-2 shadow-sm">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{employeeGroup.name}   <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 ml-1">
                  {employeeGroup.totalLateDays} day{employeeGroup.totalLateDays > 1 ? 's' : ''}
                </span></h3>
              </div>
              <button
                onClick={() => toggleExpand(employeeGroup.employee_id)}
                className="ml-1 p-1 bg-red-100 rounded-md"
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3 text-red-600" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-red-600" />
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-1 mt-1 text-xs">
              <div>
                <span className="text-gray-500">Division:</span>
                <p className="font-medium">{employeeGroup.division || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Machine:</span>
                <p className="font-medium">{employeeGroup.machine || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Floor:</span>
                <p className="font-medium">{employeeGroup.floor || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && employeeGroup.records.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="space-y-1">
              {employeeGroup.records.map((record, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-1 text-xs">
                  <div className="flex justify-between mb-0.5">
                    <span className="font-medium">{formatDate(record.attendance_date)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-0.5">
                    <div>
                      <span className="text-gray-500">In:</span> {formatTime(record.first_in_of_the_day_time)}
                    </div>
                    <div>
                      <span className="text-gray-500">Hours:</span> {record.total_effective_hours?.toFixed(1) || 0}h
                    </div>
                    <div>
                      <span className="text-gray-500">OT:</span> {record.total_effective_overtime_duration?.toFixed(1) || 0}h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Tablet card view
  const renderTabletCard = (employeeGroup) => {
    const isExpanded = expandedEmployees[employeeGroup.employee_id];
    
    return (
      <div key={employeeGroup.employee_id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{employeeGroup.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  {employeeGroup.totalLateDays} day{employeeGroup.totalLateDays > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => toggleExpand(employeeGroup.employee_id)}
                  className="p-1 bg-red-100 rounded-md"
                  aria-label={isExpanded ? "Collapse details" : "Expand details"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-red-600" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-red-600" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Division</span>
                <p className="font-medium">{employeeGroup.division || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Machine</span>
                <p className="font-medium">{employeeGroup.machine || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Floor</span>
                <p className="font-medium">{employeeGroup.floor || 'N/A'}</p>
              </div>
              <div>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  Late
                </span>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && employeeGroup.records.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Late Records</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">In/Out</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Hours</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">OT</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeGroup.records.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-2 py-1 text-xs text-gray-900">
                        {formatDate(record.attendance_date)}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-500">
                        <div>{formatTime(record.first_in_of_the_day_time)}</div>
                        <div>{formatTime(record.last_out_of_the_day_time)}</div>
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-500">
                        {record.total_effective_hours?.toFixed(1) || 0}h
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-500">
                        {record.total_effective_overtime_duration?.toFixed(1) || 0}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Desktop table view
  const renderDesktopTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Late Days</th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.values(groupedEmployees).map((employeeGroup) => {
            const isExpanded = expandedEmployees[employeeGroup.employee_id];
            
            return (
              <React.Fragment key={employeeGroup.employee_id}>
                <tr className={`${isExpanded ? 'bg-red-50' : ''} cursor-pointer`}>
                  <td className="px-2 lg:px-4 py-2 whitespace-nowrap">
                    <button
                      onClick={() => toggleExpand(employeeGroup.employee_id)}
                      className="text-xs p-1 bg-red-100 rounded-md"
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </td>
                  <td className="px-2 lg:px-4 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employeeGroup.name}</div>
                  </td>
                  <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                    {employeeGroup.division || 'N/A'}
                  </td>
                  <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                    {employeeGroup.machine || 'N/A'}
                  </td>
                  <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                    {employeeGroup.floor || 'N/A'}
                  </td>
                  <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employeeGroup.totalLateDays} days
                  </td>
                  <td className="px-2 lg:px-4 py-2 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Late
                    </span>
                  </td>
                </tr>
                
                {/* Expanded Details Row */}
                {isExpanded && (
                  <tr>
                    <td colSpan="7" className="px-2 lg:px-4 py-2 bg-red-50">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">First In</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Last Out</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">OT</th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Break</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {employeeGroup.records.map((record, index) => (
                              <tr key={record.attendance_id || index} className="hover:bg-gray-50">
                                <td className="px-2 py-1 text-xs text-gray-900">
                                  {formatDate(record.attendance_date)}
                                </td>
                                <td className="px-2 py-1 text-xs text-gray-500">
                                  {formatTime(record.shift_start)} - {formatTime(record.shift_end)}
                                </td>
                                <td className="px-2 py-1 text-xs text-gray-500">
                                  {record.first_in_of_the_day_time ? 
                                    formatTime(record.first_in_of_the_day_time) : 
                                    'N/A'}
                                </td>
                                <td className="px-2 py-1 text-xs text-gray-500">
                                  {record.last_out_of_the_day_time ? 
                                    formatTime(record.last_out_of_the_day_time) : 
                                    'N/A'}
                                </td>
                                <td className="px-2 py-1 text-xs text-gray-500">
                                  {record.total_effective_hours?.toFixed(1)}h
                                </td>
                                <td className="px-2 py-1 text-xs text-gray-500">
                                  {record.total_effective_overtime_duration?.toFixed(1)}h
                                </td>
                                <td className="px-2 py-1 text-xs text-gray-500">
                                  {record.total_break_duration?.toFixed(1)}h
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-3 sm:px-4 py-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Late Employees - {formatRange(timeFilter)}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 px-3 sm:px-4 py-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, division, or machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-2 sm:p-3 md:p-4">
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5">Loading late employees...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <div className="text-red-500">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-1 text-xs sm:text-sm">Error: {error}</p>
              </div>
            </div>
          ) : Object.keys(groupedEmployees).length === 0 ? (
            <div className="text-center py-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">No late employees found{searchTerm && ` for "${searchTerm}"`}.</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden">
                {currentView === 'mobile' && (
                  <div>
                    {Object.values(groupedEmployees).map((employeeGroup) => renderMobileCard(employeeGroup))}
                  </div>
                )}
              </div>

              {/* Tablet View */}
              <div className="hidden md:block lg:hidden">
                {currentView === 'tablet' && (
                  <div>
                    {Object.values(groupedEmployees).map((employeeGroup) => renderTabletCard(employeeGroup))}
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden lg:block">
                {renderDesktopTable()}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 sm:px-4 py-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-1.5">
            <div className="text-xs text-gray-500">
              <span>Showing {Object.keys(groupedEmployees).length} late employees</span>
              {searchTerm && (
                <span> for "<span className="font-medium">{searchTerm}</span>"</span>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="px-2.5 py-1 text-xs sm:text-sm bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LateEmployeesModal;