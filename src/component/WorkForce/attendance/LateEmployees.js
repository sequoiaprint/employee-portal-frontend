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

  // Mobile card view
  const renderMobileCard = () => (
    <div className="space-y-2">
      {lateEmployees.map((employee) => {
        const isExpanded = expandedEmployees[employee.employee_id];
        
        return (
          <div key={employee.employee_id} className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900">
                      {employee.name}
                      {employee.is_flagged && (
                        <span className="ml-1 px-1 py-0.5 text-[10px] bg-red-100 text-red-800 rounded-full">
                          {employee.flag_reason}
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-gray-500">{employee.machine}</p>
                  </div>
                  <button
                    onClick={() => toggleExpand(employee.employee_id)}
                    className="ml-1 p-0.5 bg-gray-200 rounded-md"
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-2.5 h-2.5" />
                    ) : (
                      <ChevronDown className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-1 mt-1 text-[10px]">
                  <div>
                    <span className="text-gray-500">Div:</span>
                    <p className="font-medium">{employee.division || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Late:</span>
                    <span className={`px-1 py-0.5 ml-1 text-[10px] rounded-full ${
                      employee.late_count >= 3 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.late_count}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Early:</span>
                    <span className={`px-1 py-0.5 ml-1 text-[10px] rounded-full ${
                      employee.early_count >= 3 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {employee.early_count}
                    </span>
                  </div>
                </div>
                
                
              </div>
            </div>

            {isExpanded && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                {/* Late Arrivals */}
                {employee.late_records.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-xs font-semibold text-gray-900 mb-1 flex items-center">
                      <span className="px-1 py-0.5 text-[10px] bg-red-100 text-red-800 rounded-full mr-1">
                        Late ({employee.late_records.length})
                      </span>
                    </h4>
                    <div className="space-y-1">
                      {employee.late_records.map((record, index) => (
                        <div key={index} className="bg-gray-50 rounded p-1 text-[10px]">
                          <div className="grid grid-cols-2 gap-0.5">
                            <span>{formatDateOnly(record.date)}</span>
                            <span className="text-red-600">{formatTimeOnly(record.first_in)}</span>
                          </div>
                        </div>
                      ))}
                      
                    </div>
                  </div>
                )}
                
                {/* Early Leaves */}
                {employee.early_records.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 mb-1 flex items-center">
                      <span className="px-1 py-0.5 text-[10px] bg-yellow-100 text-yellow-800 rounded-full mr-1">
                        Early ({employee.early_records.length})
                      </span>
                    </h4>
                    <div className="space-y-1">
                      {employee.early_records.map((record, index) => (
                        <div key={index} className="bg-gray-50 rounded p-1 text-[10px]">
                          <div className="grid grid-cols-2 gap-0.5">
                            <span>{formatDateOnly(record.date)}</span>
                            <span className="text-orange-600">{formatTimeOnly(record.last_out)}</span>
                          </div>
                        </div>
                      ))}
                     
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Tablet card view
  const renderTabletCard = () => (
    <div className="space-y-2">
      {lateEmployees.map((employee) => {
        const isExpanded = expandedEmployees[employee.employee_id];
        
        return (
          <div key={employee.employee_id} className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <h3 className="text-sm font-semibold text-gray-900 mr-2">{employee.name}</h3>
                    {employee.is_flagged && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-800 rounded-full">
                        {employee.flag_reason}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleExpand(employee.employee_id)}
                    className="p-0.5 bg-gray-200 rounded-md"
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-1 text-xs">
                  <div>
                    <span className="text-gray-500">Div</span>
                    <p className="font-medium">{employee.division || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Machine</span>
                    <p className="font-medium">{employee.machine || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-500">Late</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      employee.late_count >= 3 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.late_count}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-500">Early</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      employee.early_count >= 3 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {employee.early_count}
                    </span>
                  </div>
                </div>
                
                
              </div>
            </div>

            {isExpanded && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                  {/* Late Arrivals */}
                  <div className="bg-gray-50 rounded p-2">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded-full mr-1">
                        Late Arrivals ({employee.late_records.length})
                      </span>
                    </h4>
                    {employee.late_records.length > 0 ? (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {employee.late_records.map((record, index) => (
                          <div key={index} className="text-xs bg-white rounded p-1">
                            <div className="flex justify-between">
                              <span>{formatDateOnly(record.date)}</span>
                              <span className="text-red-600">{formatTimeOnly(record.first_in)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-2">No records</div>
                    )}
                  </div>
                  
                  {/* Early Leaves */}
                  <div className="bg-gray-50 rounded p-2">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full mr-1">
                        Early Leaves ({employee.early_records.length})
                      </span>
                    </h4>
                    {employee.early_records.length > 0 ? (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {employee.early_records.map((record, index) => (
                          <div key={index} className="text-xs bg-white rounded p-1">
                            <div className="flex justify-between">
                              <span>{formatDateOnly(record.date)}</span>
                              <span className="text-orange-600">{formatTimeOnly(record.last_out)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-2">No records</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Desktop table view (compact)
  const renderDesktopTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Division
            </th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Late
            </th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Early
            </th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lateEmployees.map((employee) => {
            const isExpanded = expandedEmployees[employee.employee_id];
            
            return (
              <React.Fragment key={employee.employee_id}>
                <tr 
                  className={`hover:bg-gray-50 ${employee.is_flagged ? 'bg-red-50 border-l-4 border-l-red-500' : ''} cursor-pointer`}
                >
                  <td className="px-2 py-1 whitespace-nowrap">
                    <button
                      onClick={() => toggleExpand(employee.employee_id)}
                      className="text-xs p-0.5 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {employee.name}
                          {employee.is_flagged && (
                            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-100 text-red-800 rounded-full">
                              {employee.flag_reason}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">{employee.machine}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-1 text-xs text-black">
                    {employee.division}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    {employee.late_count > 0 ? (
                      <span 
                        className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full cursor-help ${
                          employee.late_count >= 3 
                            ? 'bg-red-100 text-red-800 border border-red-300' 
                            : 'bg-red-100 text-red-800'
                        }`}
                        onMouseEnter={(e) => handleMouseEnter(e, 'late', employee.late_records)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {employee.late_count}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        0
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    {employee.early_count > 0 ? (
                      <span 
                        className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full cursor-help ${
                          employee.early_count >= 3 
                            ? 'bg-red-100 text-red-800 border border-red-300' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                        onMouseEnter={(e) => handleMouseEnter(e, 'early', employee.early_records)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {employee.early_count}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        0
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900">
                    {employee.total_occurrences}
                  </td>
                </tr>
                
                {/* Expanded Details Row */}
                {isExpanded && (
                  <tr>
                    <td colSpan="6" className="px-2 py-2 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Late Arrivals Section */}
                        <div className="bg-white border border-gray-200 rounded p-2">
                          <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                            <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded-full mr-1">
                              Late Arrivals
                            </span>
                            <span className="text-gray-600 text-xs">({employee.late_records.length})</span>
                          </h4>
                          {employee.late_records.length > 0 ? (
                            <div className="overflow-y-auto max-h-40">
                              <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-1 py-0.5 text-left font-medium text-gray-500">Date</th>
                                    <th className="px-1 py-0.5 text-left font-medium text-gray-500">First In</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                  {employee.late_records.map((record, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-1 py-0.5 whitespace-nowrap">
                                        {formatDateOnly(record.date)}
                                      </td>
                                      <td className="px-1 py-0.5 whitespace-nowrap">
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
                            <div className="text-center py-2 text-gray-400 text-xs">
                              No late arrival records
                            </div>
                          )}
                        </div>
                        
                        {/* Early Leave Section */}
                        <div className="bg-white border border-gray-200 rounded p-2">
                          <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                            <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full mr-1">
                              Early Leaves
                            </span>
                            <span className="text-gray-600 text-xs">({employee.early_records.length})</span>
                          </h4>
                          {employee.early_records.length > 0 ? (
                            <div className="overflow-y-auto max-h-40">
                              <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-1 py-0.5 text-left font-medium text-gray-500">Date</th>
                                    <th className="px-1 py-0.5 text-left font-medium text-gray-500">Last Out</th>
                                    <th className="px-1 py-0.5 text-left font-medium text-gray-500">Undertime</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                  {employee.early_records.map((record, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-1 py-0.5 whitespace-nowrap">
                                        {formatDateOnly(record.date)}
                                      </td>
                                      <td className="px-1 py-0.5 whitespace-nowrap">
                                        <span className="text-orange-600 font-medium">
                                          {formatTimeOnly(record.last_out)}
                                        </span>
                                      </td>
                                      <td className="px-1 py-0.5 whitespace-nowrap">
                                        {record.undertime > 0 ? (
                                          <span className="text-orange-600 text-xs">
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
                            <div className="text-center py-2 text-gray-400 text-xs">
                              No early leave records
                            </div>
                          )}
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-3 mt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Late & Early Employees</h3>
        <div className="text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-3 mt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Late & Early Employees</h3>
        <div className="text-center text-red-500 text-xs">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 mt-4 max-h-[500px] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Late & Early Employees</h3>
        {flaggedCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-800">
            {flaggedCount} Flagged
          </span>
        )}
      </div>
      
      {lateEmployees.length === 0 ? (
        <div className="text-center text-gray-500 text-xs py-4">
          <p>No late or early employees found.</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="md:hidden">
            {currentView === 'mobile' && renderMobileCard()}
          </div>

          {/* Tablet View */}
          <div className="hidden md:block lg:hidden">
            {currentView === 'tablet' && renderTabletCard()}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:block">
            {renderDesktopTable()}
          </div>
        </>
      )}
      
      {/* Tooltip Portal */}
      {activeTooltip && createPortal(
        <div 
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg max-w-xs"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-semibold mb-1">
            {activeTooltip.type === 'late' ? 'Late Arrivals' : 'Early Leaves'}
          </div>
          <div className="space-y-1">
            {activeTooltip.records.slice(0, 3).map((record, index) => (
              <div key={index} className="border-b border-gray-700 pb-1 last:border-0">
                <div className="font-medium">{formatDateOnly(record.date)}</div>
                <div className="text-gray-300">
                  {activeTooltip.type === 'late' 
                    ? `First in: ${formatTimeOnly(record.first_in)}`
                    : `Last out: ${formatTimeOnly(record.last_out)}`
                  }
                </div>
              </div>
            ))}
            {activeTooltip.records.length > 3 && (
              <div className="text-gray-400 text-center">
                +{activeTooltip.records.length - 3} more
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LateEmployees;