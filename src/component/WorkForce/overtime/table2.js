import React, { useState, useEffect } from 'react';
import {
    Clock,
    User,
    Users,
    AlertCircle,
    HardDrive,
    ChevronRight,
    Briefcase,
    Building,
    UserCheck,
    Search,
    ChevronDown,
    ChevronUp,
    Calendar
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AllOvertimeMachineTable = () => {
    const [employeesData, setEmployeesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    });
    const [endDate, setEndDate] = useState(new Date());
    const [floorFilter, setFloorFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedEmployee, setExpandedEmployee] = useState(null);
    const [attendanceDetails, setAttendanceDetails] = useState({});

    const validFloors = [
        "all",
        "Accounts",
        "Admin",
        "Admin Accounts",
        "CTP",
        "Data Entry",
        "Fabricator",
        "HR Admin",
        "Personal Accounts",
        "Post Press",
        "Pre Press",
        "Press, Post Press",
        "Proof Dept",
        "Silk Screen"
    ];

    // Calculate days duration
    const daysDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    useEffect(() => {
        const fetchEmployeesData = async () => {
            console.log('Fetching employees data with filters:', { startDate, endDate, floorFilter });
            try {
                setLoading(true);
                setExpandedEmployee(null);
                setAttendanceDetails({});

                // Format dates to YYYY-MM-DD
                const formatDate = (date) => {
                    return date.toISOString().split('T')[0];
                };

                const encodedFloor = encodeURIComponent(floorFilter);
                const encodedStartDate = encodeURIComponent(formatDate(startDate));
                const encodedEndDate = encodeURIComponent(formatDate(endDate));
                
                let url = `https://attendance.sequoia-print.com/employees/overtime/list?division=${encodedFloor}&timeFilter=Custom&startDate=${encodedStartDate}&endDate=${encodedEndDate}`;
                console.log('Fetching from URL:', url);

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch employees data: ${response.status}`);
                }

                const result = await response.json();
                console.log('Fetched employees data:', result);

                if (result.data && Array.isArray(result.data)) {
                    setEmployeesData(result.data);
                } else {
                    throw new Error('Invalid data format from API: missing data array');
                }

                setError(null);
            } catch (err) {
                setError(err.message);
                setEmployeesData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeesData();
    }, [startDate, endDate, floorFilter]);

    const formatDuration = (hours) => {
        if (hours === undefined || hours === null) return '0h 0m';
        const totalMinutes = Math.round(hours * 60);
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hrs}h ${mins}m`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        try {
            const time = new Date(timeString);
            return time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const fetchAttendanceDetails = async (employeeId, attendanceIds) => {
        if (!attendanceIds || attendanceIds.length === 0) {
            setAttendanceDetails(prev => ({ ...prev, [employeeId]: [] }));
            return;
        }

        try {
            const response = await fetch('https://attendance.sequoia-print.com/employees/attendance/by-ids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ attendanceIds })
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch attendance details: ${response.status}`);
            }

            const result = await response.json();
            console.log('Fetched attendance details for employee', employeeId, result);

            if (result.success && result.data && Array.isArray(result.data)) {
                setAttendanceDetails(prev => ({ ...prev, [employeeId]: result.data }));
            } else {
                throw new Error('Invalid attendance data format');
            }
        } catch (err) {
            console.error('Error fetching attendance details:', err);
            setAttendanceDetails(prev => ({ ...prev, [employeeId]: [] }));
        }
    };

    const toggleEmployeeExpansion = async (employee) => {
        const employeeId = employee.employee_id || employee.name;

        if (expandedEmployee === employeeId) {
            setExpandedEmployee(null);
        } else {
            setExpandedEmployee(employeeId);

            if (!attendanceDetails[employeeId] && employee.attendanceIds && employee.attendanceIds.length > 0) {
                await fetchAttendanceDetails(employeeId, employee.attendanceIds);
            }
        }
    };

    const calculateTotalOvertime = (employeeId) => {
        const details = attendanceDetails[employeeId];
        if (!details || !details.length) return 0;
        return details.reduce((sum, attendance) =>
            sum + (attendance.total_effective_overtime_duration || 0), 0
        );
    };

    const calculateTotalEffectiveHours = (employeeId) => {
        const details = attendanceDetails[employeeId];
        if (!details || !details.length) return 0;
        return details.reduce((sum, attendance) =>
            sum + (attendance.total_effective_hours || 0), 0
        );
    };

    const handleStartDateChange = (date) => {
        if (date > endDate) {
            // If selected start date is after end date, adjust both
            setStartDate(date);
            setEndDate(date);
        } else {
            setStartDate(date);
        }
    };

    const handleEndDateChange = (date) => {
        if (date < startDate) {
            // If selected end date is before start date, adjust both
            setEndDate(date);
            setStartDate(date);
        } else {
            setEndDate(date);
        }
    };

    const filteredEmployees = employeesData.filter(employee =>
        employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.jobtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const ExpandedRow = ({ employee }) => {
        const employeeId = employee.employee_id || employee.name;
        const details = attendanceDetails[employeeId] || [];

        return (
            <tr className="bg-green-50 border-t border-blue-100">
                <td colSpan="4" className="px-6 py-3">
                    <div className="space-y-4">
                        {/* Compact Summary Row */}
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 rounded-lg">
                                <Clock className="w-3.5 h-3.5 text-blue-700" />
                                <span className="font-medium text-blue-900">
                                    {formatDuration(calculateTotalEffectiveHours(employeeId))}
                                </span>
                                <span className="text-blue-700 ml-1">Effective Hours</span>
                            </div>

                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 rounded-lg">
                                <AlertCircle className="w-3.5 h-3.5 text-red-700" />
                                <span className="font-medium text-red-900">
                                    {formatDuration(calculateTotalOvertime(employeeId))}
                                </span>
                                <span className="text-red-700 ml-1">Overtime</span>
                            </div>
                        </div>

                        {/* Compact Attendance Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {details.length > 0 ? (
                                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                                                    Shift
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                                                    In/Out
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                                                    Gross Hours
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                                                    OT
                                                </th>
                                                <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {details.map((attendance) => (
                                                <tr key={attendance.attendance_id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">
                                                            {new Date(attendance.attendance_date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        <div className="text-gray-700">
                                                            {formatTime(attendance.shift_start)}-{formatTime(attendance.shift_end)}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        <div className="space-y-0.5">
                                                            <div className="text-gray-600">
                                                                {formatTime(attendance.first_in_of_the_day_time)}
                                                            </div>
                                                            <div className="text-gray-600">
                                                                {formatTime(attendance.last_out_of_the_day_time)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        <div className="font-medium text-blue-600">
                                                            {formatDuration(attendance.total_effective_hours)}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        <div className={`font-medium ${(attendance.total_effective_overtime_duration || 0) > 0
                                                            ? 'text-red-600'
                                                            : 'text-gray-500'
                                                            }`}>
                                                            {formatDuration(attendance.total_effective_overtime_duration)}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${attendance.is_offday === 1
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {attendance.is_offday === 1 ? 'Off' : 'Work'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="px-4 py-3 bg-gray-50">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">No attendance records found</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Employees Overtime</h2>
                            <p className="text-sm text-gray-500">Employees working on {floorFilter}</p>
                        </div>
                    </div>
                </div>

                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading employees data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Employees Overtime</h2>
                            <p className="text-sm text-gray-500">Employees working on {floorFilter}</p>
                        </div>
                    </div>
                </div>

                <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-600 font-medium">Error: {error}</p>
                        <p className="text-red-500 text-sm mt-2">Failed to load employees data</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Employees Overtime</h2>
                        <p className="text-sm text-gray-500">Employees working on {floorFilter}</p>
                    </div>
                </div>

                {employeesData.length > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            <Users className="w-4 h-4 inline mr-1" />
                            {employeesData.length} Employee{employeesData.length > 1 ? 's' : ''}
                        </div>
                    </div>
                )}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-row items-center justify-start  gap-4 mb-6">
                {/* Date Range Picker */}
                <div className="flex flex-col sm:flex-row items-center gap-4  rounded-lg  ">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-full sm:w-40">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <DatePicker
                                selected={startDate}
                                onChange={handleStartDateChange}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                maxDate={endDate}
                                dateFormat="MMM dd"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                            />
                        </div>

                        

                        <div className="w-full sm:w-40">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <DatePicker
                                selected={endDate}
                                onChange={handleEndDateChange}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                maxDate={new Date()}
                                dateFormat="MMM dd"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                            />
                        </div>

                        
                    </div>
                </div>

                {/* Search and Floor Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mt-5">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, ID or job title..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    {/* Floor Filter */}
                    <div className="w-full sm:w-48">
                        <select
                            value={floorFilter}
                            onChange={(e) => setFloorFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            {validFloors.map(floor => (
                                <option key={floor} value={floor}>{floor}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            {filteredEmployees.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md h-[500px] flex justify-center items-center mx-auto">
                        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold text-yellow-800 mb-2">No Matching Employees</h4>
                        <p className="text-yellow-600">
                            {searchQuery
                                ? `No employees found matching "${searchQuery}"`
                                : "No employees found for the selected filters."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <div className="h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Employee Details
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" />
                                            Job Title & Division
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <HardDrive className="w-4 h-4" />
                                            Machine & Floor
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="w-4 h-4" />
                                            Attendance Details
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEmployees.map((employee) => {
                                    const employeeId = employee.employee_id || employee.name;
                                    const isExpanded = expandedEmployee === employeeId;

                                    return (
                                        <React.Fragment key={employeeId}>
                                            <tr
                                                className={` cursor-pointer ${isExpanded ? 'bg-green-50' : 'bg-white'}`}
                                                onClick={() => toggleEmployeeExpansion(employee)}
                                            >
                                                <td className="px-6  whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <User className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>

                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6  whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">{employee.jobtitle || 'N/A'}</div>
                                                        <div className="text-gray-500">{employee.division || 'N/A'}</div>
                                                    </div>
                                                </td>

                                                <td className="px-6  whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">{employee.machine || 'N/A'}</div>
                                                        <div className="text-gray-500">{employee.floor || 'N/A'}</div>
                                                    </div>
                                                </td>

                                                <td className="px-6  ">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex flex-row items-center gap-2 rounded-lg  bg-green-100 text-green-800 border border-green-200">
                                                            <div className="px-3 py-1  text-sm font-medium">
                                                                <UserCheck className="w-4 h-4 inline mr-2" />
                                                                {employee.totalAttendance || 0} Days

                                                            </div>
                                                            <div>
                                                                {isExpanded ? (
                                                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                                                ) : (
                                                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                                                )}

                                                            </div>

                                                        </div>

                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && <ExpandedRow employee={employee} />}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Search results count */}
                    <div className="mt-3 text-sm text-gray-500 flex justify-between items-center">
                        <div>
                            Showing {filteredEmployees.length} of {employeesData.length} employees
                            {searchQuery && (
                                <span className="ml-2">
                                    for "<span className="font-medium">{searchQuery}</span>"
                                </span>
                            )}
                        </div>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllOvertimeMachineTable;