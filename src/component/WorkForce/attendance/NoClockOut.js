import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  Clock, 
  Calendar, 
  ArrowRightLeft,
  Moon,
  Building2,
  Tag,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const NoClockOut = ({ timeFilter, floorFilter }) => {
  const [nightShiftEmployees, setNightShiftEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [expandedEmployees, setExpandedEmployees] = useState({});

  useEffect(() => {
    const fetchNightShiftEmployees = async () => {
      console.log('Fetching night shift employees with filters:', { timeFilter, floorFilter });
      try {
        setLoading(true);
        let url = `https://attendance.sequoia-print.com/api/night-shifts?timeFilter=${timeFilter}`;
        
        if (floorFilter && floorFilter !== 'all') {
          url += `&floor=${floorFilter}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch night shift employees data');
        }
        
        const result = await response.json();
        
        if (!Array.isArray(result.employees)) {
          throw new Error('Invalid data format from API');
        }
        
        setNightShiftEmployees(result.employees);
        setTotalCount(result.count || result.employees.length);
        setError(null);
      } catch (err) {
        setError(err.message);
        setNightShiftEmployees([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNightShiftEmployees();
    const intervalId = setInterval(fetchNightShiftEmployees, 600000);

    return () => {
      clearInterval(intervalId);
    };
  }, [timeFilter, floorFilter]);

  const calculateNightShifts = (employee) => {
    return employee.dayDuration ? employee.dayDuration.length : 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleMouseEnter = (e, employee) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setActiveTooltip(employee);
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
      <div className="bg-white rounded-lg shadow p-6 mt-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">🌙 Night Shift Employees</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading night shift data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6 h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">🌙 Night Shift Employees</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">Error: {error}</p>
            <p className="text-red-500 text-sm mt-2">Failed to load night shift data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6  mt-6 h-[500px] overflow-y-auto">
      <div className="flex items-center justify-between mb-4   bg-white pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Moon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Night Shift Employees(ground and 1st floor)</h3>
            <p className="text-sm text-gray-500">Employees who clocked after <strong>8 pm</strong></p>
          </div>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
              <Users className="w-4 h-4 inline mr-1" />
              {totalCount} Employee{totalCount > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
      
      {nightShiftEmployees.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-green-600 text-4xl mb-3">✓</div>
            <h4 className="text-lg font-semibold text-green-800 mb-2">All Good!</h4>
            <p className="text-green-600">No employees worked night shifts for the selected filters.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Employee
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Details
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Night Shifts
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nightShiftEmployees.map((employee) => {
                  const nightShiftsCount = calculateNightShifts(employee);
                  const isExpanded = expandedEmployees[employee.employee_id];
                  
                  return (
                    <React.Fragment key={employee.employee_id}>
                      <tr className={`${isExpanded ? 'bg-indigo-50':''}`}>
                        <td className="px-6  whitespace-nowrap">
                          <button
                            onClick={() => toggleExpand(employee.employee_id)}
                            className="text-sm p-1 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-indigo-600" />
                            )}
                          </button>
                        </td>
                        <td className="px-6  whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        </td>
                        <td className="px-6 ">
                          <div className="text-sm flex flex-row gap-4 text-gray-900">
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {employee.floor}
                            </div>
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {employee.division}
                            </div>
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              Machine: {employee.machine}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 ">
                          <div className="relative">
                            <div 
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 cursor-help hover:bg-indigo-200 transition-colors"
                              onMouseEnter={(e) => handleMouseEnter(e, employee)}
                              onMouseLeave={handleMouseLeave}
                            >
                              <Moon className="w-4 h-4 mr-1" />
                              {nightShiftsCount} shift{nightShiftsCount > 1 ? 's' : ''}
                             
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="4" className="px-0 py-0 bg-indigo-50 border-t-0">
                            <div className="px-6 py-4">
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                      <Moon className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900">Night Shift Details</h4>
                                      
                                    </div>
                                  </div>
                                 
                                </div>
                                
                                {employee.dayDuration && employee.dayDuration.length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Shift #</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Date</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Time Range</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Clock In</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Clock Out</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Duration</th>
                                          
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {employee.dayDuration.map((shift, index) => (
                                          <tr key={shift.attendance_id} className="hover:bg-gray-50">
                                            <td className="px-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                                              #{index + 1}
                                            </td>
                                            <td className="px-4 whitespace-nowrap text-sm text-gray-500 border-r">
                                              <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(shift.attendance_date)}
                                              </div>
                                            </td>
                                            <td className="px-4 whitespace-nowrap text-sm text-gray-500 border-r">
                                              <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(shift.shift_start)} - {formatTime(shift.shift_end)}
                                              </div>
                                            </td>
                                            <td className="px-4  whitespace-nowrap text-sm text-gray-500 border-r">
                                              <div className="flex items-center gap-1">
                                                <ArrowRightLeft className="w-3 h-3 text-green-500" />
                                                {formatTime(shift.firstIn)}
                                              </div>
                                            </td>
                                            <td className="px-4 whitespace-nowrap text-sm text-gray-500 border-r">
                                              <div className="flex items-center gap-1">
                                                <ArrowRightLeft className="w-3 h-3 text-red-500" />
                                                {shift.lastOut ? formatTime(shift.lastOut) : 'N/A'}
                                              </div>
                                            </td>
                                            <td className="px-4  whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                                              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                                                {shift.shift_duration} hrs
                                              </span>
                                            </td>
                                            
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-gray-400">
                                    No shift details available
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
        </div>
      )}

     
    </div>
  );
};

export default NoClockOut;