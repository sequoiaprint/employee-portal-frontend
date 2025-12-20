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

  // Mobile card view
  const renderMobileCard = (employee) => {
    const nightShiftsCount = calculateNightShifts(employee);
    const isExpanded = expandedEmployees[employee.employee_id];

    return (
      <div key={employee.employee_id} className="bg-white border border-gray-200 rounded-lg p-2 mb-2 shadow-sm">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{employee.name}</h3>
              </div>
              <button
                onClick={() => toggleExpand(employee.employee_id)}
                className="ml-1 p-1 bg-indigo-100 rounded-md"
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-indigo-600" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 mt-1 text-xs">
              <div>
                <span className="text-gray-500">Floor:</span>
                <p className="font-medium">{employee.floor || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Division:</span>
                <p className="font-medium">{employee.division || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Machine:</span>
                <p className="font-medium">{employee.machine || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-2">
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                <Moon className="w-3 h-3 mr-1" />
                {nightShiftsCount} shift{nightShiftsCount > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {isExpanded && employee.dayDuration && employee.dayDuration.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">Shift Details</h4>
            <div className="space-y-1">
              {employee.dayDuration.map((shift, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-1 text-xs">
                  <div className="flex justify-between mb-0.5">
                    <span className="font-medium">{formatDate(shift.attendance_date)}</span>
                    <span className="px-1 py-0 bg-indigo-50 text-indigo-700 rounded text-xs">
                      {shift.shift_duration} hrs
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-0.5">
                    <div>
                      <span className="text-gray-500">In:</span> {formatTime(shift.firstIn)}
                    </div>
                    <div>
                      <span className="text-gray-500">Out:</span> {shift.lastOut ? formatTime(shift.lastOut) : 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-500">Shift:</span> {formatTime(shift.shift_start)} - {formatTime(shift.shift_end)}
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
  const renderTabletCard = (employee) => {
    const nightShiftsCount = calculateNightShifts(employee);
    const isExpanded = expandedEmployees[employee.employee_id];

    return (
      <div key={employee.employee_id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{employee.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <Moon className="w-3 h-3 mr-1" />
                  {nightShiftsCount} shift{nightShiftsCount > 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => toggleExpand(employee.employee_id)}
                  className="p-1 bg-indigo-100 rounded-md"
                  aria-label={isExpanded ? "Collapse details" : "Expand details"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-indigo-600" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-indigo-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Floor</span>
                <p className="font-medium">{employee.floor || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Division</span>
                <p className="font-medium">{employee.division || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Machine</span>
                <p className="font-medium">{employee.machine || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && employee.dayDuration && employee.dayDuration.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Shift Details</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Shift</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">In</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Out</th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {employee.dayDuration.map((shift, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-2 py-1 text-xs text-gray-900">
                        {formatDate(shift.attendance_date)}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-500">
                        {formatTime(shift.shift_start)} - {formatTime(shift.shift_end)}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3 text-green-500" />
                          {formatTime(shift.firstIn)}
                        </div>
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3 text-red-500" />
                          {shift.lastOut ? formatTime(shift.lastOut) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-2 py-1 text-xs font-medium text-gray-900">
                        <span className="px-1 py-0 bg-indigo-50 text-indigo-700 rounded text-xs">
                          {shift.shift_duration} hrs
                        </span>
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
      <div className="min-w-full inline-block align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="2xl:px-6 px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider"></th>
              <th className="2xl:px-6 px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 2xl:w-4 2xl:h-4" />
                  Employee
                </div>
              </th>
              <th className="2xl:px-6 px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3 h-3 2xl:w-4 2xl:h-4" />
                  Details
                </div>
              </th>
              <th className="2xl:px-6 px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 2xl:w-4 2xl:h-4" />
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
                  <tr className={`${isExpanded ? 'bg-indigo-50' : ''}`}>
                    <td className="2xl:px-6 px-2 2xl:whitespace-nowrap">
                      <button
                        onClick={() => toggleExpand(employee.employee_id)}
                        className="text-[10px] p-1 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 2xl:w-4 2xl:h-4 text-indigo-600" />
                        ) : (
                          <ChevronDown className="w-3 h-3 2xl:w-4 2xl:h-4 text-indigo-600" />
                        )}
                      </button>
                    </td>
                    <td className="2xl:px-6 px-2 2xl:whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="2xl:px-6 px-2">
                      <div className="2xl:text-xs text-[12px] flex flex-row gap-1 2xl:gap-4 text-gray-900">
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
                          {employee.machine}
                        </div>
                      </div>
                    </td>
                    <td className="2xl:px-6 px-2">
                      <div className="relative">
                        <div
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 cursor-help hover:bg-indigo-200 transition-colors"
                          onMouseEnter={(e) => handleMouseEnter(e, employee)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <Moon className="w-3 h-3 2xl:w-4 2xl:h-4 mr-1" />
                          {nightShiftsCount} shift{nightShiftsCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan="4" className="px-0 py-0 bg-indigo-50 border-t-0">
                        <div className="2xl:px-6 px-2 py-1">
                          <div className="bg-white border border-gray-200 rounded-lg p-2">
                            {employee.dayDuration && employee.dayDuration.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="2xl:px-4 px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider border-r">Date</th>
                                      <th className="2xl:px-4 px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider border-r">Time Range</th>
                                      <th className="2xl:px-4 px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider border-r">Clock In</th>
                                      <th className="2xl:px-4 px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider border-r">Clock Out</th>
                                      <th className="2xl:px-4 px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider border-r">Duration</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {employee.dayDuration.map((shift, index) => (
                                      <tr key={shift.attendance_id} className="hover:bg-gray-50">
                                        <td className="2xl:px-4 px-2 whitespace-nowrap text-[10px] 2xl:text-sm text-black border-r">
                                          <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(shift.attendance_date)}
                                          </div>
                                        </td>
                                        <td className="2xl:px-4 px-2 whitespace-nowrap text-[10px] 2xl:text-sm text-black border-r">
                                          <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(shift.shift_start)} - {formatTime(shift.shift_end)}
                                          </div>
                                        </td>
                                        <td className="2xl:px-4 px-2 whitespace-nowrap text-[10px] 2xl:text-sm text-black border-r">
                                          <div className="flex items-center gap-1">
                                            <ArrowRightLeft className="w-3 h-3 text-green-500" />
                                            {formatTime(shift.firstIn)}
                                          </div>
                                        </td>
                                        <td className="2xl:px-4 px-2 whitespace-nowrap text-[10px] 2xl:text-sm text-black border-r">
                                          <div className="flex items-center gap-1">
                                            <ArrowRightLeft className="w-3 h-3 text-red-500" />
                                            {shift.lastOut ? formatTime(shift.lastOut) : 'N/A'}
                                          </div>
                                        </td>
                                        <td className="2xl:px-4 px-2 whitespace-nowrap text-[10px] 2xl:text-sm font-medium text-gray-900 border-r">
                                          <span className="px-1 py-0 bg-indigo-50 text-indigo-700 rounded text-xs">
                                            {shift.shift_duration} hrs
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-400">
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
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mt-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-600" />
            <h3 className="2x:text-lg text-md font-semibold text-gray-900">🌙 Night Shift Employees</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-black mt-4">Loading night shift data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mt-6 h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">🌙 Night Shift Employees</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-600 font-medium">Error: {error}</p>
            <p className="text-red-500 text-[10px] 2xl:text-sm mt-2">Failed to load night shift data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4 max-h-[500px] overflow-y-auto">
      <div className="flex items-center justify-between mb-2 bg-white ">
        <div className="flex items-center gap-2">
          {currentView != 'mobile' && (
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Moon className="w-5 h-5 text-indigo-600" />
            </div>
          )}

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Night Shift Employees(ground and 1st floor)</h3>
            <p className="text-[12px] 2xl:text-sm text-black">Employees who clocked after <strong>8 pm</strong></p>
          </div>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2">

            <div className="px-2 py-0.5 flex flex-row gap-1 rounded-full text-[10px] 2xl:text-[10px] font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
              <Users className="w-3 h-3 2xl:w-4 2xl:h-4 inline mr-1" />
              {totalCount} 
              <span>
                {currentView != 'mobile' && (
                  <>
                    Employee{totalCount > 1 ? 's' : ''}
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {nightShiftEmployees.length === 0 ? (
        <div className="text-center py-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-green-600 text-4xl mb-3">✓</div>
            <h4 className="text-lg font-semibold text-green-800 mb-2">All Good!</h4>
            <p className="text-green-600">No employees worked night shifts for the selected filters.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="md:hidden">
            {currentView === 'mobile' && (
              <div>
                {nightShiftEmployees.map((employee) => renderMobileCard(employee))}
              </div>
            )}
          </div>

          {/* Tablet View */}
          <div className="hidden md:block lg:hidden">
            {currentView === 'tablet' && (
              <div>
                {nightShiftEmployees.map((employee) => renderTabletCard(employee))}
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
  );
};

export default NoClockOut;