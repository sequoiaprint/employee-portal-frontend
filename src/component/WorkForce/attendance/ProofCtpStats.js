import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, User, Building, Printer, ChevronDown, ChevronUp } from 'lucide-react';

const AttendanceDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentView, setCurrentView] = useState('desktop');
    const [expandedSections, setExpandedSections] = useState({});

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
        fetchAttendanceData();
    }, []);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://attendance.sequoia-print.com/api/dashboard/proof-ctp-stats');
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            console.log('API Response:', result); // Debug log
            setData(result);
        } catch (err) {
            console.error('Fetch error:', err); // Debug log
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const [day, month, year] = dateStr.split("-");
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const monthName = months[parseInt(month) - 1];
        return `${monthName}-${day}`;
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Mobile card view for employee
    const renderMobileEmployeeCard = (employee, dataType) => {
        const dates = dataType === "absent" 
            ? employee.absent_dates 
            : employee.no_clock_out_dates;
        
        return (
            <div key={employee.employee_id} className="bg-white border border-gray-200 rounded-lg p-2 mb-2 shadow-sm">
                <div className="flex items-start justify-between mb-1">
                    <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900">{employee.name || 'Unknown'}</h4>
                            <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                                <div>
                                    <span className="text-gray-500">Floor:</span>
                                    <p className="font-medium">{employee.floor || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Machine:</span>
                                    <p className="font-medium">{employee.machine || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {dates && dates.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-0.5">
                            {dataType === "absent" ? "Absent Dates:" : "No Clock-Out Dates:"}
                        </p>
                        <div className="flex flex-wrap gap-0.5">
                            {dates.map((date, idx) => (
                                <span key={idx} className="px-1 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                    {formatDate(date)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Tablet card view
    const renderTabletEmployeeCard = (employee, dataType) => {
        const dates = dataType === "absent" 
            ? employee.absent_dates 
            : employee.no_clock_out_dates;
        
        return (
            <div key={employee.employee_id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900">{employee.name || 'Unknown'}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                                <span className="text-gray-500">Floor: <span className="font-medium">{employee.floor || 'N/A'}</span></span>
                                <span className="text-gray-500">Machine: <span className="font-medium">{employee.machine || 'N/A'}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {dates && dates.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                            {dataType === "absent" ? "Absent Dates" : "No Clock-Out Dates"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {dates.map((date, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                    {formatDate(date)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Desktop table section (original format preserved)
    const renderDesktopTable = ({ employees, dataType, title }) => {
        if (!employees || employees.length === 0) {
            return null;
        }

        return (
            <div className="mt-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">{title}</h3>
                <div className="bg-white rounded-lg shadow overflow-y-auto h-[200px]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="2xl:px-6 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="2xl:px-6 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                                    <th scope="col" className="2xl:px-6 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                                    <th scope="col" className="2xl:px-6 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates List</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map((employee, index) => (
                                    <tr key={employee.employee_id || index} className="hover:bg-gray-50">
                                        <td className="2xl:px-6 px-2 2xl:whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{employee.name || 'Unknown'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="2xl:px-6 px-2 2xl:whitespace-nowrap text-sm text-gray-500">{employee.floor || 'N/A'}</td>
                                        <td className="2xl:px-6 px-2 2xl:whitespace-nowrap text-sm text-gray-500">{employee.machine || 'N/A'}</td>
                                        <td className="2xl:px-6 px-2 text-sm text-gray-500">
                                            <div className="flex flex-wrap gap-1">
                                                {(
                                                    dataType === "absent"
                                                        ? employee.absent_dates
                                                        : employee.no_clock_out_dates
                                                )
                                                    ?.map((d) => `${formatDate(d)}`)
                                                    .join(", ")}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // Mobile department card
    const renderMobileDepartmentCard = (department, deptName, color, icon) => {
        const sectionId = `${deptName}-absent`;
        const sectionId2 = `${deptName}-no-clock-out`;
        const isAbsentExpanded = expandedSections[sectionId];
        const isNoClockOutExpanded = expandedSections[sectionId2];
        
        const absentEmployees = department.absent_employees || [];
        const noClockOutEmployees = department.no_clock_out_employees || [];

        return (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
                <div className={`${color} px-4 py-3`}>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {icon}
                        {deptName === 'Proof' ? 'Proof Department' : 'CTP Department'}
                        <span className="text-sm font-normal">({formatDate(start)} to {formatDate(end)})</span>
                    </h2>
                </div>

                <div className="p-3">
                    {/* Absent Section */}
                    {absentEmployees.length > 0 && (
                        <div className="mb-3">
                            <button
                                onClick={() => toggleSection(sectionId)}
                                className="flex items-center justify-between w-full text-left mb-1"
                            >
                                <h3 className="text-base font-semibold text-gray-700">
                                    Absent Employees ({absentEmployees.length})
                                </h3>
                                {isAbsentExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                            
                            {isAbsentExpanded && (
                                <div className={`mt-1 ${deptName === 'Proof' ? 'h-[300px]' : 'h-[150px]'} overflow-y-auto`}>
                                    {absentEmployees.map(employee => 
                                        renderMobileEmployeeCard(employee, "absent")
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* No Clock-Out Section */}
                    {noClockOutEmployees.length > 0 && (
                        <div>
                            <button
                                onClick={() => toggleSection(sectionId2)}
                                className="flex items-center justify-between w-full text-left mb-1"
                            >
                                <h3 className="text-base font-semibold text-gray-700">
                                    No Clock-Out Employees ({noClockOutEmployees.length})
                                </h3>
                                {isNoClockOutExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                            
                            {isNoClockOutExpanded && (
                                <div className="mt-1 h-[150px] overflow-y-auto">
                                    {noClockOutEmployees.map(employee => 
                                        renderMobileEmployeeCard(employee, "no_clock_out")
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Tablet department card
    const renderTabletDepartmentCard = (department, deptName, color, icon) => {
        const absentEmployees = department.absent_employees || [];
        const noClockOutEmployees = department.no_clock_out_employees || [];

        return (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden  mb-4">
                <div className={`${color} px-4 py-3`}>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        {icon}
                        {deptName === 'Proof' ? 'Proof Department' : 'CTP Department'}
                        <span className="text-sm font-normal">({formatDate(start)} to {formatDate(end)})</span>
                    </h2>
                </div>

                <div className="p-4">
                    {/* Absent Section */}
                    {absentEmployees.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-gray-700 mb-2">
                                Absent Employees ({absentEmployees.length})
                            </h3>
                            <div className={`grid grid-cols-1 gap-2 ${deptName === 'Proof' ? 'h-[300px]' : 'h-[150px]'} overflow-y-auto`}>
                                {absentEmployees.map(employee => 
                                    renderTabletEmployeeCard(employee, "absent")
                                )}
                            </div>
                        </div>
                    )}

                    {/* No Clock-Out Section */}
                    {noClockOutEmployees.length > 0 && (
                        <div>
                            <h3 className="text-base font-semibold text-gray-700 mb-2">
                                No Clock-Out Employees ({noClockOutEmployees.length})
                            </h3>
                            <div className="grid grid-cols-1 gap-2 h-[150px] overflow-y-auto">
                                {noClockOutEmployees.map(employee => 
                                    renderTabletEmployeeCard(employee, "no_clock_out")
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading attendance data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-4 bg-gradient-to-br from-[#04b6b0] via-[#03726e] to-[#016461] rounded-lg">
                    <p className="text-white text-lg font-semibold">Error: {error}</p>
                    <button
                        onClick={fetchAttendanceData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data || !data.data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-600 text-lg font-semibold">No data available</p>
                    <button
                        onClick={fetchAttendanceData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    const proofDept = data.data['Proof Dept'] || data.data.Proof_Dept;
    const ctpDept = data.data.CTP;

    if (!proofDept || !ctpDept) {
        console.error('Missing department data:', { proofDept, ctpDept, data });
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-4 bg-gradient-to-br from-[#04b6b0] via-[#03726e] to-[#016461] rounded-lg">
                    <p className="text-white text-lg font-semibold">Invalid data structure received from server</p>
                    <button
                        onClick={fetchAttendanceData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { start, end, days_analyzed } = data.date_range || { start: 'N/A', end: 'N/A', days_analyzed: 'N/A' };

    return (
        <div className="bg-gray-50 p-4">
            {/* Mobile View */}
            <div className="md:hidden">
                {currentView === 'mobile' && (
                    <div>
                        {renderMobileDepartmentCard(proofDept, 'Proof', 'bg-blue-600', <Printer className="w-4 h-4" />)}
                        {renderMobileDepartmentCard(ctpDept, 'CTP', 'bg-green-600', <Printer className="w-4 h-4" />)}
                    </div>
                )}
            </div>

            {/* Tablet View */}
            <div className="hidden md:block lg:hidden">
                {currentView === 'tablet' && (
                    <div>
                        {renderTabletDepartmentCard(proofDept, 'Proof', 'bg-blue-600', <Printer className="w-4 h-4" />)}
                        {renderTabletDepartmentCard(ctpDept, 'CTP', 'bg-green-600', <Printer className="w-4 h-4" />)}
                    </div>
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Proof Department Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-blue-600 2xl:px-6 px-2 py-3">
                            <h2 className="text-xl md:text-2xl  font-bold text-white flex items-center gap-2">
                                <Printer className="w-5 h-5" />
                                Proof Department  (<span>{formatDate(start)} to {formatDate(end)}</span>)
                            </h2>
                        </div>

                        <div className="p-4">
                            {renderDesktopTable({
                                employees: proofDept.absent_employees || [],
                                dataType: "absent",
                                title: "Proof Department - Absent Employees"
                            })}

                            {renderDesktopTable({
                                employees: proofDept.no_clock_out_employees || [],
                                dataType: "no_clock_out",
                                title: "Proof Department - No Clock-Out Employees"
                            })}
                        </div>
                    </div>

                    {/* CTP Department Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-green-600 2xl:px-6 px-2 py-3">
                            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                <Printer className="w-5 h-5" />
                                CTP Department  (<span>{formatDate(start)} to {formatDate(end)}</span>)
                            </h2>
                        </div>

                        <div className="p-4">
                            {renderDesktopTable({
                                employees: ctpDept.absent_employees || [],
                                dataType: "absent",
                                title: "CTP Department - Absent Employees"
                            })}

                            {renderDesktopTable({
                                employees: ctpDept.no_clock_out_employees || [],
                                dataType: "no_clock_out",
                                title: "CTP Department - No Clock-Out Employees"
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceDashboard;