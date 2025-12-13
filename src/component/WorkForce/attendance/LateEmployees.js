import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { createPortal } from 'react-dom';

const LateEmployees = ({ timeFilter, floorFilter }) => {
  const [lateEmployees, setLateEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [expandedEmployees, setExpandedEmployees] = useState({});

  useEffect(() => {
    const fetchLateEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://attendance.sequoia-print.com/api/dashboard/late?floor=${floorFilter}&timeFilter=${timeFilter}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch late employees data');
        }
        
        const result = await response.json();
        
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error('Invalid data format from API');
        }
        
        const { employeeStats, flaggedEmployeesCount } = processEmployeeData(result.data);
        setLateEmployees(employeeStats);
        setFlaggedCount(flaggedEmployeesCount);
        setError(null);
      } catch (err) {
        setError(err.message);
        setLateEmployees([]);
        setFlaggedCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLateEmployees();
    const intervalId = setInterval(fetchLateEmployees, 600000);

    return () => {
      clearInterval(intervalId);
    };
  }, [timeFilter, floorFilter]);

  const processEmployeeData = (data) => {
    const employeeMap = new Map();
    let flaggedCount = 0;

    data.forEach(record => {
      const employeeId = record.employee_id;
      
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employee_id: employeeId,
          name: record.name,
          floor: record.floor,
          division: record.division,
          machine: record.machine,
          late_count: 0,
          early_count: 0,
          total_occurrences: 0,
          is_flagged: false,
          flag_reason: '',
          late_records: [],
          early_records: []
        });
      }

      const employee = employeeMap.get(employeeId);
      
      const isLate = record.leave_early === 0 && 
                    (record.total_undertime > 0 || 
                     new Date(record.first_in_of_the_day_time) > new Date(record.shift_start));
      
      if (isLate) {
        employee.late_count++;
        employee.late_records.push({
          date: record.attendance_date,
          shift_start: record.shift_start,
          first_in: record.first_in_of_the_day_time,
          undertime: record.total_undertime
        });
      }
      
      if (record.leave_early === 1) {
        employee.early_count++;
        employee.early_records.push({
          date: record.attendance_date,
          shift_end: record.shift_end,
          last_out: record.last_out_of_the_day_time,
          undertime: record.total_undertime
        });
      }
      
      employee.total_occurrences = employee.late_count + employee.early_count;
      
      const isLateFlagged = employee.late_count >= 3;
      const isEarlyFlagged = employee.early_count >= 3;
      employee.is_flagged = isLateFlagged || isEarlyFlagged;
      
      if (isLateFlagged && isEarlyFlagged) {
        employee.flag_reason = 'Late & Early';
      } else if (isLateFlagged) {
        employee.flag_reason = 'Late';
      } else if (isEarlyFlagged) {
        employee.flag_reason = 'Early Leave';
      }
    });

    const employeeStats = Array.from(employeeMap.values())
      .sort((a, b) => b.total_occurrences - a.total_occurrences);

    flaggedCount = employeeStats.filter(emp => emp.is_flagged).length;

    return {
      employeeStats,
      flaggedEmployeesCount: flaggedCount
    };
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not recorded';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeOnly = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleMouseEnter = (e, type, records) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setActiveTooltip({ type, records });
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  const toggleExpand = (employeeId) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

 

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Late & Early Employees</h3>
        <div className="text-center ">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Late & Early Employees</h3>
        <div className="text-center  text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 h-[500px] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Late & Early Employees</h3>
        {flaggedCount > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
             {flaggedCount} Employee{flaggedCount > 1 ? 's' : ''} Flagged
          </span>
        )}
      </div>
      
      {lateEmployees.length === 0 ? (
        <div className="text-center  text-gray-500">
          <p>No late or early employees found for the selected filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Division
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Late Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Early leave Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lateEmployees.map((employee) => (
                <React.Fragment key={employee.employee_id}>
                  <tr 
                    className={`hover:bg-gray-50 ${employee.is_flagged ? 'bg-red-50 border-l-4 border-l-red-500' : ''} cursor-pointer`}
                  >
                    <td className="px-6 whitespace-nowrap">
                      <button
                        onClick={() => toggleExpand(employee.employee_id)}
                        className="text-sm p-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        {expandedEmployees[employee.employee_id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {employee.name}
                            {employee.is_flagged && (
                              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full flex items-center">
                                 {employee.flag_reason}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{employee.machine}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6  whitespace-nowrap text-sm text-gray-500">
                      {employee.division}
                    </td>
                    <td className="px-6  whitespace-nowrap">
                      {employee.late_count > 0 ? (
                        <span 
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-help ${
                            employee.late_count >= 3 
                              ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                              : 'bg-red-100 text-red-800'
                          }`}
                          onMouseEnter={(e) => handleMouseEnter(e, 'late', employee.late_records)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {employee.late_count}
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-6  whitespace-nowrap">
                      {employee.early_count > 0 ? (
                        <span 
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-help ${
                            employee.early_count >= 3 
                              ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                          onMouseEnter={(e) => handleMouseEnter(e, 'early', employee.early_records)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {employee.early_count}
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.total_occurrences}
                    </td>
                  </tr>
                  
                  {/* Expanded Details Row */}
                  {expandedEmployees[employee.employee_id] && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Late Arrivals Section */}
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center">
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full mr-2">
                                Late Arrivals
                              </span>
                              <span className="text-gray-600">({employee.late_records.length} records)</span>
                            </h4>
                            {employee.late_records.length > 0 ? (
                              <div className="overflow-y-auto max-h-60">
                                <table className="min-w-full divide-y divide-gray-200 text-xs">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-2 py-1 text-left font-medium text-gray-500">Date</th>
                                      <th className="px-2 py-1 text-left font-medium text-gray-500">Shift Start</th>
                                      <th className="px-2 py-1 text-left font-medium text-gray-500">First In</th>
                                     
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-100">
                                    {employee.late_records.map((record, index) => (
                                      <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-2 py-1 whitespace-nowrap">
                                          {formatDateOnly(record.date)}
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap">
                                          {formatTimeOnly(record.shift_start)}
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap">
                                          <span className="text-red-600 font-medium">
                                            {formatTimeOnly(record.first_in)}
                                          </span>
                                        </td>
                                        
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-400">
                                No late arrival records
                              </div>
                            )}
                          </div>
                          
                          {/* Early Leave Section */}
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center">
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full mr-2">
                                Early Leaves
                              </span>
                              <span className="text-gray-600">({employee.early_records.length} records)</span>
                            </h4>
                            {employee.early_records.length > 0 ? (
                              <div className="overflow-y-auto max-h-60">
                                <table className="min-w-full divide-y divide-gray-200 text-xs">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-2 py-1 text-left font-medium text-gray-500">Date</th>
                                      <th className="px-2 py-1 text-left font-medium text-gray-500">Shift End</th>
                                      <th className="px-2 py-1 text-left font-medium text-gray-500">Last Out</th>
                                      <th className="px-2 py-1 text-left font-medium text-gray-500">Undertime</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-100">
                                    {employee.early_records.map((record, index) => (
                                      <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-2 py-1 whitespace-nowrap">
                                          {formatDateOnly(record.date)}
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap">
                                          {formatTimeOnly(record.shift_end)}
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap">
                                          <span className="text-orange-600 font-medium">
                                            {formatTimeOnly(record.last_out)}
                                          </span>
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap">
                                          {record.undertime > 0 ? (
                                            <span className="text-orange-600">
                                              {record.undertime}h
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">-</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-400">
                                No early leave records
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
     
      
    </div>
  );
};

export default LateEmployees;