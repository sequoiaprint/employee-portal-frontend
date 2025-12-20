import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PresentEmployeesModal = ({ isOpen, onClose, timeFilter, floorFilter }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
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
      setExpandedRows({});
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
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://attendance.sequoia-print.com/api/dashboard/present?floor=${floorFilter}&timeFilter=${timeFilter}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch present employees data');
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const processedData = processEmployeeData(result.data);
        setEmployees(processedData);
        setFilteredEmployees(processedData);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err) {
      setError(err.message);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const processEmployeeData = (data) => {
    const employeeMap = new Map();

    const sortedData = [...data].sort((a, b) =>
      new Date(a.attendance_date) - new Date(b.attendance_date)
    );

    sortedData.forEach(record => {
      const employeeId = record.employee_id;

      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employee_id: employeeId,
          name: record.name,
          floor: record.floor,
          division: record.division,
          machine: record.machine,
          present_count: 0,
          offday_working_count: 0,
          records: []
        });
      }

      const employee = employeeMap.get(employeeId);
      employee.present_count++;

      if (record.is_offday === true || record.is_offday === 1) {
        employee.offday_working_count++;
      }

      employee.records.push(record);
    });

    return Array.from(employeeMap.values());
  };

  const toggleRowExpansion = (employeeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
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

  const showOffdayWorking = timeFilter && timeFilter.includes('week');

  // Mobile card view
  const renderMobileCard = (employee, index) => {
    const isExpanded = expandedRows[employee.employee_id];
    
    return (
      <div key={employee.employee_id || index} className="bg-white border border-gray-200 rounded-lg p-2 mb-1 shadow-sm">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{employee.name}</h3>
              </div>
              <button
                onClick={() => toggleRowExpansion(employee.employee_id)}
                className="ml-2 p-1 bg-green-100 rounded-md"
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-green-600" />
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
              <div>
                <span className="text-gray-500">Division:</span>
                <p className="font-medium">{employee.division || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Machine:</span>
                <p className="font-medium">{employee.machine || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Floor:</span>
                <p className="font-medium">{employee.floor || 'N/A'}</p>
              </div>
             
              {showOffdayWorking && employee.offday_working_count > 0 && (
                <div>
                  <span className="text-gray-500">Offday:</span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 ml-1">
                    {employee.offday_working_count} day{employee.offday_working_count > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {isExpanded && employee.records.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            
            <div className="space-y-2">
              {employee.records.map((record, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{formatDate(record.attendance_date)}</span>
                    
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <div>
                      <span className="text-gray-500">In:</span> {formatTime(record.first_in_of_the_day_time)}
                    </div>
                    <div>
                      <span className="text-gray-500">Out:</span> {formatTime(record.last_out_of_the_day_time)}
                    </div>
                    <div>
                      <span className="text-gray-500">Hours:</span> {record.total_effective_hours || 0}h
                    </div>
                    <div>
                      <span className="text-gray-500">OT:</span> {record.total_effective_overtime_duration || 0}h
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
  const renderTabletCard = (employee, index) => {
    const isExpanded = expandedRows[employee.employee_id];
    
    return (
      <div key={employee.employee_id || index} className="bg-white border border-gray-200 rounded-lg p-2 mb-1 shadow-sm">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{employee.name}</h3>
              
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  timeFilter.includes('week') ?
                  (employee.present_count >= 5 ? 'bg-green-100 text-green-800' :
                    employee.present_count >= 3 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800') :
                  'bg-green-100 text-green-800'
                }`}>
                  {timeFilter.includes('week') ? 
                    `${employee.present_count} day${employee.present_count > 1 ? 's' : ''}` : 
                    'Present'
                  }
                </span>
                <button
                  onClick={() => toggleRowExpansion(employee.employee_id)}
                  className="p-1 bg-green-100 rounded-md"
                  aria-label={isExpanded ? "Collapse details" : "Expand details"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-green-600" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-xs text-gray-500">Division</span>
                <p className="font-medium">{employee.division || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Machine</span>
                <p className="font-medium">{employee.machine || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Floor</span>
                <p className="font-medium">{employee.floor || 'N/A'}</p>
              </div>
              {showOffdayWorking && (
                <div>
                  <span className="text-xs text-gray-500">Offday Work</span>
                  {employee.offday_working_count > 0 ? (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {employee.offday_working_count} day{employee.offday_working_count > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <p className="text-gray-400 text-xs">-</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {isExpanded && employee.records.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Attendance Records</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">In/Out</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Hours</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">OT</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Offday</th>
                  </tr>
                </thead>
                <tbody>
                  {employee.records.map((record, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {formatDate(record.attendance_date)}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        <div>{formatTime(record.first_in_of_the_day_time)}</div>
                        <div>{formatTime(record.last_out_of_the_day_time)}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {record.total_effective_hours || 0}h
                        {record.total_undertime > 0 && (
                          <div className="text-red-500">-{record.total_undertime}h</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {record.total_effective_overtime_duration || 0}h
                      </td>
                      <td className="px-3 py-2">
                        {record.is_offday ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">No</span>
                        )}
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
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {timeFilter.includes('week') ? 'Present Days' : 'Status'}
            </th>
            {showOffdayWorking && (
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offday Working</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredEmployees.map((employee, index) => {
            const isExpanded = expandedRows[employee.employee_id];
            
            return (
              <React.Fragment key={employee.employee_id || index}>
                <tr className={`${isExpanded ? 'bg-green-50' : ''} hover:bg-gray-100 cursor-pointer`}>
                  <td className="px-2 whitespace-nowrap">
                    {employee.records.length > 0 && (
                      <button
                        onClick={() => toggleRowExpansion(employee.employee_id)}
                        className="p-1 bg-green-100 rounded-lg"
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-4 lg:px-6  whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.name} <span className='text-green-500 text-xs'>({employee.records.length} days)</span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6  whitespace-nowrap text-sm text-gray-500">{employee.division || 'N/A'}</td>
                  <td className="px-4 lg:px-6 whitespace-nowrap text-sm text-gray-500">{employee.machine || 'N/A'}</td>
                  <td className="px-4 lg:px-6 whitespace-nowrap text-sm text-gray-500">{employee.floor || 'N/A'}</td>
                  <td className="px-4 lg:px-6  whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${timeFilter.includes('week') ?
                        (employee.present_count >= 5 ? 'bg-green-100 text-green-800' :
                          employee.present_count >= 3 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800') :
                        'bg-green-100 text-green-800'
                      }`}>
                      {timeFilter.includes('week') ?
                        `${employee.present_count} day${employee.present_count > 1 ? 's' : ''}` :
                        'Present'
                      }
                    </span>
                  </td>
                  {showOffdayWorking && (
                    <td className="px-4 lg:px-6  whitespace-nowrap">
                      {employee.offday_working_count > 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                          {employee.offday_working_count} day{employee.offday_working_count > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  )}
                </tr>

                {isExpanded && employee.records.length > 0 && (
                  <tr className="bg-green-50">
                    <td colSpan={showOffdayWorking ? 8 : 7} className="px-4 lg:px-6 py-4">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">First In</th>
                                <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Out</th>
                                <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                                <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Effective Hours</th>
                                <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                                <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Break Duration</th>
                                <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Offday</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {employee.records.map((record, idx) => (
                                <tr key={record.attendance_id || idx} className="hover:bg-gray-50">
                                  <td className="px-3 lg:px-4  text-xs lg:text-sm text-gray-900">
                                    {formatDate(record.attendance_date)}
                                  </td>
                                  <td className="px-3 lg:px-4  text-xs lg:text-sm text-gray-500">
                                    {formatTime(record.first_in_of_the_day_time)}
                                  </td>
                                  <td className="px-3 lg:px-4  text-xs lg:text-sm text-gray-500">
                                    {formatTime(record.last_out_of_the_day_time)}
                                  </td>
                                  <td className="px-3 lg:px-4  text-xs lg:text-sm text-gray-500">
                                    {record.shift_start && record.shift_end ? (
                                      <>
                                        {formatTime(record.shift_start)} - {formatTime(record.shift_end)}
                                        <div className="text-xs text-gray-400">({record.shift_duration}h)</div>
                                      </>
                                    ) : 'N/A'}
                                  </td>
                                  <td className="px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-500">
                                    {record.total_effective_hours || 0}h
                                    {record.total_undertime > 0 && (
                                      <div className="text-xs text-red-500">Undertime: {record.total_undertime}h</div>
                                    )}
                                  </td>
                                  <td className="px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-500">
                                    {record.total_effective_overtime_duration || 0}h
                                  </td>
                                  <td className="px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-500">
                                    {record.total_break_duration || 0}h
                                  </td>
                                  <td className="px-3 lg:px-4 py-2">
                                    {record.is_offday ? (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                        Yes
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-xs">No</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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
        <div className="flex justify-between items-center border-b border-gray-200 px-4 sm:px-6 py-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Present Employees - {formatRange(timeFilter)}
            </h2>
          
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ID, division, or machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-sm sm:text-base text-gray-500 mt-2">Loading present employees...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500">
                <svg className="w-12 h-12 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm sm:text-base">Error: {error}</p>
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm sm:text-base text-gray-500">No present employees found{searchTerm && ` for "${searchTerm}"`}.</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden">
                {currentView === 'mobile' && (
                  <div>
                    {filteredEmployees.map((employee, index) => renderMobileCard(employee, index))}
                  </div>
                )}
              </div>

              {/* Tablet View */}
              <div className="hidden md:block lg:hidden">
                {currentView === 'tablet' && (
                  <div>
                    {filteredEmployees.map((employee, index) => renderTabletCard(employee, index))}
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
        <div className="border-t border-gray-200 px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-xs sm:text-sm text-gray-500">
              <span>Showing {filteredEmployees.length} of {employees.length} present employees</span>
              {searchTerm && (
                <span> for "<span className="font-medium">{searchTerm}</span>"</span>
              )}
              {showOffdayWorking && (
                <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                  • Offday working: {employees.reduce((sum, emp) => sum + (emp.offday_working_count || 0), 0)} days
                </span>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentEmployeesModal;